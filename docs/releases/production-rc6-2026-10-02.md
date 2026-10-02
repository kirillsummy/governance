# Production RC6: весь код, работающий на общем TEST (02.10.2026)

Статус: **развёрнуто на production 02.10.2026, 02:57–03:00 МСК.** Утверждение —
прямое поручение владельца 02.10.2026 в рабочем чате Claude: production-релиз
всего кода пяти продуктов, фактически работающего на TEST, с внеплановым
окном; повторное утверждение номера кандидата или дня недели не требуется
([релиз-процесс](../../CHARTER.md#релиз-процесс-стандарт)). Кандидат
зафиксирован по работающим артефактам TEST в начале работы, а не по голове
`test`. Прежнее состояние production — [RC5.1](production-crm-processes-fix-2026-10-01.md)
поверх [RC5 редакции 2](production-rc5-deployment-2026-09-30.md).

## Кандидат: точные SHA

Снимок TEST 02.10.2026 02:09 МСК: `VERSION` каждого продукта, метка
`org.opencontainers.image.revision` образов работающих контейнеров
(`summy-stand-api-1`, `summy-stand-sync-1`, `adminapp`, `bff-bff-1`,
`summy-client-test-client-app-1`), `VERSION` каталога сайта под pm2; ревизия
БД TEST `0166_optional_manicure_closure`, последний TEST-выпуск
`q160-20261001`, замок свободен. Головы `origin/test` совпадали с этими SHA
(впереди 0 коммитов).

| Продукт | Production до (RC5.1) | RC6 (развёрнуто) | Коммитов | Production-ветка после | Тег |
|---|---|---|---|---|---|
| backend (API и sync) | `10e0dd53355605a2d9ae7daa1f3ba45ee1c4fb95`, БД `0160_daily_processes` | `8190e4b2902a013eaa5914d2005461247e80f473`, БД `0166_optional_manicure_closure` | 32 | `dev` = `8190e4b` | `v0.3.0` |
| CRM | `3f7795fe8187f1f25e0bd7188adb7f1ef494be61` | `6f9c316a034f09dcac58d8412629bff497d000b8` | 18 | `main` = `7b8d4bfa045ee47898b8cc8d45480ac4d7d7493e` (см. ниже) | `v0.179.0` → `6f9c316` |
| master-app | `dee599f81da12aaef7832c26f4c840803d3de816` | `fb76db82f760befdbb16472054a2bab917169c1c` | 88 | `feature/react-client` = `fb76db8` | `v0.81.0` |
| website | `a086b8386fa886960c795ed30e924a76db6473fb` | `ef6c6b013a2935c33b9e145c0f11b16db81a1d47` | 2 | `main` = `ef6c6b0` | `v2.32.0` |
| client-app | `175633f…` только поставлен; `main` = `4a3a245c221291d2d587fbe925061b9149f2ee50` | `c36f92c93583c21b1ec615fdf4a1f88de3354fdf` — **поставлен неактивно** | 41 от `175633f` | `main` = `c36f92c` | `v0.1.0` |

Все production-ветки продвинуты без force: backend, master-app, website и
client-app — fast-forward на развёрнутый SHA. CRM `main` (`3f7795f`, хотфикс
RC5.1) не был предком `6f9c316`, поэтому создан merge-коммит `7b8d4bf` с
родителями `3f7795f` и `6f9c316` и деревом, **побайтово равным `6f9c316`**
(tree `75d7bd59…`); исправление RC5.1 (`processes-screen.tsx`, blob
`833ab64…`) уже входило в `6f9c316` через `c17e8f6`. Тег `v0.179.0` стоит на
самом развёрнутом `6f9c316`. Ветки и метки сверены `ls-remote`.

Состав по задачам: SUM-111 P6 (обжалование штрафа), SUM-115, SUM-120
(отзыв с фото, премия за инвентаризацию), SUM-121 (ступени медкнижки
30/14/7/1/0), SUM-123, SUM-125 (оклад и премии дня в ведомости), SUM-157,
SUM-158 (касса бухгалтера), SUM-160, SUM-161, SUM-178–SUM-182, SUM-185,
SUM-186–SUM-189, SUM-191 (короткое закрытие маникюра), баг-репорты во всех
приложениях (отправка — заглушка), полные контакты клиента у управляющей и
владельца (SUM-96 п. 25). Полный перечень — `git log <до>..<RC6>` в каждом
репозитории и [текущее состояние](../current-state.md).

## Миграции 0160 → 0166

Шесть аддитивных ревизий, каждая с охраняющим `downgrade`:
`0161_review_photo` (вид процесса), `0162_penalty_appeals` (таблица
`staff_penalty_appeals`, вид процесса, витрина штрафов с `appeal_hold`),
`0163_inventory_cash_totals` (вид процесса, три необязательных поля отчёта),
`0164_client_preferences` (таблица), `0165_rebooking_bonus` (расширение
`CHECK` видов начислений), `0166_optional_manicure_closure` (ослабление
`CHECK` закрытия маникюра). Данные не переписываются.

## Проверки до переключения

Тесты — по [порядку 01.10.2026](../../CHARTER.md#разработка-и-доставка-на-test):
только при подготовке production, до выкладки. Критерий допуска, как в
RC5.1: **нет новых дефектов работающего кода относительно production-базы**.
Каждый отказ, которого нет у базы, разобран поштучно. Прогоны — LF-checkout
точных SHA кандидата и базы в изолированных worktree, общие `node_modules`
(lockfile совпадает), backend — PostgreSQL 18 (WSL), отдельные БД.

| Проверка | Кандидат RC6 | База production | Вывод |
|---|---|---|---|
| backend `pytest -n 4`, TZ=Europe/Moscow | 2272 прошли, 16 упали из 2288 | 2277 / 10 из 2287 | 10 общих (контрактные снимки, цвета видов процессов, смены администратора); 6 новых — ниже |
| backend денежные `test_payroll*`, `test_earnings*`, TZ=UTC | 257 / 0 | 257 / 0 | чисто (первый прогон кандидата сорван пересечением с моим изолированным прогоном на том же шаблоне БД, повтор — 257/257) |
| CRM `vitest` | 1683 / 14 из 1697 (8 файлов) | 1691 / 6 (3 файла) | 6 общих (`sidebar` 2, `sections` 1, `processes/provider` 3 — как в RC5.1); 8 новых — ниже |
| CRM `tsc --noEmit` | exit 0 | exit 0 | чисто |
| CRM `eslint` | 9 ошибок, 6 предупреждений | 5 / 6 | +4 того же правила React `set-state-in-effect`, что и 5 уже работающих на production (`client-preferences`, `notification-bell`, `penalty-appeals`, `purchasing-screen`); поведение не меняют |
| CRM `knip`; типы клиентского API | exit 0; exit 0 | exit 0; exit 0 | чисто |
| CRM типы шлюза `--check` | расхождение | совпадают | закреплённый снимок OpenAPI в CRM ещё с ступенью 60, а типы (30/14/7/1/0) уже соответствуют backend RC6; на работу не влияет |
| master-app `vitest` | 305 / 7 из 312 | 294 / 12 из 306 | 7 новых — ниже; 12 отказов базы в кандидате исправлены |
| master-app `tsc`, палитра, `knip` | exit 0 | exit 0 | чисто |
| master-app bff `node --test` | 48 / 1 | 48 / 1 | тот же отказ сверки путей с контрактом |
| client-app `vitest` + `node --test server` | 8/8 + 26/26 | 8/8 + 26/26 | чисто; `tsc` exit 0 |
| client-app `prettier --check` | 2 файла | 1 файл | новый — стиль `src/BugReport.tsx` |
| website `eslint`, палитра, `check-pages` | exit 0 | exit 0 | чисто; `knip` у обоих — те же 3 неиспользуемых скрипта |
| production-сборки (Docker на TEST, параметры production) | все 5 exit 0 | — | `next build` CRM и сайта, `tsc && vite build` master-app и client-app; `alembic heads` = `0166` |

Повторный прогон vitest CRM и master-app выполнен отдельно, без параллельной
нагрузки backend-тестов: в первом 15 файлов не стартовали по таймауту
воркера, его результат не использован.

**Новые отказы кандидата — разбор.** Все — устаревшие ожидания тестов под
изменения, утверждённые и уже работающие на TEST; продуктовый код верен.

- backend `test_medknizhka::test_stupen_napominaniya_na_granitsah`, CRM
  `staff-registry` ×2 — ждут ступень 60; SUM-121 сменил ступени на
  30/14/7/1/0.
- backend `test_master_appointments::test_detail_returns_only_confirmed_master_facts`
  и `test_master_schedule::test_day_composes_schedule_and_lightweight_appointment_cards`
  — точное сравнение ответа без нового поля `services_editable` (SUM-188).
- backend `test_admin_payroll::test_admin_payroll_counts_hours_and_same_day_bonuses`
  — ждёт `review_photo: source_unavailable`; с SUM-120 (0161) отзыв с фото
  засчитывается (`counted`).
- backend `test_master_appointment_close::test_closure_form_follows_catalog_category_and_keeps_old_closures`
  — дефект теста: SUM-191 добавил второй вызов `_assign_category("Маникюр")`
  в той же организации, уникальный индекс категорий отказывает; проверки
  продукта до этой строки (короткое закрытие, 201) прошли.
- backend `test_platform_id_concurrency` — `lock timeout` под нагрузкой,
  изолированно проходит; Platform ID на production выключен.
- CRM `loyalty/members` — ждёт маску телефона у управляющей; полный телефон —
  решение SUM-96 п. 25 (`e4d33d0`). `penalty-tabs` — ждёт две вкладки,
  SUM-111 добавил «Обжалования». `shift-report-timesheet` ×2 — прежние тексты
  до SUM-125. `staff-screens` ×2 — прежний заголовок до SUM-160 (записано в
  CRM `docs/DEBT.md` п. 2).
- master-app `Orders.test.tsx` ×6 — старая форма повторной записи до SUM-188;
  экран заказов в production-сборке выключен (`VITE_ORDERS_TEST_ENABLED=false`,
  backend `/v1/orders` — 503). `shiftRequests.test.tsx` — категория «Ошибка
  приложения» перенесена в отдельную форму баг-репорта.

Исправление этих тестов — тест-долг, не часть выпуска: работающий код RC6
равен TEST, правка тестов меняла бы SHA кандидата без изменения поведения.

### Репетиция 0160 → 0166 на копии production

На самом production-сервере, данные не покидали его: одноразовый
`postgres:18-alpine` во внутренней Docker-сети без выхода наружу и без
портов, восстановление ночного дампа `summy-2026-10-01-0420.dump`
(44 786 554 байта, `pg_restore` exit 0, 0 ошибок), окружение API production
с подменой только параметров БД; контейнеры, сеть и каталог удалены.

- 6 ревизий по одной, 5,9–7,2 с каждая; 203 → 205 таблиц, потерь строк нет,
  изменились только `process_types` 15 → 18 и две новые пустые таблицы;
- API RC6 на 0166: ready, 20 проверок ручек (health с SHA `8190e4b`,
  разделы, виды процессов, филиалы, реестр синка — 200; заказы, клиентский
  портал, заказы мастера — 503; тестовый вход, Platform ID — 404; новые
  ручки без сессии — 401), все 6 новых маршрутов в OpenAPI, ошибок в журнале 0;
- **API RC5 на 0166** отвечает теми же кодами, что на 0160 — откат кода
  backend без отката схемы проверен;
- `downgrade` до 0160 проходит; отличие схемы — только документированный
  остаток 0162 (`appeal_hold` = `false` и комментарий витрины); повторный
  `upgrade` даёт схему, побайтово равную 0166.

Первый прогон отметил отличие `downgrade` как провал по слишком строгому
критерию; критерий уточнён (только остаток 0162), повторный прогон — 7/7 ворот.

## Артефакты

Собраны на TEST вне стенда в `/opt/summy-rc6-build-20261002` скриптом
`rc6-build.sh` (по образцу `rc5-build.sh`) из LF-архивов `git archive`
(`core.autocrlf=false`), blob-хеши сверены с Git; `.env` и дампы в архивы не
попадают. Перенос TEST → этот ПК → production — 5 мин 21 с; `sha256sum -c`
на production — все архивы образов и исходников OK.

| Артефакт | Архив, байт | SHA-256 архива | Образ |
|---|---|---|---|
| backend | 110 035 755 | `cc1af647618d7759ef613ca1ffe83665a0bf768b2f67fc48c234c515142b802f` | `summy-backend:rc6-8190e4b2902a`, `sha256:e60f5ecb3b63…` |
| CRM | 75 333 146 | `6ae472a9c66d8c6ea22493f938aad520bd277a80ae4b97374ee51f8c08f92c87` | `summy-crm:rc6-6f9c316a034f`, `sha256:f384782bf397…`; `NEXT_PUBLIC_DEMO_DATA=off`, `NEXT_PUBLIC_MASTER_APP_URL=https://master.summy.ru` |
| master-app | 63 700 186 | `7376d21b951efa8186637751b284e9318b3eb259e80072279ab8ab2a2c7efcb4` | `summy-master:rc6-fb76db82f760`, `sha256:3f9a32c588d5…`; заказы и Platform ID выключены |
| client-app | 62 089 257 | `d066961f665c08236239956ead18935d3dbabc522a4d7f6c036ee802bea88c13` | `summy-client:rc6-c36f92c93583`, `sha256:53c0cfb935c3…` |
| website | 151 124 598 | `9d74cb1ceea40a849ed94b8e4b12d3d13769f99430fb2b1a05b51cda1ce1d925` | `BUILD_ID` `Wq7HHOeWjLULtOT4y0Gai`, `NEXT_PUBLIC_CLIENT_BOOKING_ENABLED=false` |

Исходники: backend `f558122d…`, CRM `5756fcbc…`, master-app `94823029…`,
website `2b38378c…`, client-app `47ffb4ba…` (полные значения —
`/root/releases/rc6-20261002/SOURCES.sha256`).

## Выкладка

Каталог `/root/releases/rc6-20261002` (0700), скрипт `rc6.py`
(SHA-256 `a21e9e8e…`) — фазы RC5/RC5.1 в одном файле: та же блокировка
`/var/lock/summy-production-release.lock`, атомарный обмен каталогов
`renameat2`, `up -d --no-build --no-deps`, ожидание health с точной версией,
возврат при неудаче. `stage` сверяет, что compose отличается от действующего
только образом (у master-app ещё `APP_VERSION`), а `.env` скопирован
побайтово. Перед выкладкой место освобождено только очисткой неиспользуемого
кэша сборки Docker (9,36 ГБ; образы и откатные артефакты не тронуты): 4,6 →
13 ГБ свободно, после выкладки — 9,7 ГБ.

| Шаг | Время (МСК) | Результат |
|---|---|---|
| сверка: production = RC5.1, замок свободен, других выпусков нет | 02:09 и 02:56 | совпало |
| `rc6.py stage` | 02:29:41–02:30:26 | exit 0 |
| `rc6.py rehearsal`: прогон 1 / повтор | 02:30:49–02:35:23 / 02:36:19–02:40:58 | 6 из 7 ворот (строгий критерий downgrade) / exit 0, 7/7 |
| копия compose, `.env`, `VERSION`, nginx, pm2 в `rollback-config/` (0600) | 02:57 | 17 файлов |
| `rc6.py backend`: остановка API и sync | 02:57:28 | exit 0 |
| свежая копия БД и полное чтение `pg_restore` | 02:57:40–02:58:16 | exit 0 |
| `0160 → 0166` по одной ревизии на действующей БД | 02:58:17–02:59:36 | каждая exit 0 |
| сверка данных, запуск API и sync, `ready`, health `8190e4b` | 02:59:36–02:59:55 | exit 0 |
| `rc6.py master` | 03:00:09–03:00:23 | exit 0, health `RC6+fb76db8…` |
| `rc6.py crm` | 03:00:23–03:00:29 | exit 0, health `sha=6f9c316…` |
| `rc6.py website` | 03:00:29–03:00:35 | exit 0, health `RC6+ef6c6b0…` |
| `rc6.py client` | 03:00:35 | exit 0, образ загружен, файлы неактивны |
| `rc6-postdeploy-check.py --after db-before.json --crm-auth gateway` | 03:01 | exit 0, **50 из 50** |

API и sync не работали 02:57:28–02:59:40 (≈2 мин 12 с).

## После выкладки

- Контейнеры: API `df24a484da98` и sync `5d0fce786c28` — образ `e60f5ecb…`,
  RestartCount 0; `adminapp` `fc00194f5fd4` — `f384782b…`, healthy; `bff-bff-1`
  `152723bcb07f` — `3f9a32c5…`; сайт pm2 `summy` online в `/var/www/summy`.
- Проверка 50/50 (только чтение): SHA и версии всех образов и сервисов,
  публичный и локальный health CRM, master-app и сайта, флаги API и sync,
  вход CRM `gateway`, токены BFF, закрытые тестовые и денежные маршруты,
  реестр синка, ревизия `0166` без уменьшения строк (203 → 205 таблиц,
  `process_types` 15 → 18), схема RC6 (2 таблицы, 3 вида процессов,
  ограничение начислений), 15 маршрутов RC5+RC6 в OpenAPI (521 операция),
  основной филиал у всех 5 администраторов. Дефект проверки RC5
  (`app.routes`) исправлен: маршруты читаются из `app.openapi()`.
- Журналы за 10 минут после переключения: API, sync, CRM, master-app — 0
  ошибок; синк отработал `today` по обеим компаниям и `master_shifts` с exit 0.
- Экраны в браузере и вход пользователей не проверялись; реальные платежи,
  SMS, выплаты и записи в YClients не выполнялись.

## Настройки и флаги

Env и compose production перенесены без изменений, кроме образа и
`APP_VERSION` master-app; секреты, учётные данные и тестовые входы TEST не
переносились, TEST-БД не трогалась. Остались выключены:
`TEST_DEVELOPER_ENABLED`, `ORDERS_TEST_ENABLED`, `MASTER_BOOKING_ENABLED`,
`CLIENT_PORTAL_ENABLED`, `PLATFORM_ID_ENABLED`, `CASH_PAYOUTS_ENABLED`,
`PHOTO_PROOF_V2_ENABLED`, `YCLIENTS_PAID_AUTO_CLOSE_ENABLED`,
`LOYALTY_CARDS_SYNC_ENABLED`, `RECRUITMENT_NOTIFICATIONS_ENABLED`;
`CRM_SESSION_REQUIRED` и `PROCESS_SESSION_REQUIRED` — `true`, вход CRM
`gateway`. Новых денежных или внешних действий выпуск не включает:

- бонус за перезапись (SUM-188, `0165`) начисляется только циклом
  клиентского портала/записи мастера — на production он не запущен;
- приход клиента и добавление услуги мастером пишут только в SUMMY;
  добавление услуги отказывает записям из YClients; запись в YClients не
  добавлена;
- баг-репорт CRM, сайта и client-app — честная заглушка без отправки;
  master-app отправляет в YouTrack только при `YOUTRACK_TOKEN`, на production
  его нет — форма сообщает о недоступности. Подключение — отдельное решение о
  секрете;
- полный телефон и email клиента у управляющей и владельца — решение SUM-96
  п. 25, двери прежние.

## client-app

По [контракту RC5](production-rc5-edition2-2026-09-30.md#граница-client-app):
поставка кода — безусловно, включение входа — только при runtime-конфигурации
на production. Проверено наличие ключей без вывода значений: `.env`
client-app в `/opt/summy-client` нет, `CLIENT_PORTAL_SECRET` и настроек
SMS-провайдера в `.env` backend нет. Создание секретов — отдельное решение
владельца, поэтому: образ `summy-client:rc6-c36f92c93583` загружен со сверкой,
`docker-compose.prod.yml.inactive` переключён на него (прежние файлы — в
`client-prev/`), `VERSION` — `RC6+c36f92c… staged-only; client sign-in not
enabled`. Контейнера и `location /client/` нет, `CLIENT_PORTAL_ENABLED=false`.
**Клиентский вход на `https://summy.ru/client/` не включён.** `main` и тег
`v0.1.0` фиксируют поставленный код, а не работающий сервис.

## Копия и откат

- Свежая копия перед миграцией при остановленной записи:
  `/root/db-backups/summy-2026-10-02-0257.dump`, 45 104 085 байт, SHA-256
  `dc0febc8e5eeb8a1afb161d4b4d2b2182935e145b48753b6ecd45eb6ba318fbf`, полное
  чтение `pg_restore --file=/dev/null` — exit 0; дубль с тем же SHA-256 в
  `/root/releases/rc6-20261002/snapshots/`. Ночная копия того же снимка
  схемы — `summy-2026-10-01-0420.dump`. Restore не выполнялся.
- Конфигурации до выкладки — `/root/releases/rc6-20261002/rollback-config/`
  (0700/0600); прежние каталоги — `stage/{backend,crm,master}` и
  `/var/www/.summy-rc6-swap-20261002`; прежние образы RC5/RC5.1 на сервере,
  не удалять до приёмки.
- `rc6.py rollback-website`, `rollback-crm`, `rollback-master` возвращают
  прежний каталог и ждут health RC5/RC5.1.
- `rc6.py rollback-backend` возвращает код backend RC5 **без отката схемы**:
  0161–0166 аддитивны, RC5 на 0166 проверен репетицией, данные новых таблиц
  сохраняются. `downgrade` и restore — только отдельным решением о данных;
  ревизии отказывают в `downgrade`, если в их таблицах есть строки.
- client-app: вернуть файлы из `client-prev/`; контейнер не запускался.
- Откат не применялся.

## Журналы на production

`/root/releases/rc6-20261002/deployment-events.jsonl`, `logs/` (0600),
`logs-phase-*.out`, `logs/postdeploy-check.out`, `rehearsal-report.json`
(и `rehearsal-report-run1.json`), `fresh-db-backup.json`, `db-before.json`.
