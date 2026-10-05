'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { createDialogServer } = require('../dialog-server.cjs');
const { createDialogData } = require('../dialog-data.cjs');
const { createStore } = require('../dialog-store.cjs');

const RUNNER = path.join(__dirname, '..', 'claude-managed-runner.cjs');
const FAKE = path.join(__dirname, 'fake-claude.cjs');
const SID = '11111111-2222-4333-8444-555555555555';
const SID2 = '66666666-7777-4888-9999-aaaaaaaaaaaa';

function tempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'summy-dialog-'));
  fs.mkdirSync(path.join(root, '.tmp'));
  return root;
}

function writeLaunch(root, runName, fields) {
  const temp = path.join(root, '.tmp');
  fs.writeFileSync(path.join(temp, runName + '.launch.json'), JSON.stringify({ runName, runLog: path.join(temp, runName + '.jsonl'), ...fields }));
}

function fakeMonitor(initial = []) {
  const state = { list: initial, fresh: true, error: '', generation: 0 };
  return { state, current: () => ({ at: Date.now(), generation: ++state.generation, list: state.list, fresh: state.fresh, error: state.error }), start() {}, stop() {} };
}

function request(port, { method = 'GET', pathname = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: { host: `127.0.0.1:${port}`, ...headers } }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: response.statusCode, headers: response.headers, text, json });
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

async function startServer(root, monitor, extra = {}) {
  const port = 20000 + Math.floor(Math.random() * 20000);
  const instance = createDialogServer({ root, port, processes: monitor, config: { claude: FAKE, cwd: root }, tickMs: 100000, ...extra });
  await instance.listen();
  return { ...instance, port };
}

function post(instance, body, headers = {}) {
  return request(instance.port, { method: 'POST', pathname: '/api/messages', body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { origin: `http://127.0.0.1:${instance.port}`, 'content-type': 'application/json', 'x-dialog-token': instance.token, ...headers } });
}

async function waitFor(check, timeout = 15000) {
  const start = Date.now();
  for (;;) {
    const value = check();
    if (value) return value;
    if (Date.now() - start > timeout) throw new Error('timeout');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

test('реестр: последний запуск каждой сессии, стабильный id, реестр диспетчера', () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-old-20261004', { sessionId: SID, launchedAt: '2026-10-04T10:00:00Z', task: 'Старый' });
  writeLaunch(root, 'claude-new-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z', task: 'Новый' });
  fs.writeFileSync(path.join(root, '.tmp', 'claude-dispatch-x-20261005.json'), JSON.stringify({ streams: [
    { runName: 'claude-other-20261005', sessionId: SID2, task: 'Другой', launchedAt: '2026-10-05T11:00:00Z', runLog: path.join(root, '.tmp', 'claude-other-20261005.jsonl') }] }));
  writeLaunch(root, 'claude-nosession-20261005', { launchedAt: '2026-10-05T12:00:00Z' });
  const data = createDialogData(root, { processes: fakeMonitor() });
  const list = data.registry();
  assert.deepEqual(list.map(entry => entry.id), [SID2, SID]);
  assert.equal(list[1].latest.runName, 'claude-new-20261005');
  assert.equal(list[1].runs.length, 2);
});

test('состояние: по результату и живому процессу, а не по metadata', () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-run-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z', runnerPid: 4242 });
  const monitor = fakeMonitor([{ pid: 4242, name: 'powershell.exe', cmd: 'powershell -File run-claude-run-20261005.ps1', ticks: '' }]);
  const data = createDialogData(root, { processes: monitor });
  assert.equal(data.sessions().sessions[0].status, 'working');
  monitor.state.list = [{ pid: 4242, name: 'node.exe', cmd: 'node something-else.js', ticks: '' }];
  assert.equal(data.sessions().sessions[0].status, 'stopped');
  monitor.state.list = [{ pid: 999, name: 'claude.exe', cmd: `claude --resume ${SID} -p`, ticks: '' }];
  assert.equal(data.sessions().sessions[0].status, 'working');
  assert.equal(data.busyFor(SID).busy, true);
  monitor.state.list = [];
  monitor.state.fresh = false;
  monitor.state.error = 'нет данных';
  assert.equal(data.sessions().sessions[0].status, 'unknown');
  assert.equal(data.busyFor(SID).busy, true);
  monitor.state.fresh = true;
  fs.writeFileSync(path.join(root, '.tmp', 'claude-run-20261005.runner-result.json'), JSON.stringify({ exitCode: 0, endedAt: '2026-10-05T11:00:00Z' }));
  assert.equal(data.sessions().sessions[0].status, 'idle');
  assert.equal(data.busyFor(SID).busy, false);
});

test('защита loopback: Host, Origin, ключ, тип, размер, UTF-8, сессия, поля', async () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-run-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z' });
  const instance = await startServer(root, fakeMonitor());
  try {
    const page = await request(instance.port);
    assert.equal(page.status, 200);
    assert.match(page.headers['content-security-policy'], /script-src 'self'/);
    assert.ok(page.text.includes(instance.token));
    assert.equal((await request(instance.port, { headers: { host: 'evil.example:80' } })).status, 421);
    const ok = { session: SID, id: crypto.randomUUID(), text: 'Проверка' };
    assert.equal((await post(instance, ok, { origin: 'http://evil.example' })).status, 403);
    assert.equal((await post(instance, ok, { 'x-dialog-token': 'wrong' })).status, 403);
    assert.equal((await post(instance, ok, { 'sec-fetch-site': 'cross-site' })).status, 403);
    assert.equal((await post(instance, ok, { 'content-type': 'text/plain' })).status, 415);
    assert.equal((await post(instance, JSON.stringify({ ...ok, text: 'я'.repeat(20000) }))).status, 413);
    assert.equal((await post(instance, Buffer.from([0x7b, 0xff, 0xfe, 0x7d]))).status, 400);
    assert.equal((await post(instance, { ...ok, session: SID2 })).status, 404);
    assert.equal((await post(instance, { ...ok, path: 'C:/x' })).status, 400);
    assert.equal((await post(instance, { ...ok, text: '   ' })).status, 400);
    assert.equal((await post(instance, { ...ok, text: 'a\u0000b' })).status, 400);
    assert.equal((await post(instance, { ...ok, id: '../../x' })).status, 400);
    assert.equal((await request(instance.port, { pathname: '/api/messages?session=../../etc' })).status, 404);
  } finally { await instance.close(); }
});

test('идемпотентность: повтор не создаёт дубль, другой текст с тем же id отклонён', async () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-run-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z' });
  const instance = await startServer(root, fakeMonitor());
  try {
    const id = crypto.randomUUID();
    const first = await post(instance, { session: SID, id, text: 'Одно уточнение' });
    const second = await post(instance, { session: SID, id, text: 'Одно уточнение' });
    assert.equal(first.status, 201);
    assert.equal(second.status, 200);
    assert.equal(second.json.duplicate, true);
    assert.equal((await post(instance, { session: SID, id, text: 'Другое' })).status, 409);
    assert.equal(createStore(root).listMessages(SID).length, 1);
  } finally { await instance.close(); }
});

test('прежний запуск без stdin: уточнение ждёт, после завершения — ровно одно продолжение', async () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-legacy-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z', runnerPid: 5151 });
  const monitor = fakeMonitor([{ pid: 5151, name: 'powershell.exe', cmd: 'powershell -File run-claude-legacy-20261005.ps1', ticks: '' }]);
  const spawned = [];
  const instance = await startServer(root, monitor, { spawnRunner: args => { spawned.push(args); return 1; } });
  try {
    const response = await post(instance, { session: SID, id: crypto.randomUUID(), text: 'Подожди с публикацией' });
    assert.equal(response.json.message.state, 'waiting');
    assert.equal(response.json.delivery.mode, 'deferred');
    instance.gateway.tick();
    assert.equal(spawned.length, 0);
    monitor.state.list = [];
    fs.writeFileSync(path.join(root, '.tmp', 'claude-legacy-20261005.runner-result.json'), JSON.stringify({ exitCode: 0 }));
    instance.gateway.tick();
    instance.gateway.tick();
    assert.equal(spawned.length, 1);
    assert.ok(spawned[0].includes('--resume') && spawned[0].includes(SID));
    assert.ok(!spawned[0].includes('--dangerously-skip-permissions'));
    assert.equal(createStore(root).listMessages(SID)[0].state, 'starting');
  } finally { await instance.close(); }
});

test('сбой во время передачи: сообщение помечено «не доставлено» и не отправляется повторно', async () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-run-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z' });
  const store = createStore(root);
  const id = crypto.randomUUID();
  store.withMutex(SID, () => {
    store.writeOwner(SID, { runName: 'claude-dialog-crashed', runnerPid: 777777, accepting: true });
    store.createMessage(SID, id, 'Текст', 'sending', { runName: 'claude-dialog-crashed' });
  });
  const spawned = [];
  const instance = await startServer(root, fakeMonitor([]), { spawnRunner: args => { spawned.push(args); return 1; } });
  try {
    instance.gateway.tick();
    instance.gateway.tick();
    assert.equal(store.readMessage(SID, id).state, 'failed');
    assert.equal(store.readOwner(SID), null);
    assert.equal(spawned.length, 0);
  } finally { await instance.close(); }
});

test('управляемый запуск: уточнение во время работы, квитанция CLI, ответ, закрытие и перезапуск окна без повтора', async () => {
  const root = tempRoot();
  const temp = path.join(root, '.tmp');
  const prompt = path.join(temp, 'claude-probe-20261005.txt');
  fs.writeFileSync(prompt, 'Долгое поручение');
  const argsFile = path.join(root, 'args.json');
  const runner = spawn(process.execPath, [RUNNER, '--root', root, '--run', 'claude-probe-20261005', '--session-id', SID,
    '--prompt-file', prompt, '--claude', FAKE, '--cwd', root, '--no-tools'],
    { env: { ...process.env, FAKE_DELAY_MS: '1500', FAKE_CLAUDE_ARGS_FILE: argsFile, SUMMY_DIALOG_IDLE_CLOSE_MS: '700' }, stdio: 'ignore' });
  const monitor = fakeMonitor([{ pid: runner.pid, name: 'node.exe', cmd: `node claude-managed-runner.cjs --run claude-probe-20261005`, ticks: '' }]);
  const store = createStore(root);
  await waitFor(() => store.readOwner(SID) && store.readOwner(SID).accepting === true && fs.existsSync(path.join(temp, 'claude-probe-20261005.launch.json')));
  const instance = await startServer(root, monitor);
  const id = crypto.randomUUID();
  let exitCode;
  const exited = new Promise(resolve => runner.on('exit', code => { exitCode = code; resolve(); }));
  try {
    const response = await post(instance, { session: SID, id, text: 'Уточнение: используй вариант Б' });
    assert.equal(response.status, 201);
    assert.equal(response.json.message.state, 'queued');
    assert.equal(response.json.delivery.mode, 'live');
    await waitFor(() => store.readMessage(SID, id).state === 'acknowledged' || store.readMessage(SID, id).state === 'answered');
    const answered = await waitFor(() => { const message = store.readMessage(SID, id); return message.state === 'answered' && message; });
    assert.match(answered.answer, /вариант Б/);
    assert.ok(answered.history.some(item => item.state === 'sent'));
    await exited;
    assert.equal(exitCode, 0);
    assert.equal(store.readOwner(SID), null);
    const result = JSON.parse(fs.readFileSync(path.join(temp, 'claude-probe-20261005.runner-result.json'), 'utf8'));
    assert.equal(result.exitCode, 0);
    const args = JSON.parse(fs.readFileSync(argsFile, 'utf8'));
    for (const flag of ['--model', 'opus', '--effort', 'high', '--strict-mcp-config', '-p', '--permission-mode', 'auto',
      '--input-format', 'stream-json', '--output-format', 'stream-json', '--replay-user-messages', '--session-id', SID]) assert.ok(args.includes(flag), flag);
    assert.ok(!args.some(arg => /dangerously|bypass/i.test(arg)));
    const log = fs.readFileSync(path.join(temp, 'claude-probe-20261005.jsonl'), 'utf8');
    assert.equal(log.split('\n').filter(line => line.includes('"isReplay":true') && line.includes('вариант Б')).length, 1);
    const dialog = instance.data.dialog(SID);
    assert.ok(dialog.messages.some(message => message.role === 'clarification' && message.content.includes('вариант Б')));
    assert.equal(dialog.messages.filter(message => message.content === 'Долгое поручение').length, 1);
  } finally { await instance.close(); }
  const restarted = await startServer(root, fakeMonitor([]), { spawnRunner: () => { throw new Error('не должно запускаться'); } });
  try {
    restarted.gateway.tick();
    assert.equal(store.readMessage(SID, id).state, 'answered');
    assert.equal(fs.readFileSync(path.join(temp, 'claude-probe-20261005.jsonl'), 'utf8').split('\n').filter(line => line.includes('вариант Б') && line.includes('isReplay')).length, 1);
  } finally { await restarted.close(); }
});

test('свободная сессия: уточнение продолжает её управляемым запуском с --resume', async () => {
  const root = tempRoot();
  const temp = path.join(root, '.tmp');
  writeLaunch(root, 'claude-done-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z', runnerPid: 1, task: 'Окно Claude: исходная задача' });
  fs.writeFileSync(path.join(temp, 'claude-done-20261005.runner-result.json'), JSON.stringify({ exitCode: 0 }));
  const argsFile = path.join(root, 'args.json');
  const children = [];
  const spawnedArgs = [];
  const monitor = fakeMonitor([]);
  const instance = await startServer(root, monitor, { spawnRunner: args => {
    spawnedArgs.push(args);
    const child = spawn(process.execPath, [RUNNER, ...args], { env: { ...process.env, FAKE_DELAY_MS: '200', FAKE_CLAUDE_ARGS_FILE: argsFile, SUMMY_DIALOG_IDLE_CLOSE_MS: '400' }, stdio: 'ignore' });
    children.push(new Promise(resolve => child.on('exit', resolve)));
    return child.pid;
  } });
  const store = createStore(root);
  try {
    const id = crypto.randomUUID();
    const response = await post(instance, { session: SID, id, text: 'Продолжи: проверь отчёт' });
    assert.equal(response.json.delivery.mode, 'resume');
    instance.gateway.tick();
    assert.equal(children.length, 1);
    const answered = await waitFor(() => { const message = store.readMessage(SID, id); return message.state === 'answered' && message; });
    assert.match(answered.answer, /проверь отчёт/);
    await Promise.all(children);
    const args = JSON.parse(fs.readFileSync(argsFile, 'utf8'));
    assert.ok(args.includes('--resume') && args.includes(SID));
    await new Promise(resolve => setTimeout(resolve, 1100));
    const latest = instance.data.registry()[0].latest;
    assert.equal(latest.managed, true);
    assert.match(latest.runName, /^claude-dialog-11111111-/);
    assert.equal(spawnedArgs[0][spawnedArgs[0].indexOf('--task') + 1], 'Окно Claude: исходная задача');
    assert.equal(latest.task, 'Окно Claude: исходная задача');
    assert.equal(instance.data.sessions().sessions[0].task, 'Окно Claude: исходная задача');
    instance.gateway.tick();
    assert.equal(children.length, 1);
  } finally { await instance.close(); }
});

test('журнал прежнего запуска в UTF-16LE (перенаправление PowerShell) читается', () => {
  const root = tempRoot();
  const runLog = path.join(root, '.tmp', 'claude-legacy-20261005.jsonl');
  const lines = [
    { type: 'system', subtype: 'init', session_id: SID },
    { type: 'assistant', session_id: SID, message: { id: 'm1', content: [{ type: 'text', text: 'Промежуточный ответ' }] } },
    { type: 'result', session_id: SID, result: 'Итог работы' },
  ].map(line => JSON.stringify(line)).join('\r\n') + '\r\n';
  fs.writeFileSync(runLog, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(lines, 'utf16le')]));
  writeLaunch(root, 'claude-legacy-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z' });
  const data = createDialogData(root, { processes: fakeMonitor() });
  const dialog = data.dialog(SID);
  assert.deepEqual(dialog.messages.map(message => message.content), ['Промежуточный ответ', 'Итог работы']);
});

const { verifyRunner } = require('../dialog-processes.cjs');

test('проверка PID: пустая командная строка и только что начатый запуск — ждать; чужой процесс — не наш', () => {
  const snap = list => ({ fresh: true, at: Date.now(), generation: 1, list, error: '' });
  assert.equal(verifyRunner(snap([{ pid: 7, name: 'powershell.exe', cmd: '', ticks: '' }]), 7, { names: ['claude-x'] }), 'unknown');
  assert.equal(verifyRunner(snap([]), 7, { names: ['claude-x'], startedAt: Date.now() }), 'unknown');
  assert.equal(verifyRunner(snap([]), 7, { names: ['claude-x'], startedAt: Date.now() - 60000 }), 'dead');
  assert.equal(verifyRunner(snap([{ pid: 7, name: 'node.exe', cmd: 'node other.js', ticks: '' }]), 7, { names: ['claude-x'] }), 'foreign');
  assert.equal(verifyRunner(snap([{ pid: 7, name: 'node.exe', cmd: 'node r.cjs --run claude-x', ticks: '5' }]), 7, { names: ['claude-x'], ticks: '6' }), 'dead');
  assert.equal(verifyRunner({ ...snap([]), fresh: false }, 7, { names: ['claude-x'] }), 'unknown');
});

test('владелец считается завершённым только после двух снимков без него; недавний старт не снимается', async () => {
  const root = tempRoot();
  writeLaunch(root, 'claude-run-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z' });
  const store = createStore(root);
  const id = crypto.randomUUID();
  store.withMutex(SID, () => {
    store.writeOwner(SID, { runName: 'claude-dialog-live', runnerPid: 4321, startedAt: new Date().toISOString(), accepting: true });
    store.createMessage(SID, id, 'Текст', 'sent', { runName: 'claude-dialog-live' });
  });
  let generation = 1;
  const monitor = { current: () => ({ at: Date.now() - 1000, generation, list: [], fresh: true, error: '' }), start() {}, stop() {} };
  const instance = await startServer(root, monitor, { spawnRunner: () => { throw new Error('нельзя'); } });
  try {
    instance.gateway.tick();
    assert.equal(store.readMessage(SID, id).state, 'sent');
    store.withMutex(SID, () => store.writeOwner(SID, { ...store.readOwner(SID), startedAt: '2026-10-05T10:00:00Z' }));
    instance.gateway.tick();
    instance.gateway.tick();
    assert.equal(store.readMessage(SID, id).state, 'sent');
    assert.ok(store.readOwner(SID));
    generation = 2;
    instance.gateway.tick();
    assert.equal(store.readMessage(SID, id).state, 'failed');
    assert.equal(store.readOwner(SID), null);
  } finally { await instance.close(); }
});

test('недопустимый переход: ответ не перетирается поздним «передано»', () => {
  const root = tempRoot();
  const store = createStore(root);
  const id = crypto.randomUUID();
  store.withMutex(SID, () => {
    const { message } = store.createMessage(SID, id, 'Текст', 'answered');
    const after = store.updateMessage(SID, message, 'sent', {});
    assert.equal(after.state, 'answered');
  });
  assert.equal(store.readMessage(SID, id).state, 'answered');
});

test('продолжение после хода-уведомления: чужой результат не приписывается уточнению, runner закрывается несмотря на служебные события', async () => {
  const root = tempRoot();
  const temp = path.join(root, '.tmp');
  writeLaunch(root, 'claude-done-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z' });
  fs.writeFileSync(path.join(temp, 'claude-done-20261005.runner-result.json'), JSON.stringify({ exitCode: 0 }));
  const children = [];
  const instance = await startServer(root, fakeMonitor([]), { spawnRunner: args => {
    const child = spawn(process.execPath, [RUNNER, ...args], { env: { ...process.env, FAKE_DELAY_MS: '300', FAKE_NOTIFICATION: '1', FAKE_NO_RESULT_UUIDS: '1', SUMMY_DIALOG_IDLE_CLOSE_MS: '500' }, stdio: 'ignore' });
    children.push(new Promise(resolve => child.on('exit', resolve)));
    return child.pid;
  } });
  const store = createStore(root);
  try {
    const id = crypto.randomUUID();
    await post(instance, { session: SID, id, text: 'Уточнение после уведомления' });
    instance.gateway.tick();
    const answered = await waitFor(() => { const message = store.readMessage(SID, id); return message.state === 'answered' && message; });
    assert.match(answered.answer, /Уточнение после уведомления/);
    assert.equal(await Promise.race([children[0], new Promise(resolve => setTimeout(() => resolve('висит'), 10000))]), 0);
  } finally { await instance.close(); }
});

test('пустое поручение: runner не висит', async () => {
  const root = tempRoot();
  const prompt = path.join(root, '.tmp', 'claude-empty-20261005.txt');
  fs.writeFileSync(prompt, '   ');
  const runner = spawn(process.execPath, [RUNNER, '--root', root, '--run', 'claude-empty-20261005', '--session-id', SID,
    '--prompt-file', prompt, '--claude', FAKE, '--cwd', root], { stdio: 'ignore' });
  const code = await Promise.race([new Promise(resolve => runner.on('exit', resolve)), new Promise(resolve => setTimeout(() => resolve('висит'), 15000))]);
  assert.equal(code, 0);
});

test('продолжение без task: название потока наследуется от прежнего запуска той же сессии', async () => {
  const root = tempRoot();
  const temp = path.join(root, '.tmp');
  writeLaunch(root, 'claude-first-20261005', { sessionId: SID, launchedAt: '2026-10-05T10:00:00Z', task: 'Окно Claude: сообщения в поток' });
  fs.writeFileSync(path.join(temp, 'claude-first-20261005.runner-result.json'), JSON.stringify({ exitCode: 0 }));
  writeLaunch(root, 'claude-other-20261005', { sessionId: SID2, launchedAt: '2026-10-05T12:00:00Z', task: 'Чужая задача' });
  const prompt = path.join(temp, 'claude-dialog-11111111-20261005154830.txt');
  fs.writeFileSync(prompt, 'Продолжение');
  const runner = spawn(process.execPath, [RUNNER, '--root', root, '--run', 'claude-dialog-11111111-20261005154830', '--resume', SID,
    '--prompt-file', prompt, '--claude', FAKE, '--cwd', root], { env: { ...process.env, FAKE_DELAY_MS: '100', SUMMY_DIALOG_IDLE_CLOSE_MS: '300' }, stdio: 'ignore' });
  assert.equal(await new Promise(resolve => runner.on('exit', resolve)), 0);
  const launch = JSON.parse(fs.readFileSync(path.join(temp, 'claude-dialog-11111111-20261005154830.launch.json'), 'utf8'));
  assert.equal(launch.task, '');
  const data = createDialogData(root, { processes: fakeMonitor() });
  const session = data.sessions().sessions.find(item => item.id === SID);
  assert.equal(session.runName, 'claude-dialog-11111111-20261005154830');
  assert.equal(session.task, 'Окно Claude: сообщения в поток');
  assert.equal(data.dialog(SID).task, 'Окно Claude: сообщения в поток');
  assert.equal(data.taskFor(SID), 'Окно Claude: сообщения в поток');
  assert.equal(data.sessions().sessions.find(item => item.id === SID2).task, 'Чужая задача');
});
