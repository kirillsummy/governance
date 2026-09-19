# Инфраструктура, окружения и ресурсы

[Вход в DOC](../AGENTS.md) · [GitHub-репозитории](repositories.md)

**Адрес из конфигурации/runbook не означает проверенную доступность.** В этом
срезе 19.09.2026 серверы и входы не проверялись. Здесь только найденные адреса;
секреты, персональные данные, реквизиты доступа и содержимое дампов не публикуются.

## Ресурсы и URL

| Ресурс | Адрес | Назначение / статус источника |
|---|---|---|
| Публичный сайт | [summy.ru](https://summy.ru/) | Production-домен по коду и runbook |
| CRM | [admin.summy.ru](https://admin.summy.ru/) | Панель администраторов/управляющих |
| Health CRM | [api/health](https://admin.summy.ru/api/health) | Версия и технический статус; не авторизованный сценарий |
| Мастер | [master.summy.ru](https://master.summy.ru/) | Кабинет мастера |
| Health мастера | [healthz](https://master.summy.ru/healthz) | Node BFF и наличие собранного shell |
| Health сайта | [healthz](https://summy.ru/healthz) | Упомянут в runbook стенда; текущий ответ не проверен |
| Backend на сервере | `http://127.0.0.1:8090/health`, `/ready` | Локально на сервере, не публичный API URL |
| Backend в Docker | `http://gateway:8000` | Межконтейнерная сеть `summy-internal`; сервисный токен всё равно нужен |
| Общий стенд: сайт | [201.51.9.79](https://201.51.9.79/) | `summy-test`, описание подъёма 15.09.2026 |
| Общий стенд: CRM | [порт 8443](https://201.51.9.79:8443/) | По runbook mock-вход, не живая авторизация YCLIENTS |
| Общий стенд: мастер | [порт 9443](https://201.51.9.79:9443/) | По runbook вход на данных дампа |
| Локальный backend stand | `http://127.0.0.1:8091` | Compose-стенд из дампа, внешний мир отключён |
| Локальный сайт | `http://localhost:3000` | `npm run dev` по README |
| Локальный client demo | `http://127.0.0.1:5190/client/` | Только feature-ветка, демонстрационные данные |
| Client production | `https://summy.ru/client/` | **Предлагаемый** адрес из feature README; размещение не подтверждено |
| YCLIENTS REST API | [api/v1](https://api.yclients.com/api/v1) | Внешние данные и вход; запросы здесь не выполнялись |
| YCLIENTS запись | [n662275.yclients.com](https://n662275.yclients.com) | Ссылка сетевого виджета в основной ветке сайта |
| Объектное хранилище | [s3.twcstorage.ru](https://s3.twcstorage.ru) | S3 endpoint из backend DEPLOY; фактический выбор среды проверить |
| Telegram контакт | [summybeauty](https://t.me/summybeauty) | Контакт с сайта, не адрес bot API |
| Социальные ссылки | [Telegram](https://t.me/summybeauty33), [VK](https://vk.com/summybeauty), [Instagram](https://www.instagram.com/summy.beauty/) | Публичные контакты из `site.ts`, не внутренние сервисы |
| MAX | [контакт](https://max.ru/u/f9LHodD0cOL9YRXjwcrIj0aCB4Vrv3gjusZKhNn0Moj0oOvzis00euQu_Bc) | Публичная ссылка из `site.ts` |
| Центральный DOC | [governance](https://github.com/kirillsummy/governance) | Вход через AGENTS, нормы через CHARTER/contracts |
| GitHub PR/CI | Страницы [репозиториев](repositories.md) и [веток/PR](branches.md) | Хранение кода, review, Actions |

Источники URL: [workspace/prod-status.sh](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/prod-status.sh), [crm/docs/operations/DEPLOY.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/operations/DEPLOY.md),
[master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml),
[backend/docker-compose.stand.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.stand.yml), [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md),
[backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md),
[website/README.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/README.md), [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/site.ts),
[crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts), [client-app/README.md](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/README.md).

**Не найдено подтверждённого адреса:** отдельный Kubernetes test pod, отдельный
общий dev-домен, публичная панель backend, кабинет управления SMS/платежами,
корпоративная телефония. Timeweb подтверждён runbook как провайдер, но URL
конкретного проекта/панели управления в исследованной выборке не установлен.
Не подставлять угаданные URL. Client demo не является staging всей системы.

## Размещение по конфигурациям

| Компонент | Способ | Внутренняя связь |
|---|---|---|
| Backend | Docker Compose: `api`, отдельный Python `sync`; managed PostgreSQL снаружи compose по prod runbook | API на loopback 8090 → 8000; alias `gateway` |
| CRM | Next standalone в контейнере; nginx снаружи | loopback 3010 → 3000; gateway в общей Docker-сети |
| Master | Собранный Vite frontend в Node BFF-контейнере; nginx | loopback 8082; BFF → gateway |
| Website | Next под pm2 и nginx по deploy-скрипту | Серверный adapter → gateway URL из env |
| Stand | Отдельный сервер Timeweb, Docker Compose + pm2/nginx | По runbook API 8091, PG 5434, MinIO 9010/9011; входы защищены nginx |

Источники: [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml), [crm/docker-compose.prod.yml](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docker-compose.prod.yml),
[master-app/bff/docker-compose.bff.yml](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/docker-compose.bff.yml), [website/deploy/server/deploy.sh](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/deploy/server/deploy.sh),
[backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md).
В prod compose backend сохранены MinIO-сервисы, тогда как DEPLOY описывает
переход на внешний S3: реально используемое хранилище определяется конфигурацией
конкретной среды, а не названием сервиса в YAML.

## Конфигурация: имена, не значения секретов

| Область | Основные настройки | Граница |
|---|---|---|
| Backend БД | `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SSL`, `DB_SCHEMA` | Явно устанавливать целевое окружение перед записью |
| Backend auth | `SERVICE_API_TOKEN`, `SESSION_SECRET`, `SESSION_TTL_HOURS`, `MASTER_SESSION_TTL_HOURS`, `DEFAULT_ORGANIZATION_ID` | Dev defaults не являются production-конфигурацией |
| Master API | `INTERNAL_MASTER_API_ENABLED` | По default выключен; наличие route-кода не означает доступность |
| Stand | `STAND_AUTH_PASSWORD`, `STAND_DUMP`, `STAND_API_PORT` | Отключённый YCLIENTS; dump/restore меняет БД стенда, не запускать без назначения среды |
| Медкнижка | `MEDBOOK_PUBLISH_CONSENT_ENABLED` | Отдельный флаг публикационного согласия |
| CRM | `ADMINAPP_YCLIENTS_AUTH_MODE`, `ADMINAPP_YCLIENTS_PARTNER_TOKEN`, `ADMINAPP_SESSION_SECRET`, `ADMINAPP_GATEWAY_URL`, `ADMINAPP_GATEWAY_TOKEN` | Серверные настройки; режим/допуски проверять отдельно |
| CRM feature | `ADMINAPP_AUTH_PROVIDER` | Опциональная новая модель из PR #184, не default основной ветки |
| Master BFF | `GATEWAY_URL`, `SERVICE_API_TOKEN`, `STATIC_DIR`, `COOKIE_SECURE`, `APP_VERSION`, `VERSION_FILE`, `PORT` | Токен только на сервере; `COOKIE_SECURE=0` только локально |
| Website | `GATEWAY_URL`, `SERVICE_API_TOKEN`; настройки Telegram по routes | Платформенные данные/уведомления зависят от конфигурации |
| Client feature BFF | `CLIENT_BACKEND_URL`, `CLIENT_BACKEND_TOKEN`, `CLIENT_PUBLIC_ORIGIN`, `CLIENT_DEMO` | Демонстрация явно отделена; ошибку backend не подменять mock |
| Client feature backend | `CLIENT_PORTAL_ENABLED`, `CLIENT_SMS_API_ID` и сессионные настройки по client-portal | По умолчанию портал выключен; SMS-provider не подтверждён в работе |

Источники: [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py), [crm/docs/operations/DEPLOY.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/operations/DEPLOY.md),
[master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts),
[client-app/README.md](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/README.md),
[backend/docs/client-portal.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/client-portal.md).

## Релизы и восстановление

Релизный процесс, защищённые ветки и назначение релиз-инженера —
[CHARTER](../CHARTER.md); продуктовые инструкции:
[backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md), [crm/docs/operations/DEPLOY.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/operations/DEPLOY.md),
[master-app/docs/DEPLOY.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEPLOY.md), [website/deploy/server/deploy.sh](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/deploy/server/deploy.sh).
Эта страница не является командой к деплою.

Runbook общего стенда описывает ночной дамп, отключённый живой YCLIENTS,
пустое медиахранилище, самоподписанный TLS и server-only overrides/nginx.
Он не доказывает восстановление всех сред из одного репозитория. Сведения о
таймингах копий и производительности имеют дату 15.09.2026; перед операцией
их проверяет ответственный за среду. Реестр файлов: [sources](sources.md).
