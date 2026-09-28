const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Pass the local status directory explicitly; the Governance skill stays portable.
const root = path.resolve(process.argv[2] || process.cwd());
const statusPath = path.join(root, '.tmp', 'claude-status.json');
const host = '127.0.0.1';
const port = 8769;

function status() {
  let state = { task: 'SUM-119', phase: 'ожидание', summary: 'Claude пока не работает', milestones: [] };
  try { state = { ...state, ...JSON.parse(fs.readFileSync(statusPath, 'utf8')) }; } catch {}
  const actions = [];
  const byId = new Map();
  const log = typeof state.runLog === 'string' ? path.resolve(state.runLog) : '';
  if (log && log.startsWith(path.join(root, '.tmp') + path.sep)) {
    try {
      const file = fs.openSync(log, 'r');
      const size = fs.fstatSync(file).size;
      const length = Math.min(size, 192 * 1024);
      const buffer = Buffer.alloc(length);
      fs.readSync(file, buffer, 0, length, size - length);
      fs.closeSync(file);
      const lines = buffer.toString('utf8').split(/\r?\n/);
      for (const line of lines.slice(1)) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
            for (const item of event.message.content) {
              if (item.type !== 'tool_use' || typeof item.name !== 'string') continue;
              const action = describeAction(item);
              action.at = typeof event.timestamp === 'string' ? event.timestamp : null;
              actions.push(action);
              if (typeof item.id === 'string') byId.set(item.id, action);
            }
          }
          if (event.type === 'user' && Array.isArray(event.message?.content)) {
            for (const item of event.message.content) {
              if (item.type !== 'tool_result') continue;
              const action = byId.get(item.tool_use_id);
              if (action) action.result = item.is_error ? 'Ошибка' : 'Завершено';
            }
          }
        } catch {}
      }
    } catch {}
  }
  return { task: String(state.task), phase: String(state.phase), summary: String(state.summary), updatedAt: state.updatedAt || null, milestones: Array.isArray(state.milestones) ? state.milestones.slice(-12) : [], actions: actions.slice(-3).reverse(), logUpdatedAt: log && fs.existsSync(log) ? fs.statSync(log).mtime.toISOString() : null };
}

function describeAction(item) {
  const name = item.name;
  const command = typeof item.input?.command === 'string' ? item.input.command.trim() : '';
  const filePath = typeof item.input?.file_path === 'string' ? item.input.file_path : '';
  const target = safeTarget(command, filePath);
  let detail = 'Работа с проектом';
  if (name === 'Bash') {
    if (/\bgit\s+(status|diff|log|show)\b/i.test(command)) detail = 'Просмотр Git: статус, diff или история';
    else if (/\bgit\s+(add|commit)\b/i.test(command)) detail = 'Подготовка локального коммита';
    else if (/\bgit\s+(push|fetch|pull)\b/i.test(command)) detail = 'Работа с удалённой веткой Git';
    else if (/\b(rg|grep)\b/i.test(command)) detail = 'Поиск по коду';
    else if (/\b(python|node)\b/i.test(command)) detail = 'Запуск локального скрипта';
    else if (/\b(curl|Invoke-WebRequest)\b/i.test(command)) detail = 'Запрос к сервису';
    else detail = 'Команда терминала';
  } else if (name === 'Read') detail = 'Чтение исходного файла';
  else if (name === 'Write') detail = 'Запись исходного файла';
  else if (name === 'Edit' || name === 'MultiEdit') detail = 'Изменение исходного файла';
  else if (name === 'Glob' || name === 'Grep') detail = 'Поиск по проекту';
  else if (name === 'Task') detail = 'Работа с подзадачей';
  return { tool: name, detail, target, result: 'Выполняется', at: null };
}

function safeTarget(command, filePath) {
  const context = `${command} ${filePath}`.toLowerCase();
  let area = '';
  if (context.includes('sum119-backend') || context.includes('/backend/') || context.includes('\\backend\\')) area = 'Backend';
  if (context.includes('sum119-crm') || context.includes('/crm/') || context.includes('\\crm\\')) area = area ? 'Backend и CRM' : 'CRM';
  if (context.includes('/governance/') || context.includes('\\governance\\')) area = area ? `${area}, Governance` : 'Governance';
  if (!filePath || /(^|[\\/\.])(env|secret|token|key|credential|private|log)([\\/\.]|$)/i.test(filePath)) return area;
  const file = path.basename(filePath);
  if (!/^[\w.-]+\.(py|ts|tsx|md|sql|json)$/i.test(file)) return area;
  return area ? `${area} · ${file}` : file;
}

const page = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claude · SUMMY</title><style>
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#0b0d11;color:#f1f3f6;margin:0;padding:28px}main{max-width:850px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;gap:16px}h1{font-size:28px;margin:0}.tag{border-radius:999px;padding:7px 12px;background:#262b35;color:#dce5f5;font-size:13px}section{background:#15191f;border:1px solid #303640;border-radius:16px;padding:22px;margin-top:18px;box-shadow:0 4px 20px #0006}h2{font-size:14px;color:#a6b0bf;text-transform:uppercase;letter-spacing:.06em;margin:0 0 12px}#summary{font-size:20px;line-height:1.45;margin:0}.meta{color:#a6b0bf;font-size:13px}li{margin:10px 0;line-height:1.4}.actions{display:grid;gap:9px}.action{padding:12px 14px;border:1px solid #343b47;border-radius:10px;background:#1d232c;display:grid;grid-template-columns:90px 1fr auto;gap:12px;align-items:center}.tool{font-weight:700;color:#8db9ff}.detail{color:#eff2f7}.result{font-size:12px;color:#a6b0bf}.target{grid-column:2/-1;color:#a6b0bf;font-size:12px;margin-top:-7px}a{color:#8db9ff}@media(max-width:600px){body{padding:14px}h1{font-size:22px}.action{grid-template-columns:1fr auto}.detail{grid-column:1/-1;grid-row:2}.target{grid-column:1/-1;margin-top:0}}
</style></head><body><main><header><div><div class="meta">SUMMY · локальный статус</div><h1 id="title">Claude</h1></div><span class="tag" id="phase">Загрузка</span></header><section><h2>Сейчас</h2><p id="summary">Загрузка…</p><p class="meta" id="updated"></p></section><section><h2>Контрольные точки</h2><ol id="milestones"></ol></section><section><h2>Последние действия Claude</h2><div class="actions" id="actions"></div></section><p class="meta">Окно обновляется каждые 15 секунд · доступно только на этом компьютере</p></main><script>
const el=id=>document.getElementById(id);const put=(id,s)=>{el(id).textContent=s};async function tick(){try{const r=await fetch('/api/status',{cache:'no-store'});const s=await r.json();put('title','Claude · '+s.task);put('phase',s.phase);put('summary',s.summary);put('updated',s.updatedAt?'Обновлено: '+new Date(s.updatedAt).toLocaleString('ru-RU'):s.logUpdatedAt?'Последнее действие: '+new Date(s.logUpdatedAt).toLocaleString('ru-RU'):'Ожидание запуска');el('milestones').replaceChildren(...s.milestones.map(x=>{const li=document.createElement('li');li.textContent=String(x);return li}));el('actions').replaceChildren(...s.actions.map(x=>{const row=document.createElement('div');row.className='action';for(const [value,kind] of [[x.tool,'tool'],[x.detail,'detail'],[x.result,'result']]){const span=document.createElement('span');span.className=kind;span.textContent=String(value);row.append(span)}if(x.target||x.at){const more=document.createElement("span");more.className="target";more.textContent=[x.target,x.at?new Date(x.at).toLocaleTimeString("ru-RU"):null].filter(Boolean).join(" · ");row.append(more)}return row}));}catch{put('summary','Окно статуса временно недоступно')}}tick();setInterval(tick,15000);
</script></body></html>`;

http.createServer((request, response) => {
  if (request.url === '/api/status') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify(status()));
  } else if (request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    response.end(page);
  } else {
    response.writeHead(404); response.end();
  }
}).listen(port, host);
