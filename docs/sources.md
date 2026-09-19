# Источники и реестр известных файлов

[Вход в DOC](../AGENTS.md) · [Закреплённые SHA](repositories.md)

## Метод

Снимок 19.09.2026: GitHub metadata, recursive trees, remote branches с пагинацией,
compare и открытые PR девяти известных репозиториев. По этим данным построен
полный реестр обнаруженных веток; это не поиск всех возможных репозиториев компании.
Ключевые README, манифесты, конфигурации, entrypoints, модели и routes читались
целиком либо целевыми фрагментами. Для ряда файлов подтверждены только заголовки,
структура и назначение. Таблица **не означает построчный аудит каждого файла**.
Просто перечисленные в Git tree пути не выдаются за прочитанные исходники.

Ссылки ниже закреплены на SHA среза/ветки. При новой задаче сверить актуальную
версию: source link доказывает прошлое состояние, не текущий deployment.
`docs` и `context` — отдельные репозитории, не папки runtime-продукта.
Приватные source links требуют доступа; чувствительное содержимое в публичный DOC
не переносилось. Фактические credentials, env-файлы серверов и дампы не читались.

## Файлы текущего исследования

| Репозиторий / файл | Назначение | Объём подтверждения |
|---|---|---|
| [backend/.github/workflows/ci.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/.github/workflows/ci.yml) | GitHub Actions: команды и условия проверок | база: выборка содержимого/структуры |
| [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [backend/alembic/env.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/alembic/env.py) | Alembic raw-SQL режим | база: выборка содержимого/структуры |
| [backend/alembic/versions/0001_baseline.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/alembic/versions/0001_baseline.py) | Начальная ревизия и загрузка исходного DDL | база: выборка содержимого/структуры |
| [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py) | Настройки backend и защитные флаги | база: выборка содержимого/структуры |
| [backend/app/domains/appointments/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/appointments/models.py) | ORM: поля и отношения домена appointments; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/auth/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/models.py) | ORM: поля и отношения домена auth; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py) | HTTP маршруты и зависимости доступа домена auth | база: выборка содержимого/структуры |
| [backend/app/domains/auth/schemas.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/schemas.py) | DTO домена auth | база: выборка содержимого/структуры |
| [backend/app/domains/clients/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/clients/models.py) | ORM: поля и отношения домена clients; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/master_cabinet/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/master_cabinet/router.py) | HTTP маршруты и зависимости доступа домена master_cabinet | база: выборка содержимого/структуры |
| [backend/app/domains/media/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/media/models.py) | ORM: поля и отношения домена media; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/processes/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/processes/models.py) | ORM: поля и отношения домена processes; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/public_api/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/public_api/router.py) | HTTP маршруты и зависимости доступа домена public_api | база: выборка содержимого/структуры |
| [backend/app/domains/recruitment/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/recruitment/router.py) | HTTP маршруты и зависимости доступа домена recruitment | база: выборка содержимого/структуры |
| [backend/app/domains/staff/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/staff/models.py) | ORM: поля и отношения домена staff; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/warehouses/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/warehouses/models.py) | ORM: поля и отношения домена warehouses; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py) | Классы и формат ошибок backend | база: выборка содержимого/структуры |
| [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py) | FastAPI lifespan и регистрация роутеров | база: выборка содержимого/структуры |
| [backend/app/security.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/security.py) | Проверка межсервисного X-API-Token | база: выборка содержимого/структуры |
| [backend/app/sync/loop.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/sync/loop.py) | Отдельный цикл синхронизации YCLIENTS | база: выборка содержимого/структуры |
| [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [backend/docker-compose.stand.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.stand.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [backend/docs/architecture.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/architecture.md) | Исторический обзор backend, найденные расхождения отмечены | база: выборка содержимого/структуры |
| [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md) | Продуктовый runbook деплоя; не подтверждение текущей среды | база: выборка содержимого/структуры |
| [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/STAND.md) | Локальный стенд из дампа | база: выборка содержимого/структуры |
| [backend/pyproject.toml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/pyproject.toml) | Python/runtime, зависимости, lint/type/test tooling | база: выборка содержимого/структуры |
| [backend/README.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [backend/docs/client-portal.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/client-portal.md) | Feature: клиентский вход, запись, лимиты и конфигурация | feature: выборка документа/структуры |
| [backend/docs/master-shift-requests.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/master-shift-requests.md) | Feature: обращения, часы, письма и миграции | feature: выборка документа/структуры |
| [backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) | Общий стенд summy-test; историческое описание 15.09.2026 | feature: выборка документа/структуры |
| [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND.md) | Локальный стенд из дампа | feature: выборка документа/структуры |
| [client-app/package.json](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/package.json) | Runtime, зависимости и команды npm | feature: выборка документа/структуры |
| [client-app/README.md](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/README.md) | Назначение, запуск и навигация репозитория | feature: выборка документа/структуры |
| [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) | Назначение, запуск и навигация репозитория | feature: выборка документа/структуры |
| [governance/contracts/orders-payments-test.md](https://github.com/kirillsummy/governance/blob/a1c3b56c4382e0520885b9b9cd3574ce16ee53ca/contracts/orders-payments-test.md) | Feature: решение владельца о тестовом общем заказе/оплате; PR открыт | feature: выборка документа/структуры |
| [client-app/AGENTS.md](https://github.com/kirillsummy/client-app/blob/4a3a245c221291d2d587fbe925061b9149f2ee50/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [client-app/README.md](https://github.com/kirillsummy/client-app/blob/4a3a245c221291d2d587fbe925061b9149f2ee50/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [context/README.md](https://github.com/kirillsummy/context/blob/9ef472705738302b06db2277b139c70b6923e1b7/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [crm/.github/workflows/ci.yml](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/.github/workflows/ci.yml) | GitHub Actions: команды и условия проверок | база: выборка содержимого/структуры |
| [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [crm/docker-compose.prod.yml](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docker-compose.prod.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [crm/docs/DEBT.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [crm/docs/operations/DEPLOY.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/operations/DEPLOY.md) | Продуктовый runbook деплоя; не подтверждение текущей среды | база: выборка содержимого/структуры |
| [crm/package.json](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/package.json) | Runtime, зависимости и команды npm | база: выборка содержимого/структуры |
| [crm/README.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [crm/src/domain/access/sections.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/domain/access/sections.ts) | Каталог разделов и матрица ролей CRM | база: выборка содержимого/структуры |
| [crm/src/lib/access/visibility.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/access/visibility.ts) | Получение правил видимости/доступа CRM | база: выборка содержимого/структуры |
| [crm/src/lib/auth/current.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/current.ts) | Чтение текущей CRM-сессии | база: выборка содержимого/структуры |
| [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts) | CRM live/mock вход через YCLIENTS | база: выборка содержимого/структуры |
| [crm/src/proxy.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/proxy.ts) | Next proxy: контроль входа/маршрутов | база: выборка содержимого/структуры |
| [docs/dengi/oplata-masterov.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/dengi/oplata-masterov.md) | Черновик бизнес-правил оплаты, статус не повышен до канона | база: выборка содержимого/структуры |
| [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [docs/sistema/kak-ustroena-sistema.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/sistema/kak-ustroena-sistema.md) | Бизнес-описание владения данными от 16.08; частично устарело | база: выборка содержимого/структуры |
| [master-app/.github/workflows/ci.yml](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/.github/workflows/ci.yml) | GitHub Actions: команды и условия проверок | база: выборка содержимого/структуры |
| [master-app/AGENTS.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [master-app/bff/docker-compose.bff.yml](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/docker-compose.bff.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md) | Поведение, конфигурация и проверки BFF мастера | база: выборка содержимого/структуры |
| [master-app/bff/server.mjs](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/server.mjs) | Node BFF: auth, allowlist, proxy, health и статика | база: выборка содержимого/структуры |
| [master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [master-app/docs/DEPLOY.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEPLOY.md) | Продуктовый runbook деплоя; не подтверждение текущей среды | база: выборка содержимого/структуры |
| [master-app/web/package.json](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/package.json) | Runtime, зависимости и команды npm | база: выборка содержимого/структуры |
| [master-app/web/src/api/endpoints.ts](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/api/endpoints.ts) | Frontend-вызовы и DTO API мастера | база: выборка содержимого/структуры |
| [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/App.tsx) | Маршруты экранов мастера | база: выборка содержимого/структуры |
| [master-app/web/vite.config.ts](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/vite.config.ts) | Frontend dev/build и локальный proxy | база: выборка содержимого/структуры |
| [website/AGENTS.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [website/deploy/server/deploy.sh](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/deploy/server/deploy.sh) | Скрипт размещения сайта под pm2 | база: выборка содержимого/структуры |
| [website/docs/DEBT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [website/package.json](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/package.json) | Runtime, зависимости и команды npm | база: выборка содержимого/структуры |
| [website/PRODUCT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/PRODUCT.md) | Пользовательское назначение сайта | база: выборка содержимого/структуры |
| [website/README.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [website/src/app/api/certificate-order/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/certificate-order/route.ts) | Серверная форма сайта: certificate-order | база: выборка содержимого/структуры |
| [website/src/app/api/vacancy-apply/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/vacancy-apply/route.ts) | Серверная форма сайта: vacancy-apply | база: выборка содержимого/структуры |
| [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts) | Серверный adapter сайта к публичным DTO backend | база: выборка содержимого/структуры |
| [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/site.ts) | Контакты, публичные ссылки и константы сайта | база: выборка содержимого/структуры |
| [workspace/prod-status.sh](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/prod-status.sh) | Скрипт проверки версий/здоровья; не запускался | база: выборка содержимого/структуры |
| [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [workspace/test-stands/SIGNALS.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/test-stands/SIGNALS.md) | Исторический журнал тестовых сигналов | база: выборка содержимого/структуры |
| [governance/README.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/README.md) | Назначение, запуск и навигация репозитория | канон: прочитанные разделы / известен по текущему контексту |
| [governance/MAP.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/MAP.md) | Навигация и исторические сведения о владении данными | канон: прочитанные разделы / известен по текущему контексту |
| [governance/CHARTER.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/CHARTER.md) | Нормативный устав, полномочия, ветки и релизы | канон: прочитанные разделы / известен по текущему контексту |
| [governance/GLOSSARY.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/GLOSSARY.md) | Словарь предметных терминов | канон: прочитанные разделы / известен по текущему контексту |
| [governance/roles/TEAM.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/roles/TEAM.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/decisions/0001-data-platform.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/decisions/0001-data-platform.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/decisions/0002-single-backend.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/decisions/0002-single-backend.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/templates/AGENTS-stub.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/templates/AGENTS-stub.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/templates/handoff.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/templates/handoff.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/templates/kickoff.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/templates/kickoff.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/scripts/check-canon.mjs](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/scripts/check-canon.mjs) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/brand-foundations.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/brand-foundations.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/brand-palette.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/brand-palette.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-identity.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-identity.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-photo.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-photo.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-portfolio.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-portfolio.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-reviews.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-reviews.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/money-dod.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/money-dod.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/qr-workplace.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/qr-workplace.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/reklamaciya.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/reklamaciya.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/shift-edge-closure.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/shift-edge-closure.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/shift-penalty.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/shift-penalty.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/shift-photos.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/shift-photos.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/staff-medbook.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/staff-medbook.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |


## Уже известное из работы 16.09.2026

Эти артефакты используются как **историческое свидетельство отдельной ветки**.
Их тесты/приёмка не перепроверялись этим документальным изменением. Открытый
статус соответствующих PR заново проверен через GitHub 19.09.2026.

| Файл / PR | Известное назначение | Граница |
|---|---|---|
| [backend/db/schema-contract.json](https://github.com/kirillsummy/backend/blob/f53795b23999402eecfa2faa8f9098e9ce272904/db/schema-contract.json) | Автоснимок локальной PG18 после миграций 0116 | Не production dump/schema |
| [backend #80](https://github.com/kirillsummy/backend/pull/80) | Доступы/безопасность скриптов, schema/VIEW/OpenAPI, надёжность кандидатов, dev/tooling | Не слито в dev на дату среза |
| [crm #184](https://github.com/kirillsummy/crm/pull/184) | Опциональный gateway auth, proxy/access hardening | Не слито в main на дату среза |
| [master-app #93](https://github.com/kirillsummy/master-app/pull/93) | BFF token/path hardening, проверки API-контракта | Не слито в feature/react-client на дату среза |

Локальный отчёт `SERVICE-REGISTER-2026-09-16/ПРИОРИТЕТЫ-И-ЗАМЕЩЕНИЕ.md`
из предыдущего контекста — справочный аудит вне этого Git-репозитория.
Он не заменяет приведённые source links. Воспроизводимая часть исторической
работы доступна через PR и их закреплённые коммиты.

## Что не является доказательством

- Имя ветки без PR/коммита не доказывает её назначение.
- README о стенде не доказывает доступность сегодня.
- Наличие API/таблицы/экрана не доказывает завершение пользовательского потока.
- `main`/`dev`/`test` на GitHub не доказывает версию запущенного сервера.
- Snapshot, ORM и Mermaid не заменяют сверку действительной схемы БД.
- Чужой комментарий о готовности не повышает план до реализации.

При обновлении DOC указывать дату, выбранный ref/SHA, конкретный source file
и уровень доказательства. Runtime-сверку фиксировать отдельно со временем,
средой и проверенным сценарием, без секретов и персональных данных.
