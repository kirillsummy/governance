'use strict';

// Official Claude Code statusLine input only; never retain the full payload.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));
const requestedTarget = process.argv[3] || 'claude-usage-limits.json';
const allowedTargets = new Set(['claude-usage-limits.json', 'claude-usage-probe-limits.json']);
const target = path.join(root, '.tmp', allowedTargets.has(requestedTarget)
  ? requestedTarget : 'claude-usage-probe-limits.json');
let input = '';
let oversized = false;

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  if (oversized) return;
  input += chunk;
  if (input.length > 256 * 1024) {
    input = '';
    oversized = true;
  }
});
process.stdin.on('error', () => {});
process.stdin.on('end', () => {
  if (oversized) return;
  let temporary;
  try {
    const data = JSON.parse(input);
    const rate = data && data.rate_limits;
    if (!rate || typeof rate !== 'object') return;
    const observedAt = new Date().toISOString();
    const windows = {};
    for (const key of ['five_hour', 'seven_day']) {
      const incoming = rate[key];
      if (!incoming || typeof incoming !== 'object') continue;
      const usedPercent = incoming.used_percentage;
      const resetAt = incoming.resets_at;
      if (typeof usedPercent !== 'number' || !Number.isFinite(usedPercent)
          || usedPercent < 0 || usedPercent > 100) continue;
      if (typeof resetAt !== 'number' || !Number.isFinite(resetAt)
          || resetAt <= 0 || resetAt > 8640000000000) continue;
      if (resetAt * 1000 <= Date.now()) continue;
      windows[key] = { usedPercent, resetAt, observedAt };
    }
    if (!Object.keys(windows).length) return;
    const snapshot = { source: 'official_cli_statusline', observedAt, windows };
    fs.mkdirSync(path.dirname(target), { recursive: true });
    temporary = target + '.' + process.pid + '.' + Date.now() + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(snapshot, null, 2) + '\n', {
      encoding: 'utf8', flag: 'wx', mode: 0o600,
    });
    fs.renameSync(temporary, target);
    temporary = undefined;
    const labels = Object.entries(windows).map(([key, value]) =>
      (key === 'five_hour' ? '5ч' : '7д') + ': ' + value.usedPercent.toFixed(0) + '%');
    process.stdout.write('Claude · ' + labels.join(' · ') + '\n');
  } catch {
    // A missing/invalid snapshot must never disrupt the official CLI.
  } finally {
    if (temporary) {
      try { fs.unlinkSync(temporary); } catch {}
    }
  }
});
