'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { StringDecoder } = require('node:string_decoder');
const { verifyRunner, sessionBusyProcesses, unreadableClaudeProcesses, MARGIN_MS } = require('./dialog-processes.cjs');

const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const LAUNCH = /^(claude-[a-z0-9][a-z0-9-]{2,90})\.launch\.json$/;
const DISPATCH = /^claude-dispatch-[a-z0-9-]{1,80}\.json$/;
const TAIL_BYTES = 2 * 1024 * 1024;
const MAX_SESSIONS = 80;

function readText(file) {
  const bytes = fs.readFileSync(file);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.toString('utf16le').replace(/^﻿/, '');
  return bytes.toString('utf8').replace(/^﻿/, '');
}

function readJson(file, limit = 2 * 1024 * 1024) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > limit) return null;
    return JSON.parse(readText(file));
  } catch { return null; }
}

function logEncoding(file) {
  const head = Buffer.alloc(3);
  let count = 0;
  try {
    const fd = fs.openSync(file, 'r');
    try { count = fs.readSync(fd, head, 0, 3, 0); } finally { fs.closeSync(fd); }
  } catch {}
  if (count >= 2 && head[0] === 0xff && head[1] === 0xfe) return { name: 'utf16le', bom: 2 };
  if (count >= 3 && head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf) return { name: 'utf8', bom: 3 };
  return { name: 'utf8', bom: 0 };
}

function tailStart(size, encoding) {
  let start = Math.max(encoding.bom, size - TAIL_BYTES);
  if (encoding.name === 'utf16le' && (start - encoding.bom) % 2) start++;
  return start;
}

function time(value) {
  const ms = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(ms) ? ms : 0;
}

function createDialogData(root, { processes } = {}) {
  const temp = path.join(path.resolve(root), '.tmp');
  const cursors = new Map();
  const inside = file => typeof file === 'string' && file && path.resolve(file).startsWith(temp + path.sep);
  const control = (file, extension) => inside(file) && path.resolve(file).toLowerCase().endsWith(extension) ? path.resolve(file) : '';

  function runFrom(record, fallbackName, fileTime) {
    const runName = typeof record.runName === 'string' && LAUNCH.test(record.runName + '.launch.json') ? record.runName : fallbackName;
    if (!runName) return null;
    const sessionId = UUID.test(record.sessionId || '') ? record.sessionId.toLowerCase() : '';
    const launchedAt = time(record.launchedAt) || time(record.runnerStartedAt) || time(record.startedAt) || time(record.createdAt) || fileTime || 0;
    const pid = Number(record.runnerPid);
    return {
      runName, sessionId, launchedAt, managed: record.managed === true,
      task: typeof record.task === 'string' ? record.task.slice(0, 200) : '',
      runLog: control(record.runLog, '.jsonl') || path.join(temp, runName + '.jsonl'),
      promptFile: control(record.promptFile, '.txt') || control(record.promptFile, '.md'),
      statusFile: control(record.statusFile, '.json') || control(record.statusPath, '.json'),
      runnerFile: control(record.runnerFile, '.ps1'),
      runnerResult: path.join(temp, runName + '.runner-result.json'),
      runnerPid: Number.isInteger(pid) && pid > 0 ? pid : 0,
      runnerTicks: typeof record.runnerCimCreationTimeUtcTicks === 'string' || typeof record.runnerCimCreationTimeUtcTicks === 'number'
        ? String(record.runnerCimCreationTimeUtcTicks) : '',
    };
  }

  let cache = { at: 0, value: [] };

  function registry() {
    if (Date.now() - cache.at < 1000) return cache.value;
    cache = { at: Date.now(), value: readRegistry() };
    return cache.value;
  }

  function readRegistry() {
    let names = [];
    try { names = fs.readdirSync(temp); } catch { names = []; }
    const runs = new Map();
    for (const name of names) {
      const match = name.match(LAUNCH);
      if (!match) continue;
      const file = path.join(temp, name);
      const record = readJson(file, 256 * 1024);
      if (!record || typeof record !== 'object') continue;
      let mtime = 0;
      try { mtime = fs.statSync(file).mtimeMs; } catch {}
      const run = runFrom(record, match[1], mtime);
      if (run && run.runName === match[1]) runs.set(run.runName, run);
    }
    for (const name of names.filter(item => DISPATCH.test(item))) {
      const registryFile = readJson(path.join(temp, name), 1024 * 1024);
      for (const record of Array.isArray(registryFile && registryFile.streams) ? registryFile.streams : []) {
        const run = record && runFrom(record, '', 0);
        if (!run) continue;
        const known = runs.get(run.runName);
        if (!known) { runs.set(run.runName, run); continue; }
        const merged = { ...run };
        for (const [key, value] of Object.entries(known)) if (value) merged[key] = value;
        runs.set(run.runName, merged);
      }
    }
    const bySession = new Map();
    for (const run of runs.values()) {
      if (!run.sessionId) continue;
      const list = bySession.get(run.sessionId) || [];
      list.push(run);
      bySession.set(run.sessionId, list);
    }
    const sessions = [];
    for (const [sessionId, list] of bySession) {
      list.sort((a, b) => b.launchedAt - a.launchedAt || b.runName.localeCompare(a.runName));
      sessions.push({ id: sessionId, sessionId, latest: list[0], runs: list });
    }
    sessions.sort((a, b) => b.latest.launchedAt - a.latest.launchedAt);
    return sessions.slice(0, MAX_SESSIONS);
  }

  function runState(run, snapshot) {
    const result = readJson(run.runnerResult, 64 * 1024);
    if (result && typeof result === 'object') {
      const failed = result.exitCode !== 0 || !!result.failureReason;
      return { state: failed ? 'failed' : 'finished', endedAt: typeof result.endedAt === 'string' ? result.endedAt : '',
        exitCode: Number.isInteger(result.exitCode) ? result.exitCode : null };
    }
    const names = [run.runName, run.runnerFile && path.basename(run.runnerFile)];
    const verdict = verifyRunner(snapshot, run.runnerPid, { names, ticks: run.runnerTicks, startedAt: run.launchedAt });
    if (verdict === 'alive') return { state: 'running' };
    if (verdict === 'unknown') return { state: 'unknown', reason: snapshot.error || 'Список процессов устарел' };
    if (verdict === 'foreign') return { state: 'stopped', reason: 'PID запуска теперь у другого процесса' };
    return { state: 'stopped' };
  }

  function sessionState(entry, snapshot, owner) {
    const latest = entry.latest;
    const run = runState(latest, snapshot);
    const status = readJson(latest.statusFile, 256 * 1024) || {};
    const busy = snapshot.fresh ? sessionBusyProcesses(snapshot, entry.sessionId) : [];
    const otherRunning = entry.runs.slice(1).some(other => !readJson(other.runnerResult, 64 * 1024)
      && verifyRunner(snapshot, other.runnerPid, { names: [other.runName, other.runnerFile && path.basename(other.runnerFile)], ticks: other.runnerTicks }) === 'alive');
    let status_ = 'offline';
    let label = '';
    if (run.state === 'running') { status_ = 'working'; }
    else if (run.state === 'unknown') { status_ = 'unknown'; label = run.reason; }
    else if (run.state === 'stopped') {
      status_ = busy.length ? 'working' : 'stopped';
      label = busy.length ? 'Процесс CLI этой сессии работает без подтверждённого запуска' : 'Запуск прервался без результата';
    } else if (run.state === 'failed') { status_ = 'failed'; label = 'Запуск завершился с ошибкой'; }
    else {
      status_ = status.awaitingReply === true ? 'waiting' : 'idle';
    }
    if (otherRunning && status_ !== 'working') { status_ = 'working'; label = 'Работает более ранний запуск этой сессии'; }
    const managedLive = !!(owner && owner.runName === latest.runName && run.state === 'running');
    return {
      status: status_, statusNote: label, runName: latest.runName, managed: latest.managed, managedLive,
      accepting: managedLive && owner.accepting === true,
      phase: typeof status.phase === 'string' ? status.phase.slice(0, 300) : '',
      summary: typeof status.summary === 'string' ? status.summary.slice(0, 500) : '',
      statusUpdatedAt: typeof status.updatedAt === 'string' ? status.updatedAt : '',
      launchedAt: latest.launchedAt ? new Date(latest.launchedAt).toISOString() : '',
      endedAt: run.endedAt || '', exitCode: run.exitCode ?? null,
      task: latest.task || (typeof status.task === 'string' ? status.task.slice(0, 200) : '') || latest.runName,
      busyProcesses: busy.length,
    };
  }

  function observe(run) {
    let stat;
    try { stat = fs.statSync(run.runLog); } catch { return null; }
    let cursor = cursors.get(run.runLog);
    if (!cursor || stat.size < cursor.offset || stat.birthtimeMs !== cursor.birthtime) {
      const encoding = logEncoding(run.runLog);
      cursor = { offset: tailStart(stat.size, encoding), birthtime: stat.birthtimeMs, pending: '', decoder: new StringDecoder(encoding.name),
        skipFirst: stat.size - encoding.bom > TAIL_BYTES, messages: [], seen: new Set(), sessionId: '', lastEventAt: 0 };
      cursors.set(run.runLog, cursor);
    }
    let length = Math.min(Math.max(0, stat.size - cursor.offset), TAIL_BYTES);
    if (cursor.decoder.encoding === 'utf16le') length -= length % 2;
    if (length) {
      const bytes = Buffer.alloc(length);
      const fd = fs.openSync(run.runLog, 'r');
      let count;
      try { count = fs.readSync(fd, bytes, 0, length, cursor.offset); } finally { fs.closeSync(fd); }
      cursor.offset += count;
      const lines = (cursor.pending + cursor.decoder.write(bytes.subarray(0, count))).split('\n');
      cursor.pending = lines.pop();
      if (cursor.pending.length > 16 * 1024 * 1024) { cursor.pending = ''; cursor.skipFirst = true; }
      for (const line of lines) {
        if (cursor.skipFirst) { cursor.skipFirst = false; continue; }
        let event;
        try { event = JSON.parse(line); } catch { continue; }
        if (event.parent_tool_use_id) continue;
        const eventSession = UUID.test(event.session_id || '') ? event.session_id.toLowerCase() : '';
        if (run.sessionId && eventSession && eventSession !== run.sessionId) continue;
        if (eventSession) cursor.sessionId = eventSession;
        let content = '';
        let role = '';
        if (event.type === 'result' && typeof event.result === 'string') { content = event.result.trim(); role = 'assistant'; }
        else if (event.type === 'user' || event.type === 'assistant') {
          const id = typeof event.uuid === 'string' ? event.uuid : '';
          if (id && cursor.seen.has(id)) continue;
          if (id) cursor.seen.add(id);
          if (cursor.seen.size > 5000) cursor.seen = new Set([...cursor.seen].slice(-2000));
          const blocks = Array.isArray(event.message?.content) ? event.message.content : typeof event.message?.content === 'string'
            ? [{ type: 'text', text: event.message.content }] : [];
          content = blocks.filter(x => x && x.type === 'text' && typeof x.text === 'string').map(x => x.text).join('\n').trim();
          role = event.type === 'assistant' ? 'assistant' : event.isReplay === true ? 'clarification' : 'user';
        }
        if (content && event.type === 'result') {
          const last = cursor.messages[cursor.messages.length - 1];
          if (last && last.role === 'assistant' && last.content === content) continue;
        }
        if (content) cursor.messages.push({ role, content });
      }
      if (cursor.messages.length > 200) cursor.messages = cursor.messages.slice(-200);
    }
    return { messages: cursor.messages, sessionId: cursor.sessionId, runSize: stat.size, modifiedAt: new Date(stat.mtimeMs).toISOString() };
  }

  function snapshot() {
    return processes ? processes.current() : { at: 0, list: [], error: 'Монитор процессов не подключён', fresh: false };
  }

  function sessions(owners = () => null) {
    const snap = snapshot();
    const list = registry().map(entry => ({ id: entry.id, sessionId: entry.sessionId, ...sessionState(entry, snap, owners(entry.sessionId)) }));
    return { observedAt: new Date().toISOString(), processesAt: snap.at ? new Date(snap.at).toISOString() : '',
      processesError: snap.fresh ? '' : snap.error || 'Список процессов устарел', sessions: list };
  }

  function find(id) {
    const sessionId = String(id || '').toLowerCase();
    return UUID.test(sessionId) ? registry().find(entry => entry.sessionId === sessionId) || null : null;
  }

  function dialog(id, owners = () => null) {
    const entry = find(id);
    if (!entry) return null;
    const snap = snapshot();
    const state = sessionState(entry, snap, owners(entry.sessionId));
    const log = observe(entry.latest);
    const messages = [];
    let prompt = '';
    if (entry.latest.promptFile) {
      try { prompt = readText(entry.latest.promptFile).trim(); } catch {}
      if (prompt) messages.push({ role: 'user', content: prompt });
    }
    for (const message of log ? log.messages : []) {
      if (prompt && message.role !== 'assistant' && message.content === prompt) continue;
      messages.push(message);
    }
    return { id: entry.id, sessionId: entry.sessionId, ...state, observedAt: new Date().toISOString(),
      runSize: log ? log.runSize : 0, runModifiedAt: log ? log.modifiedAt : '', messages };
  }

  function busyFor(sessionId) {
    const entry = find(sessionId);
    const snap = snapshot();
    if (!snap.fresh) return { busy: true, reason: snap.error || 'Список процессов устарел: владелец запуска не проверен' };
    if (sessionBusyProcesses(snap, sessionId).length) return { busy: true, reason: 'Процесс CLI этой сессии ещё работает' };
    if (unreadableClaudeProcesses(snap).length) return { busy: true, reason: 'Есть процесс CLI с нечитаемой командной строкой — владелец не проверен' };
    if (!entry) return { busy: true, reason: 'Сессия не найдена в реестре' };
    for (const run of entry.runs) {
      const state = runState(run, snap);
      if (state.state === 'stopped' && run.launchedAt > snap.at - MARGIN_MS) return { busy: true, reason: 'Запуск ' + run.runName + ' только что начат — ждём проверки процесса' };
      if (state.state === 'running') return { busy: true, reason: 'Работает запуск ' + run.runName, runName: run.runName, managed: run.managed };
      if (state.state === 'unknown') return { busy: true, reason: state.reason };
    }
    return { busy: false, reason: '' };
  }

  return { registry, sessions, dialog, find, busyFor, observe };
}

module.exports = { createDialogData, logEncoding, tailStart };
