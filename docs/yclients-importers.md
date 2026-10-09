# Импортёры YClients: инвентаризация и постановка общего импортёра

Дата: 04.10.2026. Остаток [SUM-132](https://summy.youtrack.cloud/issue/SUM-132)
(«общий импортёр YClients, параметры скриптов, охват схемы»), строка R135
плана. Документ — чтение кода, не реализация: код, миграции, YClients, Dev и
YouTrack при его подготовке не менялись и не вызывались.

Сверено чтением Git: backend `origin/test`
`cc1fcd274d19c47fa50420e58a3269a73002b4ae`. Карта функций журнала записи —
[yclients-board-map](yclients-board-map.md), карта переноса возможностей —
[yclients-transfer](yclients-transfer.md).

## 1. Как запускаются импортёры

Импортёры — отдельные скрипты `backend/scripts/*.py`. Их запускает цикл синка
`app/sync/loop.py` по реестру `app/sync/schedule.py::default_jobs`: для каждой
компании из `YCLIENTS_COMPANY_IDS` (или одной `YCLIENTS_COMPANY_ID`) скрипт
стартует отдельным процессом с окружением цикла и окном дат
`START_DATE`/`END_DATE` из `date_window`. Ручной прогон — только
`python -m app.sync.run <задание>`: он берёт тот же замок задания
(`app.sync.journal.job_lock`) и при занятом замке выходит с кодом 75, не трогая
данные.

Чтение YClients ограничено двумя слоями:

- `app/integrations/yclients/read_only.py` — список разрешённых GET-путей
  (`company`, `staff`, `records`, `resources`, `services`, `comments`,
  `transactions`, `record/…`, `client/…`, `loyalty/client_cards/…`, справочники
  и графики компании) и `clients/search`; новый путь запрещён до ревью.
- `YCLIENTS_READ_ONLY=true` на Dev у `api` и `sync` (проверяется каждым
  выпуском на Dev).

Адрес БД всех импортёров — `app/sync/helpers.py::dsn()` из тех же
`POSTGRES_*`, что у приложения (SUM-132 этап 1, backend `20ea7aa`; DEBT п. 9,
20). Ключи YClients — только из окружения процесса; в БД и Git не пишутся.

## 2. Задания и охват схемы

Интервалы — значения по умолчанию из `loop.py` (переопределяются
`SYNC_<ЗАДАНИЕ>_SECONDS`).

| Задание | Скрипт | Интервал | Окно дат | Что пишет |
|---|---|---|---|---|
| `today` / `window` / `tail` / `horizon` | `import_yclients_records.py` | 5 мин / 30 мин / сутки / сутки | сегодня; −1…+14 дн; −90…−1 дн; 0…+180 дн | `appointments`, `appointment_items`, `services`, `service_offers`, `external_refs`, `raw_objects`, `sync_runs` |
| `sweep` | `sweep_deleted_records.py` | сутки | −29…+180 дн (`SWEEP_DAYS`) | пометка удалённых `appointments` |
| `catalog` | `import_yclients.py` | сутки | — | `organizations`, `locations`, `source_connections`, `service_categories`, `services`, `service_offers`, `staff_members`, `staff_locations`, `staff_services`, `resource_types`, `resources`, `service_resource_requirements`, `external_refs`, `raw_objects` |
| `clients` | `import_yclients_clients.py` | сутки | — | `clients`, `client_contacts` (DELETE+INSERT), `appointments.client_id` |
| `schedule` | `import_yclients_schedule.py` | час | −1…+90 дн | `staff_schedules`, `data_quality_issues` |
| `resource_schedule` | `import_yclients_resource_schedule.py` | час | −1…+90 дн | `resource_schedules` |
| `transactions` | `import_yclients_transactions.py` | час | −7…0 дн | только `raw_objects` + `external_refs` (сырьём, в core не моделируется); компании 481570 и 386571 (386571 — с SUM-229, решение владельца 09.10.2026; на Prod — после выкладки) |
| `reviews` | `import_yclients_comments.py` | час | — | `staff_reviews` |

Задания с источником `platform` (`paid_auto_close`, `loyalty_cards`,
`master_shifts`, `photo_proofs`, `scheduled_processes`,
`day_close_free_time`) идут тем же циклом, но YClients не читают и в
инвентаризацию импортёров не входят.

Параметры скриптов: `YCLIENTS_COMPANY_ID` (обязателен), `START_DATE`/`END_DATE`
(записи, графики), `SYNC_OBJECT_TYPE` (записи), `CATALOG_ALLOW_EMPTY`,
`CATALOG_LIST_LIMIT`, `CATALOG_MAX_PAGES`, `CATALOG_PAGE_SIZE` (каталог),
`SWEEP_DAYS` (уборка удалённых); транзакции дополнительно читают
`YCLIENTS_TX_START`/`YCLIENTS_TX_END`, `YCLIENTS_TX_BEHIND_DAYS`,
`YCLIENTS_TRANSACTIONS_PATH`; список компаний — `COMPANIES` в скрипте (481570, 386571 — SUM-229).
Отдельного `.env.transactions.local` нет с 04.10.2026 (И2).

## 3. Чего импортёры не берут

- Пол и дату рождения клиента: `clients/search` их не отдаёт.
- Абонементы и депозиты с остатками и сроками — нужна проверка прав
  интеграционного токена (R112, QA-1/D12).
- Склад, товары, продажи товаров — в зеркало не импортируются.
- Финансы в core не моделируются. Транзакции второй компании (386571) были
  исключены решением владельца 23.07.2026; решением 09.10.2026 исключение
  снято ([SUM-229](https://summy.youtrack.cloud/issue/SUM-229)): в `test`
  собираются обе компании, на Prod — после выкладки и разовой догрузки
  истории с 01.07.2026.
- Карты лояльности YClients читаются не импортёром, а заданием
  `loyalty_cards` через `app/domains/clients/loyalty_members.py`.

## 4. Расхождения в устройстве

1. Каркас запуска повторён в каждом скрипте: свой `journal_failed` /
   `journal_succeeded`, `_resolve_context` (организация, локация и подключение по
   `company_id`), `_upsert_ref`, `_snapshot`. Общий модуль `app/sync/helpers.py`
   закрывает только окружение, адрес БД, стабильный JSON и хеш. Устранено
   04.10.2026 (И1) для каталога, клиентов, отзывов, графиков и метлы, для
   записей (`import_yclients_records.py`) — backend `61988b0dcca14ec9717e9b891d865447dadfaaea`.
2. Записи и клиенты используют `psycopg` синхронно, а домены приложения —
   async SQLAlchemy; общий код между ними не переиспользуется.
3. Контакты клиента пересоздаются DELETE+INSERT на каждом прогоне; у записей
   позиции пересоздаются только при изменении (`_items_unchanged`, SUM-212).
4. Транзакции живут вне общего порядка: дефис в имени файла, свой файл
   окружения, отказ работать для компании, отличной от 481570. Устранено
   04.10.2026 (И2): общее имя и окружение цикла, компании — `COMPANIES`.
5. Окна дат и интервалы — константы `schedule.py` и переменные `loop.py`; в
   `sync_runs` окно попадает, но реестра «что и когда покрыто» нет.

## 5. Постановка: технические задачи общего импортёра

Каждая — отдельная правка backend без новых прав, записей в YClients и
изменения данных; порядок — от дешёвой к дорогой.

| № | Задача | Готово, когда |
|---|---|---|
| И1 | Вынести каркас запуска (`journal_*`, `_resolve_context`, `_upsert_ref`, `_snapshot`) в `app/sync/importer.py` и перевести на него каталог, клиентов, отзывы, графики и уборку | одинаковые функции не повторяются в скриптах; `sync_runs` и `external_refs` пишутся тем же кодом — **выполнено 04.10.2026**, backend `dbe7a7f8f4e60a9de6e336702a290531cdaa10f0`: каркас `app/sync/importer.py`; каталог, клиенты, отзывы, графики и метла переведены; записи (`import_yclients_records.py`) — backend `61988b0dcca14ec9717e9b891d865447dadfaaea`, 04.10.2026 |
| И2 | Импортёр транзакций привести к общему виду: имя `import_yclients_transactions.py`, окружение цикла, список компаний — параметром с прежним значением 481570 | поведение прежнее, отдельный `.env.transactions.local` не нужен — **выполнено 04.10.2026**, backend `dbe7a7f8f4e60a9de6e336702a290531cdaa10f0`: новое имя, окружение цикла, `COMPANIES = ("481570",)`, регистрация в `schedule.py` |
| И3 | Контакты клиента обновлять по разнице, как позиции записей | неизменённые контакты не пересоздаются — **выполнено 04.10.2026**, backend `e5fe9bb6bc685819bedd702d63dbce0d0056950b`: телефон и почта по разнице, контакты других типов импортёр клиентов не трогает |
| И4 | Сторож охвата: тест, что каждое задание `default_jobs` с источником `yclients` вызывает только пути из `read_only.py` | новый путь импортёра без ревью ловится тестом |
| И5 | Реестр покрытия: представление по `sync_runs` «задание × компания × последнее окно × исход» для «Интеграций» CRM | видно, какой период каждого класса данных подтверждён — **выполнено 04.10.2026**: `GET /v1/freshness/coverage` (backend `e5fe9bb6bc685819bedd702d63dbce0d0056950b`), таблица в «Интеграциях» (CRM `9b826e89fe277c7cdf4972898cd1a3c0af53d02e`) |
| И6 | Абонементы и депозиты — после ответа о правах токена (R112) | — (ждёт доступа) |

Решения, которые не являются технической задачей и остаются у владельца:
включение транзакций второй компании, моделирование финансов в core, запись в
YClients (сейчас запрещена).
