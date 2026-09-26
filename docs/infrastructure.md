# Инфраструктура и окружения

Исходная опись взята из compose/ранбуков и GitHub на 19.09.2026. Позднейшие
подтверждённые действия на TEST записаны в [текущем состоянии](current-state.md).
В этой редакции 26.09.2026 серверы повторно не опрашивались, секреты не
читались и deployment не выполнялся. Git SHA, серверный VERSION, ревизия БД
и принятый сценарий — четыре разных доказательства.

Дополнение 24.09: в актуальном коде стенда YClients credentials предназначены
только отдельному `sync` в режиме read-only; API не получает их и остаётся под
`STAND_AUTH_PASSWORD`. Старый `backend/docs/STAND-SERVER.md` утверждает, что
синка и ключей на TEST нет, — это описание от 15.09, расходящееся с новым
compose/`STAND.md`. Более поздняя локальная памятка 25.09 сообщает, что sync
на TEST работает, а CRM использует gateway-auth, не прежний mock-вход.
Действующие значения ключей и разрешённые компании здесь не публикуются;
фактические SHA и ревизии на момент релиза — в [текущем состоянии](current-state.md),
открытые проверки — в [вопросах](open-questions.md).

| Среда | Что подтверждено источником | Что не подтверждено сейчас |
|---|---|---|
| Production | Домены summy.ru/admin.summy.ru/master.summy.ru; внутренний backend, runbooks Docker/nginx, сайт имеет deploy/server | Точные текущие SHA, состав контейнеров, пользовательские сценарии |
| Общий тестовый сервер | `summy-test`, IP 201.51.9.79, nginx + Docker Compose; релиз 25.09 и применение 0141 отражены в [состоянии](current-state.md) | Текущие VERSION, compose overrides и ревизия БД 26.09 повторно не сверялись; последняя голова Git `test` могла не быть доставлена |
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

### Подключение к TEST и БД

TEST — отдельный сервер `201.51.9.79`. PostgreSQL привязана на нём к
`127.0.0.1:5434`; наружу порт БД не публикуется. На рабочем ПК Юры локальная
памятка `TEST-ACCESS.md` и игнорируемый Git помощник `.ssh/test-db.ps1`
предоставляют `Shell`, `Status`, `Psql` и `Tunnel`; `Tunnel` открывает только
локальный `127.0.0.1:15434`. `Status` перечисляет четыре продукта и **не**
подтверждает версию client-app или ревизию БД. У других участников могут быть
свои ключи и пути: локальный помощник не является частью публичного governance.

Универсальный способ — сначала независимо подтвердить SSH host key TEST,
затем установить туннель своим разрешённым ключом и подключить PostgreSQL-
клиент к `127.0.0.1:15434`, базе `summy_data`, с персональной ролью и вводом
пароля в своём терминале. Не отключать проверку host key и не переносить
приватный ключ/пароль в чат, Git, командную строку с журналированием или
клиентский bundle. Согласно локальной памятке, назначенная Юре роль TEST
может изменять строки, но не схему; права каждой другой роли и актуальные ACL
проверять отдельно, миграции согласовывать отдельно.
Дамп TEST содержит реальные клиентские данные и не является публичным fixture.

Production-приложения находятся на `81.200.146.182`, но их PostgreSQL —
отдельная управляемая БД Timeweb с TLS. SSH на сервер приложений и вход в
PostgreSQL — разные права и реквизиты. Точный endpoint, роль, сертификаты и
значения `POSTGRES_*` сверяются только в панели владельца либо защищённой
серверной конфигурации; пример `.env` не является боевым адресом. См. также
[модель БД](database.md) и [backend DEPLOY](https://github.com/kirillsummy/backend/blob/test/docs/DEPLOY.md).

### Доставка ветки `test` на общий стенд

Автоматическая выкладка после merge пока остаётся задачей
[A11](open-questions.md); простой push в `test` ничего не разворачивает.
Это доставка на Docker Compose-сервер, не создание Kubernetes pod.

1. Зафиксировать полный SHA каждого продукта из `origin/test`, текущие
   `/opt/summy-test/<продукт>/VERSION` и работающие образы/контейнеры.
   Отдельно проверить client-app: локальный `Status` его не перечисляет.
2. Для backend сравнить голову миграций кода и `alembic_version` TEST,
   проверить совместимость старого/нового API с CRM и приложениями, наличие
   восстановимой копии БД, окно работ и план отката. Миграции не выполняются
   автоматически из факта merge и не заменяются `stamp`.
3. Перед поставкой сохранить действующие compose-файлы, дополнительные
   overrides, секретный env, VERSION и предыдущий артефакт. На TEST есть
   overrides из `/opt/summy-test/overrides/` и релизных каталогов; запуск
   одного базового `docker compose up` может убрать сеть, sync или иные
   настройки. `stand/up.sh` и restore **не** использовать для обычного
   обновления: они способны пересоздать TEST-БД.
4. Поставлять согласованные SHA последовательно по продуктовому runbook;
   фронты собирать по одному из-за памяти сервера. После каждого шага сверить
   VERSION/образ, `/ready` backend, `/api/health` CRM, `/healthz` мастера и
   сайта, доступность клиента, затем адресный пользовательский smoke.
5. При сбое вернуть предыдущий код/образ и флаги по сохранённому плану.
   `alembic downgrade` не считать безопасным общим откатом после появления
   новых данных; для БД нужен заранее проверенный способ восстановления.

Синтаксис конкретной команды Compose определяется **текущими** серверными
overrides и продуктовым DEPLOY, а не историческим примером от 15.09.
Доступ к серверу, план, решение владельца и результат проверки фиксируются
в [уставном релизном порядке](../CHARTER.md#релиз-процесс-стандарт) и
[текущем состоянии](current-state.md). Эта страница сама по себе не разрешает
запуск миграции или deployment.

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

Базы продукта и feature-зависимости указаны в branches. Выпуск ведёт
агент релиза по очереди, production утверждает Кирилл (CHARTER): проверенный SHA, review, совместимость миграций/читателей,
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
