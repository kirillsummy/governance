'use strict';

const fs = require('node:fs');
const readline = require('node:readline');

const args = process.argv.slice(2);
if (process.env.FAKE_CLAUDE_ARGS_FILE) fs.writeFileSync(process.env.FAKE_CLAUDE_ARGS_FILE, JSON.stringify(args));
const value = flag => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : ''; };
const sessionId = value('--resume') || value('--session-id');
const replay = args.includes('--replay-user-messages') && !process.env.FAKE_NO_REPLAY;
const echoOnReceipt = !!process.env.FAKE_ECHO_ON_RECEIPT;
const delay = Number(process.env.FAKE_DELAY_MS || 300);
const emit = event => process.stdout.write(JSON.stringify({ ...event, session_id: sessionId }) + '\n');

emit({ type: 'system', subtype: 'init', model: 'fake', permissionMode: 'auto', tools: [], mcp_servers: [] });
const queue = [];
let busy = false;
let ended = false;

function textOf(message) {
  const content = message && message.content;
  return Array.isArray(content) ? content.filter(x => x.type === 'text').map(x => x.text).join('\n') : String(content || '');
}

function echo(event) {
  if (replay) emit({ type: 'user', isReplay: true, uuid: event.uuid, message: event.message, parent_tool_use_id: null });
}

function finishTurn(text, uuid) {
  const id = 'msg_' + Math.random().toString(16).slice(2);
  const link = uuid && !process.env.FAKE_NO_RESULT_UUIDS ? { user_message_uuids: [uuid] } : {};
  emit({ type: 'assistant', uuid: 'u1' + id, message: { id, role: 'assistant', content: [{ type: 'thinking', thinking: '…' }] } });
  emit({ type: 'assistant', uuid: 'u2' + id, message: { id, role: 'assistant', content: [{ type: 'text', text }] } });
  emit({ type: 'result', subtype: 'success', is_error: false, result: text, ...link });
  if (uuid) emit({ type: 'command_lifecycle', command_uuid: uuid, state: 'completed' });
  emit({ type: 'system', subtype: 'background_tasks_changed' });
}

function next() {
  if (busy) return;
  const item = queue.shift();
  if (!item) { if (ended) setTimeout(() => process.exit(Number(process.env.FAKE_EXIT_CODE || 0)), 20); return; }
  busy = true;
  if (!echoOnReceipt) echo(item);
  setTimeout(() => {
    finishTurn('Ответ на: ' + textOf(item.message), item.uuid);
    busy = false;
    next();
  }, delay);
}

if (process.env.FAKE_NOTIFICATION && value('--resume')) {
  busy = true;
  setTimeout(() => {
    emit({ type: 'system', subtype: 'task_notification' });
    finishTurn('Фоновая задача завершилась');
    busy = false;
    next();
  }, 100);
}

readline.createInterface({ input: process.stdin }).on('line', line => {
  if (!line.trim()) return;
  const event = JSON.parse(line);
  if (event.type !== 'user') return;
  if (echoOnReceipt) echo(event);
  queue.push(event);
  next();
}).on('close', () => { ended = true; next(); });
