'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RUN_NAME = /^claude-[a-z0-9][a-z0-9-]{2,90}$/;
const MAX_TEXT = 8000;
const MUTEX_STALE_MS = 15000;
const sleeper = new Int32Array(new SharedArrayBuffer(4));
const TRANSITIONS = {
  queued: ['sending', 'waiting'],
  waiting: ['queued', 'starting', 'sending', 'waiting', 'failed'],
  starting: ['sending', 'waiting', 'failed', 'starting'],
  sending: ['sent', 'failed', 'waiting', 'acknowledged', 'answered'],
  sent: ['acknowledged', 'answered', 'failed'],
  acknowledged: ['answered', 'acknowledged'],
  answered: [],
  failed: [],
};

function sleep(ms) { Atomics.wait(sleeper, 0, 0, ms); }

function nowIso() { return new Date().toISOString(); }

function readJsonFile(file, limit = 1024 * 1024) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > limit) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  } catch { return null; }
}

function writeJsonAtomic(file, value) {
  const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 1), { encoding: 'utf8', mode: 0o600 });
  for (let attempt = 0; ; attempt++) {
    try { fs.renameSync(temp, file); return; } catch (error) {
      if (attempt >= 200 || !['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) {
        try { fs.unlinkSync(temp); } catch {}
        throw error;
      }
      sleep(25);
    }
  }
}

function cleanText(value) {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\r\n?/g, '\n').replace(/^\n+|\s+$/g, '');
  if (!text.trim() || text.length > MAX_TEXT || !text.isWellFormed() || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) return null;
  return text;
}

function createStore(root) {
  const base = path.join(path.resolve(root), '.tmp', 'claude-dialog');

  function sessionDir(sessionId) {
    if (!UUID.test(sessionId || '')) throw new Error('bad session id');
    return path.join(base, sessionId.toLowerCase());
  }

  function messagesDir(sessionId) { return path.join(sessionDir(sessionId), 'messages'); }
  function ownerFile(sessionId) { return path.join(sessionDir(sessionId), 'owner.json'); }

  function withMutex(sessionId, action) {
    const dir = sessionDir(sessionId);
    fs.mkdirSync(path.join(dir, 'messages'), { recursive: true });
    const lock = path.join(dir, 'mutex');
    const token = `${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
    const deadline = Date.now() + 10000;
    for (;;) {
      try {
        fs.mkdirSync(lock);
        fs.writeFileSync(path.join(lock, 'owner'), token);
        break;
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        let age = 0;
        try { age = Date.now() - fs.statSync(lock).mtimeMs; } catch { continue; }
        if (age > MUTEX_STALE_MS) {
          try { fs.rmSync(lock, { recursive: true, force: true }); } catch {}
          continue;
        }
        if (Date.now() > deadline) throw new Error('Очередь сессии занята другим процессом');
        sleep(20);
      }
    }
    try { return action(); } finally {
      for (let attempt = 0; attempt < 50; attempt++) {
        let holder = '';
        try { holder = fs.readFileSync(path.join(lock, 'owner'), 'utf8'); } catch {}
        if (holder && holder !== token) break;
        try { fs.rmSync(lock, { recursive: true, force: true }); } catch {}
        if (!fs.existsSync(lock)) break;
        sleep(20);
      }
    }
  }

  function messageFile(sessionId, id) {
    if (!UUID.test(id || '')) throw new Error('bad message id');
    return path.join(messagesDir(sessionId), id.toLowerCase() + '.json');
  }

  function readMessage(sessionId, id) { return readJsonFile(messageFile(sessionId, id)); }

  function listMessages(sessionId) {
    let names = [];
    try { names = fs.readdirSync(messagesDir(sessionId)); } catch { return []; }
    return names.filter(name => /^[0-9a-f-]{36}\.json$/.test(name))
      .map(name => readJsonFile(path.join(messagesDir(sessionId), name)))
      .filter(message => message && UUID.test(message.id || '') && typeof message.text === 'string')
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)) || a.id.localeCompare(b.id));
  }

  function createMessage(sessionId, id, text, state, extra = {}) {
    const file = messageFile(sessionId, id);
    const message = { id: id.toLowerCase(), sessionId: sessionId.toLowerCase(), text, state, createdAt: nowIso(),
      updatedAt: nowIso(), history: [{ state, at: nowIso() }], ...extra };
    const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(message, null, 1), { encoding: 'utf8', mode: 0o600 });
    try {
      fs.linkSync(temp, file);
    } catch (error) {
      try { fs.unlinkSync(temp); } catch {}
      if (error.code === 'EEXIST') return { created: false, message: readMessage(sessionId, id) };
      throw error;
    }
    try { fs.unlinkSync(temp); } catch {}
    return { created: true, message };
  }

  function updateMessage(sessionId, message, state, fields = {}) {
    if (message.state !== state && !(TRANSITIONS[message.state] || []).includes(state)) return message;
    const next = { ...message, ...fields, state, updatedAt: nowIso(),
      history: [...(Array.isArray(message.history) ? message.history : []).slice(-30), { state, at: nowIso() }] };
    writeJsonAtomic(messageFile(sessionId, message.id), next);
    return next;
  }

  function readOwner(sessionId) { return readJsonFile(ownerFile(sessionId), 64 * 1024); }
  function writeOwner(sessionId, owner) { writeJsonAtomic(ownerFile(sessionId), owner); }
  function removeOwner(sessionId, runName) {
    const owner = readOwner(sessionId);
    if (owner && owner.runName === runName) {
      try { fs.unlinkSync(ownerFile(sessionId)); } catch {}
    }
  }

  function sessionsWithMessages() {
    let names = [];
    try { names = fs.readdirSync(base); } catch { return []; }
    return names.filter(name => UUID.test(name));
  }

  return { base, withMutex, readMessage, listMessages, createMessage, updateMessage, readOwner, writeOwner, removeOwner,
    sessionsWithMessages, sessionDir };
}

module.exports = { createStore, cleanText, readJsonFile, writeJsonAtomic, UUID, RUN_NAME, MAX_TEXT, nowIso };
