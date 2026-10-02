# Dev: автономный пакет очереди 02–03.10.2026

Поручение координатора 02.10.2026: разрешённые незавершённые части очереди и
плана P01–P27 (кроме задач Жени и карт/чатов Ильи). Исполнитель взятых частей —
Юра (523uran523), разработка — Claude. Только Dev; Prod не менялся. Тесты,
lint, typecheck, smoke и ручные сценарии не проводились; при миграциях
проверены только миграции БД. Сборки — только для доставки.

Выпуски идут общим скриптом `release.py` (по образцу `sum207-dev-20261002`):
точные SHA в `manifest.json`, tar sha256 и blob-хеши Git, сборка с меткой
`org.opencontainers.image.revision`, общий замок
`/var/lock/summy-test-deploy.lock`, проверка базовых VERSION и ID чужих
контейнеров, копия БД с проверкой `pg_restore` перед миграцией, счётчики 16
ключевых таблиц до и после, невалидные индексы, проверочные SQL миграции,
откат по состоянию контейнеров. Env переносится из работающих compose-файлов с
заменой только образа; `YCLIENTS_READ_ONLY=true` проверяется до и после.

## sum207-dev-20261002 — активация подготовленного выпуска SUM-207

02.10.2026 23:24–23:26 МСК. Подготовлен сессией SUM-207, активирован этим
пакетом: backend `3f6e03ea708520c737c60db4cd38b2ca2da33ab6`, CRM
`ddcd43a78da796d9fbb7b95f0d0b4d518030719f`, master-app
`ec58c807eaccc364d6e583bd61a91ad692cb2bba`, client-app
`24fd18f8d0360de2479710c8e3ce836b552a3e0d`, website
`8c66593e1c093abc711835a6fbb076b23d040574`; БД
`0166_optional_manicure_closure` → `0168_process_status_tones`. Копия
`/opt/summy-test/backups/sum207-dev-20261002-before-0167.dump`, sha256
`5d880be8e2b0fb58dc4d834940c76c9d7a8540c82f339190dec4ffbb77850523`. Все шаги
exit 0. Подробности — [CHANGELOG](../../CHANGELOG.md), SUM-207.

## ab1-p02-dev-20261002 — P02

02.10.2026 23:40–23:44 МСК, база — состав sum207. backend
`eeda4056eb16ba822189942472f2ea206e332218` (включает опубликованный SUM-208
`d258519` с миграцией `0169_client_visit_confirmations`), CRM
`94bdb47b1698b0e3a21f4077c67cff0f94dd6c50`. БД `0168_process_status_tones` →
`0170_repair_request_label`. Копия
`/opt/summy-test/backups/ab1-p02-dev-20261002-before-0170.dump`, 46 225 943
байта, sha256 `cf7d886e837207fe49ab068a4087dc1cb2cb6ce23f95f27e8271442e2bc2fb52`.
Проверки миграции: счётчики равны, `process_types.label` вида `repair` =
«Заявка на ремонт», таблица `client_visit_confirmations` есть и пуста,
невалидных индексов 0. prepare/backend/crm exit 0; api и adminapp healthy,
restarts 0.

## ab2-dev-20261002 — P25, SUM-177 Э5, SUM-160, SUM-158 (backend), сайт

02.10.2026 23:52–23:57 МСК. backend `233035aa1d5b111546a5169639d1e653b3bd729e`,
CRM `7292a2f0cfaead139a4b31d779fbceb9c3255b1b`, website
`88585f0e0372361e469fc091da64e5738d8bf856`. БД `0170_repair_request_label` →
`0171_accounting_payout_marks`. Копия
`/opt/summy-test/backups/ab2-dev-20261002-before-0171.dump`, 46 189 894 байта,
sha256 `7c8f4d896b865cdcc7fb50d1603e4971bb143290ccccdd086b35d11de3adfc7f`.
Проверки миграции: счётчики равны, таблицы `earnings_payout_confirmations` и
`cash_discrepancy_reports` пусты, два триггера append-only на месте,
невалидных индексов 0. Delivery-сборка сайта успешна, pm2 online.
prepare/backend/crm/website exit 0.

## ab3-dev-20261002 — SUM-158 (CRM)

03.10.2026 00:01 МСК. CRM `f55f8700d52e9c3b7f4b73da8af8fa68e0bc980e`, без
миграций. prepare/crm exit 0, adminapp healthy, restarts 0.

Состав Dev после ab3: backend `233035aa1d5b111546a5169639d1e653b3bd729e`, CRM
`f55f8700d52e9c3b7f4b73da8af8fa68e0bc980e`, master-app
`ec58c807eaccc364d6e583bd61a91ad692cb2bba`, client-app
`24fd18f8d0360de2479710c8e3ce836b552a3e0d`, website
`88585f0e0372361e469fc091da64e5738d8bf856`; БД `0171_accounting_payout_marks`.

Откат каждого шага — предыдущий образ и compose-файлы предыдущего выпуска;
для backend после миграции — `backend-api-rollback.json` без
`alembic upgrade` либо восстановление из копии по отдельному решению. YouTrack:
[SUM-210](https://summy.youtrack.cloud/issue/SUM-210) (CRM «На тесте»),
[SUM-205](https://summy.youtrack.cloud/issue/SUM-205) (сайт «На тесте»),
[SUM-203](https://summy.youtrack.cloud/issue/SUM-203) (CRM «В работе»).
