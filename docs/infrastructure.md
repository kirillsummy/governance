# Инфраструктура и окружения

Сведения ниже взяты из compose/ранбуков и GitHub на 19.09.2026.
Доступность, фактические контейнеры, секреты, свежесть бэкапов и deployed SHA
на серверах в этой задаче не проверялись. Никакой deployment не выполнялся.

Дополнение 24.09: в актуальном коде стенда YClients credentials предназначены
только отдельному `sync` в режиме read-only; API не получает их и остаётся под
`STAND_AUTH_PASSWORD`. Старый `backend/docs/STAND-SERVER.md` утверждает, что
синка и ключей на TEST нет, — это описание от 15.09, расходящееся с новым
compose/`STAND.md`, **не доказательство фактической настройки сервера**.
Действующие значения ключей, разрешённые компании, выкаченный SHA, состояние
worker и `alembic_version` не просматривались. [Текущий статус](current-state.md),
[вопросы](open-questions.md).

| Среда | Что подтверждено источником | Что не подтверждено сейчас |
|---|---|---|
| Production | Домены summy.ru/admin.summy.ru/master.summy.ru; внутренний backend, runbooks Docker/nginx, сайт имеет deploy/server | Точные текущие SHA, состав контейнеров, пользовательские сценарии |
| Общий тестовый сервер | STAND-SERVER, backend PR #79: summy-test, IP 201.51.9.79, nginx + изолированные сервисы, ветки test | Доставка feature PR с клиентом/заказами и текущая конфигурация |
| Локальный stand | docker-compose.stand.yml, PostgreSQL/MinIO/API, loopback; API под STAND_AUTH_PASSWORD без YClients credentials, отдельный sync может работать read-only по новой конфигурации | Не является sandbox для записывающих YClients вызовов; фактический стенд не проверен |
| Локальный orders test | Дополнительный docker-compose.orders-test.yml, отдельная БД, синтетические данные | Docker overlay описан, его сборка в предыдущем хендоффе не проверялась |
| Локальное клиентское demo | CLIENT_DEMO=true только loopback, данные в памяти Node | Не отправляет SMS, не создаёт реальные CRM-записи и платежи |

## Production по конфигурации

- Backend: контейнер api и отдельный sync; api опубликован на loopback хоста, внутренняя сеть summy-internal и DNS gateway. PostgreSQL и S3 настраиваются через env. Runbook описывает управляемый PostgreSQL Timeweb и S3; compose всё ещё содержит MinIO. Это нельзя превращать в утверждение о фактическом составе контейнеров без runtime-инвентаризации. [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml), [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md).
- Мастер: собранный web/dist обслуживает Node BFF; reverse proxy → BFF → gateway. Версия из APP_VERSION или VERSION_FILE; health отдельно проверяет наличие оболочки. [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md).
- CRM: Next.js сервер, Docker и reverse proxy; health сообщает версию/SHA/auth mode. Сайт: Next.js; его runbook и стендовая памятка описывают запуск через pm2. Полное совпадение инфраструктуры с runbook не проверено.
- Релизные метки/файл VERSION — часть выпуска; health с версией не проверяет правильность всех ответов БД. Release-процедура остаётся в [CHARTER](../CHARTER.md) и продуктовых DEPLOY.md. DOC не выдаёт разрешение выполнять команды.

## Серверный тестовый контур

Ранбук [backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) в отдельной ветке #79 описывает Ubuntu 24.04,
Timeweb, nginx с защитой входа; наружу сайт на 443, CRM на 8443, мастер на 9443.
Внутри: backend loopback 8091, CRM 3010, master BFF 8082, website 3000;
backend с PostgreSQL/MinIO в compose, website под pm2. Docker-сеть — summy-internal.
Это описание установки от 15.09, не live-инвентаризация.

Термин «тестовый pod» не подтверждает Kubernetes: в источниках найден сервер/compose,
а Kubernetes namespace/pod/ingress для SUMMY не обнаружен в просмотренных файлах.
Не выдумывать отдельный pod URL. Адреса известных стендов — [resources](resources.md).

На стенде могут быть данные из дампа, поэтому документы не включают пароль,
персональные записи и дамп. Состав/анонимизация данных и права доступа требуют
отдельной проверки перед новой приёмкой. Stand/up восстанавливает БД с очисткой;
не запускать его для обновления кода на ценной тестовой базе.

## Конфигурация — имена, не значения секретов

| Компонент | Переменные и назначение |
|---|---|
| Backend DB/S3 | POSTGRES_*, DEFAULT_ORGANIZATION_ID, S3_*; доступ только серверный; отдельная миграционная роль на целевых БД не подтверждена |
| Backend YClients | YCLIENTS_PARTNER_TOKEN, YCLIENTS_USER_TOKEN, YCLIENTS_COMPANY_IDS, YCLIENTS_READ_ONLY; здесь указаны только имена, не фактические значения |
| Backend service/auth | SERVICE_API_TOKEN, SESSION_SECRET, INTERNAL_MASTER_API_ENABLED |
| Клиентский backend | CLIENT_PORTAL_ENABLED, CLIENT_PORTAL_SECRET, CLIENT_SMS_API_ID, CLIENT_CONSENT_VERSION |
| Orders sandbox | ORDERS_TEST_ENABLED, ORDERS_TEST_DATABASE = POSTGRES_DB, ORDERS_YCLIENTS_TEST_COMPANIES, YANDEX_PAY_SANDBOX_MERCHANT_ID, ORDERS_CLIENT_URL |
| Почта мастера | MASTER_REPORTS_EMAIL, REPORTS_SMTP_*; без настройки доставка выключена |
| Изолированный stand | STAND_AUTH_PASSWORD; несовместим с внешними боевыми реквизитами по guard backend |
| Client BFF | CLIENT_DEMO, CLIENT_BACKEND_URL, CLIENT_BACKEND_TOKEN, CLIENT_PUBLIC_ORIGIN |
| Master BFF / frontend | GATEWAY_URL, SERVICE_API_TOKEN, APP_VERSION; VITE_API_BASE, VITE_ORDERS_TEST_ENABLED |
| CRM | ADMINAPP_GATEWAY_URL/TOKEN, ADMINAPP_PUBLIC_ORIGIN, ORDERS_TEST_ENABLED |
| Website | GATEWAY_URL, SERVICE_API_TOKEN; NEXT_PUBLIC_CLIENT_BOOKING_ENABLED, NEXT_PUBLIC_CLIENT_APP_URL |

Секреты не ставить в VITE_* / NEXT_PUBLIC_*. Публичный флаг не является проверкой
прав. Production/client demo не переключается автоматически при ошибке upstream.

## Внешние зависимости

| Сервис | Роль в коде | Проверенный статус |
|---|---|---|
| YClients | Справочники, расписание, записи, auth, внешние ID; единственный фасад backend | Интеграция реализована, реальные настройки/права ключей и свежесть live-синка не проверялись |
| S3/MinIO | Медиа, backend storage; локально MinIO, runbook production указывает Timeweb S3 | Настройка описана, доступность бакета/полнота медиа не проверялись |
| SMS.ru | Код клиентского OTP | Есть адаптер, внешняя доставка не принята |
| SMTP | Отправка сохранённых обращений мастера | Есть очередь/повторы; заглушка адреса до настройки |
| Яндекс Пэй/Сплит | Платёж по заказу и возврат | Только sandbox-код; merchant и внешний прогон не подтверждены |
| Касса | Фискальный чек | Не выбрана, адаптера нет |

Не запускать внешние операции только ради обновления документации.
Существующий worker `outbox_events` обслуживает рекрутинг и общий Telegram-чат;
адресная доставка рекламаций в нём не реализована. Таблица
`order_notifications` принадлежит заказам и не заменяет этот контур.

## Релиз и проверка среды

Базы продукта и feature-зависимости указаны в branches. Порядок выпуска ведёт
Юра, production утверждает Кирилл (CHARTER): проверенный SHA, review, совместимость миграций/читателей,
описанный откат, версия в артефакте. Изменение feature или ветки test само по себе
не доказывает развёртывание. Проверять отдельно сборку, health/version и сценарий после входа.

Backend `/health` читает VERSION; `/ready` проверяет БД. Master `/healthz` проверяет
оболочку и версию. CRM `/api/health` использует свой формат VERSION; не переносить
его в backend, где ожидается одна строка. Runbook сайта и master содержит исторические
детали — перед релизом требуется сверка с текущим владельцем окружения.

Откат orders: отключить флаги/worker и сохранить аудит. Не сносить таблицы ради
успешного downgrade: ограничения 0119/0120 намеренно защищают данные.


## Просмотренные источники

- [backend/docker-compose.yml](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docker-compose.yml) — локальные сервисы
- [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/STAND.md) — изоляция
- [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md) — test overlay и guards
- [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/DEPLOY.md) — runbook, не актуальный замер
- [master-app/docs/DEPLOY.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/DEPLOY.md) — версия/сборка
- [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/bff/README.md) — серверный транспорт
- [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) — demo/live
- [backend/app/config.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/config.py) — настройки
- [backend/app/integrations/client_sms.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/integrations/client_sms.py) — SMS.ru

Границы чтения и полный реестр: [sources.md](sources.md).
