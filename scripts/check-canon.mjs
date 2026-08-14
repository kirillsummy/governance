// Сторож дрейфа канона: копии правил обязаны совпадать по ключевым фактам.
// Fail-closed: отсутствие обязательного файла — ошибка, а не пропуск.
// Флаг --partial разрешает пропуски ТОЛЬКО для сознательной локальной
// проверки; в CI он запрещён.
//
// Запуск из любого места: node <путь>/check-canon.mjs
// Пути разрешаются от файла скрипта. Проверяются и ШАБЛОН памятки, и
// НАСТОЯЩИЕ продуктовые AGENTS.md в рабочем пространстве.
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
  frontend: resolve(WS, 'context/agents/frontend-lead.md'),
  backend: resolve(WS, 'context/agents/backend-lead.md'),
  tester: resolve(WS, 'context/agents/tester.md'),
  devops: resolve(WS, 'context/agents/devops.md'),
  // Настоящие продуктовые памятки — то, что читают облачные сессии.
  agentsSite: resolve(WS, 'summy.ru/AGENTS.md'),
  agentsCrm: resolve(WS, 'adminapp/AGENTS.md'),
  agentsBackend: resolve(WS, 'summy-data-gateway/AGENTS.md'),
  agentsCabinet: resolve(WS, 'masterapp-react/AGENTS.md'),
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
    if (m) errors.push(`${label}: найдено «${m[0].slice(0, 60)}» в ${FILES[k]}`);
  }
}

const ALL_AGENTS = ['agentsSite', 'agentsCrm', 'agentsBackend', 'agentsCabinet'];

// 1. Финальная строка хендоффа — просит ревью и мерж, не выкатку.
has(['charter', 'handoff', 'stub', 'kickoff', ...ALL_AGENTS],
  'проведи ревью и смержи', 'финальная строка хендоффа');
not(['charter', 'handoff', 'stub', 'kickoff', 'team', 'tester', 'frontend',
     'backend', 'devops', ...ALL_AGENTS],
  /Архитектору: смержи и выкати/, 'хендофф не просит выкатку');

// 2. Заморозка — коммита, не ветки.
has(['charter', 'handoff'], 'коммит заморожен', 'заморозка коммита (канон)');
not(['charter', 'handoff', 'stub', 'kickoff', ...ALL_AGENTS],
  /отданную ветку не дописыва/, 'нет старой заморозки ветки');

// 3. Никакого захардкоженного dev как универсальной базы.
not(['charter', 'architect', 'stub', 'kickoff'],
  /мерж в `dev`|мержит в `dev`|Ветка от <dev\|main>|только через\s+`dev`/,
  'нет захардкоженного dev');
not(ALL_AGENTS, /пуш ветки \(не `dev`\/`main`\)|не `dev`\/`main`/,
  'памятки не сужают запрет до dev/main');

// 4. Жизнь сигнала: закрывает тестировщик после повторного прогона.
has(['charter', 'team', 'tester'], 'повторного прогона', 'ретест перед закрытием');

// 5. Деньги/миграции: решение владельца; архитектор готовит, не заменяет.
has(['charter', 'team', 'backend'], 'архитектор готовит и проверяет',
  'деньги — решение владельца, архитектор не замена');
not(['charter', 'team', 'backend'],
  /только через\s+согласование с владельцем(\/| или )архитектором/,
  'нет формулы «владелец ИЛИ архитектор» для денег');

// 6. Защищённые ветки.
has(['charter'], 'Пушить напрямую в защищённые ветки', 'запрет пуша в защищённые (устав)');
has(['stub'], 'защищённую ветку продукта', 'запрет пуша в защищённые (памятка-шаблон)');

// 7. Выкатку разрешает только явная фраза владельца.
has(['charter', 'handoff', 'kickoff'], 'выкатку разрешает',
  'выкатка — за владельцем (точный маркер)');

// 8. Эстафета: файл не включает сам себя.
has(['charter'], 'Файл сам по себе эстафету не включает', 'эстафета включается командой владельца');

const checked = Object.values(docs).filter((v) => v !== null).length;
if (errors.length) {
  console.error(`ДРЕЙФ КАНОНА — ${errors.length} проблем(ы):\n- ` + errors.join('\n- '));
  process.exit(1);
}
const note = absent.length ? ` · ПРОПУЩЕНО (--partial): ${absent.join(', ')}` : '';
console.log(`канон согласован: правил ${rules}, файлов проверено ${checked}/${Object.keys(FILES).length}${note}`);
if (absent.length && PARTIAL) process.exit(2);
