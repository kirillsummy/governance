# P08 — карта журнала записи YClients и текущих API SUMMY

Дата: 03.10.2026. Часть P08 плана 02.10.2026 («Сначала карта используемых
функций доски YClients и текущих API»). Документ — результат чтения кода, не
реализация: код, миграции, YClients, Dev и YouTrack не менялись и не вызывались.

Сверено чтением Git без fetch:

| Репозиторий | Ветка | SHA |
|---|---|---|
| backend | `origin/test` | `f536b1c6083a3b12fce448d5078da41e2ad8bb33` |
| crm | `origin/test` | `0f4af225d5b5b335b55dca2c4bbc90e498769d88` |
| master-app | `origin/test` | `ec58c807eaccc364d6e583bd61a91ad692cb2bba` |
| governance | `origin/main` | `5e5bb9b94436455ff5e0c90d8d9f465af1a76713` |

Источник наблюдений YClients — раздел «Первое исследование сервисов SUMMY
02.10.2026» плана (журнал `timetable` компании 386571, только чтение браузером).
Там прямо сказано: статусы и поведение переноса/отмены по наличию кнопки не
изучены, записи в режиме редактирования не открывались. Поэтому правая часть
таблицы описывает SUMMY, а не подтверждённое поведение YClients.

Все пути backend ниже — с префиксом `/v1`.

## 1. Функции журнала YClients → что есть в SUMMY

| Функция журнала YClients (по исследованию) | Что есть в SUMMY | Состояние / пробел |
|---|---|---|
| Шкала времени с получасовыми отметками | CRM «Клиенты · Календарь» (`/clients/orders`, P07, crm `4561d64`): часовые линии и пунктир на :30, `HOUR_PX=64`, окно 09–21 расширяется по записям и графику | есть |
| Столбцы сотрудников | `GET /v1/appointments/calendar` → `masters[]` (мастера с графиком или записями дня) + отдельный столбец «Мастер не указан» для записей без мастера | есть; порядок — по имени, ручного порядка столбцов нет |
| Дата / «Сегодня», день и неделя | CRM: «Сегодня», стрелки, вкладки «День»/«Неделя»; backend ограничивает период 1–7 днями (`MAX_DAYS=7`) | есть |
| Фильтр сотрудников | нет: backend-календарь принимает только `location_id`, CRM — только выбор филиала | **не покрыто** (можно сделать на клиенте по уже полученным данным или аддитивным параметром) |
| Интервалы записи / рабочие интервалы мастера | `masters[].work_days[].intervals` из `staff_schedules` (синк `import_yclients_schedule.py`); записи — блоки по `starts_at/ends_at` с раскладкой по дорожкам при пересечении | есть |
| Услуги в записи | `appointments[].services` — имена из `appointment_items → service_offers → services` | есть; цены позиций календарь не отдаёт |
| Индикатор текущего времени | CRM рисует линию «сейчас» в столбце сегодняшнего дня | есть |
| Сводный денежный показатель журнала | нет: календарь отдаёт только счётчики (`counters.total/active/by_status/days/masters`); `appointments.total_amount` в ответ не входит | **не покрыто сознательно** — денежный показатель требует решения по `money-dod.md` (что считать, отменённые, скидки) |
| Статусы записи | `appointments.status`: `planned/confirmed/arrived/completed/cancelled/no_show`; импортёр `scripts/import_yclients_records.py`: `deleted`→`cancelled`+`deleted_at`, `attendance -1`→`no_show`, `2`→`confirmed`, `1`→`arrived`, иначе `planned`; `completed` ставит SUMMY (закрытие) и синк его не перетирает, кроме отмены/неявки | есть для чтения; цветовые статусы и прочие состояния интерфейса YClients не изучены |
| Перенос записи | 1) команда контура заказов `POST /v1/orders/{order_id}/calendar` `action=reschedule` (тестовый контур, см. §3); 2) заявка-процесс `appointment_reschedule` через `POST /v1/processes` с `appointment_id` (P07, backend `f536b1c`, crm `a4e1bfb`) — запись и YClients не меняет; 3) закрытие записи мастером SUM-114 — процесс управляющей, YClients не меняет | команда к YClients только под тестовыми флагами; перенос на другого мастера/услугу не поддержан (слоты того же мастера и состава) |
| Отмена записи | 1) команда `POST /v1/orders/{order_id}/calendar` `action=cancel` → `DELETE record/{company}/{record}`; 2) заявка `client_cancellation` (P07) и клиентский запрос `POST /v1/client/orders/{id}/cancellation` — процесс, запись не отменяет | как у переноса; «отмена» в адаптере = удаление записи в YClients (см. решения §5) |
| Создание записи | CRM `POST /v1/orders` (источник `crm`), мастер `POST /v1/master/orders` (`master`), клиент `POST /v1/client/orders` (`client`/`website`), повтор `POST /v1/master/orders/{id}/repeat`; все — `202` + очередь `client_portal_orders` → `YClientsBooking.create` | CRM — только `ORDERS_TEST_ENABLED`; мастер — `MASTER_BOOKING_ENABLED`; клиент — флаги клиентского контура |
| Онлайн-запись (пункт меню) | клиентские `GET /v1/client/slots`, `POST /v1/client/orders`; сайт ведёт на `/client/book?source=website`; живые слоты `book_times/...` — единственное разрешённое чтение мимо зеркала (docs/yclients-integration.md §7) | код есть, включение — флагами; оплата в YClients — блокер (orders-payments-test.md) |
| Аналитика | `GET /v1/analytics/clients`, `/masters`, `/categories`, `/tech-cards`… (витрина SUMMY); P12 | своя аналитика на зеркале, не копия отчётов YClients |
| Финансы, касса | `GET /v1/finance` (кабинет мастера), кассовые смены `GET /v1/workplaces/accounting/cash-shifts`; транзакции YClients — только сырьё `raw_objects` задания `transactions`, только компания 481570 (docs/yclients-transfer.md Э6) | «продано», чаевые — источника нет |
| Зарплата | `payroll-v1`, `/v1/payroll/*`, `/v1/earnings`; автозакрытие оплаченных визитов SUM-118 читает зеркало (`YCLIENTS_PAID_AUTO_CLOSE_ENABLED`, по умолчанию выкл.) | своя модель SUMMY |
| Склад | склады SUMMY `GET /v1/warehouses/*`, рабочее место кладовщика — не склад YClients (SUM-157) | склад YClients не зеркалируется |
| Лояльность | карты — снимок `client_loyalty_cards` (`sync_client_loyalty_cards.py`), `POST /v1/clients/{id}/loyalty-card/refresh`, ручное начисление `POST /v1/clients/{id}/loyalty-credits` + сверка `…/reconciliation` (client-loyalty.md) | абонементы/депозиты — Э5, блокер источника |
| Продвижение | заблокировано решением P5; свои QR-кампании `/v1/marketing/*` (P09) | не перенос YClients |
| Настройки | не переносятся | — |

## 2. Чтение: синк, импортёры, allowlist

- **Граница.** Только backend говорит с YClients: фасад `app/integrations/yclients`
  (компоненты `records`, `staff`, `catalog`, `resources`, `clients`, `comments`,
  `transactions`, `schedule`, `loyalty`, `booking`, `auth`). Роутеры и фронты YClients
  не вызывают; это охраняет `tests/test_yclients_boundary.py`. Вебхуков нет — опрос по
  расписанию (`app/sync/schedule.py`).
- **Задания синка → скрипты:** `today`/`window`/`tail`(−90..−1)/`horizon`(+180) →
  `import_yclients_records.py`; `catalog` → `import_yclients.py`; `clients` →
  `import_yclients_clients.py`; `sweep` → `sweep_deleted_records.py` (жёстко удалённые);
  `schedule` → `import_yclients_schedule.py`; `resource_schedule` →
  `import_yclients_resource_schedule.py`; `transactions` →
  `import_yclients_transactions.py`; `reviews` → `import_yclients_comments.py`; платформенные
  `paid_auto_close`, `loyalty_cards`, `master_shifts`. Свежесть — `GET /v1/freshness`,
  сверка зеркала — `GET /v1/mirror-check`.
- **Read-only allowlist** `app/integrations/yclients/read_only.py` (включается
  `YCLIENTS_READ_ONLY` или автоматически при `STAND_AUTH_PASSWORD`): разрешены только
  `GET` по `company|staff|records|resources|services|comments|transactions/{id}`,
  `record/{c}/{r}`, `client/{c}/{id}`, `loyalty/client_cards/{id}`,
  `company/{id}/(services|service_categories|staff/schedule|timetable/schedule)` и
  `POST company/{id}/clients/search`, только на `https://api.yclients.com/api/v1`.
  Следствия: в read-only режиме **запрещены все команды записи и даже живые слоты**
  `book_times/...`; разрешены чтения, нужные для сверки (`records/{c}`, `record/{c}/{r}`).
- **Идемпотентность синка.** `external_refs` уникален по
  `(connection_id, entity_type, external_id)`; импортёр находит `appointments` через
  `external_refs(appointment)`, позиции пересоздаёт; удаление — пометка `deleted_at`,
  физически строки не удаляются.

## 3. Команды записи в YClients (существующий адаптер)

`app/integrations/yclients/booking.py` (`YClientsBooking`), все вызовы `retry=False`:

| Метод | Вызов YClients | Кто использует |
|---|---|---|
| `slots` | `GET book_times/{company}/{staff}/{date}` | клиент, мастер, CRM (через подписанный слот) |
| `create` | клиент: `POST book_record/{company}`; сотрудник (`staff_booking`): `POST records/{company}` с `api_id` = номер заказа, `save_if_busy=false`, `send_sms=false`, комментарий `SUMMY заказ S-{n}` | `client_portal/worker.py dispatch_one` |
| `reschedule` | `PUT record/{company}/{record}` (`datetime`, `seance_length`, `save_if_busy=false`, без SMS) | `orders/calendar.py dispatch_one` |
| `cancel` | `DELETE record/{company}/{record}` | `orders/calendar.py dispatch_one` |
| `confirm_attendance` | `PUT record/...` `attendance=2` и чтение после | клиентское подтверждение визита (`client_visit_confirmations`, 0169) |

Защиты: `_test_company` — при `ORDERS_TEST_ENABLED` компания должна быть в
`ORDERS_YCLIENTS_TEST_COMPANIES`; HTTP-роуты `/v1/orders` открываются только при
`ORDERS_TEST_ENABLED` и `ORDERS_TEST_DATABASE == POSTGRES_DB`; стенд
(`app/integrations/yclients/stand.py`) отвечает `YClientsUnavailableError` на всё,
кроме входа. Прочие записи в YClients в коде: `schedule.replace` (график),
`clients.create_comment`, `loyalty` (создание карты, ручное начисление), `auth`.

## 4. Внешние ID, происхождение и статусы команд

**Внешние ID.** `source_connections` (филиал ↔ компания YClients в
`external_account_id`, `credential_ref`, `provider ∈ {yclients, manual_import, other}`)
и `external_refs` (`entity_type` — organization, location, client, staff, staff_user,
service_category, service, service_offer, service_resource_requirement, resource_type,
resource, appointment, appointment_item, visit, content, transaction). Созданная
SUMMY запись связывается с зеркалом через `client_portal_orders.record_external_id` →
`external_refs(appointment)`; сверка ищет по `api_id` = `client_portal_orders.number`.

**Происхождение — где различимо:**

| Признак | Где хранится | Что видно в календаре P07 |
|---|---|---|
| `appointments.source_channel` (`yclients/summy/phone/walk_in/import/other`) | импортёр записей **всегда** пишет `yclients`, в том числе для записей, созданных SUMMY и вернувшихся синком | отдаётся, но для синхронизированных записей всегда «YClients» |
| `sales_orders.source` (`client/website/master/crm/yclients`), `client_portal_orders.booking_source`, `booking_actor` | заказ `S-*` (создан SUMMY) или `V-*` (проекция записи из зеркала) | **не отдаётся** календарём |
| `external_provider`, `external_id` | `external_refs(appointment)` + `source_connections.provider` | отдаётся |
| `api_id` и комментарий `SUMMY заказ S-{n}` в записи YClients | сырой снимок `raw_objects` | нет |

Вывод: «создано в SUMMY / создано в YClients» в календаре сейчас неразличимо; данные
для различения уже есть (`sales_orders.source`), нужна аддитивная выдача поля.

**Статусы команд.** И `client_portal_orders.booking_state`, и `order_commands.state`,
и `client_visit_confirmations.state` используют один набор
`queued / dispatching / confirmed / rejected / unknown`. Требование плана
«queued/confirmed/failed/unknown» соответствует ему с `failed ≈ rejected`.

| Где различимо | Как |
|---|---|
| Мастер | `GET /v1/master/orders/{id}/booking-status` — все пять состояний; UI объявляет успех только при `confirmed` (master-booking.md) |
| CRM календарь P07 | `appointments[].commands[]` — последняя команда каждого вида (`cancel`, `reschedule`) с `state`; CRM-подписи: «в очереди, YClients ещё не подтвердил», «отправлено, ждём ответа YClients», «результат неизвестен, нужна сверка», «подтверждено YClients», «отклонено YClients» (`src/lib/appointments/calendar.ts`) |
| CRM экран заказов | `/clients/orders?view=orders` (тестовый контур) — заказ, команды и события `order_events` (append-only) |
| Клиент | собственные заказы `GET /v1/client/orders` (состояние записи сведено к клиентскому тексту) |
| Заявки P07 | `appointments[].requests[]` — процессы `appointment_reschedule`/`client_cancellation` с локализованным статусом |

**Сверка при неизвестном исходе (реализовано):**

- Создание: `orders/booking_reconciliation.py reconcile_unknown` — строки
  `unknown`/`dispatching` старше 60 с; читает `records.list` дня записи и ищет ровно одну
  неудалённую запись с тем же `api_id`, мастером и временем → `confirmed` +
  `record_external_id`. Повторного POST нет.
- Перенос/отмена: `orders/calendar.py confirm` — читает `records.get`; отмена считается
  подтверждённой только если запись удалена/не найдена, перенос — если время и
  длительность совпали. На `ValidationError/ConflictError` у переноса — сначала
  сверка, затем `rejected` и возврат заявки SUM-114 в `pending`. Прочие ошибки →
  `unknown` + событие `reconciliation_required`.
- Цикл: `orders/worker.py delivery_loop` и `client_portal/worker.py` каждые ~5 с —
  `reconcile_unknown`, отправка до 10 команд, сверка `unknown/dispatching` старше 30 с.
- Защита от дубля: `order_commands_active_idx` — одна активная
  (`queued/dispatching/unknown`) команда вида на заказ; повтор с тем же `requestId`
  возвращает прежний результат, иной состав — 409. Синк не перетирает время/статус
  заказа, пока есть активная команда переноса/отмены (`orders/service.py materialize`).
- Синк без дубля: `sales_orders.appointment_id` UNIQUE; `V-*` не создаётся, если запись
  уже связана с `S-*`. Пограничный случай «`V-*` раньше `S-*`» для штатного импорта не
  доказан (master-booking.md, «Целостность заказа и зеркала»).

**Честная недоступность.** CRM без `ORDERS_TEST_ENABLED` показывает «Недоступно:
внешняя запись не подключена.» и блокирует «Новая запись»; backend отвечает 503
«Контур заказов доступен только в настроенной тестовой базе» / «Запись клиента пока
не подключена»; стенд и read-only режим поднимают типизированные ошибки, а не успех.

**Пароли в браузере.** Вход сотрудника проверяет YClients через backend
(`auth`), пароль и user token YClients не сохраняются (docs/yclients-integration.md §9).
Поиск `localStorage/sessionStorage.setItem` в crm, master-app, client-app не нашёл
сохранения пароля; master-app хранит в `sessionStorage` только сессионный токен SUMMY.

## 5. Подготовка адаптера команд создания / переноса / отмены

**Уже есть:** адаптер `YClientsBooking` (create/reschedule/cancel/slots/attendance)
без автоповторов; устойчивые команды с актором, причиной, `requestId` и аудитом
(`order_commands`, `order_events`, `client_portal_events`,
`appointment_reschedule_events`); отправка через worker после фиксации команды;
сверка без повторной записи; локальный резерв интервала (`client_portal/availability.py
occupied` + advisory lock); подписанные слоты с версией заказа и сроком 5 мин; три
входа создания (CRM, мастер, клиент) и повтор мастера; календарь P07 со статусами
команд; заявки на перенос/отмену без изменения YClients.

**Чего не хватает (технически, без новых бизнес-правил):**

1. Терминального исхода сверки нет: если запись в YClients не найдена (создание) или не
   изменилась (перенос/отмена), команда остаётся `unknown` бессрочно, а активный индекс
   блокирует новую команду того же вида. Нужен ручной разбор: ручка и экран
   «подтвердить/закрыть как неприменённую» с причиной и аудитом (по образцу
   `…/loyalty-credits/{id}/reconciliation`). Для отмены `ValidationError/ConflictError`
   сразу ведёт в `unknown`, а не `rejected`.
2. Сверка создания ищет только в дне исходного времени; если запись в YClients успели
   передвинуть, она не найдётся.
3. Календарь не отдаёт `sales_orders.source` / `booking_source` — происхождение
   «создано в SUMMY» не видно (см. §4).
4. Фильтр сотрудников и денежный итог журнала отсутствуют (§1).
5. Создание из CRM и перенос/отмена работают только в тестовом контуре
   (`ORDERS_TEST_ENABLED` + совпадение БД + allowlist компаний); production-путь для CRM
   не определён. Read-only allowlist запрещает и `book_times`, поэтому на стенде нет
   даже слотов.
6. Перенос — только на свободный слот того же мастера и того же состава услуг; смена
   мастера, услуги, длительности не поддержана.
7. Привязки аккаунтов: `source_connections.provider` допускает только `yclients`,
   `manual_import`, `other`; провайдеров DIKIDI/Авито нет. Домен Авито удалён целиком
   (backend CHANGELOG, слово владельца 25.08.2026); DIKIDI упомянут только как будущая
   «выгрузка на площадки» в master-portfolio.md.

**Решения, которые нужны до реальных изменений (вне разрешённого сейчас, только
перечень):**

- Разрешение на реальные изменения YClients: выделенный тестовый филиал и токен с
  правом записи (на Dev токены YClients отключены — SUM-97 T12), включение
  `ORDERS_TEST_ENABLED`/`MASTER_BOOKING_ENABLED` на конкретной среде; production-путь
  создания/переноса/отмены из CRM.
- Семантика отмены в YClients: удаление записи (`DELETE`, как сейчас) или статус
  отмены/неявки с сохранением записи; влияние на зарплату, неявки и предоплату (SUM-96 № 56).
- Уведомления клиенту при создании/переносе/отмене: сейчас `send_sms=false`; чьими
  каналами (YClients, FlowSell, SUMMY P19/P20) и когда.
- Кто вправе выполнять команду сразу, а кто только заводит заявку (сейчас команда —
  administrator/manager/owner тестового контура, заявки P07 — те же роли с правом
  «Процессы»).
- Правило ручного закрытия `unknown` (кто, с каким основанием).
- Подключение новых аккаунтов DIKIDI/Авито, их условия API, хранение credentials
  (`credential_ref`), новые значения `provider` — отдельное согласование; новые
  аккаунты в этой работе не создаются.
- Показ денежного итога в журнале — по `money-dod.md`.

## 6. Что не покрыто (сводка)

Фильтр сотрудников; денежный итог журнала; различение происхождения в календаре;
терминальный исход и ручной разбор `unknown`; production-путь команд CRM; перенос со
сменой мастера/услуги; продажи товаров, абонементы, депозиты, чаевые (Э5/Э6);
статусы, цвета и поведение переноса/отмены в самом интерфейсе YClients (не изучались);
привязки DIKIDI/Авито. Живые проверки YClients не выполнялись.
