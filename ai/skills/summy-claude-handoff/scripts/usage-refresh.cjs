'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CACHE_MS = 120000;
const TIMEOUT_MS = 45000;

function readSnapshot(file) {
  try {
    const stat = fs.statSync(file);
    if (stat.size > 16384) return null;
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (value.source !== 'official_cli_statusline') return null;
    const observed = Date.parse(value.observedAt);
    if (!Number.isFinite(observed) || observed > Date.now() + 5000) return null;
    const windows = {};
    for (const key of ['five_hour', 'seven_day']) {
      const incoming = value.windows && value.windows[key];
      if (!incoming || typeof incoming.usedPercent !== 'number'
          || !Number.isFinite(incoming.usedPercent) || incoming.usedPercent < 0
          || incoming.usedPercent > 100 || typeof incoming.resetAt !== 'number'
          || !Number.isFinite(incoming.resetAt) || incoming.resetAt * 1000 <= Date.now()) continue;
      windows[key] = { usedPercent: incoming.usedPercent, resetAt: incoming.resetAt };
    }
    if (!Object.keys(windows).length) return null;
    return { source: 'official_cli_statusline', observedAt: value.observedAt, windows };
  } catch { return null; }
}

function createUsageRefresh(root, config = {}) {
  root = path.resolve(root);
  const CLI = config.claude || process.env.SUMMY_CLAUDE_CLI || path.join(require('node:os').homedir(), '.local', 'bin', process.platform === 'win32' ? 'claude.exe' : 'claude');
  const CONSOLE = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:/Windows', 'System32', 'cmd.exe') : '';
  const REPOSITORIES = config.cwd || root;
  const snapshotFile = path.join(root, '.tmp', 'claude-usage-limits.json');
  const probeSnapshotFile = path.join(root, '.tmp', 'claude-usage-probe-limits.json');
  const receiptFile = path.join(root, '.tmp', 'claude-usage-refresh-last-result.json');
  const settingsFile = path.join(root, '.tmp', 'claude-usage-probe.settings.json');
  const runtime = path.join(root, '.tmp', 'claude-usage-runtime', 'node_modules', '@lydell', 'node-pty');
  let inflight = null;
  let lastAttemptAt = 0;
  let lastResult = null;
  let lastError = null;
  let lastSuccessAt = null;

  async function refresh({ force = false } = {}) {
    if (inflight) return inflight;
    if (!force) {
      if (lastResult && !lastResult.ok && Date.now() - lastAttemptAt < CACHE_MS) {
        return { ...lastResult, cached: true };
      }
      const current = readSnapshot(snapshotFile);
      if (current && Date.now() - Date.parse(current.observedAt) < CACHE_MS) {
        lastSuccessAt = current.observedAt;
        lastError = null;
        return { ok: true, cached: true, exited: true, snapshot: current };
      }
      if (lastResult && Date.now() - lastAttemptAt < CACHE_MS) {
        return { ...lastResult, cached: true };
      }
    }
    lastAttemptAt = Date.now();
    inflight = runProbe().then((result) => {
      lastResult = result;
      lastError = result.ok ? null : result.error;
      if (result.ok && result.snapshot) lastSuccessAt = result.snapshot.observedAt;
      return result;
    })
      .finally(() => { inflight = null; });
    return inflight;
  }

  function runProbe() {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      let terminal;
      let settled = false;
      let exited = false;
      let stopping = false;
      let sentAt = null;
      let exitSentAt = null;
      let freshSnapshot = null;
      let failure = null;
      let poll;
      let start;
      let deadline;
      let reap;
      const observations = { ready: false, loginRequired: false, usageFailed: false, trustRequired: false, cursorQuery: false, keyboardQuery: false, versionQuery: false, usageCommandSent: false, usageCommandSeen: false, usageViewObserved: false, resetSeen: false, percentUsedSeen: false, unknownCommand: false, ttyBytes: 0, ttyChunks: 0 };
      const phrases = [
        ['showing last-known usage', 'usageFailed'],
        ['unable to fetch usage', 'usageFailed'],
        ['failed to fetch usage', 'usageFailed'],
        ['failed to load usage', 'usageFailed'],
        ['usage endpoint is rate limited', 'usageFailed'],
        ['current week', 'usageViewObserved'],
        ['current session', 'usageViewObserved'],
        ['plan usage', 'usageViewObserved'],
        ['usage limits', 'usageViewObserved'],
        ['resets', 'resetSeen'],
        ['% used', 'percentUsedSeen'],
        ['/usage', 'usageCommandSeen'],
      ].map(([phrase, field]) => ({ phrase, field, index: 0 }));
      let lastWasSpace = false;
      // Reply only to explicit complete terminal queries. Numeric matcher indices
      // handle chunk boundaries without retaining terminal/account screen text.
      const terminalQueries = [
        ['\x1b[6n', '\x1b[1;1R', 'cursorQuery'],
        ['\x1b[?u', '\x1b[?0u', 'keyboardQuery'],
        ['\x1b[>0q', '\x1bP>|summy-usage-pty(1.0)\x1b\\', 'versionQuery'],
      ].map(([query, reply, field]) => ({ query, reply, field, index: 0 }));

      function finish(exitCode, error) {
        if (settled) return;
        settled = true;
        clearTimeout(start); clearTimeout(deadline); clearTimeout(reap); clearInterval(poll);
        if (terminal && exited) {
          try { terminal.kill(); } catch {}
          try { terminal._agent?._conoutSocketWorker?.dispose(); } catch {}
          try { terminal._agent?._inSocket?.destroy(); } catch {}
          try { terminal._agent?._outSocket?.destroy(); } catch {}
        }
        if (!error && exitCode === 0 && freshSnapshot) {
          if (observations.usageFailed) error = 'usage_request_failed';
          else if (!observations.usageViewObserved || !observations.usageCommandSent) error = 'usage_not_confirmed';
          else {
            const temporary = snapshotFile + '.refresh.' + process.pid + '.' + Date.now() + '.tmp';
            try {
              fs.writeFileSync(temporary, JSON.stringify(freshSnapshot, null, 2) + '\n', {
                encoding: 'utf8', flag: 'wx', mode: 0o600,
              });
              fs.renameSync(temporary, snapshotFile);
            } catch {
              error = 'snapshot_publish_failed';
              try { fs.unlinkSync(temporary); } catch {}
            }
          }
        }
        const result = {
          ok: !error && exitCode === 0 && Boolean(freshSnapshot),
          cached: false,
          exited,
          exitCode: Number.isInteger(exitCode) ? exitCode : null,
          error: error || (freshSnapshot ? null : 'no_fresh_snapshot'),
          elapsedMs: Date.now() - startedAt,
          observations,
          snapshot: error ? undefined : freshSnapshot || undefined,
          finishedAt: new Date().toISOString(),
          usageSentAt: sentAt === null ? null : new Date(sentAt).toISOString(),
        };
        const receiptTemp = receiptFile + '.' + process.pid + '.tmp';
        try {
          fs.writeFileSync(receiptTemp, JSON.stringify(result, null, 2) + '\n', { encoding: 'utf8', flag: 'wx', mode: 0o600 });
          fs.renameSync(receiptTemp, receiptFile);
        } catch { try { fs.unlinkSync(receiptTemp); } catch {} }
        resolve(result);
      }

      function stopOwnHelper(error) {
        if (stopping || settled) return;
        stopping = true;
        failure = error;
        if (exited) return finish(null, error);
        if (terminal) {
          // This PTY belongs only to our short helper. Its kill closes the
          // private console and its children, never shared worker consoles.
          try { terminal.kill(); } catch {
            try { process.kill(terminal.pid); } catch {}
          }
        }
        reap = setTimeout(() => finish(null, error), 1200);
      }

      function requestExit() {
        if (exitSentAt || !terminal || exited) return;
        exitSentAt = Date.now();
        // Close the usage overlay before issuing the builtin exit command.
        terminal.write('\x1b');
        setTimeout(() => {
          if (!exited && !settled) terminal.write('\x15/exit\r');
        }, 200);
        setTimeout(() => {
          if (!exited && !settled) terminal.write('\n');
        }, 900);
      }

      try {
        if (!fs.existsSync(CLI)) return finish(null, 'cli_unavailable');
        if (!fs.existsSync(CONSOLE)) return finish(null, 'console_unavailable');
        if (!fs.existsSync(REPOSITORIES)) return finish(null, 'repositories_unavailable');
        if (!fs.existsSync(settingsFile)) return finish(null, 'probe_settings_unavailable');
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        const expectedCollector = path.join(__dirname, 'usage-statusline.cjs').replace(/\\/g, '/');
        if (Object.keys(settings).length !== 1 || settings.statusLine?.type !== 'command'
            || typeof settings.statusLine.command !== 'string'
            || !settings.statusLine.command.includes(expectedCollector)
            || !settings.statusLine.command.includes('"claude-usage-probe-limits.json"')) {
          return finish(null, 'probe_settings_invalid');
        }
        // cmd /s /c removes the one outer quoted pair. Reject characters that
        // could expand or escape the fixed helper command even within quotes.
        if ([settingsFile, CLI, CONSOLE].some(value => /["&|<>^%!\r\n]/.test(value))) return finish(null, 'probe_settings_invalid');
        const commandLine = `/d /s /c ""${CLI}" --model opus --strict-mcp-config --tools "" --settings "${settingsFile}" --setting-sources """`;
        const helperEnv = { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' };
        delete helperEnv.NO_COLOR;
        const pty = require(runtime);
        // node-pty explicitly supports a pre-escaped Windows CommandLine string.
        terminal = pty.spawn(CONSOLE, commandLine, {
          name: 'xterm-256color', cols: 100, rows: 32,
          cwd: REPOSITORIES, env: helperEnv,
          useConpty: true, useConptyDll: true, conptyInheritCursor: false,
        });
      } catch { return finish(null, 'pty_launch_failed'); }

      terminal.onData((chunk) => {
        // Consume only booleans; no raw screen, account details or transcript is retained.
        observations.ttyBytes += Buffer.byteLength(chunk, 'utf8');
        observations.ttyChunks += 1;
        for (const char of chunk) for (const item of terminalQueries) {
          item.index = char === item.query[item.index]
            ? item.index + 1 : char === item.query[0] ? 1 : 0;
          if (item.index === item.query.length) {
            item.index = 0;
            observations[item.field] = true;
            terminal.write(item.reply);
          }
        }
        const text = chunk.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
          .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '');
        observations.ready ||= /Claude Code|Welcome|\/help/i.test(text);
        observations.loginRequired ||= /Please log in|Not logged in|login required|Select login method|How do you want to log in|\/login to|Sign in to/i.test(text);
        observations.usageFailed ||= /Showing last-known usage|failed to (?:load|fetch).*usage|Unable to fetch usage|usage endpoint.*rate.limit/i.test(text);
        observations.trustRequired ||= /Do you trust|trust this folder/i.test(text);
        observations.usageCommandSeen ||= /\/usage/.test(text);
        observations.unknownCommand ||= /Unknown command|unknown option|option.*argument missing/i.test(text);
        // Only fixed phrase matcher indices survive across chunks, never screen text.
        if (sentAt !== null) for (const incoming of text.toLowerCase()) {
          const char = /\s/.test(incoming) ? ' ' : incoming;
          if (char === ' ' && lastWasSpace) continue;
          lastWasSpace = char === ' ';
          for (const item of phrases) {
            item.index = char === item.phrase[item.index]
              ? item.index + 1 : char === item.phrase[0] ? 1 : 0;
            if (item.index === item.phrase.length) {
              observations[item.field] = true;
              item.index = 0;
            }
          }
        }
      });
      terminal.onExit(({ exitCode }) => {
        exited = true;
        finish(exitCode, failure || (exitCode === 0 ? null : 'helper_nonzero_exit'));
      });
      function sendUsage() {
        if (observations.loginRequired) return stopOwnHelper('login_required');
        if (observations.trustRequired) return stopOwnHelper('trust_required');
        if (exited || settled) return;
        sentAt = Date.now();
        observations.usageCommandSent = true;
        terminal.write('/usage\r');
      }
      start = setTimeout(sendUsage, 3000);
      poll = setInterval(() => {
        if (settled || exited || sentAt === null) return;
        if (observations.loginRequired) return stopOwnHelper('login_required');
        if (observations.trustRequired) return stopOwnHelper('trust_required');
        if (observations.unknownCommand) return stopOwnHelper('builtin_unavailable');
        if (observations.usageFailed) {
          failure = 'usage_request_failed';
          return requestExit();
        }
        observations.usageViewObserved ||= observations.resetSeen && observations.percentUsedSeen;
        const value = readSnapshot(probeSnapshotFile);
        if (value && Date.parse(value.observedAt) >= sentAt
            && observations.usageViewObserved && observations.usageCommandSent
            && Date.now() - sentAt >= 2000) {
          freshSnapshot = value;
          return requestExit();
        }
        // Dismiss the overlay after its builtin request has had time to return.
        // The official status line can repaint only once the dialog is dismissed.
        if (Date.now() - sentAt > 6000 && !exitSentAt) terminal.write('\x1b');
      }, 300);
      deadline = setTimeout(() => stopOwnHelper('probe_timeout'), TIMEOUT_MS);
    });
  }
  refresh.getState = () => ({ running: Boolean(inflight), lastError, lastSuccessAt, lastResult });
  return refresh;
}

module.exports = { createUsageRefresh };

if (require.main === module) {
  const root = process.argv[2] || path.resolve(__dirname, '..', '..');
  createUsageRefresh(root)({ force: process.argv.includes('--force') })
    .then((result) => { process.stdout.write(JSON.stringify(result) + '\n'); process.exitCode = result.ok ? 0 : 1; })
    .catch(() => { process.stdout.write('{"ok":false,"error":"refresh_failed"}\n'); process.exitCode = 1; });
}
