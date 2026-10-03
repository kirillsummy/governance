# Production-кандидат RC7 — 03.10.2026 (BLOCKED)

Кандидат подготовлен после автономного пакета 02–03.10.2026 из всего готового
кода пяти продуктов, включая наработки других авторов и сессий. **Статус —
BLOCKED** двумя решениями (ниже). Prod не менялся: ни выкладки, ни записи в
рабочую БД Prod, ни движения production-веток и тегов. Release-карточка —
[SUM-211](https://summy.youtrack.cloud/issue/SUM-211).

Кандидат снят с работающих артефактов Dev 03.10.2026 03:12 МСК: VERSION, метки
`org.opencontainers.image.revision`, ревизия БД; они совпадают с головами
`test` на момент фиксации.

## Состав

| Продукт | Кандидат = `test` = Dev | Образ Dev (ID) | Prod сейчас (RC6) | Разница от Prod | Готовность |
|---|---|---|---|---|---|
| backend | `cb07bbf7ad541bda29af3700e15b2ee19289282c`, БД `0177_inventory_auto_assigned` | `sha256:aa8dbd60118d76801de225c127e33454af368151951cbf5b075aac07b1c1138b` | `8190e4b2902a013eaa5914d2005461247e80f473`, БД `0166_optional_manicure_closure` | 30 коммитов, 128 файлов (523uran523 23, Evgeniy 7) | BLOCKED: 2 теста цветов (B2) |
| CRM | `e39777d4de6b66f0911252c9ea784bdf490e60c6` | `sha256:f965e711a73a9c3ccc20e7dc772c5ac8cf9e061abd3abdeaec0ed4fd1cfa5dae` | `6f9c316a034f09dcac58d8412629bff497d000b8` | 54 коммита, 246 файлов (523uran523) | BLOCKED: карантин (B1) |
| master-app | `ec58c807eaccc364d6e583bd61a91ad692cb2bba` | `sha256:6eeb6f43d7e9f9f336daf8002036aa069df18a71e94f49f99f92ccbea837b204` | `fb76db82f760befdbb16472054a2bab917169c1c` | 27 коммитов, 42 файла (Evgeniy 21, 523uran523 6) | READY |
| client-app | `a733de288ce1a212b5651e0a2b4aed09d74d86bd` | `sha256:e22475cf56928e439e05de3916bc28ae01ef762d84e611b82bb0f22152a8b59c` | `c36f92c93583c21b1ec615fdf4a1f88de3354fdf`, поставлен неактивно | 14 коммитов, 17 файлов (523uran523 9, Evgeniy 5) | READY (на Prod — только поставка) |
| website | `88585f0e0372361e469fc091da64e5738d8bf856`, pm2 online | — (Next.js под pm2) | `ef6c6b013a2935c33b9e145c0f11b16db81a1d47` | 7 коммитов, 39 файлов (523uran523) | READY |

Production-ветки (`dev` `01bfa53`, `main` `fe2887a`, `feature/react-client`
`d67c5e8`, `main` `9a7e31d`, `main` `ff4435b`) — предки кандидата, движение
fast-forward. Других веток с готовыми уникальными изменениями нет:
`crm/claude/prod-sveta-processes` (`3f7795f`) уже входит в `test` и `main`.
Из `test` ничего не исключено.

## Включено

- **Пакет CRM** ([SUM-210](https://summy.youtrack.cloud/issue/SUM-210), [SUM-203](https://summy.youtrack.cloud/issue/SUM-203)):
  P02 (стерилизация вне общего списка, «Заявка на ремонт»), P03 (панель смены,
  часть), P04 (автокарточки, часть), P05, P06 (безопасная часть), P07 и заявки
  на перенос/отмену из календаря, P08 (происхождение записи), P09 (черновики),
  P10, P12, P13, P17 (ограниченно), P25 (без выбора мастером), SUM-10, SUM-111 P9
  (сервер), SUM-120, SUM-158, SUM-160, SUM-177 Э5 (источник не подключён).
- **Сайт** ([SUM-205](https://summy.youtrack.cloud/issue/SUM-205)): стабильные ID
  прайса SUM-163 и DEBT №1–3; SUM-162 (приватность сертификатов).
- **Ревью и скорость** ([SUM-207](https://summy.youtrack.cloud/issue/SUM-207)):
  индексы 0167, тоны 0168, сжатие BFF/client, уборка.
- **Другие авторы и сессии:** SUM-208 Евгения (клиент в стиле кабинета мастера,
  подтверждение визита, 0169), SUM-194 Евгения в master-app и backend, SUM-168
  (фотоштрафы v2 на read-only, выключено флагом), SUM-206 (UI-кит CRM/client,
  визуал кабинета в CRM, revert в client), SUM-209 (пазл в client-app), P24
  (баг-репорт CRM/клиента — без токена не отправляет).
- **Исправления подготовки RC7** (опубликованы в `test` и доставлены на Dev
  выпуском `rc7-fix-dev-20261003`): backend `cb07bbf` — 17 замечаний mypy, дата
  платформы вместо `None` для смены и зачёта наличных, снимки схемы до 0177,
  тест наличного вывода переведён на переимпорт суммы после SUM-10 и новый тест
  удержания; CRM `e39777d` — панель смены не требует справочника филиалов у
  ролей без смены, lint без ошибок; client-app `a733de2` — гонка теста
  занятого слота.

## Миграции

`0166_optional_manicure_closure` → `0177_inventory_auto_assigned`: 0167
read_path_speedup, 0168 process_status_tones, 0169 client_visit_confirmations,
0170 repair_request_label, 0171 accounting_payout_marks, 0172
marketing_campaign_drafts, 0173 document_library, 0174 client_cash_offset, 0175
paid_closing_exclusion, 0176 client_cycle_thresholds, 0177
inventory_auto_assigned. Аддитивные таблицы, индексы и витрины и правки данных
справочника видов процессов; 0167 снимает неиспользуемый GIN-индекс сырья.

**Репетиция на копии Prod** (03.10.2026 03:00–03:05 МСК, на сервере Prod в
одноразовом `postgres:18-alpine` во внутренней docker-сети; данные не покидали
сервер, рабочие контейнеры и БД Prod не менялись): ночной дамп
`summy-2026-10-02-0420.dump` (45 116 281 байт, sha256
`04d3d54b8e8a5d74f970dc3a073d52b9b23b6a51f044c8e5aae37d6884f4e6d0`)
восстановлен без ошибок; образ кандидата (ID выше) прошёл 0166 → 0177 за
≈60 с; 205 → 218 таблиц, потерь строк нет; подпись `repair`, первый статус
`inventory_check`, CHECK `client_cash`, невалидных индексов 0; API кандидата
ready, 21 проба без 5xx, 11 новых маршрутов в OpenAPI; **API RC6 на схеме
0177 отвечает так же, как на 0166** (откат кода без downgrade); downgrade до
0166 и повторный upgrade дают побайтово ту же схему; ресурсы удалены. Все 10
ворот пройдены.

## Проверки на точных SHA кандидата

| Продукт | Команды | Результат |
|---|---|---|
| backend `cb07bbf` | `app.api_contract`, `check_bff_contract.mjs`, `ruff check app tests`, `mypy app tests`, `vulture`, `deptry .`, `alembic upgrade head` с нуля (PostgreSQL 18), `app.schema_contract`, `db/verify.sql`, `pytest -n 4` (TZ=Europe/Moscow), денежные `pytest` (TZ=UTC) | всё exit 0, кроме pytest MSK: **2290 passed, 2 failed** — `test_type_appearances_are_from_the_set_and_never_repeat`, `test_posle_nakata_zhivye_vidy_razlichimy` (B2); UTC 258 passed |
| CRM `e39777d` | `check-karantin.mjs`, генераторы типов `--check`, `npm run lint`, `typecheck`, `knip`, `vitest`, `build` | всё exit 0, vitest **1696/1696**; **карантин exit 1** (B1) |
| master-app `ec58c80` | `typecheck`, `check:palette`, `vitest`, `knip`, `build`, `node --test bff/*.test.mjs` | всё exit 0, vitest 314/314, BFF 50/50 |
| client-app `a733de2` | `format:check`, `npm test` (vitest + server), `typecheck`, `build` | всё exit 0, 13/13 и 28/28 |
| website `88585f0` | `eslint`, палитра, `knip`, `check-pages`, `npm test`, `next build` | всё exit 0, 18/18 |

Сравнение с красной базой не применялось: кандидат с красными проверками не
считается готовым. Промежуточные прогоны до исправлений (backend `e6bdd8d`,
CRM `a9200ba`, client-app `84bf3e5`) выявили ошибки, исправленные выше.
Пользовательские сценарии после входа и HTTP-проверки Dev не проводились;
health/version Prod-артефактов проверяются в день выпуска.

## Блокеры

| № | Что | Адресат | Путь продолжения |
|---|---|---|---|
| B1 | Карантин CRM `archive/karantin-do-2026-09-24` истёк 24.09.2026, сторож CI красный; чистка — только словом владельца | Кирилл, [SUM-96](https://summy.youtrack.cloud/issue/SUM-96) № 76 | Слово владельца → удаление по описи со сверкой sha256 → `test` → Dev → повтор `check-karantin` и контура CRM |
| B2 | Краски `cleaning_defect`, `review_photo`, `duty`, `penalty_appeal` совпадают с соседними видами; два теста платформы красные; контракт палитры требует согласовать новые цвета | Юра, [SUM-97](https://summy.youtrack.cloud/issue/SUM-97) Q207-1 | Четыре согласованных цвета → миграция 0178 по образцу 0154 → `test` → Dev (миграция) → повтор pytest и репетиции 0166 → 0178 |

## Настройки и флаги

Env и секреты Prod кандидатом не меняются; ниже только имена. Остаются
выключенными: тестовый вход, заказы (`ORDERS_TEST_ENABLED`), клиентский портал
и вход client-app, Platform ID, выплаты наличными cash-v1, фото v2
(`PHOTO_PROOF_V2_ENABLED`), автозакрытие оплаченных. Изменения поведения на
Prod после выпуска: понедельничная автокарточка инвентаризации при открытии
смены администратором; задание `scheduled_processes` (интервал
`SYNC_SCHEDULED_PROCESSES_SECONDS`, по умолчанию 3600) без вида
`staff_birthday` ничего не создаёт; премия администратора за запись — одно
создание, одна премия; задержка дневных премий при возврате кассового отчёта;
удержание при исключении выплаченной записи; подпись «Заявка на ремонт»;
публичная короткая ссылка CRM `/q/c/<код>` пишет сканирования без начислений
(`ADMINAPP_PUBLIC_ORIGIN` желательно задать); подтверждение визита SUM-208
работает только через клиентский портал, не включённый на Prod.

## Копия, откат и ресурсы

- Ночные дампы `/root/db-backups` (04:20 МСК); дамп 02.10 восстановлен целиком
  в репетиции. В день выпуска — свежая копия `summy-db-backup.sh` перед
  миграцией с проверкой `pg_restore` и дублем.
- Откат: фронты — образы и каталоги RC6 и сохранённые конфигурации; backend —
  образ RC6 на схеме 0177 без downgrade (проверено репетицией); слепой
  downgrade не выполняется; восстановление данных — отдельным решением.
- Ресурсы Prod на 03.10 03:12: диск 8,5 ГБ свободно из 48 ГБ, память 3,9 ГБ
  (≈1,9 ГБ доступно). Образ backend кандидата загружен на сервер для
  репетиции и выпуска; production-образы CRM и master-app с Prod-параметрами
  сборки (`NEXT_PUBLIC_*`, `VITE_*`) собираются в день выпуска после снятия
  блокеров, как в RC6.

## Оставшиеся шаги до отдельного Prod-поручения

1. Снять B1 и B2, обновить кандидат (новые SHA CRM/backend), доставить на Dev,
   повторить затронутые проверки и репетицию.
2. Собрать production-образы точных SHA, протокол догона (версии Prod, теги,
   ветки), свежая копия БД, свободный замок.
3. Выпуск — отдельным поручением по [skill релиза](../../ai/skills/summy-production-release/SKILL.md).

## Manifest

```json
{
  "candidate": "RC7",
  "status": "BLOCKED",
  "fixedAt": "2026-10-03T03:12:50+03:00",
  "timezone": "Europe/Moscow",
  "basis": "Работающие артефакты Dev (VERSION, метки org.opencontainers.image.revision, ревизия БД), совпадающие с головами test на момент фиксации",
  "governanceMainBefore": "b99103540b6a7b355058d83e3ae6dfd4494dd6cc",
  "prodNotChanged": true,
  "products": {
    "backend": {
      "test": "cb07bbf7ad541bda29af3700e15b2ee19289282c",
      "dev": {
        "version": "cb07bbf7ad541bda29af3700e15b2ee19289282c",
        "image": "summy-rc7f-backend:cb07bbf",
        "imageId": "sha256:aa8dbd60118d76801de225c127e33454af368151951cbf5b075aac07b1c1138b",
        "revisionLabel": "cb07bbf7ad541bda29af3700e15b2ee19289282c",
        "containers": [
          "api",
          "sync"
        ],
        "db": "0177_inventory_auto_assigned"
      },
      "prod": {
        "version": "8190e4b2902a013eaa5914d2005461247e80f473",
        "image": "summy-backend:rc6-8190e4b2902a",
        "imageId": "sha256:e60f5ecb3b63977aecbae2cccb4f2010e84228fbaf858cd51160f8226dc9fe23",
        "db": "0166_optional_manicure_closure",
        "branch": "dev",
        "branchSha": "01bfa53d0184c8ff5b2b5f5ab3b3bf90b4b3f4f2",
        "tag": "v0.3.0"
      },
      "diffFromProd": {
        "commits": 30,
        "files": 128,
        "authors": {
          "523uran523": 23,
          "Evgeniy": 7
        },
        "prodIsAncestor": true
      },
      "readiness": "BLOCKED: 2 красных теста цветов видов процессов (SUM-97 Q207-1); остальное зелёное"
    },
    "crm": {
      "test": "e39777d4de6b66f0911252c9ea784bdf490e60c6",
      "dev": {
        "version": "sha=e39777d4de6b66f0911252c9ea784bdf490e60c6",
        "image": "adminapp:latest",
        "imageId": "sha256:f965e711a73a9c3ccc20e7dc772c5ac8cf9e061abd3abdeaec0ed4fd1cfa5dae",
        "revisionLabel": "e39777d4de6b66f0911252c9ea784bdf490e60c6"
      },
      "prod": {
        "version": "RC6+6f9c316a034f09dcac58d8412629bff497d000b8",
        "image": "summy-crm:rc6-6f9c316a034f",
        "imageId": "sha256:f384782bf39763ed25404496e30b42e419dadc4e22983f9997d15c4e9fac6773",
        "branch": "main",
        "branchSha": "fe2887a35cc8bb0a51ee2cf6bfff316416488adf",
        "tag": "v0.179.0"
      },
      "diffFromProd": {
        "commits": 54,
        "files": 246,
        "authors": {
          "523uran523": 54
        },
        "prodIsAncestor": true
      },
      "readiness": "BLOCKED: истёкший карантин archive/karantin-do-2026-09-24 (SUM-96 № 76); остальные проверки зелёные"
    },
    "master-app": {
      "test": "ec58c807eaccc364d6e583bd61a91ad692cb2bba",
      "dev": {
        "version": "ec58c807eaccc364d6e583bd61a91ad692cb2bba",
        "image": "bff-bff",
        "imageId": "sha256:6eeb6f43d7e9f9f336daf8002036aa069df18a71e94f49f99f92ccbea837b204",
        "revisionLabel": "ec58c807eaccc364d6e583bd61a91ad692cb2bba",
        "appVersion": "ec58c807eaccc364d6e583bd61a91ad692cb2bba"
      },
      "prod": {
        "version": "RC6+fb76db82f760befdbb16472054a2bab917169c1c",
        "image": "summy-master:rc6-fb76db82f760",
        "imageId": "sha256:3f9a32c588d5a1af968e7f0c657843cdce3df594322aee0c4afba1f432467668",
        "branch": "feature/react-client",
        "branchSha": "d67c5e8bd26f71a1a45a9b2ea6d7033d22a654e6",
        "tag": "v0.81.0"
      },
      "diffFromProd": {
        "commits": 27,
        "files": 42,
        "authors": {
          "Evgeniy": 21,
          "523uran523": 6
        },
        "prodIsAncestor": true
      },
      "readiness": "READY"
    },
    "client-app": {
      "test": "a733de288ce1a212b5651e0a2b4aed09d74d86bd",
      "dev": {
        "version": "a733de288ce1a212b5651e0a2b4aed09d74d86bd",
        "image": "summy-rc7f-client:a733de2",
        "imageId": "sha256:e22475cf56928e439e05de3916bc28ae01ef762d84e611b82bb0f22152a8b59c",
        "revisionLabel": "a733de288ce1a212b5651e0a2b4aed09d74d86bd"
      },
      "prod": {
        "version": "RC6+c36f92c93583c21b1ec615fdf4a1f88de3354fdf staged-only; client sign-in not enabled",
        "branch": "main",
        "branchSha": "9a7e31de711f2bfd94c1a6ef55e05a8346f9d213",
        "tag": "v0.1.0"
      },
      "diffFromProd": {
        "commits": 14,
        "files": 17,
        "authors": {
          "523uran523": 9,
          "Evgeniy": 5
        },
        "prodIsAncestor": true
      },
      "readiness": "READY (на Prod — только поставка неактивно; включение входа — отдельное решение о секретах)"
    },
    "website": {
      "test": "88585f0e0372361e469fc091da64e5738d8bf856",
      "dev": {
        "version": "88585f0e0372361e469fc091da64e5738d8bf856",
        "runtime": "pm2 summy online",
        "buildId": "C5Q3CT0mFD3McOy8ldP_5"
      },
      "prod": {
        "version": "RC6+ef6c6b013a2935c33b9e145c0f11b16db81a1d47",
        "branch": "main",
        "branchSha": "ff4435b9febd59a4bb449e627e417ee18e8de4a4",
        "tag": "v2.32.0"
      },
      "diffFromProd": {
        "commits": 7,
        "files": 39,
        "authors": {
          "523uran523": 7
        },
        "prodIsAncestor": true
      },
      "readiness": "READY"
    }
  },
  "migrations": {
    "from": "0166_optional_manicure_closure",
    "to": "0177_inventory_auto_assigned",
    "revisions": [
      "0167_read_path_speedup",
      "0168_process_status_tones",
      "0169_client_visit_confirmations",
      "0170_repair_request_label",
      "0171_accounting_payout_marks",
      "0172_marketing_campaign_drafts",
      "0173_document_library",
      "0174_client_cash_offset",
      "0175_paid_closing_exclusion",
      "0176_client_cycle_thresholds",
      "0177_inventory_auto_assigned"
    ],
    "nature": "аддитивные таблицы/индексы/витрины и правки данных справочника видов (repair label, tones, inventory_check.assigned); 0167 снимает неиспользуемый GIN-индекс raw_objects_payload_gin_idx",
    "rollbackCompatibility": "API RC6 (8190e4b) на схеме 0177 работает с теми же ответами, что на 0166 — откат кода без downgrade схемы"
  },
  "rehearsal": {
    "where": "сервер Prod, одноразовый postgres:18-alpine во внутренней docker-сети, данные не покидали сервер; рабочие контейнеры и БД Prod не менялись",
    "dump": "summy-2026-10-02-0420.dump",
    "dumpBytes": 45116281,
    "dumpSha256": "04d3d54b8e8a5d74f970dc3a073d52b9b23b6a51f044c8e5aae37d6884f4e6d0",
    "image": "sha256:aa8dbd60118d76801de225c127e33454af368151951cbf5b075aac07b1c1138b",
    "window": "2026-10-03T00:00:03Z–00:05:17Z",
    "restoreExit": 0,
    "restoreErrors": 0,
    "tables": [
      205,
      218
    ],
    "rowLosses": 0,
    "upgradeSecondsTotal": 59.5,
    "gates": {
      "restore": true,
      "migrations": true,
      "no_row_losses": true,
      "data_checks": true,
      "rc7_api": true,
      "rc6_rollback_compatible": true,
      "downgrade": true,
      "reupgrade": true,
      "final_head": true,
      "cleaned": true
    },
    "reportSha256": "f477daa4b90edf515035f090d0e3a5c02664544f8af669475d7cf79e66d4e5e7"
  },
  "checks": {
    "backend@cb07bbf": {
      "api_contract": 0,
      "bff_contract": 0,
      "ruff": 0,
      "mypy": 0,
      "vulture": 0,
      "deptry": 0,
      "alembic_upgrade_from_scratch": 0,
      "schema_contract": 0,
      "verify_sql": 0,
      "pytest_msk": "2290 passed, 2 failed (test_type_appearances_are_from_the_set_and_never_repeat, test_posle_nakata_zhivye_vidy_razlichimy)",
      "pytest_utc_money": "258 passed"
    },
    "crm@e39777d": {
      "karantin": "exit 1 (karantin-do-2026-09-24 истёк)",
      "api_types_clients": 0,
      "api_types_gateway": 0,
      "lint": 0,
      "typecheck": 0,
      "knip": 0,
      "vitest": "1696/1696",
      "build": 0
    },
    "master-app@ec58c80": {
      "typecheck": 0,
      "palette": 0,
      "vitest": "314/314",
      "knip": 0,
      "build": 0,
      "bff_node_test": "50/50"
    },
    "client-app@a733de2": {
      "format_check": 0,
      "vitest": "13/13",
      "server_node_test": "28/28",
      "typecheck": 0,
      "build": 0
    },
    "website@88585f0": {
      "eslint": 0,
      "palette": 0,
      "knip": 0,
      "check_pages": 0,
      "npm_test": "18/18",
      "next_build": 0
    },
    "fixedDuringPreparation": {
      "backend cb07bbf": "17 замечаний mypy; дата платформы вместо None (смена, зачёт наличных); снимки schema-contract/views до 0177; тест наличного вывода после SUM-10 + новый тест удержания",
      "crm e39777d": "панель смены не требует справочника филиалов у ролей без смены (падал тест вкладки); 3 ошибки lint set-state-in-effect",
      "client-app a733de2": "гонка теста занятого слота (waitFor)"
    }
  },
  "devDeliveries": [
    {
      "release": "rc7-client-dev-20261003",
      "at": "2026-10-03T02:08+03:00",
      "client": "84bf3e57ac1eb32ced936057a27f37ca08ff35eb",
      "exit": 0
    },
    {
      "release": "rc7-fix-dev-20261003",
      "at": "2026-10-03T02:40–02:43+03:00",
      "backend": "cb07bbf7ad541bda29af3700e15b2ee19289282c",
      "crm": "e39777d4de6b66f0911252c9ea784bdf490e60c6",
      "client": "a733de288ce1a212b5651e0a2b4aed09d74d86bd",
      "exit": 0,
      "finalStatusSha256": "8515d91cd9ab7a84532a3cae700f645890d450192e65dc7cd25b897344b0a8c2"
    }
  ],
  "settingsAndFlags": {
    "prodUnchanged": "env/секреты Prod не меняются; переменные только по именам",
    "remainOff": [
      "тестовый вход",
      "заказы (ORDERS_TEST_ENABLED)",
      "клиентский портал / вход client-app",
      "Platform ID",
      "выплаты наличными (cash-v1)",
      "фото v2 (PHOTO_PROOF_V2_ENABLED)",
      "автозакрытие оплаченных"
    ],
    "behaviourChangesOnProd": [
      "P04: при открытии смены администратором в понедельник создаётся карточка «Инвентаризация» (статус «Назначена»); задание scheduled_processes в цикле синка (SYNC_SCHEDULED_PROCESSES_SECONDS, по умолчанию 3600) ничего не создаёт без вида staff_birthday",
      "SUM-120: премия администратора 50 ₽ — одно создание записи, одна премия; записи мастера/клиента и созданные платформой от их имени не дают",
      "SUM-158: возврат кассового отчёта на доработку задерживает дневные премии администратора до принятия",
      "SUM-10: исключение записи после подтверждённой выплаты — отдельное удержание",
      "P02: подпись вида repair — «Заявка на ремонт» (если не переименован вручную)",
      "P09: публичная короткая ссылка CRM /q/c/<код> пишет сканирования (без начислений); ADMINAPP_PUBLIC_ORIGIN желательно задать",
      "SUM-208: подтверждение визита клиентом пишет attendance=2 в YClients только через клиентский портал, который на Prod не включён"
    ],
    "notDecidedNotEnabled": [
      "вид процесса staff_birthday",
      "утверждение кампаний и начисления QR",
      "источник абонементов YClients (Э5)"
    ]
  },
  "backupAndRestore": {
    "nightly": "/root/db-backups, 04:20 МСК; дамп summy-2026-10-02-0420.dump восстановлен целиком в репетиции (exit 0, 0 ошибок)",
    "releaseDay": "свежий summy-db-backup.sh перед миграцией, pg_restore-проверка, дубль в snapshots/"
  },
  "rollbackPlan": [
    "frontends (CRM, master-app, website, client-app): прежние образы/каталоги RC6 и конфигурации rollback-config",
    "backend: образ RC6 summy-backend:rc6-8190e4b2902a на схеме 0177 без downgrade (проверено репетицией); слепой downgrade не выполняется",
    "данные: восстановление из копии — только отдельным решением"
  ],
  "resources": {
    "prodDiskFree": "8.5G из 48G после загрузки образа кандидата",
    "prodMemory": "3.9G всего, ~1.9G доступно",
    "candidateBackendImageStagedOnProd": "summy-rc7f-backend:cb07bbf (sha256:aa8dbd60118d…), архив удалён",
    "devBuildsReady": "образы Dev собраны с Dev-параметрами; production-образы CRM/master (NEXT_PUBLIC_*/VITE_* Prod) собрать в день выпуска после снятия блокеров"
  },
  "inclusions": "см. документ кандидата: части SUM-196/SUM-203/SUM-205/SUM-195/SUM-207/SUM-208/SUM-206/SUM-209/SUM-194/SUM-168 и исправления RC7",
  "exclusionsFromTest": [],
  "otherBranches": {
    "crm/claude/prod-sveta-processes": "3f7795f — уже предок test и main, переносить нечего"
  },
  "blockers": [
    {
      "id": "B1",
      "what": "истёкший карантин CRM archive/karantin-do-2026-09-24 — сторож CI красный",
      "to": "Кирилл (владелец), SUM-96 № 76",
      "next": "слово владельца: удалить по описи (сверка sha256), push в test, Dev, повтор check-karantin и CRM-контура"
    },
    {
      "id": "B2",
      "what": "два теста цветов видов: cleaning_defect/review_photo/duty/penalty_appeal совпадают с соседними видами",
      "to": "Юра, SUM-97 Q207-1",
      "next": "четыре согласованных цвета → миграция 0178 по образцу 0154 → test, Dev (миграция), повтор pytest и репетиции 0166→0178"
    }
  ]
}
```
