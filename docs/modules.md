# Карта модулей и зависимостей

Снимок известных из этой задачи связей на **19.09.2026**. Основные ветки и SHA — [repositories](repositories.md), границы проверки — [current-state](current-state.md). Таблица показывает владельцев и потребителей, а не подтверждает каждый сценарий на проде.

| Repository → Application | Module / вход | API или сервис | БД / внешняя зависимость |
|---|---|---|---|
| crm → CRM | src/app, src/lib/adapters/*-gateway.ts | Серверные маршруты и доменные /v1 backend | PostgreSQL через backend |
| crm → CRM | src/lib/auth/service.ts, yclients-auth.ts | Live login и allowlist роли | YClients; перенос входа развивается отдельно |
| master-app → приложение мастера | web/src/App.tsx, screens, api | bff/server.mjs → мастерские API backend | БД и YClients через backend |
| master-app → BFF | Авторизация, cookie, allowlist, статика | /auth/login, /auth/logout, /healthz, разрешённые /v1 | Gateway, web/dist |
| website → сайт | src/app, src/lib/platform.ts | /v1/public/masters/*, /v1/public/vacancies | Backend, его медиа/БД; локальный контент сайта |
| website → серверные формы | src/app/api/vacancy-apply/route.ts | Telegram sendMessage | Telegram |
| backend → FastAPI | app/main.py, app/domains | /v1; /health, /ready | PostgreSQL, S3, YClients |
| backend → синхронизация | app/sync/loop.py, integrations/yclients | Отдельный sync process | YClients → raw_objects, external_refs, sync_runs и доменные данные |
| backend → деньги | pricing, payroll, earnings | Расчёт начислений, баланс, выплаты/аудит | SQL-витрины и существующие earnings_* |
| client-app → клиент, feature-ветка | src/App.tsx, server/index.mjs | /client/ BFF → /v1/client/* | Backend; локальный demo отдельно |
| backend → заказы, feature-ветка | client_portal, orders | /v1/orders, /v1/master/orders, платежи | Отдельная тестовая БД, YClients test, Яндекс sandbox |
| governance → DOC | AGENTS, CHARTER, contracts, docs | Документация и правила | Читают все продукты, собственного runtime нет |
| docs / context / workspace | Бизнес-знания / память / служебные скрипты | Поддержка разработки | Не дополнительные продуктовые backend |

## Основные домены backend

В дереве базовой ветки обнаружены роутеры: admin_shift_reports, analytics, appointments, auth, bonus_tasks, calculator, catalog, cleaning, clients, earnings, freshness, locations, master_cabinet, materials, media, mirror_check, payroll, pricing, processes, public_api, recruitment, resources, reviews, schedule, staff_registry, sync_jobs, tech_cards, vacancies, visits, warehouses. Регистрация и флаги — в app/main.py. Наличие файла не означает включённость маршрута в конкретной среде.

Обычная внутренняя цепочка: router → service → repository; входные/выходные формы — schemas. Деньги связывают pricing/payroll/earnings; смены и рекламации используют общие процессы. Медиа обслуживает несколько приложений. Точная зависимость конкретного изменения проверяется по импорту/вызову, не только по этому списку.

## Где искать интерфейс

CRM группирует страницы по clients, staff, processes, payroll, materials, warehouses, tech-cards, media, settings, analytics. Мастер содержит экраны дня/записи, смены/графика, профиля/портфолио/медкнижки, отзывов и финансов. На сайте — услуги, студии, мастера, блог, вакансии и публичные формы. Это карта маршрутов, не отметка завершённости всех экранов.

Общая диаграмма — [architecture](architecture.md); авторизация — [api](api.md); данные — [database](database.md). Файлы и глубина просмотра — [sources](sources.md).
