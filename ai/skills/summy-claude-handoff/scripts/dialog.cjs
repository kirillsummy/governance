const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

// Optional chat directory allows the Governance copy to run on this or another PC.
const root = path.resolve(process.argv[2] || path.resolve(__dirname, '..', '..'));
const temp = path.join(root, '.tmp');
const statusPath = path.join(temp, 'claude-status.json');
const summonPath = path.join(temp, 'codex-summon.json');
const reposRoot = process.env.SUMMY_REPOS_ROOT || path.join(os.homedir(), 'Documents', 'MyProjects', 'Summy');
let activeJob = null;

function json(response, code, value) {
  response.writeHead(code, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
  response.end(JSON.stringify(value));
}

function readSummon() {
  try {
    const job = JSON.parse(readText(summonPath));
    return job.status === 'working' && !activeJob ? { ...job, status: 'failed', error: 'Окно перезапускалось. Проверьте предыдущий сеанс Codex перед повтором.' } : job;
  } catch { return { status: 'idle' }; }
}

function saveSummon(value) {
  fs.mkdirSync(temp, { recursive: true });
  fs.writeFileSync(summonPath, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
}

function currentRun() {
  try {
    const state = JSON.parse(readText(statusPath));
    const runLog = typeof state.runLog === 'string' ? path.resolve(state.runLog) : '';
    if (!runLog.startsWith(temp + path.sep) || !runLog.endsWith('.jsonl') || !fs.existsSync(runLog)) return null;
    return { state, runLog, runSize: fs.statSync(runLog).size };
  } catch { return null; }
}

function codexBinary() {
  if (process.env.CODEX_CLI_PATH) return process.env.CODEX_CLI_PATH;
  const bundled = path.join(os.homedir(), 'AppData', 'Local', 'OpenAI', 'Codex', 'bin');
  try {
    const folders = fs.readdirSync(bundled, { withFileTypes: true }).filter(item => item.isDirectory());
    const found = folders.map(item => path.join(bundled, item.name, 'codex.exe')).find(file => fs.existsSync(file));
    if (found) return found;
  } catch {}
  return process.platform === 'win32' ? 'codex.exe' : 'codex';
}

function summonCodex() {
  const run = currentRun();
  if (!run) return { code: 409, body: { error: 'Нет журнала текущей сессии Claude.' } };
  const dialog = readDialog();
  if (dialog.status !== 'idle' || !dialog.messages.some(message => message.role === 'assistant')) {
    return { code: 409, body: { error: 'Claude ещё работает или не оставил ответ.' } };
  }
  if (activeJob) return { code: 202, body: activeJob };
  const previous = readSummon();
  if (previous.runLog === run.runLog && previous.runSize === run.runSize && previous.status === 'completed') {
    return { code: 200, body: previous };
  }
  if (!fs.existsSync(path.join(reposRoot, 'governance', 'AGENTS.md'))) {
    return { code: 503, body: { error: 'Не найден каталог репозиториев SUMMY.' } };
  }
  const startedAt = new Date().toISOString();
  const id = startedAt.replace(/[:.]/g, '-');
  const output = path.join(temp, `codex-summon-${id}.jsonl`);
  const errors = path.join(temp, `codex-summon-${id}.stderr.log`);
  const lastMessage = path.join(temp, `codex-summon-${id}.result.txt`);
  const job = { id, task: String(run.state.task || 'SUMMY'), runLog: run.runLog, runSize: run.runSize, status: 'working', startedAt };
  const prompt = [
    'Продолжи координацию проекта SUMMY после завершения Claude Code.',
    `Текущая задача: ${job.task}.`,
    `Прочитай статус ${statusPath} и итог текущего журнала ${run.runLog}.`,
    'Прочитай проектные AGENTS.md и навык skills/claude-summy/SKILL.md. Проверь факты и действующие полномочия перед дальнейшими действиями.',
    'Продолжай только в границах уже разрешённой задачи. Не считай отчёт Claude доказательством публикации или выкладки. Не раскрывай секреты и клиентские данные.',
    'Если нужно решение человека, точно сформулируй блокер в итоге. Не упоминай имя владельца в новых поручениях Claude.'
  ].join('\n');
  let child;
  let outFd;
  let errFd;
  try {
    outFd = fs.openSync(output, 'w', 0o600);
    errFd = fs.openSync(errors, 'w', 0o600);
    child = spawn(codexBinary(), ['exec', '--approve-for-me', '-s', 'workspace-write', '-C', root, '--add-dir', reposRoot, '--skip-git-repo-check', '--json', '-o', lastMessage, '-'], {
      cwd: root, windowsHide: true, stdio: ['pipe', outFd, errFd]
    });
    child.stdin.on('error', () => {});
    child.stdin.end(prompt);
  } catch (error) {
    return { code: 503, body: { error: `Не удалось запустить Codex CLI: ${error.message}` } };
  } finally {
    if (outFd !== undefined) fs.closeSync(outFd);
    if (errFd !== undefined) fs.closeSync(errFd);
  }
  activeJob = job;
  saveSummon(job);
  child.once('error', error => finish('failed', null, error.message));
  child.once('close', code => finish(code === 0 ? 'completed' : 'failed', code));
  function finish(status, exitCode, error) {
    if (activeJob !== job) return;
    job.status = status;
    job.exitCode = exitCode;
    job.endedAt = new Date().toISOString();
    if (error) job.error = error;
    saveSummon(job);
    activeJob = null;
  }
  return { code: 202, body: job };
}

function readText(file) {
  const bytes = fs.readFileSync(file);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.toString('utf16le').replace(/^\uFEFF/, '');
  return bytes.toString('utf8').replace(/^\uFEFF/, '');
}

function readDialog() {
  let state;
  try { state = JSON.parse(readText(statusPath)); } catch { return { task: 'Claude', status: 'offline', messages: [] }; }
  const phase = String(state.phase || '');
  const status = state.awaitingReply === true || /жд[её]т ответ|ожидает ответ|нужен ответ|блокер/i.test(phase)
    ? 'waiting'
    : state.claudeWorking === true ? 'working' : 'idle';
  const file = typeof state.runLog === 'string' ? path.resolve(state.runLog) : '';
  if (!file.startsWith(temp + path.sep) || !file.endsWith('.jsonl')) return { task: state.task || 'SUMMY', status, messages: [] };
  let lines;
  try { lines = readText(file).split(/\r?\n/); } catch { lines = []; }
  const messages = [];
  const seen = new Set();
  const promptFile = typeof state.promptFile === 'string' ? path.resolve(state.promptFile) : '';
  if (promptFile.startsWith(temp + path.sep) && /\.(txt|md)$/i.test(promptFile)) {
    try { messages.push({ role: 'user', content: readText(promptFile).trim() }); } catch {}
  }
  for (const line of lines) {
    if (!line) continue;
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'result' && typeof event.result === 'string') {
      messages.push({ role: 'assistant', content: event.result.trim() });
      continue;
    }
    if (!['user', 'assistant'].includes(event.type) || event.parent_tool_use_id) continue;
    const body = event.message;
    const id = body?.id || event.uuid;
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    const blocks = Array.isArray(body?.content) ? body.content : [];
    const content = blocks.filter(x => x.type === 'text' && typeof x.text === 'string').map(x => x.text).join('\n').trim();
    if (content) messages.push({ role: event.type, content });
  }
  return { task: String(state.task || 'SUMMY'), status, runLog: file, runSize: fs.existsSync(file) ? fs.statSync(file).size : 0, messages };
}

const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claude · диалог</title><style>
*{box-sizing:border-box}body{margin:0;background:#0d1117;color:#e9edf2;font:15px/1.5 system-ui,Segoe UI,sans-serif}header{position:sticky;top:0;background:#151b24;border-bottom:1px solid #303947;padding:15px 20px;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:12px}h1{font-size:19px;margin:0;font-weight:650;line-height:1.2}#status{flex:none;display:inline-flex;align-items:center;gap:8px;border:1px solid #3b4552;border-radius:999px;padding:6px 10px;font-size:12px;color:#c4ceda;background:#222a35}#status::before{content:'';width:7px;height:7px;border-radius:50%;background:#8290a3}#status.working::before{background:#67ce97;box-shadow:0 0 0 3px #67ce9722}#status.waiting::before{background:#efbb69}#status.offline::before{background:#9ca3af}main{max-width:880px;margin:auto;padding:20px}.message{white-space:pre-wrap;overflow-wrap:anywhere;padding:17px 20px;border:1px solid #303947;border-radius:14px;margin-bottom:16px;background:#171e28}.message.user{background:#192534;border-color:#33455e}.role{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a9bfe0;margin-bottom:9px}.message.assistant .role{color:#d7b893}.empty{color:#a9b3c2;margin:30px 0}@media(max-width:520px){header{padding:13px 14px}h1{font-size:17px}main{padding:14px}#status{font-size:11px}}
.message{white-space:normal}.content{overflow-wrap:anywhere}.content p{margin:0 0 .8em}.content p:last-child,.content ul:last-child,.content ol:last-child,.content pre:last-child{margin-bottom:0}.content ul,.content ol{padding-left:1.5em;margin:.45em 0 1em}.content li{margin:.25em 0}.content h1,.content h2,.content h3{font-size:1.1em;margin:1em 0 .4em}.content blockquote{border-left:3px solid #7890b2;margin:.8em 0;padding:.1em 0 .1em 1em;color:#bfcde1}.content code{font:0.9em/1.5 Consolas,monospace;background:#2b3442;border-radius:4px;padding:.1em .32em;color:#eacb9d}.content pre{white-space:pre;overflow-x:auto;background:#0d141e;border:1px solid #394656;border-radius:9px;padding:12px;margin:.8em 0 1em}.content pre code{background:none;padding:0;color:#d9e6f3}.content a{color:#8ec5ff;text-decoration:underline}</style></head><body><header><h1 id="title">Claude</h1><span id="status" class="offline" role="status">Не подключен</span></header><main id="messages"></main><script src="/dialog-client.js"></script></body></html>`;

http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/api/summon') {
    const origin = request.headers.origin;
    const host = request.headers.host;
    if (host !== '127.0.0.1:8770' || origin !== 'http://127.0.0.1:8770') {
      return json(response, 403, { error: 'Запрос разрешён только из локального окна Claude.' });
    }
    const result = summonCodex();
    return json(response, result.code, result.body);
  } else if (request.method === 'GET' && request.url === '/api/summon') {
    return json(response, 200, activeJob || readSummon());
  } else if (request.method === 'GET' && request.url === '/api/dialog') {
    response.writeHead(200, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
    response.end(JSON.stringify(readDialog()));
  } else if (request.url === '/dialog-client.js') {
    response.writeHead(200, {'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'});
    response.end(fs.readFileSync(path.join(__dirname, 'dialog-client.js')));
  } else if (request.url === '/') {
    response.writeHead(200, {'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
    response.end(page);
  } else { response.writeHead(404); response.end(); }
}).listen(8770, '127.0.0.1');
