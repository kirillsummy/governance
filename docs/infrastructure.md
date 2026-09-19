# Инфраструктура и окружения

Основано на tracked runbook/config на **19.09.2026**. SSH, deployment, чтение секретов и запросы к production DB в этом аудите не выполнялись. Проверены только три публичных health-ответа; [доказательства](current-state.md).

## Production по конфигурации

- Backend: контейнер api и отдельный sync; api опубликован на loopback хоста, внутренняя сеть summy-internal и DNS gateway. PostgreSQL и S3 настраиваются через env. Runbook описывает управляемый PostgreSQL Timeweb и S3; compose всё ещё содержит MinIO. Это нельзя превращать в утверждение о фактическом составе контейнеров без runtime-инвентаризации. [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml), [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md).
- Мастер: собранный web/dist обслуживает Node BFF; reverse proxy → BFF → gateway. Версия из APP_VERSION или VERSION_FILE; health отдельно проверяет наличие оболочки. [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md).
- CRM: Next.js сервер, Docker и reverse proxy; health сообщает версию/SHA/auth mode. Сайт: Next.js; его runbook и стендовая памятка описывают запуск через pm2. Полное совпадение инфраструктуры с runbook не проверено.
- Релизные метки/файл VERSION — часть выпуска; health с версией не проверяет правильность всех ответов БД. Release-процедура остаётся в [CHARTER](../CHARTER.md) и продуктовых DEPLOY.md. DOC не выдаёт разрешение выполнять команды.

## Среды

| Среда | Что известно | Граница доказательства |
|---|---|---|
| Prod | summy.ru, admin.summy.ru, master.summy.ru | Три HTTP200 JSON health на 19.09; авторизованные сценарии не проходились |
| Общий тестовый стенд summy-test | По runbook поднят 15.09; отдельный сервер, website/CRM/master + backend, ветки test | Текущие версии и login не проверены; данные из дампа, доступ защищён |
| Локальный backend stand | docker-compose.stand.yml, локальный PostgreSQL/MinIO, дамп, StandYClients, без sync | Нет живых вызовов YClients; не доказательство внешних write-сценариев |
| Orders test | Отдельная БД и compose overlay, allowlist тестовых филиалов, sandbox платежи | Feature-ветки; внешняя приёмка и публичный адрес не подтверждены |
| Отдельный staging | Достоверный отдельный URL не обнаружен | Не отождествлять с test или prod |

Источники: [описание общего стенда от 15.09](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md), [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/STAND.md), [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md). «Тестовый pod» в запросе трактуется как известный общий тестовый стенд: доказательств Kubernetes pod/cluster в прочитанных конфигурациях нет.

## Конфигурация без секретов

| Потребитель | Группы настроек |
|---|---|
| Backend | POSTGRES_*, DB_SCHEMA, SSL; API_V1_PREFIX, SERVICE_API_TOKEN; S3_*; SESSION_SECRET и TTL; INTERNAL_MASTER_API_ENABLED; DEFAULT_ORGANIZATION_ID, LOG_LEVEL |
| Master BFF | GATEWAY_URL, SERVICE_API_TOKEN, STATIC_DIR, PORT, COOKIE_SECURE, APP_VERSION/VERSION_FILE |
| CRM | ADMINAPP_YCLIENTS_AUTH_MODE и серверные credentials/allowlists; gateway-конфигурация адаптеров; новый auth-provider относится к отдельной ветке |
| Website | GATEWAY_URL, SERVICE_API_TOKEN; VACANCY_TG_BOT_TOKEN/VACANCY_TG_CHAT_ID для формы |
| Client feature | CLIENT_DEMO, CLIENT_BACKEND_URL, CLIENT_BACKEND_TOKEN, CLIENT_PUBLIC_ORIGIN |
| Orders feature | ORDERS_TEST_ENABLED, отдельная ORDERS_TEST_DATABASE, CLIENT_PORTAL_ENABLED/SECRET, sandbox merchant ID, allowlist тестовых компаний |

Точные default/валидация — [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py), [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts), [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts), [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md), [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md). Таблица не является .env-шаблоном: значения секретов здесь не публикуются. Секреты нельзя переносить в NEXT_PUBLIC_*/VITE_* или браузер.

## Известные эксплуатационные ограничения

В runbook стенда от 15.09 зафиксированы отсутствующие медиа и production cron, локальные overrides/nginx вне Git, трудности повторного получения MinIO-образов, медленные finance-запросы и ошибка отсутствующего медиа. Это наблюдения автора того runbook, не повторный замер 19.09. Их статус нужно перепроверить перед стендовой приёмкой. Сборки на небольшом стенде описаны последовательными; restore очищает БД, поэтому не является обычной проверкой документации. [описание общего стенда от 15.09](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md).

Все адреса и назначение — [resources](resources.md); файлы — [sources](sources.md).
