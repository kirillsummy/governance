# API, идентичность и доступ

[Вход в DOC](../AGENTS.md) · [Архитектура](architecture.md)

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
| `/v1/client/*` | Client BFF, отдельные feature-ветки | OTP, сессия, запись, история/заказы; в базовом `dev` отсутствует |

Источники: [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py), [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py),
[backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py), [backend/app/domains/public_api/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/public_api/router.py),
[master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md),
[backend/docs/client-portal.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/client-portal.md).

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
