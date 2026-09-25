import { readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR_ARG = process.argv.find((a) => a.startsWith('--dir='));
const ROOT = DIR_ARG ? resolve(DIR_ARG.slice(6)) : resolve(HERE, 'archive');
const TODAY_ARG = process.argv.find((a) => a.startsWith('--today='));

function parseDen(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return NaN;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  const ok = dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  return ok ? dt.getTime() : NaN;
}

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
