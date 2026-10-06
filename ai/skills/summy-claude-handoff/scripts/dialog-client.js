(() => {
'use strict';

const list = document.getElementById('messages');
const history = document.getElementById('history');
const sessionSelect = document.getElementById('session-select');
const sessionButton = document.getElementById('open-session');
const sessionDialog = document.getElementById('session-dialog');
const sessionCommand = document.getElementById('session-command');
const connection = document.getElementById('connection');
const sessionState = document.getElementById('session-state');
const composer = document.getElementById('composer');
const textarea = document.getElementById('clarify-text');
const sendButton = document.getElementById('send');
const sendStatus = document.getElementById('send-status');
const delivery = document.getElementById('delivery');
const token = document.querySelector('meta[name="dialog-token"]')?.content || '';
const legacySelectionKey = 'summy-claude-dialog-session';
const selectionKey = 'summy-claude-dialog-session:v2';
const migratedKey = 'summy-claude-dialog-session:v2-migrated';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const labels = { working: 'Работает', waiting: 'Ждёт ответ', idle: 'Запуск завершён', failed: 'Ошибка запуска',
  stopped: 'Прервался', unknown: 'Состояние не проверено', offline: 'Не подключен' };
const sessionGroups = new Map([
  ['working', 'В работе'], ['waiting', 'Ждут ответа'], ['idle', 'Завершённые запуски'],
  ['failed', 'С ошибкой'], ['stopped', 'Прерванные'],
  ['unknown', 'Состояние не проверено'], ['offline', 'Не подключены'],
]);
const messageStates = { queued: 'В очереди работающего запуска', waiting: 'Ждёт возможности доставки', starting: 'Запускаем продолжение сессии',
  sending: 'Передаётся в CLI', sent: 'Передано в CLI, ждём квитанцию', acknowledged: 'Получено Claude (квитанция CLI)',
  answered: 'Получено и отвечено', failed: 'Не доставлено' };
const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const safeFormat = format => value => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? format.format(date) : '—';
};
const time = { format: safeFormat(timeFormat) };
const dateTime = { format: safeFormat(dateTimeFormat) };
const draftPrefix = 'summy-claude-dialog-draft:v2:';

let sessions = [];
let selectedId = '';
let generation = 0;
let previousDialog = '';
let previousHistory = '';
let savedSelection = '';
let draftId = '';
let draftText = '';
let draftSession = '';
let sending = false;
function readSelection() {
  try {
    const own = sessionStorage.getItem(selectionKey) || '';
    if (UUID.test(own)) return own;
    if (sessionStorage.getItem(migratedKey)) return '';
    sessionStorage.setItem(migratedKey, '1');
    const legacy = localStorage.getItem(legacySelectionKey) || '';
    if (UUID.test(legacy)) { sessionStorage.setItem(selectionKey, legacy); return legacy; }
  } catch {}
  return '';
}

function writeSelection(id) {
  try { sessionStorage.setItem(selectionKey, id); sessionStorage.setItem(migratedKey, '1'); } catch {}
}

savedSelection = readSelection();

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function inline(source) {
  const saved = [];
  const hold = html => `${saved.push(html) - 1}`;
  let value = escapeHtml(source);
  value = value.replace(/`([^`\n]+)`/g, (_, code) => hold(`<code>${code}</code>`));
  value = value.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)"']+)\)/g, (_, label, url) =>
    hold(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`));
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
  return value.replace(/(\d+)/g, (_, index) => saved[Number(index)]);
}

function markdown(source) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [], listType = '', items = [];
  const flushParagraph = () => { if (paragraph.length) { blocks.push(`<p>${inline(paragraph.join('\n')).replace(/\n/g, '<br>')}</p>`); paragraph = []; } };
  const flushList = () => { if (listType) { blocks.push(`<${listType}>${items.map(item => `<li>${inline(item)}</li>`).join('')}</${listType}>`); listType = ''; items = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})([^`]*)$/);
    if (fence) {
      flushParagraph(); flushList();
      const code = [], marker = fence[1][0], size = fence[1].length;
      while (++i < lines.length && !new RegExp('^\\s{0,3}' + (marker === '`' ? '`' : '~') + '{' + size + ',}\\s*$').test(lines[i])) code.push(lines[i]);
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
      listType = type; items.push(item[2]); continue;
    }
    if (listType && /^\s{2,}\S/.test(line)) { items[items.length - 1] += ' ' + line.trim(); continue; }
    flushList();
    const quote = line.match(/^\s{0,3}>\s?(.*)$/);
    if (quote) { flushParagraph(); blocks.push(`<blockquote>${inline(quote[1])}</blockquote>`); continue; }
    paragraph.push(line);
  }
  flushParagraph(); flushList();
  return blocks.join('');
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sessionLabel(session) {
  const task = Array.from(String(session.task || 'Claude').trim());
  return task.slice(0, 60).join('') + (task.length > 60 ? '…' : '');
}

function setConnection(text, error) {
  connection.textContent = text;
  connection.classList.toggle('is-error', !!error);
}

function newDraftId() {
  draftId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  draftText = '';
  draftSession = selectedId;
}

function savePendingDraft(session, id, text) {
  if (!UUID.test(session || '')) return;
  try { sessionStorage.setItem(draftPrefix + session, JSON.stringify({ session, id, text })); } catch {}
}

function clearPendingDraft(session) {
  if (!UUID.test(session || '')) return;
  try { sessionStorage.removeItem(draftPrefix + session); } catch {}
}

function restorePendingDraft(session) {
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(draftPrefix + session) || 'null'); } catch {}
  if (!saved || saved.session !== session || !UUID.test(saved.id || '') || typeof saved.text !== 'string') return false;
  draftId = saved.id;
  draftText = saved.text;
  draftSession = session;
  textarea.value = saved.text;
  sendStatus.textContent = 'Восстановлено неподтверждённое уточнение — отправка не создаст дубль.';
  return true;
}

function renderOptions(nextId) {
  const signature = JSON.stringify(sessions.map(session => [session.id, session.status, sessionLabel(session)]));
  if (sessionSelect.dataset.signature !== signature) {
    const focused = document.activeElement === sessionSelect;
    const groups = new Map();
    for (const session of sessions) {
      const status = sessionGroups.has(session.status) ? session.status : 'unknown';
      if (!groups.has(status)) groups.set(status, []);
      const option = element('option', '', sessionLabel(session));
      option.value = session.id;
      groups.get(status).push(option);
    }
    const nodes = [];
    for (const [status, label] of sessionGroups) {
      const options = groups.get(status);
      if (!options?.length) continue;
      const group = element('optgroup');
      group.label = label + ' (' + options.length + ')';
      group.append(...options);
      nodes.push(group);
    }
    sessionSelect.replaceChildren(...nodes);
    sessionSelect.dataset.signature = signature;
    if (focused) sessionSelect.focus();
  }
  sessionSelect.value = nextId;
  sessionSelect.disabled = !sessions.length;
}

function selectSession(id) {
  if (id === selectedId) return;
  selectedId = id;
  generation++;
  previousDialog = '';
  previousHistory = '';
  sessionButton.disabled = true;
  sessionCommand.textContent = '';
  sessionDialog.close();
  newDraftId();
  textarea.value = '';
  sendStatus.textContent = '';
  sendStatus.classList.remove('is-error');
  restorePendingDraft(id);
  list.replaceChildren(element('p', 'empty', id ? 'Загружаем выбранную сессию…' : 'Нет доступных сессий.'));
  history.replaceChildren();
  const session = sessions.find(item => item.id === id);
  document.title = session ? 'Claude · ' + session.task : 'Claude · SUMMY';
  updateComposer();
  if (id) {
    refreshDialog();
    refreshHistory();
  }
}

async function getJson(url) {
  const response = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } });
  if (!response.ok) throw Object.assign(new Error('HTTP ' + response.status), { status: response.status });
  return response.json();
}

async function refreshSessions() {
  try {
    const state = await getJson('/api/sessions');
    const seen = new Set();
    sessions = (Array.isArray(state.sessions) ? state.sessions : []).filter(session => {
      if (!session || !UUID.test(session.id || '') || seen.has(session.id)) return false;
      seen.add(session.id);
      return true;
    }).map(session => ({ ...session, task: String(session.task || 'Claude') }));
    const exists = id => sessions.some(session => session.id === id);
    if (selectedId && !exists(selectedId)) {
      sessions.push({ id: selectedId, task: 'Выбранный поток временно не найден в реестре', status: 'unknown' });
    }
    const nextId = selectedId || (exists(savedSelection) ? savedSelection : sessions[0]?.id || '');
    renderOptions(nextId);
    const note = state.processesError ? ' · процессы: ' + state.processesError : '';
    setConnection('Обновлено ' + time.format(new Date()) + note, !!state.processesError);
    selectSession(nextId);
    updateComposer();
  } catch (error) {
    setConnection('Нет связи с окном (' + String(error.message || error) + ') · ' + time.format(new Date()), true);
  }
}

function stateLine(state) {
  const parts = [labels[state.status] || labels.offline];
  if (state.statusNote) parts.push(state.statusNote);
  if (state.phase) parts.push('этап: ' + state.phase);
  if (state.runName) parts.push('запуск ' + state.runName + (state.managed ? ' (управляемый)' : ''));
  if (state.launchedAt) parts.push('начат ' + dateTime.format(new Date(state.launchedAt)));
  if (state.endedAt) parts.push('завершён ' + dateTime.format(new Date(state.endedAt)));
  if (state.statusUpdatedAt) parts.push('статус от ' + dateTime.format(new Date(state.statusUpdatedAt)));
  return parts.join(' · ');
}

async function refreshDialog() {
  if (!selectedId) return;
  const id = selectedId;
  const current = generation;
  try {
    const state = await getJson('/api/dialog?session=' + encodeURIComponent(id));
    if (id !== selectedId || current !== generation || state.id !== id) return;
    const session = sessions.find(item => item.id === id);
    if (session) Object.assign(session, { status: state.status, task: state.task || session.task, accepting: state.accepting });
    renderOptions(id);
    sessionState.textContent = stateLine(state);
    sessionButton.disabled = !state.resumeCommand;
    sessionCommand.textContent = state.resumeCommand || '';
    document.getElementById('session-note').textContent = state.status === 'working'
      ? 'Claude сейчас работает. Не продолжайте эту сессию в терминале параллельно — отправьте уточнение через поле внизу.'
      : 'Команда продолжит выбранную сессию с сохранённой историей.';
    const key = JSON.stringify([id, state.task, state.messages]);
    if (key === previousDialog) return;
    previousDialog = key;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 160;
    list.replaceChildren();
    if (!state.messages.length) list.append(element('p', 'empty', 'Пока нет сообщений.'));
    for (const message of state.messages) {
      const box = element('article', 'message ' + (['user', 'assistant', 'clarification'].includes(message.role) ? message.role : 'assistant'));
      box.append(element('div', 'role', message.role === 'user' ? 'Поручение' : message.role === 'clarification' ? 'Уточнение' : 'Claude'));
      const body = element('div', 'content');
      body.innerHTML = markdown(String(message.content || ''));
      box.append(body);
      list.append(box);
    }
    if (nearBottom) window.scrollTo(0, document.body.scrollHeight);
  } catch (error) {
    if (id !== selectedId || current !== generation) return;
    sessionState.textContent = 'Журнал сессии не прочитан: ' + String(error.message || error);
  }
}

function renderHistory(state) {
  const key = JSON.stringify(state);
  if (key === previousHistory) return;
  previousHistory = key;
  delivery.textContent = state.delivery ? state.delivery.text : '';
  history.replaceChildren();
  if (!state.messages.length) return;
  history.append(element('h2', '', 'Уточнения этого потока'));
  for (const message of [...state.messages].reverse()) {
    const box = element('article', 'clarify');
    const label = message.state === 'answered' && message.resultIsError ? 'Получено, но ход Claude завершился ошибкой' : messageStates[message.state] || message.state;
    const stamps = [label, 'создано ' + dateTime.format(new Date(message.createdAt))];
    if (message.ackAt) stamps.push('квитанция ' + time.format(new Date(message.ackAt)));
    if (message.answeredAt) stamps.push('ответ ' + time.format(new Date(message.answeredAt)));
    if (message.runName) stamps.push('запуск ' + message.runName);
    box.append(element('div', 'meta', stamps.join(' · ')));
    box.append(element('div', 'text', message.text));
    if (message.waitingReason && message.state === 'waiting') box.append(element('div', 'meta', message.waitingReason));
    if (message.note) box.append(element('div', 'meta', message.note));
    if (message.error) box.append(element('div', 'err', message.error));
    if (message.answer) box.append(element('div', 'answer', message.answer));
    history.append(box);
  }
}

async function refreshHistory() {
  if (!selectedId) return;
  const id = selectedId;
  const current = generation;
  try {
    const state = await getJson('/api/messages?session=' + encodeURIComponent(id));
    if (id !== selectedId || current !== generation) return;
    renderHistory(state);
  } catch {
    if (id === selectedId && current === generation) delivery.textContent = 'Очередь уточнений не прочитана';
  }
}

function updateComposer() {
  const enabled = !!selectedId && !sending;
  textarea.disabled = !selectedId;
  sendButton.disabled = !enabled || !textarea.value.trim();
}

async function submit() {
  if (sending || !selectedId) return;
  const id = selectedId;
  const text = textarea.value;
  if (!text.trim()) return;
  if (draftSession !== id || text !== draftText) {
    if (draftText || draftSession !== id) newDraftId();
    draftText = text;
  }
  const messageId = draftId;
  savePendingDraft(id, messageId, text);
  sending = true;
  updateComposer();
  sendStatus.classList.remove('is-error');
  sendStatus.textContent = 'Отправляем…';
  try {
    const response = await fetch('/api/messages', { method: 'POST', cache: 'no-store',
      headers: { 'content-type': 'application/json', 'x-dialog-token': token },
      body: JSON.stringify({ session: id, id: messageId, text }) });
    let body = {};
    try { body = await response.json(); } catch {}
    if (!response.ok) {
      if (response.status === 409 || response.status === 400) clearPendingDraft(id);
      throw new Error(body.error || 'HTTP ' + response.status);
    }
    clearPendingDraft(id);
    if (id === selectedId) {
      textarea.value = '';
      newDraftId();
      sendStatus.textContent = (body.duplicate ? 'Это уточнение уже было принято. ' : 'Принято окном. ')
        + (body.message && messageStates[body.message.state] ? messageStates[body.message.state] + '.' : '')
        + ' Получение подтверждается квитанцией CLI в истории ниже.';
      previousHistory = '';
      refreshHistory();
    }
  } catch (error) {
    sendStatus.classList.add('is-error');
    sendStatus.textContent = 'Не отправлено: ' + String(error.message || error) + '. Текст сохранён — повторная отправка не создаст дубль.';
  } finally {
    sending = false;
    updateComposer();
  }
}

composer.addEventListener('submit', event => { event.preventDefault(); submit(); });
textarea.addEventListener('input', updateComposer);
textarea.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !event.altKey) {
    event.preventDefault();
    submit();
  }
});
sessionSelect.addEventListener('change', () => {
  if (!sessions.some(session => session.id === sessionSelect.value)) return;
  savedSelection = sessionSelect.value;
  writeSelection(savedSelection);
  selectSession(sessionSelect.value);
});
sessionButton.addEventListener('click', () => sessionDialog.showModal());
document.getElementById('close-session').addEventListener('click', () => sessionDialog.close());
document.getElementById('copy-session').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(sessionCommand.textContent);
    document.getElementById('copy-status').textContent = 'Скопировано.';
  } catch {
    document.getElementById('copy-status').textContent = 'Выделите и скопируйте команду вручную.';
  }
});

newDraftId();
updateComposer();
refreshSessions();
setInterval(refreshSessions, 5000);
setInterval(refreshDialog, 2000);
setInterval(refreshHistory, 2000);
})();
