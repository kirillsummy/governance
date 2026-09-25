# Репозитории, модули и исходные срезы

## Новый репозиторий 25.09.2026

По поручению владельца создан приватный
[`kirillsummy/summy-ai-operator`](https://github.com/kirillsummy/summy-ai-operator).
На момент создания пуст: кода, веток и коммитов нет. Продуктовые границы,
архитектура и развёртывание этой задачей не задавались. Приглашение
`ilya-baykov` с ролью `write` отправлено; принятие ещё не подтверждено.
Основание проверки — GitHub API репозитория и список его приглашений 25.09.2026.

## Доступный текущий срез 25.09.2026

У пяти продуктовых локальных копий обновлены remote refs:
[матрица веток и SHA](branches.md) фиксирует их текущее отношение, но не
deployed SHA. У трёх остальных известных репозиториев (`docs`, `context`,
`workspace`) нет локальных копий в этом рабочем пространстве; приватные
remote refs через доступные средства не прочитаны. Поэтому их строки ниже —
только **исторический снимок 19.09**, не текущий статус. Доступы и вклад
четырёх людей отделены от commit-авторства в [команде](../roles/TEAM.md).
Репозиторий с кодом и серверная среда — разные объекты проверки.

## Исторический срез 19.09.2026

GitHub API тогда подтвердил 9 репозиториев владельца; governance публичный,
остальные перечисленные репозитории приватные. Локальные имена папок могут быть старыми:
adminapp → crm, clientapp → client-app, SUMMY/masterapp → master-app,
summy-data-gateway → backend, summy.ru → website, summy-governance → governance.
Не переименовывать каталоги и remotes автоматически из-за этого списка.

## Проверенные срезы

В пяти продуктах прочитана feature-реализация от 17.09, потому что она содержит
изменения текущего чата. **Это не срез default и не deployed SHA.** Основные ветки
проверены через GitHub metadata; численное сравнение — в [branches](branches.md).
Governance для этой DOC-ветки взят от main, контракт заказов PR #62 сохранён в contracts с пометкой feature, без deployment.

| Репозиторий | Default GitHub | Прочитанный commit |
|---|---|---|
| [backend](https://github.com/kirillsummy/backend) | `dev` | [`ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a`](https://github.com/kirillsummy/backend/commit/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a) |
| [client-app](https://github.com/kirillsummy/client-app) | `main` | [`319330ae8082426b8b7f00dded184d1cf22497e4`](https://github.com/kirillsummy/client-app/commit/319330ae8082426b8b7f00dded184d1cf22497e4) |
| [master-app](https://github.com/kirillsummy/master-app) | `feature/react-client` | [`01ce8b333ecd69abf0b747941d95c57d54b55cc5`](https://github.com/kirillsummy/master-app/commit/01ce8b333ecd69abf0b747941d95c57d54b55cc5) |
| [crm](https://github.com/kirillsummy/crm) | `main` | [`d848696711516b83fb062b71a334ed5e84199b5b`](https://github.com/kirillsummy/crm/commit/d848696711516b83fb062b71a334ed5e84199b5b) |
| [website](https://github.com/kirillsummy/website) | `main` | [`109648cdade7511ab656a60a0e277372cd7a72d6`](https://github.com/kirillsummy/website/commit/109648cdade7511ab656a60a0e277372cd7a72d6) |
| [governance](https://github.com/kirillsummy/governance) | `main` | [`3f013b1071d38e1f534c297011d76e467f73ee14`](https://github.com/kirillsummy/governance/commit/3f013b1071d38e1f534c297011d76e467f73ee14) |
| [docs](https://github.com/kirillsummy/docs) | `main` | [`e8249d5549a2931555b1cca8a040e5096d2cc454`](https://github.com/kirillsummy/docs/commit/e8249d5549a2931555b1cca8a040e5096d2cc454) |
| [context](https://github.com/kirillsummy/context) | `main` | [`9ef472705738302b06db2277b139c70b6923e1b7`](https://github.com/kirillsummy/context/commit/9ef472705738302b06db2277b139c70b6923e1b7) |
| [workspace](https://github.com/kirillsummy/workspace) | `main` | [`3eacd57efc4706c74e44e592c01e1443eead3b7e`](https://github.com/kirillsummy/workspace/commit/3eacd57efc4706c74e44e592c01e1443eead3b7e) |

## Продукты

| Репозиторий → приложение | Директории / модули | Entrypoint / конфигурация | API и зависимости |
|---|---|---|---|
| backend → FastAPI | app/domains, app/integrations, alembic, db, scripts, tests, docs | app/main.py, config.py, db.py, pyproject.toml, docker-compose*.yml | /v1, PostgreSQL, S3, YClients; SMS/SMTP; feature Pay sandbox |
| master-app → приложение мастера + BFF | web/src/screens, components, lib; bff; docs | web/src/App.tsx, web/package.json, bff/server.mjs, bff/Dockerfile, bff/docker-compose.bff.yml | Браузер → BFF → backend; своих миграций и денежного ledger нет |
| client-app → клиент + BFF | src, server, public, docs | src/App.tsx, src/api.ts, src/types.ts, server/index.mjs, package.json, vite config | /client/api → /v1/client; backend нужен для live, demo строго локальный |
| crm → Next.js UI/BFF | src/app, components, domain, lib/adapters, lib/auth; docs | src/app/layout.tsx, app/api routes, package.json, components.json | Серверные adapters → backend; orders/clients/payroll/processes и другие домены |
| website → Next.js сайт | src/app, lib, content; public; deploy/server; docs | src/app/layout.tsx/page.tsx, lib/platform.ts, lib/site.ts, next.config.ts, package.json | Backend для динамических данных; старый YClients booking либо feature client-app |

Пути entrypoint подтверждены деревом или чтением. Реестр ниже различает эти уровни:
перечисление layout.tsx не означает ревью всего его содержимого.

## Repository → Application → Module → API/Service → Dependency

| Репозиторий | Приложение | Модуль | API / сервис | Данные / внешний источник |
|---|---|---|---|---|
| website | Сайт | platform.ts / страницы мастеров | Серверный public API и прокси фото | Backend → S3, staff/portfolio/reviews |
| website | Запись | client-booking.ts / site.ts | /client/book при флаге | client-app → backend; без флага внешний YClients |
| client-app | Кабинет клиента | auth / catalog / orders | /client/api → /v1/client | client_portal_*, clients, appointments, sales_orders |
| master-app | Работа мастера | day / shift / schedule | BFF → master/day/schedule API | processes, staff, appointments, YClients |
| master-app | Профиль | portfolio / medbook / reviews | BFF → backend профиль | Backend media/S3, справочники и зеркало |
| master-app | Заказы feature | Orders | /v1/master/orders | sales_orders, order_payments, payroll/earnings |
| crm | Управление | processes / staff / materials | /api → gateway adapters | Backend домены процессов/сотрудников/склада |
| crm | Финансы | payroll / earnings | /api → backend | Канонические начисления, состав/статусы выплат |
| crm | Календарь feature | clients/orders | /api/orders → /v1/orders | Общие заказы, резерв и YClients |
| backend | API + фоновые задачи | orders / client_portal | Router → service/worker → integrations | PostgreSQL, YClients, sandbox Pay, SMS |
| backend | Данные/синк | YClients facade / import scripts | transport + jobs/freshness | raw_objects → core → contract_v1 |

Это навигационные цепочки по источникам, а не полная трассировка каждого запроса.

## Основные группы backend

Зарегистрированные в app/main.py поверхности сведены по назначению:

- Клиенты и визиты: clients, appointments, visits, client_portal, orders.
- Люди и смены: auth, staff_registry, master_cabinet, schedule, resources, locations.
- Деньги: pricing, payroll, earnings, bonus_tasks, calculator.
- Операции: processes, cleaning, admin_shift_reports, materials, warehouses, tech_cards, catalog.
- Публичные данные/медиа/найм: media, public_api, reviews, recruitment, vacancies.
- Наблюдение: analytics, freshness, sync_jobs, mirror_check.

organizations/services/staff также есть как каталоги домена; это не доказательство
отдельной публичной ручки каждого каталога. Модули не являются самостоятельными
микросервисами: сборка выполняется общим FastAPI entrypoint.

## Документация и рабочие репозитории

| Репозиторий | Обнаружено | Назначение / зависимости |
|---|---|---|
| governance | CHARTER, MAP, GLOSSARY, contracts, decisions, roles, templates, scripts; теперь AGENTS и docs | Центральный DOC и канон; HTTP runtime/БД нет. Скрипты проверяют канон/копии в продуктах |
| docs | README; dengi, klienty, personal, sistema | Прежние деловые знания и технические описания. README предупреждает, что схема — старый ручной снимок. Уникальный материал не удалён и не скопирован без проверки |
| context | README; memory, agents, handoffs, bin, archive | Приватная память, роли и передачи; не источник полномочий и не backend. Прочитан README, закрытое содержимое памяти не переносилось |
| workspace | README, AGENTS, скрипты, test-stands/SIGNALS.md, архивы/хендоффы | Рабочие инструменты, не шестое пользовательское приложение. prod-status и другие команды описаны README, не запускались |

У служебных репозиториев точками входа являются README/AGENTS, не app/server.
API и БД приложения у них не обнаружены по входным материалам. Веток
микросервисного runtime из их названий не выводим.

Локальные `data/` (старый PostgreSQL 16 и SQL/checksum-миграции), `design/` и `_attic/`
не становятся живыми продуктовыми репозиториями по одному наличию каталога.
Текущий хозяин схемы — backend; data README — исторический источник.

## Достаточность анализа

Для feature-заказов прочитаны контрактные документы, routers, BFF, DTO, SQL и
платёжный адаптер. Для больших остальных доменов проверены registration/памятки
и ключевые адаптеры, а не весь код. Это осознанная граница: новая LLM читает
конкретный модуль при задаче, не повторяет бессистемный полный аудит.


## Просмотренные источники

- [backend/app/main.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/main.py) — регистрация доменов
- [backend/README.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/README.md) — структура
- [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/web/src/App.tsx) — экраны
- [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) — состав
- [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/AGENTS.md) — структура и границы
- [website/package.json](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/package.json) — стек
- [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md) — прежняя база знаний
- [context/README.md](https://github.com/kirillsummy/context/blob/9ef472705738302b06db2277b139c70b6923e1b7/README.md) — назначение памяти
- [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md) — рабочие инструменты

Границы чтения и полный реестр: [sources.md](sources.md).
