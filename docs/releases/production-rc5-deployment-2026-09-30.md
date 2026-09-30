# Production RC5 редакция 2: выкладка 30.09.2026

Статус: **развёрнуто на production**. Утверждение — прямой ответ «Заливай на прод» в рабочем чате 30.09.2026 на вопрос об утверждении пакета [RC5 редакция 2](production-rc5-edition2-2026-09-30.md) (Governance `5fd0d63a93e7b85b4051336adf13ea5b0294c592`) и выкладке сейчас. Задача — [SUM-176](https://summy.youtrack.cloud/issue/SUM-176). Кандидат RC4 этой выкладкой перекрыт: его изменения входят в RC5.

## Что работает

| Продукт | Production-ветка | Было (RC2) | Развёрнуто | Метка | Образ / артефакт |
|---|---|---|---|---|---|
| backend (API и sync) | `dev` | `5682ad92b828e4cfc3a8bbdbd3bbd63d6182aeff` | `10e0dd53355605a2d9ae7daa1f3ba45ee1c4fb95` | `v0.2.0` | `summy-backend:rc5-10e0dd533556` (`sha256:6045fddde48d…`) |
| CRM | `main` | `07f9d7b86b2897a4c2436bfdc0f079186f39884d` | `086e8c71de92668caf57a8f1af9b605f829d2125` | `v0.178.0` | `summy-crm:rc5-086e8c71de92` (`sha256:0f256e09f749…`) |
| master-app | `feature/react-client` | `070fcd4741cd0df1528c851878400a4eedbf6925` | `dee599f81da12aaef7832c26f4c840803d3de816` | `v0.80.0` | `summy-master:rc5-dee599f81da1` (`sha256:aefdad0957d4…`) |
| website | `main` | `c234d88704279df85c3a56d2fceb333ae7c1b672` | `a086b8386fa886960c795ed30e924a76db6473fb` | `v2.31.0` | сборка `BUILD_ID` `LWOX5S7eu4Bi6496QQ6Xb`, pm2 `summy` |
| client-app | `main` не менялась (`4a3a245c221291d2d587fbe925061b9149f2ee50`) | не развёрнут | **только поставлен, не запущен**: `175633fa52b48430a58bbaf03e4d6cb43f5098c6` | нет | `summy-client:rc5-175633fa52b4` (`sha256:6e7ff0aa9c78…`) загружен |

Четыре production-ветки продвинуты fast-forward без force на развёрнутые SHA, аннотированные метки указывают на те же коммиты (сверено `ls-remote`). client-app в production не работает, поэтому его ветка и метка не менялись.

**client-app.** Образ загружен со сверкой SHA-256 архива и метки ревизии; файлы запуска лежат в `/opt/summy-client` как `docker-compose.prod.yml.inactive` и `nginx-location.conf.inactive`, `VERSION` — `staged-only`. Контейнера нет, `.env` client-app не создавался, маршрута `/client/` в nginx нет, `CLIENT_PORTAL_ENABLED=false`. **Клиентский вход на `https://summy.ru/client/` не включён и не работает.** Настройки SMS не проверялись и не менялись: повторная проверка отменена поручением.

## Настройки

- Вход CRM `gateway`; backend `CRM_SESSION_REQUIRED=true`, `PROCESS_SESSION_REQUIRED=true`.
- Допуски перенесены из действующих списков CRM по номерам учёток с теми же ролями: три существующие строки сохранены с прежними ролями, четыре администратора добавлены, управляющей и администраторам выданы оба действующих филиала. Новых учёток нет, сопоставления по имени нет.
- Основной филиал назначен всем пяти администраторам по `primary-locations.json` (номер учётки → сотрудник → рабочее место): двоим «Батурина» `yclients-481570`, троим «Офицерская» `yclients-386571`.
- Действующий владелец — утверждающий факты оклада управляющей (`MANAGER_PAY_APPROVER_YCLIENTS_USER_ID`) и учётка со скрытым блоком «Настройки» (`ADMINAPP_SETTINGS_NAV_HIDDEN_LOGINS`); совпадение с единственным номером в списке владельцев CRM сверено.
- `CLEANING_ADMIN_REPORT_FROM=2026-10-01` — следующий календарный день по Москве после выкладки; прошлые выходы не пересчитываются. `CLEANING_LOCATION_RATES_FROM` и `CLEANING_CHECKLIST_NO_DELAY_FROM` не заданы.
- Выключены: `YCLIENTS_PAID_AUTO_CLOSE_ENABLED`, `LOYALTY_CARDS_SYNC_ENABLED`, `CASH_PAYOUTS_ENABLED`, `PHOTO_PROOF_V2_ENABLED`, `TEST_DEVELOPER_ENABLED`, `ORDERS_TEST_ENABLED`, `CLIENT_PORTAL_ENABLED`.

## Ход выкладки (МСК)

| Шаг | Время | Результат |
|---|---|---|
| Сверка исходного состояния: четыре `VERSION` = RC2, образ API и sync = RC2, блокировка свободна, других выкладок нет | 20:43 | совпало |
| Перенос каталога выпуска с TEST в `/root/releases/rc5-20260930` | 20:46–20:58 | `sha256sum -c SHA256SUMS` — 19 файлов OK, `SHA256SUMS` = `0d6fc9f7a353f89b61544df1111f616e96315dc4c5bbc29b6ea2c5e9f9146f6e` |
| Защищённая копия rollback-конфигурации (compose, `.env`, `VERSION` четырёх продуктов, nginx, pm2) в `/root/releases/rc5-rollback-config-20260930` (0700/0600) | 20:57 | сохранено |
| `rc5-stage.py --crm-auth gateway …` | 20:59:18–20:59:32 | exit 0, образы сверены, инварианты compose выполнены |
| `rc5-website-stage.py` | 21:00:32 | exit 0 |
| `rc5-deploy.py backend`: остановка API и sync | 21:01:36 | exit 0 |
| свежая копия БД и полное чтение `pg_restore` | 21:01:38–21:08:07 | exit 0 |
| `0143_test_developer_access → 0160_daily_processes`, 17 ревизий по одной на действующей БД, без restore | 21:08:14–21:11:23 | каждая exit 0 |
| сверка данных, запуск API и sync, `ready` и версия | 21:11:26–21:11:42 | exit 0 |
| `rc5-deploy.py access` | 21:14:12 | exit 0, администраторов без филиала — 0 |
| `rc5-deploy.py master` | 21:15:10–21:15:23 | exit 0, health `RC5+dee599f…` |
| `rc5-deploy.py crm` | 21:15:23–21:15:26 | exit 0, health `086e8c7…` |
| `rc5-deploy.py website` | 21:15:44–21:15:49 | exit 0, health `RC5+a086b83…` |
| client-app: загрузка образа и файлов запуска, неактивно | 21:16 | выполнено, контейнер не запускался |
| `rc5-postdeploy-check.py --after db-before.json --crm-auth gateway` | 21:16:16 | 49 из 50 проверок OK, см. ниже |

API и sync не работали 21:01:36–21:11:41 (около 10 минут; из них 6,5 минуты заняла копия БД).

## Копия и сохранность данных

- Свежая копия перед миграцией при остановленной записи: `/root/db-backups/summy-2026-09-30-2101.dump`, 44 632 811 байт, SHA-256 `be401a23a380b51b13c29f02a06a974c5584f715662978bf6d7799e6c81eb20b`; полное чтение `pg_restore --file=/dev/null` — exit 0; дубль в `/root/releases/rc5-20260930/snapshots/` с тем же SHA-256. Restore не выполнялся.
- Ночная копия того же дня: `summy-2026-09-30-0420.dump`. График копий БД 04:20 и медиа 04:30 МСК с хранением семь суток не менялся.
- Ревизия БД после выкладки — `0160_daily_processes`. Проверка после выкладки: базовая линия совпала, уменьшений числа строк нет, схема RC5 на месте (5 новых таблиц ежедневных процессов, 4 колонки взятия рекламации, 2 ставки филиалов).

## Проверка после выкладки

49 из 50 проверок прошли: SHA и версии всех образов и сервисов, публичный и локальный health CRM, master-app и сайта, флаги API и sync, конфигурация входа CRM, выключенные фоновые задачи, закрытые тестовые и денежные маршруты, основной филиал у каждого администратора.

Не прошла `rc5_routes_present`: проверка перечисляет `app.routes`, а в используемой версии FastAPI подключённые роутеры хранятся как `_IncludedRouter` и в этом списке не раскрываются — видно только 10 служебных маршрутов. Та же сверка шести новых маршрутов по OpenAPI работающего API (408 путей) — отсутствующих нет; `admin-shifts/today`, `duties` и `my-salary` без сессии отвечают 401, а не 404. Это дефект проверки, не выкладки; сервисы не менялись.

Тесты, ревью, lint/typecheck, проверочные сборки и репетиция при выкладке не запускались; экраны в браузере и вход пользователей не проверялись.

## Журналы на production

- `/root/releases/rc5-20260930/deployment-events.jsonl` — события фаз;
- `/root/releases/rc5-20260930/logs/` — журналы шагов (0600), `postdeploy-check.out`;
- `/root/releases/rc5-20260930/logs-phase-{backend,access,master,crm,website}.out`;
- `fresh-db-backup.json`, `db-before.json`, `access-without-primary.json`, `stage-manifest.json`, `release-options.json`.

## Откат

- Прежние каталоги с compose, `.env` и `VERSION` RC2 лежат в `/root/releases/rc5-20260930/stage/{backend,crm,master}` и `/var/www/.summy-rc5-swap-20260930`; прежние образы RC2 не удалялись.
- `rc5-deploy.py rollback-website`, `rollback-crm`, `rollback-master` возвращают прежний каталог и ждут health RC2.
- Схема: основные филиалы назначены, поэтому `rollback-backend` откажет, а `downgrade 0160` не выполнится, пока есть назначения. Откат схемы или restore после появления новых записей — только отдельным решением о данных; автоматически он не выполняется.
