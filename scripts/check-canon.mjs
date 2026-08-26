// Сторож дрейфа канона: копии правил обязаны совпадать по ключевым фактам.
// Fail-closed: отсутствие обязательного файла — ошибка. Флаг --partial
// разрешает пропуски только для сознательной локальной проверки; в CI запрещён.
// Проверяются канон, роли тройки (архитектор/разработчик/релиз-инженер) и
// НАСТОЯЩИЕ продуктовые AGENTS.md — структурными значениями (базовые и
// защищённые ветки, шаблон финальной строки), а не только фразами.
//
// ⚠️ Сторож читает РАБОЧЕЕ ДЕРЕВО по путям, а не origin: зелёное относится
// к состоянию ТВОЕГО диска на момент прогона. Отставшая копия даст зелёное
// о вчерашнем — 22.08.2026 «17/17 зелено» после мержа пяти памяток
// относилось к диску, где все пять отставали от origin. Перед прогоном
// подтяни копии (git pull в governance, context и продуктах) — иначе судишь
// не о том, что влито.
//
// Самоизлом: перед живым прогоном сторож трижды ломает сам себя (копию
// прочитанных документов, не файлы) и требует красного О СВОЁМ. Прибор
// доказывает себя при каждом прогоне, а не ждёт, пока кто-то вспомнит про
// излом (принцип ворот карантина; формулировка релиз-инженера 25.08).
// Ручной излом в тот же день сам оказался сломан — env PATH=/usr/bin убил
// node вместо gh, «упало» читалось как «сработало». Излом кодом так не врёт.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const GOV = resolve(HERE, '..');
const PARTIAL = process.argv.includes('--partial');
const NO_REMOTE = process.argv.includes('--no-remote');

// Где искать продукты и роли. По умолчанию — папка рядом с governance, но со
// «стола» (worktree в ~/Projects/SUMMY-desks) соседей нет, и сторож честно
// падал одиннадцатью «файл отсутствует». Столы должны работать полноценно:
// проверять канон надо там же, где его правишь, а не бегать в основную копию.
//   --ws=<путь>   явно
//   SUMMY_WS      переменной окружения
//   иначе         подъём вверх до папки, где лежат и governance, и context
const WS_ARG = process.argv.find((a) => a.startsWith('--ws='));
function najtiWorkspace() {
  if (WS_ARG) return resolve(WS_ARG.slice(5));
  if (process.env.SUMMY_WS) return resolve(process.env.SUMMY_WS);
  // Стол — это git-worktree: его `.git` не папка, а файл с указателем на
  // основную копию. По нему и находим настоящее рабочее пространство.
  const gitPath = resolve(GOV, '.git');
  if (existsSync(gitPath) && statSync(gitPath).isFile()) {
    const ukazatel = readFileSync(gitPath, 'utf8').trim();
    const sovpadenie = ukazatel.match(/^gitdir:\s*(.+?)\/\.git\/worktrees\//);
    if (sovpadenie) return resolve(sovpadenie[1], '..');
  }
  return resolve(GOV, '..');
}
const WS = najtiWorkspace();

const FILES = {
  charter: resolve(GOV, 'CHARTER.md'),
  team: resolve(GOV, 'roles/TEAM.md'),
  handoff: resolve(GOV, 'templates/handoff.md'),
  stub: resolve(GOV, 'templates/AGENTS-stub.md'),
  kickoff: resolve(GOV, 'templates/kickoff.md'),
  money: resolve(GOV, 'contracts/money-dod.md'),
  architect: resolve(WS, 'context/agents/architect.md'),
  developer: resolve(WS, 'context/agents/developer.md'),
  release: resolve(WS, 'context/agents/release-engineer.md'),
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

// Ожидания главных веток НЕ дублируются рукописным списком — выводятся из
// самой таблицы «Ветки» устава: вторая копия таблицы, которую держат руками,
// — тот же класс дрейфа этажом выше (находка релиз-инженера, 25.08).
function vetkiIzTablicy(charter) {
  const pairs = [];
  const m = charter.match(
    /\| Репозиторий \| База для веток[^\n]*\n\|[-| ]+\n((?:\|[^\n]*\n)+)/
  );
  if (!m) return pairs;
  for (const line of m[1].trim().split('\n')) {
    const cells = line.split('|').map((s) => s.trim());
    const repo = (cells[1] || '').match(/`(?:kirillsummy\/)?([a-z0-9-]+)`/);
    const base = (cells[2] || '').match(/`([^`]+)`/);
    if (repo && base) pairs.push([`kirillsummy/${repo[1]}`, base[1]]);
  }
  return pairs;
}

// Весь свод правил — одна функция от прочитанных документов: так сторож
// умеет судить и настоящий канон, и нарочно сломанную копию (самоизлом).
// Правила по файловой системе (карантин, knip) от docs не зависят и в
// самоизломе просто повторяются — лишнего красного они не дают.
function proverit(d, { noRemote }) {
  const errors = [];
  if (absent.length && !PARTIAL) {
    errors.push(...absent.map((a) => `обязательный файл отсутствует: ${a}`));
  }

  let rules = 0;
  function has(keys, phrase, label) {
    rules++;
    for (const k of keys) {
      if (d[k] === null) continue;
      if (!d[k].includes(phrase)) errors.push(`${label}: нет «${phrase}» в ${FILES[k]}`);
    }
  }
  function not(keys, regex, label) {
    rules++;
    for (const k of keys) {
      if (d[k] === null) continue;
      const m = d[k].match(regex);
      if (m) errors.push(`${label}: найдено «${m[0].slice(0, 70)}» в ${FILES[k]}`);
    }
  }

  const ALL_AGENTS = ['agentsSite', 'agentsCrm', 'agentsBackend', 'agentsCabinet', 'agentsClient'];

  // ── Хендофф и релиз ───────────────────────────────────────────────────────
  has(['charter', 'handoff', 'stub', 'kickoff', ...ALL_AGENTS],
    'проведи ревью и смержи', 'финальная строка хендоффа');
  not(['charter', 'handoff', 'stub', 'kickoff', 'team', ...ALL_AGENTS],
    /Архитектору: смержи и выкати/, 'хендофф не просит выкатку');
  has(['charter', 'handoff', 'kickoff'], 'выкатку разрешает',
    'выкатка — за владельцем');
  rules++;
  for (const k of ['handoff', 'stub', 'kickoff', ...ALL_AGENTS]) {
    if (d[k] === null) continue;
    if (!/проведи ревью и смержи[^\n]*commit <полный SHA>/.test(d[k]))
      errors.push(`финальная строка без (commit <полный SHA>) в ${FILES[k]}`);
  }

  // ── Заморозка коммита ─────────────────────────────────────────────────────
  has(['charter', 'handoff'], 'коммит заморожен', 'заморозка коммита (канон)');
  has(ALL_AGENTS, 'новыми коммитами', 'правки поверх новыми коммитами (памятки)');
  not(['charter', 'handoff', 'stub', 'kickoff', ...ALL_AGENTS],
    /отданную ветку не дописыва|ветка заморожена|новая правка = новая ветка/,
    'нет старой заморозки ветки');
  not(ALL_AGENTS, /[Нн]е удалять файлы[^.\n]*без явного указания/,
    'нет тотального запрета удаления файлов');

  // ── Ветки: база и защищённые, без захардкоженного dev ─────────────────────
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
    ['agentsBackend', 'от `dev`', ['dev']],
  ];
  for (const [key, baseMarker, prot] of PRODUCTS) {
    if (d[key] === null) continue;
    if (!d[key].includes(baseMarker))
      errors.push(`база веток: нет «${baseMarker}» в ${FILES[key]}`);
    for (const b of prot) {
      if (!d[key].includes(b))
        errors.push(`защищённая ветка «${b}» не упомянута в ${FILES[key]}`);
    }
  }

  // ── Сигналы, деньги, полномочия ──────────────────────────────────────────
  // Инвариант конвейера сторожится по слову канона «единственный инвариант,
  // который не сжимается». Найдено 20.08: удаление фразы сторож не замечал —
  // предохранитель, не покрывающий то, ради чего заведён, опаснее отсутствующего.
  has(['charter', 'team', 'developer', 'release'], 'строивший не принимает своё',
    'инвариант конвейера');
  has(['charter', 'team', 'release'], 'повторного прогона', 'ретест перед закрытием');
  has(['charter', 'team', 'developer'], 'архитектор готовит и проверяет',
    'деньги — решение владельца');
  not(['charter', 'team', 'developer'],
    /только через\s+согласование с владельцем(\/| или )архитектором/,
    'нет формулы «владелец ИЛИ архитектор» для денег');
  has(['agentsCabinet'], 'деньги считает БЭКЕНД', 'кабинет: деньги в бэкенде');
  not(['agentsCabinet'], /payout\.py` \+ \[docs/, 'кабинет не шлёт деньги в легаси');

  // ── Иерархия документов ──────────────────────────────────────────────────
  has(['agentsCrm'], 'но не устав', 'CRM: канон выше памятки');
  not(ALL_AGENTS, /этот `AGENTS\.md`[^\n]*побеждает\*\* —/,
    'памятка не выше устава');

  // ── Эстафета и миграции ──────────────────────────────────────────────────
  has(['charter'], 'Файл сам по себе эстафету не включает', 'эстафета: файл не команда');
  has(['charter'], 'commit SHA этого файла — идентификатор эстафеты', 'эстафета: SHA-идентификатор');
  has(['release'], 'commit SHA файла-приказа', 'эстафета в роли релиз-инженера');
  has(['charter'], 'перенумерование НОВЫМ коммитом', 'конфликт миграций: один процесс');
  not(['charter'], /merge-нод/, 'нет merge-ноды');

  // ── Главная ветка репозитория = базовая из таблицы «Ветки» ──────────────
  // Настройка живёт в GitHub, файлам не видна, а код раздаёт каждому клону:
  // у бэкенда главной стояла упразднённая prod, у master-app — main, где нет
  // даже папки web/ (оба случая 25.08). governance — не продукт и в таблице
  // не живёт, его пара статична. Прибор с тремя ответами: несовпадение —
  // ошибка; gh недоступен — «НЕ ПРОВЕРЕНА», тоже ошибка; пропуск только
  // явным --no-remote, и он виден в итоговой строке.
  //
  // Излом (рабочие формы, проверено релиз-инженером 25.08):
  //   (а) подмени базу в строке таблицы «Ветки» → сторож обязан покраснеть;
  //   (б) спрячь gh, ОСТАВИВ node:
  //       PATH="$(dirname "$(command -v node)"):/usr/bin" node scripts/check-canon.mjs
  //       Форма `env PATH=/usr/bin node …` негодна: на машине с fnm она убирает
  //       сам node — «env: node: No such file or directory» выглядит сработавшим
  //       изломом, но прибор даже не запускался. «Упало» ≠ «упало от того».
  rules++; // главная ветка = базовая из таблицы
  rules++; // автоснятие влитых веток включено (владельцу мусор «путает», 26.08)
  {
    const izTablicy = d.charter === null ? [] : vetkiIzTablicy(d.charter);
    if (d.charter !== null && izTablicy.length < 4)
      errors.push(`таблица «Ветки» в CHARTER.md не распарсилась (строк: ${izTablicy.length}) — прибору не из чего вывести главные ветки`);
    const DEFAULT_BRANCHES = [...izTablicy, ['kirillsummy/governance', 'main']];
    if (!noRemote) {
      for (const [repo, want] of DEFAULT_BRANCHES) {
        try {
          const got = JSON.parse(execSync(
            `gh repo view ${repo} --json defaultBranchRef,deleteBranchOnMerge`,
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
          ));
          if (got.defaultBranchRef.name !== want)
            errors.push(`главная ветка ${repo}: «${got.defaultBranchRef.name}», по таблице «${want}»`);
          if (got.deleteBranchOnMerge !== true)
            errors.push(`автоснятие влитых веток ВЫКЛЮЧЕНО у ${repo} — мусор копится по устройству; включение: gh repo edit ${repo} --delete-branch-on-merge`);
        } catch {
          errors.push(`главная ветка и автоснятие ${repo}: НЕ ПРОВЕРЕНЫ (gh недоступен) — это «не знаю», не «да»; сознательный пропуск = --no-remote`);
        }
      }
    }
  }

  // ── Карантин техдолга: ворота в каждом репозитории, где он завёлся ───────
  // Канон (CHARTER п.5) требовал «ворота CI репозитория» с 22.08, но прибора
  // не было: первый репо-карантин (crm#142) завёлся без ворот и тихо пережил
  // бы свой срок (находка релиз-инженера 25.08). Канонический прибор —
  // governance/scripts/check-karantin.mjs; в репозитории с карантином обязана
  // лежать его байт-в-байт копия в корне плюс проводка в CI. Копии не
  // держатся руками на веру — сверяются содержимым (урок рукописного
  // DEFAULT_BRANCHES того же дня). Чекаут без папки archive/ пропускается:
  // нет карантина — нет требования ворот.
  rules++;
  {
    const kanonPribor = resolve(GOV, 'scripts/check-karantin.mjs');
    const kanonText = existsSync(kanonPribor) ? readFileSync(kanonPribor, 'utf8') : null;
    if (kanonText === null)
      errors.push(`канонический прибор карантина отсутствует: ${kanonPribor}`);
    const REPO_DIRS = [WS, ...['website', 'crm', 'backend', 'master-app', 'client-app'].map((p) => resolve(WS, p))];
    for (const dir of REPO_DIRS) {
      const arch = resolve(dir, 'archive');
      if (!existsSync(arch)) continue;
      if (!readdirSync(arch).some((n) => n.toLowerCase().includes('karantin'))) continue;
      const kopiya = resolve(dir, 'check-karantin.mjs');
      if (!existsSync(kopiya)) {
        errors.push(`карантин в ${dir} без ворот: нет check-karantin.mjs (байт-в-байт копия governance/scripts/check-karantin.mjs)`);
        continue;
      }
      if (kanonText !== null && readFileSync(kopiya, 'utf8') !== kanonText)
        errors.push(`копия прибора карантина разъехалась с канонической: ${kopiya}`);
      const wfDir = resolve(dir, '.github/workflows');
      const wired = existsSync(wfDir) && readdirSync(wfDir).some((f) => {
        try { return readFileSync(resolve(wfDir, f), 'utf8').includes('check-karantin'); }
        catch { return false; }
      });
      if (!wired)
        errors.push(`ворота карантина не проведены в CI: в ${wfDir} нет прогона check-karantin`);
    }
  }

  // ── knip: настройка ровно одна ───────────────────────────────────────────
  // Две настройки не спорят вслух — Knip молча берёт knip.json вместо
  // knip.jsonc, исключения исчезают, и сторож мёртвого кода краснеет на
  // сотнях чужих мест: отказ, замаскированный под срабатывание — следующий
  // решит «сторож сломался» и выключит его целиком (crm, 25.08, находка
  // релиз-инженера).
  rules++;
  if (existsSync(resolve(WS, 'crm/knip.json')) && existsSync(resolve(WS, 'crm/knip.jsonc')))
    errors.push('у crm две настройки knip (knip.json И knip.jsonc) — младшая молча побеждает; оставить одну, knip.jsonc');

  return { errors, rules };
}

// ── Самоизлом: три поломки, каждая обязана дать красное О СВОЁМ ────────────
// Ломается копия прочитанных документов, не файлы на диске. Без gh: изломы
// файловые, сеть им не нужна. Ждём не «есть хоть какая-то ошибка», а ошибку
// именно сломанного правила: «упало» ≠ «упало от того».
const IZLOMY = [
  ['инвариант конвейера',
    (d) => ({ ...d, charter: d.charter.replaceAll('строивший не принимает своё', '') })],
  ['не распарсилась',
    (d) => ({ ...d, charter: d.charter.replace('| Репозиторий | База для веток', '| Репозиторий | Откуда') })],
  ['финальная строка хендоффа',
    (d) => ({ ...d, handoff: d.handoff.replaceAll('проведи ревью и смержи', '') })],
];
let samoizlom = `самоизлом ${IZLOMY.length}/${IZLOMY.length}`;
if (docs.charter === null || docs.handoff === null) {
  samoizlom = 'самоизлом ПРОПУЩЕН (--partial без charter/handoff)';
} else {
  for (const [zhdyom, slomat] of IZLOMY) {
    const { errors: e } = proverit(slomat(docs), { noRemote: true });
    if (!e.some((x) => x.includes(zhdyom))) {
      console.error(`САМОИЗЛОМ НЕ ПОКРАСНЕЛ («${zhdyom}») — сторож мёртв, живому зелёному верить нельзя`);
      process.exit(1);
    }
  }
}

const { errors, rules } = proverit(docs, { noRemote: NO_REMOTE });

const checked = Object.values(docs).filter((v) => v !== null).length;
if (errors.length) {
  console.error(`ДРЕЙФ КАНОНА — ${errors.length} проблем(ы):\n- ` + errors.join('\n- '));
  process.exit(1);
}
const note = absent.length ? ` · ПРОПУЩЕНО (--partial): ${absent.join(', ')}` : '';
const noteRemote = NO_REMOTE ? ' · ПРОПУЩЕНО (--no-remote): настройки репозиториев (главная ветка, автоснятие)' : '';
console.log(`канон согласован: правил ${rules}, файлов проверено ${checked}/${Object.keys(FILES).length} · ${samoizlom}${note}${noteRemote}`);
if (absent.length && PARTIAL) process.exit(2);
