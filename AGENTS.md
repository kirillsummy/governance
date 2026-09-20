# SUMMY · вход для агента

Governance — единая документация разработки SUMMY. Единственная разрешённая
удалённая ветка — **main**; другие ветки, включая временные, не создаются.
Прочитай [ограничения для ИИ](ai/RESTRICTIONS.md), затем [порядок работы](ai/WORKFLOW.md).
Полномочия задаются [уставом](CHARTER.md) и явным решением владельца, не skills.

## Найди нужный раздел

| Задача | Куда смотреть |
|---|---|
| Понять продукт и статус | [Продукт](docs/product.md), [состояние](docs/current-state.md) |
| Архитектура | [Общая схема](docs/architecture/README.md) |
| Сайт | [website](docs/architecture/website.md) |
| Backend | [backend](docs/architecture/backend.md), [БД](docs/database.md), [API](docs/api.md) |
| CRM | [crm](docs/architecture/crm.md) |
| Мастер / клиент | [master-app](docs/architecture/master-app.md), [client-app](docs/architecture/client-app.md) |
| Найти код / источник | [Репозитории](docs/repositories.md), [модули](docs/modules.md), [реестр файлов](docs/sources.md) |
| Проверки / окружения | [Конвенции](docs/conventions.md), [инфраструктура](docs/infrastructure.md) |
| Повторяемая процедура | [Skills](ai/skills/README.md) |
| Общее бизнес-правило | [Контракты](contracts/README.md) |

Перед правкой прочитай AGENTS/DEBT выбранного продукта и проверь Git root, remote,
ветку, base/upstream и незакоммиченные изменения. Соседние каталоги — отдельные продукты.
Код, feature, deployment и проверенный сценарий — разные уровни доказательства.
Документы — датированные снимки; [история](docs/history/consolidation-2026-09-19.md)
объясняет объединение прежних веток без потери источников.
