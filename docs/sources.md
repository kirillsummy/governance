# Реестр источников и границы анализа

Собрано в этой задаче до остановки дальнейшего анализа владельцем **19.09.2026**. Никакие отсутствующие сведения не предполагаются подтверждёнными. Это реестр навигации, не полный аудит всех файлов.

## Метод

GitHub metadata/default branches и remote heads сняты 19.09; код читался по закреплённым SHA, а не по случайному локальному checkout. Для веток получены commit counts, различия деревьев и до 100 последних PR каждого репозитория. Назначение без PR/документального подтверждения не угадывалось. Public health запрошены только чтением; результат и время находятся в [current-state](current-state.md). Доступ к production DB, SSH, логины и платежи не проверялись.

## Файлы с зафиксированным просмотром

«Фрагменты» означает выборку строк, относящихся к вопросу, а не полный анализ файла. Ссылки закреплены на SHA; feature-источники не объявляются основной реализацией.

| Файл / источник | Назначение | Глубина просмотра |
|---|---|---|
| [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py) | Настройки окружения и значения по умолчанию | Фрагменты; bbfe5e5e22ca |
| [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml) | Заявленный состав сервисов и сети | Фрагменты; bbfe5e5e22ca |
| [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/STAND.md) | Локальный изолированный стенд и его ограничения | Прочитан; bbfe5e5e22ca |
| [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md) | Документированный выпуск и инфраструктура | Фрагменты; bbfe5e5e22ca |
| [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md) | Известный технический долг, включая закрытые пункты | Фрагменты; bbfe5e5e22ca |
| [crm/docs/DEBT.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/DEBT.md) | Известный технический долг, включая закрытые пункты | Фрагменты; 0e3f6763e003 |
| [website/docs/DEBT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/docs/DEBT.md) | Известный технический долг, включая закрытые пункты | Фрагменты; 164dc5253a67 |
| [master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEBT.md) | Известный технический долг, включая закрытые пункты | Фрагменты; 84f3d0a74584 |
| [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md) | Назначение и точка входа репозитория | Прочитан; 3eacd57efc47 |
| [context/README.md](https://github.com/kirillsummy/context/blob/9ef472705738302b06db2277b139c70b6923e1b7/README.md) | Назначение и точка входа репозитория | Прочитан; 9ef472705738 |
| [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md) | Назначение и точка входа репозитория | Прочитан; e8249d5549a2 |
| [backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) | Общий тестовый стенд, наблюдения от 15.09 | Прочитан; f2117b3e849a |
| [client-app/docs/orders-test.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/docs/orders-test.md) | Тестовые заказы, платежи и границы приёмки | Прочитан; 319330ae8082 |
| [backend/app/dependencies.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/dependencies.py) | Автор действия и область организации | Фрагменты; bbfe5e5e22ca |
| [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py) | Создание FastAPI, маршруты, health/ready, middleware | Фрагменты; bbfe5e5e22ca |
| [backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py) | Сервисные и пользовательские auth endpoints | Фрагменты; bbfe5e5e22ca |
| [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) | Назначение и точка входа репозитория | Прочитан; 319330ae8082 |
| [backend/app/domains/appointments/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/appointments/models.py) | Запись и позиции услуг | Прочитан; bbfe5e5e22ca |
| [backend/docs/earnings-payouts.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/earnings-payouts.md) | Начисления, состав и состояния выплат, аудит | Фрагменты; bbfe5e5e22ca |
| [backend/app/sync/loop.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/sync/loop.py) | Планирование и исполнение синхронизации | Фрагменты; bbfe5e5e22ca |
| [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts) | Live/mock вход YClients | Фрагменты; 0e3f6763e003 |
| [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md) | Транспорт, cookie, allowlist, health и конфигурация BFF | Прочитан; 84f3d0a74584 |
| [backend/app/security.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/security.py) | Проверка сервисного токена | Прочитан; bbfe5e5e22ca |
| [backend/app/orm.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/orm.py) | База ORM и организационная область данных | Прочитан; bbfe5e5e22ca |
| [backend/app/domains/visits/repository.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/visits/repository.py) | Запросы и запись visits/visit_items | Фрагменты; bbfe5e5e22ca |
| [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/App.tsx) | Маршруты и экраны приложения мастера | Фрагменты; 84f3d0a74584 |
| [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py) | Доменная модель ошибок и HTTP-обработчики | Прочитан; bbfe5e5e22ca |
| [governance/CHARTER.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/CHARTER.md) | Устав, роли, полномочия, ветки и выпуск | Фрагменты; 3f013b1071d3 |
| [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md) | Правила работы в продукте | Фрагменты; 0e3f6763e003 |
| [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md) | Правила работы в продукте | Фрагменты; bbfe5e5e22ca |
| [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts) | Серверные обращения сайта к public API backend | Фрагменты; 164dc5253a67 |
| [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md) | Тестовые заказы, платежи и границы приёмки | Прочитан; ea174dd267c8 |
| [backend/app/domains/orders/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/orders/router.py) | Тестовый API заказов и проверки сессий/ролей | Фрагменты; ea174dd267c8 |
| [crm/src/lib/auth/service.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/service.ts) | Оркестрация входа и проверка allowlist роли | Фрагменты; 0e3f6763e003 |
| [backend/docs/architecture.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/architecture.md) | Архитектурное описание продукта; отдельные части исторические | Фрагменты; bbfe5e5e22ca |
| [website/src/app/api/vacancy-apply/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/vacancy-apply/route.ts) | Серверная форма отклика через Telegram | Фрагменты; 164dc5253a67 |
| [governance/contracts/orders-payments-test.md](https://github.com/kirillsummy/governance/blob/a1c3b56c4382e0520885b9b9cd3574ce16ee53ca/contracts/orders-payments-test.md) | Отдельный невлитый контракт тестового заказа и оплаты | Фрагменты; a1c3b56c4382 |

## Дополнительные прочитанные и известные входы

Следующие файлы/структуры использовались раньше в этой же задаче; отдельный построчный журнал для них не сохранялся. Это не утверждение о полном анализе каждого файла.

| Репозиторий | Файлы / назначение |
|---|---|
| [governance @ 3f013b1071d3](https://github.com/kirillsummy/governance/tree/3f013b1071d38e1f534c297011d76e467f73ee14) | README.md, MAP.md — исходная навигация; GLOSSARY.md — термины; decisions/0001-data-platform.md и 0002-single-backend.md — границы данных/backend; contracts/money-dod.md — готовность денег; roles/TEAM.md — команда; templates/AGENTS-stub.md и handoff.md — памятки/сдача; scripts/check-canon.mjs и check-karantin.mjs — существующие проверки (просмотрены части) |
| [crm @ 0e3f6763e003](https://github.com/kirillsummy/crm/tree/0e3f6763e00323703526f043b7fd4166b324ea55) | package.json — зависимости/команды; README.md — исходное описание; src/app и src/lib/adapters — инвентарь путей, не построчный аудит всех экранов |
| [master-app @ 84f3d0a74584](https://github.com/kirillsummy/master-app/tree/84f3d0a74584c549ed50070f0f3fbc2eee0f5515) | AGENTS.md — правила; web/package.json — стек/проверки; bff/server.mjs — транспорт/health; web/src/api/endpoints.ts и web/src/lib/features.ts — API/флаги (фрагменты) |
| [backend @ bbfe5e5e22ca](https://github.com/kirillsummy/backend/tree/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3) | pyproject.toml — зависимости и проверки; app/domains и alembic/versions — инвентарь путей; полный граф применённых production-миграций не проверен |
| [website @ 164dc5253a67](https://github.com/kirillsummy/website/tree/164dc5253a67ae1f1ab956eaaeeb6e439e633e76) | package.json — стек и команды; src/app — инвентарь маршрутов |
| [client-app @ 4a3a245c2212](https://github.com/kirillsummy/client-app/tree/4a3a245c221291d2d587fbe925061b9149f2ee50) | Дерево main содержит только AGENTS.md, CLAUDE.md и README.md; дерево feature-ветки содержит приложение, BFF, тесты и deploy-конфигурацию, что само по себе не означает выкатку |

Также прочитаны локальные корневые AGENTS.md и README.md рабочего пространства, data/README.md и ранняя локальная копия устава. Они использованы для обнаружения расхождений, а не как доказательство текущего GitHub/production состояния. Историческая память помогла найти контекст; свежие факты в DOC опираются на указанные исходники и текущие ответы. Требования продукта и поручение перестройки DOC взяты из чата владельца и приложенного промпта.

## Созданные документы

[AGENTS](../AGENTS.md) — вход агента; [product](product.md) — продукт; [architecture](architecture.md) — стек и связи; [database](database.md) — данные; [api](api.md) — транспорт и права; [modules](modules.md) — карта зависимостей; [repositories](repositories.md) — репозитории; [branches](branches.md) — удалённые heads; [infrastructure](infrastructure.md) — среды; [resources](resources.md) — адреса; [conventions](conventions.md) — правила; [current-state](current-state.md) — факты, ограничения и долг. Это материалы данной задачи, не независимые свидетельства работы продукта.

## Поддержка

При следующем обновлении сначала проверь изменившиеся SHA и нужные источники. Сохраняй дату, режим проверки и неизвестное; не превращай ветку или успешную сборку в отметку production. Локальный `scripts/check-docs.mjs` проверяет существование целей относительных ссылок на файлы/каталоги; внешние URL и якоря не проверяет. Снимки и исходные исторические документы сохраняются с явной датой.
