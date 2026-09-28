const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Pass the local status directory explicitly; the Governance skill stays portable.
const root = path.resolve(process.argv[2] || process.cwd());
const statusPath = path.join(root, '.tmp', 'claude-status.json');
const host = '127.0.0.1';
const port = 8769;
const subscribers = new Set();

function status() {
  let state = { task: 'SUMMY', phase: 'Ожидание', summary: 'Claude пока не работает', milestones: [] };
  try { state = { ...state, ...JSON.parse(fs.readFileSync(statusPath, 'utf8')) }; } catch {}
  return {
    task: String(state.task),
    phase: String(state.phase),
    summary: String(state.summary),
    updatedAt: typeof state.updatedAt === 'string' ? state.updatedAt : null,
    milestones: Array.isArray(state.milestones) ? state.milestones.slice(-12) : [],
    claudeWorking: state.claudeWorking === true,
  };
}

const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claude · SUMMY</title><style>
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#0b0d11;color:#f1f3f6;margin:0;padding:28px}main{max-width:850px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;gap:16px}h1{font-size:28px;margin:0}.tag{border-radius:999px;padding:7px 12px;background:#262b35;color:#dce5f5;font-size:13px;display:inline-flex;align-items:center;gap:8px}.spinner{display:none;width:14px;height:14px;border:2px solid #71809a;border-top-color:#dce9ff;border-radius:50%}.tag.working .spinner{display:inline-block;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.tag.working .spinner{animation:none;border-top-color:#dce9ff}}section{background:#15191f;border:1px solid #303640;border-radius:16px;padding:22px;margin-top:18px;box-shadow:0 4px 20px #0006}h2{font-size:14px;color:#a6b0bf;text-transform:uppercase;letter-spacing:.06em;margin:0 0 12px}#summary{font-size:20px;line-height:1.45;margin:0}.meta{color:#a6b0bf;font-size:13px}li{margin:10px 0;line-height:1.4}a{color:#8db9ff}@media(max-width:600px){body{padding:14px}h1{font-size:22px}}
</style></head><body><main><header><div><div class="meta">SUMMY · локальный статус</div><h1 id="title">Claude</h1></div><span class="tag" id="phaseTag"><span class="spinner" aria-hidden="true"></span><span id="phase">Загрузка</span></span></header><section><h2>Сейчас</h2><p id="summary">Загрузка…</p><p class="meta" id="updated"></p></section><section><h2>Контрольные точки</h2><ol id="milestones"></ol></section><p class="meta">Страница обновляется при смене этапа · доступна только на этом компьютере</p></main><script>
const el=id=>document.getElementById(id);const put=(id,s)=>{el(id).textContent=s};function show(s){put('title','Claude · '+s.task);put('phase',s.phase);el('phaseTag').classList.toggle('working',s.claudeWorking===true);put('summary',s.summary);put('updated',s.updatedAt?'Обновлено: '+new Date(s.updatedAt).toLocaleString('ru-RU'):'Ожидание запуска');el('milestones').replaceChildren(...s.milestones.map(x=>{const li=document.createElement('li');li.textContent=String(x);return li}))}const events=new EventSource('/events');events.onmessage=e=>show(JSON.parse(e.data));events.onerror=()=>put('updated','Ожидание связи с локальным сервером');
</script></body></html>`;

function publishStatus() {
  const message = `data: ${JSON.stringify(status())}\n\n`;
  for (const response of subscribers) response.write(message);
}

fs.mkdirSync(path.dirname(statusPath), { recursive: true });
let pending;
fs.watch(path.dirname(statusPath), (_event, filename) => {
  if (filename && String(filename).toLowerCase() !== 'claude-status.json') return;
  clearTimeout(pending);
  pending = setTimeout(publishStatus, 200);
});

http.createServer((request, response) => {
  if (request.url === '/api/status') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify(status()));
  } else if (request.url === '/events') {
    response.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', connection: 'keep-alive' });
    subscribers.add(response);
    response.write(`data: ${JSON.stringify(status())}\n\n`);
    request.on('close', () => subscribers.delete(response));
  } else if (request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    response.end(page);
  } else {
    response.writeHead(404); response.end();
  }
}).listen(port, host);
