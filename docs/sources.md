# Единый реестр источников и границы анализа

## Дополнение к сверке 24.09.2026

Для [текущего среза](current-state.md) получены свежие remote refs локальных
копий пяти продуктов и Governance; точные SHA — в [матрице](branches.md).
Просмотрены цепочки миграций backend до `0135`, модель процессов/начислений,
OpenAPI/schema snapshots **как файлы**, CRM gateway/BFF и dev-маршруты,
документированные deployment/rollback-процедуры, AGENTS/README и история
авторов. Снимки не генерировались, код не тестировался, серверные окружения
и БД не опрашивались. Попытка SSH-доступа к TEST остановилась до входа из-за
непроверенного host key; она не сообщает о правах пользователя.

Сведения о людях и доступах в [команде](../roles/TEAM.md) основаны на
ответах владельца 24.09 и помечены отдельно от Git-авторства. Сообщение
Ильи о TEST от 23.09 — датированное свидетельство, не текущий замер.
Свежие refs `docs`, `context`, `workspace` не получены; исторические ссылки
ниже нельзя использовать как текущие SHA.

Переданный владельцем 24.09 Word-гайд новых сотрудников просмотрен как
**справочный источник ссылок**: адреса добавлены в [ресурсы](resources.md),
но доступность и права не проверялись. Его инструкции не заменяют текущий
устав и явные ограничения этой задачи.

## Исторический реестр 19.09.2026

Дата исходных исследований: 19.09.2026. Реестр объединён из PR #63–65.
Указанная глубина чтения относится к автору исходного исследования; при
консолидации все продукты заново не аудировались. Ниже только действительно просмотренные материалы либо отдельные
файлы, чьё назначение подтверждено текущим чатом; глубина чтения указана явно.
Нахождение имени в дереве не считается чтением содержимого. SHA — из [repositories](repositories.md).
Ссылки на приватные репозитории работают при наличии доступа. В DOC не копируются
токены, пароли, клиентские записи и приватная память.

Новый AGENTS и docs в этом PR — результат, а не независимое доказательство самих себя.
Правила подтверждаются уставом/памятками; поведение — кодом на SHA; deployment —
только свежим наблюдением среды, которого здесь нет.

## governance

- [governance/CHARTER.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/CHARTER.md) — устав, роли, базы, релиз-процесс; прочитаны существенные разделы.
- [governance/README.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/README.md) — прежний вход и список продуктов.
- [governance/MAP.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/MAP.md) — прежняя карта, исторические измерения.
- [governance/GLOSSARY.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/GLOSSARY.md) — термины, графики, ставки.
- [governance/decisions/0001-data-platform.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/decisions/0001-data-platform.md) — исходный ADR данных, прочитан.
- [governance/decisions/0002-single-backend.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/decisions/0002-single-backend.md) — единый backend, прочитан.
- [governance/contracts/money-dod.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/money-dod.md) — критерии финансовой приёмки, начало/основные правила.
- [governance/templates/AGENTS-stub.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/templates/AGENTS-stub.md) — шаблон агентской памятки, начало.
- [governance/scripts/check-canon.mjs](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/scripts/check-canon.mjs) — механизм сторожа, просмотрено начало; не весь скрипт.
## backend

- [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/AGENTS.md) — памятка и проверки.
- [backend/README.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/README.md) — назначение, стек, структура.
- [backend/pyproject.toml](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/pyproject.toml) — зависимости и проверки.
- [backend/app/main.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/main.py) — entrypoint, логирование, lifespan/регистрация; выборочно.
- [backend/app/config.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/config.py) — имена env и defaults; выборочно.
- [backend/app/db.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/db.py) — пул, транзакции, TLS; начало.
- [backend/app/security.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/security.py) — сервисный токен.
- [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/errors.py) — конверт AppError; начало.
- [backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/auth/router.py) — поиск decorators/сессионных заголовков, не полный аудит.
- [backend/app/domains/master_cabinet/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/master_cabinet/router.py) — поиск auth-зависимостей; не полный аудит.
- [backend/app/domains/client_portal/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/client_portal/router.py) — пути и зависимости; выборочно.
- [backend/app/domains/client_portal/auth.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/client_portal/auth.py) — OTP hashing/лимиты; начало.
- [backend/app/domains/orders/router.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/domains/orders/router.py) — флаги, роли, DTO, decorators; выборочно.
- [backend/app/integrations/yclients/facade.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/integrations/yclients/facade.py) — состав единственного фасада.
- [backend/app/integrations/yandex_pay.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/integrations/yandex_pay.py) — sandbox запросы, подпись и сверка.
- [backend/app/integrations/client_sms.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/integrations/client_sms.py) — адаптер SMS.ru.
- [backend/alembic/versions/0118_client_portal.sql](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/alembic/versions/0118_client_portal.sql) — DDL клиента, прочитан.
- [backend/alembic/versions/0119_order_payments_test.sql](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/alembic/versions/0119_order_payments_test.sql) — DDL заказов, прочитан.
- [backend/alembic/versions/0120_quality_before_payment.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/alembic/versions/0120_quality_before_payment.py) — nullable связь качества, прочитан.
- [backend/docker-compose.yml](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docker-compose.yml) — локальная конфигурация, первые сервисы.
- [backend/docs/architecture.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/architecture.md) — архитектура, начальные разделы.
- [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/DEBT.md) — вход, тематический указатель, отдельный пример; не весь долг.
- [backend/docs/earnings-payouts.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/earnings-payouts.md) — таблицы/витрины/инварианты, первые разделы.
- [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md) — реализация и границы оплаты.
- [backend/docs/master-shift-requests.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/master-shift-requests.md) — обращения, часы, почта; первые разделы.
- [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/STAND.md) — изоляция/запуск/вход; первые разделы.
- [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/DEPLOY.md) — deployment и VERSION, первые разделы.
## client-app

- [client-app/AGENTS.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/AGENTS.md) — памятка.
- [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) — сценарии, demo/live, запуск.
- [client-app/package.json](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/package.json) — стек/команды/Node.
- [client-app/server/index.mjs](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/server/index.mjs) — BFF whitelist, CSP, origin, proxy; первые разделы.
- [client-app/src/api.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/api.ts) — HTTP методы клиента, прочитан.
- [client-app/src/types.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/types.ts) — DTO заказов/платежей, прочитан.
- [client-app/docs/orders-test.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/docs/orders-test.md) — тестовая интеграция.
## master-app

- [master-app/AGENTS.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/AGENTS.md) — памятка.
- [master-app/web/package.json](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/web/package.json) — стек и проверки.
- [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/web/src/App.tsx) — карта экранов.
- [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/bff/README.md) — BFF, auth, ограничения.
- [master-app/docs/shift-requests.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/shift-requests.md) — обращения и снятие смены.
- [master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/DEBT.md) — указатель и пример закрытого пункта.
- [master-app/docs/DEPLOY.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/DEPLOY.md) — deployment/VERSION, первые разделы.
## crm

- [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/AGENTS.md) — правила и UI-конвенции, основная часть.
- [crm/README.md](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/README.md) — первые разделы, устаревшая mock-формулировка.
- [crm/package.json](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/package.json) — стек и проверки.
- [crm/docs/orders-test.md](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/docs/orders-test.md) — feature календарь.
- [crm/src/lib/auth/gateway-login.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/auth/gateway-login.ts) — вход и cookie.
- [crm/src/app/api/orders/[[...path]]/route.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/app/api/orders/%5B%5B...path%5D%5D/route.ts) — orders BFF.
- [crm/src/lib/adapters/processes-gateway.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/adapters/processes-gateway.ts) — первые разделы/контракт; не полный аудит адаптера.
## website

- [website/AGENTS.md](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/AGENTS.md) — памятка, первые разделы.
- [website/README.md](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/README.md) — входные разделы.
- [website/package.json](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/package.json) — стек и проверки.
- [website/docs/orders-test.md](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/docs/orders-test.md) — тестовая запись.
- [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/lib/platform.ts) — server-only, env и fetch; первые разделы.
- [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/lib/site.ts) — контакты/соцсети/переключение записи; первые разделы.
- [website/src/lib/client-booking.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/lib/client-booking.ts) — флаг и формирование клиентского URL.
- [website/next.config.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/next.config.ts) — начало, redirects/security; не полный аудит.
## docs

- [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md) — первые разделы карты знаний; получен через GitHub API.
## context

- [context/README.md](https://github.com/kirillsummy/context/blob/9ef472705738302b06db2277b139c70b6923e1b7/README.md) — назначение и структура; получен через GitHub API.
## workspace

- [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md) — карта/инструменты; получен через GitHub API.
- [workspace/test-stands/SIGNALS.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/test-stands/SIGNALS.md) — журнал сигналов, прочитан полностью.

## Дополнительные срезы и контекст

- [backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) — прочитан полностью; описание общего стенда от 15.09, не live-проверка.
- [governance/contracts/orders-payments-test.md](https://github.com/kirillsummy/governance/blob/a1c3b56c4382e0520885b9b9cd3574ce16ee53ca/contracts/orders-payments-test.md) — прочитан feature-контракт из PR #62; при объединении сохранён в [contracts](../contracts/orders-payments-test.md), без изменения статуса продуктового feature.
- Локальный контейнер `AGENTS.md`, `README.md`, `governance/CHARTER.md` — прочитаны; часть имён/правил устарела относительно GitHub. Не переносились как новый deployment-факт.
- Локальный `data/README.md` — просмотрены первые разделы; PostgreSQL 16 и прежний журнал SQL относятся к исторической платформе.
- Локальные `HANDOFF-ORDERS-TEST-20260917.md`, `work/orders-review-manifest.json` — прочитаны; источники SHA, предыдущих проверок и ограничений. Это материалы чата вне данного Git-репозитория, не самостоятельный live-отчёт.
- Сообщения владельца в текущем чате — требования: общие заказы, отдельный клиент, затем переход с сайта, затем карта вместо ссылки; просьба тестового deployment без подтверждённого результата; последняя задача — центральный DOC.

## Файлы, известные из текущего контекста или дерева

Не заявляем повторное чтение тела этих файлов при DOC-анализе:

- `client-app/src/App.tsx`, `server/demo.mjs`, `src/App.test.tsx`, `server/*.test.mjs` — UI, явно локальный demo и проверки по прошлой работе/README.
- `master-app/bff/server.mjs`, `bff/Dockerfile`, `bff/docker-compose.bff.yml` — runtime и упаковка; назначение подтверждено bff/README и DEPLOY.
- `backend/app/domains/orders/{service,payments,calendar,booking,client}.py` — правила, деньги и проекции по прошлой работе и router imports.
- `backend/alembic/versions/0117_master_requests_hours.{py,sql}` — часы/обращения по списку миграций и docs/master-shift-requests.
- `backend/db/verify.sql`, `tests/test_order_payments.py`, `tests/test_client_portal.py` — схема и тесты по памятке/предыдущему хендоффу; тесты в этой DOC-задаче не запускались.
- `backend/docker-compose.orders-test.yml` — overlay по orders-test.md; сборка не подтверждена.
- `crm/src/components/orders/orders-screen.tsx`, `master-app/web/src/screens/Orders.tsx` — новые экраны заказов по предыдущей реализации/продуктовым docs.
- `crm/src/app/layout.tsx`, `website/src/app/layout.tsx`, `website/src/app/page.tsx` — Next entrypoints по дереву; содержание не ревьюилось полностью.
- `website/deploy/server/deploy.sh`, `deploy/server/nginx-harden-summy.sh`, `docs/nginx.reference.conf` — обнаружены в дереве; команды не исполнялись.
- `.github/workflows/ci.yml` продуктов — обнаружены в дереве/памятках; фактический свежий результат job в этой задаче не утверждается.
- `governance/contracts/*`, `roles/TEAM.md`, `templates/handoff.md`, `templates/kickoff.md`, `reference/independent-canon-2026-08-14.md` — существующий уникальный материал сохранён; отдельные неоткрытые тела не объявлены проверенными.

## Машинные сведения

GitHub repo metadata/root contents/branches/open PRs/Compare API, локальные git status,
remote, rev-parse, worktree list, diff и rev-list. Их агрегированный результат находится
в branches.md. Права серверов, Cloud-панели, полная схема live-БД и CI в этот набор не входят.

Рекомендация следующему агенту: сначала прочитать AGENTS/current-state, выбрать SHA и
домен, затем прочитать только профильные источники. Не считать отсутствие детали здесь
доказательством, что её нет в любой другой ветке.


## Дополнено из исследований PR #64 и #65

Обозначения «база/выборка» сохранены из исходного реестра, не означают новый runtime-тест.

| Файл | Назначение | Глубина исходного исследования |
|---|---|---|
| [backend/.github/workflows/ci.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/.github/workflows/ci.yml) | GitHub Actions: команды и условия проверок | база: выборка содержимого/структуры |
| [backend/AGENTS.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [backend/alembic/env.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/alembic/env.py) | Alembic raw-SQL режим | база: выборка содержимого/структуры |
| [backend/alembic/versions/0001_baseline.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/alembic/versions/0001_baseline.py) | Начальная ревизия и загрузка исходного DDL | база: выборка содержимого/структуры |
| [backend/app/config.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/config.py) | Настройки backend и защитные флаги | база: выборка содержимого/структуры |
| [backend/app/domains/appointments/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/appointments/models.py) | ORM: поля и отношения домена appointments; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/auth/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/models.py) | ORM: поля и отношения домена auth; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/auth/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/router.py) | HTTP маршруты и зависимости доступа домена auth | база: выборка содержимого/структуры |
| [backend/app/domains/auth/schemas.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/schemas.py) | DTO домена auth | база: выборка содержимого/структуры |
| [backend/app/domains/clients/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/clients/models.py) | ORM: поля и отношения домена clients; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/master_cabinet/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/master_cabinet/router.py) | HTTP маршруты и зависимости доступа домена master_cabinet | база: выборка содержимого/структуры |
| [backend/app/domains/media/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/media/models.py) | ORM: поля и отношения домена media; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/processes/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/processes/models.py) | ORM: поля и отношения домена processes; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/public_api/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/public_api/router.py) | HTTP маршруты и зависимости доступа домена public_api | база: выборка содержимого/структуры |
| [backend/app/domains/recruitment/router.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/recruitment/router.py) | HTTP маршруты и зависимости доступа домена recruitment | база: выборка содержимого/структуры |
| [backend/app/domains/staff/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/staff/models.py) | ORM: поля и отношения домена staff; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/domains/warehouses/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/warehouses/models.py) | ORM: поля и отношения домена warehouses; не полный DDL | база: выборка содержимого/структуры |
| [backend/app/errors.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/errors.py) | Классы и формат ошибок backend | база: выборка содержимого/структуры |
| [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py) | FastAPI lifespan и регистрация роутеров | база: выборка содержимого/структуры |
| [backend/app/security.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/security.py) | Проверка межсервисного X-API-Token | база: выборка содержимого/структуры |
| [backend/app/sync/loop.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/sync/loop.py) | Отдельный цикл синхронизации YCLIENTS | база: выборка содержимого/структуры |
| [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [backend/docker-compose.stand.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.stand.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [backend/docs/architecture.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/architecture.md) | Исторический обзор backend, найденные расхождения отмечены | база: выборка содержимого/структуры |
| [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md) | Продуктовый runbook деплоя; не подтверждение текущей среды | база: выборка содержимого/структуры |
| [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/STAND.md) | Локальный стенд из дампа | база: выборка содержимого/структуры |
| [backend/pyproject.toml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/pyproject.toml) | Python/runtime, зависимости, lint/type/test tooling | база: выборка содержимого/структуры |
| [backend/README.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [backend/docs/client-portal.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/client-portal.md) | Feature: клиентский вход, запись, лимиты и конфигурация | feature: выборка документа/структуры |
| [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND.md) | Локальный стенд из дампа | feature: выборка документа/структуры |
| [client-app/package.json](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/package.json) | Runtime, зависимости и команды npm | feature: выборка документа/структуры |
| [client-app/README.md](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/README.md) | Назначение, запуск и навигация репозитория | feature: выборка документа/структуры |
| [client-app/AGENTS.md](https://github.com/kirillsummy/client-app/blob/4a3a245c221291d2d587fbe925061b9149f2ee50/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [client-app/README.md](https://github.com/kirillsummy/client-app/blob/4a3a245c221291d2d587fbe925061b9149f2ee50/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [crm/.github/workflows/ci.yml](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/.github/workflows/ci.yml) | GitHub Actions: команды и условия проверок | база: выборка содержимого/структуры |
| [crm/AGENTS.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [crm/docker-compose.prod.yml](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docker-compose.prod.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [crm/docs/DEBT.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [crm/docs/operations/DEPLOY.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/operations/DEPLOY.md) | Продуктовый runbook деплоя; не подтверждение текущей среды | база: выборка содержимого/структуры |
| [crm/package.json](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/package.json) | Runtime, зависимости и команды npm | база: выборка содержимого/структуры |
| [crm/README.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [crm/src/domain/access/sections.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/domain/access/sections.ts) | Каталог разделов и матрица ролей CRM | база: выборка содержимого/структуры |
| [crm/src/lib/access/visibility.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/access/visibility.ts) | Получение правил видимости/доступа CRM | база: выборка содержимого/структуры |
| [crm/src/lib/auth/current.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/current.ts) | Чтение текущей CRM-сессии | база: выборка содержимого/структуры |
| [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts) | CRM live/mock вход через YCLIENTS | база: выборка содержимого/структуры |
| [crm/src/proxy.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/proxy.ts) | Next proxy: контроль входа/маршрутов | база: выборка содержимого/структуры |
| [docs/dengi/oplata-masterov.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/dengi/oplata-masterov.md) | Черновик бизнес-правил оплаты, статус не повышен до канона | база: выборка содержимого/структуры |
| [docs/sistema/kak-ustroena-sistema.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/sistema/kak-ustroena-sistema.md) | Бизнес-описание владения данными от 16.08; частично устарело | база: выборка содержимого/структуры |
| [master-app/.github/workflows/ci.yml](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/.github/workflows/ci.yml) | GitHub Actions: команды и условия проверок | база: выборка содержимого/структуры |
| [master-app/AGENTS.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [master-app/bff/docker-compose.bff.yml](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/docker-compose.bff.yml) | Состав сервисов, сети и порты окружения | база: выборка содержимого/структуры |
| [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md) | Поведение, конфигурация и проверки BFF мастера | база: выборка содержимого/структуры |
| [master-app/bff/server.mjs](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/server.mjs) | Node BFF: auth, allowlist, proxy, health и статика | база: выборка содержимого/структуры |
| [master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [master-app/docs/DEPLOY.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEPLOY.md) | Продуктовый runbook деплоя; не подтверждение текущей среды | база: выборка содержимого/структуры |
| [master-app/web/package.json](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/package.json) | Runtime, зависимости и команды npm | база: выборка содержимого/структуры |
| [master-app/web/src/api/endpoints.ts](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/api/endpoints.ts) | Frontend-вызовы и DTO API мастера | база: выборка содержимого/структуры |
| [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/App.tsx) | Маршруты экранов мастера | база: выборка содержимого/структуры |
| [master-app/web/vite.config.ts](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/vite.config.ts) | Frontend dev/build и локальный proxy | база: выборка содержимого/структуры |
| [website/AGENTS.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/AGENTS.md) | Правила и вход для агента выбранного продукта | база: выборка содержимого/структуры |
| [website/deploy/server/deploy.sh](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/deploy/server/deploy.sh) | Скрипт размещения сайта под pm2 | база: выборка содержимого/структуры |
| [website/docs/DEBT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/docs/DEBT.md) | Пункты долга, их основания и статусы | база: выборка содержимого/структуры |
| [website/package.json](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/package.json) | Runtime, зависимости и команды npm | база: выборка содержимого/структуры |
| [website/PRODUCT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/PRODUCT.md) | Пользовательское назначение сайта | база: выборка содержимого/структуры |
| [website/README.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/README.md) | Назначение, запуск и навигация репозитория | база: выборка содержимого/структуры |
| [website/src/app/api/certificate-order/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/certificate-order/route.ts) | Серверная форма сайта: certificate-order | база: выборка содержимого/структуры |
| [website/src/app/api/vacancy-apply/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/vacancy-apply/route.ts) | Серверная форма сайта: vacancy-apply | база: выборка содержимого/структуры |
| [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts) | Серверный adapter сайта к публичным DTO backend | база: выборка содержимого/структуры |
| [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/site.ts) | Контакты, публичные ссылки и константы сайта | база: выборка содержимого/структуры |
| [workspace/prod-status.sh](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/prod-status.sh) | Скрипт проверки версий/здоровья; не запускался | база: выборка содержимого/структуры |
| [governance/roles/TEAM.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/roles/TEAM.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/templates/handoff.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/templates/handoff.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/templates/kickoff.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/templates/kickoff.md) | Правила/решение/шаблон процесса | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/brand-foundations.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/brand-foundations.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/brand-palette.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/brand-palette.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-identity.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-identity.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-photo.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-photo.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-portfolio.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-portfolio.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/master-reviews.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/master-reviews.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/qr-workplace.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/qr-workplace.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/reklamaciya.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/reklamaciya.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/shift-edge-closure.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/shift-edge-closure.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/shift-penalty.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/shift-penalty.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/shift-photos.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/shift-photos.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [governance/contracts/staff-medbook.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/contracts/staff-medbook.md) | Межпродуктовый контракт | канон: прочитанные разделы / известен по текущему контексту |
| [backend/db/schema-contract.json](https://github.com/kirillsummy/backend/blob/f53795b23999402eecfa2faa8f9098e9ce272904/db/schema-contract.json) | Автоснимок локальной PG18 после миграций 0116 | Не production dump/schema |
| [backend #80](https://github.com/kirillsummy/backend/pull/80) | Доступы/безопасность скриптов, schema/VIEW/OpenAPI, надёжность кандидатов, dev/tooling | Не слито в dev на дату среза |
| [crm #184](https://github.com/kirillsummy/crm/pull/184) | Опциональный gateway auth, proxy/access hardening | Не слито в main на дату среза |
| [master-app #93](https://github.com/kirillsummy/master-app/pull/93) | BFF token/path hardening, проверки API-контракта | Не слито в feature/react-client на дату среза |
| [backend/app/dependencies.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/dependencies.py) | Автор действия и область организации | Фрагменты; bbfe5e5e22ca |
| [backend/docs/earnings-payouts.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/earnings-payouts.md) | Начисления, состав и состояния выплат, аудит | Фрагменты; bbfe5e5e22ca |
| [backend/app/orm.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/orm.py) | База ORM и организационная область данных | Прочитан; bbfe5e5e22ca |
| [backend/app/domains/visits/repository.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/visits/repository.py) | Запросы и запись visits/visit_items | Фрагменты; bbfe5e5e22ca |
| [crm/src/lib/auth/service.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/service.ts) | Оркестрация входа и проверка allowlist роли | Фрагменты; 0e3f6763e003 |
| [governance @ 3f013b1071d3](https://github.com/kirillsummy/governance/tree/3f013b1071d38e1f534c297011d76e467f73ee14) | README.md, MAP.md — исходная навигация; GLOSSARY.md — термины; decisions/0001-data-platform.md и 0002-single-backend.md — границы данных/backend; contracts/money-dod.md — готовность денег; roles/TEAM.md — команда; templates/AGENTS-stub.md и handoff.md — памятки/сдача; scripts/check-canon.mjs и check-karantin.mjs — существующие проверки (просмотрены части) |
| [crm @ 0e3f6763e003](https://github.com/kirillsummy/crm/tree/0e3f6763e00323703526f043b7fd4166b324ea55) | package.json — зависимости/команды; README.md — исходное описание; src/app и src/lib/adapters — инвентарь путей, не построчный аудит всех экранов |
| [master-app @ 84f3d0a74584](https://github.com/kirillsummy/master-app/tree/84f3d0a74584c549ed50070f0f3fbc2eee0f5515) | AGENTS.md — правила; web/package.json — стек/проверки; bff/server.mjs — транспорт/health; web/src/api/endpoints.ts и web/src/lib/features.ts — API/флаги (фрагменты) |
| [backend @ bbfe5e5e22ca](https://github.com/kirillsummy/backend/tree/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3) | pyproject.toml — зависимости и проверки; app/domains и alembic/versions — инвентарь путей; полный граф применённых production-миграций не проверен |
| [website @ 164dc5253a67](https://github.com/kirillsummy/website/tree/164dc5253a67ae1f1ab956eaaeeb6e439e633e76) | package.json — стек и команды; src/app — инвентарь маршрутов |
| [client-app @ 4a3a245c2212](https://github.com/kirillsummy/client-app/tree/4a3a245c221291d2d587fbe925061b9149f2ee50) | Дерево main содержит только AGENTS.md, CLAUDE.md и README.md; дерево feature-ветки содержит приложение, BFF, тесты и deploy-конфигурацию, что само по себе не означает выкатку |
