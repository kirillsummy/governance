# Репозитории и точки входа

[Вход в DOC](../AGENTS.md) · Снимок GitHub 19.09.2026 до публикации этого DOC PR.

Это **девять известных репозиториев**, найденных по текущему рабочему пространству
и связям документов. Не утверждается полный инвентарь всех организаций/аккаунтов
компании. Полные remote branch lists получены с пагинацией; private-репозитории
и закреплённые source links доступны только авторизованному читателю.

| Репозиторий | База снимка (GitHub default) | Полный SHA | Веток | Открытых PR |
|---|---|---|---:|---:|
| [governance](https://github.com/kirillsummy/governance) | `main` | `3f013b1071d38e1f534c297011d76e467f73ee14` | 3 | 1 |
| [backend](https://github.com/kirillsummy/backend) | `dev` | `bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3` | 10 | 7 |
| [crm](https://github.com/kirillsummy/crm) | `main` | `0e3f6763e00323703526f043b7fd4166b324ea55` | 18 | 3 |
| [master-app](https://github.com/kirillsummy/master-app) | `feature/react-client` | `84f3d0a74584c549ed50070f0f3fbc2eee0f5515` | 30 | 3 |
| [website](https://github.com/kirillsummy/website) | `main` | `164dc5253a67ae1f1ab956eaaeeb6e439e633e76` | 28 | 2 |
| [client-app](https://github.com/kirillsummy/client-app) | `main` | `4a3a245c221291d2d587fbe925061b9149f2ee50` | 6 | 2 |
| [docs](https://github.com/kirillsummy/docs) | `main` | `e8249d5549a2931555b1cca8a040e5096d2cc454` | 1 | 0 |
| [context](https://github.com/kirillsummy/context) | `main` | `9ef472705738302b06db2277b139c70b6923e1b7` | 1 | 0 |
| [workspace](https://github.com/kirillsummy/workspace) | `main` | `3eacd57efc4706c74e44e592c01e1443eead3b7e` | 14 | 0 |

## Продуктовые репозитории

| Репозиторий | Основные директории / модули | Точки входа / конфигурация | Связи |
|---|---|---|---|
| backend | `app/domains`, `app/sync`, `alembic/versions`, `db`, `tests`, `scripts`, `docs` | `app/main.py`, `app/config.py`, `app/sync/loop.py`, `pyproject.toml`, compose, CI | Предоставляет /v1 и health; владеет PostgreSQL, использует YCLIENTS и S3; потребители — все фронты |
| crm | `src/app` (App Router и API), `src/components`, `src/domain`, `src/lib`, `docs`, `scripts` | `src/proxy.ts`, auth/access modules, `package.json`, `tsconfig.json`, `docker-compose.prod.yml`, CI | Backend через серверные адаптеры; YCLIENTS-вход основной ветки; общие контракты Governance |
| master-app | `web/src` (экраны, API), `bff`, `docs` | `web/src/App.tsx`, `web/src/api/endpoints.ts`, `web/vite.config.ts`, `bff/server.mjs`, `web/package.json`, BFF compose, CI | BFF → backend; browser → BFF; часть dev-режимов отличается от BFF |
| website | `src/app`, `src/components`, `src/content`, `src/lib`, `deploy/server`, `docs` | `src/lib/site.ts`, `src/lib/platform.ts`, form routes, `package.json`, `deploy/server/deploy.sh`, CI | Публичный backend DTO, YCLIENTS-виджет, Telegram; контент в Git |
| client-app main | `AGENTS.md`, `CLAUDE.md`, `README.md` | Исполняемого entrypoint в `main` нет | Место для отдельного клиентского продукта |
| client-app feature | `src`, `server`, `docs` (по feature README/дереву) | `server/index.mjs`, `package.json`, Vite/TypeScript | BFF → /v1/client; собственная сборка, не модуль CRM/сайта |

Модули и зависимости по областям: [architecture](architecture.md).
Пути из таблицы сверены по recursive Git tree; содержимое конкретных
просмотренных файлов перечислено отдельно в [sources](sources.md).

## Документация и обслуживание

| Репозиторий / каталог | Назначение, папки и entrypoint | Зависимости / статус |
|---|---|---|
| governance | `AGENTS.md`/`README.md` — вход; `CHARTER.md`/`contracts`/`decisions` — канон; `docs` — карта реализации; `roles`/`templates`/`scripts` — процесс | Центральный DOC по этой задаче; прежние документы сохранены |
| docs | `README.md`, `dengi`, `klienty`, `personal`, `sistema` | Бизнес-знания и исторические схемы; статусы принятия различаются. Не заменять черновиком утверждённый контракт |
| context | `README.md`, память/агенты/хендоффы и служебные скрипты | Приватный опыт сессий. Не runtime, не источник полномочий. Частное содержимое сюда не копируется |
| workspace | `README.md`, корневые shell-скрипты, `test-stands`, исторические задания/хендоффы, `qr-bench` | Обслуживание checkout/окружений; скрипты могут выполнять реальные операции — читать перед запуском |
| local `data/` | Исторические SQL, импортёры и материалы | Не обнаружен как десятый актуальный GitHub-репозиторий в этой выборке; схема принадлежит backend |

Источники: [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md), [context/README.md](https://github.com/kirillsummy/context/blob/9ef472705738302b06db2277b139c70b6923e1b7/README.md), [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md),
[MAP: историческая проверка владения схемой](../MAP.md).

## Имена на диске и прежние названия

В Windows-контексте встречаются `adminapp` → `crm`, `masterapp` → `master-app`,
`summy-data-gateway` → `backend`, `summy.ru` → `website`; старые GitHub имена/remote
могут перенаправляться. Не переименовывать checkout автоматически. Найти remote,
Git root и нужный SHA, затем работать в своей ветке/worktree.
GitHub `workspace` описывает нормализованное рабочее пространство, но конкретный
Windows root при этой работе не являлся Git-репозиторием.

## Что читать по задаче

- Права/вход: [api](api.md), auth/access/proxy/BFF файлы выбранного продукта.
- Деньги/данные: [database](database.md), money-dod, текущие миграции и VIEW.
- Экран мастера/CRM: контракты функции, endpoints/server adapter, backend route.
- Эксплуатация: [infrastructure](infrastructure.md), затем актуальный runbook среды.
- Незнакомая ветка: [branches](branches.md), PR и compare по закреплённым SHA.
