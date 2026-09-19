# SUMMY · DOC / governance

**Центральная документация и канон экосистемы SUMMY**: продукт, архитектура, данные, API, репозитории, инфраструктура и инструкции для разработки. Репозиторий **публичный**: его читает любой агент (Claude, Codex, Kimi, облачные сессии) по прямой ссылке. Секреты и персональные данные здесь не хранятся.

**Начни с [AGENTS.md](AGENTS.md)**. Затем [продукт](docs/product.md) → [состояние](docs/current-state.md) → [архитектура](docs/architecture.md). Это маршрут первого знакомства за 5–10 минут; подробный устав читается перед действиями.

Документация ниже — проверяемый снимок **19.09.2026**, а не мониторинг. Наличие кода, тестовая ветка, ответ health и проверенный пользовательский сценарий — разные свидетельства. Основные документы ссылаются на [реестр источников с SHA](docs/sources.md).

## Куда смотреть (вопрос → документ)

| Вопрос | Документ |
|---|---|
| **С чего начать агенту** | [`AGENTS.md`](AGENTS.md), затем [`MAP.md`](MAP.md) |
| Продукт, пользователи и сценарии | [`docs/product.md`](docs/product.md) |
| Что реализовано, что на тесте, что неизвестно | [`docs/current-state.md`](docs/current-state.md) |
| Стек и связи приложений | [`docs/architecture.md`](docs/architecture.md), [`docs/modules.md`](docs/modules.md) |
| Данные, API, авторизация | [`docs/database.md`](docs/database.md), [`docs/api.md`](docs/api.md) |
| Репозитории и удалённые ветки | [`docs/repositories.md`](docs/repositories.md), [`docs/branches.md`](docs/branches.md) |
| Среды, конфигурация и адреса | [`docs/infrastructure.md`](docs/infrastructure.md), [`docs/resources.md`](docs/resources.md) |
| Стандарты разработки и проверки | [`docs/conventions.md`](docs/conventions.md) |
| Какие файлы действительно просмотрены | [`docs/sources.md`](docs/sources.md) |
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
- **DOC — единая точка входа**, а не копия всех частных документов: подробности реализации остаются рядом с кодом, бизнес-знания — в частном `kirillsummy/docs`, память — в `context`. Здесь их карта и источники.
- Проверка локальных ссылок: `node scripts/check-docs.mjs`; формат патча: `git diff --check`. Правила обновления снимка — в [реестре источников](docs/sources.md).

## Продукты (4 + платформа данных)

Сайт (`kirillsummy/website`, `summy.ru`) · Кабинет мастера (`kirillsummy/master-app`, `master.summy.ru`) · CRM админа и управляющего (`kirillsummy/crm`, `admin.summy.ru`) · Приложение клиента (`kirillsummy/client-app`: в `main` пока памятки, реализация в feature-ветках) · Бэкенд — FastAPI и своя БД (`kirillsummy/backend`), данные и продуктовая логика одним продуктом ([ADR-0002](decisions/0002-single-backend.md)).

Архитектор — **один на все**: ценность и риск живут на стыках между продуктами.
