# API и авторизация

Срез **19.09.2026**. Ниже карта реализованных границ, не публичное обещание всех endpoints. Детальные request/response — роутеры, Pydantic schemas и тесты backend. Базовый префикс задаёт API_V1_PREFIX (по умолчанию /v1). Источник регистрации — [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py).

## Транспорт и доверие

| Поток | Реализация базовых веток |
|---|---|
| CRM → backend | Серверные gateway-адаптеры; service token. Не все административные маршруты проверяют пользовательскую gateway-сессию |
| CRM login → YClients | Live auth проверяет внешний логин, затем allowlist определяет роль; mock существует в коде, prod health сообщает live |
| Мастер → BFF → backend | HttpOnly cookie summy_master_session; BFF добавляет X-Api-Token, X-Master-Session-Token и актор; allowlist ограничивает пути |
| Сайт → backend | Серверный platform.ts добавляет X-API-Token к /v1/public/* |
| Клиент → client BFF → backend | Только feature-ветка: OTP, собственная сессия и /v1/client/*; сервисный токен в серверном окружении |

В backend `require_service_token` сравнивает статический X-Api-Token; это не per-user авторизация. `require_actor` получает заголовки автора для аудита, их наличие само по себе не доказывает право. Мастерские токены проверяет backend; BFF не должен проксировать произвольные административные пути. INTERNAL_MASTER_API_ENABLED по умолчанию false управляет регистрацией master API.

Источники: [backend/app/security.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/security.py), [backend/app/dependencies.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/dependencies.py), [backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py), [crm/src/lib/auth/service.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/service.ts), [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts), [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts).

## Поверхности

| Поверхность | Назначение / источник |
|---|---|
| GET /health; GET /ready | Backend: версия/свежесть/задачи; readiness обращается к БД. Внутренние адреса — [resources](resources.md) |
| /v1/auth/login, /session, /access, /sections | Вход, проверка сессии, допуски/разделы; [router](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py) |
| /v1/master/auth/login, /session, /logout | Мастерская сессия, gated registration; тот же auth router |
| Доменные /v1 роутеры | Клиенты, записи, визиты, процессы, сотрудники, графики, деньги, прайс, материалы, склады, медиа, публичная витрина; [modules](modules.md) |
| /v1/earnings/entries, /payouts | Начисления, состав/история выплат и создание выплаты; [контракт домена](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/earnings-payouts.md) |
| /v1/public/masters/*, /v1/public/vacancies | Карточки/фото/портфолио/отзывы/видимость, статусы вакансий для сервера сайта; [потребитель](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts) |
| GET /api/health (CRM), GET /healthz (сайт/мастер) | Проверка собственного приложения; не доказательство полного пользовательского сценария |

Нельзя превращать внутренний /v1 в открытый универсальный reverse proxy. Полного опубликованного OpenAPI snapshot в DOC нет; URL публичного Swagger не подтверждён. [Реестр ресурсов](resources.md) не придумывает API-домен.

## Ошибки и согласованность

Backend регистрирует доменные ошибки `{error:{code,message,detail?}}`: 401, 404, 409, 422, 429 и конфигурационные ошибки; validation проходит JSON-encoding для Decimal/UUID. Это общий обработчик, но отдельные маршруты/транспорты могут иметь собственные ответы: читай конкретный контракт. Request-id добавляется middleware. [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py), [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py).

UI показывает отсутствие/ошибку данных, не подставляет правдоподобные нули. Не меняй формат ответа односторонне: найдите backend router/schema, серверный адаптер/BFF, TS-тип, экран и контрактные тесты потребителей. Общий контракт меняется в governance с продуктовой реализацией совместимости. [Конвенции](conventions.md).

## Разрабатываемый API заказов

В feature-ветке: `/v1/client/*`, `/v1/orders`, `/v1/master/orders`, `/v1/payments/yandex`. CRM заказы проверяют gateway-сессию и роль; мастер — ownership. Отдельные действия календаря, complete, cancellation-request, payment, refund, reconcile. Webhook проверяет подпись и затем состояние провайдера; browser return не подтверждает деньги. Маршруты нового контура выключены без тестовых настроек. [backend/app/domains/orders/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/orders/router.py), [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md).

Кассовый адаптер, реальная SMS-доставка и внешний сквозной платёж не подтверждены. Не переносить тестовые полномочия или callback-настройки на прод без отдельной приёмки. Полный статус — [current-state](current-state.md), просмотренные файлы — [sources](sources.md).
