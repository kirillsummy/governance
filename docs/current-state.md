# Текущее состояние

Только подтверждённое состояние сред со ссылками на выпуски. Ход задач — в
YouTrack, изменения — в [CHANGELOG](../CHANGELOG.md), датированные записи до
02.10.2026 — в [журнале](history/current-state-log-2026-10-02.md). Перед
выводом о среде сверяй живое состояние: VERSION, образы, ревизию БД.

## Prod: S194 с 05.10.2026 14:20 МСК, сайт — GRADE2 с 16:27

05.10.2026 16:27 МСК поверх GRADE1 выпущен повторный фикс только сайта:
website `f6dd7b8d5e7cc211b953062beb42028272d777f2` (`main`, `v2.33.2`,
VERSION `GRADE2+f6dd7b8…`, BUILD_ID `r9TLuFCjDWfmdap3tT8T5`).
`MastersCatalog.zapisi` сохраняет актуальный объект мастера от сервера при
фильтрации каталога; GRADE1 доставил источник грейда, но оставил старые объекты
в карточках. После обновления страницы у Дианы Мальцевой каталог и профиль
показывают 4 звезды; рейтинг 4,88 не менялся. Dev и Prod exit 0,
продуктовые тесты и отдельные проверочные сборки не запускались.
Остальные продукты — S194 ниже. Источник — [SUM-215](https://summy.youtrack.cloud/issue/SUM-215),
подробности в [CHANGELOG](../CHANGELOG.md); предыдущая версия —
[GRADE1](releases/production-grade1-2026-10-05.md).

Прямое поручение 05.10.2026: состав Dev `s194-dev-20261005` после проверок
([SUM-211](https://summy.youtrack.cloud/issue/SUM-211)). Работают backend
`dfde65b4526fe6a329e9f6455f8d408308d04078` (`v0.4.0`; `dev` = `9528afe` — сверху только лимит CI 60 мин), CRM
`792d123e765b0c784c2c2aeccef519d62fa879b7` (`main`, `v0.180.0`), master-app
`04643caaee3111c00a292b06db07270396b44895` (`feature/react-client`, `v0.82.0`),
website `fa90db7238a0a5eb17835838e99940b829916422` (`main`, `v2.33.0`); БД
`0204_hr_action_request_links`, вход CRM `gateway`. client-app
`9a2cbd1787e73db09eb0d64e964e8eb9c40f276b` (`main`, `v0.2.0`) только поставлен,
клиентский вход не включён. Это Dev-состав `bb86c7f`/`d100b4f`/`9040821` плюс
исправления подготовки (lint, типы, тесты, снимок OpenAPI). Все фазы exit 0,
проверка после выкладки 50/50, API и sync стояли ≈2 мин 25 с. Проверки,
репетиция 0166→0204 на копии Prod, копия БД, флаги SUM-194 и откат — в
[документе выпуска](releases/production-s194-2026-10-05.md). Прежний Prod —
[RC6](releases/production-rc6-2026-10-02.md); более ранние —
[журнал](history/current-state-log-2026-10-02.md) и [релизы](releases/).

## Dev

05.10.2026 20:43: `pool3-dev-20261005` — backend `f5aaab09db98a36f95fbbf3a8b982bbe94b2e9cd`, CRM `7d9b38a19d21bd4c6ad0777cebd2862e8529ecfd` (отчёт «Неполные данные · дыры покрытия», SUM-96 № 37); БД `0211_puzzle_reward_settings` без изменений; prepare/backend/crm exit 0.

05.10.2026 20:37: `pool2-dev-20261005` — backend `b87bf0fe3c8b51752f75477b30d42b8f6e9291b2`, CRM `8b2cb4b8ba3071bfc6422431090fe28fd8e9aeaa` (настройки наград игры — [контракт](../contracts/puzzle-rewards.md); календарь T05/P08; последствия снятия филиала мастером P25/№ 57; журнал прогонов интеграций T10; честные отказы склада T06; процессы без дублей; шестой остаток SUM-160); БД `0210_comms_thread_locations` → `0211_puzzle_reward_settings` (копия `pool2-dev-20261005-before-0211.dump`); prepare/backend/crm exit 0. Награды игры не включены.

05.10.2026 20:20: `pool1-dev-20261005` — backend `21fa90274ac145393e9abb0328acde8756dab9d3`, CRM `7e41eb4404a97fff6331e5c05496142983e1ab2b` (библиотека документов T02/P13, остаток DTO SUM-135, карточка клиента T01/P10); БД `0210` без изменений; prepare/backend/crm exit 0. Все три выпуска: master-app `fdd585a`, client-app `9a2cbd1`, website `GRADE2+f6dd7b8` прежние, `YCLIENTS_READ_ONLY=true`; тесты не проводились, проверены только миграция и сохранность данных; Prod не менялся.

05.10.2026 19:52: `crr2-dev-20261005` после `crr1-dev-20261005` — только CRM `d5dbb72bb81a03b2b5e8fd067974d8c970df0555` (SUM-160 пятый остаток честных состояний, SUM-135 журнал переписки и состав услуг на закреплённом OpenAPI); prepare/crm exit 0; backend, БД и остальные продукты прежние. Тесты не проводились.

05.10.2026 19:41: `crr1-dev-20261005` после `sbd-dev-20261005` — backend `04ad395383fe3e669381aaf3b97c5c75638edeea`, CRM `cbdcceeebcfab7b8f3c86bf3938659e0ccb4d1b2` (P19/P20: администратор видит чаты клиентов своих филиалов и отвечает — [контракт](../contracts/client-comms.md)); БД `0209_staff_birthday_push` → `0210_comms_thread_locations` (копия `crr1-dev-20261005-before-0210.dump`); диалогов в журнале Dev 0; отправка наружу выключена. Проверены только миграция и сохранность данных; Prod не менялся.

05.10.2026 19:16: `sbd-dev-20261005` после `s194t-dev-20261005` — backend `ceba6cbbe1afc7eaa200e33b8cc124100df43b87`, CRM `4f81c5266629b31774983d7c3067b2a22e9b9aae` (дни рождения сотрудников: календарь, счётчик недели, процесс за 7 дней, напоминания управляющему за 14 и 2 дня, web push — [контракт](../contracts/staff-birthdays.md)); БД `0208_document_link_triage` → `0209_staff_birthday_push` (копия `sbd-dev-20261005-before-0209.dump`, pg_restore-проверка чтения прошла, `process_types` +1); master-app `fdd585a036ee07c77fc19dc466eb68d7e35c6575`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `GRADE2+f6dd7b8d5e7cc211b953062beb42028272d777f2` прежние; `YCLIENTS_READ_ONLY=true` — задание `scheduled_processes` на Dev выключено, ключ VAPID не задан, сертификат CRM Dev не доверенный: push на Dev не отправляется. Дат рождения в профилях Dev 0. Проверены только миграция и сохранность данных; Prod не менялся.

05.10.2026 15:58: `dlk-dev-20261005` после `cnf-dev-20261005` — backend `76d848be0f1865d95f33f9beca2f44f5e511a7b6`, CRM `13f3a0bb1d67bfa175d459e685219f475cb36c95` («Неразобранные» документы, включает SUM-194/SUM-171 из `test`); БД `0204_hr_action_request_links` → `0208_document_link_triage` (копия `dlk-dev-20261005-before-0208.dump`); master-app `92f460b9a59a1f44282445a51823009750f85319`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `008ebb282fd07d97b0644a5e7b7d5401b88c341f` прежние; `YCLIENTS_READ_ONLY=true`. Проверены только миграция и сохранность связей и объектов этой операции; Prod не менялся.

05.10.2026 15:48: `wgh-dev-20261005` после `cnf-dev-20261005` — только website `008ebb282fd07d97b0644a5e7b7d5401b88c341f` (грейд мастера в карточках с платформы, SUM-215; BUILD_ID `DnUXc-6H7EgH0AKOVSvmZ`), prepare/website exit 0; остальные продукты и БД `0204_hr_action_request_links` прежние. Тесты не проводились. Этот же фикс выпущен на Prod (GRADE1, выше).

05.10.2026 15:46: `cnf-dev-20261005` после `csa-dev-20261005` — backend `ecc741a5e556286cd167c8abb9d59ac19d8496cc` (имя уборщицы: полное ФИО или фамилия и имя из карточки), CRM `ccdc493af0652d45beea1078bd87d743fa8a0991`; master-app `92f460b9a59a1f44282445a51823009750f85319`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Тесты не проводились; Prod не менялся.

05.10.2026 14:48: `csa-dev-20261005` после `cfi-dev-20261005` и `s194fix-dev-20261005` — backend `08d71b79faf2065b51272be7b689c10ea392c1bf` (чек-лист филиала для листа уборщицы), CRM `b0078a4d696433b8404f9a1eef1272a95c5f9ae5` (лист уборщицы в «Приложениях», общий шаблон, Word); master-app `92f460b9a59a1f44282445a51823009750f85319`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Тесты не проводились; Prod не менялся.

05.10.2026 14:21: `cfi-dev-20261005` после `s194fix-dev-20261005` — backend `11fb4654f4d2ad325ed5e919e13d0f3bc2bbec34` (импорт собранных файлов в CRM); CRM `292eee753b9a6a8b75bb60e89062fc6f96fd967b`, master-app `92f460b9a59a1f44282445a51823009750f85319`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422` прежние; БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Данные Dev: перенесены 1 060 файлов (документы 128, шаблоны 5, медиатека 921, база знаний 6), см. CHANGELOG 05.10. Проверена только сохранность переноса; Prod не менялся.

05.10.2026 14:14: `s194fix-dev-20261005` после `cqr-dev-20261005` — исправления подготовки Prod S194 слиянием со свежей `test`: backend `c3ceba8690cbb58f9285788416c2dcd8c6213d12`, CRM `292eee753b9a6a8b75bb60e89062fc6f96fd967b`, master-app `92f460b9a59a1f44282445a51823009750f85319` (включает опубликованные в `test` коммиты Жени `c0fdaab`…`b24da07`); client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422` прежние. prepare/backend/crm/master exit 0, метки ревизии образов = SHA, api и adminapp healthy, RestartCount 0, БД `0204_hr_action_request_links` без миграций, `YCLIENTS_READ_ONLY=true`. Тесты на Dev не проводились (проверки — до Prod, см. [S194](releases/production-s194-2026-10-05.md)).

05.10.2026 13:23: `cqr-dev-20261005` после `mobile2-dev-20261005` — backend `295cc3ba6a633e07222f7bfde336e1f287b8e8ef` и CRM `9173fa5c4d4eaac00081a9986ecbb2d08cc85198` (QR уборщицы с ФИО внутри кода, SUM-203 → SUM-210, [контракт](../contracts/daily-processes.md#qr-уборщицы-фио-в-коде-05102026); CRM включает мобильную CRM `ee654ba` и закрытие смены `7efd4f6`, backend — `0819d6b`); master-app `9040821e1a937d1368b9ab0956419a891e95de69`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422` прежние; БД `0204_hr_action_request_links` без миграций, `YCLIENTS_READ_ONLY=true`. Состав совпадает с `test` на момент выкладки. Тесты не проводились; Prod не менялся.

05.10.2026 13:18: `mobile2-dev-20261005` после `ashc-dev-20261005` — CRM `ee654ba08f852ae0b70314a23972a1ad4c53dba9` (мобильная CRM, части 1–2, включает `7efd4f6`; часть 1 `fbc8807` была на Dev с 13:03, `mobile-dev-20261005`); backend `0819d6b3aeb9a47f54da0c01e1c4faedc3a383e3`, master-app `9040821e1a937d1368b9ab0956419a891e95de69`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Тесты не проводились; Prod не менялся.

05.10.2026 13:08: `ashc-dev-20261005` после `mobile-dev-20261005` (CRM `fbc8807`, 13:03) — backend `0819d6b3aeb9a47f54da0c01e1c4faedc3a383e3` и CRM `7efd4f673d831148c33e81674b6aaf8676726ccf` (закрытие смены только со сданными отчётами, долг инвентаризации филиала, SUM-203 → SUM-210; CRM включает мобильную часть 1); master-app `9040821e1a937d1368b9ab0956419a891e95de69`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422` прежние; БД `0204_hr_action_request_links` без миграций, `YCLIENTS_READ_ONLY=true`. backend и CRM совпадают с `test`. Тесты не проводились. Prod не менялся.

05.10.2026 11:52: `s194-dev-20261005` после `cons4` — backend `bb86c7fb0a0370f8cd963d98dbb25ccbf436aef4` (SUM-194), CRM `d100b4fd20616a6238c08fcacd11651334abe99c`, master-app `9040821e1a937d1368b9ab0956419a891e95de69` (SUM-194), client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Состав совпадает с `test`. Плановая уборка Dev v3 (sha256 `7de26207…`, с 12:18; текущий выпуск и два отката — условие допуска) — еженедельно, вс 04:00 МСК; при неподтверждённых метаданных скрипт останавливается до удаления ([инфраструктура](infrastructure.md#плановая-уборка-dev)). В `test` master-app ушёл дальше Dev: `b8d36e0363bce8a751d1f5b13d58df526bf5f29f` (Женя, «Финансы»), на Dev — `9040821`. Тесты не проводились.

05.10.2026 10:15: `cons4-dev-20261005` после `p14c` — backend `43d86ab1650f01238f7cc6f6d97c8b9f00a6076e`, CRM `6457d2adaf45d9e9070ad6a76f33343bafff2736` (консолидация локальных пакетов, включает release2 `558986e`/`76ad506`), master-app `62ea7965e3bc3b8b3e4a1f9eac1056c4d213fda2`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Состав совпадает с `test`. Тесты не проводились (см. CHANGELOG 05.10). Prod не менялся: RC6.

05.10.2026 02:04: `p14c-dev-20261005` после `p14b-dev-20261005` (00:19) — backend `7ec52fd2acc922535619ef0197564b19a4937a4f`, CRM `21a42adcaf183722d2df60da0621e40d42ab3c99`, master-app `62ea7965e3bc3b8b3e4a1f9eac1056c4d213fda2`, client-app `9a2cbd1787e73db09eb0d64e964e8eb9c40f276b`, website `fa90db7238a0a5eb17835838e99940b829916422`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true` (партия 14, см. CHANGELOG 05.10). Prod не менялся: RC6.

04.10.2026: codex-owner-thoughts-20261004 — backend 1d2cc93f479bb03c4f77c53cd6910b36a05617c9, CRM 0ce3e32e60190e9f7c80fdd5e82f69e216b1981b (кнопка буфера в заголовке и «Мысли Кирилла», SUM-214). prepare/backend/crm exit 0, api/adminapp healthy, RestartCount=0; БД 0204_hr_action_request_links без миграций; master/client/website — состав u21n3 ниже. Тесты не проводились, реальное замечание не отправлялось. Prod не менялся.

04.10.2026: Codex развернул точечный фикс переключения категорий процессов, CRM 0135ddd7236b82922de15dc73b6178b06e9bda3d, релиз codex-process-tabs-20261004, prepare/crm exit 0, running/healthy, RestartCount=0. БД 0204_hr_action_request_links без миграций; остальные продукты — состав u21n3 ниже. Тесты не проводились; Prod не менялся.
04.10.2026, независимая сверка Codex перед точечным исправлением: свежие test и Dev VERSION совпадают — backend `b965e2a771c1e4d80c785311533d4f559adc09ef`, CRM `174c3958a1d492e36b5c8b8931df71a1dd2f2dce`, master-app `3f5e4b764be6fad2b1a6a0c001449049acef784e`, client-app `0f0a38da921d2d64164e890693179fa897f4f735`, website `7733966b31949a2e405ab6cf9a965ed9188231ff`. Метки revision работающих контейнеров совпадают, API/CRM healthy, RestartCount=0; БД `0204_hr_action_request_links`. Последний завершённый выпуск `u21n3-dev-20261004`, общий замок свободен. Это сверка доставки, функциональные тесты не проводились.

Шаги интегратора до точечных исправлений Codex выше: `u21n3-dev-20261004` (04.10.2026 20:44 МСК): backend `b965e2a771c1e4d80c785311533d4f559adc09ef`, CRM `174c3958a1d492e36b5c8b8931df71a1dd2f2dce`, master-app `3f5e4b764be6fad2b1a6a0c001449049acef784e`, client-app `0f0a38da921d2d64164e890693179fa897f4f735`, website `7733966`, БД `0204_hr_action_request_links`; перед ним `u21m` (backend `4066e76`); ранее — `u21l-dev-20261004` (04.10.2026, потоки до 21:00): backend `63e0d3267786e0e7b13cff43aa3fae6c4d95e4f0`, CRM `292934e82113781c8e4fde4d56f383c282bca2d3`, master-app `30c88a2094a218ef933ada6d8dd272630d9ff3e0`, client-app `0a316e84bc5df36af06d44f3579f3bda168f0815`, (перед ним `u21k`, `u21j`, `u21i`, `u21h` того же вечера; до них — `u21g`: backend `f1b8e4367e809511f4ef9c4045470744cd316008`, CRM `1b8a675a2d08a1f473b40d191b8dbf0e5318e816`), website `7733966`, БД `0204_hr_action_request_links`, `YCLIENTS_READ_ONLY=true`. Перед ним в тот же вечер — `u21a-dev-20261004` (backend `917b5066643ddc2d9bd751326bad134ac790915c`, CRM `bdc038a7371339857f29054000eb11b1b3b4ffb8`, master-app `84d02498ade0ef066f53b54ecf2869b8555c2860`), `u21b-dev-20261004` (backend `b762e354be3538570776e81e21264d7cb2c8a6d2`, CRM `1bf2cf62bc3c028227f1db96fc6a56c559493652`), `u21c-dev-20261004` (backend `78cadbb69204ab95e8cdb9c10f697fe8ced06802`, CRM `f79bfefafc861d6055473c7ef8c5e24ab6a253f2`, БД 0201 → 0204, копия `/opt/summy-test/backups/u21c-dev-20261004-before-0204.dump`), `u21d-dev-20261004` (backend `7d2f931fbf0d8dbe258debc56e9b1a3d4974a2b1`, CRM `45a174c2108aa8ddf18f0a3f62c494135c44fb1c`), `u21e-dev-20261004` (backend `014d671616dc617029554157ab676f7f992bf0df`, CRM `370780b8b64ab73a00688b9b0f934e6d50085852`), `u21f-dev-20261004` (backend `0713b84a8178f448d499c64ab81c800db156996d`, CRM `24ce71b7c4880fdb7f3f5ab0fb28dcb011f9e4c3`). Перед ними — `w2-dev-20261004` (04.10.2026 16:22 МСК): backend `61988b0dcca14ec9717e9b891d865447dadfaaea` (каталог базы знаний T02, импорт записей на каркасе, читающий адаптер Авито без подключения), CRM `d7083b1d3998d2b1d47aa1505a6bfd92cdf22695` (база знаний T02, отбор движений склада T06), client-app `33a383d2f5ef76dc336a0ac7e43b1d11ab3e0cd6` (окна у пазла), БД `0201_hr_request_type_archive` без изменений; master-app `cfcb6e0`, website `7733966`, `YCLIENTS_READ_ONLY=true`. Перед ним — `pi5b-dev-20261004` (04.10.2026 15:45 МСК): backend `094cd985f41af1cccb7af87936b4985e5220271e`, CRM `1ad4ceebcb6d4d547269918f07f509d89c3969d8` (процессы из архивов, KPI → календарь, финансовый журнал), БД `0200` → `0201_hr_request_type_archive`; master-app `cfcb6e0`, client-app `e508cf7`, website `7733966`, `YCLIENTS_READ_ONLY=true`. Перед ним — `adm2-dev-20261004` параллельной сессии (backend `0eec9e7`, CRM `ec542e3`, БД 0200), `pi4-dev-20261004` (backend `12c60c720e45124335c63b7a64e9cac32fd18503`, БД 0197 → 0198), `pi3b-dev-20261004` (backend `949b31d8aecdbafd1064548a0be8532090476010`, CRM `34384888fa442ea138395639b444f82a78732f38`, БД 0196 → 0197), `pi2-dev-20261004` (backend `1662dad2c0cb42aaf2eef7dd92120ea51bacc7e4`, CRM `95e67edf538db2d97554e8fdb512ef02d0820375`), `adm1-dev-20261004` (БД 0196). Перед ними — `pi1-dev-20261004` (04.10.2026 14:50 МСК): backend `dbe7a7f8f4e60a9de6e336702a290531cdaa10f0` (импортёры YClients на общем каркасе, И1/И2), без миграций, БД `0195_loyalty_bonus_rules`; CRM `8e6cf1e`, master-app `6b8b0e1`, client-app `1d1e39e`, website `7733966` прежние, `YCLIENTS_READ_ONLY=true`. Перед ним — `adm2-dev-20261004` (04.10.2026): backend `0eec9e70bbf50c4d3ab520de0ba7f5d9520ebb59`, CRM `ec542e39a189f023f97747e1ad0c402287b9f567`,
master-app `cfcb6e0ce5af9337e65f31d1079527194007b6e5` (кадры, табель по ролям и Excel, сводка, выбор филиалов мастером), БД `0198` → `0200_master_location_choices`
(копия `/opt/summy-test/backups/adm2-dev-20261004-before-0200.dump`); client-app `e508cf7`, website `7733966`. Перед ним — чужие `pi4` (backend `12c60c7`, 0198) и `pi3b` (0197),
затем `adm1-dev-20261004`: backend `35279728ec5b6486605294542912a2c588eafb43`, CRM `6f357d77e6ebe5140c9e0cc5baf311f1ae368994`, master-app `10b28ac260d7b134e7220dfa130f4f8b41560ddc`,
client-app `e508cf75fe0b46699830f7eca8c5eedcec1eb60d`, БД `0195` → `0196_master_hours_admin_closures`. `YCLIENTS_READ_ONLY=true`. Перед ними — `bonus-dev-20261004` (04.10.2026 14:16 МСК): backend `ca3ba362a3b3aa3716da9e60957e90814970af4c`, CRM `8e6cf1e530dc3a27adf02fe3c669c2bbc39227a4`,
client-app `1d1e39e3b12158fe3432604756d6aa18ee5b746d` (правила бонусов по категориям, «без скидки при бонусах», сроки), БД `0194` → `0195_loyalty_bonus_rules`
(копия `/opt/summy-test/backups/bonus-dev-20261004-before-0195.dump`); master-app `6b8b0e1`, website `7733966` прежние. Списание бонусов не подключено,
`YCLIENTS_READ_ONLY=true`. Перед ним — `dak2-dev-20261004` (04.10.2026): backend `8802e27e2360692d1daea4c806424703b71a885d`, CRM `14f02e90669ee9f0a45d00cad040d69501763279`
(показатели KPI и КДО), БД `0193` → `0194_client_care_tasks`. Перед ним — `dak-dev-20261004` (04.10.2026): backend `fa848657214c5ca99a89f41c6846d80e5e0513f7`, CRM `a58e62075e9476ba9e1f545530a20f4e16020be1`
(«Документы» только владельцу и бухгалтеру), без миграций. Перед ним — `fpd3-dev-20261004` (04.10.2026 ≈12:30 МСК): backend `36fe8c27b09fb111d31c565b9707896a8b597695`, CRM `8eeba2fc58d7e0cfdb759658e3357752122950df`
(T01 — серверная пагинация клиентов), без миграций. Перед ним — `fpd2-dev-20261004` (04.10.2026 ≈11:56 МСК): backend `e5fe9bb6bc685819bedd702d63dbce0d0056950b`, CRM `9b826e89fe277c7cdf4972898cd1a3c0af53d02e`,
client-app `4ca1dbe0e9274e07ab5046710720b8766be229e8`, website `7733966b31949a2e405ab6cf9a965ed9188231ff`; БД `0191_comms_import` → `0193_puzzle_games` (копия
`/opt/summy-test/backups/fpd2-dev-20261004-before-0193.dump`). Перед ним — `fpd-dev-20261004` (11:28 МСК): backend
`8e9881bb232fcadcb15b50f0b249148e22a3b1e0`, CRM `ace8ea03bf94be80ec0d5637be08256336e978f2`, БД `0190` → `0191_comms_import`. Итог после fpd2: backend `e5fe9bb`, CRM `9b826e8`,
master-app `6b8b0e1`, client-app `4ca1dbe`, website `7733966`; `CHATWOOT_*` на Dev не заданы (перенос переписки —
«Функция в разработке»). Перед ними — `as3-dev-20261004` (04.10.2026 02:03 МСК): backend `b8cb1ce181728546c1d49b259c46d0a4b729a16e`, CRM
`d3ca2b59ccf6d2c99c29fc67021c74f39f99a1f7`; БД `0189_knowledge_library` → `0190_knowledge_file_provenance` (копия
`/opt/summy-test/backups/as3-dev-20261004-before-0190.dump`). Файлы базы знаний: сумма, состояние в источнике,
«только владелец»; в каталоге 5 материалов Aspro из закрытого MinIO Dev (черновики). Итог на Dev: backend `b8cb1ce`,
CRM `d3ca2b5`, master-app `6b8b0e1`, client-app `4aef958`, website `39dac12`. Перед ним —
`q4b-dev-20261004` (04.10.2026 01:36 МСК): backend `e76d6ff0c05c518d7efb11d6984d2f3e56b6c748`, CRM
`80efc303dabb208a3ea31c19c693f1c6360e6a3e`, master-app `6b8b0e1ba46c32f22d41cd09f7c63f76625def77`; БД `0189_knowledge_library` (миграции 0185–0189 применены выпуском
`q4-dev-20261004`, копия `/opt/summy-test/backups/q4-dev-20261004-before-0189.dump`). QR лояльности, отзывы с карт,
общее расписание мастера, журнал переписки и база знаний — без внешних доступов и отправки. Итог на Dev: backend `e76d6ff`,
CRM `80efc30`, master-app `6b8b0e1`, client-app `4aef958`, website `39dac12`. Перед ним —
`r136-dev-20261004` (04.10.2026 00:47 МСК): backend
`eec0ca52d968b135b1ceefd58f312f83af58f058` и CRM `93dab1eb306b7cea5e1c752be25050b5668b979e`
(R136, прямые каналы без доступов), exit 0, без миграций; БД `0184_app_bug_reports`. Перед ним —
`r132-dev-20261004` (04.10.2026 00:34 МСК): website
`39dac121f991c00181110cab5999c62e340ddb17` (R132). Перед ним в ту же ночь, все exit 0:
`r131-dev-20261004` (00:29) — backend `cc1fcd274d19c47fa50420e58a3269a73002b4ae`, БД
`0183_penalty_type_positions` → `0184_app_bug_reports` (копия
`/opt/summy-test/backups/r131-dev-20261004-before-0184.dump`); `r130-dev-20261004` (00:24) — CRM
`99a6dc87e3f5746a21afd5b36fe85ec9ba89cbe2`; `r134-dev-20261004` (00:16–00:18) — backend
`b3ae3c876e88f5c45edb492a1d6e108fac35e9f3`, БД `0182_review_source_field` →
`0183_penalty_type_positions` (копия `…/r134-dev-20261004-before-0183.dump`), CRM
`6334697daae3d8abec3cf23072b166c0df512fd6`. Итог на Dev после r136: backend `eec0ca5`, CRM `93dab1e`,
master-app `8fc4bd2`, client-app `4aef958`, website `39dac12`, БД `0184_app_bug_reports`;
`YOUTRACK_TOKEN` у api и `YCLIENTS_READ_ONLY=true` сохранены. Тесты не проводились
([CHANGELOG](../CHANGELOG.md)).

Перед ними — `dlv1003-dev-20261003` (03.10.2026 23:52–23:59 МСК): backend `fa9ffcef45684544f0cbf90f7b5b6ea385bf210c` (D01, D05, D08 и Q207-1), БД `0181_staff_schedule_minutes_cache` → `0182_review_source_field`, CRM `04e8720859813489c010f8e09c8a5307a2a2283a`, master-app `8fc4bd2ec74648ba0068e185e6fe7351826111d5`, website `f8666f09fee70229bb08fddfbc5294e05ea71a8c`; client-app прежний `4aef958`. Все шаги exit 0; копия БД перед 0182 `/opt/summy-test/backups/dlv1003-dev-20261003-before-0182.dump`, число строк контрольных таблиц не изменилось; env api/sync прежние, `YCLIENTS_READ_ONLY=true`. Тесты и проверки на Dev не проводились ([CHANGELOG](../CHANGELOG.md)). Перед ним — `ytcfg-dev-20261003` (23:05 МСК): у backend api задан `YOUTRACK_TOKEN` (существующий ключ, значение не выводилось), образ прежний `7c315c5`; реальный баг-репорт не отправлялся. Пакет `rt1003-dev-20261003` не запускался и заменён.

Перед ними — `crmstyle-dev-20261003` (03.10.2026 17:36 МСК): CRM
`d45e3d2` — оформление CRM по эталону 01.10.2026 `6f9c316`, кроме кнопки открытия смены
([канон](../contracts/crm-navigation.md#эталон-оформления)), exit 0, без миграций. Перед ним —
`perf-be3-dev-20261003` другой задачи (17:30 МСК, backend `7c315c5`, без миграций) и
`bugq-dev-20261003` (03.10.2026 17:24 МСК): backend
`03a0e88` и master-app `df7fa1d` — баг-репорт отдельной задачей в «Очереди» с тегом «баг»
([контракт](../contracts/bug-reports.md); токен на Dev задан позже, `ytcfg-dev-20261003`),
CRM `5652ee2` — меню свёрнуто при запуске, exit 0, без миграций. Перед ним —
`navlock-dev-20261003` (17:04 МСК): CRM
`70c78f3` — меню 16.09 и оформление утра 02.10 ([канон](../contracts/crm-navigation.md)),
exit 0, без миграций. Перед ним — `perf-fe2-dev-20261003` (16:55 МСК): CRM `88de9e9`,
master-app `1e3a497` задачи SUM-212. Ранее — `all-avail-dev-20261003-r3` (16:46 МСК): CRM
`1d925d2`; перед ним `all-avail-dev-20261003-r2` (16:40 МСК) и `-r1` (16:24 МСК) —
вся доступная часть пула ([запись](releases/dev-all-available-2026-10-03.md)), все шаги
exit 0, своих миграций нет. Между r1 и r2 — `perf-be2-dev-20261003` другой задачи
(backend `a988209`, миграция `0181_staff_schedule_minutes_cache`), перед r1 —
`perf-be-dev-20261003` (backend `3e7134c`, миграции `0179`, `0180`). Ранее — `board-cards-dev-20261003` (03.10.2026 15:42 МСК): CRM
`caa27a7` — доска процессов: прежнее оформление карточек, exit 0, без миграций.
Перед ним — `process-close2-dev-20261003` (03.10.2026 15:07 МСК): CRM
`4504e30` — окно карточки процесса без служебного заголовка, крестик закрытия
(после `process-close-dev-20261003`, CRM `e42957a`), оба exit 0, без миграций.
Перед ними — `shift-power-dev-20261003` (03.10.2026 14:43 МСК): CRM
`250bac7` — кнопка открытия смены как в приложении мастера, exit 0, без
миграций. Перед ним — `ut7-dev-20261003` (03.10.2026 14:35 МСК): CRM
`c12b033` (D11); перед ним `ut6-dev-20261003` (14:26 МСК): D04–D09
ревизии вопросов ([решения](decisions/2026-10-03-technical-decisions-d01-d13.md));
перед ним `ut5`, `ut4` (exit 0, без миграций) и `key-icon-dev-20261003` (значок 🛠 на
форме входа разработчика CRM, master-app, client-app,
[контракт](../contracts/test-developer-access.md), exit 0, без миграций).
Ранее — `ut3-dev-20261003` (backend `44cddae`, миграция
`0178_portal_order_record_idx`, website `65de6f4`), ранее — `ut2-dev-20261003` (03.10.2026 13:46 МСК):
D01–D03 ревизии вопросов ([решения](decisions/2026-10-03-technical-decisions-d01-d13.md)),
перед ним `ut1-dev-20261003`; оба exit 0, без миграций. Ранее —
`dev-entry-dev-20261003` (вход разработчика,
[контракт](../contracts/test-developer-access.md)) и `rc7-fix-dev-20261003`, состав которого зафиксирован кандидатом RC7
([документ](releases/production-rc7-candidate-2026-10-03.md), BLOCKED), и выпуски
автономного пакета ([запись](releases/dev-autonomous-batch-2026-10-03.md)).

| Компонент | SHA (03.10.2026 17:24 МСК) |
|---|---|
| backend | `03a0e884a5ef709f27f081eb775233dfdbdd3792` |
| CRM | `5652ee20e671de466eed175fd03be17a720e6ee0` |
| master-app | `df7fa1dbf3d32b0b72c07a25e271b9ada0c6532a` |
| client-app | `4aef9584bf72f4dfdcae8ceaf97cc40378bd26ec` |
| website | `65de6f47c584dd96ea8e8110a641b4281094960d` |

БД `0181_staff_schedule_minutes_cache`. `YCLIENTS_READ_ONLY=true` у api и sync; api и CRM
healthy, restarts 0; сайт под pm2 online.

### Предыдущий снимок — website R5, 02.10.2026 21:39 МСК

Последний подтверждённый шаг — `website-next-dev-20261002-r5`:
website `3656e18e44c47d556823f2b77dccad4de239e497` →
`27067d80cc949f425829d7629749d6ec035c1f5d`; доказательство записано
02.10.2026 21:39 МСК. `prepare`, активация `website`, итоговый `status` и
сбор доказательств завершились с кодом 0.

Предыдущая смена CRM и client-app — SUM-206, общий UI-кит
([ui-kit.md](../contracts/ui-kit.md)): `sum206-crm-dev-20261002` поставил CRM
`decf6cca93f1be9f49129217b40ad850d0e57daf` поверх P02 `057ac67`, затем
`sum206-client-dev-20261002` — client-app
`db7cc4d21db1d7a9b9bdd58b88165324460f10d4` поверх `bf9491f`.
Опубликованная запись Governance `e9bb5253ff9aefbcf72a99f00d7668970cb74878`
фиксирует CRM `prepare/activate` и client `prepare/client` с кодом 0;
эта история сохранена в [CHANGELOG](../CHANGELOG.md). Наше чтение подтверждает
состав, а не новое исполнение команд SUM-206. До R5 параллельный процесс
обновил client `db7cc4d` → `1dcc811e`; совместимость исходников прочитана,
новая версия принята в baseline. R5 эту версию клиента сохранил.

| Компонент | SHA в итоговом снимке website R5 |
|---|---|
| backend | `7ab379083e30e1dc0b4766390c2ee5906745f99f` |
| CRM | `decf6cca93f1be9f49129217b40ad850d0e57daf` |
| master-app | `bf8f86ce0468b664b36c7700c43a6891f7f67e89` |
| client-app | `1dcc811e97e9da6dc880493fe6cbd7e19c0f5b25` |
| website | `27067d80cc949f425829d7629749d6ec035c1f5d` |

БД `0166_optional_manicure_closure`, без действий с БД и миграций. Сайт online,
PM2 id 0, PID 82170, restart count 12; record стабилен после 20 секунд.
VERSION 0644, Build ID `srIwDPicyvD6aYIWN_oSk`, source/build соответствуют
target. PM2 env/launch fingerprints сохранены. Все 21 Docker records точно
совпадают с R5 baseline, отдельно сохранены env fingerprints девяти известных
контейнеров. Действующие CRM/client содержат SUM-206; их нынешние образы и
откат относятся к собственным выпускам, а не к историческому P02.
Доказательства, остановленные попытки и сохранённый source/build откат сайта —
в [записи выпуска R5](releases/dev-website-price-bindings-2026-10-02.md).

Исторический P02 `p02-sterilization-dev-20261002` (02.10.2026 20:29 МСК,
[SUM-203](https://summy.youtrack.cloud/issue/SUM-203)) доставил CRM
`bd07f09b04f27022a3a1fde4eb58343eadfb73a2` →
`057ac67bba937ed8c226977dc7173c2b35cd1603`, опубликованную в `test`.
`prepare/activate/status` завершились с кодом 0; CRM running/healthy,
RestartCount 0, VERSION 0644 и OCI revision соответствовали target.
«Стерилизация» открывается отдельным пунктом прежнего раздела процессов,
через `/processes?type=sterilization`, с теми же API/provider и правом
`processes`. Недоступный в каноне тип показывает недоступность с повтором,
а не общий список; нового маршрута и ACL нет. P02 пересоздал только CRM,
сохранив восемь остальных контейнеров, PM2 сайта, env и БД.
Образ и контейнер **снимка P02 в 20:29**, до SUM-206:
`sha256:8c2274350b9198340b851039158c4996a22ba33e30ab57242bb7e857bd8a6bde`,
`59a14afa6299b0e5163e361dd8b8a39aaeecd0e513f014a6032f351756104eb1`;
откат сохраняет source и image прежнего R3 `bd07f09`. Состав, хеши доказательств
и точный остаток P02 — в [записи выпуска](releases/dev-p02-sterilization-2026-10-02.md).

Предыдущий R3 сохранил P26, CRM P01/P02/SUM-135/SUM-160 и сайт SUM-162;
история параллельного `ot-20261002` и пределы его доказательств — в
[предыдущей записи](releases/dev-crm-and-website-2026-10-02.md).
Настройка сотрудников остаётся в меню рядом с фильтрами; «Настройка» удалена
только из шапки «Процессов».
Ранняя доставка мастера `1ce2cea` остаётся
[исторической записью](releases/dev-master-ui-2026-10-02.md).

Выполнены необходимые сборки для поставки, включая npm build сайта с внутренней
компиляцией framework; отдельные тесты, lint/typecheck, проверочные сборки,
smoke/HTTP и пользовательские сценарии не запускались. Приёмка поведения
не заявляется. Prod не менялся. Последнее чтение наличия
`YOUTRACK_TOKEN` в R3 дало только boolean false у backend и BFF мастера;
рабочая отправка баг-репортов поставками P02/website R5 не подтверждается.

Исключение стерилизации из общего «Все процессы» требует отдельного
совместимого серверного фильтра; клиентской отсечки после пагинации нет.
P03/P07/P09 и подпись ремонта в канонических данных остаются открытыми.
Старые проверки меню и моки `useSearchParams` рассматриваются при подготовке
Prod; нового права для удовлетворения проверки меню не добавлено.

Сайт: код [SUM-205](https://summy.youtrack.cloud/issue/SUM-205) принят статическим
чтением и опубликован в `test` как `9df86f9bb030e6a54f5a4b08f6782c3a8da3cae5`;
push и свежий `ls-remote` exit 0, исполнитель Юра. Официальный Claude Code
`claude-opus-5-5` завершился с кодом 0 и пустым MCP. 89 внутренних ID строк
прайса в 14 секциях и 22 переведённые связи сохраняют цены, категории,
длительности, порядок, Offer и действующую запись. Свежая опубликованная
голова `origin/test` и фактически доставленный SHA сайта —
`27067d80cc949f425829d7629749d6ec035c1f5d`; `9df86f9` — его предок,
полные деревья совпадают (`851721e266c0b3142c16f6fe20e7c08cd6e1723d`).
История чужой правки темы и её revert сохранена; её стили не входят в target.
Доставка этой части подтверждена R5; она не означает завершения всей сводной.
Историческая SUM-163 остаётся объединённой, SUM-195 — Backlog на Кирилле с
прочими частями. DEBT №1 выполнен только для связей прайса; двойное хранение
цен, студии и другие связи открыты, полного закрытия сводной нет.

SUM-203/SUM-196/SUM-194/SUM-195 целиком не завершены. P25 с филиалами и
P27 с классификацией рекламаций находятся в очереди; уточнения — в
[записи требований](decisions/2026-10-02-staff-branches-and-complaint-backlog.md).
Назначение веток и правила Git — в [ветках](branches.md).

## Включённость функций

Поставка выключенного кода не означает включения функции. На Prod client-app
поставлен неактивно, клиентский вход и SMS не включены; включение ждёт
решения владельца о секретах ([SUM-192](https://summy.youtrack.cloud/issue/SUM-192)).
Статусы отдельных контрактов — в [контрактах](../contracts/README.md).
