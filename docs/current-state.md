# Фактическое состояние

## Production: RC5.1 — CRM `3f7795f` с 01.10.2026 12:47 МСК

Поверх RC5 редакции 2 выложена только CRM
`3f7795fe8187f1f25e0bd7188adb7f1ef494be61` (`main`, `v0.178.1`; RC5
`086e8c7` + исправление пустых «Процессов» у управляющей). Утверждено
сообщением «Всё подтверждаю, делайте» в рабочем чате 01.10.2026; deploy exit 0,
health `sha=3f7795f…`, `version=RC5.1`. Проверки до выкладки, образ и откат на
RC5 — в [документе выкладки](releases/production-crm-processes-fix-2026-10-01.md).
Остальные продукты и БД — как в RC5 редакции 2 ниже.

## Production: RC5 редакция 2 с 30.09.2026 21:15 МСК

Утверждено ответом «Заливай на прод» в рабочем чате 30.09.2026; SUM-176.
Работают backend `10e0dd53355605a2d9ae7daa1f3ba45ee1c4fb95` (`dev`, `v0.2.0`),
CRM `086e8c71de92668caf57a8f1af9b605f829d2125` (`main`, `v0.178.0`; с
01.10.2026 12:47 заменена на `3f7795f`, см. выше), master-app
`dee599f81da12aaef7832c26f4c840803d3de816` (`feature/react-client`, `v0.80.0`),
website `a086b8386fa886960c795ed30e924a76db6473fb` (`main`, `v2.31.0`); БД
`0160_daily_processes`, вход CRM `gateway`. client-app
`175633fa52b48430a58bbaf03e4d6cb43f5098c6` только поставлен: образ и файлы
запуска лежат неактивно, контейнера и маршрута `/client/` нет, клиентский
вход не включён. Копия перед миграцией, результаты команд и откат — в
[отчёте о выкладке](releases/production-rc5-deployment-2026-09-30.md).

## TEST, 01.10.2026 15:29–15:31 МСК: master-app `fa541b5` (SUM-187, плитки предпочтений)

Поверх точной доставки `exact-20261001` (ниже) выложен один новый коммит
`master-app/test` — SUM-187, плитки предпочтений клиента 2×3 на карточке
записи (только web UI: `ClientPreferences.tsx`, `Today.tsx`,
`today-home.css`, CHANGELOG). Объединений, cherry-pick и иных коммитов не было.
Выпуск `/opt/summy-test/releases/mcatch-20261001`: LF-архив `git archive`,
SHA-256 и blob-хеши сверены; `release.py prepare`, `release.py master`,
`release.py status` — exit 0.

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| master-app (BFF и web) | `8eaeb6b99d5f137ccc8a92cd87842dd035349a89` | `fa541b53eea760c10011f476da6f268d7fb5b012` (1 коммит) | `bff-bff:master-fa541b5` (`sha256:f2b6f54c47dc…`), `bff-bff-1` `74f7ee824cdb` running, RestartCount 0; `.env` и compose прежние, набор ключей env сверен |
| backend, БД, CRM, client-app, website | `3498987` / `0164_client_preferences` / `c17e8f6` / `175633f` / `a086b83` | без изменений | ID контейнеров API, sync, adminapp, client-app, postgres, minio прежние |

Откат (не выполнялся): `release.py rollback-master` — образ
`bff-bff:pre-mcatch-20261001` (`sha256:249a762652bc…`, `8eaeb6b`) и каталог
`releases/mcatch-20261001/master-prev`. Тесты не проводились: экраны,
HTTP-ответы и сценарии не проверялись; production и YClients не менялись.

## Точная доставка `origin/test` на TEST, 01.10.2026 15:13–15:17 МСК: backend `3498987` (БД `0164`) и master-app `8eaeb6b`

По манифесту сверки всех `origin/test` выложены ровно две головы `test`,
отличавшиеся от TEST; объединений, cherry-pick и расширения состава не было.
Выпуск `/opt/summy-test/releases/exact-20261001` поверх `fa-20261001` (backend)
и `all-20261001` (master-app): LF-архивы, SHA-256 и blob-хеши сверены;
`prepare`, `backend`, `master`, `status` — exit 0.

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `c7a4d3f3daf28b816dde9d2a39f2ac01b3479694` | `34989879a9ad3b4ebeb4dcdfd4213e09d9ba0f31` (14 коммитов) | `summy-exact-backend:3498987` (`sha256:6b9c5131cb3e…`), API `cc8c4f79b642` healthy, sync `c89a821d88a6` running, RestartCount 0; override `releases/exact-20261001/backend-next.json` (env прежнего `fa-20261001`, `YCLIENTS_READ_ONLY=true`) |
| master-app (BFF и web) | `77c7816321dcd4349a0073e982880ba31141064e` | `8eaeb6b99d5f137ccc8a92cd87842dd035349a89` (11 коммитов) | `bff-bff:master-8eaeb6b` (`sha256:249a762652bc…`), `bff-bff-1` `d40afa201525` running, RestartCount 0 |
| БД | `0163_inventory_cash_totals` | `0164_client_preferences` | аддитивно: таблица `client_preferences` и триггер; копия перед миграцией `/opt/summy-test/backups/exact-20261001-before-0164.dump` (45 345 264 байта, SHA-256 `0d8cac6be4828f858a317c3df6cff8f1b21762796c0c391e77831e7b737509a2`, полное чтение `pg_restore` успешно; restore не выполнялся) |
| CRM, client-app, website | `c17e8f6` / `175633f` / `a086b83` | без изменений | уже совпадали с `origin/test`, не пересобирались |

- Состав backend: SUM-186 (`ccdc084`, `b234519`, `03b763b`), SUM-187
  (`6f61269`, `766f2b6`, `c72536a`), SUM-189 (`59b9433`, `91dacbc`,
  `e44cbdc`, `8a9bcf9`, `93cebed`, `3498987`), SUM-188/191 (`fe6c454`,
  `33587a6`). Состав master-app: SUM-186 `e5c6a6e`; SUM-187 `0f3ee91`,
  `2e21f41`; SUM-189 `1e52f5d`, `4004300`, `8eaeb6b`; SUM-188/191 `eefe6ae`,
  `0d103b5`, `523dba1`, `5cf1174`, `ebfd1a9`.
- Ручка прихода SUM-186 и добавление услуги SUM-188 по коду включены только
  при `deployment_environment=local`; на TEST (`test`) они недоступны.
- С выкладкой backend у CRM `c17e8f6` появились серверные ручки предпочтений
  SUM-187, которых не было на `c7a4d3f`.

Откат (не выполнялся): сначала `release.py rollback-master` (образ
`bff-bff:pre-exact-20261001`, каталог `master-prev`), затем
`release.py rollback-backend` — прежний образ `summy-fa-backend:c7a4d3f` с
`releases/exact-20261001/backend-rollback-0164.json`: это override
`fa-20261001` с той же env, но командой API без `alembic upgrade head`, потому
что прежний образ не знает ревизию `0164`. Схема остаётся на `0164`, downgrade
с удалением таблицы не выполняется; restore из копии — только отдельным
решением. Env, compose-файлы CRM/client-app и внешние интеграции не менялись.
Тесты не проводились: экраны, HTTP-ответы и сценарии не проверялись;
подтверждены коды завершения, `VERSION`, образы, состояние контейнеров и
ревизия БД. Production не менялся.

## Инцидент production 01.10.2026: пустые «Процессы» у управляющей — CRM `c17e8f6` на TEST

Причина доказана чтением production (RC5 без изменений): CRM `98973b0`
(SUM-176) открывал «Процессы» с фильтром «Ответственный: я», доска, список и
календарь запрашивали `assignee=me`. Для допуска управляющей (роль `manager`,
оба филиала, права в порядке) это 0 процессов против 19 активных и 268
закрытых без отбора; ошибок API не было. Исправление — дефолт «все», «я» и
выбор сотрудника остаются; права, ACL, фильтры доступа и данные не менялись.
Подробности, кандидат и откат — в
[документе кандидата](releases/production-crm-processes-fix-2026-10-01.md).

| Продукт | `origin/test` | На TEST | Итог |
|---|---|---|---|
| CRM | `c17e8f6ec55d81d2ad5320f48c77cdea491f684a` | был `b1087f8dae281ded8f448d1b297830403faaa5f8` | выпуск `/opt/summy-test/releases/sveta-20261001`: `prepare`, `crm`, `status` — exit 0; LF-архив, SHA-256 и blob-хеши сверены; `adminapp:crm-c17e8f6` (`sha256:88eeb742738a…`), контейнер `ba687badd00b` healthy, RestartCount 0 |
| backend, master-app, БД | `c72536a` / `77c7816` / — | `c7a4d3f` / `77c7816` / `0163_inventory_cash_totals` | не менялись (закреплены проверками выпуска) |

Голова `crm/test` включает CRM-часть SUM-187 (`97b2340`, `53b4b34`), поэтому
она тоже на TEST. Backend SUM-187 (`6f61269`…`c72536a`, миграция `0164`) и
SUM-186 на TEST тогда не выкладывались; они выложены 01.10.2026 в 15:15 МСК —
раздел «Точная доставка `origin/test`» выше.
Production-кандидат CRM `3f7795fe8187f1f25e0bd7188adb7f1ef494be61` (ветка
`claude/prod-sveta-processes` поверх RC5 `086e8c7`) на этапе TEST не
тестировался. Позже, 01.10.2026 12:47 МСК, он утверждён, проверен до выкладки
(новых отказов vitest/eslint против RC5 нет, `tsc` и сборка прошли) и выложен
на production — раздел «Production: RC5.1» выше.

## Общая выкладка всех `test` на TEST, 01.10.2026: master-app `77c7816`

Сверены `origin/test` всех продуктовых репозиториев и `VERSION`/образы TEST.
Отличался только master-app; выпуск `/opt/summy-test/releases/all-20261001`
поверх `fa-20261001` (`prepare`, `master`, `status` — exit 0; LF-архив,
SHA-256 и blob-хеши сверены; миграций нет):

| Продукт | `origin/test` | На TEST | Итог |
|---|---|---|---|
| backend (API и sync) | `c7a4d3f3daf28b816dde9d2a39f2ac01b3479694` | тот же | уже актуален, `summy-fa-backend:c7a4d3f` |
| CRM | `b1087f8dae281ded8f448d1b297830403faaa5f8` | тот же | уже актуален, `adminapp` `78beaa83a7de` |
| master-app (BFF и web) | `77c7816321dcd4349a0073e982880ba31141064e` | был `537b79bbbf864845f0f8e83a812b2c5255e46288` | установлен: `bff-bff:master-77c7816` (`sha256:3ee8051377ae…`), `bff-bff-1` `cd296912129d` running, RestartCount 0 |
| client-app | `175633fa52b48430a58bbaf03e4d6cb43f5098c6` | тот же | уже актуален |
| website | `a086b8386fa886960c795ed30e924a76db6473fb` | тот же | уже актуален |
| БД | — | `0163_inventory_cash_totals` | без изменений, копия не снималась |

- Состав master-app: `e68ebbf` — нижние шторки формы закрытия записи и выбора
  услуги не смещаются за экран в production-сборке; `77c7816` — обновлены
  только web-проверки. Коммиты без ссылки на задачу YouTrack.
- `summy-ai-operator`: репозиторий не читается ключом этого ПК, ветка `test`
  не подтверждена; контейнер `summy-ai-operator-test` не трогали.

Откат: `release.py rollback-master` (образ `bff-bff:pre-all-20261001`,
каталог `master-prev`). Env и внешние интеграции не менялись. Тесты не
проводились: экраны, HTTP-ответы и сценарии не проверялись; подтверждены коды
завершения, `VERSION`, образы, состояние контейнеров и ревизия БД. Production
не менялся.

## SUM-182, SUM-125, SUM-185 — открытие смены в SUMMY-local, премии в ведомости, примеры синка на общем TEST, 01.10.2026

Выпуск `/opt/summy-test/releases/fa-20261001` поверх `od-20261001`
(`prepare`, `backend`, `crm`, `status` — exit 0; LF-архивы, SHA-256 и
blob-хеши сверены; миграций нет):

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `085c4f6ae21137c0cde35e15bf4702dad8a4b87b` | `c7a4d3f3daf28b816dde9d2a39f2ac01b3479694` | `summy-fa-backend:c7a4d3f` (`sha256:ed31f98404d6…`), API `ee15365dc608` healthy, sync `7bbb4f85edac` running, RestartCount 0 |
| CRM | `99e8102377d83127c1168a15ff890b844fdb0f98` | `b1087f8dae281ded8f448d1b297830403faaa5f8` | `adminapp:crm-b1087f8` (`sha256:ef7874b46ed0…`), `78beaa83a7de` healthy |
| БД | `0163_inventory_cash_totals` | без изменений | копия не снималась: миграций нет |
| master-app, client-app | — | не менялись (`537b79b…`, `175633f…`) | — |

- SUM-182: для `DEPLOYMENT_ENVIRONMENT=local` открытие смены без QR принимает
  локальный MinIO на любом порту; TEST и production не затронуты.
- SUM-125: строка «Премии за день» в «Ведомости»
  ([payroll-v1](../contracts/payroll-v1.md#администратор)).
- SUM-185: исправлены примеры ручного прогона синка; эксплуатационная граница
  — [инфраструктура](infrastructure.md#синк-yclients-расписание-сигнал-и-повтор-sum-185-01102026).
- Незавершённый выпуск `yct2-20261001` помечен `NOT-ACTIVATED.txt`: его состав
  (SUM-181) уже доставлен `od-20261001`.

Откат: `release.py rollback-crm`, затем `rollback-backend` (прежний образ
`summy-od-backend:085c4f6` и compose `od-20261001`, downgrade не нужен).
YClients read-only, env не менялся. Тесты не проводились: экраны, HTTP-ответы
и сценарии не проверялись; подтверждены коды завершения, `VERSION`, образы,
состояние контейнеров и ревизия БД. Production не менялся.

## SUM-158, SUM-120, SUM-123 — касса бухгалтера, премия за инвентаризацию и «Отчёты» на общем TEST, 01.10.2026

Решения владельца 01.10.2026 (SUM-96). Выпуск
`/opt/summy-test/releases/od-20261001` поверх `yr121c-20261001` (`prepare`,
`backend`, `crm`, `status` — exit 0; LF-архивы, SHA-256 и blob-хеши сверены):

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `cc19109325c69e552e518c9e414325c5722b78e8` | `085c4f6ae21137c0cde35e15bf4702dad8a4b87b` (включает неразвёрнутый ранее SUM-181 `5fa24cf`) | `summy-od-backend:085c4f6` (`sha256:29958fd27a1a…`), API `be06c97bfcb5` healthy, sync `fa031a96abd5` |
| CRM | `08c58cb8e0b2df9439b0f35a23c7c8234bbe9600` | `99e8102377d83127c1168a15ff890b844fdb0f98` (включает SUM-181 `86590ff`) | `adminapp:crm-99e8102` (`sha256:d2a53bee5cc7…`), `e672c78ed126` healthy |
| БД | `0162_penalty_appeals` | `0163_inventory_cash_totals` | копия перед миграцией `/opt/summy-test/backups/od-20261001-before-0163.dump` (44 876 389 байт, SHA-256 `4eea22b73fef7e6df43347cf7b1437359648de53034c5d40c2c9b3476bff18e2`, полное чтение `pg_restore` успешно; restore не выполнялся) |
| master-app, client-app | — | не менялись (`537b79b…`, `175633f…`) | — |

- SUM-158, блок А: касса бухгалтера — ручные итоги, фото, разница без порога,
  история решений ([рабочие места](../contracts/role-workplaces.md#бухгалтер)).
- SUM-120: премия 1000 ₽ за подтверждённую карточку «Инвентаризация» с фото,
  одна на филиал в месяц (временно); исправлен учёт «Отзыва с фото»
  ([payroll-v1](../contracts/payroll-v1.md#администратор)).
- SUM-123: `/analytics/reports` на контракте «Обзора»
  ([analytics-overview](../contracts/analytics-overview.md)).

Откат: `release.py rollback-crm`, затем `rollback-backend` (`alembic downgrade
0162_penalty_appeals` новым образом, прежний образ `summy-yr-backend:cc19109`;
downgrade отказывает, если уже есть карточки `inventory_check`). YClients
read-only, env не менялся. Тесты не проводились: экраны, HTTP-ответы и
сценарии не проверялись; подтверждены коды завершения, `VERSION`, образы,
состояние контейнеров и ревизия БД. Production не менялся.

## SUM-121 — медкнижка и первый экран кабинета мастера на общем TEST, 01.10.2026

Выпуск `/opt/summy-test/releases/yr121c-20261001` (`prepare`, `backend`,
`master`, `crm`, `status` — exit 0; LF-архивы, SHA-256 и blob-хеши сверены;
образ backend переиспользован из прерванного `yr121` той же ревизии из-за
лимита Docker Hub):

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `32f0f144869c19b27de380830fad939382054f90` (SUM-177) | `cc19109325c69e552e518c9e414325c5722b78e8` | `summy-yr-backend:cc19109` (`sha256:c5842dcc68a5…`), API `56e21c528448` healthy, sync `b5e244bbb0fb` |
| master-app | `9d4dcb3e881e17b0d0e0278efe00bfbaafebff1a` | `537b79bbbf864845f0f8e83a812b2c5255e46288` (включает `8fe2316`) | `bff-bff:master-537b79b` (`sha256:13a17845a39f…`), `4771b5dbe17c` |
| CRM | `e12c14003a9bbccc11d600a79a83a9dbed909c56` (SUM-177) | `08c58cb8e0b2df9439b0f35a23c7c8234bbe9600` | `adminapp:crm-08c58cb` (`sha256:c59707234d90…`), `3dd1ed5266a5` healthy |
| БД, client-app | — | не менялись (`0162_penalty_appeals`) | — |

Откат: `release.py rollback-crm`, `rollback-master`, `rollback-backend`
(прежние образы `adminapp:pre-yr121c-20261001`, `bff-bff:pre-yr121c-20261001`,
`summy-yct-backend:32f0f14`; миграций нет). Экраны и HTTP-ответы не проверялись.

## SUM-177 — перенос YClients в CRM: база клиентов, карточка и свежесть зеркала на общем TEST, 01.10.2026

Опубликовано в `origin/test` и развёрнуто выпуском
`/opt/summy-test/releases/yct-20261001` (`prepare`, `backend`, `crm`,
`status` — exit 0; LF-архивы, SHA-256 и blob-хеши сверены):

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `24ee8ab932cf1b19fd56d3034b10e1427a5e51f4` | `32f0f144869c19b27de380830fad939382054f90` | `summy-yct-backend:32f0f14` (`sha256:772b59ddc7fd…`), API `adffdd305efd` healthy, sync `a061f32d53ab` |
| CRM | `591059176e0f6de2bae7b9b473d5dc2b784e6233` | `e12c14003a9bbccc11d600a79a83a9dbed909c56` | `adminapp:crm-e12c140` (`sha256:b0c1636d28b4…`), `3cc4c3bacaab` healthy |
| БД, master-app, client-app | — | не менялись (`0162_penalty_appeals`) | — |

Состав: SUM-178 (база клиентов на серверной выборке), SUM-179 (карточка
клиента по одному клиенту), SUM-180 (свежесть потоков зеркала YClients в
«Интеграциях»). `YCLIENTS_READ_ONLY=true` и переменные окружения не менялись.
Откат: `release.py rollback-crm`, `rollback-backend` (прежние образы
`adminapp:pre-yct-20261001`, `summy-yr-backend:24ee8ab`; миграций нет).
Тесты не проводились: экраны и HTTP-ответы не проверялись.
[Карта переноса](yclients-transfer.md).

## SUM-125 — оклад за смену в ведомости на общем TEST, 01.10.2026

Опубликовано в `origin/test` и развёрнуто выпуском
`/opt/summy-test/releases/yr125-20261001` (`prepare`, `backend`, `crm`,
`status` — exit 0; LF-архивы, SHA-256 и blob-хеши сверены):

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `11c8d692519b0123ec6179a09f6bfbb89a3b7c78` | `24ee8ab932cf1b19fd56d3034b10e1427a5e51f4` | `summy-yr-backend:24ee8ab` (`sha256:981cf0db9859…`), API `720b0dda2476` healthy, sync `03f79b1cf418` |
| CRM | `6a5c182f68d45b3845f60faadbecfb36525f4c94` | `591059176e0f6de2bae7b9b473d5dc2b784e6233` | `adminapp:crm-5910591` (`sha256:46a97e7bcb3c…`), `92d891080122` healthy |
| БД, master-app, client-app | — | не менялись (`0162_penalty_appeals`) | — |

Откат: `release.py rollback-crm`, `rollback-backend` (прежние образы
`adminapp:pre-yr125-20261001`, `summy-fin7-backend:11c8d69`; миграций нет).
Экраны и HTTP-ответы не проверялись. [Контракт](../contracts/payroll-v1.md#администратор).

## SUM-150 — вход разработчика и демо-учётка клиента на общем TEST, 01.10.2026

Код в `origin/test`: backend `9589f1f82e45fb84d0475ad522b1b72ba99608a1`, CRM
`b18d823b216f6ba66e036f02c6f6c694d5754ed2`, client-app
`175633fa52b48430a58bbaf03e4d6cb43f5098c6`. Развёрнут 30.09 выпуском
`/opt/summy-test/releases/origin-test-20260930` (журнал `DONE` 12:31 МСК);
backend и CRM далее входят в `fin7-20261001`. 01.10 выполнен seed
`scripts/seed_test_client_demo.py` в `summy-stand-api-1`: exit 0, создана
учётка «ТЕСТ Демо-клиент» с записями, оплатами визитов, рекламацией и
бонусами; БД не сбрасывалась, внешние сервисы не вызывались. Вход под
учёткой и HTTP-проверки не выполнялись. [Контракт](../contracts/test-developer-access.md#sum-150-демо-учётка-клиента-и-роли-crm).

## SUM-157, SUM-120, SUM-111 P6 на общем TEST, 01.10.2026

Поручение разработчика-координатора 30.09.2026 («завершить семь задач»).
Опубликовано в `origin/test` fast-forward и развёрнуто выпуском
`/opt/summy-test/releases/fin7-20261001` (шаги `prepare`, `backend`, `master`,
`crm`, `status` — exit 0, 00:14–00:19 МСК 01.10):

| Продукт | Было на TEST | Установлено | Образ и контейнер |
|---|---|---|---|
| backend (API и sync) | `10e0dd53355605a2d9ae7daa1f3ba45ee1c4fb95` | `11c8d692519b0123ec6179a09f6bfbb89a3b7c78` | `summy-fin7-backend:11c8d69` (`sha256:9ff8f1b57edb…`), API `ab2d33616968` healthy, sync `29e56a5f2396` |
| БД | `0160_daily_processes` | `0162_penalty_appeals` | PostgreSQL `8d64c21e46db` не пересоздавался |
| master-app | `dee599f81da12aaef7832c26f4c840803d3de816` | `9d4dcb3e881e17b0d0e0278efe00bfbaafebff1a` | `bff-bff:master-9d4dcb3` (`sha256:5d0460c407b5…`), `d705ffd1a7d9` |
| CRM | `086e8c71de92668caf57a8f1af9b605f829d2125` | `6a5c182f68d45b3845f60faadbecfb36525f4c94` | `adminapp:crm-6a5c182` (`sha256:099f0267b46e…`), `cc07b7c3c5a4` healthy |
| client-app, website | — | не менялись | — |

Копия перед миграцией: `/opt/summy-test/backups/fin7-20261001-before-0161.dump`
(44 862 816 байт, SHA-256
`f860b6437ac451d67b29c1bfd2cdaf40b7abf07c7fbfd4685cfe1bd24da922f7`, ревизия
`0160_daily_processes`, полное чтение `pg_restore` успешно). Откат —
`release.py rollback-crm`, `rollback-master`, `rollback-backend` (downgrade
новым образом до `0160`, затем прежний compose `sum176b-20260930`).

Состав: отбор очереди закупщика по складу (SUM-157); премия администратора
50 ₽ за отзыв с фото по карточке `review_photo` (SUM-120; инвентаризация
по-прежнему без источника); «Обжаловать» штраф у мастера, удержание спорных
баллов из выплаты и решение управляющей в CRM (SUM-111 P6). Факт доставки — по
SHA и результату команд выпуска; запросы к TEST и сценарии не проверялись,
тесты не проводились. Production не менялся.

## SUM-176 — совместимость со входом production и перенос допусков на общем TEST, 30.09.2026

Опубликовано в `origin/test` fast-forward и развёрнуто на общем TEST выпуском
`/opt/summy-test/releases/sum176b-20260930`: backend
`10e0dd53355605a2d9ae7daa1f3ba45ee1c4fb95` (образ `summy-sum176-backend:10e0dd5`,
API `672608ca4c74`, sync `df9bf3eb43a8`) и CRM
`086e8c71de92668caf57a8f1af9b605f829d2125` (контейнер `854561fc3769`). БД
осталась на `0160_daily_processes` — новых миграций нет; перед заменой backend
снята копия `/opt/summy-test/backups/sum176b-20260930-at-0160.dump` (44 728 433
байт, SHA-256
`bf9ab74a122fd3f8af0c7a59f69abf6b42107c9afccacfc8a912dce82b7e434c`). master-app
`dee599f81da12aaef7832c26f4c840803d3de816`, client-app и website не менялись.
Production не менялся.

Состав: backend — `scripts/import_crm_access.py`, перенос действующих допусков
CRM по номерам учёток и ролям без изменения существующих строк; CRM — при входе
`legacy` разделы, которым нужна серверная сессия, не показываются и не
запрашиваются. Факт доставки зафиксирован по SHA и результату команд выпуска;
запросы к TEST и сценарии в интерфейсе не проверялись, тесты не проводились.
Production-кандидат с этими SHA —
[RC5 редакция 2](releases/production-rc5-edition2-2026-09-30.md).

## SUM-176 — ежедневные процессы CRM на общем TEST, 30.09.2026

Поручение разработчика-координатора 30.09.2026. Production не менялся. Правила —
в [контракте ежедневных процессов](../contracts/daily-processes.md); денежное
правило уборки — в [payroll-v1](../contracts/payroll-v1.md#уборщица-оплата-за-выход).

| Продукт | Было на TEST (чтение 30.09 19:00 МСК) | Опубликовано в `origin/test` | Установлено 30.09 19:23–19:24 МСК | Образ и контейнер |
|---|---|---|---|---|
| backend (API и sync) | `f82739600f1172f74ff70340a092af2cfacdcfec`, `summy-sum175-backend:f827396` | `26ecfddd1e78cc38a3d99174b40a8cdbddf3a7cd` | `26ecfddd1e78cc38a3d99174b40a8cdbddf3a7cd` | `summy-sum176-backend:26ecfdd` (`sha256:493fb9641d7c…`), API `d5ba5e0b86c0` healthy, sync `cf89a54232b5` |
| БД | `0159_courier_deliveries` | голова кода `0160_daily_processes` | `0160_daily_processes` | PostgreSQL `8d64c21e46db` не пересоздавался |
| master-app | `c0d57e69b7902d96ec02d1a2d66f797a20624c5f` | `dee599f81da12aaef7832c26f4c840803d3de816` | `dee599f81da12aaef7832c26f4c840803d3de816` | `bff-bff:master-dee599f` = `bff-bff:latest` (`sha256:867a10c447eb…`), `c71e4f5cd9d2` |
| CRM | `f6c6f49613220bb0dd3e82c8607e6114e062452c` | `98973b09e29d426f385aaa3d97b4116dbe4a6067` | `98973b09e29d426f385aaa3d97b4116dbe4a6067` | `adminapp:crm-98973b0` = `adminapp:latest` (`sha256:f2d32b4fd4d9…`), `1f05c76879c9` healthy |
| client-app, website | `175633fa52b48430a58bbaf03e4d6cb43f5098c6`, `a086b8386fa886960c795ed30e924a76db6473fb` | — | не менялись | контейнер client-app `15d5b09c01a6`, PostgreSQL и MinIO прежние |

Порядок. Образы собраны на сервере из LF-архивов локальных коммитов до
публикации (шаг `prepare` выпуска `/opt/summy-test/releases/sum176-20260930`,
19:17–19:21): SHA-256 архивов (backend
`3b3af8dfdfeb9fbfecf77de7577ed3ccd4084fe55ca0488adb390848c0800b6d`, CRM
`2a08d1d68e0e559acb921e99e714ae8822db6db88b0b583575b941deea2b64be`, master-app
`bef5ac9952f8becf66ab6c0720518263035c8fe48128d76dbefc02e7196bfbee`) и blob-хеши
восемнадцати файлов сверены, `alembic heads` нового образа —
`0160_daily_processes`. После успешной сборки те же три SHA отправлены в
`origin/test` fast-forward без force и развёрнуты шагами `backend`, `assign`,
`master`, `crm`, `status` — все с кодом 0. Блокировка
`/var/lock/summy-test-deploy.lock` была свободна, чужой выкладки не шло;
контейнеры client-app, PostgreSQL и MinIO скрипт подтвердил неизменными.
`stand/up.sh`, restore и сброс БД не запускались.

Окружение. В compose backend изменены образ `api` и `sync` и добавлена
`CLEANING_ADMIN_REPORT_FROM=2026-09-30`; в `.env` CRM добавлена
`ADMINAPP_SETTINGS_NAV_HIDDEN_LOGINS` с номером учётки владельца TEST,
сверенным по строке допуска `owner` в БД. Остальной состав ключей окружения
API, sync, CRM и master-app скрипт подтвердил неизменным.
`CLEANING_LOCATION_RATES_FROM` на TEST не задана: ставки филиала и
персональные ставки применяются к новым выходам с 30.09.2026 по правилу
контракта. На момент выкладки в `cleaning_shifts` TEST не было ни одной строки,
пересчитывать было нечего.

Филиалы. Сверка по БД TEST (снимок production 29.09): действующий допуск CRM с
ролью администратора есть у одной учётки; она связана ровно с одним сотрудником,
рабочее место которого — «Батурина». Ей шагом `assign` назначен основной филиал
«Батурина» (`scripts/assign_admin_primary_location.py`, запись в `auth_audit`).
У остальных трёх администраторов из поручения допуска CRM в данных нет: двое
найдены в справочнике сотрудников со связанными учётками и филиалами,
совпадающими с поручением («Батурина» и «Офицерская»), третья по имени и
отчеству не сопоставляется ни с одной записью однозначно. Допуск CRM по
совпадению имени не выдавался, основной филиал им не назначен; ID кандидатов
записаны в SUM-176. ID филиалов сверены: «Батурина» — `yclients-481570`,
«Офицерская» — `yclients-386571`.

Копия и откат. `/opt/summy-test/backups/sum176-20260930-before-0160.dump` снята
при остановленных API и sync на ревизии `0159_courier_deliveries`: 44 689 072
байт, SHA-256
`1b6b7266fc019aed7297c20cd71308f264722225e3e36324bac7006a64300384`, полное
чтение `pg_restore -f /dev/null` успешно; restore не выполнялся. Откат CRM —
`release.py rollback-crm` (каталог `crm-prev`, образ
`adminapp:pre-sum176-20260930`); master-app — `release.py rollback-master`
(`master-prev`, `bff-bff:pre-sum176-20260930`); backend —
`release.py rollback-backend`: `alembic downgrade 0159_courier_deliveries` новым
образом, затем compose `releases/sum175-20260930/backend-next.json` с
`summy-sum175-backend:f827396`. Ревизия откажет в `downgrade`, пока назначен
основной филиал или есть отчёты об уборке, QR, график, дежурства и замены:
назначение нужно снять отдельной командой, а при существующих отчётах и
дежурствах откат схемы требует отдельного решения о данных; скрипт данные сам
не удаляет.

Проверки. Миграционная цепочка отрепетирована на одноразовой копии БД TEST
внутри сервера (без публикации портов, копия удалена): `upgrade` до `0160`,
`downgrade` до `0159` с побайтно совпавшей схемой и счётчиками строк, повторный
`upgrade`, отказ `downgrade` при назначенном филиале. Там же кодом кандидата в
откатываемой транзакции выполнены двадцать адресных проверок — все прошли:
отказ открыть смену без назначенного филиала и в чужом филиале; истёкшая и
действующая замена; идемпотентность открытия; выпуск QR только управляющей или
владельцем; выход без отчёта администратора к оплате не идёт; подтверждённый
отчёт даёт выход к оплате по базовой ставке филиала 800 ₽; один отчёт на смену;
оспаривание создаёт «Брак уборки» и начисление не меняет; график меняет только
управляющая или владелец; назначение вне графика отклонено; чужой мастер
дежурство не видит; цепочка статусов дежурства с возвратом и историей; фильтр
`assignee`.

Граница. Полный прогон тестов, smoke/e2e, ручные сценарии, HTTP-запросы к
приложениям TEST, lint и typecheck не проводились; образы собраны только как
часть развёртывания. Экраны CRM и приложения мастера в браузере не открывались:
обязательный экран смены, скан QR, камера, печатный лист, дежурства, «Моя
зарплата», скрытие «Настроек» и фильтр ответственного глазами не проверены.
Подтверждены коды завершения шагов, записи `progress.log`, SHA образов,
состояние контейнеров по данным Docker и ревизия БД. Снимки
`db/api-contract.json`, схемы backend и `bff/backend-routes.json` не обновлялись;
два цикла ИИ-ревью не проводились по порядку владельца от 30.09.2026.

Production-кандидат по всем продуктам общего TEST подготовлен отдельно и не
утверждён: [RC5](releases/production-rc5-candidate-2026-09-30.md).

## SUM-174 — production-кандидат RC4 «брак и рекламации» готов к утверждению, 30.09.2026

Production не менялся и остаётся на RC2: backend
`5682ad92b828e4cfc3a8bbdbd3bbd63d6182aeff`, CRM
`07f9d7b86b2897a4c2436bfdc0f079186f39884d`, master-app
`070fcd4741cd0df1528c851878400a4eedbf6925`, website
`c234d88704279df85c3a56d2fceb333ae7c1b672`, БД `0143_test_developer_access`
(чтение 30.09 16:40 МСК). Пауза production после RC2, записанная ниже,
действует до утверждения кандидата.

Подготовлен отдельный кандидат только с браком и рекламациями: backend
`9261c3a3c57581b2d5e0e7785796214adcb32706`, CRM
`d7f5653a522b19e4173d2a2932ccd7b64cde4b7b`, БД `0143 → 0155`. Образы собраны и
проверены вне рабочего TEST; коммиты кандидата локальные и в GitHub не
опубликованы. Состав, исключения, флаги, результаты проверок, ограничения,
порядок выкладки и возврата — в
[отчёте кандидата](releases/production-rc4-complaints-2026-09-30.md).

До переключения нужны решения: утверждение номера и состава; недоступность
удаления рекламации при входе CRM `legacy`; показ штрафа по рекламации в
ленте заработка мастера после ревизии 0149.

## SUM-165 — курьер и заказы доставки на общем TEST, 30.09.2026

Поручение разработчика-координатора 30.09.2026: развернуть опубликованный
ранее SUM-165. Production не менялся. Правила — в
[контракте рабочих мест](../contracts/role-workplaces.md#курьер-и-заказы-доставки-sum-165).

| Продукт | Было на TEST (чтение 30.09 15:47 МСК) | Голова `origin/test` | Установлено 30.09 15:50–15:54 МСК | Образ и контейнер |
|---|---|---|---|---|
| backend (API и sync) | `75f555d1a14ccc2c636a3b1d79958c8e2623bee8`, `summy-sum164-backend:75f555d` | `a992249b91e09ed2c21ad9be841a7efe89d11963` | `a992249b91e09ed2c21ad9be841a7efe89d11963` | `summy-courier-backend:a992249` (`sha256:e389bd915d3d…`), API `e81c7f0ed8f2`, sync `cdf6f2585e9e` |
| БД | `0158_role_workplaces` | голова кода `0159_courier_deliveries` | `0159_courier_deliveries` | PostgreSQL не пересоздавался |
| CRM | `95ede26ddbf820189cbeb033c79a8f3e02a4cf57` | `f6c6f49613220bb0dd3e82c8607e6114e062452c` | `f6c6f49613220bb0dd3e82c8607e6114e062452c` | `adminapp:crm-f6c6f49` = `adminapp:latest` (`sha256:96921a6b0ca2…`), `2fbecbe5afa5` |
| master-app, client-app, website | — | — | не менялись | скрипт подтвердил неизменность контейнеров client-app, master-app, PostgreSQL и MinIO |

Порядок выкладки. Перед началом блокировка `/var/lock/summy-test-deploy.lock`
свободна, процессов чужой выкладки нет, последний выпуск — `sum164-20260930`,
завершён в 15:41. Выпуск `/opt/summy-test/releases/courier-20260930`:
`release.py` — копия скрипта `roles-20260930` с заменённым блоком констант
(SHA, архивы, образы, ревизии, действующий compose backend
`releases/sum164-20260930/backend-next.json`, путь копии БД). LF-архивы
`git archive` двух SHA: backend SHA-256
`69a03ca8adfb46c27b14cb343c94eae09e95d1126dd41584eb9f69e647a62342`, CRM
`d217a3d7726910e06d5d719b5b93f1344f5ffef661f74d690899a7dbc597b3ff`; скрипт
сверил их и blob-хеши десяти файлов после распаковки. Шаги и коды завершения:
`prepare` — 0 (сохранение действующих compose, `VERSION` и `.env` в
`preserved/`, сборка двух образов с кешем Docker, `alembic heads` нового
образа — `0159_courier_deliveries`), `backend` — 0, `seed` — 0, `crm` — 0.
В compose backend изменён только образ `api` и `sync`; скрипт подтвердил, что
состав ключей окружения API, sync и CRM не изменился. `stand/up.sh`, restore и
сброс БД не запускались. Условием автоматического отката при активации
служили только состояние контейнера по данным Docker (running, встроенный
healthcheck, без рестартов) и ревизия БД. Шаг `status` отдельно не запускался.

Профили. Шаг `seed` выполнил в контейнере API
`python scripts/seed_test_workplace_profiles.py` (код 0): к трём прежним
профилям добавлен `test-courier` / `courier`, активный. Прежние три профиля и
допуски реальных людей не менялись. Заказы доставки не создавались.

Копия и откат. `/opt/summy-test/backups/courier-before-0159-20260930.dump`
снята при остановленных API и sync на ревизии `0158_role_workplaces`:
44 570 271 байт, SHA-256
`ae707aabc4d35a52494ff51c9fef6a937f392a15d4d5c87bbaf0ad62f6a9504b`, полное
чтение `pg_restore -f /dev/null` успешно; restore не выполнялся. Откат CRM:
`release.py rollback-crm` (каталог `releases/courier-20260930/crm-prev`, образ
`adminapp:pre-courier-20260930`). Откат backend: `release.py rollback-backend`
— `alembic downgrade 0158_role_workplaces` новым образом, затем прежний
compose с `summy-sum164-backend:75f555d`. Ревизия откажет в `downgrade`, пока
есть заказы доставки или строка допуска с ролью `courier`: синтетическую строку
`test-courier` перед откатом нужно удалить отдельной командой, а при
существующих заказах откат схемы требует отдельного решения о данных; скрипт
данные сам не удаляет.

Граница. Тесты, smoke/e2e, ручные сценарии, HTTP-запросы к приложениям и
health, lint, typecheck и отдельные проверочные сборки не проводились; образы
собраны только как часть развёртывания. Экран курьера, вкладка «Доставка» и
вход под `test-courier` не открывались, заказы не создавались, переходы не
выполнялись. Подтверждены коды завершения шагов, записи `progress.log`, метки
SHA образов и ревизия БД, прочитанная самим скриптом. Короткий повторяемый
порядок такой выкладки записан вне Governance, в локальном промпте
координатора `prompts/summy-fast-test-deploy.txt`.

## SUM-164 — «МОЁ» в процессах CRM на общем TEST, 30.09.2026

Прямое решение владельца 30.09.2026: раздел «Задачи» убран, личный отбор и
счётчик перенесены в «Процессы». Production не менялся. Правила и ограничения —
в [контракте личного отбора](../contracts/process-personal-view.md).

| Продукт | Было на TEST (живое чтение 30.09 15:35 МСК) | Опубликовано в `origin/test` | Установлено 30.09 15:37–15:41 МСК | Образ и контейнер |
|---|---|---|---|---|
| backend (API и sync) | `5eaac343d98760aae934ad69366efb848c3bc461`, `summy-roles-backend:5eaac34` | `75f555d1a14ccc2c636a3b1d79958c8e2623bee8` | `75f555d1a14ccc2c636a3b1d79958c8e2623bee8` | `summy-sum164-backend:75f555d` (`sha256:fa87d6f2f1e7…`), API `51200aa68899` healthy, sync `d19878d7e41a` running |
| БД | `0158_role_workplaces` | голова кода `0158_role_workplaces` | не менялась | PostgreSQL `8d64c21e46db` не пересоздавался |
| CRM | `c982a1e65282fe02ab18f37231c392874a6c0ee1` | `95ede26ddbf820189cbeb033c79a8f3e02a4cf57` | `95ede26ddbf820189cbeb033c79a8f3e02a4cf57` | `adminapp:crm-95ede26` = `adminapp:latest` (`sha256:d894654dd118…`), `4c06b6e30376` healthy |
| master-app, client-app, website | `be8e2602b891165b1c5b0e92b9fd2a6859d591f6`, `175633fa52b48430a58bbaf03e4d6cb43f5098c6`, `a086b8386fa886960c795ed30e924a76db6473fb` | — | не менялись | контейнеры `71eaca6eeae6`, `15d5b09c01a6` не пересоздавались, сайт не перезапускался |

Порядок выкладки. Перед началом блокировка `/var/lock/summy-test-deploy.lock`
свободна, незавершённых выпусков нет; последняя запись — `ACTIVE crm` выпуска
`roles-20260930` в 15:16. LF-архивы `git archive` двух SHA сверены по SHA-256
после передачи (backend
`b25aa5d19fb94973dde950bebd53fc27790e84c99a7ed530bdebcb0fb178d8d4`, CRM
`eaf704f3248b490305db938c8a0a0244bb2ab8710ec74c65ae1fb5bfdc7e5df8`) и по
blob-хешам одиннадцати файлов после распаковки. Шаги
`/opt/summy-test/releases/sum164-20260930/release.py`: `prepare` (сохранение
действующего compose backend `releases/roles-20260930/backend-next.json`,
`VERSION`, `.env` и compose CRM в `preserved/`; сборка двух образов по одному;
`alembic heads` нового образа — `0158_role_workplaces`), `backend`, `crm`,
`status` — все с кодом 0. В compose backend изменён только образ `api` и
`sync`; скрипт подтвердил, что состав ключей окружения API, sync и CRM не
изменился и что контейнеры client-app, master-app, PostgreSQL и MinIO остались
прежними. `stand/up.sh`, restore и сброс БД не запускались. Условием отката
при активации служили только состояние контейнера по данным Docker (running,
встроенный healthcheck, без рестартов) и ревизия БД.

Миграций у SUM-164 нет, поэтому копия БД не снималась. Откат: для backend —
`release.py rollback-backend` (compose `releases/roles-20260930/backend-next.json`,
образ `summy-roles-backend:5eaac34`); для CRM — `release.py rollback-crm`
(каталог `releases/sum164-20260930/crm-prev`, образ
`adminapp:pre-sum164-20260930`). Порядок отката любой: старый backend параметр
`mine` игнорирует, новая CRM без подтверждающего заголовка показывает ошибку
личного отбора, а не общий список.

Граница. Позже в `test` опубликован SUM-165 (backend `a992249`, CRM `f6c6f49`,
ревизия `0159_courier_deliveries`) без выкладки: TEST стоит на SHA SUM-164 и
отстаёт от голов `test` на этот коммит. Тесты, smoke/e2e, ручные сценарии,
HTTP-запросы к приложениям, lint, typecheck и проверочные сборки не
проводились; образы собраны только как часть развёртывания. Кнопка «МОЁ»,
счётчик и редирект `/tasks` в браузере не открывались, вход под учётками не
выполнялся, состав личных списков на данных TEST не сверялся. Подтверждены
коды завершения команд, `VERSION`, метка ревизии образов, состояние
контейнеров по данным Docker и ревизия БД.

## SUM-165 — курьер и заказы доставки, публикация в Git, 30.09.2026

Снимок на момент публикации; выкладка того же дня описана в разделе выше.

Поручение разработчика-координатора 30.09.2026 с особым ограничением: только
публикация кода, без выкладки. Правила — в
[контракте рабочих мест](../contracts/role-workplaces.md#курьер-и-заказы-доставки-sum-165).

| Продукт | Было в `origin/test` | Опубликовано |
|---|---|---|
| backend | `75f555d1a14ccc2c636a3b1d79958c8e2623bee8` | `a992249b91e09ed2c21ad9be841a7efe89d11963` |
| CRM | `95ede26ddbf820189cbeb033c79a8f3e02a4cf57` | `f6c6f49613220bb0dd3e82c8607e6114e062452c` |

Оба push — fast-forward без force поверх SUM-164, конфликт при переносе был
только в `CHANGELOG.md` продуктов. Голова миграций кода —
`0159_courier_deliveries`.

Общий TEST в этой задаче не читался и не менялся: код не развёрнут, ревизия
`0159_courier_deliveries` не применялась, seed профиля `test-courier` не
запускался, заказы доставки не создавались. Production не менялся. Тесты,
smoke/e2e, ручные сценарии, lint, typecheck и проверочные сборки не
проводились; новые тесты не писались. Существующие автотесты перечней ролей и
разделов и снимки `db/api-contract.json` и схемы не обновлялись. Порядок
будущего применения и отката — в
[контракте](../contracts/role-workplaces.md#данные-и-откат).

## SUM-156, SUM-157, SUM-158 — рабочие места ролей на общем TEST, 30.09.2026

Прямое поручение владельца 30.09.2026: три рабочих места CRM в аккаунте
разработчика TEST. Production не менялся. Правила и остаток — в
[контракте рабочих мест](../contracts/role-workplaces.md).

| Продукт | Было на TEST (живое чтение 30.09 14:52 МСК) | Голова `origin/test` | Установлено 30.09 15:12–15:16 МСК | Образ и контейнер |
|---|---|---|---|---|
| backend (API и sync) | `9589f1f82e45fb84d0475ad522b1b72ba99608a1`, `summy-origin-test-backend:9589f1f` | `5eaac343d98760aae934ad69366efb848c3bc461` | `5eaac343d98760aae934ad69366efb848c3bc461` | `summy-roles-backend:5eaac34` (`sha256:5af4524bda0d…`), API `b1313f2cb490` healthy, sync `d7483d251268` running |
| БД | `0157_service_resource_exemptions` | голова кода `0158_role_workplaces` | `0158_role_workplaces` | PostgreSQL `8d64c21e46db` не пересоздавался |
| CRM | `b18d823b216f6ba66e036f02c6f6c694d5754ed2` | `c982a1e65282fe02ab18f37231c392874a6c0ee1` | `c982a1e65282fe02ab18f37231c392874a6c0ee1` | `adminapp:crm-c982a1e` = `adminapp:latest` (`sha256:ce1d0ddf0095…`), `883a8133f39a` healthy |
| master-app, client-app, website | `be8e2602b891165b1c5b0e92b9fd2a6859d591f6`, `175633fa52b48430a58bbaf03e4d6cb43f5098c6`, `a086b8386fa886960c795ed30e924a76db6473fb` | — | не менялись | контейнеры `71eaca6eeae6`, `15d5b09c01a6` не пересоздавались, сайт не перезапускался |

Что вошло. Backend `5eaac34` = голова `test`: рабочие места (`722f76a`), а также
SUM-154 (`0cc59da`, две причины закрытия записи) и SUM-155 (`89d639b`, прогресс
повторной записи мастера), которые до этого были только в Git; миграций у них
нет. CRM `c982a1e` — рабочие места поверх `b18d823`.

Порядок выкладки. Перед началом блокировка `/var/lock/summy-test-deploy.lock`
свободна, других выкладок нет; последняя чужая запись — `DONE` SUM-152 в 12:38.
LF-архивы `git archive` двух SHA сверены по SHA-256 после передачи (backend
`332fbcc3f7f8fe1720baa5a0c07211b1c6a51f78991c960dd256e9f39a8b8a9b`, CRM
`b21c13c8ba2d9c6a0f46bfb9c45b857ec81be0788264c32c0c64e7da80ba2cd3`) и по
blob-хешам десяти ключевых файлов после распаковки. Шаги `release.py`:
`prepare` (сохранение действующего compose backend
`releases/origin-test-20260930/backend-final.json`, `VERSION`, `.env` и compose
CRM в `preserved/`; сборка двух образов по одному; `alembic heads` нового
образа — `0158_role_workplaces`), `backend`, `seed`, `crm` — все с кодом 0.
Действующий compose backend сохранён целиком, изменён только образ `api` и
`sync`; скрипт подтвердил, что состав ключей окружения API, sync и CRM не
изменился. PostgreSQL, MinIO, client-app, master-app, оператор и Redis не
пересоздавались. `stand/up.sh`, restore и сброс БД не запускались. Условием
отката при активации служили только состояние контейнера по данным Docker
(running, встроенный healthcheck, без рестартов) и ревизия БД.

Профили. Шаг `seed` выполнил в контейнере API
`python scripts/seed_test_workplace_profiles.py` (код 0) и создал три допуска:
`test-storekeeper` / `storekeeper`, `test-purchaser` / `purchaser`,
`test-accountant` / `accountant`, все активные. До выкладки в
`gateway_admin_access` TEST были по одному допуску владельца, управляющего и
администратора и ни одного бухгалтера; эти строки не менялись.

Копия и откат. `/opt/summy-test/backups/roles-before-0158-20260930.dump` снята
при остановленных API и sync на ревизии `0157`: 44 509 140 байт, режим 0600,
SHA-256 `e8de274a1375dadc9bdb04977af9fbce632838d34a31c78f72394317e071ee2a`,
полное чтение `pg_restore -f /dev/null` успешно; restore не выполнялся. Откат
backend: `release.py rollback-backend` — `alembic downgrade
0157_service_resource_exemptions` новым образом, затем прежний compose с
`summy-origin-test-backend:9589f1f`. Ревизия откажет в `downgrade`, если в
`purchase_requests`, `hr_action_requests` или `accounting_documents` появились
строки либо остались допуски `storekeeper` и `purchaser`: сначала нужно решить
судьбу этих данных, удалять их ради отката нельзя. CRM: `release.py
rollback-crm` — `adminapp:pre-roles-20260930` и каталог `crm-prev`. CRM `c982a1e`
со старым backend работает, кроме трёх рабочих мест: их двери ответят ошибкой
платформы.

Граница проверки: тесты, smoke/e2e, ручные сценарии, HTTP-запросы к `/health`,
`/ready`, `/api/health` и экранам, lint, typecheck и проверочные сборки не
проводились. Подтверждены коды завершения команд, `VERSION`, образы, состояние
контейнеров и ревизия БД. Не проверены: вход под тремя профилями, меню и экраны
рабочих мест, приход и расход, создание заявки и отметка закупщика, решения по
финансовому отчёту, черновые кадровые заявки, загрузка и чтение файлов
документов. На момент выкладки на TEST три склада, 178 материалов, ноль
складских документов и ноль финансовых отчётов смен: остатки начинаются с нуля,
а раздел «Касса и смены» пуст, пока администратор не сдаст финансовый отчёт.

## SUM-152 — общий HTTP Basic Auth TEST отключён, 30.09.2026

Прямое поручение владельца 30.09.2026. Production не менялся.

| Что | До 30.09 12:37 МСК | После |
|---|---|---|
| `/etc/nginx/snippets/summy-test-common.conf` | сертификат, `auth_basic "SUMMY test stand"`, `auth_basic_user_file /etc/nginx/summy-test.htpasswd`, `X-Robots-Tag`; SHA-256 `668784387d79639ab0ea956291f1503c1f0ea880027495db8e090ec1ba85af9e` | сертификат и `X-Robots-Tag: noindex, nofollow`; SHA-256 `8631cef1d1768ec919dc7813fc258ba3c9a673b2792e8528dfb3d7fc256b40bd` |
| `/etc/nginx/sites-available/summy-test` | 443 сайт и `/client/`, 8443 CRM, 9443 мастер | не менялся, SHA-256 `a7d3967385f584de43839dd8bc48b4643923f65265646c2a8a474908d3cb26e2` |
| Общий пароль перед приложениями | на всех трёх портах | отсутствует; вход — только собственная авторизация приложений |

Применение: под общей блокировкой выкладок `/var/lock/summy-test-deploy.lock`
сохранена копия `nginx.conf`, `sites-available`, `snippets` и `conf.d` в
`/opt/summy-test/releases/sum152-20260930/nginx-before` (каталог `0700`,
контрольные суммы — `nginx-before.sha256`), затем `nginx -t` (код 0) и
`systemctl reload nginx` (код 0) в 12:37:59 МСК. Рабочие процессы nginx
сменились (`833`, `834` → `1825506`, `1825507`), `nginx -T` содержит ноль
директив `auth_basic` и одну `X-Robots-Tag`; слушаются прежние 80, 443, 8443,
9443. Журнал — `/opt/summy-test/releases/sum152-20260930/progress.log`.

Перед изменением сверено: выкладка `origin-test-20260930` другой задачи
завершилась записью `DONE` в 12:31:07 МСК, блокировка была свободна, процессов
сборки и выкладки на сервере не было. На момент изменения `VERSION`: backend
`9589f1f82e45fb84d0475ad522b1b72ba99608a1`, CRM
`b18d823b216f6ba66e036f02c6f6c694d5754ed2`, master-app
`be8e2602b891165b1c5b0e92b9fd2a6859d591f6`, client-app
`175633fa52b48430a58bbaf03e4d6cb43f5098c6`, website
`a086b8386fa886960c795ed30e924a76db6473fb`; эта задача их не меняла, контейнеры
не перезапускались. Таблица SUM-123 ниже описывает более ранний срез 11:53 МСК.

Откат: `cp -a /opt/summy-test/releases/sum152-20260930/nginx-before/snippets/summy-test-common.conf /etc/nginx/snippets/summy-test-common.conf && nginx -t && systemctl reload nginx`.
Файл `/etc/nginx/summy-test.htpasswd` сохранён на месте, поэтому откат
возвращает прежние логин и пароль без их повторного создания.

Граница. БД, миграции, контейнеры, TLS, firewall, MinIO и loopback-порты не
менялись; новые порты наружу не открыты. Маршруты приложений без собственной
авторизации теперь доступны из интернета без общего пароля, а на стенде —
реальные клиентские данные; перечень таких маршрутов не проверялся. Тесты,
smoke/e2e, ручные сценарии и HTTP-запросы к приложениям не проводились:
исчезновение окна в браузере подтверждается только конфигурацией и результатом
reload.

## SUM-123 и текущие головы `test` — развернуто на общем TEST, 30.09.2026

Прямое поручение владельца 30.09.2026: развернуть всё на TEST-сервере без
тестирования. Production не менялся.

| Продукт | Было на TEST (живое чтение 30.09 11:41 МСК) | Голова `origin/test` | Установлено 30.09 11:47–11:53 МСК | Образ и контейнер |
|---|---|---|---|---|
| backend (API и sync) | `595e26afeb92e217acd3b6a0831efd28457a25fa`, `summy-sum140-backend:595e26a` | `849d7f4c96980606019bfdd3c2a0191e52ecab80` | `849d7f4c96980606019bfdd3c2a0191e52ecab80` | `summy-sum123-backend:849d7f4` (`sha256:23c2aef7c89b…`), API `41bf01c3eec2` healthy, sync `a864874bea91` running |
| БД | `0155_complaint_delete_event` | голова кода `0156_client_loyalty_cards` | `0156_client_loyalty_cards` | PostgreSQL `8d64c21e46db` не пересоздавался |
| CRM | `46adeaab55d9614377ec44f37ca7f50d75c8b513` | `18f3d59c5a63d8d507e304a93da59eb3a8329023` | `18f3d59c5a63d8d507e304a93da59eb3a8329023` | `adminapp:crm-18f3d59` = `adminapp:latest` (`sha256:ea74fb492f06…`), `85affdbcebef` healthy |
| master-app | `108e2fce65c7d4199e5e7a9d7f6f353b1ef55e92` | `b4ab6b366ea30c33f862aec9dada1959aba12d95` | `b4ab6b366ea30c33f862aec9dada1959aba12d95` | `bff-bff:master-b4ab6b3` = `bff-bff:latest` (`sha256:9742da6eae07…`), `26031c26f11a` running |
| client-app | `8ad3fce7bc8b652792a8533ee7c8a87eb9d229eb` | `8ad3fce7bc8b652792a8533ee7c8a87eb9d229eb` | не менялся — уже на голове | `summy-sum117-client:8ad3fce`, `48dabd5aac72` |
| website | `8bc4072a85949e23a63b0da5eeb7160b29f341b4` | `a086b8386fa886960c795ed30e924a76db6473fb` | не менялся | процесс сайта не перезапускался |

Website: `a086b83` отличается от развёрнутого `8bc4072` одной строкой
`CHANGELOG.md` (запись о прошлой выкладке), исполняемый код совпадает; сайт не
пересобирался, `VERSION` оставлен `8bc4072…`, чтобы он называл дерево
фактической сборки.

Что вошло. Backend `849d7f4` = SUM-141 (`392dcfa`: участники лояльности, снимок
карт YClients, ревизия `0156`) + SUM-123 (`GET /v1/analytics/overview`). CRM
`18f3d59` = SUM-129, SUM-135, SUM-141 и SUM-123 («Аналитика → Обзор») поверх
`46adeaa`. Master-app `b4ab6b3` — 108e2fc плюс обновлённый календарь, нижнее
меню и сворачивание финансовых операций; `bff/docker-compose.bff.yml`,
`bff/Dockerfile` и `bff/backend-routes.json` между `108e2fc` и `b4ab6b3` не
менялись. Методика обзора и доступ — в
[контракте](../contracts/analytics-overview.md). На TEST CRM работает с
`ADMINAPP_AUTH_PROVIDER=gateway`, то есть ограничение legacy-входа обзора
здесь не действует; сам вход и экран не проверялись.

Порядок выкладки. Перед началом: блокировка `/var/lock/summy-test-deploy.lock`
свободна, других `release.py` нет. Сеанс выкладки SUM-141
(`releases/sum141-20260930`) был остановлен координатором на шаге `prepared`:
образы собраны, контейнеры, БД и `VERSION` он не менял; его состав целиком
вошёл в этот выпуск. LF-архивы `git archive` трёх SHA сверены по SHA-256 после
передачи и по blob-хешам ключевых файлов после распаковки. Шаги
`release.py`: `prepare` (сохранение действующего compose backend
`releases/sum140-20260930/backend-next.json`, env, `VERSION`, compose CRM и
master в `preserved/`; сборка трёх образов по одному; `alembic heads` нового
образа — `0156_client_loyalty_cards`), `backup`, `backend`, `crm`, `master` —
все с кодом 0. Действующий compose backend сохранён со всеми прежними
настройками; изменены только образ и добавлен `LOYALTY_CARDS_SYNC_ENABLED=true`
для `api` и `sync` (условие выкладки SUM-141). Скрипт подтвердил: прежние ключи
окружения на месте, добавлен ровно один ключ, `YCLIENTS_READ_ONLY=true`,
токены YClients есть только у `sync`, флаги `CASH_PAYOUTS_ENABLED`,
`PHOTO_PROOF_V2_ENABLED`, `YCLIENTS_PAID_AUTO_CLOSE_ENABLED` отсутствуют;
состав ключей окружения CRM и master не изменился; PostgreSQL, MinIO,
client-app, оператор и Redis не пересоздавались. `stand/up.sh`, restore и сброс
БД не запускались. Условием отката при активации служило только состояние
контейнера по данным Docker (running, встроенный healthcheck контейнера, без
рестартов) и ревизия БД; запросов к приложениям сеанс не выполнял.

Копия и откат. `/opt/summy-test/backups/sum123-before-20260930.dump` снята при
остановленных API и sync на ревизии `0155`: 44 342 973 байта, режим 0600,
SHA-256 `fbf310ed3386b91fb52c2c17178c58eb3751a170e3d6cbaf2d60ab48a3b8daca`,
1891 запись оглавления, 190 таблиц данных, полное чтение `pg_restore -f
/dev/null` успешно; restore не выполнялся. Откат backend: `release.py
rollback-backend` — `alembic downgrade 0155_complaint_delete_event` новым
образом (удаляет только пересобираемый снимок `client_loyalty_cards`), затем
прежний compose с `summy-sum140-backend:595e26a`. CRM: `rollback-crm` —
`adminapp:pre-sum123-20260930` и каталог `crm-prev`. Master: `rollback-master`
— `bff-bff:pre-sum123-20260930` и каталог `master-app-prev`. Старый образ
backend на схеме `0156` не стартует, поэтому порядок отката backend именно
такой.

Граница проверки: после слияния и после выкладки тесты, smoke/e2e, ручные
сценарии, HTTP-запросы к `/health`, `/ready`, `/api/health`, `/healthz` и
экранам, lint, typecheck и проверочные сборки не проводились. Подтверждены
только коды завершения команд, `VERSION`, образы, состояние контейнеров и
ревизия БД. Не проверены: экран «Аналитика → Обзор» и его числа, экран
участников лояльности, ход фонового обхода карт `loyalty_cards` (он включён
флагом и читает YClients в режиме read-only; первый ограниченный прогон
вручную не запускался, наполнение списка не наблюдалось), новые экраны
master-app.

## SUM-117 — два варианта оплаты на общем TEST, 30.09.2026

Решение владельца от 30.09.2026: «Сделай просто два варианта оплаты рядом. Две кнопки на оплату айклинс и новая с картами». Production не менялся.

| Продукт | Было на TEST (живое чтение 30.09 11:10 МСК) | Установлено 30.09 11:15 МСК | Образ |
|---|---|---|---|
| client-app | `5d994f46f5b19dfa0ae09d31d953801ecccbf931`, `summy-sum103-client:5d994f4` (контейнер `02dd65802f4d`) | `8ad3fce7bc8b652792a8533ee7c8a87eb9d229eb` | `summy-sum117-client:8ad3fce` (контейнер `48dabd5aac72`) |

Backend, CRM, master-app, website и БД не менялись; миграций нет. Каталог
выпуска — `/opt/summy-test/releases/sum117-20260930`: LF-архив `git archive`
(SHA-256 `78f01347bd24b3a3379f7bc5b5f3f082c4e66af5338fd08852d1fb47b7f07948`),
`release.py prepare` собрал образ с меткой ревизии, `release.py activate`
поднял сервис `client-app` проекта `summy-client-test` с прежним окружением
из `releases/sum103-111-20260929/client-next.json` и записал `VERSION` (0644).
Обе команды завершились с кодом 0; журнал — `progress.log`, последняя строка
`CLIENT ACTIVE 8ad3fce7bc8b652792a8533ee7c8a87eb9d229eb`. Активация ждала только локальный `/healthz`
контейнера как условие отката. Откат: `release.py rollback` возвращает
`client-old.json` с образом `summy-sum103-client:5d994f4` и прежний `VERSION`.

Git: `client-app/test` `8ad3fce7bc8b652792a8533ee7c8a87eb9d229eb` — merge `work` `f3169d5dd2cc9a16299b1bb7db6f8fd41b14d4d6` без force push;
`client-app/work` удалена удалённо и локально после подтверждения
достижимости её коммитов из `test`.

Граница проверки: тесты, smoke/e2e, ручные сценарии, запросы к приложению
через внешний адрес, lint, typecheck и проверочные сборки не проводились.
Страница `/client/pay/:id` в браузере не открывалась. «Оплата картой» —
предварительный выбор без платёжного backend: платёж не создаётся, реквизиты
не собираются. Первая кнопка — sandbox-ссылка «Яндекс Пэй / Сплит» из backend,
не YClients; активной она бывает только при живой ссылке заказа.

## SUM-140 — удаление рекламации на общем TEST, 30.09.2026

Поручение владельца: добавить кнопку «Удалить рекламацию», сразу опубликовать
в Git `test` и развернуть на общем TEST. Production не менялся.

| Продукт | Было на TEST (живое чтение 30.09 10:35 МСК) | Установлено 30.09 10:44–10:45 МСК | Образ (ID) |
|---|---|---|---|
| backend (`api`, `sync`) | `31124002fd163162ba690645b7de3ca313b4e485`, `summy-rc3-backend:3112400` (`42595d23cb31`) | `595e26afeb92e217acd3b6a0831efd28457a25fa` | `summy-sum140-backend:595e26a` (`0140c97c660b`) |
| CRM | `aee78840fae28adba938e3ab289154df4a0a4c21` (`6e5c51a62f93`, откатный тег `adminapp:pre-sum140-20260930`) | `46adeaab55d9614377ec44f37ca7f50d75c8b513` | `adminapp:latest` = `adminapp:crm-46adeaa` (`51e29d1ee8a4`) |
| БД `summy_data` | `0154_process_type_colors` | `0155_complaint_delete_event` (head) | — |

Оба SHA — головы Git `test` после публикации без force: backend
`3112400 → 595e26a`, CRM `aee7884 → 46adeaa`; readback `ls-remote` совпал.
Прежнее состояние TEST (backend `31124002`, CRM `aee7884`, master-app
`108e2fce65c7d4199e5e7a9d7f6f353b1ef55e92`) прочитано с сервера, а не из этого
документа. master-app, client-app `5d994f46f5b19dfa0ae09d31d953801ecccbf931`
и website `8bc4072a85949e23a63b0da5eeb7160b29f341b4` не менялись: ID
контейнеров master BFF, client-app, PostgreSQL, MinIO, ИИ-оператора и Redis до
и после совпали.

**Совместимость перехода.** Оба коммита — прямые потомки развёрнутых SHA;
Dockerfile и lock-файлы не менялись. Ревизия 0155 только заменяет CHECK
`process_events_kind_known` списком с добавленным `deleted`. До выкладки на
живой БД прочитано: действующий CHECK проверен и совпадает с 0151, событий
2739, все их виды входят в новый список. Старая CRM с новым backend работает
как прежде; новая CRM со старым backend показала бы ошибку при нажатии кнопки,
данные не менялись бы. Отдельная репетиция миграции на копии TEST-БД не
проводилась.

**Резервная копия и откат.** При остановленных `api` и `sync` снят дамп
`/opt/summy-test/backups/sum140-before-0155-20260930.dump`: 44 298 730 байт,
права `0600`, SHA-256 `65736f6a84719d341708734d622d11a653d8325a81f4863847c9b90e461335ce`,
1891 запись оглавления, 190 `TABLE DATA`, полное чтение `pg_restore` в
`/dev/null` без ошибок; восстановление не выполнялось. Простой backend — около
минуты. Каталог релиза `/opt/summy-test/releases/sum140-20260930` хранит
прежние compose, env и VERSION. Откат backend — `release.py rollback-backend`:
остановить новый образ, выполнить `alembic downgrade 0154_process_type_colors`
новым образом и поднять прежний compose. Откат 0155 отказывается работать,
если уже есть событие `deleted`, а прежний образ не запускается на ревизии
0155. Поэтому после первого реального удаления рекламации backend
откатывается только исправлением вперёд либо восстановлением дампа с потерей
более поздних данных. Откат CRM — `release.py rollback-crm`: прежний образ и
каталог. Откат не выполнялся.

**Проверка после выкладки** (10:45 МСК, `smoke.py`, 41 из 41). `/health`
отдаёт `595e26a`, `/ready` отвечает, ревизия `0155`, CHECK содержит `deleted`;
CRM `/api/health` отдаёт `46adeaa`, вход `gateway`; в сборке CRM есть текст
кнопки. Backend `DELETE` по случайному UUID: без сервисного токена 401, без
CRM-сессии 403 `complaint_delete_session_required`, роль в запросе без сессии
не помогает, негодная сессия 401. Через тестовый вход разработчика:
администратор получает 403 `complaint_delete_forbidden` и 403 у двери CRM;
управляющий и владелец — 404 для несуществующей карточки, чужая роль в
запросе отклоняется. Положительный сценарий выполнен внутри контейнера `api`
одной транзакцией на синтетической рекламации и откатан: отказ без сессии и
администратору, удаление управляющим, одно критичное событие `deleted`,
повтор возвращает прежний результат, уведомлений нет, после отката строк не
осталось. Счётчики удалённых процессов, событий `deleted`, предоставлений и
штрафов не изменились; реальные рекламации не удалялись. В журналах `api`,
`sync` и CRM ошибок нет.

**Не проверено.** Нажатие кнопки человеком в браузере на TEST, включая
подтверждение, показ отказа и исчезновение карточки с доски; удаление
настоящей рекламации; запрет для чужого филиала на живых правах TEST; полные
pytest и vitest; независимое ревью. Правило и принятые границы — в
[контракте рекламации](../contracts/reklamaciya.md#поручение-владельца-30092026--удаление-рекламации-sum-140).

## SUM-103, SUM-111, SUM-114 и 0154 — развернуто на общем TEST, 29.09.2026

Поручение Юры: выложить проверенный пакет на общий TEST для ручной приёмки
перед отдельным production-релизом. Production не менялся. Выложены точные SHA
из Git `test` (readback `ls-remote` перед выкладкой совпал):

| Продукт | Было на TEST | Установлено 29.09 23:00–23:03 МСК | Образ (ID) |
|---|---|---|---|
| backend (`api`, `sync`) | `66236171937d2d69e79053a003b40c03af6f412a`, `summy-payroll-backend:6623617` (`c23dd666673e`) | `bf4a947eee7e1c2e1d9275921bbdb88467b2a208` | `summy-sum103-backend:bf4a947` (`7624faa8efbc`) |
| CRM | `259ae55b3b818a43535e85b2ed23452232c0e38c` (`16e661fc3b17`, откатный тег `adminapp:pre-sum103-20260929`) | `5732bef0e2fce8c18302f28e256501c4b86515a1` | `adminapp:latest` = `adminapp:crm-5732bef` (`d3b56c57e07d`) |
| client-app | `cc0fec5c82ada6eaa247107225df2b49f4611db4`, `summy-limits-client:cc0fec5` (`15cadf64aedc`) | `5d994f46f5b19dfa0ae09d31d953801ecccbf931` | `summy-sum103-client:5d994f4` (`3cb63c3af357`) |
| БД `summy_data` (снимок production из SUM-138) | `0151_complaint_claims` | `0154_process_type_colors` (head) | — |

master-app `d6c254b9c7c5eec845ec3a640b97108ecb416e4b` (`bff-bff:master-d6c254b-legacyid`)
и website `8bc4072a85949e23a63b0da5eeb7160b29f341b4` не менялись: ID контейнеров
master BFF, PostgreSQL, MinIO, ИИ-оператора и Redis до и после совпали.
Git `test` master-app (`ee6d1cc`) и website (`a086b83`) впереди TEST и в этот
релиз не входили.

**Репетиция до выкладки** (29.09 22:53–22:55 МСК): одноразовый
`postgres:18-alpine` во внутренней Docker-сети без портов на самом TEST, роли
без паролей и поток `pg_dump | pg_restore` активной `summy_data` (restore без
ошибок, 188 таблиц); alembic из кода `bf4a947` в образе `6623617` (зависимости
не менялись). Цепь `0151 → 0152 → 0153 → 0154` по шагу: счётчики менялись
только добавлением двух пустых таблиц 0153; схема на 0154 против снимка
кандидата — лишь известные 36 объектов (`schema_migrations`,
`zzz_bak_tech_*_20260806`). Откат до 0151 вернул схему (сравнение `pg_dump --schema-only`)
и счётчики 0151, повторный upgrade дал ту же схему.
Краски: `appointment_reschedule` `teal` → `#6995b5`, `payroll_dispute` `gold` →
`#d3b89d`, `inspection` `teal` и `improvement` `gold` не тронуты. На синтетике в
копии: вручную выбранная краска сохраняется при upgrade и downgrade; если
целевой цвет занят другим активным видом, вид не перекрашивается; при наличии
начисления откат 0153 отклонён (`Cannot downgrade 0153 while loyalty credits
exist`), ревизия осталась 0154. Проверка отката 0152 с синхронизированными
требованиями пропущена: в копии их было 0. Действующие контейнеры, ревизия и
краски live-БД до и после репетиции совпали; копия, сеть и каталог удалены.

**Выкладка** — скрипт `/opt/summy-test/releases/sum103-111-20260929/release.py`
по образцу `payroll-20260929`, под общим замком
`/var/lock/summy-test-deploy.lock`. Образы собраны по одному из
`git archive` (LF, SHA-256 архивов сверены) при работающих старых контейнерах.
Затем `api`/`sync` остановлены (API недоступен ≈2 мин), снята копия
`/opt/summy-test/backups/sum103-111-before-0152-20260929.dump` (custom,
44 200 139 байт, SHA-256
`a3dee916a3d7669bced8bff55742f02c0021b332fb9b01d3c91eee323d1ef826`,
`pg_restore --list`: 1870 записей, 188 TABLE DATA, полное чтение
`pg_restore -f /dev/null` без ошибок; restore не выполнялся). Миграции 0152,
0153, 0154 применены по одной разовыми контейнерами нового образа со сверкой
`alembic_version` после каждой. Потом по очереди запущены backend, CRM и
client-app. Конфигурация: `api`/`sync` —
`releases/sum103-111-20260929/backend-next.json` = `prod-db-20260929/backend-prodsnap.json`
с новым образом (env не менялись, `PLATFORM_ID_ENABLED=false` сохранён);
client-app — прежний `limits-20260929/client-next.json` с новым образом; CRM —
свой compose с прежним `.env`. Копии compose/env/VERSION — в `preserved/`
(с SHA-256), прежний исходный каталог CRM — `crm-prev`, старые image ID — в
`state.json`. Секреты не выводились.

**Readback после выкладки** (23:04–23:08 МСК, выводились только коды, версии,
ID и счётчики): VERSION всех пяти продуктов как в таблице; backend `/health`
version `bf4a947…`, `stand=on`, `/ready` ready, `alembic current` =
`0154_process_type_colors (head)`; CRM `/api/health` sha `5732bef…`,
`authMode=gateway`, `demoData=off`; master `/healthz` version `d6c254b…`,
`shell=ok`; client `/healthz` ok, `mode=live`, `/client/` 200; website 200;
nginx без Basic Auth — 401 на 443/8443/9443. Краски в БД и в
`GET /v1/processes/types`: `#6995b5`/`#d3b89d`, дублей краски у активных видов
нет. OpenAPI содержит пять новых путей: `POST /v1/clients/{client_id}/loyalty-credits`,
`GET …/loyalty-credits/unresolved`, `POST …/{credit_id}/reconciliation` (SUM-103),
`GET /v1/client/complaints/{complaint_id}` и `…/photos/{photo_id}` (SUM-111).
Без сессии все пять — 401, в том числе только с сервисным токеном; client BFF
на карточку и фото рекламации — 401, неверный путь — 404; CRM BFF без cookie —
307 на `/login` (общий middleware CRM, как у прежних маршрутов). Адресный smoke
через CRM `/login_dev` 18/18: владелец — чтение незавершённого начисления 200
(`credit=null`), BFF отклоняет неверное тело 400 до backend; управляющая — 403
на чтение и запись; после logout токен 401. Записано только служебное
`test_developer_*`; `client_loyalty_credits` и сверок — 0. Первый цикл sync
новым кодом (catalog 23:05 МСК) прошёл успешно и создал 256 синхронизированных
требований ресурсов (до выкладки 0). В журналах `api`, `sync`, CRM, client и
master BFF с 23:02 МСК — 0 строк error/exception, 0 ответов 5xx.
Предохранители: `YCLIENTS_READ_ONLY=true` у `api` и `sync`, токенов YClients в
`api` нет, `PLATFORM_ID_ENABLED=false`.

**Не проверено и ограничения ручной приёмки.** Живое начисление бонусов не
выполнялось и на TEST невозможно: YClients в режиме только чтения, кнопка
начисления вернёт отказ; это не доказательство работы начисления. Браузерные
сценарии CRM, клиентского приложения и мастера после входа не проверялись;
в снимке production нет клиентских аккаунтов (`client_portal_accounts` = 0),
поэтому «Мои рекламации» SUM-111 в клиенте на данных TEST пока не открыть без
отдельного решения о тестовой учётке. SMS, платежи и POST в YClients не
запускались.

**Откат** (только по конкретному сбою, с отдельным отчётом), порядок — в
`releases/sum103-111-20260929/README.txt`. client-app и CRM — прежние образы и
compose (`client-old.json`, `adminapp:pre-sum103-20260929` + `crm-prev`).
Backend: старый `6623617` на схеме 0154 не стартует (его alembic не знает
0152+), поэтому `release.py rollback-backend` сначала делает `alembic downgrade
0151_complaint_claims` **новым** образом и только затем запускает `6623617` с
прежним compose. Это допустимо, пока `client_loyalty_credits` и сверки пусты:
0154 возвращает `teal`/`gold` только там, где краска ещё мигрированная; 0153
удаляет пустые таблицы; 0152 удаляет синхронизированные требования ресурсов
(сейчас 256, до выкладки 0) и их `external_refs`. Если начисления уже есть,
0153 откат отклоняет; строки неизменяемы триггером и не удаляются — тогда
исправление вперёд или restore копии в новую БД только по отдельному решению
(теряются все изменения TEST после 23:00 МСК). `prod-db-20260929/cutover.sh
rollback` из SUM-138 по-прежнему переименует текущую `summy_data` (0154) и
вернёт прежнюю TEST-БД (0151) с `6623617`; без отдельного решения не запускать.

Git-публикация этих SHA — [в ревизии веток](branch-audit-2026-09-29.md#публикация-b6-sum-114-и-0154-в-git-test-29092026).

## SUM-138 — общий TEST на снимке production-БД, 29.09.2026

Поручение Юры ([SUM-138](https://summy.youtrack.cloud/issue/SUM-138)): TEST
работает на свежих production-данных, а разработчик через `/login_dev`
(SUM-104) выбирает действующего сотрудника в пределах его прав. Production
использовался только на чтение: разовый `pg_dump -Fc` в read-only транзакции,
без nightly-скрипта, prune и S3. Секреты и дампы в Governance не пишутся.

| Что | Состояние после 29.09 17:05 UTC |
|---|---|
| Активная `summy_data` | снимок production 2026-09-29 16:26:19 UTC (`0143`) + миграции 0144→0151 образом `summy-payroll-backend:6623617`; `alembic_version` = `0151_complaint_claims` |
| Прежняя TEST-БД | `summy_data_pre_prod_20260929` (не удалять до приёмки) и полный дамп в `/opt/summy-test/backups/prod-refresh-20260929T162418Z/` |
| backend | `66236171937d2d69e79053a003b40c03af6f412a`, compose `/opt/summy-test/releases/prod-db-20260929/backend-prodsnap.json` — прежний `payroll-20260929/backend-next.json` с единственным отличием `api` `PLATFORM_ID_ENABLED=false` |
| master-app | `d6c254b9c7c5eec845ec3a640b97108ecb416e4b`, образ `bff-bff:master-d6c254b-legacyid` (`VITE_PLATFORM_ID_ENABLED=false`), `bff/.env` `PLATFORM_ID_ENABLED='false'` |
| CRM / client / website | без изменений (`259ae55…`, `cc0fec5…`, `8bc4072…`) |

Переключение: `api`/`sync` остановлены, базы переименованы одной транзакцией
(`summy_data` → `summy_data_pre_prod_20260929`, `summy_data_next` →
`summy_data`), `api`/`sync` запущены; API был недоступен ≈40 с, master BFF
перезапущен следом. `stand/restore.sh` не использовался.

Что в снимке для входа: 3 активных CRM-допуска (owner, manager,
administrator), 0 филиальных допусков, 0 аккаунтов и привязок Platform ID,
41 однозначная привязка `staff_user`, 0 `client_portal_accounts`, 0 ожидающих
outbox/уведомлений/платежей. Все сессии и `test_developer_*` очищены в staging.
Без Platform ID-привязок режим `true` дал бы пустой список мастеров, поэтому
TEST переведён на legacy-режим, как в production. `LEGACY_MASTER_ID_ENABLED`
не задан (закрыт). `SESSION_SECRET` не менялся.

Проверено на сервере (29/29, выводились только коды, роли и числа): `/health`
и `/ready` api (version `6623617…`, stand=on), маршрутизатор Platform ID
отвечает 404; CRM `/login_dev` — неверный пароль 401, чужой Origin 403, вход
`developer`, 3 профиля, выбор каждого даёт его роль; филиалы owner — все
(2), manager/administrator — 0, как в production; сотрудник без CRM-допуска
отклонён; после logout токен 401. Master `/login_dev` — 41 мастер, выбор,
сессия, read-only `/v1/finance`, logout (токен 401); обычный master-вход,
сессия, logout, неверный пароль 401. Предохранители: `YCLIENTS_READ_ONLY`,
SMS `stand`, CRM/process session required, токенов YClients в api нет,
merchant/SMTP/Telegram нет; nginx без Basic Auth отвечает 401.
**Не проверены** браузерные сценарии CRM/master/client и client
`/login_dev` (учёток в снимке нет).

Старые cookie **не отозваны**: CRM- и master-токены stateless. По коду
CRM BFF и backend сверяют роль с `gateway_admin_access` на каждом запросе,
а филиалы берут из текущей БД; master-токен проходит только при той же паре
user → staff. Сверка с прежней БД: 3/3 CRM-допуска совпадают по пользователю
и роли (филиалов стало меньше), 40 из 41 master-пар совпадают, одна
отличается и отклоняется. Чужой роли или расширения прав старые токены не
получают. Developer-, Platform ID- и клиентские сессии хранятся в БД и
очищены.

Откат (минуты, без restore): `/opt/summy-test/releases/prod-db-20260929/cutover.sh rollback`
— переименовывает `summy_data` в `summy_data_prod_refresh_failed_20260929`,
возвращает `summy_data_pre_prod_20260929`, прежний compose, образ
`bff-bff:pre-prodsnap-20260929` и прежний `bff/.env`.

## SUM-119/120/122 — развернуто на общем TEST, 29.09.2026

Разрешение Юры на эту выкладку TEST, production не менялся. Выложены точные
SHA из `test` (опубликованы и проверены Codex до выкладки):

| Продукт | Было на TEST | Установлено 29.09 ≈17:05–17:16 МСК | Образ |
|---|---|---|---|
| backend | `fc648ca8f514c3ba61759d1435a047680d79eac9` | `66236171937d2d69e79053a003b40c03af6f412a` | `summy-payroll-backend:6623617` |
| CRM | `3dd2910c5695bddd90663a338346d7e37a7e541f` | `259ae55b3b818a43535e85b2ed23452232c0e38c` | `adminapp:latest` = `adminapp:crm-259ae55` |
| master-app | `085a1e36823a27174ce7a2eff977efd168c14006` | `d6c254b9c7c5eec845ec3a640b97108ecb416e4b` | `bff-bff:latest` = `bff-bff:master-d6c254b` |
| БД | `0147_operator_history` | `0151_complaint_claims` (head) | — |

master-app `test` к моменту выкладки ушёл вперёд до `f7041e3` (SUM-116,
«убрать накопленные баллы с экрана штрафов»); этот коммит **не** одобрялся
к выкладке и на TEST не установлен.

Порядок: образы собраны из `git archive` точных SHA, пока работали старые
контейнеры. Затем backend `api`/`sync` остановлены, снята копия
`/opt/summy-test/backups/payroll-before-0148-20260929.dump` (custom,
43 866 430 байт, SHA-256
`e0b887db11f73dbcb9a2e6f9e929702a90489b539952c183b7991fde38d10e50`,
`pg_restore --list`: 1827 записей, 184 TABLE DATA; restore не выполнялся).
Миграции `0148_payroll_v1` → `0149_staff_penalty_payroll` →
`0150_cleaning_rates_manager_pay` → `0151_complaint_claims` применены
по одной разовыми контейнерами нового образа, после каждой сверена
`alembic_version`. Потом последовательно запущены backend, CRM и master BFF.

Конфигурация: активный compose backend —
`/opt/summy-test/releases/payroll-20260929/backend-next.json`, это прежний
`history-20260928/backend-next.json` с новым образом `api`/`sync` и одной
добавленной настройкой `api`: `MANAGER_PAY_APPROVER_YCLIENTS_USER_ID`
(ID Кирилла, владельца TEST, по указанию Юры). Эта же строка дописана в
`backend/.env.stand`, остальные значения env не менялись. Не заданы
`CLEANING_LOCATION_RATES_FROM`, `CLEANING_CHECKLIST_NO_DELAY_FROM` и
`YCLIENTS_PAID_AUTO_CLOSE_*`; `YCLIENTS_READ_ONLY` остаётся `true`. CRM и
master BFF запущены своими compose (`crm/docker-compose.prod.yml`,
`master-app/bff/docker-compose.bff.yml`) с `--no-build --no-deps` и прежними
`.env`. Для отката сохранены: прежние каталоги `crm-prev` и `master-app-prev`,
копии env/compose/VERSION в `releases/payroll-20260929/preserved/`, образы
`summy-history-backend:fc648ca`, `adminapp:pre-payroll-20260929` и
`bff-bff:pre-payroll-20260929`. Старый backend не стартует на схеме `0151`
(неизвестная ревизия), поэтому откат backend — только через отдельное
решение о restore копии или проверенный downgrade.

Первая попытка CRM автоматически откатилась: созданный скриптом `VERSION`
имел права `0600`, и процесс `nextjs` его не читал (health отдавал
`0.1.0`). После `chmod 644` и пересборки второй запуск прошёл. Кроме того,
около 17:12 МСК контейнер `summy-ai-operator-test` был пересоздан отдельным
релизом `date-20260929` (образ `summy-date-operator:5e60637`), не этой
выкладкой; его `/health` отвечает 200.

Проверки после выкладки (только чтение, без записей в YClients и без
клиентских данных в выводе): backend `/health` version `6623617…`,
`/ready` ready, `alembic current` = `0151_complaint_claims (head)`; CRM
`/api/health` sha `259ae55…`, `authMode=gateway`, `demoData=off`;
master `/healthz` version `d6c254b…`, `shell=ok`. `GET /v1/cleaning/location-rates`,
`/staff-rates`, `/pay-rules` отвечают 200 с сервисным токеном; без токена
и без CRM-сессии — 401 (`/payroll/manager-salary`). OpenAPI содержит
новые пути `manager-salary`, `location-rates`, `staff-rates`,
`payroll-disputes`, `close-penalty-preview`, `processes/{id}/claim`. За
первые минуты ошибок в журналах api/sync/CRM/BFF нет. Сценарии в UI после
входа (принятие рекламации, ставки уборки, оклад управляющей, «Мои клиенты»)
**не** проверялись: нужна ручная приёмка.

## SUM-119 — кандидат рекламаций, 29.09.2026 (не опубликован)

Контракт — [рекламация, SUM-119](../contracts/reklamaciya.md#реализация-кандидата-29092026-не-опубликована).
Локальные коммиты ждут независимого ревью Claude и ревью координатора. Push в
`test` и выкладка TEST не выполнялись, production не менялся.

- backend `66236171937d2d69e79053a003b40c03af6f412a` (`aa194a4` → `797c9e2` → `6623617`) поверх `backend/test`
  `31b6b23`: принятие до полуночи, вид брака по услуге, ревизия
  `0151_complaint_claims`, отказ в штрафе уборщице по рекламации,
  исправления ревью (атомарность claim через HTTP, claim в легаси-режиме);
- CRM `259ae55b3b818a43535e85b2ed23452232c0e38c` поверх `crm/test` `ea7f3ea`.

Незавершённые рабочие копии `.worktrees/sum119-backend` и `.worktrees/sum119-crm`
сохранены без изменений. Кандидат собран из их диффа переносом в новые
worktree `sum119-backend-v2` и `sum119-crm-v2`, а не слиянием `work`.
Проверки и их границы — в [CHANGELOG](../CHANGELOG.md).

## SUM-122 — статистика «Мои клиенты» в ветках test, 29.09.2026

Контракт — [видимость клиентов](../contracts/master-client-visibility.md#минимальный-список-v1).
После независимого ревью Claude и ревью координатора опубликовано
fast-forward без force: backend `test`
`0dbb329..7dc05ff70752e119c96c4ef21a86714127b1847c`, master-app `test`
`829af9c..d6c254b9c7c5eec845ec3a640b97108ecb416e4b`. Это Git-состояние, не
развертывание: код не развёрнут на общем TEST-сервере, production не
менялся. Функциональные проверки с БД и UI не выполнялись.
Backend `7dc05ff` синхронизирует полный снимок `db/api-contract.json` с
фактическим API `origin/test`: прежний снимок уже отставал на 14 схем и
9 путей, поэтому дифф шире SUM-122. Координатор запускал
`test_contract_snapshots.py`: OpenAPI-проверка прошла, две DB-проверки не
выполнены из-за недоступной локальной PostgreSQL :5433.
`db/schema-contract.json` и схема БД не менялись.

## SUM-120 — зарплата в ветках test, 29.09.2026

Контракт — [payroll-v1](../contracts/payroll-v1.md). Опубликовано в `test`:
backend `9ce262c` (ревизия `0148_payroll_v1`), master-app `6be4510`, CRM
`273044b`. Это Git-состояние, не развертывание: на общем TEST-сервере миграция
`0148` не применена и образы не обновлены; production не менялся. Тесты после
указания владельца 29.09 не запускались; существующие тесты старого POST
корректировок требуют переноса на новую команду.

Управляющая, уборщица и дни выплаты 10/25 — по решениям Кирилла SUM-110
7-348…7-351 и SUM-96 7-298, а также решениям Юры 29.09. После независимого
ревью и одобрения координатора **опубликовано в `test`** fast-forward без
force: backend `ecf87af..31b6b2357e70aafde197e52867ac698efbab79c7`, CRM
`273044b..ea7f3ea1a8814b6c13b759218055c9d4e1a57c06`. Это Git-состояние, **не
развертывание**: на общем TEST-сервере миграция `0150` не применена, образы
не обновлены, production не менялся. Даты `CLEANING_LOCATION_RATES_FROM` и
`CLEANING_CHECKLIST_NO_DELAY_FROM` не заданы. ID Кирилла в
`MANAGER_PAY_APPROVER_YCLIENTS_USER_ID` задаётся только в конфигурации TEST
после сверки; до этого запись фактов управляющей отвечает 403. Снимок схемы
в `31b6b23` также синхронизировал уже опубликованные объекты SUM-116.
Риск P2 «штраф уборщице через ручную рекламацию» подтверждён тестом
29.09. Исправление — кандидат SUM-119 `797c9e2`, пока не опубликовано. До
публикации в `test` риск в `31b6b23` сохраняется.
Ниже — история кандидата.

- **backend.** Коммиты `6425b65` → `0a53896` → `b70aa18` — перенос прежнего
  кандидата `e560790`/`6ce89e4`/`d1c329f` cherry-pick на `origin/test`
  `7dc05ff`. Поверх них `4e6cc24` (`4e6cc24baab749ab945b24af4992d1d8602dbff2`): ревизия
  `0149_cleaning_rates_manager_pay` после `0148_payroll_v1`.
- **CRM.** `d8d61e3` → `2278856` → `b950385` → `ae31231` (`ae31231139ac83a17b6a2158222d5d1250c6ece5`) поверх
  неизменной `crm/test` `273044b`.
- **Исправления независимого ревью** (локально): backend `0304aa2`
  (`0304aa2bb38d64e115ef837f4d527e92b4a824da`) поверх `4e6cc24`, CRM `23460e5` (`23460e569202d6ff6226ffc62a973a86cbf6f659`) поверх `ae31231`.
- **Перенос на новый `backend/test`** (локально, 29.09.2026). Безопасный push
  остановили: в `backend/test` появились SUM-116 `e6addc4` с ревизией
  `0149_staff_penalty_payroll` и сверху SUM-93 `ecf87af`
  (`ecf87af129b988578ca95c6401d21a2ca1d73c18`). Пять коммитов SUM-120 перенесены
  cherry-pick без изменения SUM-116 и SUM-93: `46f6efb` → `9cc4b14` →
  `9cb7522` → `48e0939` → `d13bb70`. Сверху `31b6b23`
  (`31b6b2357e70aafde197e52867ac698efbab79c7`) переименовывает
  ревизию в `0150_cleaning_rates_manager_pay` после `0149_staff_penalty_payroll`.
  В промежуточных коммитах переноса ещё две головы Alembic, одна голова — только
  на `31b6b23`. CRM `ea7f3ea` (`ea7f3ea1a8814b6c13b759218055c9d4e1a57c06`)
  поверх `23460e5` меняет только ссылку на ревизию в CHANGELOG.

Что сделано:

- ставка уборщицы за выход: сначала персональная, затем филиала (800/1 200 ₽);
  меняют только на будущие выходы: ставку филиала — управляющая этого
  филиала, персональную — управляющая всех активных филиалов, владелец —
  любую; прежняя ставка вида закрыта (410);
- оклад управляющей 80 000 ₽ по фактам, подтверждённым только Кириллом
  (`MANAGER_PAY_APPROVER_YCLIENTS_USER_ID`, пока не задан), отмена гарантии с
  полного месяца и честная неполнота премий и штрафов;
- день выплаты 10/25 у администратора и уборщицы.

Проверено на одноразовой PostgreSQL 18:

- миграция с нуля, откат и повторный накат;
- `verify.sql`;
- сверка снимков API и схемы генераторами;
- 94 адресных теста под двумя часовыми поясами; после ревью — 82 адресных
  теста под двумя поясами и отказ downgrade при записанных фактах;
- CRM: `tsc`, eslint изменённых файлов и 10 тестов vitest; после ревью —
  43 теста vitest.

После переноса на `ecf87af` для `31b6b23`: цепочка `0148` → `0149` → `0150`
с нуля, один head, откат с сверкой объектов SUM-116 и 58 адресных тестов под
двумя поясами. Перед публикацией проверки заново не запускались.

Полная матрица, build, браузер и общая TEST-БД не проверялись. Нет
утверждённых дат введения ставок, суммы за цветы, источников KPI, премий и
штрафов управляющей и
деления её оклада между 10 и 25 числом. Номер `0149` занят SUM-116
(`0149_staff_penalty_payroll`), SUM-120 — `0150`. Ревизию SUM-119 перед
публикацией нужно перенумеровать в `0151`, будущая лояльность идёт после неё.
Штрафы SUM-116 в оклад управляющей не входят. Подробности —
[контракт](../contracts/payroll-v1.md#управляющая-и-уборщица) и
[БД](database.md#кандидат-sum-120-ставки-уборки-и-факты-оплаты-управляющей).

## Пауза дальнейших production-выкладок, 28.09.2026

После RC2 владелец указал больше ничего не выкладывать в production. Текущая работа SUM-117 опубликована только в названную им ветку `work`. Без нового явного решения владельца не переносить дальнейшие изменения на production-сервер и в production-ветки. Это ограничение не меняет факта уже выполненной RC2-выкладки ниже.

## SUM-112 — RC2 развернут на production, 28.09.2026

После прямого утверждения RC2 последовательно переключены backend
`5682ad92b828e4cfc3a8bbdbd3bbd63d6182aeff`, CRM
`07f9d7b86b2897a4c2436bfdc0f079186f39884d`, master-app
`070fcd4741cd0df1528c851878400a4eedbf6925` и website
`c234d88704279df85c3a56d2fceb333ae7c1b672`. Переключения подтверждены
в 15:20:49, 15:21:21, 15:21:41 и 15:22:14 МСК соответственно; health
сообщили точные версии. Четыре production-ветки продвинуты fast-forward.
Новый client-app не поставлялся; его production-ветка сохраняет `4a3a245`.

Перед миграцией полностью прочитан свежий production-дамп
`summy-2026-09-28-1519.dump`. Alembic `0116→0143` применён к существующей
managed БД, ревизия `0143_test_developer_access` подтверждена. Таблиц
150→181; прежние таблицы не исчезли, уменьшений количества строк нет,
`process_types` выросла 9→11. Новые cash-выплаты/фотоштрафы, TEST-входы,
orders/master booking/client portal выключены; legacy CRM и production env
сохранены. Sync содержит 12 действующих jobs, `photo_proofs` выключен.

Итоговый postdeploy helper: **41/41**. Три первоначальных несовпадения CRM
объяснены действующим redirect на login; helper исправлен по коду proxy
и проверяет точный `Location`, продукт не менялся. Публичные страницы и JS
сайта/CRM/мастера ответили HTTP 200, исходные env побайтово сохранены.
После выпуска свободно 7.07 GiB. Опубликованы и сверены аннотированные теги
backend `v0.1.0`, CRM `v0.177.0`, master `v0.79.0`, website `v2.30.0`.
Пользовательский вход, внешние записи, платежи/SMS/выплаты не выполнялись.
Полные image IDs, backup, откат и границы проверки —
[отчёт выкладки RC2](releases/production-rc2-deployment-2026-09-28.md).

## SUM-112 — историческая подготовка RC2 до нового утверждения, 28.09.2026

RC1 прямо утверждён в чате агента, но проверка действующей конфигурации выявила
блокеры: ungated cash-выплаты/фотоштрафы и несовместимость нового поиска
рекламаций с legacy-входом CRM. Production-код и схема 0116 не переключались;
production-ветки и release tags не изменялись. Подготовлены rollback-копии.
Миграции 0116→0143 прошли на разрешённой изолированной копии production;
пропавших существующих строк не найдено. После проверки дамп и временная
среда удалены. Локально подготовлены RC2 backend 5682ad9, CRM 07f9d7b,
master 070fcd4; website сохраняет c234d88. Локальные целевые проверки и
независимое ревью прошли, DB-регрессии и сборки RC2 ещё не выполнены.
Автоматическая проверка разрешений отклонила передачу нового RC2 на TEST
как не покрытую утверждением RC1; обходов не было. Запрошено решение
по конкретному RC2. Подробности —
[production-проверка и подготовка RC2](releases/production-rc2-preparation-2026-09-28.md).


## SUM-104 — отдельные адреса входа на TEST, 27.09.2026

На общем TEST развернуты CRM `3dd2910c5695bddd90663a338346d7e37a7e541f`, master-app `085a1e36823a27174ce7a2eff977efd168c14006` и client-app `fb90d47423d0255a22cf0301e2697e7474a5bdbc`. Обновлены только три приложения: backend `37fed5ca233aa1a1728a02200aa8062482fc5217`, website `c234d88704279df85c3a56d2fceb333ae7c1b672` и миграционная ревизия `0143_test_developer_access` остались прежними. Перед поставкой сохранены исходные деревья и прежние Docker-образы в `/opt/summy-test/releases/hidden-dev-login-20260927T1507`; закрытые env не менялись. Сборки трёх образов прошли. CRM `/api/health` вернул `ok` и новый SHA, master-app `/healthz` вернул `ok`, `shell=ok` и новый SHA; client-app `/healthz` вернул `ok`, запущен образ с тегом нового SHA.

Обычные формы входа теперь не показывают разработческий режим; прямые адреса перечислены в [контракте SUM-104](../contracts/test-developer-access.md). По просьбе владельца браузерный вход и открытие страниц на этом релизе не проверялись. Серверные health-проверки не подтверждают пользовательский сценарий входа. Production не менялся.

## SUM-111 — код в `work`, 27.09.2026

По прямому поручению владельца коммиты SUM-111 опубликованы в `backend/work` `337493c62c439aad41f96b45c8b16cbb4dfd0e65` и `client-app/work` `60627dd0c87a03e218301b32634ee996417aab46`. Backend отключает автоматический исторический срок для новых рекламаций и даёт клиенту ограниченное чтение собственных карточек и фото. Подтверждённая ручной сверкой компенсация включена в ответ; внутренние комментарии и причины отказа исключены. Client-app показывает список, карточку и служебные сообщения; локальное демо после входа отдаёт пустой список.

Сборка client-app, 8 web-тестов и 20 Node-тестов прошли; изменённый Python прошёл синтаксическую проверку. Backend-интеграционный pytest не выполнен без проектного Python 3.14, pytest и PostgreSQL. Полная проверка форматирования client-app не прошла из-за 18 файлов, включая прежние несвязанные файлы. Отдельный Claude review и человеческое ревью прав не проведены. `origin/test`, TEST-сервер, миграции и production этим выпуском не обновлены. Остальные утверждённые блоки SUM-111 открыты; текущий TEST-срез ниже ими не обновлён.

## SUM-112 — релизная проверка общего TEST, 27.09.2026

На TEST после резервной копии `/opt/summy-test/backups/sum112-pre-20260927T110047Z` развернуты `backend/test` `37fed5ca233aa1a1728a02200aa8062482fc5217` (API и sync) и `client-app/test` `eb7a69c753278edb8c446deccea9605eab66b282`. CRM `850522db52ad1c40f4b9fcbf89aaa03218ebe9a9`, master-app `1a9dd2fd5684fd78448649693cabede7914bb258` и website `c234d88704279df85c3a56d2fceb333ae7c1b672` не менялись. Ревизия БД `0143_test_developer_access`; backend сообщает новый SHA, `/ready` отвечает. Health backend, CRM, мастера и клиента — HTTP 200. Копия перед выкладкой содержит PostgreSQL, MinIO, код, env, overrides и прежние Docker-образы; контрольные суммы проверены.

На исправленном backend кандидате локально прошли 2050 тестов на чистой PostgreSQL, 210 денежных тестов в UTC, `ruff`, `mypy`, `deptry`, схема и OpenAPI. Клиент прошёл форматирование, 8 UI и 18 BFF тестов и сборку. Через Edge на общем TEST открыты клиентский вход, список записей и форма рекламации, вход и список процессов CRM, портфолио сайта. У единственного TEST-профиля клиента нет визита за 31 день, поэтому отправка рекламации не проверена. Выбор слота и создание заказа не приняты; сайт сохраняет запись через YClients. Прямой браузерный порт мастера не прошёл Basic Auth, хотя его health ответил и локальная ручная проверка приложения прошла. Внешние платежи, SMS и денежные операции не подтверждены. Production не изменялся; релизный состав и утверждение production-кандидата остаются отдельным шагом.

## SUM-104 — общий TEST, 26.09.2026

После проверенной резервной копии `/opt/summy-test/backups/sum104-pre-20260926T122427Z` на Docker Compose TEST развернуты backend `c9338b3d7886d7e3df603d1e8ca6b1790e9b820d`, CRM `850522db52ad1c40f4b9fcbf89aaa03218ebe9a9`, master-app `1a9dd2fd5684fd78448649693cabede7914bb258`, client-app `d9880703e218ee0c935ef92b8440385256e51fb8`. Миграции 0142–0143 применены к TEST-БД. Серверные проверки подтвердили вход через три BFF, выбор реальных учёток, отказ для недопустимых ID, отзыв предыдущей сессии при смене и выходе. TEST использует отдельные PostgreSQL и MinIO, локальный SMS sink, отключённые внешние SMS и CRM YClients credentials. Edge-проверка экранов ожидает прохождения системного HTTP Basic Auth окна; её нельзя подменять серверным smoke. Production не изменялся. Прямой production POST к CRM и client тестовым маршрутам дал 404, master вернул только HTML SPA без сессии; backend с production-конфигурацией не зарегистрировал тестовые маршруты. Следующие выкладки требуют повторной проверки, потому что текущее состояние не гарантирует будущую конфигурацию.

## Дополнение 25.09.2026 — рекламации, клиентское приложение и ветки

В `test` backend, CRM и client-app перенесены новые рекламации и клиентская
запись: поиск клиента по мере ввода с равными телефонными префиксами `+7`,
`7`, `8`; форма CRM без источника обращения, с подписями «Категория», «Вид
рекламации», «Описание», «Фото»; клиентская жалоба из услуги, описания и фото;
любимые мастера, категории услуг, лояльность и акции. Backend-ревизия 0141
поддерживает основную и дополнительные услуги в одном слоте. Чат клиента
остаётся экраном без отправки сообщений.

До этого переноса backend, CRM и клиентское приложение были обновлены на
TEST прямой поставкой файлов; ревизия 0141 применена к TEST-БД, проверки
готовности backend и CRM дали 200. Последняя смена подписей CRM находится в
Git `test`, её отдельный deployment на TEST не подтверждён. YClients на TEST
отключён: реальная запись, начисления и остаток бонусов сквозным сценарием
не проверены. Для текущей реорганизации веток автотесты, сборки и проверки
документации не запускались; выполнена только сверка Git-истории и refs.

По [новому решению владельца о ветках](branches.md) `work` и ветки задач
снимаются после переноса в `test`. Production-имена backend `dev` и
master-app `feature/react-client` сохранены. Исключения `singular` остаются
только у backend и website. Снимок TEST-релиза ниже относится к более раннему
пакету и не описывает этот новый Git-коммит.

## TEST-релиз 25.09.2026 — развернут, ручная приёмка продолжается

Ветки `test` перенесены через PR, затем их точные деревья собраны и развёрнуты
на общем TEST: backend `f3b2320`, CRM `5d1a843`, master-app `6901597`,
client-app `7c5c245`, website `0176dd0`. Последние версии подтверждены
`VERSION`/health, для client-app — тегом работающего Docker-образа. Четыре
пользовательских маршрута через nginx дали HTTP 200 с Basic Auth и 401 без
него; backend ответил HTTP 200 на локальном порту. Backend API и CRM-контейнер
healthy. Production и его ветки не менялись.

Свежий дамп TEST-БД перед релизом восстановлен в отдельную временную БД
и проверен на ревизии `0126`; временная БД удалена. Первая попытка миграции
`0126→0140` получила deadlock из-за длинных транзакций старых API/sync и
транзакционно вернулась к `0126`. После остановки этих двух TEST-контейнеров
повторная попытка прошла; текущая ревизия — `0140_admin_shift_process`.
У всех 1673 рекламаций и 190 смен `organization_id` заполнен. API/sync
перезапущены. Дамп хранится на TEST в закрытом каталоге; обратную миграцию
после появления новых данных не считать штатным откатом кода.

Через владельческую сессию backend API с аудитом активным администратору и
управляющему назначена только «Офицерская». Сквозная проверка входа в CRM
показала им один этот филиал, владельцу — оба активных филиала; чтение
текущей смены администратора прошло. Полный CI backend PR прошёл, как и
CI CRM, master-app, website; client-app проверен локально (8 web, 17 BFF,
сборка и форматирование). Создание/закрытие смены, рекламации, денежные
операции и пользовательская ручная приёмка на обновлённом TEST пока не
проводились. На TEST отсутствуют живые YClients/SMS/платёжные интеграции и
медиа; их поведение этим выпуском не подтверждено. Установки CRM и website
сообщили об известных уязвимостях зависимостей; они требуют отдельного разбора.
Параллельный локальный анализ задачи №20 сообщает о 502 после 30 секунд
для `GET /v1/finance?month=` на TEST. Этот сценарий остаётся открытым;
релизная smoke-проверка не подтверждает работоспособность финансовой сводки.

## Дополнение 25.09.2026 — проверка перед переносом на TEST

В `backend/work` коммит `64db989` обновил generated API/schema contracts
для смены администратора и исправил тесты. На отдельной локальной PostgreSQL 18
миграции до `0140_admin_shift_process`, API/schema contracts, Ruff, mypy,
проверка БД и 2046/2046 тестов прошли; vulture и deptry также прошли.
В `master-app/work` коммит `705a5ea` исправил два устаревших smoke-теста
истории клиента и обновил оба статуса задачи №18: прошли 277/277 UI-тестов,
48/48 BFF-тестов, typecheck и build. Это локальные проверки, не приёмка на TEST.

Подтверждённая исходная ревизия живой TEST-БД — `0126_manual_adjustment_reversal`.
На временной копии этой БД успешно выполнены миграции `0126→0140`; у всех
1673 рекламаций и 190 смен определена организация. Временная БД и файлы
удалены, исходная БД осталась на `0126`; работающие сервисы и ветки `test`
не менялись. После решения владельца филиальные grants для активных
администратора и управляющего на TEST следует назначить на «Офицерскую»;
до выпуска они не назначены. Сценарии входа, открытия/закрытия смены,
рекламаций и расчётов на обновлённом TEST ещё не приняты. Перенос
`work→test` и deployment ожидают отдельного явного подтверждения.

## Дополнение 25.09.2026 — учёт смены администратора

В общий `backend/work` опубликован коммит `51bc8a6` (голова миграций в
исходниках — `0140_admin_shift_process`), в `crm/work` — `a125a96`.
Администратор с действующей CRM-сессией и явным допуском филиала может
открыть собственную смену, а затем закрыть её; личность и время фиксирует
backend. Смена реализована системным типом общего процесса, но не подменяет
`shift_report` и не начисляет зарплату. CRM показывает действие в разделе
«Процессы» и не расширяет права управляющего.

Этот первоначальный срез до релизной проверки: статическое ревью исправило
неверное значение `appearance` в миграции и два
пограничных сценария UI (закрытая идемпотентная смена, повтор загрузки
филиалов). Добавлены адресные тесты, **но не запускались**; не выполнялись
миграции, lint, typecheck, сборка и генерация OpenAPI/schema contract. Поэтому
`0140` в локальной, TEST и production БД не подтверждена, generated snapshots
для этих новых ручек ещё устарели, сценарий на стенде не принят. `test`,
production-ветки и стенды этой задачей не менялись. До переноса нужен
разрешённый прогон миграции и адресных проверок на изолированной БД, обновление
снимков, проверка филиальных grants и ручная приёмка; порядок доставки —
миграция, backend, CRM. После появления данных простой откат старого backend
или миграции небезопасен. Формула оплаты, несколько смен за день и процедура
закрытия при полном отзыве доступа — [вопрос P15](https://summy.youtrack.cloud/issue/SUM-96); доступ
управляющего ко всем филиалам — [P16](https://summy.youtrack.cloud/issue/SUM-96).

## Срез удалённых веток 24.09.2026 — без приёмки сред

[Точная матрица refs и расхождений](branches.md) — основной источник SHA;
production-ветка в Git **не равна** выкаченному SHA. Доступ к test/production,
фактический `alembic_version`, включённые флаги и пользовательские сценарии
на TEST/production в этом осмотре не проверялись. После отдельного разрешения
владельца выполнена часть локальных проверок, перечисленная ниже; реальные
YClients-вызовы и уведомления не отправлялись.

**Решение владельца 25.09.2026:** перенос `backend`/CRM/`master-app work→test`
остановлен из-за риска для TEST. Опубликованные `work` остаются без изменения
`test`, стенда и БД. Эстафета `3b14f50` не активирована и отозвана для
этого пакета. Независимое статическое ревью не нашло P0/P1 кода, но
подтвердило отсутствие филиальных grants после 0137 и риск остановки 0139
на исторических данных. Это не повод автоматически применять миграции.

| Область | Подтверждено в исходниках/ветках | Пока не подтверждено |
|---|---|---|
| Backend | `dev` содержит базовую линию до `0116`; `test` включает `0125` и заканчивается `0126`; `work` опубликована в `ca369db` с головой `0139`, включая единственный уникальный коммит `test` | Применение миграций в TEST-БД, реальные филиальные grants, адресная доставка и YClients |
| CRM | В `work` есть создание, карточка, задания, переходы, исполнение, переделка, штрафы и серверные фильтры рекламаций; защитные правки опубликованы в `8238dbb`. `test` позади; `main` ещё старше | Сквозная приёмка, развернутый SHA; уведомления рекламаций отсутствуют |
| Master-app | Опубликован `work` `473f635` после объединения уникального `test` по входу/сессии; `test` `804c0f1` теперь его предок | Текущий SHA TEST-стенда и экран рекламаций мастера не подтверждены |
| Client-app | `test` на один коммит впереди `work`; основной клиентский код не находится в `main` | Экран рекламаций клиента не утверждён и не реализован |
| Website | `work=test`, production-ветка `main` старше; архив `singular` содержит отдельные варианты | Deployed SHA и перенос содержимого архива |
| Governance | Одна удалённая `main`; контракт рекламации и матрица веток обновляются здесь | Сведения о runtime нельзя выводить из документации |

Дополнение 25.09.2026 по очистке комментариев: в продуктовых `work`
опубликованы backend `2b1ac90`, CRM `b21ac85` (после очистки `4e7be2e`
и синхронизации guard), master-app `6ce139c`,
client-app `9f31a60`, website `d200c08`. Значимых функциональных изменений
очистка не планировала; в backend совпадает AST всех 455 Python-файлов,
но тесты после этого коммита не запускались из-за отсутствия зависимостей.
Адресные тесты CRM и client-app, сборки и профильные проверки сайта и кабинета
прошли. `test`, production-ветки, стенды и реальные БД не изменялись.
Не все старые комментарии удалены: машинные директивы, исполняемые docstring,
исторические миграции и обширный остаток пояснений требуют дальнейшего ревью.
Правило писать документацию для всех репозиториев закреплено в
[уставе](../CHARTER.md#что-документируем-а-что-нет); нерешённое — в
[SUM-96](https://summy.youtrack.cloud/issue/SUM-96) и
[SUM-97](https://summy.youtrack.cloud/issue/SUM-97).

Илья сообщил владельцу 23.09 в 19:03, что на TEST-стенде master-app стоял
тогдашний `test` (`18597cb`) с кодом `work` (`1da3a08`). Это датированное
свидетельство, а не текущая runtime-проверка: удалённые refs 24.09 уже
другие. Попытка только прочитать имя пользователя по SSH с обязательной
проверкой host key остановилась **до аутентификации**: доверенный ED25519
ключ хоста для TEST отсутствует в этой Windows-среде. Это не доказывает
отсутствия SSH-права у Кирилла; ключ сервера надо подтвердить вне канала
перед повтором. На сервере ничего не выполнялось.

`db/api-contract.json` и `db/schema-contract.json` есть в backend/work;
опубликованный коммит обновил их после проверки на изолированной БД до головы
`0139`. Это не доказывает соответствие схеме TEST или production.
Dev-витрина рекламации CRM и mock/demo-адаптеры не являются production
сценарием; при недоступном gateway BFF отвечает ошибкой, а не успешной
фиктивной карточкой. Опубликованный backend/work содержит worker рекрутинга;
ревизия `0138` добавляет отдельную очередь рекламаций без
внешней отправки. Ограничения получателей и канала перечислены в
[SUM-97](https://summy.youtrack.cloud/issue/SUM-97) (пункт T8).

После разрешения владельца локально поднята **новая изолированная PostgreSQL
18.6** на `127.0.0.1:55432`, без копирования данных TEST. Пустая цепочка
миграций до `0139` и синтетическая репетиция
`0126→0139→0135` прошли. В независимом ревью 0139 была обнаружена
несовместимость с историческими `master_shift.organization_id=NULL`;
исправление вошло в опубликованный `backend/work`. Полный набор на
изолированной БД прошёл: 2036/2036 тестов до merge единственного коммита
`test`; после merge дополнительно прошли 36/36 адресных тестов сессий,
Ruff, mypy, API и schema contracts. CRM прошла
143 файла, 1596/1596 тестов до последних адресных правок; после них
49/49 адресных тестов, typecheck, lint и build прошли. Master-app/work
прошла 46 BFF- и 153 целевых UI-теста, typecheck и production build с
`VITE_API_BASE=/`; это локальная проверка опубликованного дерева, **не** TEST-деплой.

Приоритеты перед выпуском: установить миграционную ревизию **каждой** БД,
разобрать разошедшиеся ветки, подтвердить роль мигратора и откат с сохранением
истории, затем с разрешения оператора выполнить контракты и сквозную приёмку.
Опубликованный код закрывает часть прежних пробелов филиальных прав
и зависшего `chosen`, но они остаются непроверенными в TEST. Адресная доставка
уведомлений по-прежнему не готова. Неутверждённые продуктовые решения и конфликты перечислены в
[SUM-96](https://summy.youtrack.cloud/issue/SUM-96) и
[SUM-97](https://summy.youtrack.cloud/issue/SUM-97); правило фиксации изменений всех
репозиториев — в [уставе](../CHARTER.md#что-документируем-а-что-нет).

### План проверки до доставки

Каждую команду выполняет уполномоченный оператор только после отдельного
разрешения и сверки целевой среды. Доступ к TEST не означает доступ к production.
Ни одна команда ниже не разрешает `upgrade`, `downgrade`, внешнее начисление
или отправку уведомления автоматически. Часть локальных проверок теперь
выполнена после разрешения владельца; серверные команды и TEST/production-
приёмка по-прежнему не выполнялись.

| Среда | Команда / запрос | Ожидаемый результат и граница |
|---|---|---|
| Локальные копии продуктов | `git fetch --all --prune`; `git ls-remote --heads origin`; `git rev-list --left-right --count origin/test...origin/work` | Подтвердить SHA и расхождение из [матрицы](branches.md); перед merge повторить замер |
| TEST, только подтверждённый backend-контейнер | `docker compose -p summy-stand -f docker-compose.stand.yml -f /opt/summy-test/overrides/backend.yml exec -T api alembic current` и тот же вызов с `alembic heads` | Если развёрнут именно `backend/test` и схема догнана, обе команды покажут `0126_manual_adjustment_reversal`; иначе остановить выпуск и разобраться, не «stamp» |
| Production, только подтверждённый backend-контейнер | `sudo docker compose -f docker-compose.prod.yml exec -T api alembic current` и тот же вызов с `alembic heads` | Значения должны совпасть с **фактически развёрнутым** релизом; его SHA сейчас неизвестен, заранее ожидать `0125` или `0135` нельзя |
| DB-сессия владельца, read-only | `SELECT current_user, has_schema_privilege(current_user, 'summy_data', 'CREATE');` и `SELECT version_num FROM alembic_version;` после проверки `search_path` | Установить фактическую роль и ревизию; само значение `alembic_version` дополнить осмотром таблиц/триггеров 0125, не подменять им проверку DDL |
| Изолированная БД после разрешённой миграции | `python -m app.api_contract`; `python -m app.schema_contract`; `pytest -q tests/test_contract_snapshots.py` из backend/work | OpenAPI — `OK`, схема — `OK`, тесты проходят без skip и изменения снимков; генераторы `--write` только при утверждённом расхождении |
| Локальная CRM/work после согласования backend | `npm test -- src/lib/adapters/processes-gateway.test.ts src/components/kanban/complaint-create.test.tsx src/components/process/transition-actions.test.tsx`; `npm run typecheck`; `npm run lint`; `npm run build` | Все команды завершаются без ошибок; затем вручную сравнить gateway DTO с OpenAPI, потому что клиента из схемы CRM не генерирует |
| TEST/production, только разрешённый осмотр конфигурации | Команды TEST ниже выводят **только признаки наличия**, не значения ключей; для production сначала подтвердить compose-файл/контейнеры | На TEST API не имеет ключей YClients, sync работает в read-only; реальное состояние и права провайдера остаются отдельной проверкой |
| После санкционированного deployment | Прочитать `/health` и `/ready` backend, `/api/health` CRM, `/healthz` master-app и website в утверждённой среде; затем выполнить согласованные пользовательские сценарии | Deployed SHA совпадает с утверждённым артефактом, а сценарий подтверждён отдельно; зелёный health сам по себе недостаточен |

Точные безопасные команды для **TEST**, если оператор подтвердит сервер, каталог
compose и право чтения. Они печатают только `present`/`absent`, не значения:

```sh
docker compose -p summy-stand -f docker-compose.stand.yml -f /opt/summy-test/overrides/backend.yml exec -T api sh -lc 'for n in STAND_AUTH_PASSWORD YCLIENTS_PARTNER_TOKEN YCLIENTS_USER_TOKEN YCLIENTS_COMPANY_IDS; do if [ -n "$(printenv "$n")" ]; then printf "%s=present\n" "$n"; else printf "%s=absent\n" "$n"; fi; done; if [ "$(printenv YCLIENTS_READ_ONLY)" = true ]; then printf "YCLIENTS_READ_ONLY=true\n"; else printf "YCLIENTS_READ_ONLY=unexpected\n"; fi'
docker compose -p summy-stand -f docker-compose.stand.yml -f /opt/summy-test/overrides/backend.yml exec -T sync sh -lc 'for n in YCLIENTS_PARTNER_TOKEN YCLIENTS_USER_TOKEN YCLIENTS_COMPANY_IDS; do if [ -n "$(printenv "$n")" ]; then printf "%s=present\n" "$n"; else printf "%s=absent\n" "$n"; fi; done; if [ "$(printenv YCLIENTS_READ_ONLY)" = true ]; then printf "YCLIENTS_READ_ONLY=true\n"; else printf "YCLIENTS_READ_ONLY=unexpected\n"; fi'
```

Ожидается `STAND_AUTH_PASSWORD=present`, три YClients-переменные API —
`absent`, обе `YCLIENTS_READ_ONLY=true`; у sync наличие самих ключей/компаний
определяет оператор, не раскрывая значений. Отсутствие `sync` или другой
compose-путь — повод остановить сверку и сначала установить deployed layout,
а не запускать соседний контейнер наугад.

Для миграций и отката нужен отдельный план владельца БД: backup, совместимость
старого кода, тест на изолированной копии и сохранение исторической ставки
`0132`. Для уведомлений сначала утвердить адресатов и канал; никакие реальные
SMS, письма или сообщения в рамках документальной сверки не отправляются.

## Исторический снимок 19 сентября 2026

> Дополнение 20.09.2026: во всех пяти продуктах `work` включена в `test` и
> синхронизирована с ней; совместимые разработки singular перенесены.
> [Актуальный журнал Git-объединения](history/test-integration-2026-09-20.md)
> дополняет снимок ниже. Production и серверные окружения не изменялись.

**Снимок кода и документации, не отчёт о деплое.** Проверены GitHub metadata/ветки/PR,
README, manifests, ключевые routers, BFF, миграции и конфигурация. Production и общий
стенд не изменялись и в этой задаче не проверялись после входа. Замер публичного
health из PR #65 сохранён отдельно в [истории наблюдений](https://github.com/kirillsummy/governance/blob/263d84b60a4f03bf158453f1fe7d295db146e1ab/docs/history/health-2026-09-19.md). [SHA](repositories.md),
[реестр доказательств](sources.md), [полный список удалённых веток](branches.md).

## Реализовано в основных ветках

| Продукт | Что есть | Чего это не доказывает |
|---|---|---|
| Backend `dev` | FastAPI, PostgreSQL/Alembic до файлов `0116`, домены людей/записей/смен/денег/склада/процессов/медиа, sync YCLIENTS, S3 adapter | Полное замещение YCLIENTS, отсутствие дрейфа реальной БД, единые пользовательские права |
| CRM `main` | Next.js приложение, серверные routes/адаптеры, роли/видимость, управленческие экраны | Включение gateway-входа из PR #184 или проверку каждого действия backend по роли |
| Master `feature/react-client` | React-приложение, Node BFF, рабочий день/график/смены, профиль/медиа/медкнижка/отзывы/финансы | Приёмку всех действий на production и исправления из PR #93 |
| Website `main` | Next.js сайт, контент, платформенная публичная витрина, виджет YCLIENTS, формы Telegram | Завершённый продуктовый поток заявки/сертификата или онлайн-оплату |
| Client `main` | Три файла заготовки: AGENTS, CLAUDE, README | Отсутствие работы над клиентским продуктом: код уже в отдельных PR |
| Governance / docs / context / workspace | Канон, знания, память, инструменты | Отдельные работающие SaaS-продукты |

Источники реализации: [архитектура](architecture/README.md), [API](api.md),
[репозитории](repositories.md), закреплённые файлы в [реестре](sources.md).

## Реализовано в просмотренном feature-коде и ключевых модулях

| Область | Что найдено | Где / граница |
|---|---|---|
| Сайт | Next.js, услуги/студии/мастера, editorial-контент, серверные данные платформы | website routes, platform.ts, site.ts |
| CRM | UI процессов, клиентов, справочников, сотрудников и финансов; серверные gateway-адаптеры | src/app, src/lib/adapters; не полный аудит каждого экрана |
| Мастер | React/BFF, день/смены/записи, профиль/портфолио/медкнижка и финансовые экраны | web/src/App.tsx, bff/README.md |
| Backend | FastAPI, PostgreSQL/Alembic, домены, YClients facade, S3, права/аудит | app/main.py, README, pyproject.toml |
| Обращения и часы | Рабочие вопросы/ошибка приложения, причина снятия смены, текст утреннего нарушения, отдельный учёт 180 часов | feature backend/master, миграция 0117 |
| Клиент | React + BFF, OTP/CRM account, запись и история, запрос отмены, профиль, экран платежа | feature client и backend 0118; main клиента не содержит эту реализацию |
| Общие заказы | sales_orders, команды/история, календарь CRM, свои заказы мастера/клиента | feature пяти продуктов, backend 0119–0120 |
| Sandbox платежи | Адаптер ссылок, подписанный webhook + серверная сверка, возвраты, связь с каноническим начислением | feature backend; провайдер end-to-end не подтверждён |

Состояние существующих PR и их отличие от основной ветки определено отдельно.
Термин «реализовано» здесь означает наличие реализации в указанном SHA, не
производственную готовность, покрытие всех требований или включение функции.

## Обнаружено, но требует проверки

- Живые версии сайта/CRM/master, API и контейнеров: нужен свежий version/health и
  пользовательский сценарий. Исторический health 16.09 не переносится на 19.09.
- Общий `summy-test` описан в backend PR #79 как поднятый 15.09; ветки test есть,
  но нет подтверждения доставки PR с заказами на этот сервер.
- SMTP-код и SMS.ru-адаптер существуют, реквизиты и внешняя доставка не проверены.
- YClients-запись/перенос/отмена нового общего контура требуют выделенного тестового
  филиала. Стендовый facade специально запрещает исходящие вызовы.
- Яндекс Пэй: нужен sandbox merchant ID и внешний цикл оплаты/возврата. Локальная
  проверка подписи/сверки не является результатом настоящей оплаты.
- Ветки SUMMY ID / invitations / master session присутствуют. Их реализация
  не включена в текущий архитектурный срез: сначала отдельное ревью diff.
- Отзывы, медкнижка, портфолио имеют контракты и маршруты, но каждое действующее
  разрешение публикации/выданное согласие в живой среде здесь не проверялось.

## Планируется / запрошено, не выдавать за готовое

- Привязка карты вместо ссылки: последнее решение владельца в этом чате.
  В просмотренных client API/types и backend orders нет завершённого card-binding
  потока. Подтверждение каждого списания либо автосписание ещё не выбрано.
- Фискальный чек: касса не выбрана, receipt_url остаётся пустым, адаптера кассы нет.
- Напоминания общего orders доставляются в тестовый приёмник БД, не клиентам.
- Публичный адрес клиентского приложения `https://summy.ru/client/` предложен,
  публикация не подтверждена. Его нельзя указывать как уже работающий production.
- Полное вытеснение YClients, единое SSO и отдельный клиентский кабинет лояльности
  не доказаны. Подготовленные ветки/упоминания не равны завершённому продукту.
- Запрос «залить всё на тест» есть, но подтверждения исполнения в материалах нет.
  Эта документационная задача не выполняет deployment вместо назначенного исполнителя.

## Расхождения, сохранённые с доказательствами

| Старое утверждение | Подтверждённое состояние / действие |
|---|---|
| Governance README/MAP: client-app без кода | Код есть в feature; main и feature различаются. Входные документы обновлены |
| ADR-0001: Django, своя БД кабинета, прямой SQL у фронтов | Исторический план; ADR-0002 и текущие BFF/FastAPI его уточняют. Оригинал сохранён с пометкой |
| CRM README: все интеграции mock | processes-gateway и orders proxy выполняют серверные вызовы. README продукта не переписывался в этой DOC-задаче |
| CHARTER: healthz мастера «в работе» | BFF README описывает JSON healthz до статики; метаданные деплоя всё равно нужно проверять отдельно |
| MAP: 139 таблиц, 20 892 записи, visits пуст | Исторические измерения августа, актуальная БД не запрашивалась. Числа сохранены как история |
| workspace README: backend prod — выкаченный срез | CHARTER упразднил указатель prod 22.08. Remote default backend — dev |
| Локальный root README: прежние GitHub-имена, root не Git | GitHub имеет workspace и новые имена; текущая Windows-папка по своей памятке остаётся контейнером. Не создавать git init автоматически |
| Разные названия DOC | По запросу владельца центральный вход теперь governance/docs; отдельный kirillsummy/docs сохранён как прежняя база знаний, без удаления уникального материала |
| Контракт ссылок vs новое требование карты | Ссылки описывают текущий feature-код, карта — незавершённое последующее требование |
| Стендовый SIGNALS: «стенды не подняты» | Более поздний STAND-SERVER от 15.09 описывает сервер. SIGNALS — устаревшая строка, не доказательство отсутствия стенда |

## Известный долг и TODO

Реестры backend/docs/DEBT.md и master-app/docs/DEBT.md сохраняют открытые и закрытые
пункты; перечитывай только относящиеся к задаче. Не считать старый закрытый пункт
актуальным багом. Точечный поиск TODO/FIXME в новых backend orders/client_portal
не нашёл совпадений; это не означает отсутствия долга в остальных модулях.

Подтверждённые чтением ограничения: неодинаковые конверты ошибок; TLS PostgreSQL
без проверки сертификата в app/db.py ([SUM-98](https://summy.youtrack.cloud/issue/SUM-98),
повторно сверено в `backend/test` 26.09.2026; 01.10.2026 решением оператора
снята с очереди в стадию «Не планируется сейчас»: для разработки не нужна,
подключение к БД работает, но проверка не внедрена и ограничение остаётся в
силе, production этим не подтверждён); рассогласование Python runtime/targets;
локальные редакционные данные сайта; незавершённая привязка карты/касса/доставка.

В STAND-SERVER описан долг на 15.09: серверный override/nginx вне Git, ручное
перетегирование MinIO, медиа отсутствуют, медленные finance-запросы и 500 при
отсутствующем объекте. Это сообщения ранбука, **не повторённые измерения 19.09**.

## Дополнительные находки из базовых веток

Статусы ниже относятся к базе снимка либо к указанному runbook. При взятии задачи
сначала проверить код и текущий PR; не открывать повторно исправленный пункт.

| Приоритет работы | Проблема | Источник / текущая граница |
|---|---|---|
| Сначала согласовать доступ | CRM/BFF/backend имеют разные модели входа и legacy-заголовки; сервисный токен не пользовательское право | Backend DEBT §5–6, CRM #184, master #93, [API](api.md) |
| Сначала согласовать БД | Две линии после `0116`, разные `0117`; определения денежных VIEW и неполное ORM-покрытие | [database](database.md), backend #80 и новые feature-ветки |
| Надёжность операций | Скрипты графика с неявным назначением БД, дубли импортов/HTTP, ошибки/повторы | Backend DEBT §9, §20–21; часть исправлений в #80 |
| Заявки | Telegram-уведомление вместо завершённого продуктового потока; требуются согласованные хранение, история, повторы и дедупликация | Backend DEBT §7, website routes, backend #80 |
| Деньги и калькулятор | Разные источники ставок, необходимость актуальных VIEW и контрактов фронтов | Backend DEBT §1, §8, money-dod |
| Воспроизводимость | Локальные PG skip, dev S3 hostname, Python/tooling, изоляция теста аудита профиля | Backend DEBT §10–12, §22; #80 открыт |
| Стенд | Server-only overrides/nginx, пустое медиа, проблемы восстановления образов MinIO | STAND-SERVER от 15.09; состояние сейчас требует проверки |
| Производительность | В runbook финансовый VIEW ~73 с, CRM баланс ~15 с на данных дампа | Исторический замер 15.09, не новый бенчмарк |
| Неполный media error mapping | Пустой бакет давал 500 вместо 404 | Runbook стенда; повторно здесь не воспроизводили |

Источники: [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md), [crm/docs/DEBT.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/DEBT.md),
[master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEBT.md), [website/docs/DEBT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/docs/DEBT.md),
[backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md).
Приоритеты таблицы — порядок проверки рисков для новой сессии, не новая
утверждённая дорожная карта владельца.

## Предыдущая проверка и её пределы

Хендофф текущего чата от 17.09 сообщает: backend 1655 tests; CRM 1509;
мастер 205 UI + 19 BFF; клиент 8 UI + 15 BFF; сборка сайта и палитра.
Миграции проверялись на отдельной PostgreSQL 18, внешняя sandbox-оплата не выполнялась.
Это исторический результат на SHA в repositories, не повторный прогон этой DOC-задачи.

Следующему агенту: сначала выбрать основной или feature-срез, проверить актуальный
PR, затем открывать нужные файлы из источников. Не начинать с полного обхода кода.


## Просмотренные источники

- [governance/MAP.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/MAP.md) — прежние снимки
- [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/DEBT.md) — реестр долга, просмотрен вход/указатель
- [master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/DEBT.md) — реестр и пример закрытого пункта
- [crm/README.md](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/README.md) — устаревшее mock-описание
- [crm/src/lib/adapters/processes-gateway.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/adapters/processes-gateway.ts) — серверный адаптер
- [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md) — пределы тестового контура
- [client-app/src/api.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/api.ts) — нет card binding методов
- [backend/app/db.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/db.py) — TLS
- [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md) — прежняя карта
- [workspace/test-stands/SIGNALS.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/test-stands/SIGNALS.md) — журнал тестировщика

Границы чтения и полный реестр: [sources.md](sources.md).


## Результат объединения документации

PR #62–65 и отдельный черновик уровней ИИ включены в общую Git-историю Governance.
Канонические страницы сведены в одну версию; исходные варианты доступны по SHA в
[журнале объединения](history/consolidation-2026-09-19.md). Закрытие этих DOC-PR
не означает мерж продуктовых веток backend/client/master/CRM/website.
Ограничения агента — [ai/RESTRICTIONS](../ai/RESTRICTIONS.md), workflows — [skills](../ai/skills/README.md).
