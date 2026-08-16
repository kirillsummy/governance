// Сторож дрейфа канона: копии правил обязаны совпадать по ключевым фактам.
// Fail-closed: отсутствие обязательного файла — ошибка. Флаг --partial
// разрешает пропуски только для сознательной локальной проверки; в CI запрещён.
// Проверяются канон, роли и НАСТОЯЩИЕ продуктовые AGENTS.md — структурными
// значениями (базовые/защищённые ветки, шаблон финальной строки), а не только
// фразами.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const GOV = resolve(HERE, '..');
const WS = resolve(GOV, '..');
const PARTIAL = process.argv.includes('--partial');

const FILES = {
  charter: resolve(GOV, 'CHARTER.md'),
  team: resolve(GOV, 'roles/TEAM.md'),
  handoff: resolve(GOV, 'templates/handoff.md'),
  stub: resolve(GOV, 'templates/AGENTS-stub.md'),
  kickoff: resolve(GOV, 'templates/kickoff.md'),
  money: resolve(GOV, 'contracts/money-dod.md'),
  architect: resolve(WS, 'context/agents/architect.md'),
  orchestrator: resolve(WS, 'context/agents/orchestrator.md'),
  frontend: resolve(WS, 'context/agents/frontend-lead.md'),
  backend: resolve(WS, 'context/agents/backend-lead.md'),
  tester: resolve(WS, 'context/agents/tester.md'),
  devops: resolve(WS, 'context/agents/devops.md'),
  agentsSite: resolve(WS, 'website/AGENTS.md'),
  agentsCrm: resolve(WS, 'crm/AGENTS.md'), // checkout на main
  agentsBackend: resolve(WS, 'backend/AGENTS.md'),
  agentsCabinet: resolve(WS, 'master-app/AGENTS.md'), // checkout на feature/react-client
  agentsClient: resolve(WS, 'client-app/AGENTS.md'),
  agentsRoot: resolve(WS, 'AGENTS.md'), // памятка-роутер рабочего пространства
  map: resolve(GOV, 'MAP.md'),
  glossary: resolve(GOV, 'GLOSSARY.md'),
};

const docs = {};
const absent = [];
for (const [k, p] of Object.entries(FILES)) {
  if (existsSync(p)) docs[k] = readFileSync(p, 'utf8');
  else { docs[k] = null; absent.push(`${k} (${p})`); }
}

const errors = [];
if (absent.length && !PARTIAL) {
  errors.push(...absent.map((a) => `обязательный файл отсутствует: ${a}`));
}

let rules = 0;
function has(keys, phrase, label) {
  rules++;
  for (const k of keys) {
    if (docs[k] === null) continue;
    if (!docs[k].includes(phrase)) errors.push(`${label}: нет «${phrase}» в ${FILES[k]}`);
  }
}
function not(keys, regex, label) {
  rules++;
  for (const k of keys) {
    if (docs[k] === null) continue;
    const m = docs[k].match(regex);
    if (m) errors.push(`${label}: найдено «${m[0].slice(0, 70)}» в ${FILES[k]}`);
  }
}

const ALL_AGENTS = ['agentsSite', 'agentsCrm', 'agentsBackend', 'agentsCabinet', 'agentsClient'];

// ── Хендофф и релиз ─────────────────────────────────────────────────────────
has(['charter', 'handoff', 'stub', 'kickoff', ...ALL_AGENTS],
  'проведи ревью и смержи', 'финальная строка хендоффа');
not(['charter', 'handoff', 'stub', 'kickoff', 'team', ...ALL_AGENTS],
  /Архитектору: смержи и выкати/, 'хендофф не просит выкатку');
has(['charter', 'handoff', 'kickoff'], 'выкатку разрешает',
  'выкатка — за владельцем');
rules++;
for (const k of ['handoff', 'stub', 'kickoff', ...ALL_AGENTS]) {
  if (docs[k] === null) continue;
  if (!/проведи ревью и смержи[^\n]*commit <полный SHA>/.test(docs[k]))
    errors.push(`финальная строка без (commit <полный SHA>) в ${FILES[k]}`);
}

// ── Заморозка коммита ───────────────────────────────────────────────────────
has(['charter', 'handoff'], 'коммит заморожен', 'заморозка коммита (канон)');
has(ALL_AGENTS, 'новыми коммитами', 'правки поверх новыми коммитами (памятки)');
not(['charter', 'handoff', 'stub', 'kickoff', ...ALL_AGENTS],
  /отданную ветку не дописыва|ветка заморожена|новая правка = новая ветка/,
  'нет старой заморозки ветки');
not(ALL_AGENTS, /[Нн]е удалять файлы[^.\n]*без явного указания/,
  'нет тотального запрета удаления файлов');

// ── Ветки: база и защищённые, без захардкоженного dev ───────────────────────
not(['charter', 'architect', 'stub', 'kickoff'],
  /мерж в `dev`|мержит в `dev`|Ветка от <dev\|main>|только через\s+`dev`/,
  'нет захардкоженного dev');
not(ALL_AGENTS, /пуш ветки \(не `dev`\/`main`\)|НЕ пушить в `dev`\/`main`/,
  'памятки не сужают запрет до dev/main');
has(['charter'], 'Пушить напрямую в защищённые ветки', 'запрет пуша (устав)');
has(['stub'], 'защищённую ветку продукта', 'запрет пуша (памятка-шаблон)');
rules++;
const PRODUCTS = [
  ['agentsCabinet', 'feature/react-client', ['feature/react-client', 'dev', 'main']],
  ['agentsBackend', 'от `dev`', ['dev', 'prod']],
];
for (const [key, baseMarker, prot] of PRODUCTS) {
  if (docs[key] === null) continue;
  if (!docs[key].includes(baseMarker))
    errors.push(`база веток: нет «${baseMarker}» в ${FILES[key]}`);
  for (const b of prot) {
    if (!docs[key].includes(b))
      errors.push(`защищённая ветка «${b}» не упомянута в ${FILES[key]}`);
  }
}

// ── Сигналы, деньги, полномочия ────────────────────────────────────────────
has(['charter', 'team', 'tester'], 'повторного прогона', 'ретест перед закрытием');
has(['charter', 'team', 'backend'], 'архитектор готовит и проверяет',
  'деньги — решение владельца');
not(['charter', 'team', 'backend'],
  /только через\s+согласование с владельцем(\/| или )архитектором/,
  'нет формулы «владелец ИЛИ архитектор» для денег');
has(['agentsCabinet'], 'деньги считает БЭКЕНД', 'кабинет: деньги в бэкенде');
not(['agentsCabinet'], /payout\.py` \+ \[docs/, 'кабинет не шлёт деньги в легаси');

// ── Иерархия документов ────────────────────────────────────────────────────
has(['agentsCrm'], 'но не устав', 'CRM: канон выше памятки');
not(ALL_AGENTS, /этот `AGENTS\.md`[^\n]*побеждает\*\* —/,
  'памятка не выше устава');

// ── Эстафета и миграции ────────────────────────────────────────────────────
has(['charter'], 'Файл сам по себе эстафету не включает', 'эстафета: файл не команда');
has(['charter'], 'commit SHA этого файла — идентификатор эстафеты', 'эстафета: SHA-идентификатор');
has(['orchestrator'], 'commit SHA файла-приказа', 'эстафета в роли оркестратора');
has(['charter'], 'перенумерование НОВЫМ коммитом', 'конфликт миграций: один процесс');
not(['charter'], /merge-нод/, 'нет merge-ноды');

const checked = Object.values(docs).filter((v) => v !== null).length;
if (errors.length) {
  console.error(`ДРЕЙФ КАНОНА — ${errors.length} проблем(ы):\n- ` + errors.join('\n- '));
  process.exit(1);
}
const note = absent.length ? ` · ПРОПУЩЕНО (--partial): ${absent.join(', ')}` : '';
console.log(`канон согласован: правил ${rules}, файлов проверено ${checked}/${Object.keys(FILES).length}${note}`);
if (absent.length && PARTIAL) process.exit(2);
