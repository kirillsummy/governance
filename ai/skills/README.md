# Skills агентов SUMMY

Исполняемые инструкции повторяемых задач: отдельная папка с `SKILL.md`,
YAML `name`/`description` и коротким рабочим процессом. Skills описывают
способ работы и не дают полномочий сверх [устава](../../CHARTER.md); наличие
файла в GitHub не устанавливает skill и не запускает действия.

| Skill | Когда применять |
|---|---|
| [summy-project-map](summy-project-map/SKILL.md) | Найти владельца модуля, зависимости и источники перед межпродуктовой задачей |
| [summy-doc-maintenance](summy-doc-maintenance/SKILL.md) | Обновить Governance по изменению, свести дубли, проверить ссылки |
| [summy-youtrack](summy-youtrack/SKILL.md) | Прочитать или изменить задачи и доску YouTrack |
| [summy-test-state](summy-test-state/SKILL.md) | Снять фактическое состояние Dev: версии, образы, ревизию БД |
| [summy-test-delivery](summy-test-delivery/SKILL.md) | Развернуть опубликованные SHA `test` на Dev |
| [summy-production-release](summy-production-release/SKILL.md) | Подготовить, проверить и выпустить кандидата на Prod |
| [summy-claude-handoff](summy-claude-handoff/SKILL.md) | Передать задачу Claude Code, показать ход в локальном окне и принять результат |
| [summy-claude-team-11](summy-claude-team-11/SKILL.md) | Менеджер Claude и десять исполнителей: очередь, владение файлами и сбор результатов; Agent Teams отдельно от `-p`-окна |

Имена `summy-test-*` сохранены для совместимости ссылок; среда в них — Dev.
