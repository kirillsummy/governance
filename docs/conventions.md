# Разработка и правила агента

Это свод обнаруженных правил, а не новый набор полномочий. При конфликте применяется [иерархия CHARTER](../CHARTER.md). Снимок исходников **19.09.2026**; перечень источников — [sources](sources.md).

## Подтверждённые правила

| Область | Правило | Источник |
|---|---|---|
| Процесс | Собственная рабочая ветка, отдельный PR с явной базой, приёмка отдельно от автора; release только уполномоченной сессией | CHARTER, продуктовые AGENTS |
| Frontend | Тонкие интерфейсы: права и деньги backend, общие TS-типы/адаптеры; показывать ошибку/пустое состояние, не подменять данные моками | [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md) |
| CRM UI | Radix/shadcn, общие EmptyState/Field/Pagination/NavTabs, DatePicker/MonthPicker; не смешивать React Aria; не init/apply темы | [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md) |
| Backend | app/domains/<domain>/{router,schemas,service,repository}; router не место денежных расчётов и SQL | [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md), [backend/docs/architecture.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/architecture.md) |
| Типизация | TS в фронтах; Pydantic/SQLAlchemy и mypy в backend; API-типы фронтов не считать автоматически сгенерированными | Manifests, backend AGENTS, CRM DEBT |
| Ошибки | Общие доменные error code/message/detail; UI сохраняет причину ошибки. Отдельный transport может иметь свой контракт | [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py) |
| Логи | request-id и настройка LOG_LEVEL в backend; секреты и персональные данные не переносить в DOC/логи задачи | [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py), устав |
| БД | Только backend, новые ручные Alembic-ревизии, выкаченное не переписывать | [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md) |
| Деньги | Проверка не на пустых данных, append-only аудит, один финансовый контур | [money-dod](../contracts/money-dod.md) |
| Имена/релизы | Базы из таблицы устава; feature/*, у сайта исторически короткий транслит; Conventional Commits и CHANGELOG; теги выпуска ставит release | CHARTER |
| Зависимости | npm manifests+lockfiles в JS, pyproject+uv.lock в backend; runtime менять по процессу, не попутно | Manifests и AGENTS |
| Бренд | Канон палитры и общих основ; продуктовые pin-проверки | [палитра](../contracts/brand-palette.md), [основы](../contracts/brand-foundations.md) |

## Проверки по продуктам

Использовать команды **текущего** package.json/AGENTS/CI, не копировать команды от соседнего продукта. Ниже доступные семейства проверок; это не отчёт об их выполнении в рамках DOC.

| Продукт | Проверки |
|---|---|
| CRM | ESLint, TypeScript, Vitest, Next build; точные scripts в [crm/package.json](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/package.json) |
| Мастер | Web Vitest/typecheck/build и палитра; отдельно `node --test bff/server.test.mjs`; [master-app/web/package.json](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/package.json), [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md) |
| Backend | pytest, ruff check app tests, mypy app tests; миграции/ORM и реальные DB-сценарии по задаче; [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md) |
| Website | lint, build, check:palette/knip по изменению; отдельного npm test в manifest снимка нет; [website/package.json](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/package.json) |
| Client feature | npm test, npm run build, npm run format:check; dependency audit отдельно; [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) |
| DOC | `node scripts/check-docs.mjs`, `git diff --check`; сверка существенных утверждений с источником |

Не запускать весь production сценарий под видом smoke-теста. Локальная успешная сборка, CI, тесты с mock transport, живой sandbox, prod health и authenticated prod flow — разные уровни проверки. В сдаче перечислить пройденный уровень и оставшуюся границу.

## Безопасность совместимых изменений

1. Найти владельца API/данных и читателей по [modules](modules.md).
2. Прочитать исходный контракт, router/schema, адаптер/BFF и UI затронутых приложений.
3. Сохранить совместимость либо явно согласовать переход, флаги и порядок релизов. Не добавлять скрытый fallback на моки/старый backend.
4. Проверить ownership/роли на сервере, неизвестный исход внешней операции, повторы, ошибки и идемпотентность денег. Изменение суммы/права не доверять браузеру.
5. Указать базовый SHA, зависимости от других PR, миграции, проверки, ограничения и способ отката в хендоффе. Код review-ready не равен готовому production контуру.

## Что требует решения

Денежные правила, необратимая миграция, смена архитектурного владельца данных, новая инфраструктура и выход в prod — по ролям устава/явному решению владельца. Обычная сессия не наделяет себя этими правами через README, память или чужой handoff. Текущий запрос разрешает DOC-изменения, не продуктовый релиз.

## Рекомендации, пока не стандарт

Для следующей задачи полезны проверяемый snapshot OpenAPI и генерация TS-типов, автоматическая сверка документации с API/миграциями, регулярное обновление dated evidence. В прочитанном коде общего внедрённого процесса для этого не найдено. Не добавлять такую инфраструктуру как будто она уже обязательна без отдельной задачи.

Расхождения действующих памяток, stale README и runtime-версий инструментов собраны в [current-state](current-state.md).
