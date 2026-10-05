'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createStore, cleanText, UUID, nowIso } = require('./dialog-store.cjs');
const { verifyRunner } = require('./dialog-processes.cjs');

const RUNNER = path.join(__dirname, 'claude-managed-runner.cjs');
const STARTING_TIMEOUT_MS = 90000;
const MAX_PENDING = 20;
const MIN_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 3;

function publicMessage(message) {
  return {
    id: message.id, text: message.text, state: message.state, createdAt: message.createdAt, updatedAt: message.updatedAt,
    sentAt: message.sentAt || '', ackAt: message.ackAt || '', answeredAt: message.answeredAt || '',
    answer: typeof message.answer === 'string' ? message.answer : '', error: message.error || '', note: message.note || '',
    waitingReason: message.waitingReason || '', runName: message.runName || '', resultIsError: message.resultIsError === true,
  };
}

function createGateway({ root, data, processes, config, spawnRunner }) {
  const store = createStore(root);
  const lastCreate = new Map();

  function snapshot() { return processes.current(); }

  const missing = new Map();

  function ownerState(sessionId) {
    const owner = store.readOwner(sessionId);
    if (!owner) return { owner: null, verdict: 'none' };
    const snap = snapshot();
    let verdict = verifyRunner(snap, Number(owner.runnerPid), { names: [owner.runName], startedAt: Date.parse(owner.startedAt || '') || 0 });
    if (verdict === 'foreign') verdict = 'dead';
    if (verdict === 'dead') {
      if (!missing.has(owner.runName)) { missing.set(owner.runName, snap.generation); verdict = 'unknown'; }
      else if (missing.get(owner.runName) === snap.generation) verdict = 'unknown';
    } else {
      missing.delete(owner.runName);
    }
    return { owner, verdict };
  }

  function delivery(sessionId) {
    const { owner, verdict } = ownerState(sessionId);
    if (owner && verdict === 'alive' && owner.accepting === true) {
      return { mode: 'live', text: 'Уточнение уйдёт в работающий управляемый запуск сразу; квитанция — от CLI' };
    }
    if (owner && verdict === 'unknown') return { mode: 'blocked', text: 'Владелец управляемого запуска не проверен — уточнение подождёт' };
    if (owner && verdict === 'alive') return { mode: 'deferred', text: 'Запуск заканчивает работу и уже не принимает ввод — уточнение продолжит сессию после него' };
    const busy = data.busyFor(sessionId);
    if (busy.busy) {
      return { mode: busy.managed ? 'blocked' : 'deferred', text: busy.managed
        ? 'Управляемый запуск без подтверждённого владельца — уточнение подождёт'
        : 'Прежний запуск без ввода ещё работает — уточнение сохранено и продолжит ту же сессию после его завершения: ' + busy.reason };
    }
    return { mode: 'resume', text: 'Сессия свободна — уточнение продолжит её новым управляемым запуском' };
  }

  function list(sessionId) {
    if (!UUID.test(sessionId || '') || !data.find(sessionId)) return null;
    return { sessionId: sessionId.toLowerCase(), delivery: delivery(sessionId),
      messages: store.listMessages(sessionId).slice(-50).map(publicMessage) };
  }

  function create(sessionId, id, rawText) {
    if (!UUID.test(sessionId || '') || !data.find(sessionId)) return { status: 404, error: 'Сессия не найдена в реестре' };
    if (!UUID.test(id || '')) return { status: 400, error: 'Нужен идентификатор уточнения' };
    const text = cleanText(rawText);
    if (text === null) return { status: 400, error: 'Текст пустой, слишком длинный или содержит управляющие символы' };
    const sid = sessionId.toLowerCase();
    const route = delivery(sid);
    return store.withMutex(sid, () => {
      const existing = store.readMessage(sid, id);
      if (existing) {
        if (existing.text !== text) return { status: 409, error: 'Этот идентификатор уже использован для другого текста' };
        return { status: 200, duplicate: true, message: publicMessage(existing) };
      }
      const pending = store.listMessages(sid).filter(message => ['queued', 'waiting', 'starting', 'sending', 'sent'].includes(message.state));
      if (pending.length >= MAX_PENDING) return { status: 429, error: 'Слишком много недоставленных уточнений этой сессии' };
      if (Date.now() - (lastCreate.get(sid) || 0) < MIN_INTERVAL_MS) return { status: 429, error: 'Подождите секунду перед следующим уточнением' };
      const owner = store.readOwner(sid);
      const live = route.mode === 'live' && owner && owner.accepting === true;
      const state = live ? 'queued' : 'waiting';
      const { created, message } = store.createMessage(sid, id, text, state, { waitingReason: state === 'waiting' ? route.text : '' });
      if (!created) return { status: 200, duplicate: true, message: publicMessage(message) };
      lastCreate.set(sid, Date.now());
      return { status: 201, message: publicMessage(message), delivery: route };
    });
  }

  function runNameFor(sessionId) {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    return `claude-dialog-${sessionId.slice(0, 8)}-${stamp}`;
  }

  function defaultSpawn(args) {
    if (!fs.existsSync(config.cwd)) throw new Error('каталог репозиториев из конфигурации не найден');
    const child = spawn(process.execPath, [RUNNER, ...args], { cwd: config.cwd, detached: true, stdio: 'ignore', windowsHide: true, shell: false });
    child.on('error', () => {});
    child.unref();
    return child.pid;
  }

  function tick() {
    const snap = snapshot();
    if (!snap.fresh) return;
    for (const sid of store.sessionsWithMessages()) {
      try { tickSession(sid); } catch {}
    }
  }

  function tickSession(sid) {
    const messages = store.listMessages(sid);
    if (!messages.some(message => ['waiting', 'starting', 'queued', 'sending', 'sent'].includes(message.state))) return;
    const busy = store.readOwner(sid) ? null : data.busyFor(sid);
    store.withMutex(sid, () => {
      const current = store.listMessages(sid);
      const { owner, verdict } = ownerState(sid);
      if (owner && verdict === 'dead') {
        for (const message of current) {
          if (message.runName !== owner.runName) continue;
          if (message.state === 'sending' || message.state === 'sent') {
            store.updateMessage(sid, message, 'failed', { error: 'Управляемый запуск завершился без квитанции: доставка не подтверждена' });
          } else if (message.state === 'queued') {
            store.updateMessage(sid, message, 'waiting', { runName: '' });
          }
        }
        store.removeOwner(sid, owner.runName);
        return;
      }
      if (owner && verdict === 'alive' && owner.accepting === true) {
        for (const message of current) if (message.state === 'waiting') store.updateMessage(sid, message, 'queued', { waitingReason: '' });
        return;
      }
      if (owner) return;
      for (const message of current) {
        if (message.state === 'queued') store.updateMessage(sid, message, 'waiting', { runName: '' });
      }
      for (const message of store.listMessages(sid)) {
        if (message.state === 'starting' && Date.now() - Date.parse(message.updatedAt || 0) > STARTING_TIMEOUT_MS) {
          if ((message.attempts || 0) >= MAX_ATTEMPTS) {
            store.updateMessage(sid, message, 'failed', { runName: '', error: 'Управляемый запуск не стартовал за ' + MAX_ATTEMPTS + ' попытки — уточнение не доставлено' });
          } else {
            store.updateMessage(sid, message, 'waiting', { runName: '', waitingReason: 'Управляемый запуск не стартовал вовремя — повторим, когда сессия свободна' });
          }
        }
      }
      const fresh = store.listMessages(sid);
      if (fresh.some(message => message.state === 'starting')) return;
      const waiting = fresh.filter(message => message.state === 'waiting');
      if (!waiting.length) return;
      if (!busy || busy.busy) {
        if (!busy) return;
        for (const message of waiting) {
          const reason = 'Ждёт завершения прежнего запуска: ' + busy.reason;
          if (message.waitingReason !== reason) store.updateMessage(sid, message, 'waiting', { waitingReason: reason });
        }
        return;
      }
      if (!config.claude || !config.cwd) {
        for (const message of waiting) store.updateMessage(sid, message, 'waiting', { waitingReason: 'Не настроен путь CLI для продолжения сессии' });
        return;
      }
      const runName = runNameFor(sid);
      for (const message of waiting) store.updateMessage(sid, message, 'starting', { runName, waitingReason: '', attempts: (message.attempts || 0) + 1 });
      const args = ['--root', path.resolve(root), '--run', runName, '--resume', sid, '--claude', config.claude, '--cwd', config.cwd,
        '--model', 'opus', '--effort', 'high'];
      try {
        (spawnRunner || defaultSpawn)(args);
      } catch (error) {
        for (const message of store.listMessages(sid)) {
          if (message.state === 'starting' && message.runName === runName) {
            store.updateMessage(sid, message, 'waiting', { runName: '', waitingReason: 'Управляемый запуск не создан: ' + String(error.message).slice(0, 120) });
          }
        }
      }
    });
  }

  function owners(sessionId) {
    try { return store.readOwner(sessionId); } catch { return null; }
  }

  return { list, create, tick, owners, delivery };
}

module.exports = { createGateway, publicMessage };
