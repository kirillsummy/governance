# API, идентичность и доступ

[Вход в DOC](../AGENTS.md) · [Архитектура](architecture/README.md)

## Поверхности

Базовый префикс backend — `/v1`; реальный состав определяется регистрацией
роутеров в `app/main.py`, настройками и OpenAPI конкретной сборки. Не строить
URL только из названия доменной папки.

| Поверхность | Потребитель | Что подтверждено |
|---|---|---|
| `/health`, `/ready` | Операционная проверка backend | Процесс/готовность, не проверка бизнес-сценария |
| `/v1/auth/*` | Сервер CRM / интеграция входа | В backend есть вход, сессия и доступы; основной CRM-вход пока отдельный |
| `/v1/master/auth/*` | Master BFF | Вход/сессия мастера; internal master API включается настройкой |
| `/v1/profile`, `/v1/finance`, `/v1/master/*`, `/v1/day`, часть `/v1/schedule` | Кабинет мастера через BFF | Пути графика делят пространство с CRM; нужен точный allowlist |
| `/v1/public/*` | Сервер сайта | Читаемые DTO студий, мастеров, портфолио, отзывов, услуг/вакансий |
| Остальные `/v1` router domains | CRM и внутренние сервисы | Клиенты, процессы, склад, персонал, расчёты и служебные API |
| `/v1/client/*` | Client BFF, `client-app/work` и `backend/work` | OTP, сессия, запись, история/заказы; локальная доработка 25.09 добавляет жалобы, лояльность и набор услуг, не проверена на TEST |

Источники: [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py), [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py),
[backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py), [backend/app/domains/public_api/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/public_api/router.py),
[master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md),
[backend/docs/client-portal.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/client-portal.md).

Cash-v1 добавляет master-scoped preview, создание и чтение запроса в
`/v1/finance/payout-*`; подтверждение и отказ управляющей находятся в
`/v1/earnings/payouts/{id}/*` и не входят в master BFF. Состояния, права,
идемпотентность и граница готовности описаны в
[контракте наличного вывода](../contracts/cash-earnings-payout.md).

## Три разных проверки

1. **Сервис:** `X-API-Token`, сравнение с настройкой `SERVICE_API_TOKEN`.
   Это минимальная межсервисная аутентификация; отдельных scopes/ключей на каждый
   сервис в этом механизме нет. Даже `/v1/public` требует сервисный токен:
   «public» означает ограниченный DTO для публичной витрины, а не открытый
   анонимный доступ ко всему backend.
2. **Пользователь:** учётная запись, сессия, активный допуск, срок/отзыв.
3. **Действие:** имеет ли этот пользователь право читать/менять именно этот
   объект/раздел. Видимость кнопки и наличие сервисного токена это не заменяют.

Источники: [backend/app/security.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/security.py), [backend/app/domains/auth/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/models.py),
[backend/app/domains/public_api/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/public_api/router.py), [crm/src/lib/access/visibility.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/access/visibility.ts).

## Реализованные пути входа

### CRM в основной ветке

Сервер CRM обращается к YCLIENTS для входа, использует собственную подписанную
cookie, локальные списки допусков и продуктовую матрицу разделов. Есть mock-режим;
в прочитанной реализации отсутствие `ADMINAPP_YCLIENTS_AUTH_MODE` даёт `mock`.
Права разделов могут приходить из backend, однако это ещё не доказательство
серверной авторизации каждого бизнес-метода. Источники:
[crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts), [crm/src/lib/auth/current.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/current.ts),
[crm/src/domain/access/sections.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/domain/access/sections.ts), [crm/src/lib/access/visibility.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/access/visibility.ts).

[CRM PR #184](https://github.com/kirillsummy/crm/pull/184) добавляет опциональный
gateway-вход, проверку действительности сессии/допуска и ужесточение границ
proxy/API. **PR открыт:** режим нельзя считать включённым или принятым на сервере.
Совместимость проверяется вместе с backend, а не только тестами CRM.

### Приложение мастера в основной ветке

Браузер → same-origin BFF → backend. BFF хранит токен в HttpOnly-cookie
`summy_master_session`, вырезает login/refresh-токены из ответа, сам подставляет
сервисный токен и заголовок `X-Master-Session-Token`. Подпись проверяет backend.
Прокси разрешает только master-поверхность; `X-Actor-*` — контекст автора,
а не самостоятельное доказательство права. Legacy `X-Master-Id` встречается
в локальном/dev пути и остаётся частью незавершённой унификации.
Источники: [master-app/bff/server.mjs](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/server.mjs), [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md),
[master-app/web/vite.config.ts](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/vite.config.ts), [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md).

[Master PR #93](https://github.com/kirillsummy/master-app/pull/93) исправляет
обход обработки auth-ответов через варианты пути и добавляет проверки маршрутов/
контракта. Его открытый статус означает, что нельзя считать все эти меры уже в базе.

### Клиентский вход в feature

OTP через SMS.ru; BFF хранит серверные секреты, backend получает
`X-Client-Session-Token` плюс сервисный токен. В описании реализации есть TTL,
лимиты попыток/отправок, HMAC-хранение OTP и привязка клиента по телефону.
Дубликаты клиентских контактов требуют разбирательства; успешная SMS не даёт
произвольно выбрать чужого клиента. `CLIENT_PORTAL_ENABLED` по умолчанию выключен.
Внешняя доставка SMS и production-включение не подтверждены.
Источник: [backend/docs/client-portal.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/client-portal.md).

## Клиентский feature API

| Метод | Путь относительно `/v1/client` | Назначение |
|---|---|---|
| GET | /session, /catalog | Сессия и общий каталог |
| POST | /auth/code, /auth/verify, /auth/logout | OTP, проверка, отзыв сессии |
| GET | /slots | Доступные слоты по услуге, студии, мастеру, дате |
| GET | /orders, /orders/{order_id} | Только свои заказы и детали |
| POST | /orders | Создание с requestId и подписанным slotId, ответ 202 |
| POST | /orders/{order_id}/cancellation | Запрос отмены с причиной, не сама отмена |

В client `src/types.ts` существуют отдельные OrderStatus и PaymentStatus.
Платёжная проекция содержит mode/url/receiptUrl/message. Полей привязанной карты
и endpoint её добавления в просмотренном клиентском API нет.

## Общий orders feature API

CRM `/v1/orders` и мастер `/v1/master/orders` имеют GET списка, карточки,
catalog, clients, slots и POST создания. `/{id}/actions` принимает start,
complete или request-cancellation с версией заказа; complete принимает суммы позиций.
`/{id}/payment` ставит создание/получение платежа в очередь (202), не подтверждает оплату.

Дополнительно для CRM: GET `/{id}/slots`, POST `/{id}/calendar` (перенос/отмена),
`/{id}/refund` (202), `/{id}/reconcile`. Причина обязательна для отмены/возврата.
Бухгалтер имеет чтение; административные изменения — administrator/manager/owner.
Заказ мастера проверяется на принадлежность, а не доверяется staff_id из браузера.

Повтор после unknown требует сверки. Результат от провайдера сверяется с номером,
merchant ID, валютой, замороженной суммой и операциями. Только возврат браузера
или HTTP 202 не являются подтверждением финансового результата.

## Данные и ошибки

### Фактическая смена администратора в `backend/work`

`admin_shift` — скрытый системный вид универсального процесса, отличный от
отчёта `shift_report`. Он фиксирует только начало и окончание работы; показатели
отчёта и зарплату не рассчитывает. Общий `/v1/processes` не показывает этот
вид, а прямые карточка и действия через универсальные ручки отвечают 404.

| Метод | Путь | Вход и результат |
|---|---|---|
| GET | `/v1/admin-shifts/current` | Собственная открытая смена либо `null` |
| POST | `/v1/admin-shifts/open` | `{location_id, request_id}` (UUID); новая смена — 201, повтор того же ключа — 200 с прежней записью |
| POST | `/v1/admin-shifts/{id}/close` | Тело не требуется; повтор возвращает ту же закрытую смену без нового события |

Ответ содержит `id`, `status`, `location_id`, `studio`, `administrator_id`,
`administrator_name`, `opened_at`, `closed_at`. Роль и личность берутся только из
живой CRM-сессии поверх сервисного токена; открытие дополнительно требует
явного допуска к действующему филиалу своей организации. Одновременно открыта
не более одной смены на администратора. Свою уже открытую смену можно закрыть
после отзыва филиального допуска, но новую открыть нельзя. `request_id`
уникален в организации для всех процессов; повтор с другим содержимым
отвечает `409 admin_shift_request_conflict`, новый ключ при открытой смене —
`409 admin_shift_already_open`. Ошибки роли/филиала имеют коды
`admin_shift_role_forbidden` и `admin_shift_location_forbidden`.

CRM использует собственный BFF `/api/admin-shifts` и не передаёт в backend
автора, время, число записей или сумму. Контракт зависит от миграции
`0140_admin_shift_process` в `backend/work`; применение на TEST/production,
снимки OpenAPI/схемы и автоматические проверки этого изменения пока не
подтверждены.

### Рекламации в `backend/work`

Этап 10 расширяет общий `GET /v1/processes` без отдельного endpoint рекламаций.
Доступны `staff_id`, `client_id`, `phone` (общая нормализация), `service_id`,
`defect_kind`, `appeal_category`, `appeal_source`, периоды
`appeal_date_from/to`, `visit_date_from/to`, `repair_date_from/to`,
`resolution_kind`, `resolution_grant_status`, `has_attachments`,
`has_penalties`, а также `sort=newest|oldest|due_soon`.
Фильтры, `total` и сортировка применяются в БД до `limit/offset`.
`state=closed` определяет терминальность по workflow; карточка списка
отдаёт `completed_at`, `has_attachments` и сумму исполненной компенсации
`resolution_grant_amount_rub` из ledger (не из анкеты).
`has_penalties=true` означает наличие исторической строки выписки в
`staff_penalties`, включая впоследствии отменённую; действующий финансовый
итог следует читать из отдельного контура штрафов.

Этап 6: `GET /v1/processes/workflows` остаётся единственным API options
анкеты рекламации. `resolution_kind` для нового выбора содержит `redo`,
`bonus`, `refund`, `reject`; `reject` устанавливает переход в `rejected` с
обязательным свободным `rejection_reason`, а не переход в `executing`.
Старые русские строки в карточках и ledger не переписываются. Настройка
options выполняется существующим `PUT /v1/processes/types/complaint/fields`;
снятое значение читается в старых карточках, но не принимается как новое.
Ревизия 0129 меняет options и CHECK ledger; её применение в целевых БД не
подтверждено.

Этап 5 добавляет универсальные задания процесса: `GET/POST
/v1/processes/{id}/tasks`, `PATCH /v1/processes/{id}/tasks/{task_id}` и
`POST /v1/processes/{id}/tasks/{task_id}/complete|cancel`. DTO задания содержит
`due_at` и рассчитанный сервером `is_overdue`. `GET /v1/processes/workflows`
дополнен `task_kinds`; у вида процесса необязательная `stage_sla_hours`.
`ProcessTransition.fields` передаёт решение вместе с переходом в `executing`.
Закрытие при незавершённой обязательной задаче отвечает 409
`complaint_required_task_open`; эскалация без комментария — 422
`complaint_escalation_comment_required`; отклонение без причины — 422
`complaint_rejection_reason_required`. Применение ревизии 0128 в целевых БД
не подтверждено.

Создание CRM использует существующий `POST /v1/processes` с `type=complaint`.
Необязательный для старых клиентов `request_id` (UUID) задаёт идемпотентность
нового подтверждения: backend хранит ключ и SHA-256 нормализованного тела в
`processes` (ревизия 0127, после 0126), уникально по организации. Равный
повтор возвращает исходный процесс, иное тело с тем же ключом — `409`
`complaint_create_request_conflict`; несколько осознанных рекламаций одного
визита разрешены. `X-Request-Id` остаётся только трассировкой.

Поиск использует `GET /v1/clients?search=...` (имя или частичный телефон; префиксы `+7`, `7` и `8` равносильны, все дубли остаются доступными без автовыбора) и `GET /v1/appointments` с
`client_id`, `date_from`, `date_to`, `staff_id`, новым `location_id` и
`include_items=true`. Прямой ID записи читается существующим
`GET /v1/appointments/{id}`. CRM не ходит в YClients напрямую.

В опубликованном `backend/work` после `0137` филиальная область рекламации хранится как
явные grants для активной строки CRM-допуска по YClients user ID.
`GET /v1/auth/process-locations` возвращает разрешённые филиалы действующей
CRM-сессии; только владелец может заменить список для конкретного допуска
через `PUT /v1/auth/access/{access_id}/process-locations` с телом
`{"location_ids":["<uuid>"]}`. Для администратора/управляющего отсутствие
grant означает запрет, а место работы мастера не является правом CRM.
Действия рекламации и задач требуют живую `X-Session-Token`; роль из тела
сверяется с сессией. Пока не известны реальные CRM-пользователи двух студий,
grants в TEST не выданы и сквозная приёмка прав не выполнена.

Существующие `GET /v1/clients`, `GET /v1/clients/{id}`,
`GET /v1/appointments`, `GET /v1/appointments/{id}` и
`GET /v1/staff-registry` получают опциональный `scope=processes`.
В этом режиме backend требует живую CRM-сессию, отбирает клиентов по визиту
в разрешённом филиале, записи и действующих мастеров — по разрешённой
локации **до пагинации**, допускает `location_id` и возвращает
`X-Process-Scope-Enforced: true`. CRM BFF прекращает выдачу зеркала, если
заголовка нет (старый backend мог проигнорировать параметр). Список
мастеров основан на действующем назначении филиала, но право вызывающего
доказывает отдельный CRM-grant.

Следующий абзац — исторический срез до объединения веток 25.09.2026:
нынешние доработки рекламации находятся в `backend/test` и `crm/test`, а
ревизия 0141 применена к TEST-БД. Сквозная проверка клиента с YClients
остаётся открытой.

Коммит backend `2b5b7a4` довёл процесс `complaint` до единого серверного
контракта без отдельной подсистемы. Файл `0125` теперь есть и в
`backend/test`; следующие этапы до `0139` находятся в `backend/work`
(`ca369dbb077eb41ef06436eddcf5f9f4db7c228a`), а
интерфейс этапов 3–10 — в `crm/work`, не в `crm/test`.
Фактическое применение ревизий в БД test/production не подтверждено;
локальные тесты и синтетические миграционные репетиции не заменяют приёмку
сред. API/schema snapshots в `ca369db` прошли локальную сверку, но не
сверялись с фактической TEST-БД.

- `ProcessView` возвращает канонические связи `appointment`, `staff`, `client`,
  `service`, `shift_process`, состояние предоставления решения и агрегат журнала;
- детали процесса возвращают append-only `complaint_grants`, а не вычисляют факт
  исполнения только из статуса карточки;
- `POST /v1/processes/{id}/grants` запускает автоматическое предоставление и
  принимает роль исполнителя и ключ идемпотентности; финансовые значения и вид
  решения берутся из серверной модели, а не из тела запроса;
- `POST /v1/processes/{id}/resolution-provisions` фиксирует ручное исполнение с
  ролью, ключом идемпотентности и обязательным пояснением; для `redo`
  требуется завершённая связанная бесплатная запись текущего цикла;
- `POST /v1/processes/{process_id}/grants/{grant_id}/reconcile` принимает
  `actor_role`, `idempotency_key`, `outcome=granted|not_found`, обязательное
  `note`. Доступен управляющему и владельцу только для неизвестного `chosen`.
  Исходная попытка не меняется; append-only запись сверки одна на попытку.
  Тот же ключ возвращает прежний результат, другой исход даёт `409`.
  `granted` отображается как предоставление, `not_found` разрешает новую
  попытку с новым ключом. Endpoint не вызывает начисление YClients;
- `GET /v1/processes/{id}/redo-slots` принимает период до 14 дней,
  необязательные `location_id`, `staff_id` и отдаёт свободные слоты по графику
  мастера и занятости. `POST /v1/processes/{id}/redo-appointments` принимает
  `actor_role`, `request_id`, `starts_at`, необязательные филиал/мастера и
  обязательное пояснение; повтор ключа и тела возвращает ту же запись,
  другое тело или занятый слот — `409`. Клиента, исходный визит, услугу,
  длительность и нулевую итоговую стоимость определяет backend.
  `GET /v1/processes/{id}/redo-appointments` отдаёт всю историю, включая
  отменённые. `PATCH /v1/processes/{id}/redo-appointments/{appointment_id}`
  переносит действующую запись, `POST .../{appointment_id}/cancel` отменяет
  её без удаления. Оба действия требуют роль и пояснение и пишут историю;
- `PUT /v1/processes/{id}/appointment` сохраняет связь с визитом в колонке/FK и
  синхронизирует производные связи на сервере;
- повтор операции с тем же ключом не создаёт второе начисление; неопределённый
  внешний результат остаётся отдельным состоянием и требует сверки;
- ошибки домена имеют устойчивые коды, которые CRM должна показывать и
  обрабатывать без разбора текстового сообщения.

Штраф по рекламации не является предоставлением клиентского решения:
`POST /v1/processes/{id}/penalties` принимает `penalty_type_id`, количество,
основание, роль и ключ идемпотентности, но не сумму или цену балла. Backend
проверяет мастера и применимость вида, фиксирует ставку, возвращает
`point_price_rub`, `points_total`, `amount_rub`, `amount_known` и пишет событие.
Отмена через существующий `POST .../penalties/{penalty_id}/cancel` требует
причину и сохраняет исходную строку. Месячная сводная payroll исключает
отменённые штрафы. Исторические строки без ставки возвращают `null`, не ноль.

CRM при переходе на этот контракт не должна передавать рассчитанные суммы,
`bonus_size` или вручную дублировать данные визита в `fields`. В опубликованной
рабочей линии `ca369db` снимки OpenAPI/schema содержат endpoints и таблицы
до `0139`, проверенные на изолированной БД. CRM gateway написан вручную;
опубликованный `crm/work` `8238dbb` отклоняет
неполный `ProcessView`/`ProcessDetail`, а не показывает тихую пустую карточку.
Это не доказывает совместимость с развернутым backend/test: сверка DTO и
фактической схемы перед переносом обязательна.
Полные правила и граница готовности:
[контракт «Брак / рекламации»](../contracts/reklamaciya.md).

Ревизия `0138` не создаёт отдельного HTTP API уведомлений: сохранённые
`process_events` в той же транзакции порождают безопасную запись общей
`outbox_events` с ключом `complaint:<process_id>:<event_id>:<recipient>`.
Отдельный worker не отправляет её в рекрутинговый чат. Пока нет утверждённого
адресного канала, строка остаётся `unavailable` с `published_at=NULL`;
внешняя доставка, уведомление владельца и персонального ответственного
не являются готовыми функциями. Возобновление доставки требует проверки
действующего CRM-допуска получателя и идемпотентности транспорта.

- Backend использует Pydantic DTO, пагинацию и типизированные ошибки. Общая модель
  `app/errors.py` — `{"error": {...}}`; отдельные auth/BFF пути имеют особенности
  (`detail.reason` описан BFF). Не считать один envelope универсальным без
  проверки конкретного route/теста.
- UUID платформы не заменять строковым внешним ID; внешний ключ и provenance
  сохраняются через `external_refs`. Денежные суммы не пересчитывать во фронте.
- Не вводить повтор POST «на всякий случай» без идемпотентности операции.
  Идемпотентность общего заказа/платежа описана в отдельном тестовом контракте,
  а не гарантирована каждому существующему endpoint.

Источники: [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py), [backend/app/domains/auth/schemas.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/schemas.py),
[backend/app/domains/staff/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/staff/models.py),
[governance/contracts/orders-payments-test.md](https://github.com/kirillsummy/governance/blob/a1c3b56c4382e0520885b9b9cd3574ce16ee53ca/contracts/orders-payments-test.md).

## Как менять стык

Сверить route + DTO + auth backend; серверный адаптер CRM/сайта или allowlist BFF;
вызовы frontend; негативные проверки (чужой объект, роль, истёкшая сессия,
недоступный backend). Включение новой модели входа проводить согласованно.
Проверка OpenAPI в PR #80 и contract-проверка в master PR #93 полезны, но пока
не являются завершённым общим CI основных веток.

Полный перечень HTTP-операций получать из OpenAPI выбранного SHA: этот обзор
сознательно не дублирует сотни изменяемых маршрутов. Файлы: [sources](sources.md).
