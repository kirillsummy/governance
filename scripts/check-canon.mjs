// Сторож дрейфа канона: копии правил обязаны совпадать по ключевым фактам.
// Родился после трёх циклов внешнего ревью подряд, каждый из которых находил
// разъехавшиеся копии, пропущенные ручной синхронизацией.
//
// Запуск: node scripts/check-canon.mjs  (из корня governance; без зависимостей)
// Ролевые файлы живут вне этого репозитория (../context/agents) — если их нет
// рядом, они пропускаются с пометкой.
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

const FILES = {
  charter: 'CHARTER.md',
  team: 'roles/TEAM.md',
  handoff: 'templates/handoff.md',
  stub: 'templates/AGENTS-stub.md',
  kickoff: 'templates/kickoff.md',
  money: 'contracts/money-dod.md',
  architect: '../context/agents/architect.md',
  frontend: '../context/agents/frontend-lead.md',
  backend: '../context/agents/backend-lead.md',
  tester: '../context/agents/tester.md',
  devops: '../context/agents/devops.md',
};

const docs = Object.fromEntries(
  Object.entries(FILES).map(([k, p]) => [k, read(p)])
);
const missing = Object.entries(docs).filter(([, v]) => v === null).map(([k]) => k);

const errors = [];
const ok = [];

/** Правило: во всех перечисленных файлах фраза либо есть (mustHave), либо запрещена (mustNot). */
function mustHave(keys, phrase, label) {
  for (const k of keys) {
    if (docs[k] === null) continue;
    if (!docs[k].includes(phrase)) errors.push(`${label}: нет «${phrase}» в ${FILES[k]}`);
  }
  ok.push(label);
}
function mustNot(keys, regex, label) {
  for (const k of keys) {
    if (docs[k] === null) continue;
    const m = docs[k].match(regex);
    if (m) errors.push(`${label}: найдено «${m[0]}» в ${FILES[k]}`);
  }
  ok.push(label);
}

// 1. Финальная строка хендоффа — одна на все шаблоны, и она НЕ просит выкатку.
mustHave(['charter', 'handoff', 'stub', 'kickoff'],
  'проведи ревью и смержи', 'финальная строка хендоффа');
mustNot(['handoff', 'stub', 'kickoff', 'team', 'tester', 'frontend', 'backend', 'devops'],
  /Архитектору: смержи и выкати/, 'хендофф не просит выкатку');

// 2. Заморозка — коммита, не ветки.
mustHave(['charter', 'handoff'], 'коммит заморожен', 'заморозка коммита');
mustNot(['charter', 'handoff', 'stub', 'kickoff'],
  /отданную ветку не дописыва/, 'нет старой заморозки ветки');

// 3. Никаких голых «мерж в dev» вне таблицы веток: dev — частный случай.
mustNot(['charter', 'architect', 'stub', 'kickoff'],
  /мерж в `dev`|мержит в `dev`|Ветка от <dev\|main>/, 'нет захардкоженного dev');

// 4. Жизнь сигнала одинакова: закрывает тестировщик после повторного прогона.
mustHave(['team', 'tester'], 'повторного прогона', 'ретест перед закрытием');
mustNot(['charter', 'team', 'tester'],
  /«починили» или «отложили \+ почему»(?![\s\S]{0,200}повторн)/, 'нет старого закрытия сигнала');

// 5. Полномочия по деньгам: решение владельца, архитектор не замена.
mustHave(['team', 'backend'], 'решение владельца', 'деньги — решение владельца');
mustNot(['backend'], /через\s+согласование с владельцем или архитектором/, 'архитектор не заменяет владельца в деньгах');

// 6. Защищённые ветки: запрет без перечисления конкретных имён в памятках.
mustHave(['charter'], 'Пушить напрямую в защищённые ветки', 'запрет пуша в защищённые');
mustNot(['stub'], /не `dev`\/`main`/, 'памятка не сужает запрет до dev/main');

// 7. Выкатку разрешает только владелец — во всех местах, где про финал.
mustHave(['charter', 'handoff', 'stub', 'kickoff'],
  'владел', 'упоминание владельца в релизной цепочке');

const missNote = missing.length ? `\nПропущены (нет рядом): ${missing.join(', ')}` : '';
if (errors.length) {
  console.error(`ДРЕЙФ КАНОНА — ${errors.length} расхожд.:\n- ` + errors.join('\n- ') + missNote);
  process.exit(1);
}
console.log(`канон согласован: ${ok.length} правил, ${Object.keys(docs).length - missing.length} файлов` + missNote);
