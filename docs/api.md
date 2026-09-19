# API и авторизация

Пути ниже — маршруты кода, а не обещание публичной доступности. По умолчанию backend
использует `/v1`; наружу приложения обращаются через свои BFF. Точные DTO/ошибки
смотри в router/schemas соответствующего SHA, актуальную спецификацию — `/docs`
локального backend. При выключенном client/orders контуре допустим ответ 503.

| Потребитель | Его API | Backend / доступ |
|---|---|---|
| CRM | Next `/api/*`; новый `/api/orders/[[...path]]` | `/v1/*`, сервисный токен; orders проверяет отдельную подписанную сессию и роль |
| Мастер | BFF `/auth/login`, разрешённые `/v1/*` | `/v1/master/auth/*`, собственные staff-данные; allowlist BFF обязателен |
| Клиент | `/client/api/*` | `/v1/client/*`; X-API-Token и X-Client-Session-Token; HttpOnly cookie |
| Сайт | Серверный `platform.ts`, собственные маршруты медиа | Публичные DTO backend через серверное соединение |
| Провайдер | POST `/v1/payments/yandex/v1/webhook` | Без сервисного токена; test flag и проверка ES256/JWKS обязательны |
| Ops | `/health`, `/ready`; фронты имеют собственный health | Health/версия не доказывают успешность пользовательского сценария |

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

## Остальные зарегистрированные домены

`app/main.py` подключает auth, clients, appointments, visits, analytics,
tech_cards, materials, warehouses, admin_shift_reports, freshness, sync_jobs,
mirror_check, master_cabinet, bonus_tasks, pricing, processes, staff_registry,
payroll, earnings, cleaning, catalog, calculator, schedule, resources, locations,
media, public_api, recruitment, reviews, vacancies. Мастерские маршруты частично
подключаются только при INTERNAL_MASTER_API_ENABLED. Перечень модулей не заменяет
проверку конкретного HTTP пути: имя Python-модуля и URL могут различаться.

## Ошибки и совместимость

Основной AppError имеет конверт `{error: {code, message, detail?}}`.
Но feature routers также используют FastAPI HTTPException, а BFF — `message`.
Единообразие всех ошибок пока не достигнуто: новый потребитель не должен
предполагать один конверт для всех API. В client 401 сбрасывает состояние сессии.

Совместимость проверяется одновременно на router → BFF allowlist → DTO → UI.
Сервисный токен в браузер не попадает. Версионированную contract_v1 витрину нельзя
ломать для остальных читателей; для ломающего изменения нужен параллельный контракт.


## Просмотренные источники

- [backend/app/main.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/main.py) — роутеры и health
- [backend/app/domains/orders/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/orders/router.py) — методы и права
- [backend/app/domains/client_portal/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/client_portal/router.py) — клиентские пути
- [backend/app/security.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/security.py) — сервисная аутентификация
- [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/errors.py) — AppError
- [backend/app/integrations/yandex_pay.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/integrations/yandex_pay.py) — подпись и сверка
- [client-app/src/api.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/api.ts) — клиентский транспорт
- [client-app/src/types.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/types.ts) — DTO
- [crm/src/app/api/orders/[[...path]]/route.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/app/api/orders/%5B%5B...path%5D%5D/route.ts) — allowlist и proxy

Границы чтения и полный реестр: [sources.md](sources.md).
