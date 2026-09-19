# Правила разработки и проверки

Это свод обнаруженных правил. При конфликте полномочий применяется CHARTER и явное
решение владельца; этот файл не расширяет разрешения. Продуктовые особенности
ниже нельзя автоматически распространять на все репозитории.

## Подтверждённые соглашения

| Область | Правило / реализация | Источник |
|---|---|---|
| Backend | domains/<domain>: router, schemas, service, repository; router тонкий, ORM зеркалит DDL | backend/README.md, AGENTS.md |
| Типы | Pydantic extra=forbid для write DTO; TS в фронтах; mypy strict | backend/pyproject.toml, orders/router.py, manifests |
| БД | Новая ручная Alembic-ревизия; применённые не переписывать; учитывать порядок колонок view | backend/AGENTS.md |
| Деньги | Decimal и расчёт на backend; Москва/UTC дают одинаковый результат | backend/AGENTS.md, money-dod |
| История | Actor и append-only аудит; исправление новым событием, не стирание следа | backend/AGENTS.md, orders SQL |
| CRM UI | Radix/shadcn, общие Field/EmptyState/NavTabs; gap вместо space; свои DatePicker/MonthPicker | crm/AGENTS.md |
| CRM тесты | Смонтированный UI очищается afterEach(cleanup); отсутствие unhandled errors тоже проверяется | crm/AGENTS.md |
| Фронты | Секреты только на сервере; BFF allowlist и server-only границы | client server, master BFF, website platform.ts |
| Бренд | SUMMY, на «ты», без давления; палитра и бренд из contracts | AGENTS продуктов, governance contracts |
| Ветки | Не больше production/test/work/singular; работа в work; singular только архив достижимости; сданный SHA неизменяем | CHARTER, docs/branches.md |
| Naming | snake_case в Python/SQL; TS DTO клиента camelCase, явные aliases в backend | client types, orders/router.py |
| Ошибки | Доменные AppError и HTTPException сосуществуют, BFF иногда переводит ответ в message | api.md |
| Логи | Python logging, LOG_LEVEL, middleware request-id; финансовая история отдельно в БД | backend/app/main.py, config.py |
| Зависимости | Использовать manifests/lockfiles продукта; не вводить новую библиотеку без задачи | AGENTS и manifests |

Осторожность с версиями: backend требует Python >=3.14, но target Ruff/mypy в
manifest ещё py312/3.12. Это замеченное расхождение конфигурации, не новый стандарт.
В master BFF README указан исторический минимум Node >=18, фронтовые engines — 24.x.

## Каталог проверок по затронутому продукту

Команды ниже запускаются агентом только по прямой просьбе разработчика. По умолчанию
автоматические тесты не запускаются; это явно отмечается в передаче результата.

| Продукт | Команды из памяток/manifests |
|---|---|
| backend | `pytest -q` с PostgreSQL; `ruff check app tests`; `mypy app tests`; денежные сценарии в UTC и Europe/Moscow; миграции и db/verify.sql при изменении схемы |
| client-app | `npm test`, `npm run build`, `npm run format:check` |
| master-app | в web: `npm run typecheck`, `npm test`, `npm run build`, `npm run check:palette`; из корня `node --test bff/server.test.mjs` |
| CRM | `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` |
| website | `npm run build`, `npm run lint`, `npm run check:palette`; отдельный test script в просмотренном manifest отсутствует |
| governance / DOC | Относительные ссылки, источники и SHA, непротиворечивость статусов, отсутствие секретов, git diff --check; релевантный сторож канона по его инструкции |

Полный backend CI руками без прямой просьбы не запускать. Не повторять
дорогой прогон без новой причины. Зелёный pytest с пропущенной БД не доказывает
корректность денежных сценариев. Здесь менялась только документация: эти команды
перечислены для следующих задач, а не заявлены повторно выполненными 19.09.

## Проверка межпродуктового изменения

1. Определи хозяина данных, всех читателей и версию контракта.
2. Проверь auth/ownership, allowlist BFF, DTO, отключённый флаг и поведение ошибки.
3. При изменении БД проверь совместимость старого клиента и обратный путь без удаления аудита.
4. Сверь бизнес-время, идемпотентность и неоднозначные внешние ответы.
5. Зафиксируй порядок PR/миграций, точные SHA, проверки, незавершённое и пределы демо.

Пункты выше сведены из действующих правил, а не разрешают самостоятельный релиз.
Рекомендация, пока не реализованный механизм: автоматизировать проверку DOC-ссылок
и обновление снимка веток отдельной CI-задачей после согласования. Постоянный job
и новый «полный аудит» этим изменением не добавляются.

Дополнительные предложения из PR #64, требующие отдельного внедрения:

- Автоматическая сверка БД, VIEW, OpenAPI и клиентских контрактов основных веток.
- Единый набор ролей и отрицательных сценариев доступа через реальные входы.
- Воспроизводимые конфигурации общего стенда вместо оставшихся серверных переопределений.

CI backend уже проверяет доступность PostgreSQL перед pytest; локальные пропуски
БД-тестов не означают отсутствие такой проверки в CI. Полный набор инструментов
CI включает также vulture и deptry; перед запуском сверять текущий workflow.


## Просмотренные источники

- [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/AGENTS.md) — правила
- [backend/pyproject.toml](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/pyproject.toml) — типы и инструменты
- [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/AGENTS.md) — UI и тесты
- [client-app/package.json](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/package.json) — команды
- [master-app/web/package.json](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/web/package.json) — команды
- [website/package.json](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/package.json) — команды
- [governance/CHARTER.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/CHARTER.md) — полномочия и процесс
- [governance/contracts/money-dod.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/money-dod.md) — приёмка денег

Границы чтения и полный реестр: [sources.md](sources.md).
