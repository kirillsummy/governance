# Skills агентов SUMMY

Здесь хранятся исполняемые инструкции повторяемых задач. Каждый skill — отдельная
папка с `SKILL.md`, YAML `name`/`description` и кратким рабочим процессом.
Подключение к конкретному агенту зависит от его среды; наличие файла в GitHub
само по себе не устанавливает skill и не запускает действия.

| Skill | Когда применять |
|---|---|
| [summy-project-map](summy-project-map/SKILL.md) | Найти владельца модуля, зависимости и нужные источники перед межпродуктовой задачей |
| [summy-doc-maintenance](summy-doc-maintenance/SKILL.md) | Обновить DOC по проверенному изменению, свести дубли, проверить ссылки |
| [summy-youtrack](summy-youtrack/SKILL.md) | Прочитать или изменить задачи и доску YouTrack с проверкой живого состояния |
| [summy-test-state](summy-test-state/SKILL.md) | Сверить версии общего TEST и ревизию БД с Git SHA |
| [summy-test-delivery](summy-test-delivery/SKILL.md) | Подготовить и выполнить разрешённую поставку конкретных SHA на TEST |
| [summy-production-release](summy-production-release/SKILL.md) | Подготовить кандидата и выпустить только утверждённый состав в production |
| [summy-claude-handoff](summy-claude-handoff/SKILL.md) | Передать задачу Claude Code, проследить работу и независимо проверить результат |

Ограничения хранятся отдельно: [RESTRICTIONS](../RESTRICTIONS.md).
Skills не предоставляют права на релиз, оплату, рассылку или изменение соседнего продукта.

[Уровни владения ИИ людьми](../../roles/ai-levels.md) — отдельный **черновик**;
это не skill, не права агента и не принятая оценка сотрудников.
