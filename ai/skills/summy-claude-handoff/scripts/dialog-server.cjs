'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createDialogData } = require('./dialog-data.cjs');
const { createGateway } = require('./dialog-messages.cjs');
const { createProcessMonitor } = require('./dialog-processes.cjs');

const MAX_BODY = 32 * 1024;
const STATIC = { '/dialog-client.js': path.join(__dirname, 'dialog-client.js') };

const STYLE = `*{box-sizing:border-box}body{margin:0;background:#0d1117;color:#e9edf2;font:15px/1.5 system-ui,Segoe UI,sans-serif}
main{max-width:880px;margin:auto;padding:20px}.message{overflow-wrap:anywhere;padding:17px 20px;border:1px solid #303947;border-radius:14px;margin-bottom:16px;background:#171e28}
.message.user{background:#192534;border-color:#33455e}.message.clarification{background:#1d2a1f;border-color:#3f5f44}
.role{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a9bfe0;margin-bottom:9px}.message.assistant .role{color:#d7b893}.message.clarification .role{color:#9fd8a6}
.empty{color:#a9b3c2;margin:30px 0}.content{overflow-wrap:anywhere}.content p{margin:0 0 .8em}.content p:last-child,.content ul:last-child,.content ol:last-child,.content pre:last-child{margin-bottom:0}
.content ul,.content ol{padding-left:1.5em;margin:.45em 0 1em}.content li{margin:.25em 0}.content h1,.content h2,.content h3{font-size:1.1em;margin:1em 0 .4em}
.content blockquote{border-left:3px solid #7890b2;margin:.8em 0;padding:.1em 0 .1em 1em;color:#bfcde1}.content code{font:0.9em/1.5 Consolas,monospace;background:#2b3442;border-radius:4px;padding:.1em .32em;color:#eacb9d}
.content pre{white-space:pre;overflow-x:auto;background:#0d141e;border:1px solid #394656;border-radius:9px;padding:12px;margin:.8em 0 1em}.content pre code{background:none;padding:0;color:#d9e6f3}.content a{color:#8ec5ff;text-decoration:underline}
button{border:1px solid #46556b;border-radius:8px;background:#25364d;color:#e9edf2;padding:8px 12px;cursor:pointer;font:inherit}button:disabled{opacity:.5;cursor:default}button:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #8ec5ff;outline-offset:3px}
dialog{max-width:min(700px,94vw);background:#171e28;color:#e9edf2;border:1px solid #46556b;border-radius:14px;padding:24px}dialog::backdrop{background:#0009}dialog pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0d1117;padding:14px;border-radius:8px}
#viewer-toolbar{position:sticky;top:0;z-index:2;background:#151b24;border-bottom:1px solid #303947}.viewer-session-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;max-width:1160px;margin:0 auto;padding:11px 20px}
#session-select{flex:0 1 540px;min-width:0;max-width:100%;background:#222a35;color:#e9edf2;border:1px solid #46556b;border-radius:7px;padding:7px 9px;font:13px/1.4 system-ui,Segoe UI,sans-serif}
#open-session{flex:none;padding:7px 10px;border-radius:7px;font-size:12px;white-space:nowrap}#connection{font-size:12px;color:#a5b8cc;margin-left:auto}#connection.is-error{color:#f0a08a}
#session-state{max-width:1160px;margin:0 auto;padding:0 20px 10px;font-size:12px;color:#c4ceda}
.viewer-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
#composer{position:sticky;bottom:0;background:#121924;border-top:1px solid #303947;padding:12px 20px 14px}#composer .inner{max-width:880px;margin:auto;display:flex;flex-direction:column;gap:8px}
#composer textarea{width:100%;min-height:72px;max-height:40vh;resize:vertical;background:#0d141e;color:#e9edf2;border:1px solid #46556b;border-radius:9px;padding:10px;font:14px/1.45 system-ui,Segoe UI,sans-serif}
#composer .row{display:flex;flex-wrap:wrap;align-items:center;gap:10px}#composer .hint{font-size:12px;color:#a5b8cc}#send-status{font-size:13px;color:#c4ceda}#send-status.is-error{color:#f0a08a}
#delivery{font-size:12px;color:#a5b8cc}#history{max-width:880px;margin:0 auto 12px}#history h2{font-size:13px;color:#a9bfe0;text-transform:uppercase;letter-spacing:.06em;margin:18px 0 8px}
.clarify{border:1px solid #33455e;border-radius:10px;padding:10px 12px;margin-bottom:8px;background:#151d29}.clarify .meta{font-size:12px;color:#a5b8cc;margin-bottom:6px}.clarify .text{white-space:pre-wrap;overflow-wrap:anywhere}
.clarify .answer{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px;border-top:1px solid #303947;padding-top:8px;color:#dfe6ee}.clarify .err{color:#f0a08a;margin-top:6px;font-size:13px}
@media(max-width:520px){main{padding:14px}#composer{padding:10px 12px}.viewer-session-controls{padding:10px 12px}}`;

function page(token, extraHead, extraTop, extraScripts) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="dialog-token" content="${token}"><title>Claude · диалог</title><style>${STYLE}</style>${extraHead || ''}</head><body>
<div id="viewer-toolbar"><div class="viewer-session-controls"><label class="viewer-sr-only" for="session-select">Сессия Claude и её состояние</label>
<select id="session-select" aria-label="Сессия Claude и её состояние"><option>Сессии…</option></select>
<button id="open-session" type="button" disabled>Перейти в сессию</button><span id="connection" role="status" aria-live="polite">Подключение…</span></div>
<div id="session-state" aria-live="polite"></div>${extraTop || ''}</div>
<dialog id="session-dialog"><h2>Продолжить разговор с Claude</h2><p id="session-note"></p><p>Откройте терминал, вставьте команду и нажмите Enter.</p><pre id="session-command"></pre>
<button id="copy-session" type="button">Скопировать команду</button> <button id="close-session" type="button">Закрыть</button><p id="copy-status" role="status"></p></dialog>
<main id="messages"></main><section id="history" aria-label="Уточнения выбранного потока"></section>
<form id="composer" autocomplete="off"><div class="inner"><label for="clarify-text">Уточнение выбранному потоку Claude</label>
<textarea id="clarify-text" maxlength="8000" aria-describedby="clarify-hint delivery"></textarea>
<div class="row"><button id="send" type="submit">Отправить</button><span id="clarify-hint" class="hint">Enter — отправить, Shift+Enter — новая строка</span></div>
<div id="delivery"></div><div id="send-status" role="status" aria-live="polite"></div></div></form>
<script src="/dialog-client.js"></script>${extraScripts || ''}</body></html>`;
}

function send(response, status, body, headers = {}) {
  const json = typeof body === 'string' ? body : JSON.stringify(body);
  response.writeHead(status, { 'content-type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers });
  response.end(json);
}

function createDialogServer({ root, config = {}, port = 8770, host = '127.0.0.1', processes, spawnRunner, extension = {}, tickMs = 2000 }) {
  const monitor = processes || createProcessMonitor();
  const data = createDialogData(root, { processes: monitor });
  const gateway = createGateway({ root, data, processes: monitor, config, spawnRunner });
  const token = crypto.randomBytes(24).toString('base64url');
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  const origins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`]);
  const html = page(token, extension.head, extension.top, extension.scripts);
  const security = { 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" };

  function resumeCommand(state) {
    if (!state.sessionId || !config.cwd || ['working', 'unknown'].includes(state.status)) return '';
    return `cd ${config.cwd}\nclaude --resume ${state.sessionId} --model opus --effort high --permission-mode auto --strict-mcp-config`;
  }

  function readBody(request) {
    return new Promise((resolve, reject) => {
      const declared = Number(request.headers['content-length']);
      if (Number.isFinite(declared) && declared > MAX_BODY) { reject(Object.assign(new Error('Слишком большое тело запроса'), { status: 413 })); request.resume(); return; }
      const chunks = [];
      let size = 0;
      let tooBig = false;
      request.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_BODY) { tooBig = true; chunks.length = 0; return; }
        chunks.push(chunk);
      });
      request.on('end', () => {
        if (tooBig) { reject(Object.assign(new Error('Слишком большое тело запроса'), { status: 413 })); return; }
        try { resolve(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
        catch { reject(Object.assign(new Error('Тело запроса не в UTF-8'), { status: 400 })); }
      });
      request.on('error', reject);
    });
  }

  function tokenOk(value) {
    const given = Buffer.from(String(value || ''));
    const expected = Buffer.from(token);
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  }

  async function handle(request, response) {
    if (!hosts.has(String(request.headers.host || '').toLowerCase())) return send(response, 421, 'Недопустимый Host');
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (request.method === 'GET') {
      const origin = request.headers.origin;
      if (origin && !origins.has(origin)) return send(response, 403, 'Недопустимый Origin');
      if (url.pathname === '/') {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...security });
        return response.end(html);
      }
      if (STATIC[url.pathname]) {
        response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
        return response.end(fs.readFileSync(STATIC[url.pathname]));
      }
      if (url.pathname === '/api/sessions') return send(response, 200, data.sessions(gateway.owners));
      if (url.pathname === '/api/dialog') {
        const result = data.dialog(url.searchParams.get('session'), gateway.owners);
        if (!result) return send(response, 404, { error: 'Сессия не найдена в реестре' });
        return send(response, 200, { ...result, resumeCommand: resumeCommand(result) });
      }
      if (url.pathname === '/api/messages') {
        const result = gateway.list(url.searchParams.get('session'));
        return result ? send(response, 200, result) : send(response, 404, { error: 'Сессия не найдена в реестре' });
      }
      if (extension.routes && await extension.routes(request, url, response)) return undefined;
      return send(response, 404, 'Не найдено');
    }
    if (request.method === 'POST' && url.pathname === '/api/messages') {
      if (!origins.has(String(request.headers.origin || ''))) return send(response, 403, { error: 'Недопустимый Origin' });
      const site = request.headers['sec-fetch-site'];
      if (site && site !== 'same-origin') return send(response, 403, { error: 'Запрос не с этой страницы' });
      if (!tokenOk(request.headers['x-dialog-token'])) return send(response, 403, { error: 'Нет действующего ключа страницы — обновите окно' });
      if (!/^application\/json(\s*;\s*charset=utf-8)?$/i.test(String(request.headers['content-type'] || ''))) return send(response, 415, { error: 'Нужен JSON' });
      let body;
      try { body = JSON.parse(await readBody(request)); } catch (error) { return send(response, error.status || 400, { error: error.status ? error.message : 'Некорректный JSON' }); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return send(response, 400, { error: 'Некорректный запрос' });
      const keys = Object.keys(body);
      if (keys.some(key => !['session', 'id', 'text'].includes(key))) return send(response, 400, { error: 'Лишние поля запроса' });
      let result;
      try { result = gateway.create(body.session, body.id, body.text); } catch (error) { return send(response, 503, { error: String(error.message).slice(0, 200) }); }
      if (result.error) return send(response, result.status, { error: result.error });
      return send(response, result.status, { message: result.message, duplicate: result.duplicate === true, delivery: result.delivery || null });
    }
    return send(response, 405, 'Метод не поддерживается');
  }

  const server = http.createServer((request, response) => {
    handle(request, response).catch(error => {
      if (!response.headersSent) send(response, 500, { error: 'Внутренняя ошибка окна' });
      else response.end();
      process.stderr.write('dialog: ' + String(error && error.stack || error) + '\n');
    });
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;

  let ticker = null;
  function listen() {
    if (!processes) monitor.start();
    ticker = setInterval(() => { try { gateway.tick(); } catch {} }, tickMs);
    ticker.unref();
    return new Promise(resolve => server.listen(port, host, () => resolve(server)));
  }
  function close() {
    if (ticker) clearInterval(ticker);
    if (!processes) monitor.stop();
    return new Promise(resolve => server.close(() => resolve()));
  }

  return { server, listen, close, token, data, gateway };
}

function readConfig(file) {
  if (!file) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { return {}; }
}

module.exports = { createDialogServer, readConfig, MAX_BODY };
