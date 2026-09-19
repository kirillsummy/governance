# governance

**Центральный DOC SUMMY. Начать с [AGENTS.md](AGENTS.md).**

Карта продукта и реализации из собранного контекста на **19.09.2026**:
[продукт](docs/product.md) · [архитектура](docs/architecture.md) ·
[БД](docs/database.md) · [API и доступ](docs/api.md) ·
[стандарты](docs/conventions.md) · [текущее состояние](docs/current-state.md) ·
[репозитории](docs/repositories.md) · [ветки](docs/branches.md) ·
[инфраструктура и ресурсы](docs/infrastructure.md) · [источники](docs/sources.md).

Это датированный снимок исходников и известных документов, не проверка работающих
серверов. Основные ветки, разработки в PR и непроверенные сведения разделены.
Нормативный источник остаётся в CHARTER/contracts; прежние документы сохранены.

**Канон экосистемы SUMMY** — роли, процесс разработки, правила релизов, запреты, межпродуктовые контракты. Репозиторий **публичный**: его читает любой агент (Claude, Codex, Kimi, облачные сессии) по прямой ссылке.

## Куда смотреть (вопрос → документ)

| Вопрос | Документ |
|---|---|
| **С чего начать, где что искать** | [`MAP.md`](MAP.md) |
| Кто есть кто, как устроен процесс, релизы, запреты | [`CHARTER.md`](CHARTER.md) |
| Что значит термин (смена, грейд, опция, DayFill…) | [`GLOSSARY.md`](GLOSSARY.md) |
| Формат QR рабочего места | [`contracts/qr-workplace.md`](contracts/qr-workplace.md) |
| Закрытие пустых краёв смены (алгоритм, исполнитель) | [`contracts/shift-edge-closure.md`](contracts/shift-edge-closure.md) |
| Цвета бренда, правило «мебель нейтральная» | [`contracts/brand-palette.md`](contracts/brand-palette.md) |
| Как связаны сотрудник и пользователь YClients, второй филиал | [`contracts/master-identity.md`](contracts/master-identity.md) |
| Портфолио мастера: что публикуется, какие ручки, что храним | [`contracts/master-portfolio.md`](contracts/master-portfolio.md) |
| Фото мастера: одно на человека — приложение, CRM, сайт | [`contracts/master-photo.md`](contracts/master-photo.md) |
| Платформа данных (raw/core/contract, кто пишет) | [`decisions/0001-data-platform.md`](decisions/0001-data-platform.md) |
| Памятка в `AGENTS.md` продукта | [`templates/AGENTS-stub.md`](templates/AGENTS-stub.md) |
| Как ставить задачу рабочей сессии | [`templates/kickoff.md`](templates/kickoff.md) |
| Как сдавать работу архитектору | [`templates/handoff.md`](templates/handoff.md) |

## Зачем отдельный репозиторий

Это решения уровня **всей экосистемы и процесса разработки**, а не одного продукта. Раньше устав лежал внутри репо кабинета мастера — и это структурная ошибка: канон экосистемы не должен жить внутри одного из её продуктов.

Она выстрелила 16.07.2026: облачная сессия админ-платформы **не знала, что существует роль архитектора** — устав был в чужом репо, а её собственный `AGENTS.md` описывал только «что нельзя», но не «кто есть кто».

## Как это работает

- **Канон — здесь, в одном месте.** Правим только тут, через PR с ревью архитектора; подписывает владелец.
- **В каждом продукте** — `AGENTS.md`: короткая памятка (шаблон выше) + специфика продукта (стек, команды, деплой). `CLAUDE.md` продукта — переходник `@AGENTS.md`.
- **Межпродуктовые контракты** (читают ≥2 продукта) живут в [`contracts/`](contracts/) — не внутри продукта.

## Продукты (4 + платформа данных)

Сайт (`kirillsummy/website`, `summy.ru`) · Кабинет мастера (`kirillsummy/master-app`, `master.summy.ru`) · CRM админа и управляющего (`kirillsummy/crm`, `admin.summy.ru`) · Приложение клиента (`kirillsummy/client-app`: в `main` заготовка, код есть в отдельных PR — [снимок](docs/current-state.md)) · Бэкенд — FastAPI и своя БД (`kirillsummy/backend`), данные и продуктовая логика одним продуктом ([ADR-0002](decisions/0002-single-backend.md)).

Архитектор — **один на все**: ценность и риск живут на стыках между продуктами.
