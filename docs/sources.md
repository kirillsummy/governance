# Реестр источников и границы анализа

Дата: 19.09.2026. Ниже только действительно просмотренные материалы либо отдельные
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
- [governance/contracts/orders-payments-test.md](https://github.com/kirillsummy/governance/blob/a1c3b56c4382e0520885b9b9cd3574ce16ee53ca/contracts/orders-payments-test.md) — прочитан feature-контракт из PR #62, отсутствует в основной базе этой DOC-ветки.
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
