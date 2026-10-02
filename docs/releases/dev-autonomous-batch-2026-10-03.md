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

## ab4-dev-20261003 — P03, P05, P17, P09/P13 (backend), SUM-206 CRM

03.10.2026 00:20–00:25 МСК. backend `b2346293aec8d3479bc111e4ce65984523250771`,
CRM `26c0c9f891d1c31c7096f4b84296ba20ee3abd8e` (включает опубликованный SUM-206
`126594d` другой сессии; её выпуск `sum206-visual-crm-dev-20261003` помечен
NOT-ACTIVATED). БД `0171_accounting_payout_marks` → `0173_document_library`.
Копия `/opt/summy-test/backups/ab4-dev-20261003-before-0173.dump`, sha256
`29fcbc9ae1d09dc404dceb86dd5fc4a401be986e9317c1262445762fb8154fbb`. Проверки
миграции: счётчики равны, 9 новых таблиц маркетинга и документов пусты, 6
триггеров append-only, невалидных индексов 0. prepare/backend/crm exit 0.

## ab5-dev-20261003 — SUM-120, P09/P13 (CRM)

03.10.2026 00:28–00:31 МСК. backend `8e1be4ed003820c1ad3302b614caed4c16194dfb`,
CRM `a131bd506b017aa0ad41616e1fb55e51a4056cc6`; без миграций. Все шаги exit 0.

## ab6-dev-20261003 — SUM-111 P9, SUM-10, SUM-160, P07 (backend)

03.10.2026 00:42–00:45 МСК. backend `3cb3a9ea4ed33120229bfa20b6ba06f7c4be13ed`,
CRM `4c88c5f78d74dcc7b45b8ac154cdd2454971139c`. БД `0173_document_library` →
`0175_paid_closing_exclusion` (через `0174_client_cash_offset`). Копия
`/opt/summy-test/backups/ab6-dev-20261003-before-0175.dump`, sha256
`e88a68b238f56882eb368bba3ee5d7592ecce7e2ee5d2f18370832232310f7f2`. Проверки:
счётчики равны, CHECK `earnings_adjustments_kind_known` содержит `client_cash`,
строк `client_cash` 0, `contract_v1_paid_closing_exclusions` = 0,
`contract_v1_earnings_sources` читается, невалидных индексов 0. Все шаги exit 0.

Состав Dev после ab6: backend `3cb3a9ea4ed33120229bfa20b6ba06f7c4be13ed`, CRM
`4c88c5f78d74dcc7b45b8ac154cdd2454971139c`, master-app
`ec58c807eaccc364d6e583bd61a91ad692cb2bba`, client-app
`24fd18f8d0360de2479710c8e3ce836b552a3e0d`, website
`88585f0e0372361e469fc091da64e5738d8bf856`; БД `0175_paid_closing_exclusion`.

## ab7-dev-20261003 — P07 (CRM)

03.10.2026 00:50 МСК. CRM `4561d64982a5c1ab0578e9ee4ad0e6f2e9299c7d`, без миграций.
prepare/crm exit 0, adminapp healthy, restarts 0. Состав после ab7 — как после
ab6, CRM `4561d64982a5c1ab0578e9ee4ad0e6f2e9299c7d`.
## ab8-dev-20261003 — P04, P10

03.10.2026 01:03–01:06 МСК. backend `3205e6a01cefe5ddfea5f857232784792a8f1f3a`,
CRM `9e6d5ef1aad71f640c60096bc3540d2505f247d0`. БД `0175_paid_closing_exclusion`
→ `0177_inventory_auto_assigned` (через `0176_client_cycle_thresholds`). Копия
`/opt/summy-test/backups/ab8-dev-20261003-before-0177.dump`, sha256
`929358d04f99cb0655ac96b5b10b603249d53353372d458bddf3ff2e86809cbb`. Проверки:
счётчики равны, `client_cycle_thresholds` пуста, первый статус `inventory_check`
— `assigned`, невалидных индексов 0. Все шаги exit 0.

## ab9-dev-20261003 — P06, заявки из календаря

03.10.2026 01:11–01:13 МСК. backend `f536b1c6083a3b12fce448d5078da41e2ad8bb33`,
CRM `a4e1bfb184c55e236084aa11ce84fe0d18533450`; без миграций. Все шаги exit 0.

## ab10-dev-20261003 — SUM-160 (третий остаток)

03.10.2026 01:17 МСК. CRM `0f4af225d5b5b335b55dca2c4bbc90e498769d88`; exit 0.

## ab11-dev-20261003 — P12, SUM-160 (четвёртый остаток)

03.10.2026 01:34–01:37 МСК. backend `eeb82f6e1e124642f66bf7e539158315906b74c7`,
CRM `4c36c4b9857e283c28890d26e0a0936fe8baeea2`; без миграций. Все шаги exit 0.

Состав Dev после ab11: backend `eeb82f6e1e124642f66bf7e539158315906b74c7`, CRM
`4c36c4b9857e283c28890d26e0a0936fe8baeea2`, master-app
`ec58c807eaccc364d6e583bd61a91ad692cb2bba`, client-app
`24fd18f8d0360de2479710c8e3ce836b552a3e0d`, website
`88585f0e0372361e469fc091da64e5738d8bf856`; БД `0177_inventory_auto_assigned`.

Откат каждого шага — предыдущий образ и compose-файлы предыдущего выпуска;
для backend после миграции — `backend-api-rollback.json` без
`alembic upgrade` либо восстановление из копии по отдельному решению. YouTrack:
[SUM-210](https://summy.youtrack.cloud/issue/SUM-210) (CRM «На тесте»),
[SUM-205](https://summy.youtrack.cloud/issue/SUM-205) (сайт «На тесте»),
[SUM-203](https://summy.youtrack.cloud/issue/SUM-203) (CRM «В работе»).
