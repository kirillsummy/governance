'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'dialog-client.js'), 'utf8');
const X = '11111111-2222-4333-8444-555555555555';
const Y = '66666666-7777-4888-9999-aaaaaaaaaaaa';
const Z = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

class FakeElement {
  constructor(id = '') {
    this.id = id; this.children = []; this.listeners = {}; this.dataset = {}; this.disabled = false;
    this.textContent = ''; this.innerHTML = ''; this.className = ''; this.value = '';
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  setAttribute(name, value) { (this.attributes ||= {})[name] = String(value); }
  insertBefore(node, before) { const index = this.children.indexOf(before); this.children.splice(index < 0 ? this.children.length : index, 0, node); }
  dispatch(type, event = {}) { for (const fn of this.listeners[type] || []) fn({ preventDefault() {}, ...event }); }
  replaceChildren(...nodes) { this.children = nodes; }
  append(...nodes) { this.children.push(...nodes); }
  close() {} showModal() {} focus() {}
  get options() { return this.children.flatMap(node => node.children.length ? node.children : [node]); }
}

function loadTab({ session, local, sessions, posts }) {
  const elements = new Map();
  const intervals = [];
  const created = [];
  const document = {
    title: '', activeElement: null, body: { scrollHeight: 0 },
    getElementById(id) { if (!elements.has(id)) elements.set(id, new FakeElement(id)); return elements.get(id); },
    querySelector: () => ({ content: 'token' }),
    createElement: () => { const node = new FakeElement(); created.push(node); return node; },
    addEventListener() {},
  };
  document.getElementById('connection').parentNode = new FakeElement();
  document.getElementById('open-session').parentNode = new FakeElement();
  document.getElementById('clarify-text').parentNode = new FakeElement();
  document.getElementById('session-select').parentNode = new FakeElement();
  const fetch = async (url, options = {}) => {
    if (options.method === 'POST') {
      posts.push(JSON.parse(options.body));
      return { ok: true, status: 201, json: async () => ({ message: { state: 'queued' } }) };
    }
    let body;
    if (url.startsWith('/api/sessions')) body = { sessions: sessions.map(value => typeof value === 'string'
      ? { id: value, task: 'Поток ' + value.slice(0, 4), status: 'working' } : value) };
    else if (url.startsWith('/api/dialog')) {
      const id = new URLSearchParams(url.split('?')[1]).get('session');
      const record = sessions.find(value => typeof value === 'object' && value.id === id);
      body = { id, status: record?.status || 'working', task: record?.task || 'Поток', endedAt: record?.endedAt, messages: [] };
    }
    else body = { delivery: { mode: 'resume', text: '' }, messages: [] };
    return { ok: true, status: 200, json: async () => body };
  };
  const context = vm.createContext({
    document, window: { innerHeight: 0, scrollY: 0, scrollTo() {}, addEventListener() {} }, fetch, sessionStorage: session, localStorage: local,
    navigator: {}, crypto: globalThis.crypto, Intl, URLSearchParams, setInterval: fn => { intervals.push(fn); return intervals.length; }, console,
  });
  vm.runInContext(SOURCE, context);
  return { select: document.getElementById('session-select'), textarea: document.getElementById('clarify-text'),
    composer: document.getElementById('composer'), refresh: () => intervals[0](),
    runHistory: created.find(node => node.className === 'run-history-list') };
}

const settle = () => new Promise(resolve => setTimeout(resolve, 30));

test('завершение выбранного потока сохраняет черновик и переносит название и время в историю', async () => {
  const sessions = [{ id: X, task: 'Длинное название потока', status: 'working' }, { id: Y, task: 'Другой поток', status: 'waiting' }];
  const tab = loadTab({ session: new FakeStorage(), local: new FakeStorage(), sessions, posts: [] });
  await settle();
  tab.textarea.value = 'Неотправленный черновик';
  sessions[0].status = 'idle';
  sessions[0].endedAt = '2026-10-06T13:00:00Z';
  await tab.refresh();
  await settle();
  assert.equal(tab.select.value, X);
  assert.equal(tab.textarea.value, 'Неотправленный черновик');
  assert.equal(tab.select.options[0].disabled, true);
  assert.equal(tab.runHistory.children[0].children[0].textContent, 'Длинное название потока');
  assert.notEqual(tab.runHistory.children[0].children[1].textContent, 'Время завершения не записано');
  assert.equal(tab.select.options.some(option => option.textContent === 'Длинное название потока'), false);
});

test('смена статуса переносит поток в другую группу и сохраняет выбранный поток', async () => {
  const sessions = [
    { id: X, task: 'Завершённый запуск', status: 'idle' },
    { id: Y, task: 'Текущая работа', status: 'working' },
    { id: Z, task: 'Неизвестный статус', status: 'future-status' },
  ];
  const session = new FakeStorage();
  session.setItem('summy-claude-dialog-session:v2', X);
  const tab = loadTab({ session, local: new FakeStorage(), sessions, posts: [] });
  await settle();
  assert.deepEqual(Array.from(tab.select.children).filter(group => group.label).map(group => group.label),
    ['В работе (1)', 'Состояние не проверено (1)']);
  assert.equal(tab.select.value, X);
  assert.equal(tab.select.children[1].children[0].textContent, 'Текущая работа');
  sessions[0].status = 'working';
  await tab.refresh();
  await settle();
  assert.deepEqual(Array.from(tab.select.children, group => group.label),
    ['В работе (2)', 'Состояние не проверено (1)']);
  assert.deepEqual(Array.from(tab.select.options, option => option.value), [X, Y, Z]);
  assert.equal(tab.select.value, X);
});

test('выбор потока у каждой вкладки свой: чужая вкладка и перезагрузка его не меняют', async () => {
  const local = new FakeStorage();
  local.setItem('summy-claude-dialog-session', Y);
  const sessions = [X, Y, Z];
  const posts = [];
  const tabA = new FakeStorage();
  const tabB = new FakeStorage();

  let a = loadTab({ session: tabA, local, sessions, posts });
  await settle();
  assert.equal(a.select.value, Y, 'однократная миграция прежнего общего ключа');
  a.select.value = X;
  a.select.dispatch('change');
  await settle();

  let b = loadTab({ session: tabB, local, sessions, posts });
  await settle();
  b.select.value = Z;
  b.select.dispatch('change');
  await settle();

  local.setItem('summy-claude-dialog-session', Y);
  a = loadTab({ session: tabA, local, sessions, posts });
  await settle();
  assert.equal(a.select.value, X, 'вкладка A после перезагрузки сохраняет свой выбор');
  b = loadTab({ session: tabB, local, sessions, posts });
  await settle();
  assert.equal(b.select.value, Z, 'вкладка B после перезагрузки сохраняет свой выбор');
  assert.equal(local.getItem('summy-claude-dialog-session'), Y, 'общий ключ больше не перезаписывается');

  const fresh = new FakeStorage();
  fresh.setItem('summy-claude-dialog-session:v2-migrated', '1');
  const c = loadTab({ session: fresh, local, sessions, posts });
  await settle();
  assert.equal(c.select.value, X, 'после миграции общий ключ не используется, берётся первый поток');
});

test('уточнение привязано к потоку на момент отправки, переключение не переносит черновик', async () => {
  const local = new FakeStorage();
  const posts = [];
  const tab = loadTab({ session: new FakeStorage(), local, sessions: [X, Y], posts });
  await settle();
  assert.equal(tab.select.value, X);
  tab.textarea.value = 'Текст для потока X';
  tab.select.value = Y;
  tab.select.dispatch('change');
  await settle();
  assert.equal(tab.textarea.value, '', 'черновик не переехал в другой поток');
  tab.composer.dispatch('submit');
  await settle();
  assert.equal(posts.length, 0);
  tab.textarea.value = 'Текст для потока Y';
  tab.composer.dispatch('submit');
  await settle();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].session, Y);
  assert.equal(posts[0].text, 'Текст для потока Y');
  tab.select.value = X;
  tab.select.dispatch('change');
  await settle();
  tab.textarea.value = 'Текст для потока Y';
  tab.composer.dispatch('submit');
  await settle();
  assert.equal(posts.length, 2);
  assert.equal(posts[1].session, X);
  assert.notEqual(posts[1].id, posts[0].id, 'новый id для другого потока');
});
