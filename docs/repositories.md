# Репозитории и входы в код

GitHub-инвентарь **19.09.2026**: девять репозиториев владельца kirillsummy. governance публичный, остальные восемь private. Названия и default branch сняты через GitHub API; ветки обновлены отдельным fetch всех heads без изменения рабочих checkout. Это снимок, не обещание актуальности после даты.

| Репозиторий | База | SHA снимка | Старый локальный путь в Windows |
|---|---|---|---|
| [governance](https://github.com/kirillsummy/governance) | `main` | [`3f013b1071d3`](https://github.com/kirillsummy/governance/tree/3f013b1071d38e1f534c297011d76e467f73ee14) | governance |
| [crm](https://github.com/kirillsummy/crm) | `main` | [`0e3f6763e003`](https://github.com/kirillsummy/crm/tree/0e3f6763e00323703526f043b7fd4166b324ea55) | adminapp |
| [master-app](https://github.com/kirillsummy/master-app) | `feature/react-client` | [`84f3d0a74584`](https://github.com/kirillsummy/master-app/tree/84f3d0a74584c549ed50070f0f3fbc2eee0f5515) | masterapp |
| [backend](https://github.com/kirillsummy/backend) | `dev` | [`bbfe5e5e22ca`](https://github.com/kirillsummy/backend/tree/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3) | summy-data-gateway |
| [website](https://github.com/kirillsummy/website) | `main` | [`164dc5253a67`](https://github.com/kirillsummy/website/tree/164dc5253a67ae1f1ab956eaaeeb6e439e633e76) | summy.ru |
| [client-app](https://github.com/kirillsummy/client-app) | `main` | [`4a3a245c2212`](https://github.com/kirillsummy/client-app/tree/4a3a245c221291d2d587fbe925061b9149f2ee50) | clientapp |
| [context](https://github.com/kirillsummy/context) | `main` | [`9ef472705738`](https://github.com/kirillsummy/context/tree/9ef472705738302b06db2277b139c70b6923e1b7) | context-repo |
| [workspace](https://github.com/kirillsummy/workspace) | `main` | [`3eacd57efc47`](https://github.com/kirillsummy/workspace/tree/3eacd57efc4706c74e44e592c01e1443eead3b7e) | отдельный clone |
| [docs](https://github.com/kirillsummy/docs) | `main` | [`e8249d5549a2`](https://github.com/kirillsummy/docs/tree/e8249d5549a2931555b1cca8a040e5096d2cc454) | отдельный clone |

Старые имена adminapp/SUMMY/summy-data-gateway и прежние remote могут встречаться в локальных памятках. Определяй репозиторий через Git remote и текущий GitHub, не через папку. Корень этого Windows workspace — контейнер, не Git; канонический workspace теперь сам отдельный Git-репозиторий. Локальные worktree не являются дополнительными продуктами.

## Продукты

| Repo | Директории и вход | Конфигурация | Предоставляет / потребляет |
|---|---|---|---|
| crm | src/app: страницы и server routes; src/components; src/lib/adapters, auth; docs/decisions | package.json, package-lock.json, next.config.*, tsconfig.json, components.json, Docker/CI | CRM UI и серверные маршруты → backend; текущий live auth → YClients |
| master-app | web/src/App.tsx, screens, api; bff/server.mjs; docs | web/package.json + lock, Vite/TS, bff/docker-compose.bff.yml | SPA и BFF → мастерский контур backend |
| backend | app/main.py; app/domains; app/integrations; app/sync; alembic/versions; tests | pyproject.toml, uv.lock, app/config.py, alembic.ini, docker-compose*.yml | /v1, health/ready; PostgreSQL, S3, YClients; отдельный sync process |
| website | src/app, src/components, src/lib/platform.ts, контент, public | package.json + lock, Next/TS, env на сервере | Сайт/SEO/формы; backend public API, Telegram |
| client-app main | AGENTS.md, CLAUDE.md, README.md | Приложения в main ещё нет | Зарезервированный продукт |
| client-app feature | src/main.tsx, src/App.tsx, src/api.ts, server/index.mjs, docs, public | package.json + lock, Vite/TS/Vitest, Dockerfile, deploy/nginx-client.conf | /client/ SPA+BFF → /v1/client/* backend; demo строго локально |

Присутствие конфигурационного файла подтверждено деревом; значения зависят от среды. Основные read-through источники: [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md), [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md), [website/package.json](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/package.json), [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md). Модули и зависимости — [modules](modules.md).

## Документация и рабочее пространство

| Repo/каталог | Назначение и вход | Зависимость / границы |
|---|---|---|
| governance | AGENTS.md → CHARTER.md → docs; contracts, decisions, roles, templates, scripts | Центральный DOC, единственный канон L0; приложения его потребляют, сервиса/БД нет |
| docs | README; dengi, klienty, personal, sistema | Частные бизнес-документы и старые системные описания; уникальное содержимое остаётся здесь, DOC даёт ссылки |
| context | README; agents, memory, handoffs, bin | Память и инструкции конкретных сессий; не источник новых разрешений, не production service |
| workspace | README, AGENTS, служебные shell-скрипты, test-stands | Собирает независимые продуктовые checkout; не общий runtime или монорепозиторий приложений |
| data (локально) | README, старые SQL/импортёры | Исторический исходник, не десятый обнаруженный GitHub-репозиторий и не текущий владелец схемы |
| design (локально) | Дизайн-материалы | Не Git-репозиторий по карте рабочего места |
| _attic / архивы | Старые checkout/материалы | Не источник текущего исполняемого кода |

Источники: [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md), [context/README.md](https://github.com/kirillsummy/context/blob/9ef472705738302b06db2277b139c70b6923e1b7/README.md), [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md), [MAP](../MAP.md). Содержимое приватных бизнес-документов и персональные данные не переносятся в публичный DOC.

Удалённые ветки и их реальные различия — [branches](branches.md). Все фактически прочитанные файлы, закреплённые SHA и глубина просмотра — [sources](sources.md).
