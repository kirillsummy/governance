'use strict';

const { execFile } = require('node:child_process');

const WATCHED = ['claude.exe', 'claude', 'node.exe', 'node', 'powershell.exe', 'pwsh.exe', 'pwsh'];
const WINDOWS_QUERY = [
  "$ErrorActionPreference='Stop';",
  '[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);',
  "$names=@('claude.exe','node.exe','powershell.exe','pwsh.exe');",
  '@(Get-CimInstance Win32_Process | Where-Object { $names -contains $_.Name } | ForEach-Object {',
  '[pscustomobject]@{pid=[int]$_.ProcessId;ppid=[int]$_.ParentProcessId;name=[string]$_.Name;',
  'ticks=$(if($_.CreationDate){[string]$_.CreationDate.ToUniversalTime().Ticks}else{""});cmd=[string]$_.CommandLine} })',
  '| ConvertTo-Json -Compress -Depth 2',
].join(' ');

function parseWindows(stdout) {
  const text = stdout.trim();
  if (!text) return [];
  const value = JSON.parse(text);
  return (Array.isArray(value) ? value : [value]).map(row => ({
    pid: Number(row.pid), ppid: Number(row.ppid), name: String(row.name || '').toLowerCase(),
    ticks: String(row.ticks || ''), cmd: String(row.cmd || ''),
  })).filter(row => Number.isInteger(row.pid) && row.pid > 0);
}

function parsePosix(stdout) {
  return stdout.split('\n').map(line => line.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/))
    .filter(Boolean)
    .map(match => ({ pid: Number(match[1]), ppid: Number(match[2]), name: match[3].toLowerCase(), ticks: '', cmd: match[4] }))
    .filter(row => WATCHED.includes(row.name) || WATCHED.some(name => row.cmd.includes(name)));
}

function readProcesses() {
  return new Promise((resolve, reject) => {
    const windows = process.platform === 'win32';
    const file = windows ? 'powershell.exe' : 'ps';
    const args = windows ? ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_QUERY] : ['-eo', 'pid=,ppid=,comm=,args='];
    execFile(file, args, { windowsHide: true, timeout: 20000, maxBuffer: 32 * 1024 * 1024 }, (error, stdout) => {
      if (error) return reject(error);
      try { resolve(windows ? parseWindows(stdout) : parsePosix(stdout)); } catch (parseError) { reject(parseError); }
    });
  });
}

function createProcessMonitor({ intervalMs = 3000, staleMs = 15000, reader = readProcesses } = {}) {
  let snapshot = { at: 0, generation: 0, list: [], error: 'Список процессов ещё не прочитан' };
  let running = false;
  let timer = null;

  async function refresh() {
    if (running) return snapshot;
    running = true;
    const startedAt = Date.now();
    try {
      const list = await reader();
      snapshot = { at: startedAt, generation: snapshot.generation + 1, list, error: '' };
    } catch (error) {
      snapshot = { ...snapshot, error: 'Список процессов не прочитан: ' + String(error && error.message || error).slice(0, 200) };
    } finally {
      running = false;
    }
    return snapshot;
  }

  function current() {
    const fresh = snapshot.at > 0 && Date.now() - snapshot.at <= staleMs && !snapshot.error;
    return { ...snapshot, fresh };
  }

  function start() {
    if (!timer) {
      refresh();
      timer = setInterval(refresh, intervalMs);
      timer.unref();
    }
  }

  function stop() { if (timer) clearInterval(timer); timer = null; }

  return { refresh, current, start, stop };
}

const MARGIN_MS = 3000;

function verifyRunner(snapshot, pid, { names = [], ticks = '', startedAt = 0 } = {}) {
  if (!snapshot.fresh) return 'unknown';
  if (!Number.isInteger(pid) || pid <= 0) return 'dead';
  const row = snapshot.list.find(item => item.pid === pid);
  if (!row) return startedAt && startedAt > snapshot.at - MARGIN_MS ? 'unknown' : 'dead';
  if (ticks && row.ticks && row.ticks !== String(ticks)) return 'dead';
  if (!row.cmd) return 'unknown';
  const cmd = row.cmd.toLowerCase();
  if (names.some(name => name && cmd.includes(String(name).toLowerCase()))) return 'alive';
  return ticks && row.ticks === String(ticks) ? 'alive' : 'foreign';
}

function sessionBusyProcesses(snapshot, sessionId) {
  const needle = String(sessionId || '').toLowerCase();
  if (!needle) return [];
  return snapshot.list.filter(row => /^claude(\.exe)?$/.test(row.name) && row.cmd.toLowerCase().includes(needle));
}

function unreadableClaudeProcesses(snapshot) {
  return snapshot.list.filter(row => /^claude(\.exe)?$/.test(row.name) && !row.cmd);
}

module.exports = { createProcessMonitor, readProcesses, verifyRunner, sessionBusyProcesses, unreadableClaudeProcesses, parseWindows, parsePosix, MARGIN_MS };
