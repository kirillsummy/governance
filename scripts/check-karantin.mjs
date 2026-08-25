// Ворота карантина: срок несёт имя папки archive/karantin-do-ГГГГ-ММ-ДД
// (канон — governance/CHARTER.md, раздел «Карантин техдолга»).
// За 3 дня до срока — предупреждение, после срока — красное (exit 1):
// истёкший карантин не чистят молча — Релиз-инженер несёт владельцу опись,
// чистка только его словом. Сторож на сервере репо-карантин не видит,
// поэтому срок проверяют эти ворота на каждом пуше workspace (CI гоняет
// сначала излом, потом живой прогон — см. .github/workflows/karantin.yml).
//
// Запуск:  node check-karantin.mjs
// Излом:   node check-karantin.mjs --dir=<папка> --today=ГГГГ-ММ-ДД
import { readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR_ARG = process.argv.find((a) => a.startsWith('--dir='));
const ROOT = DIR_ARG ? resolve(DIR_ARG.slice(6)) : resolve(HERE, 'archive');
const TODAY_ARG = process.argv.find((a) => a.startsWith('--today='));

// Строгая календарная дата: «2026-02-30» не существует и не проходит,
// хотя Date.parse молча превратил бы её во 2 марта.
function parseDen(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return NaN;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  const ok = dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  return ok ? dt.getTime() : NaN;
}

// «Сегодня» — по Москве: бизнес-день экосистемы московский, а UTC-полночь
// отстаёт на три часа и задержала бы красное.
const today = TODAY_ARG
  ? TODAY_ARG.slice(8)
  : new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' });
const todayMs = parseDen(today);
if (Number.isNaN(todayMs)) {
  console.error(`КРАСНОЕ: «сегодня» = «${today}» — не календарная дата ГГГГ-ММ-ДД`);
  process.exit(1);
}

if (!existsSync(ROOT)) {
  console.log(`карантин: папок проверено 0 — каталога ${ROOT} нет, проверять нечего`);
  process.exit(0);
}

const dirs = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
// Кандидат — всё, что похоже на карантин, а не только идеально названное:
// опечатка вида karantin_do-… не должна выскальзывать из-под ворот молча.
const karantiny = dirs.filter((n) => n.toLowerCase().includes('karantin'));
let red = 0;
let warn = 0;

for (const name of karantiny) {
  const m = /^karantin-do-(\d{4}-\d{2}-\d{2})$/.exec(name);
  const srokMs = m ? parseDen(m[1]) : NaN;
  if (Number.isNaN(srokMs)) {
    console.error(
      `КРАСНОЕ: у карантина «${name}» не читается срок — имя обязано быть karantin-do-ГГГГ-ММ-ДД с существующей датой`
    );
    red++;
    continue;
  }
  const daysLeft = Math.floor((srokMs - todayMs) / 86400000);
  if (daysLeft < 0) {
    console.error(
      `КРАСНОЕ: карантин «${name}» истёк ${m[1]} — Релиз-инженер несёт владельцу опись, чистка только его словом`
    );
    red++;
  } else if (daysLeft <= 3) {
    console.warn(`предупреждение: карантину «${name}» осталось ${daysLeft} дн. (срок ${m[1]})`);
    warn++;
  } else {
    console.log(`ок: «${name}» — срок ${m[1]}, осталось ${daysLeft} дн.`);
  }
}

console.log(
  `карантин: проверено папок с «karantin» в имени ${karantiny.length} из ${dirs.length} в ${ROOT}; красных ${red}, предупреждений ${warn} (сегодня ${today})`
);
process.exit(red ? 1 : 0);
