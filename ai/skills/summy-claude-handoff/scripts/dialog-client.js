const list = document.getElementById('messages');
const badge = document.getElementById('status');
const labels = {idle:'Ждёт указаний',working:'Работает',waiting:'Ждёт ответ',offline:'Не подключен'};
let previous = '';
let wasWorking = false;
const summon = document.createElement('button');
summon.type = 'button';
summon.textContent = 'Позвать Codex';
summon.title = 'Запустить Codex автоматически для текущей сессии Claude';
summon.style.cssText = 'display:none;margin-left:10px;padding:7px 11px;border:1px solid #58739a;border-radius:9px;background:#263850;color:#e9f2ff;cursor:pointer;font:inherit';
badge.after(summon);
summon.addEventListener('click', async () => {
  summon.disabled = true;
  summon.textContent = 'Запускаю Codex…';
  try {
    const response = await fetch('/api/summon', {method:'POST', headers:{'content-type':'application/json'}, body:'{}'});
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'Не удалось запустить Codex');
    renderSummon(result);
  } catch {
    summon.textContent = 'Ошибка запуска — повторить';
    summon.disabled = false;
  }
});

function renderSummon(job) {
  if (job.status === 'working') {
    summon.textContent = 'Codex работает';
    summon.disabled = true;
  } else if (job.status === 'completed') {
    summon.textContent = 'Codex завершил';
    summon.disabled = true;
  } else if (job.status === 'failed') {
    summon.textContent = 'Codex: ошибка — повторить';
    summon.disabled = false;
  } else {
    summon.textContent = 'Позвать Codex';
    summon.disabled = false;
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function inline(source) {
  const saved = [];
  const hold = html => `\uE000${saved.push(html)-1}\uE001`;
  let value = escapeHtml(source);
  value = value.replace(/`([^`\n]+)`/g, (_, code) => hold(`<code>${code}</code>`));
  value = value.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) =>
    hold(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`));
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
  return value.replace(/\uE000(\d+)\uE001/g, (_, index) => saved[Number(index)]);
}

function markdown(source) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [], listType = '', listItems = [];
  const flushParagraph = () => { if (paragraph.length) { blocks.push(`<p>${inline(paragraph.join('\n')).replace(/\n/g, '<br>')}</p>`); paragraph = []; } };
  const flushList = () => { if (listType) { blocks.push(`<${listType}>${listItems.map(item => `<li>${inline(item)}</li>`).join('')}</${listType}>`); listType = ''; listItems = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})([^`]*)$/);
    if (fence) {
      flushParagraph(); flushList();
      const code = [], marker = fence[1][0], size = fence[1].length;
      while (++i < lines.length && !new RegExp('^\\s{0,3}' + marker + '{' + size + ',}\\s*$').test(lines[i])) code.push(lines[i]);
      blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^\s{0,3}(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); blocks.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue; }
    const item = line.match(/^\s{0,3}([-*+]\s+|\d+\.\s+)(.+)$/);
    if (item) {
      flushParagraph();
      const type = /^\d/.test(item[1]) ? 'ol' : 'ul';
      if (listType && listType !== type) flushList();
      listType = type; listItems.push(item[2]); continue;
    }
    if (listType && /^\s{2,}\S/.test(line)) { listItems[listItems.length-1] += ' ' + line.trim(); continue; }
    flushList();
    const quote = line.match(/^\s{0,3}>\s?(.*)$/);
    if (quote) { flushParagraph(); blocks.push(`<blockquote>${inline(quote[1])}</blockquote>`); continue; }
    paragraph.push(line);
  }
  flushParagraph(); flushList();
  return blocks.join('');
}

function setStatus(value) { badge.className = value; badge.textContent = labels[value] || labels.offline; }
async function refresh() {
  try {
    const response = await fetch('/api/dialog', {cache:'no-store'});
    if (!response.ok) throw Error();
    const state = await response.json();
    setStatus(state.status);
    const hasReply = state.messages.some(message => message.role === 'assistant');
    summon.style.display = state.status === 'idle' && hasReply ? 'inline-block' : 'none';
    const summonResponse = await fetch('/api/summon', {cache:'no-store'});
    if (summonResponse.ok) {
      const job = await summonResponse.json();
      renderSummon(job.runLog === state.runLog && job.runSize === state.runSize ? job : {status:'idle'});
    }
    if (state.status === 'working') {
      wasWorking = true;
    } else if (wasWorking && state.status === 'idle') {
      wasWorking = false;
      document.title = 'Claude закончил · вернитесь в Codex';
    }
    const key = JSON.stringify({task:state.task,messages:state.messages});
    if (key === previous) return;
    previous = key;
    document.getElementById('title').textContent = state.task && state.task !== 'Claude' ? 'Claude · ' + state.task : 'Claude';
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 120;
    list.replaceChildren();
    if (!state.messages.length) {
      const p = document.createElement('p'); p.className = 'empty';
      p.textContent = state.status === 'offline' ? 'Нет связи с локальным журналом.' : 'Пока нет сообщений.';
      list.append(p);
    }
    for (const message of state.messages) {
      const box = document.createElement('article'); box.className = 'message ' + message.role;
      const role = document.createElement('div'); role.className = 'role';
      role.textContent = message.role === 'user' ? 'Поручение' : 'Claude';
      const body = document.createElement('div'); body.className = 'content';
      body.innerHTML = markdown(message.content);
      box.append(role, body); list.append(box);
    }
    if (nearBottom) window.scrollTo(0, document.body.scrollHeight);
  } catch { setStatus('offline'); }
}
refresh(); setInterval(refresh, 2000);
