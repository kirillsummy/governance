# SUMMY · вход для агента

Governance (`main`) — единственный канон правил SUMMY для любого чата и ПК.

## Порядок чтения

1. [Устав](CHARTER.md) — полномочия и обязательные правила. Читается целиком.
2. [Порядок работы](ai/WORKFLOW.md) — процедуры: цикл задачи, развилки,
   YouTrack, релиз Prod, координация Codex и Claude.
3. По задаче — только нужные разделы из таблицы ниже и `AGENTS.md` продукта.

## Куда смотреть

| Задача | Раздел |
|---|---|
| Продукт и подтверждённое состояние | [Продукт](docs/product.md), [текущее состояние](docs/current-state.md) |
| Архитектура и продукты | [Общая схема](docs/architecture/README.md): [backend](docs/architecture/backend.md), [crm](docs/architecture/crm.md), [master-app](docs/architecture/master-app.md), [client-app](docs/architecture/client-app.md), [website](docs/architecture/website.md) |
| БД, API, миграции | [БД](docs/database.md), [API](docs/api.md) |
| Межпродуктовое правило | [Контракты](contracts/README.md), [решения ADR](decisions/) |
| Ветки, CI | [Ветки](docs/branches.md) |
| Dev, Prod, доставка, доступы | [Инфраструктура](docs/infrastructure.md), [ресурсы](docs/resources.md) |
| Проверки перед Prod | [Конвенции](docs/conventions.md) |
| Где код | [Репозитории](docs/repositories.md), [модули](docs/modules.md), [источники](docs/sources.md) |
| Люди и доступы | [Команда](roles/TEAM.md) |
| Повторяемая процедура | [Skills](ai/skills/README.md) |
| Шаблоны | [Поручение](templates/kickoff.md), [отчёт](templates/handoff.md), [AGENTS продукта](templates/AGENTS-stub.md) |
| Вопросы людям | [Кириллу — SUM-96](https://summy.youtrack.cloud/issue/SUM-96), [Юре — SUM-97](https://summy.youtrack.cloud/issue/SUM-97) |
| Термины | [Глоссарий](GLOSSARY.md) |
| История, архив, релизы | [CHANGELOG](CHANGELOG.md), [история](docs/history/README.md), [релизы](docs/releases/) |

Документы — датированные снимки: живое состояние Git, YouTrack и сред
проверяй отдельно.
