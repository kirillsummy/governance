# Инфраструктура и окружения

## Среды

| Среда | Где | БД | Обновление |
|---|---|---|---|
| **Dev** | `summy-test`, `201.51.9.79`, nginx + Docker Compose | PostgreSQL на сервере, `127.0.0.1:5434`, база `summy_data` | Релизные скрипты `/opt/summy-test/releases/<имя>/` под общим замком; [доставка](#доставка-ветки-test-на-dev) |
| **Prod** | `81.200.146.182` (Timeweb, Wise Cepheus) | Отдельная управляемая PostgreSQL Timeweb с TLS | Релизный скрипт выпуска под замком; [релиз](../CHARTER.md#релиз-prod) |

Dev — прежнее название TEST. Это смена термина, а не переименование: на
сервере остаются `/opt/summy-test`, compose-проекты `summy-stand`, env и
имена контейнеров; в датированных записях ниже и в истории сохраняется слово
TEST. Доступы, ключи и роли сред разные и между средами не переносятся. Над
средой одновременно идёт одна операция переключения; сборки и разработка —
параллельно.

## SUM-104: проверка перед тестовым входом (26.09.2026)

Обновление после релиза: 26.09 backend и три приложения развернуты на общем TEST с отдельными PostgreSQL/MinIO и локальным SMS sink; внешний SigmaSMS и CRM YClients credentials удалены из TEST-конфигурации. Ревизия БД — 0143. Точные SHA и границы проверки указаны в [текущем состоянии](history/current-state-log-2026-10-02.md#sum-104--общий-test-26092026). Следующий deploy должен повторно проверить эти ограничения до включения входа.

При read-only проверке контейнера API общего TEST подтверждены отдельные PostgreSQL и MinIO, stand facade YClients, отсутствие SMTP/Telegram и платёжного merchant. Текущий API использует внешний SigmaSMS и не требует CRM-сессию глобальным флагом (проверка process-сессии включена). Поэтому тестовый вход разработчика нельзя включать по одной только доставке кода: сначала перевести API на локальный SMS sink, проверить клиентский OTP и строгие проверки сессии CRM/process. Секреты не просматривались и в Governance не записываются. Инструкция включения и отката — [контракт SUM-104](../contracts/test-developer-access.md) и продуктовый `backend/docs/TEST-DEVELOPER.md`; факт исправления конфигурации фиксировать отдельно при релизе.

Исходная опись взята из compose/ранбуков и GitHub на 19.09.2026. Позднейшие
подтверждённые действия на TEST записаны в [текущем состоянии](current-state.md).
В этой редакции 26.09.2026 серверы повторно не опрашивались, секреты не
читались и deployment не выполнялся. Git SHA, серверный VERSION, ревизия БД
и принятый сценарий — четыре разных доказательства.

Дополнение 24.09: в актуальном коде стенда YClients credentials предназначены
только отдельному `sync` в режиме read-only; API не получает их и остаётся под
`STAND_AUTH_PASSWORD`. Старый `backend/docs/STAND-SERVER.md` утверждает, что
синка и ключей на TEST нет, — это описание от 15.09, расходящееся с новым
compose/`STAND.md`. Более поздняя локальная памятка 25.09 сообщает, что sync
на TEST работает, а CRM использует gateway-auth, не прежний mock-вход.
Действующие значения ключей и разрешённые компании здесь не публикуются;
фактические SHA и ревизии на момент релиза — в [текущем состоянии](current-state.md),
открытые проверки — в [вопросах Юре](https://summy.youtrack.cloud/issue/SUM-97).

| Среда | Что подтверждено источником | Что не подтверждено сейчас |
|---|---|---|
| Prod | Домены summy.ru/admin.summy.ru/master.summy.ru; внутренний backend, runbooks Docker/nginx, сайт имеет deploy/server | Точные текущие SHA, состав контейнеров, пользовательские сценарии |
| Dev | `summy-test`, IP 201.51.9.79, nginx + Docker Compose; релиз 25.09 и применение 0141 отражены в [состоянии](current-state.md) | Текущие VERSION, compose overrides и ревизия БД 26.09 повторно не сверялись; последняя голова Git `test` могла не быть доставлена |
| Локальный stand | docker-compose.stand.yml, PostgreSQL/MinIO/API, loopback; API под STAND_AUTH_PASSWORD без YClients credentials, отдельный sync может работать read-only по новой конфигурации | Не является sandbox для записывающих YClients вызовов; фактический стенд не проверен |
| Локальный orders test | Дополнительный docker-compose.orders-test.yml, отдельная БД, синтетические данные | Docker overlay описан, его сборка в предыдущем хендоффе не проверялась |
| Локальное клиентское demo | CLIENT_DEMO=true только loopback, данные в памяти Node | Не отправляет SMS, не создаёт реальные CRM-записи и платежи |

## Prod

### Доступ и резервные копии Prod (проверено 28.09.2026)

- Сервер приложений Timeweb Cloud: **Wise Cepheus**, ID `8554217`, IP
  `81.200.146.182`. Это не сервер PostgreSQL: production-БД управляется
  Timeweb отдельно. Панель сервера:
  `https://timeweb.cloud/my/servers/8554217`.
- Доступ к серверу подтверждён по SSH как `root` с персональным разрешённым
  ключом. Для этого сервера ED25519 host key был независимо сверен через
  консоль Timeweb; отпечаток на 28.09:
  `SHA256:8EsBQwlmNXiA/hm/etMFP3hwRVvXMGTj7vamsNRucFI`.
  Перед новым подключением проверяй его заново через доверенный канал и
  используй `StrictHostKeyChecking=yes`, свой `known_hosts`,
  `IdentitiesOnly=yes` и `BatchMode=yes`. Не отключай проверку host key и не
  помещай приватный ключ, пароль или `.env` в Governance. Рабочий шаблон:
  `ssh -i <личный-разрешённый-ключ> -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=<проверенный-known_hosts> root@81.200.146.182`.
  Наличие доступа к серверу не доказывает отдельные права к managed PostgreSQL.
- На сервере ежедневный cron запускает дамп БД в **04:20 МСК** через
  `/usr/local/bin/summy-db-backup.sh` и медиаархив в **04:30 МСК** через
  `/usr/local/bin/summy-media-backup.sh`. Локальные каталоги:
  `/root/db-backups` и `/opt/summy-backups/media`. С 28.09 оба скрипта
  удаляют локальные архивы старше семи суток до создания новой копии и после
  него. Медиаскрипт отдельно сохраняет прежние 14 суток для удалённого S3;
  локальное правило не задаёт срок для Timeweb snapshots или других S3-копий.
- 28.09 были удалены локальные архивы старше семи суток и три подтверждённо
  неполных файла. Вне расписания создан дамп БД на 43 МБ: `pg_restore` прочитал
  содержимое без восстановления, копирование в S3 завершилось успешно.
  Медиаархив на 1,47 ГБ прошёл `gzip -t`, содержал 1650 объектов; отпечаток
  удалённой S3-копии совпал. После этих действий `df -h /` показывал 8,9 ГБ
  свободно на диске 48 ГБ. Это датированный замер, не гарантия места для
  следующей сборки. До сборки снова проверить `df`, Docker/containerd и
  пиковую потребность; не запускать слепую очистку образов, включая откатные.
- Для сверки режима и результатов без чтения секретов: `cat /etc/cron.d/summy-db-backup
  /etc/cron.d/summy-backup`, `df -h /`, список имён/размеров архивов в указанных
  каталогах и журналы `/var/log/summy-db-backup.log`,
  `/opt/summy-backups/media/backup.log`. Наличие файла недостаточно:
  проверить полный `pg_restore` в `/dev/null` для дампа, `gzip -t` и число
  объектов для медиа, а также подтверждение второй копии. Проверки дампа не
  означают выполненный restore.

Порядок подготовки и выпуска RC1 без передачи секретов записан в
[промте выкладки](releases/production-rc1-deploy-prompt-2026-09-28.md).
Фактические production-версии после переключения 28.09, миграция 0116→0143,
сохранённые каталоги и пределы отката записаны в
[отчёте выкладки RC2](releases/production-rc2-deployment-2026-09-28.md).
Действующий production-состав R1010 с 10.10.2026 16:03 МСК, свежая копия БД,
exact images и пределы восстановления — в [документе выпуска](releases/production-r1010-2026-10-10.md).
Прежний состав — [PRODSMS](releases/production-prodsms-2026-10-10.md), ранее [R1009](releases/production-r1009-2026-10-09.md), ранее
[R1007](releases/production-r1007-2026-10-07.md) / [S194](releases/production-s194-2026-10-05.md).
Сайт GRADE2 прежний; [текущее состояние](current-state.md). Рабочие private overlays
выпуска выбирают immutable images; original compose/env неизменны, live VERSION
обновлён, предыдущие VERSION bytes сохранены приватно. Старый compose
сам по себе не выбирает новые образы. Ниже — историческая исходная конфигурация.

Действующий release root — `/root/releases/r1010-20261010` (overlay в `private/` — копии
PRODSMS с новыми образами); прежний — `/root/releases/prodsms-codex-20261010e2`, immutable cfg ID —
`prodsms-codex-20261010e`. Master BFF: project directory `/home/kirill/master-bff/bff`,
original compose `/home/kirill/master-bff/bff/docker-compose.bff.yml`, env
`/home/kirill/master-bff/bff/.env`, project `bff`; live overlay —
`/root/releases/prodsms-codex-20261010e2/private/master.overlay.json`.
Live master VERSION `/home/kirill/master-bff/VERSION` не задаёт compose project directory.

- Backend: контейнер api и отдельный sync; api опубликован на loopback хоста, внутренняя сеть summy-internal и DNS gateway. PostgreSQL и S3 настраиваются через env. Runbook описывает управляемый PostgreSQL Timeweb и S3; compose всё ещё содержит MinIO. Это нельзя превращать в утверждение о фактическом составе контейнеров без runtime-инвентаризации. [backend/docker-compose.prod.yml](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docker-compose.prod.yml), [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md).
- Мастер: собранный web/dist обслуживает Node BFF; reverse proxy → BFF → gateway. Версия из APP_VERSION или VERSION_FILE; health отдельно проверяет наличие оболочки. [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md).
- CRM: Next.js сервер, Docker и reverse proxy; health сообщает версию/SHA/auth mode. Сайт: Next.js; его runbook и стендовая памятка описывают запуск через pm2. Полное совпадение инфраструктуры с runbook не проверено.
- Релизные метки/файл VERSION — часть выпуска; health с версией не проверяет правильность всех ответов БД. Release-процедура остаётся в [CHARTER](../CHARTER.md) и продуктовых DEPLOY.md. DOC не выдаёт разрешение выполнять команды.

## Dev — общий тестовый сервер

Ранбук [backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) в отдельной ветке #79 описывает Ubuntu 24.04,
Timeweb, nginx с защитой входа; наружу сайт на 443, CRM на 8443, мастер на 9443.
Внутри: backend loopback 8091, CRM 3010, master BFF 8082, website 3000;
backend с PostgreSQL/MinIO в compose, website под pm2. Docker-сеть — summy-internal.
Это описание установки от 15.09, не live-инвентаризация.
С 30.09.2026 общий HTTP Basic Auth nginx перед 443, 8443 и 9443 отключён по
поручению владельца ([SUM-152](https://summy.youtrack.cloud/issue/SUM-152)):
вход на TEST защищает только собственная авторизация приложений; `noindex` и
TLS сохранены. Конфигурация, откат и граница проверки — в
[текущем состоянии](history/current-state-log-2026-10-02.md#sum-152--общий-http-basic-auth-test-отключён-30092026).

Термин «тестовый pod» не подтверждает Kubernetes: в источниках найден сервер/compose,
а Kubernetes namespace/pod/ingress для SUMMY не обнаружен в просмотренных файлах.
Не выдумывать отдельный pod URL. Адреса известных стендов — [resources](resources.md).

### Подключение к Dev и БД

TEST — отдельный сервер `201.51.9.79`. PostgreSQL привязана на нём к
`127.0.0.1:5434`; наружу порт БД не публикуется. На рабочем ПК Юры локальная
памятка `TEST-ACCESS.md` и игнорируемый Git помощник `.ssh/test-db.ps1`
предоставляют `Shell`, `Status`, `Psql` и `Tunnel`; `Tunnel` открывает только
локальный `127.0.0.1:15434`. `Status` перечисляет четыре продукта и **не**
подтверждает версию client-app или ревизию БД. У других участников могут быть
свои ключи и пути: локальный помощник не является частью публичного governance.

Универсальный способ — сначала независимо подтвердить SSH host key TEST,
затем установить туннель своим разрешённым ключом и подключить PostgreSQL-
клиент к `127.0.0.1:15434`, базе `summy_data`, с персональной ролью и вводом
пароля в своём терминале. Не отключать проверку host key и не переносить
приватный ключ/пароль в чат, Git, командную строку с журналированием или
клиентский bundle. Согласно локальной памятке, назначенная Юре роль TEST
может изменять строки, но не схему; права каждой другой роли и актуальные ACL
проверять отдельно, миграции согласовывать отдельно.
Дамп TEST содержит реальные клиентские данные и не является публичным fixture.

Обновление 29.09.2026 ([SUM-138](https://summy.youtrack.cloud/issue/SUM-138)):
активная TEST-БД `summy_data` — снимок production от 29.09 с реальными
данными, прежняя TEST-БД хранится как `summy_data_pre_prod_20260929`; TEST
работает с `PLATFORM_ID_ENABLED=false`. Подробности —
[состояние](history/current-state-log-2026-10-02.md#sum-138--общий-test-на-снимке-production-бд-29092026).

Production-приложения находятся на `81.200.146.182`, но их PostgreSQL —
отдельная управляемая БД Timeweb с TLS. SSH на сервер приложений и вход в
PostgreSQL — разные права и реквизиты. Точный endpoint, роль, сертификаты и
значения `POSTGRES_*` сверяются только в панели владельца либо защищённой
серверной конфигурации; пример `.env` не является боевым адресом. См. также
[модель БД](database.md) и [backend DEPLOY](https://github.com/kirillsummy/backend/blob/test/docs/DEPLOY.md).

### Доставка ветки `test` на Dev

Простой push в `test` ничего не разворачивает. Исполнитель задачи сам
разворачивает опубликованный SHA на Dev по [уставу](../CHARTER.md#доставка-на-dev),
без тестов и проверки сценариев; если оператор отключил выкладку на Dev,
изменение только публикуется, и сервер обновлённым не объявляют.

**Граница автоматизации (A11, [SUM-97](https://summy.youtrack.cloud/issue/SUM-97)
вопрос 6, решение делегировано Claude 01.10.2026).** Сверено 01.10: ни один
CI продуктов (`backend`, `crm`, `master-app`, `client-app`, `website` —
`.github/workflows`) не разворачивает код и не имеет доступа к серверу; CI
только проверяет. Действующая автоматизация TEST — релизный скрипт сессии
`/opt/summy-test/releases/<имя>/release.py`: точные SHA в `manifest.json`,
архивы с sha256 и blob-хешами, сборка с меткой
`org.opencontainers.image.revision`, общий замок, проверка базовых SHA и
чужих контейнеров, копия БД перед миграцией, автоматический откат по
состоянию контейнеров, `progress.log` и VERSION каждого продукта.
Запись точных SHA: `scripts/test_state.py` (только чтение, см. ниже) +
`CHANGELOG` Governance + строка сводной карточки.
Автовыкладка из GitHub Actions по push **не включена**: ей нужен новый путь
доступа к серверу (ключ развёртывания в секретах GitHub и отдельный
ограниченный пользователь), а это изменение доступа, которое решает владелец
инфраструктуры; постоянное разрешение TEST его не покрывает. Production
выпускается по [уставу](../CHARTER.md#релиз-prod). Пока такого решения нет,
утверждение «CI-деплой работает» неверно.

Снимок состояния TEST для записи факта: `SUMMY_TEST_SSH_KEY=<ключ>
SUMMY_TEST_KNOWN_HOSTS=<known_hosts> python scripts/test_state.py` — VERSION
всех продуктов, ревизия БД, образы и состояние контейнеров, последний релиз
с последней строкой `progress.log` и свободен ли замок. Скрипт ничего не
меняет, не читает env и compose, проверка host key строгая.
Это доставка на Docker Compose-сервер, не создание Kubernetes pod.

1. Зафиксировать полный SHA каждого продукта из `origin/test`, текущие
   `/opt/summy-test/<продукт>/VERSION` и работающие образы/контейнеры.
   Отдельно проверить client-app: локальный `Status` его не перечисляет.
2. Для backend сравнить голову миграций кода и `alembic_version` TEST,
   проверить совместимость старого/нового API с CRM и приложениями, наличие
   восстановимой копии БД, окно работ и план отката. Миграции не выполняются
   автоматически из факта merge и не заменяются `stamp`. После миграции —
   единственная проверка доставки: код завершения, ожидаемая ревизия
   `alembic_version`, сохранность и целостность данных (число строк ключевых
   таблиц до и после, отсутствие ошибок ограничений) и подтверждённая копия
   для восстановления. Это не smoke приложения.
3. Перед поставкой сохранить действующие compose-файлы, дополнительные
   overrides, секретный env, VERSION и предыдущий артефакт. На TEST есть
   overrides из `/opt/summy-test/overrides/` и релизных каталогов; запуск
   одного базового `docker compose up` может убрать сеть, sync или иные
   настройки. `stand/up.sh` и restore **не** использовать для обычного
   обновления: они способны пересоздать TEST-БД.
4. Поставлять согласованные SHA последовательно по продуктовому runbook;
   фронты собирать по одному из-за памяти сервера. После каждого шага сверить
   VERSION/образ, ревизию БД и состояние контейнеров (running, healthcheck
   контейнера, RestartCount); HTTP-запросы к приложениям и smoke при доставке
   на TEST не выполняются. Одна выкладка за раз: общий замок
   `/var/lock/summy-test-deploy.lock` и незавершённые шаги чужого релиза в
   `/opt/summy-test/releases/<имя>/progress.log` сверяются до начала.
   Базовые образы из Docker Hub (`python:3.14-slim` для backend,
   `node:24-alpine` для CRM, master-app BFF и client-app) держатся на TEST
   локально. Без них даже `docker build --pull=false` запрашивает метаданные
   у Docker Hub. Анонимный лимит считается по общему IPv6-префиксу хостинга;
   01.10.2026 там было 0 из 100 в час, а по IPv4 `201.51.9.79` — 100 из 100.
   С 05.10.2026 прежний `docker-prune.timer` (`docker system prune -af`)
   отключён; плановая уборка ([ниже](#плановая-уборка-dev)) базовые образы
   не трогает. При `429 Too Many Requests` на `load metadata` повторить
   `docker pull` образа под свободным замком и затем повторить шаг. Зеркала
   и `docker login` нет
   ([T2 в SUM-97](https://summy.youtrack.cloud/issue/SUM-97#focus=Comments-7-731.0-0)).
5. При сбое вернуть предыдущий код/образ и флаги по сохранённому плану.
   `alembic downgrade` не считать безопасным общим откатом после появления
   новых данных; для БД нужен заранее проверенный способ восстановления.

Синтаксис конкретной команды Compose определяется **текущими** серверными
overrides и продуктовым DEPLOY, а не историческим примером от 15.09.
SHA, результат команд и ревизия БД фиксируются в YouTrack, CHANGELOG и
[текущем состоянии](current-state.md) по [порядку работы](../ai/WORKFLOW.md#цикл-задачи).

На стенде могут быть данные из дампа, поэтому документы не включают пароль,
персональные записи и дамп. Состав/анонимизация данных и права доступа требуют
отдельной проверки перед новой приёмкой. Stand/up восстанавливает БД с очисткой;
не запускать его для обновления кода на ценной тестовой базе.


### Плановая уборка Dev

С 05.10.2026 на Dev раз в неделю работает `summy-dev-cleanup.timer`:
воскресенье 04:00 Europe/Moscow, `Persistent=true`. Он запускает
одноразовый `summy-dev-cleanup.service`:
`/opt/summy-test/maintenance/summy-dev-cleanup.py --apply`. Исходники
скрипта и юнитов — [scripts/dev-maintenance](../scripts/dev-maintenance/),
задача — [SUM-199](https://summy.youtrack.cloud/issue/SUM-199). Таймер не
разворачивает код, не запускает тесты и не шлёт внешних сообщений.
Действующая версия скрипта — v3 от 05.10.2026: правки приёмки R1–R3 и окончательная защита откатов.

С 10.10.2026 таймер срабатывает ежедневно в 04:00 Europe/Moscow и перед уборкой
образов запускает `/opt/summy-test/maintenance/summy-dev-retention.py --apply`
(слово владельца 10.10.2026: на Dev не больше двух копий БД, старые выпуски
не копить; [SUM-233](https://summy.youtrack.cloud/issue/SUM-233)). Исходники —
там же, в [scripts/dev-maintenance](../scripts/dev-maintenance/).

- **Хранение (`summy-dev-retention.py`).** Без `--apply` строит план. Держит
  общий замок (занят — код 75), работает только на `summy-test`.
  - Копии БД в `/opt/summy-test/backups` (`*.dump` и каталоги копий): остаются
    две самые свежие по времени изменения (`--keep-backups`, 2–20);
    указатели `*-LATEST` на удалённую или отсутствующую копию удаляются.
  - Каталоги выпусков: остаются по три последних выпуска на каждый маркер
    `<продукт>-active` (текущий и два отката — без них уборка образов ниже
    останавливается кодом 4), каталоги, на которые ссылаются метки
    контейнеров (working_dir, compose, env-файлы) и JSON-файлы этих
    каталогов, и всё моложе 24 ч (`--grace-hours`).
  - Каталоги сайта `/opt/summy-test/website-*`: остаются живой `website` и
    самый свежий `website-prev-*` (откат последнего выпуска сайта).
  - Квитанции — `/var/log/summy-dev-cleanup/retention-*.json` (последние 30),
    только пути и размеры.
- Первая уборка 10.10.2026: 358 удалений, 19,6 ГБ; затем
  `docker builder prune -af` (10,1 ГБ) и `summy-dev-cleanup.py --apply`
  (19 образов). Свободно 7,8 → 38 ГБ. Прежние юниты — в
  `/opt/summy-test/maintenance/replaced/`.

- **Режимы и охрана.** Без `--apply` скрипт только строит план. Он работает
  только на хосте `summy-test` и держит общий замок
  `/var/lock/summy-test-deploy.lock` всё время работы. Квитанция пишется в
  начале, после каждого удаления и в `finally`.
- **Коды выхода:**
  - 0 — план построен или уборка выполнена;
  - 2 — отказ: чужой хост или параметры вне допустимых пределов;
  - 3 — инвентаризация Docker не удалась, ничего не удалено;
  - 4 — обязательные метаданные не подтверждены, ничего не удалено;
  - 5 — часть удалений или обслуживания не удалась, квитанция частичного
    результата сохранена;
  - 6 — неожиданная ошибка после старта, выполненные шаги записаны в
    квитанции;
  - 75 — замок занят, запуск пропущен.

  Для юнита успехом считаются только 0 и 75: любой другой код делает
  `summy-dev-cleanup.service` неуспешным.
- **Обязательные метаданные (fail closed).** Перед любым удалением должны
  быть прочитаны и распознаны:
  - compose-файлы всех контейнеров разбираются установленным Docker
    Compose: `docker compose -p <проект> --project-directory <каталог>
    [--env-file <env>] -f <файлы из метки> config --images`. Проект, каталог,
    env и файлы берутся из меток контейнера. Принимается только exit 0 и
    непустой список корректных имён образов; вывод env и конфигурации не
    сохраняется. Для build-only сервиса Compose сам печатает имя
    `<проект>-<сервис>`; имя без тега означает `:latest`. Повреждённый, пустой,
    не-compose или отсутствующий файл даёт отказ Compose, и скрипт
    блокирует уборку. Compose-файлы выпусков (JSON) читаются строго: объект
    `services` с образами;
  - метаданные выпусков, выбранных для отката. Выбор идёт по времени
    маркера `<продукт>-active` и не зависит от того, удалось ли их
    разобрать. Нужны `config.json` (`tag`; для backend —
    `old_backend_image`), `manifest.json` с полным SHA продукта, compose
    выпуска (`backend-*.json`, `client-*.json`), `state.json` и
    `progress.log`;
  - текущий образ продукта и образ каждого контейнера должны быть в списке
    образов;
  - **условие допуска:** для backend, CRM, мастера и клиента должны быть
    найдены три успешных выпуска с существующими главными образами —
    текущий и два отката. Поиск идёт по всей истории маркеров
    `<продукт>-active`; старые выпуски без образов пропускаются. Если при
    истории из трёх и более выпусков таких не набралось — код 4. При
    короткой истории (меньше трёх) должны существовать образы всех её
    выпусков. Продукт без истории блокирует уборку, если на сервере есть
    образы его семейства; если их нет, это записывается в квитанцию.

  Отсутствие или непонятный формат любого из этого — код 4. Неизвестные
  JSON-файлы выпуска в объём не входят и записываются в квитанцию. Свежие
  каталоги без `manifest`/`config` прикрыты grace по возрасту образа.
- **Что защищено:**
  - образы всех контейнеров, включая остановленные, и их теги;
  - образы из compose-файлов контейнеров;
  - для backend, CRM, мастера и клиента — текущий выпуск и два отката с
    существующими образами: продуктовые и `pre-`-теги, `old_backend_image`,
    compose, ID из `state.json` и `progress.log`;
  - свежие выпуски;
  - образы моложе grace (48 ч);
  - образы вне релизных семейств: базовые `python`/`node`, `postgres`,
    `minio`, `redis`, operator, образы кандидатов Prod `summy-*:rcN`.
- **Что удаляется:**
  - образы релизных семейств `summy-*-backend`, `summy-*-api`,
    `summy-stand-api`, `summy-*-client`, `summy-client`, `adminapp`,
    `bff-bff`, `summy-*-ci` и висячие образы. Удаляются через
    `docker rmi` без force, после повторной проверки контейнеров и тегов;
  - неиспользуемый кэш сборки старше 72 ч;
  - кэш пакетов apt.
- **Чего скрипт не трогает никогда:** тома, сети, контейнеры, каталоги
  выпусков, резервные копии, env, ключи, данные БД и MinIO, а также общий
  журнал systemd. Ротация касается только собственных квитанций
  `/var/log/summy-dev-cleanup/cleanup-*.json` (хранятся последние 30).
  Порог `release.py` не меняется.
- **Параметры:** `--keep-releases` от 3 до 20, `--grace-hours` от 6 до
  2160, `--cache-hours` от 24 до 2160; отрицательные и нецелые значения
  отклоняются с кодом 2.
- **Версии.** v1 `8a62e942…` (разовая уборка), v2 `8bcb107d…` (R1–R3, 12:06), v3 — текущая (live-compose через Docker Compose, обязательные три выпуска на продукт).
- **История.** Разовая уборка 05.10.2026 11:44 выполнена первой версией
  (sha256 `8a62e942…`). Она удалила 158 образов (журнал
  `cleanup-20261005T114452.json`) и выполнила
  `journalctl --vacuum-size=500M` с exit 0. Журнал перед этим занимал
  259,5 МБ, то есть был ниже предела. В версии 2 этой операции нет.
- **Ручной запуск:** сначала план, затем применение.
  ```
  python3 /opt/summy-test/maintenance/summy-dev-cleanup.py
  python3 /opt/summy-test/maintenance/summy-dev-cleanup.py --apply
  ```
- **Отключение:** `systemctl disable --now summy-dev-cleanup.timer`.
- **Откат к прежней уборке.** Юниты `docker-prune.*` оставлены, копии лежат
  в `/opt/summy-test/maintenance/replaced/`. Вернуть:
  `systemctl disable --now summy-dev-cleanup.timer && systemctl enable --now docker-prune.timer`.
  Прежний юнит удаляет и остановленные контейнеры, и сети старше недели.
  Копия первой версии скрипта — в
  `/opt/summy-test/maintenance/replaced/summy-dev-cleanup.v1.py`.
- **Ёмкость.** Каждый выпуск с CRM добавляет около 1–2 ГБ. Подготовка
  выпуска требует больше 5 ГБ свободного места; при частых выпусках можно
  запустить уборку вручную раньше воскресенья.

### Синк YClients: расписание, сигнал и повтор (SUM-185, 01.10.2026)

Сверено по коду `backend/test` `c7a4d3f3daf28b816dde9d2a39f2ac01b3479694`. Расписание — реестр
`app/sync/schedule.py` (today, window, tail, horizon, catalog, clients, sweep,
schedule, resource_schedule, transactions, reviews и задания платформы);
выключенные задания и причина видны в `sync_job_beats` и строке старта
`[sync] версия … · задания: …`. Заданий payroll, pricing и staff registry нет и
не требуется: их источник (БД прежнего кабинета) удалён 16.08.2026, зарплаты
считаются при чтении. Обнаружение сбоя — `/health` без токена (`freshness`:
`fresh`/`stale`/`dead` по порогам today 15 мин, window 90 мин, catalog/clients
26 ч, `dead` после 3× порога; `jobs` — пульс заданий), подробно
`/v1/freshness` и CRM «Интеграции» (SUM-180). Повтор после сбоя — только
`python -m app.sync.run <задание>` внутри контейнера sync: тот же advisory-замок,
что у планировщика, при занятом замке код 75 без изменений; импортёры
идемпотентны (снимки `ON CONFLICT`, позиции записей под замком). Порядок
команд — `backend/docs/DEPLOY.md`, раздел 5. Внешнего сигнала (uptime-проверки
`/health` с оповещением) ни на TEST, ни на production нет. Решение 01.10.2026
(SUM-97 T3): сбой синка показывается владельцу в колокольчике CRM; почта,
Telegram и внешняя uptime-проверка не подключены. Реализация — CRM
`e868df32cea00acb562cde9bc038224561d0726d`: серверная дверь
`/api/notifications/sync-alerts` только для роли `owner` читает тот же
`/v1/freshness`; предупреждение дают потоки общего вердикта (`in_verdict`) в
состоянии `stale`/`dead`, одно на поток (ключ — поток, состояние, последний
успех), опрос раз в 5 минут, текст ошибки синка не выводится. CRM ничего не
пересчитывает и не хранит; сигнал виден, только пока владелец открыл CRM.
На TEST credentials YClients отключены (T12), поэтому там колокольчик ожидаемо
показывает отставание. Production не менялся.

## Конфигурация — имена, не значения секретов

| Компонент | Переменные и назначение |
|---|---|
| Backend DB/S3 | POSTGRES_*, DEFAULT_ORGANIZATION_ID, S3_*; доступ только серверный; отдельная миграционная роль на целевых БД не подтверждена |
| Backend YClients | YCLIENTS_PARTNER_TOKEN, YCLIENTS_USER_TOKEN, YCLIENTS_COMPANY_IDS, YCLIENTS_READ_ONLY; здесь указаны только имена, не фактические значения |
| Backend service/auth | SERVICE_API_TOKEN, SESSION_SECRET, INTERNAL_MASTER_API_ENABLED |
| Backend баг-репорты CRM, клиента и мастера | YOUTRACK_URL, YOUTRACK_TOKEN, YOUTRACK_PROJECT_ID, YOUTRACK_BUG_STAGE_ID (`166-15`), YOUTRACK_BUG_TAG_ID (`10-6`); без токена `/v1/app-bugs`, `/v1/client/app-bugs`, `/v1/master/app-bugs` отвечают 503; на Dev с 03.10.2026 23:05 у api задан только `YOUTRACK_TOKEN` (существующий ключ, env_file вне Git, `ytcfg-dev-20261003`), остальные — по умолчанию кода |
| Backend деньги клининга (кандидат SUM-120) | CLEANING_LOCATION_RATES_FROM, CLEANING_CHECKLIST_NO_DELAY_FROM — две независимые даты, по умолчанию не заданы; см. чек-лист ниже |
| Клиентский backend | CLIENT_PORTAL_ENABLED, CLIENT_PORTAL_SECRET, CLIENT_SMS_API_ID, CLIENT_CONSENT_VERSION |
| Orders sandbox | ORDERS_TEST_ENABLED, ORDERS_TEST_DATABASE = POSTGRES_DB, ORDERS_YCLIENTS_TEST_COMPANIES, YANDEX_PAY_SANDBOX_MERCHANT_ID, ORDERS_CLIENT_URL |
| Почта мастера | MASTER_REPORTS_EMAIL, REPORTS_SMTP_*; без настройки доставка выключена |
| Изолированный stand | STAND_AUTH_PASSWORD; несовместим с внешними боевыми реквизитами по guard backend |
| Client BFF | CLIENT_DEMO, CLIENT_BACKEND_URL, CLIENT_BACKEND_TOKEN, CLIENT_PUBLIC_ORIGIN |
| Master BFF / frontend | GATEWAY_URL, SERVICE_API_TOKEN, APP_VERSION; VITE_API_BASE, VITE_ORDERS_TEST_ENABLED |
| CRM | ADMINAPP_GATEWAY_URL/TOKEN, ADMINAPP_PUBLIC_ORIGIN, ORDERS_TEST_ENABLED |
| Website | GATEWAY_URL, SERVICE_API_TOKEN; NEXT_PUBLIC_CLIENT_BOOKING_ENABLED, NEXT_PUBLIC_CLIENT_APP_URL |

Секреты не ставить в VITE_* / NEXT_PUBLIC_*. Публичный флаг не является проверкой
прав. Production/client demo не переключается автоматически при ошибке upstream.

## Внешние зависимости

| Сервис | Роль в коде | Проверенный статус |
|---|---|---|
| YClients | Справочники, расписание, записи, auth, внешние ID; единственный фасад backend | Интеграция реализована, реальные настройки/права ключей и свежесть live-синка не проверялись |
| S3/MinIO | Медиа, backend storage; локально MinIO, runbook production указывает Timeweb S3 | Настройка описана, доступность бакета/полнота медиа не проверялись |
| SMS.ru | Код клиентского OTP | Есть адаптер, внешняя доставка не принята |
| SMTP | Отправка сохранённых обращений мастера | Есть очередь/повторы; заглушка адреса до настройки |
| Яндекс Пэй/Сплит | Платёж по заказу и возврат | Только sandbox-код; merchant и внешний прогон не подтверждены |
| Касса | Фискальный чек | Не выбрана, адаптера нет |

Не запускать внешние операции только ради обновления документации.
Существующий worker `outbox_events` обслуживает рекрутинг и общий Telegram-чат;
адресная доставка рекламаций в нём не реализована. Таблица
`order_notifications` принадлежит заказам и не заменяет этот контур.

## Релиз и проверка среды

Production-ветки указаны в [ветках](branches.md). Релиз Prod — по
[уставу](../CHARTER.md#релиз-prod) и [процедуре](../ai/WORKFLOW.md#релиз-prod):
проверенный состав, совместимость миграций и читателей, описанный откат,
версия в артефакте. Изменение ветки само по себе не доказывает развёртывание.
Для кандидата Prod проверяются тесты затронутого, сборка, health/version и
сценарий после входа; на Dev — только факты развёртывания и, при миграции,
сама миграция.

Параллельные работы на Prod: перед переключением трафика или переездом —
сигнал остальным одной строкой, в окно переключения релизы не выкладываются;
после — сверка версий по health; скрипты выкладки и документы
перенацеливаются в том же заходе; схема БД Prod меняется только через журнал
миграций своего репозитория.

Backend `/health` читает точный VERSION `<fullSHA>\n`; `/ready` проверяет БД.
CRM `/api/health` использует `version=<release>+<fullSHA>\nsha=<fullSHA>\n`;
logical health VERSION — `<release>+<fullSHA>`. Master `/healthz` проверяет оболочку
и runtime APP_VERSION `<release>+<fullSHA>`. Контекст сборки, архив и live VERSION
связаны точными байтами/хешами; rollback возвращает original bytes. Формат CRM
не переносить в backend. Health не подтверждает все пользовательские сценарии.
Упаковочные исправления PRODSMS описаны в [документе выпуска](releases/production-prodsms-2026-10-10.md).
Runbook сайта и master содержит исторические детали — перед релизом требуется
сверка с текущим владельцем окружения.

Откат orders: отключить флаги/worker и сохранить аудит. Не сносить таблицы ради
успешного downgrade: ограничения 0119/0120 намеренно защищают данные.

### Чек-лист выкладки кандидата SUM-120 (клининг и оклад управляющей)

Правило — [контракт](../contracts/payroll-v1.md#управляющая-и-уборщица).
Кандидат не опубликован; пункты действуют после одобрения точных SHA и
отдельного распоряжения о среде. Суммы 800/1 200 ₽ и право управляющей менять
ставки уборки утвердил Кирилл (SUM-110, 7-350); дату включения на TEST ещё
уточняют.

1. Сначала backend с ревизией `0150_cleaning_rates_manager_pay`, затем CRM.
   Её предшественник — `0149_staff_penalty_payroll` (SUM-116). Перед
   накатом прочитать `alembic_version` целевой БД: ожидается ревизия
   опубликованной цепочки не новее `0149_staff_penalty_payroll`. Если там окажется неопубликованное имя
   `0149_cleaning_rates_manager_pay` или `0149_cleaning_location_rates`, не
   накатывать и эскалировать координатору.
2. `CLEANING_LOCATION_RATES_FROM=YYYY-MM-DD` — первый день выходов по
   персональной ставке уборщицы или ставке филиала 1 200/800 ₽. Без неё —
   прежняя ставка вида уборки. Ретроактивную дату не выбирать.
3. `CLEANING_CHECKLIST_NO_DELAY_FROM=YYYY-MM-DD` — первый день выходов, которые
   оплачиваются при загруженном бланке любого статуса. Без неё — прежнее
   правило: с 01.08.2026 нужен принятый бланк.
4. Обе даты утверждает Кирилл, отдельно друг от друга; одну не выводят из
   другой, из дня выкладки или наката. ⚠️ Дата в прошлом пересчитывает
   своды уже показанных, в том числе завершённых месяцев; ставить её раньше
   дня включения можно только по явному решению Кирилла о пересчёте.
5. Значения дат записать в задачу выкладки; env-переключатель не ведёт
   журнала изменений.
6. `MANAGER_PAY_APPROVER_YCLIENTS_USER_ID` — `yclients_user_id` Кирилла в
   `gateway_admin_access`. Без неё факты оплаты управляющей не записываются
   никем (403), чтение оклада работает. Значение ставят только после сверки
   личности: владелец строки доступа подтверждает, что это его вход; ID не
   угадывают по имени и не переносят из другой среды без такой сверки.
   Значение — идентификатор, не секрет; записать его в задачу выкладки.
7. `downgrade` ревизии 0150 после первой записанной ставки или факта не
   выполнять: ревизия откажет, а удалять денежную историю ради отката
   нельзя. При инциденте — выключить экран и оставить совместимый backend.


## Просмотренные источники

- [backend/docker-compose.yml](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docker-compose.yml) — локальные сервисы
- [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/STAND.md) — изоляция
- [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md) — test overlay и guards
- [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/DEPLOY.md) — runbook, не актуальный замер
- [master-app/docs/DEPLOY.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/DEPLOY.md) — версия/сборка
- [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/bff/README.md) — серверный транспорт
- [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) — demo/live
- [backend/app/config.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/config.py) — настройки
- [backend/app/integrations/client_sms.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/integrations/client_sms.py) — SMS.ru

Границы чтения и полный реестр: [sources.md](sources.md).
