'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { StringDecoder } = require('node:string_decoder');
const { logEncoding, tailStart } = require('./dialog-data.cjs');

const windowLabels = { five_hour: '5 часов', seven_day: '7 дней', seven_day_opus: 'Opus · 7 дней', seven_day_sonnet: 'Sonnet · 7 дней' };
const TAIL = 2 * 1024 * 1024;

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return null; }
}

function createLimitsData(root, data) {
  const temp = path.join(path.resolve(root), '.tmp');
  const cursors = new Map();
  const samples = new Map();

  function rateSample(event, initial) {
    if (event.type !== 'rate_limit_event' || !event.rate_limit_info) return;
    const info = event.rate_limit_info;
    const id = info.rateLimitType;
    if (!windowLabels[id]) return;
    const reset = typeof info.resetsAt === 'number' && Number.isFinite(info.resetsAt) ? info.resetsAt : null;
    const utilization = typeof info.utilization === 'number' && Number.isFinite(info.utilization) && info.utilization >= 0 && info.utilization <= 1 ? info.utilization : null;
    const key = event.uuid || JSON.stringify([event.session_id, id, reset, info.status, utilization]);
    const existing = samples.get(id);
    if (existing && existing.eventKey === key) return;
    if (initial && existing && !existing.stale) return;
    samples.set(id, { eventKey: key, id, usedPercent: utilization === null ? null : utilization * 100,
      resetsAt: reset, status: ['allowed', 'allowed_warning', 'rejected'].includes(info.status) ? info.status : null,
      observedAt: initial ? null : new Date().toISOString(), stale: initial, source: 'official_cli_events' });
  }

  function scan(file) {
    let stat;
    try { stat = fs.statSync(file); } catch { return; }
    let cursor = cursors.get(file);
    if (!cursor || stat.size < cursor.offset || stat.birthtimeMs !== cursor.birthtime) {
      const encoding = logEncoding(file);
      cursor = { offset: tailStart(stat.size, encoding), birthtime: stat.birthtimeMs, pending: '', decoder: new StringDecoder(encoding.name),
        skipFirst: stat.size - encoding.bom > TAIL, initial: true };
      cursors.set(file, cursor);
    }
    let length = Math.min(Math.max(0, stat.size - cursor.offset), TAIL);
    if (cursor.decoder.encoding === 'utf16le') length -= length % 2;
    if (!length) return;
    const bytes = Buffer.alloc(length);
    const fd = fs.openSync(file, 'r');
    let count;
    try { count = fs.readSync(fd, bytes, 0, length, cursor.offset); } finally { fs.closeSync(fd); }
    cursor.offset += count;
    const lines = (cursor.pending + cursor.decoder.write(bytes.subarray(0, count))).split('\n');
    cursor.pending = lines.pop();
    if (cursor.pending.length > 16 * 1024 * 1024) { cursor.pending = ''; cursor.skipFirst = true; }
    for (const line of lines) {
      if (cursor.skipFirst) { cursor.skipFirst = false; continue; }
      if (!line.includes('rate_limit_event')) continue;
      try { rateSample(JSON.parse(line), cursor.initial); } catch {}
    }
    cursor.initial = false;
  }

  function limits() {
    for (const entry of data.registry().slice(0, 12)) scan(entry.latest.runLog);
    const snapshot = readJson(path.join(temp, 'claude-usage-limits.json'));
    const now = Date.now();
    const choices = new Map(samples);
    if (snapshot && ['official_cli_statusline', 'official_cli_usage'].includes(snapshot.source)) {
      const windows = Array.isArray(snapshot.windows) ? snapshot.windows
        : Object.entries(snapshot.windows || {}).map(([id, value]) => ({ ...value, id, resetsAt: value.resetAt }));
      for (const value of windows) {
        if (!windowLabels[value.id]) continue;
        const used = typeof value.usedPercent === 'number' && Number.isFinite(value.usedPercent) && value.usedPercent >= 0 && value.usedPercent <= 100 ? value.usedPercent : null;
        const observedAt = typeof value.observedAt === 'string' ? value.observedAt : snapshot.observedAt || snapshot.updatedAt;
        const timestamp = Date.parse(observedAt || '');
        const sample = { id: value.id, usedPercent: used, resetsAt: typeof value.resetsAt === 'number' && Number.isFinite(value.resetsAt) ? value.resetsAt : null,
          observedAt: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null, status: null,
          stale: !Number.isFinite(timestamp) || now - timestamp > 5 * 60 * 1000, source: snapshot.source };
        const event = choices.get(value.id);
        if (!event || sample.usedPercent !== null && (event.usedPercent === null || timestamp >= Date.parse(event.observedAt || '') || !event.observedAt)) {
          if (event && event.status && event.resetsAt === sample.resetsAt) sample.status = event.status;
          choices.set(value.id, sample);
        }
      }
    }
    for (const id of ['five_hour', 'seven_day']) if (!choices.has(id)) choices.set(id, { id, usedPercent: null, resetsAt: null, status: null, observedAt: null, stale: true, source: null });
    const windows = [...choices.values()].map(sample => {
      const expired = sample.resetsAt !== null && sample.resetsAt * 1000 <= now;
      const stale = sample.stale || !sample.observedAt || now - Date.parse(sample.observedAt) > 5 * 60 * 1000;
      const usedPercent = expired ? null : sample.usedPercent;
      return { id: sample.id, label: windowLabels[sample.id], usedPercent, remainingPercent: usedPercent === null ? null : 100 - usedPercent,
        resetsAt: expired ? null : sample.resetsAt, status: expired ? null : sample.status, observedAt: sample.observedAt, stale };
    });
    const freshest = windows.filter(x => x.observedAt).map(x => x.observedAt).sort().pop() || null;
    const source = [...choices.values()].find(x => x.usedPercent !== null && x.source)?.source || 'official_cli_events';
    return { updatedAt: freshest, source, windows, note: 'Общие для всех сессий аккаунта' };
  }

  return { limits };
}

module.exports = { createLimitsData };
