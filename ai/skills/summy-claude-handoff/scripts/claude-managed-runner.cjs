'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { StringDecoder } = require('node:string_decoder');
const { createStore, readJsonFile, writeJsonAtomic, UUID, RUN_NAME, nowIso } = require('./dialog-store.cjs');
const { readProcesses } = require('./dialog-processes.cjs');

const MODELS = new Set(['opus']);
const EFFORTS = new Set(['high']);
const envMs = (name, fallback) => Number(process.env[name]) > 0 ? Number(process.env[name]) : fallback;
const CLOSE_AFTER_IDLE_MS = envMs('SUMMY_DIALOG_IDLE_CLOSE_MS', 20000);
const ACK_IDLE_TIMEOUT_MS = envMs('SUMMY_DIALOG_ACK_IDLE_MS', 60000);
const POLL_MS = 500;
const ANSWER_LIMIT = 6000;
const ACTIVE_TYPES = new Set(['assistant', 'user']);

function parseArgs(argv) {
  const allowed = new Set(['--root', '--run', '--resume', '--session-id', '--prompt-file', '--task', '--claude', '--cwd',
    '--model', '--effort', '--no-tools']);
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!allowed.has(key)) throw new Error('Неизвестный параметр ' + key);
    if (key === '--no-tools') { options.noTools = true; continue; }
    const value = argv[++i];
    if (typeof value !== 'string') throw new Error('Нет значения ' + key);
    options[key.slice(2)] = value;
  }
  for (const key of ['root', 'run', 'claude', 'cwd']) if (!options[key]) throw new Error('Нужен --' + key);
  if (!RUN_NAME.test(options.run)) throw new Error('Недопустимое имя запуска');
  if (!!options.resume === !!options['session-id']) throw new Error('Нужен ровно один из --resume и --session-id');
  const sessionId = (options.resume || options['session-id']).toLowerCase();
  if (!UUID.test(sessionId)) throw new Error('Недопустимый id сессии');
  options.model = options.model || 'opus';
  options.effort = options.effort || 'high';
  if (!MODELS.has(options.model) || !EFFORTS.has(options.effort)) throw new Error('Разрешены только opus и effort high');
  for (const key of ['root', 'claude', 'cwd']) if (!path.isAbsolute(options[key])) throw new Error('--' + key + ' должен быть абсолютным');
  if (!fs.existsSync(options.cwd)) throw new Error('Каталог --cwd не существует');
  const temp = path.join(path.resolve(options.root), '.tmp');
  if (options['prompt-file']) {
    const prompt = path.resolve(options['prompt-file']);
    if (!prompt.startsWith(temp + path.sep) || !/\.(txt|md)$/i.test(prompt)) throw new Error('Поручение должно лежать в .tmp');
    options.promptFile = prompt;
  }
  return { ...options, sessionId, temp, resumed: !!options.resume };
}

function cliArgs(options) {
  const args = ['--model', options.model, '--effort', options.effort, '--strict-mcp-config', '-p',
    '--permission-mode', 'auto', '--input-format', 'stream-json', '--output-format', 'stream-json',
    '--verbose', '--replay-user-messages'];
  if (options.noTools) args.push('--tools', '');
  args.push(options.resumed ? '--resume' : '--session-id', options.sessionId);
  return args;
}

function userLine(text, uuid, sessionId) {
  return JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'text', text }] },
    parent_tool_use_id: null, session_id: sessionId, uuid }) + '\n';
}

function textOf(event) {
  const content = event && event.message && event.message.content;
  if (typeof content === 'string') return content;
  return Array.isArray(content) ? content.filter(x => x && x.type === 'text' && typeof x.text === 'string').map(x => x.text).join('\n') : '';
}

function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const store = createStore(options.root);
  const runLog = path.join(options.temp, options.run + '.jsonl');
  const stderrFile = path.join(options.temp, options.run + '.stderr.log');
  const launchFile = path.join(options.temp, options.run + '.launch.json');
  const resultFile = path.join(options.temp, options.run + '.runner-result.json');
  const statusFile = path.join(options.temp, options.run + '.status.json');
  if (fs.existsSync(runLog) || fs.existsSync(launchFile)) throw new Error('Запуск с таким именем уже существует');

  store.withMutex(options.sessionId, () => {
    const owner = store.readOwner(options.sessionId);
    if (owner && owner.runName !== options.run && isAlive(Number(owner.runnerPid))) throw new Error('Сессией уже владеет другой управляемый запуск');
    store.writeOwner(options.sessionId, { runName: options.run, runnerPid: process.pid, startedAt: nowIso(), accepting: false });
  });

  function releaseStarting(reason) {
    store.withMutex(options.sessionId, () => {
      for (const message of store.listMessages(options.sessionId)) {
        if (message.runName === options.run && (message.state === 'starting' || message.state === 'sending')) {
          store.updateMessage(options.sessionId, message, 'waiting', { runName: '', waitingReason: reason });
        }
      }
      store.removeOwner(options.sessionId, options.run);
    });
  }

  let processes;
  try { processes = await readProcesses(); } catch (error) {
    releaseStarting('Список процессов не прочитан перед запуском — повторим позже');
    throw new Error('Список процессов не прочитан: ' + String(error.message).slice(0, 120));
  }
  const competing = processes.filter(row => /^claude(\.exe)?$/.test(row.name) && (!row.cmd || row.cmd.toLowerCase().includes(options.sessionId)));
  if (competing.length) {
    releaseStarting('Процесс CLI этой сессии ещё работает — продолжение подождёт');
    throw new Error('Сессию уже использует процесс CLI');
  }

  const launch = { runName: options.run, task: String(options.task || '').slice(0, 200), sessionId: options.sessionId,
    managed: true, resumedSession: options.resumed, runnerPid: process.pid, launchedAt: nowIso(), runLog,
    stderrFile, promptFile: options.promptFile || '', statusFile: fs.existsSync(statusFile) ? statusFile : '',
    runnerResult: resultFile, requestedModel: options.model, requestedEffort: options.effort,
    requestedPermissionMode: 'auto', strictMcpConfig: true, inputFormat: 'stream-json', replayUserMessages: true,
    noTools: !!options.noTools };
  writeJsonAtomic(launchFile, launch);

  const out = fs.openSync(runLog, 'wx', 0o600);
  const err = fs.openSync(stderrFile, 'a', 0o600);
  const script = /\.c?js$/i.test(options.claude);
  const child = spawn(script ? process.execPath : options.claude, script ? [options.claude, ...cliArgs(options)] : cliArgs(options),
    { cwd: options.cwd, stdio: ['pipe', 'pipe', err], windowsHide: true, shell: false });
  launch.cliPid = child.pid;
  writeJsonAtomic(launchFile, launch);
  store.withMutex(options.sessionId, () => {
    const owner = store.readOwner(options.sessionId);
    if (owner && owner.runName === options.run) store.writeOwner(options.sessionId, { ...owner, cliPid: child.pid, accepting: true });
  });

  const sent = new Map();
  let echoesSinceResult = [];
  let stdinOpen = true;
  let lastActivityAt = Date.now();
  let resultsSeen = 0;
  let lastWasResult = false;
  let pending = '';
  let finished = false;
  let claiming = false;
  const decoder = new StringDecoder('utf8');
  const retries = [];

  function update(id, state, fields) {
    const apply = () => store.withMutex(options.sessionId, () => {
      const message = store.readMessage(options.sessionId, id);
      if (message) store.updateMessage(options.sessionId, message, state, fields);
    });
    try { apply(); } catch { retries.push(apply); }
  }

  function write(line) {
    return new Promise((resolve, reject) => {
      if (!stdinOpen || child.stdin.destroyed) return reject(new Error('stdin закрыт'));
      child.stdin.write(line, 'utf8', error => error ? reject(error) : resolve());
    });
  }

  async function sendPrompt() {
    if (!options.promptFile) return;
    const text = fs.readFileSync(options.promptFile, 'utf8').replace(/^﻿/, '').trim();
    if (!text) return;
    const uuid = crypto.randomUUID();
    sent.set(uuid, { kind: 'prompt', uuid, text, acked: false, sentAt: Date.now() });
    await write(userLine(text, uuid, options.sessionId));
  }

  async function claim() {
    if (claiming || !stdinOpen) return;
    claiming = true;
    try {
      const batch = store.withMutex(options.sessionId, () => {
        const owner = store.readOwner(options.sessionId);
        if (!owner || owner.runName !== options.run || owner.accepting !== true) return [];
        return store.listMessages(options.sessionId)
          .filter(message => message.state === 'queued' || message.state === 'waiting'
            || (message.state === 'starting' && (!message.runName || message.runName === options.run)))
          .map(message => store.updateMessage(options.sessionId, message, 'sending', { runName: options.run, error: '', waitingReason: '' }))
          .filter(message => message.state === 'sending');
      });
      for (const message of batch) {
        const turn = { kind: 'message', uuid: message.id, text: message.text, acked: false, id: message.id, sentAt: Date.now() };
        sent.set(message.id, turn);
        try {
          await write(userLine(message.text, message.id, options.sessionId));
          update(message.id, 'sent', { sentAt: nowIso() });
        } catch {
          sent.delete(message.id);
          update(message.id, 'waiting', { runName: '', waitingReason: 'Не передано в этот запуск — продолжит сессию после него' });
        }
      }
    } finally {
      claiming = false;
    }
  }

  function closeInput() {
    if (!stdinOpen) return;
    try {
      store.withMutex(options.sessionId, () => {
        const owner = store.readOwner(options.sessionId);
        if (owner && owner.runName === options.run) store.writeOwner(options.sessionId, { ...owner, accepting: false, closedAt: nowIso() });
        for (const message of store.listMessages(options.sessionId)) {
          if (message.state === 'queued') store.updateMessage(options.sessionId, message, 'waiting', { runName: '' });
        }
      });
    } catch {}
    stdinOpen = false;
    child.stdin.end();
  }

  function onEvent(event) {
    if (ACTIVE_TYPES.has(event.type)) { lastActivityAt = Date.now(); lastWasResult = false; }
    if (event.type === 'user' && event.isReplay === true && !event.parent_tool_use_id) {
      const key = typeof event.uuid === 'string' ? event.uuid.toLowerCase() : '';
      let turn = key ? sent.get(key) : null;
      if (!turn) {
        const text = textOf(event).trim();
        turn = [...sent.values()].find(item => !item.acked && item.text.trim() === text) || null;
      }
      if (turn && !turn.acked) {
        turn.acked = true;
        echoesSinceResult.push(turn);
        if (turn.kind === 'message') update(turn.id, 'acknowledged', { ackAt: nowIso(), ackUuid: key });
      }
    } else if (event.type === 'result') {
      resultsSeen++;
      lastWasResult = true;
      lastActivityAt = Date.now();
      const ids = Array.isArray(event.user_message_uuids) ? event.user_message_uuids.filter(id => typeof id === 'string').map(id => id.toLowerCase())
        : typeof event.user_message_uuid === 'string' ? [event.user_message_uuid.toLowerCase()] : null;
      let answered;
      if (ids) {
        answered = ids.map(id => sent.get(id)).filter(turn => turn && !turn.answered);
        for (const turn of answered) if (!turn.acked) { turn.acked = true; if (turn.kind === 'message') update(turn.id, 'acknowledged', { ackAt: nowIso(), ackUuid: turn.uuid }); }
        echoesSinceResult = echoesSinceResult.filter(turn => !answered.includes(turn));
      } else {
        answered = echoesSinceResult;
        echoesSinceResult = [];
      }
      for (const turn of answered) {
        turn.answered = true;
        if (turn.kind !== 'message') continue;
        update(turn.id, 'answered', { answeredAt: nowIso(), resultSubtype: String(event.subtype || ''),
          resultIsError: event.is_error === true, note: answered.length > 1 ? 'Отвечено в общем ходе вместе с другими сообщениями' : '',
          answer: typeof event.result === 'string' ? event.result.slice(0, ANSWER_LIMIT) : '' });
      }
    }
  }

  child.stdout.on('data', chunk => {
    try { fs.writeSync(out, chunk); } catch {}
    const lines = (pending + decoder.write(chunk)).split('\n');
    pending = lines.pop();
    if (pending.length > 8 * 1024 * 1024) pending = '';
    for (const line of lines) {
      if (!line.trim()) continue;
      let event;
      try { event = JSON.parse(line); } catch { continue; }
      try { onEvent(event); } catch {}
    }
  });

  child.stdin.on('error', () => { stdinOpen = false; });

  const timer = setInterval(() => {
    if (finished) return;
    while (retries.length) {
      try { retries[0](); retries.shift(); } catch { break; }
    }
    claim().catch(() => {});
    if (!stdinOpen || claiming) return;
    const now = Date.now();
    const cliIdle = now - lastActivityAt >= CLOSE_AFTER_IDLE_MS && (lastWasResult || resultsSeen === 0 && sent.size === 0);
    if (!cliIdle || echoesSinceResult.length) return;
    for (const turn of [...sent.values()].filter(item => !item.acked)) {
      if (now - turn.sentAt < ACK_IDLE_TIMEOUT_MS) continue;
      sent.delete(turn.uuid);
      if (turn.kind === 'message') update(turn.id, 'failed', { error: 'CLI простаивает и не подтвердил получение — уточнение не принято' });
    }
    if ([...sent.values()].some(turn => !turn.acked)) return;
    let queued = false;
    try { queued = store.listMessages(options.sessionId).some(message => message.state === 'queued'); } catch { queued = true; }
    if (!queued) closeInput();
  }, POLL_MS);

  child.on('error', error => finish(127, 'CLI не запущен: ' + String(error.message).slice(0, 200)));
  child.on('close', code => finish(typeof code === 'number' ? code : 1, ''));

  function finish(code, reason) {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    try { fs.closeSync(out); } catch {}
    try { fs.closeSync(err); } catch {}
    for (const job of retries) { try { job(); } catch {} }
    const echoed = new Set([...sent.values()].filter(turn => turn.acked).map(turn => turn.uuid));
    try {
      store.withMutex(options.sessionId, () => {
        for (const message of store.listMessages(options.sessionId)) {
          const mine = message.runName === options.run;
          if (message.state === 'queued' || (message.state === 'starting' && mine)) {
            store.updateMessage(options.sessionId, message, 'waiting', { runName: '' });
          } else if (mine && message.state === 'sending') {
            store.updateMessage(options.sessionId, message, 'failed', { error: 'Запуск завершился во время передачи: доставка не подтверждена' });
          } else if (mine && message.state === 'sent') {
            if (echoed.has(message.id)) store.updateMessage(options.sessionId, message, 'acknowledged', { note: 'Квитанция CLI была, запись состояния опоздала' });
            else store.updateMessage(options.sessionId, message, 'failed', { error: 'Запуск завершился до квитанции CLI: доставка не подтверждена' });
          } else if (mine && message.state === 'acknowledged') {
            store.updateMessage(options.sessionId, message, 'acknowledged', { note: 'Запуск завершён; отдельного результата для уточнения нет — см. последний ответ потока' });
          }
        }
        store.removeOwner(options.sessionId, options.run);
      });
    } catch {}
    try {
      writeJsonAtomic(resultFile, { exitCode: code, endedAt: nowIso(), managed: true, sessionId: options.sessionId,
        resultsSeen, failureReason: reason || undefined });
    } catch {}
    const status = readJsonFile(statusFile);
    if (status) {
      try { writeJsonAtomic(statusFile, { ...status, claudeWorking: false, updatedAt: nowIso() }); } catch {}
    }
    process.exitCode = code;
    setTimeout(() => process.exit(code), 50).unref();
  }

  try {
    await sendPrompt();
    await claim();
    if (sent.size === 0) closeInput();
  } catch (error) {
    try { fs.appendFileSync(stderrFile, 'managed runner: ' + String(error.message) + '\n'); } catch {}
    closeInput();
  }
}

if (require.main === module) {
  main().catch(error => {
    process.stderr.write('managed runner: ' + String(error.message) + '\n');
    process.exit(2);
  });
}

module.exports = { parseArgs, cliArgs, userLine };
