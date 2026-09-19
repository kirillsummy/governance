# Стандарты разработки и проверки

[Вход в DOC](../AGENTS.md)

## Подтверждённые правила

Нормативные источники — [CHARTER](../CHARTER.md), [контракты](../MAP.md), затем
`AGENTS.md` продукта. Ниже навигация по правилам и наблюдаемому устройству;
не новый конкурирующий стандарт.

| Область | Правило / наблюдаемая практика | Источник |
|---|---|---|
| Ветки и релизы | Своя feature-ветка, PR и хендофф с SHA/проверками; protected-ветки и prod — зона назначенного релиз-инженера | [CHARTER](../CHARTER.md), [handoff](../templates/handoff.md) |
| Межпродуктовый контракт | Изменение общего поведения сначала согласуют, затем меняют потребителей совместимо | [ADR-0002](../decisions/0002-single-backend.md), [контракты](../MAP.md) |
| Frontend | Next App Router у CRM/сайта; отдельный React Router и BFF у мастера; локальные `components`/дизайн-правила | [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md), [master-app/AGENTS.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/AGENTS.md), [website/AGENTS.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/AGENTS.md) |
| Backend | Домены: router/schemas/service/repository/models; общая обработка ошибок, конфигурация и подключения | [backend/README.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/README.md), [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py), [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py) |
| Типы | TypeScript-проверки во frontend; Pydantic DTO, mypy и ruff в backend | package manifests, [backend/pyproject.toml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/pyproject.toml) |
| БД | Alembic raw SQL, applied-ревизии неприкосновенны; текущие VIEW проверяют перед новой миграцией | [backend/alembic/env.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/alembic/env.py), [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md) |
| Деньги | Серверные расчёты, денежные проверки в двух часовых поясах; UI не владелец ставок | [money-dod](../contracts/money-dod.md), [backend/.github/workflows/ci.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/.github/workflows/ci.yml) |
| Ошибки | Явный тип ошибки/состояние интерфейса; особенности контрактов проверять на конкретном route | [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py), [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md) |
| Журналирование | В доменах есть audit-модели; `/health` и freshness дают технический статус. Единую централизованную платформу логов этот срез не подтверждает | [backend/app/domains/auth/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/models.py), [backend/app/domains/clients/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/clients/models.py), [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py) |
| Зависимости | Node-проекты имеют lock-файлы, CI использует npm; Python зависимости описаны pyproject. Не объявлять единую политику pinning там, где её нет | [репозитории](repositories.md), manifests/CI |
| Секреты | Серверные env, никаких сервисных ключей в `VITE_*`, `NEXT_PUBLIC_*`, Git, DOC или клиентских ответах | [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts) |
| Имена | В коде backend `snake_case`, TS следует локальному стилю; история веток включает старые схемы именования. Новую ветку этой задачи ведём как `feature/...` | [CHARTER](../CHARTER.md), [ветки](branches.md) |

## Проверки перед сдачей

Команды ниже подтверждены manifests/CI на дату снимка. Перед запуском сверить
текущий файл продукта и использовать изолированные локальные данные.

| Продукт | Базовые проверки |
|---|---|
| backend | `ruff check app tests`, `mypy app tests`, `vulture`, `deptry .`; миграции с нуля на чистой PG18, `db/verify.sql`, `pytest -q -n 4`; денежный набор под UTC и Europe/Moscow согласно CI |
| crm | `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; остальные guards по CI/AGENTS |
| master-app | В `web`: `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check:palette`; `node --test bff/server.test.mjs`; guards по CI |
| website | `npm ci`, `npm run lint`, `npm run build`, `npm run check:palette`; собственного `npm test` в прочитанном manifest нет |
| client-app | В `main` приложения/команд нет; feature manifest содержит `typecheck`, `test`, `build`, форматирование — проверять выбранную ветку |
| governance DOC | Относительные ссылки и anchors, источники по закреплённым SHA, непротиворечивость статусов, отсутствие секретов; при правке канонных копий — существующие проверки canon |

Источники: [backend/.github/workflows/ci.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/.github/workflows/ci.yml), [crm/package.json](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/package.json),
[crm/.github/workflows/ci.yml](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/.github/workflows/ci.yml), [master-app/web/package.json](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/package.json),
[master-app/.github/workflows/ci.yml](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/.github/workflows/ci.yml), [website/package.json](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/package.json),
[client-app/package.json](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/package.json).

У backend CI уже есть проверка доступности PG перед pytest, но локальный
пропуск PG-тестов остаётся описанным долгом базовой ветки. Не обобщать это как
«CI вообще не проверяет БД». В pyproject пока различаются Python runtime и
версии tooling; согласование находится в PR #80. [Текущее состояние](current-state.md).

## Поддержание DOC

При изменении поведения обновлять соответствующую страницу и source link.
Снимок всегда имеет дату и SHA; live-статус не выводится из названия ветки.
Исторические факты сохранять с датой. Общие правила остаются в CHARTER/contracts;
DOC кратко описывает реализацию и ведёт к ним. В `docs` другого репозитория
сохраняются уникальные знания о бизнесе; их статус (черновик/решение) не менять
переписыванием в центральную документацию.

## Рекомендации, требующие отдельного решения/внедрения

Это предложения, **не утверждение о готовых стандартах**:

- регулярная автоматическая сверка БД/VIEW/OpenAPI и клиентских контрактов во всех основных ветках;
- единый подтверждённый набор ролей и отрицательных сценариев доступа через реальные входы;
- воспроизводимые конфигурации общего стенда и замена оставшихся server-only override;
- актуализация снимка веток после значимых слияний, с повторным read-only сбором GitHub metadata.

Основания: [долг и пробелы](current-state.md), [инфраструктура](infrastructure.md).
Реестр просмотренных файлов: [sources](sources.md).
