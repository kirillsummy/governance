import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const GOV = resolve(HERE, '..');
const PARTIAL = process.argv.includes('--partial');
const NO_REMOTE = process.argv.includes('--no-remote');

const WS_ARG = process.argv.find((a) => a.startsWith('--ws='));
function najtiWorkspace() {
  if (WS_ARG) return resolve(WS_ARG.slice(5));
  if (process.env.SUMMY_WS) return resolve(process.env.SUMMY_WS);
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
  branches: resolve(GOV, 'docs/branches.md'),
  money: resolve(GOV, 'contracts/money-dod.md'),
  architect: resolve(WS, 'context/agents/architect.md'),
  developer: resolve(WS, 'context/agents/developer.md'),
  release: resolve(WS, 'context/agents/release-engineer.md'),
  agentsSite: resolve(WS, 'website/AGENTS.md'),
  agentsCrm: resolve(WS, 'crm/AGENTS.md'),
  agentsBackend: resolve(WS, 'backend/AGENTS.md'),
  agentsCabinet: resolve(WS, 'master-app/AGENTS.md'),
  agentsClient: resolve(WS, 'client-app/AGENTS.md'),
  agentsRoot: resolve(WS, 'AGENTS.md'),
  glossary: resolve(GOV, 'GLOSSARY.md'),
};

const docs = {};
const absent = [];
for (const [k, p] of Object.entries(FILES)) {
  if (existsSync(p)) docs[k] = readFileSync(p, 'utf8');
  else { docs[k] = null; absent.push(`${k} (${p})`); }
}

function vetkiIzTablicy(branches) {
  const pairs = [];
  const lines = branches.split(/\r?\n/);
  const start = lines.findIndex((line) => /^\|\s*Репозиторий\s*\|/.test(line));
  if (start < 0 || !/^\|[\s:|-]+\|$/.test(lines[start + 1] ?? '')) return pairs;
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith('|')) break;
    const cells = line.split('|').map((s) => s.trim());
    const repo = (cells[1] || '').replaceAll('`', '').match(/^([a-z0-9-]+)$/);
    const base = (cells[2] || '').match(/`([^`]+)`/);
    if (repo && base) pairs.push([`kirillsummy/${repo[1]}`, base[1]]);
  }
  return pairs;
}

function gitText(value) {
  return value.replace(/\r\n/g, '\n');
}

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

  has(['charter', 'handoff'],
    'Агенту релиза: проверь независимую приёмку и поставь', 'финальная строка хендоффа');
  not(['charter', 'handoff', 'team', ...ALL_AGENTS],
    /Архитектору: смержи и выкати/, 'хендофф не просит выкатку');
  has(['charter'], 'Production — отдельное решение Кирилла',
    'выкатка — за владельцем');
  rules++;
  for (const k of ['handoff']) {
    if (d[k] === null) continue;
    if (!/Агенту релиза: проверь независимую приёмку и поставь[^\n]*commit <полный SHA>/.test(d[k]))
      errors.push(`финальная строка без (commit <полный SHA>) в ${FILES[k]}`);
  }

  has(['charter'], 'коммит заморожен', 'заморозка коммита (канон)');
  has(ALL_AGENTS, 'новыми коммитами', 'правки поверх новыми коммитами (памятки)');
  not(['charter', 'handoff', ...ALL_AGENTS],
    /отданную ветку не дописыва|ветка заморожена|новая правка = новая ветка/,
    'нет старой заморозки ветки');
  not(ALL_AGENTS, /[Нн]е удалять файлы[^.\n]*без явного указания/,
    'нет тотального запрета удаления файлов');

  not(['charter', 'architect'],
    /мерж в `dev`|мержит в `dev`|Ветка от <dev\|main>|только через\s+`dev`/,
    'нет захардкоженного dev');
  not(ALL_AGENTS, /пуш ветки \(не `dev`\/`main`\)|НЕ пушить в `dev`\/`main`/,
    'памятки не сужают запрет до dev/main');
  has(['branches'], 'в один момент её обновляет один\nназначенный ответственный',
    'защищённые ветки (каноническая политика)');
  has(['stub'], 'governance/AGENTS.md', 'памятка продукта ссылается на канон');
  has(['kickoff'], '[порядок работы](../ai/WORKFLOW.md)',
    'шаблон задачи ссылается на workflow');
  rules++;
  const PRODUCTS = [
    ['agentsCabinet', 'от свежей `test`', ['feature/react-client', 'dev', 'main']],
    ['agentsBackend', 'от свежей `test`', ['dev']],
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

  has(['charter'], 'Строивший не принимает своё', 'инвариант конвейера');
  has(['team', 'developer', 'release'], 'строивший не принимает своё',
    'инвариант конвейера');
  has(['team'], 'повторной проверки сценария', 'ретест перед закрытием');
  has(['release'], 'повторного прогона', 'ретест перед закрытием');
  has(['charter'], 'бизнес-решение принимает Кирилл', 'деньги — решение владельца');
  has(['team', 'developer'], 'архитектор готовит и проверяет',
    'деньги — решение владельца');
  not(['charter', 'team', 'developer'],
    /только через\s+согласование с владельцем(\/| или )архитектором/,
    'нет формулы «владелец ИЛИ архитектор» для денег');
  has(['agentsCabinet'], 'деньги считает БЭКЕНД', 'кабинет: деньги в бэкенде');
  not(['agentsCabinet'], /payout\.py` \+ \[docs/, 'кабинет не шлёт деньги в легаси');

  has(['agentsCrm'], 'но не устав', 'CRM: канон выше памятки');
  not(ALL_AGENTS, /этот `AGENTS\.md`[^\n]*побеждает\*\* —/,
    'памятка не выше устава');

  has(['charter'], 'Прежние файлы «эстафеты', 'эстафета: файл не команда');
  has(['charter'], 'не дают постоянного права на production', 'эстафета: без постоянного права');
  has(['charter'], 'Перенумерование — НОВЫМ коммитом', 'конфликт миграций: один процесс');
  not(['charter'], /merge-нод/, 'нет merge-ноды');

  rules++;
  rules++;
  {
    const izTablicy = d.branches === null ? [] : vetkiIzTablicy(d.branches);
    if (d.branches !== null && izTablicy.length < 4)
      errors.push(`таблица веток в docs/branches.md не распарсилась (строк: ${izTablicy.length}) — прибору не из чего вывести главные ветки`);
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
      if (kanonText !== null && gitText(readFileSync(kopiya, 'utf8')) !== gitText(kanonText))
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

  rules++;
  {
    const kanonStrazh = resolve(GOV, 'scripts/uzhe_proveren.py');
    const strazhText = existsSync(kanonStrazh) ? readFileSync(kanonStrazh, 'utf8') : null;
    if (strazhText === null)
      errors.push(`канонический страж отсутствует: ${kanonStrazh}`);
    for (const prod of ['backend', 'crm']) {
      const kopiya = resolve(WS, prod, 'scripts/uzhe_proveren.py');
      if (!existsSync(kopiya)) {
        errors.push(`страж «уже проверен» не заведён в ${prod}: нет scripts/uzhe_proveren.py (байт-в-байт копия канонического)`);
        continue;
      }
      if (strazhText !== null && gitText(readFileSync(kopiya, 'utf8')) !== gitText(strazhText))
        errors.push(`копия стража разъехалась с канонической: ${kopiya}`);
      const wfDir = resolve(WS, prod, '.github/workflows');
      const wired = existsSync(wfDir) && readdirSync(wfDir).some((f) => {
        try { return readFileSync(resolve(wfDir, f), 'utf8').includes('uzhe_proveren'); }
        catch { return false; }
      });
      if (!wired)
        errors.push(`страж «уже проверен» не проведён в CI ${prod}: в ${wfDir} нет вызова uzhe_proveren`);
    }
    for (const prod of ['website', 'master-app']) {
      if (existsSync(resolve(WS, prod, 'scripts/uzhe_proveren.py')))
        errors.push(`копия стража в ${prod} ЗАПРЕЩЕНА: страж дороже прогона (1.0/0.9 мин, посчитано 26.08); снятие запрета — новым замером через архитектора`);
    }
  }

  rules++;
  if (existsSync(resolve(WS, 'crm/knip.json')) && existsSync(resolve(WS, 'crm/knip.jsonc')))
    errors.push('у crm две настройки knip (knip.json И knip.jsonc) — младшая молча побеждает; оставить одну, knip.jsonc');

  return { errors, rules };
}

const IZLOMY = [
  ['инвариант конвейера',
    (d) => ({ ...d, charter: d.charter.replaceAll('Строивший не принимает своё', '') })],
  ['не распарсилась',
    (d) => ({ ...d, branches: d.branches.replaceAll('| Репозиторий |', '| Система |') })],
  ['финальная строка хендоффа',
    (d) => ({ ...d, handoff: d.handoff.replaceAll('Агенту релиза: проверь независимую приёмку и поставь', '') })],
];
let samoizlom = `самоизлом ${IZLOMY.length}/${IZLOMY.length}`;
if (docs.charter === null || docs.handoff === null || docs.branches === null) {
  samoizlom = 'самоизлом ПРОПУЩЕН (--partial без charter/handoff/branches)';
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
  console.error(`ДРЕЙФ КАНОНА — ${errors.length} проблем(ы) · ${samoizlom}:\n- ` + errors.join('\n- '));
  process.exit(1);
}
const note = absent.length ? ` · ПРОПУЩЕНО (--partial): ${absent.join(', ')}` : '';
const noteRemote = NO_REMOTE ? ' · ПРОПУЩЕНО (--no-remote): настройки репозиториев (главная ветка, автоснятие)' : '';
console.log(`канон согласован: правил ${rules}, файлов проверено ${checked}/${Object.keys(FILES).length} · ${samoizlom}${note}${noteRemote}`);
if (absent.length && PARTIAL) process.exit(2);
