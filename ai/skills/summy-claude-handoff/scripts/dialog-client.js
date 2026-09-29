const list = document.getElementById('messages');
const badge = document.getElementById('status');
const labels = {idle:'Ждёт указаний',working:'Работает',waiting:'Ждёт ответ',offline:'Не подключен'};
let previous = '';

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
      role.textContent = message.role === 'user' ? 'Юра' : 'Claude';
      const body = document.createElement('div'); body.className = 'content';
      body.innerHTML = markdown(message.content);
      box.append(role, body); list.append(box);
    }
    if (nearBottom) window.scrollTo(0, document.body.scrollHeight);
  } catch { setStatus('offline'); }
}
refresh(); setInterval(refresh, 2000);
