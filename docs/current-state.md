# Текущее состояние

Только подтверждённое состояние сред со ссылками на выпуски. Ход задач — в
YouTrack, изменения — в [CHANGELOG](../CHANGELOG.md), датированные записи до
02.10.2026 — в [журнале](history/current-state-log-2026-10-02.md). Перед
выводом о среде сверяй живое состояние: VERSION, образы, ревизию БД.

## Prod: PRODSMS с 10.10.2026 07:56:55 МСК

По поручению владельца включён SMS/ID-вход CRM и приложения мастера с вариантами
«По номеру телефона» и «По логину и паролю». Работают backend
`1c00e5f2c9aa6893dc375547524cd067ec3652f7` (`dev`, `v0.8.0`), CRM
`fcbe4a1cac3283ca646f44d1e9d4238482a8c0ee` (`main`, `v0.184.0`), master-app
`6c916e930c6ee106c86bd208ed15ecde658c5d8b` (`feature/react-client`, `v0.86.0`);
production refs/теги подтверждены non-force readback. Прежний вход, действующие сессии,
cookie и TTL сохранены; блокировка, увольнение и отзыв доступа запрещают оба входа.
Схема `0271_payroll_threshold_versions` прежняя, миграций нет. Client-app
`d96822cf6624ee4cf907eb7a2d653c377d8300b7` и website GRADE2
`f6dd7b8d5e7cc211b953062beb42028272d777f2` прежние. Full CI точных кандидатов,
изолированная runtime-приёмка141/141 и actual Prod prepare/activate/verify завершены.
В 07:58 МСК обе публичные страницы ответили TLS200 и показали оба варианта; реальные
SMS/внешние логины и browser secure-cookie при release-приёмке не проверялись.
Свежая копия БД полностью прочитана; rollback не применялся. Рабочие private overlays
выпуска выбирают immutable images, original compose/env неизменны; live VERSION обновлён, его прежние байты сохранены приватно.
Включение SMS/ID этим выпуском относится к CRM и мастеру; статус включённости client-app прежний.
[Документ выпуска](releases/production-prodsms-2026-10-10.md),
[SUM-232](https://summy.youtrack.cloud/issue/SUM-232).

### Предыдущий Prod: R1009 с 09.10.2026 17:40 МСК

Поручение владельца 09.10.2026: весь `origin/test` (= Dev) без тестов, с репетицией миграций.
Работают backend `4af883af929580b7d7623ffdd7c93131f0a321f4` (`dev`, `v0.7.0`), CRM
`72c77d70366fb3304dc3a6da4f4d4095fc124b34` (`main`, `v0.183.0`), master-app
`79db16f26f2218c0f58c0cacd4b9cf86bb8d380b` (`feature/react-client`, `v0.85.0`), client-app
`d96822cf6624ee4cf907eb7a2d653c377d8300b7` (`main`, `v0.4.1`); сайт не менялся (GRADE2
`f6dd7b8`). БД `0271_payroll_threshold_versions`. Env не менялся; новые по умолчанию — вход
через YClients включён, `TBANK_TEST_ENABLED=false`. Вариант 2 Активности и ГМ с октября всем
187 мастерам — прямой записью политик с аудитом (решение владельца). API и sync стояли ≈1,5 мин,
проверка 48/49, «доступно» контрольных мастеров не изменилось. Копия БД
`summy-2026-10-09-1720.dump` (в S3). Откат backend — только с downgrade до 0261 (старый код на
0271 даёт 500 на `/v1/payroll/bonuses`). [Документ выпуска](releases/production-r1009-2026-10-09.md).

### R1009-duties с 09.10.2026 16:15 МСК

Инцидент «пропали дежурства»: поверх R1008a переключена только CRM
`7740be074c9863fec82da20c957d38432472c133` (`main`, `v0.182.1`). Добавлен подпункт
«Процессы → Дежурства» бокового меню, ведёт в `/processes/duties`; видят
владелец, управляющий и администратор. Права, операции дежурств, backend, БД
`0261`, env и остальные продукты — как в R1008a ниже. Выпущено без тестов по
прямому разрешению пользователя. Свежая копия БД `summy-2026-10-09-1612.dump`
(в S3, полное чтение `pg_restore` ok). Откат — `r1009d.py rollback-crm` на
`b2c23dc`. [Документ выпуска](releases/production-r1009-duties-2026-10-09.md),
[SUM-231](https://summy.youtrack.cloud/issue/SUM-231).

### R1008a с 08.10.2026 11:23 МСК

Поручение владельца 08.10.2026: поверх R1008 выложен только backend
`0a767f09747608efcfdc5b6dc5657db8fdacbdc5` (`dev`, `v0.6.1`) — «Открыть день»
без проверки мест филиала (SUM-115, `MASTER_OPEN_DAY_CAPACITY_CHECK_ENABLED`
по умолчанию `false`). Миграций нет, БД `0261`; остальные продукты и env —
как в R1008 ниже. Свежая копия БД `summy-2026-10-08-1122.dump` в S3. Откат —
`r1008a.py rollback-backend` на `ba578c5`. [Документ выпуска](releases/production-r1008a-2026-10-08.md).

### R1008 с 08.10.2026 09:27 МСК

Прямое поручение владельца 08.10.2026: весь состав Dev `origin-test-dev-20261007c`
без тестов, с обязательной проверкой миграций. Работают backend
`ba578c58103d43ee3036880ed3f903f99fb0e23b` (`dev`, `v0.6.0`), CRM
`b2c23dcb729f35c9b1b357ca615b204e5d70b567` (`main`, `v0.182.0`), master-app
`50d0d756802ae09317990d842780958be30a19c8` (`feature/react-client`, `v0.84.0`),
client-app `7e39c434000fa604b4037d5557f11e4f1e015849` (`main`, `v0.4.0`) — клиентский
вход включён, `/client/` за basic auth; БД `0261_master_arrival_deliveries`, вход CRM
`gateway`. Сайт не менялся — GRADE2 `f6dd7b8d5e7cc211b953062beb42028272d777f2`
(`main`, `v2.33.2`). Env не менялся: автозакрытие и клиентский портал включены,
досылка прихода в YClients включена по умолчанию, отметка «Клиент оплатил мне
наличными» выключена. Проверка после выкладки 49/49, API и sync стояли ≈1,5 мин.
Свежая копия БД только локальная (загрузка в S3 при ручном запуске падает).
Репетиции 0253→0261, откат на R1007 и остатки — в [документе выпуска](releases/production-r1008-2026-10-08.md).
Прежний Prod — [R1007](releases/production-r1007-2026-10-07.md); более ранние —
[журнал](history/current-state-log-2026-10-02.md) и [релизы](releases/).

## Снимок test и Dev — SUM-220, 07.10.2026 16:34 МСК

Удалённые `test` повторно сверены непосредственно перед выпуском в 16:34 МСК и доставлены
на Dev: backend `dee21b6d9f6fa56e56186ae7d7608f3a12d5dd72` (Alembic head
`0260_penalty_reversal_paid_item`), CRM
`187e6c7181b80fa0df5e99595fd191621a7a2aa7` (снимок gateway API из backend
`1fe1fc29e6261390857e5323362f6118855ac68f`), master-app
`6d17b1552d8f18baa271ec3575b8b12a3b5faec3`, client-app
`40dd98694485fa0db184ff764e32872a47662340`. Сайт
`645216f6609953f327270d253399af8eef11cf12` уже совпадал с `test` и не
переключался. VERSION и метки ревизий запущенных образов подтверждены отдельно;
прохождение пользовательских сценариев не проверялось. Это датированный
состав; более поздние публикации в `test` требуют отдельной сверки и доставки.

В опубликованном backend — филиальная область управляющего для склада,
закупок, доставки и действующих кадровых операций (`0259`), запрет правки
сетевых материалов и техкарт при сохранении чтения, проверка Кирилла для
редактора решений, отмена и обжалование рублёвого штрафа (`0260`) и узкие
исправления процесса R3/R5. CRM содержит экраны и потребительские типы,
master-app — показ и обжалование штрафа. [SUM-220 7-1105](https://summy.youtrack.cloud/issue/SUM-220?focusedComment=7-1105)
фиксирует границы, проверки и остатки. Статьи базы решений и ACL YouTrack
не исправлены; редактор ждёт подтверждённых настроек Кирилла.

[Сверка SUM-220](history/sum220-test-audit-2026-10-07.md) — исторический
снимок первой публикации, а не актуальный статус. Состояние Prod R1008 — выше.

## Dev

10.10.2026 08:04:06 МСК: обязательный возврат PRODSMS подготовки, выпуск
`prodsms-return-dev-20261010d`. Работают backend/test
`33ac9f49688fc0092748cec696d365e053fe0b41`, CRM/test
`217f459395995a0b9f0766fdcaa420827ea70fd0`, master-app/test
`6c916e930c6ee106c86bd208ed15ecde658c5d8b`; refs и native prepare/activate/verify
сверены. БД `0277_custom_role_deletion` прежняя; custom roles/revocation, Analytics,
Events/дни рождения/компактные экраны и Dev developer/SMS flags сохранены.
Все4 API/sync/CRM/master running, RestartCount0, env/ports/mounts/networks прежние;
API/CRM healthy, у sync/master Dockerhealthcheck не настроен. Client/website и
прочие контейнеры не менялись. Тесты на Dev не проводились. Источник и env gates
Dev stand доступа восстановлены; дополнительный `/login_dev` HTTP/functional smoke не запускался.
[Документ выпуска](releases/production-prodsms-2026-10-10.md),
[SUM-232](https://summy.youtrack.cloud/issue/SUM-232).

10.10.2026 02:19 МСК: выпуск `ui-visual-dev-20261010e` (только CRM) — база клиентов компактно, окна инструментов без обрезания
([SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1268.0-0)). Работает CRM `7a2a9179c8981e844275873d6451b2c2baa3498f`
(`adminapp` `f02daacad817` healthy, RestartCount 0) поверх `payroll-default-dev-20261010`, backend `dc68196dee46915feccc2e694261a38c4875e8fc`;
БД `0277_custom_role_deletion`. Тесты не проводились.

10.10.2026 01:45 МСК: выпуск `payroll-default-dev-20261010` (только CRM) — «Зарплата → Мастера»: «Интерактивная» по умолчанию, «Сводная» в меню «Управление»
([SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1267.0-0)). Работает CRM `44710117d2525e81010ebef3db0658c1d9b83b84`
(`adminapp` `cc591bd370a6` healthy, RestartCount 0), backend `dc68196dee46915feccc2e694261a38c4875e8fc`; БД `0277_custom_role_deletion`. Тесты не проводились.

10.10.2026 01:37 МСК: выпуск `ui-visual-dev-20261010b` (только CRM) — «Сбросить» фильтра диалогов в чатах
([SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1266.0-0)). Работает CRM `22131fc66dbff5bebe7bea2be6ed6635dc8679f4`
(`adminapp` `83d135f4d263` healthy, RestartCount 0), backend `dc68196dee46915feccc2e694261a38c4875e8fc`; БД `0277_custom_role_deletion`. Тесты не проводились.

10.10.2026 01:29 МСК: выпуск `ui-visual-dev-20261010` (только CRM) — исправления визуальной приёмки единого вида CRM
([SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1264.0-0)). Работает CRM `a79385e293931823a1e5938ceea347f118c78f6e`
(`adminapp` `663277f4b95f` healthy, RestartCount 0) поверх `payroll-interactive-dev-20261010` (backend `dc68196dee46915feccc2e694261a38c4875e8fc`);
БД `0277_custom_role_deletion` не менялась. Тесты не проводились.

10.10.2026 00:54 МСК: выпуск `sum203w2-dev-20261010` (backend + CRM) — SUM-203 п.1, 2, 4, 5 ([SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1261.0-0)).
- Работают backend `4b5d3be2d6e962be40f14b2055c71f4f951748a8`: api `4038a7d8135e` healthy, sync `2813a2d9bc40`.
- Работает CRM `0d08333798f0b4b8cbc9e22fd54ed6d619327ff7`: `adminapp` `80416252a211` healthy.
- Выпуск включает CRM ui-canon, payroll-toggle и `53659941`. Процессы п.2 и склад п.5 из записи ниже теперь на Dev.
- БД `0277_custom_role_deletion` без изменений. Тесты не проводились.

10.10.2026 00:49 МСК: выпуск `ui-canon-dev-20261010b` (только CRM) — единый компактный вид CRM
([контракт](../contracts/crm-navigation.md#единый-компактный-вид-crm-10102026),
[SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1257.0-0)). Работает CRM `5b10e7951334885a8e321658c8a34a21d815d4ea`
(`adminapp` `9ba969bf4269` healthy, RestartCount 0) поверх выпуска `payroll-toggle-dev-20261010c`; коммиты SUM-203 п.2/п.5 из `test`
(CRM `aa7cbe23`…`e685ecd8`) на Dev не доставлены — ждут backend `94e5338b`. БД `0277_custom_role_deletion` и остальные продукты не менялись. Тесты не проводились.

10.10.2026 00:10 МСК: выпуск `evbd-dev-20261010` (backend + CRM) — справа на «Событиях»
дни рождения на 7 дней и медкнижки, день рождения без года ([контракт](../contracts/staff-birthdays.md#источник-даты-и-область),
[SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1255.0-0)). Работают backend `959103313a8882ecb0eafc5a45c14d142d0f55aa` (api `2c85e5e4f56d` healthy, sync `ac52118af757`) и
CRM `56d5cee0ca0fa26146ebf801d3c4f1da8be013d2` (`adminapp` `11992e6a12e4` healthy), RestartCount 0; БД `0276_staff_birthday_no_year`.
В профилях Dev 17 дат рождения из таблицы: 15 полных и 2 без года. Тесты не проводились.

09.10.2026 23:49 МСК: выпуск `analytics-compact-dev-20261009` (только CRM) — «Аналитика» пятью
пунктами с вкладками ([контракт](../contracts/crm-navigation.md#аналитика-пять-пунктов-с-вкладками-09102026),
[SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1254.0-0)). Работает CRM `737dfd51eb43ad9aa9dd942d9423fa187ea1dac4` (`adminapp` `6200d803114c` healthy, RestartCount 0);
БД `0275_custom_crm_roles` и остальные продукты не менялись. Тесты не проводились.

09.10.2026 22:47 МСК: вход разработчика на Dev выключен во всех приложениях с 21:03 —
`/login_dev` CRM отвечает 404 по решению SUM-96 №53, а не из-за сбоя
([контракт](../contracts/test-developer-access.md#включение-и-граница-среды)). Шаг `sms`
выпуска `auth-ready-20261009` включил реальный SigmaSMS для приёмки SUMMY ID и снял флаги
входа разработчика в api, `adminapp`, master BFF и client; живые env это подтверждают,
`/v1/test-developer/available` — 404. Работающая CRM
`921fcc509ea266b9a2c8fae8f18f2d5251af9931` (выпуск `crm-login-copy-921fcc50`) этот режим
сохранила. Код и сервер не менялись; тесты не проводились.

09.10.2026 22:00 МСК: общий выпуск `speed-gel-dev-20261009b` — «Скорость» +50 ₽ за маникюр с гель-лаком
и все переданные части компоновки и зарплаты ([CHANGELOG](../CHANGELOG.md), [payroll-v1](../contracts/payroll-v1.md), [SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1211.0-0)).
Работают backend `d451dee28a23930c627b315bf1397998e56bfb78` (api `b84b35e6841a`, sync `4c9f3d6fd447`)
и CRM `a072aa960d0de4d73aef63f7c76864249eb59238` (`adminapp` `25d80efc5c19`). Образы
`summy-speed-gel-dev-20261009b-*`, OCI revision = SHA, healthy, RestartCount 0.
БД `0274_payroll_speed_gel_polish`: asserts и снимки истории равны, снимок схемы совпадает с живой БД.
master-app `79db16f2`, client-app `d96822cf`, website `645216f6` без изменений.
В этих головах — бонусы по месяцам (`0273`), «Администраторы», «Клининг», автообновление,
«События», аналитика, только действующие мастера, «Остаток к выплате».
Записи этих частей ниже, где сказано «Dev не развёрнуто», устарели.
Первая попытка `speed-gel-dev-20261009` (21:45) откатилась сама — права каталогов архива.
Тесты не проводились; Prod не менялся.

09.10.2026 21:41 МСК: «Зарплата · Клининг» — одна компактная страница без подменю и
подзаголовков ([CHANGELOG](../CHANGELOG.md), [SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1208.0-0)). CRM
`08639d9dc6bed4996c8d9dbcd4b0ed217f4801c6` (test `b343d605`) впервые на Dev в
`payout-label-dev-20261009` (`3bf3ce85`), сейчас в работающей CRM
`8763cc0b90fe48d37aaf12c0c7756366d94fd7a7` (`auth-ready-20261009`). API, права и
деньги не менялись. Тесты не проводились; Prod не менялся.

09.10.2026 21:35 МСК: зарплата — «Остаток к выплате» вместо «Долг SUMMY»
([CHANGELOG](../CHANGELOG.md), [payroll-v1](../contracts/payroll-v1.md), [SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1209.0-0)).
Впервые на Dev — выпуском `payout-label-dev-20261009` (CRM
`3bf3ce850e0e55b98cdd38486f9e29c5dc5f9e05`, 19:46, exit 0); в работающей CRM
`8763cc0b90fe48d37aaf12c0c7756366d94fd7a7` (`auth-ready-20261009`, `adminapp`
healthy, RestartCount 0) правка `1555cee3` сохранена. Остальной состав — как в
снимке ниже. Тесты не проводились; Prod не менялся.

09.10.2026 21:35 МСК: «Зарплата · Мастера» показывает только мастеров с
`employment_status = active` (общий список и фильтр; карточка, политика и журнал
неактивного — в прежних правах), [CHANGELOG](../CHANGELOG.md). Backend
`08487298` развёрнут выпуском `payroll-active-dev-20261009` (19:42), CRM
`925c0085` — в `payout-label-dev-20261009` (19:46); оба входят в работающие
backend `fdf5b694` и CRM `8763cc0b`. Тесты не проводились.

09.10.2026 21:36 МСК (снимок потока «Аналитика»): вся аналитика вне Дашборда —
подпунктами «Аналитики» ([CHANGELOG](../CHANGELOG.md),
[crm-navigation](../contracts/crm-navigation.md#вся-аналитика--в-аналитике-09102026)).
Работает CRM `8763cc0b90fe48d37aaf12c0c7756366d94fd7a7` (выпуск
`auth-ready-20261009`, VERSION = OCI revision; `adminapp` healthy, RestartCount 0),
в которой есть CRM `a52a7f5e` этого переноса; впервые он попал на Dev выпуском
`payout-label-dev-20261009` (CRM `3bf3ce85`, 19:46). Backend
`fdf5b6948aac835619fb21fbddf8071a021cdd61`, БД
`0273_payroll_speed_month_assignment`, master-app `79db16f2`, client-app
`d96822cf`, website `645216f6` — состояние соседних выпусков после
перезагрузки Dev в 19:38, здесь только зафиксировано. Тесты не проводились;
Prod не менялся.

09.10.2026 17:33 МСК (последний снимок менеджера): «Мастера» — обычные
галочки бонусов за прошлый/текущий/будущий месяц, ГМ только от грейда
([CHANGELOG](../CHANGELOG.md), [payroll-v1](../contracts/payroll-v1.md)).
Работают backend `21f1929bbbb7452f2eac441b9a7c3f7647c741b6` и CRM
`636595b62c9d59a291e62bc966ead72190f964ee` (выпуск
`payroll-checkbox-dev-20261009b`), БД `0272_payroll_legacy_month_overrides`;
master-app `79db16f2`, client-app `d96822cf`, website `645216f6` без изменений.
Миграция `0271 → 0272` с проверенной копией, asserts и снимками истории.
`test` впереди Dev: backend `c1aac087` (инструменты дат, не применялись) и
чужие CRM-коммиты до `b343d605`. Даты начала работы на Dev: 1 из 56 активных;
найденные 39 дат по первому заказу YClients не применялись (поиск остановлен
владельцем). Проверены только миграция БД и деплойные сборки; Prod не менялся.

09.10.2026 17:28 МСК: «Добавить сотрудника» перенесено во вкладку «Найм»
([CHANGELOG](../CHANGELOG.md), [SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1189.0-0)). Переключена
только CRM `1a9c687bb93dd1162ffe0b179b49b44c3dfc109c` (выпуск
`hiring-add-dev-20261009`, VERSION = OCI revision = свежий `test`) поверх
соседнего выпуска `payroll-checkbox-dev-20261009`: backend
`d62271960b19e1596553afffb7218b2786e58e47`, БД
`0272_payroll_legacy_month_overrides`; master-app, client-app, website — как
ниже. Тесты не проводились; Prod не менялся.

09.10.2026 16:46 МСК: «Дежурства» — календарь и список графика, «Добавить день»,
отчёты к закрытию ([CHANGELOG](../CHANGELOG.md), [SUM-210](https://summy.youtrack.cloud/issue/SUM-210#focus=Comments-7-1187.0-0)). Поверх
выпуска ниже переключена только CRM `72c77d70366fb3304dc3a6da4f4d4095fc124b34`
(выпуск `duties-layout-dev-20261009`, VERSION = OCI revision = свежий `test`);
backend, master-app, client-app, website и БД `0271` — как ниже. Тесты не
проводились; Prod не менялся.

09.10.2026 16:09 МСК: зарплата «Мастера» — один экран, «Выплачено»/«Долг SUMMY»,
операции мастера, премии и штрафы текущим месяцем, пороги Кирилла
([CHANGELOG](../CHANGELOG.md), [payroll-v1](../contracts/payroll-v1.md)).
Работают (VERSION = OCI revision = свежий `test` всех пяти):
- backend `4af883af929580b7d7623ffdd7c93131f0a321f4` (выпуск
  `payroll-next-dev-20261009b`, БД `0271_payroll_threshold_versions`);
- CRM `a5ae8399ca6626481dde20839354aee02dc8a004` (тот же выпуск);
- master-app `79db16f26f2218c0f58c0cacd4b9cf86bb8d380b` (выпуск
  `auth-complete-20261009`), client-app `d96822cf6624ee4cf907eb7a2d653c377d8300b7`,
  website `645216f6609953f327270d253399af8eef11cf12`.

Миграция `0270 → 0271`: копия проверена `pg_restore`, 7 assertions, 5 снимков
истории совпали, счётчики без изменений. `YCLIENTS_READ_ONLY=true`,
`YCLIENTS_LOGIN_ENABLED=false`, `PLATFORM_ID_ENABLED=true`, лимит памяти
postgres 1600m. Реальных выплат, премий и штрафов при выпуске не было.
Проверены только миграция БД и узкие сценарии по поручению; Prod не менялся.

09.10.2026 12:41 МСК: «Зарплата и бонусы» — общий фильтр, назначения бонусов
по месяцам и ускорение таблицы, вместе со всем `test`
([CHANGELOG](../CHANGELOG.md), [payroll-v1](../contracts/payroll-v1.md#назначения-по-месяцам-09102026)).
Работают (VERSION = OCI revision = свежий `test` всех пяти):
- backend `60b6d7d66987ccb07ab451a4a3858a59c161904e` (13:03, выпуск
  `payroll-controls-dev-20261009c`; до него `f6873151`), БД `0270_payroll_bonus_targets`;
- CRM `83e25f910002b9add0b30acbb8d9d369c53cd1ea` (тот же выпуск);
- master-app `79db16f26f2218c0f58c0cacd4b9cf86bb8d380b` (выпуск
  `payroll-controls-dev-20261009`);
- client-app `d96822cf6624ee4cf907eb7a2d653c377d8300b7`, website
  `645216f6609953f327270d253399af8eef11cf12` — без изменений.

До выпуска на Dev работали backend `8dd92497` и master-app `6734eeb1`
(чужой выпуск `smallbugs-dev-20261009`), CRM `20724d99`, БД `0269_primary_accounts`.
Миграция `0269 → 0270`: копия `backups/payroll-controls-dev-20261009-before-0270.dump`
проверена `pg_restore`, 18 assertions, 5 снимков истории совпали, счётчики без
изменений, кроме `payroll_audit` +2 (`default_reset`). Переключатель «Ручные
назначения на текущий месяц» выключен (записей 0), месячных назначений 0.
Сохранены `YCLIENTS_READ_ONLY=true`, `PLATFORM_ID_ENABLED=true`, строгая
CRM-сессия, вход разработчика, фото-подтверждения и лимит памяти postgres 1600m.
Таблица октября на 0270 (один последовательный read-only замер) — 6,8 с,
одна строка — 4,9 с; остаток ускорения — `_MONTHS_SQL` (предложение 0271 не
измерено и не выпущено). Проверены только миграция БД и узкие сценарии по
поручению; Prod не менялся.
Скорость двум названным владельцем мастерам включена постоянной настройкой
(аудит, без выплат; сумма 0 ₽ — нет утверждённых услуг/нормативов). У 174 из
187 мастеров нет закрытых смен за сентябрь, поэтому ГМ октября «не
определено» и строки неполные — вопрос Codex открыт.

09.10.2026 11:56 МСК, выпуск `smallbugs-dev-20261009`: на Dev доставлены исправления
[SUM-225](https://summy.youtrack.cloud/issue/SUM-225),
[SUM-226](https://summy.youtrack.cloud/issue/SUM-226) и
[SUM-227](https://summy.youtrack.cloud/issue/SUM-227). В том же backend по выбору
владельца доставлен и [SUM-229](https://summy.youtrack.cloud/issue/SUM-229).
Работают:
- backend `8dd92497f02c8ce8d1a102238b5236ab9783267c`, БД `0269_primary_accounts`,
  миграций нет;
- master-app `6734eeb1cb9eda39773b48501af4e680e2d93085`;
- CRM `20724d99074f589d8c03ca13c834056ed1241e43` (выпуск
  `primary-accounts-crm-20261008`), client-app `d96822cf`, website `645216f6` —
  без изменений.

VERSION совпадает с OCI revision и `test`. api healthy; api, sync и bff — running,
RestartCount 0. `YCLIENTS_READ_ONLY=true` у api и sync. Включённые флаги api
сохранены: `PLATFORM_ID_ENABLED`, `PHOTO_PROOF_V2_ENABLED`, `TEST_DEVELOPER_ENABLED`.
Лимит памяти postgres 1600m на месте. Сценарии не проверялись. Подробности — в
[CHANGELOG](../CHANGELOG.md).

08.10.2026 21:01 МСК: исправлен баг
[SUM-228](https://summy.youtrack.cloud/issue/SUM-228). Работают:
- backend `0c7b9fb661c1c72e70b4270e61069a58da7a0e1d` (выпуск
  `payroll-summary-fix-20261008`, БД `0268_payroll_view_plan_barriers`);
- CRM `612af8202b94bd4caefdadec72cad6e4e5d226ae` (выпуск
  `payroll-summary-fix-20261008b`);
- master-app `d7f27f3f`, client-app `d96822cf`, website `645216f6` — без
  изменений.

VERSION совпадает с OCI revision образов и с `test`. `YCLIENTS_READ_ONLY=true`
сохранён у api и sync.

Перед миграцией снята копия `backups/payroll-summary-fix-20261008-before-0268.dump`.
После миграции:
- 8 SQL assertions прошли;
- 5 снимков истории совпали;
- счётчики 20 таблиц не изменились.

Контейнеру postgres поставлен лимит памяти 1600m без свопа (поток
стабилизации Dev, 20:32).

Проверено адресно:
- `/api/payroll-salary?period=2026-09` — 200 за 10,5 с, 187 строк;
- пик памяти postgres — 280 МиБ;
- планирование `contract_v1_earnings_sources` — 78 МБ.

Повторное зависание 19:23–20:26 вызвали запросы зарплаты на 0267: сервер
восстановился без перезагрузки, когда глобальный OOM убил процесс postgres.

08.10.2026 19:09 МСК: `all-test-dev-20261008b` — по прямому поручению владельца
«Залей на дев все камиты из теста» доставлен весь `test`. Работают backend
`1dbf932d6129b6007efff3a0f5217ad4b90e1402`, CRM
`d9fd36ddb439270873b5ce423913eacbfa12b7e0`, master-app
`d7f27f3f3d11e2aecdc0909b600d5f452492d1d0`, client-app
`d96822cf6624ee4cf907eb7a2d653c377d8300b7`, website
`645216f6609953f327270d253399af8eef11cf12` (не менялся). В 19:10 все пять
свежих `test` совпали с VERSION Dev и OCI revision образов. Контейнеры
running, RestartCount 0, API и CRM healthy; каждый шаг доставки завершился с
exit 0. БД `0264_card_payments → 0267_studio_closure_hours_push` (0265 единая
зарплата, 0266 и 0267 «Закрыть график» и push мастеру). Перед миграцией
снята копия `backups/all-test-dev-20261008b-before-0267.dump`
(52 537 915 байт, проверена `pg_restore`). После миграции:
- 25 SQL assertions 0265–0267 прошли;
- 5 снимков истории денег и закрытий совпали до и после;
- счётчики строк 20 контрольных таблиц не изменились;
- невалидных индексов 0.

Сохранены `YCLIENTS_READ_ONLY=true` у api и sync, строгая CRM-сессия, вход
разработчика, фото-подтверждения и личность approver. Ключа VAPID на Dev нет,
поэтому push мастеру выключен, а «Закрыть график» вернёт `blocked_read_only`.
Перед сборкой очищен build cache старше 12 ч и 1 ч и apt-кэш; свободно
2,2 ГБ. Первая попытка `all-test-dev-20261008` остановилась на сборке CRM
(не хватало импорта иконки, исправлено в `d9fd36dd`) и ничего не
переключила. Проверены только миграции БД; продуктовые тесты не проводились.
Prod не менялся.

08.10.2026 17:49 МСК, снимок только чтение: Dev завис примерно с 16:00:46
(sshd не отдавал баннер, веб не отвечал) и восстановлен перезагрузкой,
которую владелец выполнил в панели Timeweb; загрузка завершилась в 17:43:56.
Причина не установлена: журнал предыдущей загрузки её не называет, ресурсы
в 16:00 были в норме; для разбора нужны метрики и консоль VM Timeweb за
16:00–16:10. Конфигурация сервера не менялась. После загрузки все контейнеры
работают. Корень заполнен на 95 % (свободно 4,3 ГБ). На рабочем ПК
`sing-box` в режиме TUN принимает любое TCP-соединение, поэтому «порт
открыт» с этого ПК не доказывает, что сервер жив.

Работают: backend `dc86ae34c45e238f496bd4573d039e6951f653d2` (выпуск
`tbank-pr89-dev-20261008`, 14:46, БД `0264_card_payments`), CRM
`778ea01b772d32c29a98a0a86122140875917a2a`, master-app
`50d0d756802ae09317990d842780958be30a19c8`, client-app
`7e39c434000fa604b4037d5557f11e4f1e015849`, website
`645216f6609953f327270d253399af8eef11cf12`. Сейчас `test` впереди Dev:
backend `31d1acbe50ccede76c68e8c55397268dd6fb234a` (0265, 0266),
CRM `fc02bb2300592f789fb904334cf85aeb65242e6d`, client-app
`d96822cf6624ee4cf907eb7a2d653c377d8300b7`. На Dev их не выкладывали по
указанию владельца около 17:46: «Всё залейте просто в ветку тест, на дев
пока не надо». Website совпадает с `test`.

08.10.2026 18:01 МСК: закрытие часов мастера студией, сводка и push мастеру
(SUM-203) опубликованы только в `test`: backend
`1dbf932d6129b6007efff3a0f5217ad4b90e1402` (`0267_studio_closure_hours_push`),
CRM `007ebd15382a489b9d9def56cb4daa0a11a10947`, master-app
`d7f27f3f3d11e2aecdc0909b600d5f452492d1d0`. Dev по этой задаче отключён
владельцем; на Dev не развёрнуто, отложенная выкладка не планируется.

08.10.2026 14:17 МСК: `bonuses-tail-dev-20261008` поверх `bonuses-contracts-dev-20261008` — по прямому поручению владельца
персональные бонусы мастеров и весь ещё не доставленный `test`: backend
`058f716a67cd1c45731f0ba7d75c2681445c50fa`, CRM
`778ea01b772d32c29a98a0a86122140875917a2a`. Master-app
`50d0d756802ae09317990d842780958be30a19c8`, client-app
`7e39c434000fa604b4037d5557f11e4f1e015849`, website
`645216f6609953f327270d253399af8eef11cf12` уже совпадали с `test`.
VERSION/OCI/Image IDs подтверждены, все пять свежих `test` совпали с
живым Dev; API/CRM healthy, RestartCount 0. Этапы доставки exit 0.
БД `0263_bonus_policy_function_path` после
`0261 → 0262 → 0263`: три полные копии, все 15 SQL assertions и точные
20 счётчиков до активации; история денежных источников сохранена. Основные
бонусы по 50 ₽, минимум 50 000 ₽ / 180 фактических часов и ручное начисление
любого бонуса без автоподтверждений — с текущего месяца. Все прежние
изменения клиентов, календаря и отчётов включены. Env, строгие сессии,
фото-подтверждения и read-only YClients сохранены. Сборки доставки выполнены;
продуктовые тесты и сценарии начислений не запускались. Prod не менялся.
[Состав, образы, сохранность, восстановление и ограничения](releases/dev-master-bonuses-2026-10-08.md).

08.10.2026 11:01 МСК: `sum115-dev-20261008` — только backend `0a767f09747608efcfdc5b6dc5657db8fdacbdc5` поверх `origin-test-dev-20261007c` (SUM-115, проверка мест при открытии дня выключена по умолчанию). БД `0261` без изменений, API healthy, RestartCount 0; `YCLIENTS_READ_ONLY=true` и `PHOTO_PROOF_V2_ENABLED=true` сохранены. Остальные продукты не менялись. Тесты задачи 65/65; сценарии не проводились.

07.10.2026 22:57 МСК: независимо приняты исправления рекламаций, дежурств и связи со штрафами в установленном `origin-test-dev-20261007c`: backend `ba578c58103d43ee3036880ed3f903f99fb0e23b`, CRM `b2c23dcb729f35c9b1b357ca615b204e5d70b567`, БД `0261_master_arrival_deliveries`. Проверенные `b8215f0`/`802fa87` являются предками этого состава; код процессов и прав, финансовые действия, 91 путь API и 136 схем сохранены. VERSION/OCI revisions/Image IDs/голова БД совпадают, health/readiness 200, строгие сессии и read-only действуют. Восемь штрафов связаны с семью видами рекламаций; camera headers процессов и дежурств проверены на внешнем и внутреннем адресах. Локальные сценарии управляющего/администратора прошли с синтетическим внешним транспортом, реальные начисления ради проверки не делали. Старый собственный кандидат 0260 не переключался: защитная проверка остановила его при обнаружении параллельной поставки. Копия внешней поставки 51 758 480 байт и SHA независимо совпали с квитанцией. [Версии, образы, границы проверки и Prod](releases/production-processes-2026-10-07.md), [SUM-221](https://summy.youtrack.cloud/issue/SUM-221).

07.10.2026 22:23 МСК: `origin-test-dev-20261007c` — весь `origin/test` по прямому поручению владельца, без тестов, с обязательной проверкой миграции. Backend `ba578c58103d43ee3036880ed3f903f99fb0e23b`, CRM `b2c23dcb729f35c9b1b357ca615b204e5d70b567`, master-app `50d0d756802ae09317990d842780958be30a19c8`, client-app `7e39c434000fa604b4037d5557f11e4f1e015849`; website `645216f6609953f327270d253399af8eef11cf12` уже совпадал. prepare/backend/crm/master/client exit 0. БД `0260_penalty_reversal_paid_item` → `0261_master_arrival_deliveries`: дамп `/opt/summy-test/backups/origin-test-dev-20261007c-before-0261.dump` 51 758 480 байт, SHA-256 `a1c9cc58590c2988494341ddfc88c2824c308aaed4e14ada039aee6ef3cd6300`, `pg_restore` прошёл; счётчики 16 таблиц сохранились, таблица и два индекса `master_arrival_deliveries` на месте, строк 0, невалидных индексов 0. `/health` ok с версией backend, пять контейнеров running, RestartCount 0. `YCLIENTS_READ_ONLY=true` в API и sync, поэтому досылка прихода в YClients не запускается; `PHOTO_PROOF_V2_ENABLED=true` сохранён. Перед выпуском с согласия владельца удалены только docker-образы без имени (5,3 ГБ). Незавершённый чужой `process-debug-20261007-dev-final` (остановлен на проверке схемы, не переключался) не затронут. Тесты, HTTP экранов и сценарии не проводились; Prod не менялся.

07.10.2026 17:03 МСК: `crm-visual-dev-20261007` — backend
`fc39b9bf13cd7b6c8efc7241d0b05227c2fb6bde`, CRM
`8d09aa7998b079eb86b55d84bc7a9e7a647fe78b`; prepare/backend/CRM exit 0,
ACTIVE backend 17:02:40, CRM 17:03:23. Снимок 17:04:38 подтвердил совпадение
VERSION/OCI revisions и целевых SHA, API/CRM running/healthy, sync running,
RestartCount 0. БД `0260_penalty_reversal_paid_item` без изменения: миграции
этим выпуском не запускались, `0257 → 0260` относится к предыдущей поставке
SUM-220. Master-app `6d17b1552d8f18baa271ec3575b8b12a3b5faec3`, client-app
`40dd98694485fa0db184ff764e32872a47662340`, website
`645216f6609953f327270d253399af8eef11cf12` и остальные шесть контейнеров
сохранены; свежие env/compose, `PHOTO_PROOF_V2_ENABLED=true` и
`YCLIENTS_READ_ONLY=true` сохранены. Компактные экраны CRM, история заметок
о клиенте, complaint из YClients 1–3, birthday recipients администраторы
и календарь пяти видов — [состав, образы, целостность и откат](releases/dev-crm-visual-fixes-2026-10-07.md).
Необходимые delivery builds выполнены; тесты приложения, проверочные сборки,
HTTP и пользовательские сценарии не проводились. Реальные CRUD, финансовые
операции и ручная отправка PUSH ради проверки не запускались. Prod этой
задачей не менялся.

07.10.2026 17:03 МСК: общая поставка `crm-visual-dev-20261007` включает быстрые переходы по всем звеньям верхней цепочки CRM (`e14ea6c6`), опубликованный и активный SHA `8d09aa7998b079eb86b55d84bc7a9e7a647fe78b`. В этом чате независимо прочитаны VERSION сервера и контейнера, OCI revision, `READY`/`ACTIVE crm` и состояние `adminapp` running/healthy, RestartCount 0. Образ `sha256:579dec4153e3b3dc1a90e7caf9bfea3a52734e0c32230134068c4261c8fe342a`; контейнер `a3cfff64f34b`. Exit codes wrapper общей поставки отдельно не получены. Повторное переключение той же версии не потребовалось. Миграций этой правки нет; БД общего выпуска `0260_penalty_reversal_paid_item`. Откат — сценарий работающего выпуска с его `crm-prev` и `adminapp:pre-crm-visual-dev-20261007`. Тесты и ручные сценарии не проводились. [Контракт переходов](../contracts/crm-navigation.md#переходы-по-цепочке-разделов-07102026), [результат](https://summy.youtrack.cloud/issue/SUM-210).

07.10.2026 16:34 МСК: `sum220-origin-test-20261007` — подтверждён состав
`test` из раздела выше. Backend, CRM, master-app и client-app активированы
штатным `release.py` под общим замком; четыре сборки завершены. БД
`0257_process_map_review_claim` → `0260_penalty_reversal_paid_item` через 0258
и 0259. Перед миграциями сохранён дамп 51 509 171 байт, SHA-256
`8e83aec7829de41079a5721facf8d226fbf6bce41509ffa5bd56245ef53abc94`;
проверка `pg_restore` и повторная сверка SHA-256 прошли. Числа строк 16
контрольных таблиц сохранились, невалидных индексов нет, шесть структурных
проверок миграций прошли. API и CRM healthy, все четыре изменённых контейнера
работают без перезапусков; сайт PM2 online. Замок свободен. Продуктовые тесты,
CI, lint/typecheck, smoke/e2e и живые сценарии Dev не запускались по решению
владельца. Доказательства, остатки и границы —
[SUM-220 7-1112](https://summy.youtrack.cloud/issue/SUM-220?focusedComment=7-1112).
Prod этим выпуском не менялся.

07.10.2026 15:31 МСК: независимая сверка `processes-dev-20261007` — backend
`468da262786b8fca7da4e55a6089dba75dec3dd0`, CRM
`93460c9619fa28003f421bdb4809e79c7ffa7263`, БД
`0257_process_map_review_claim`. Выпуск включил проверенные исправления
рекламаций и дежурств `5094768`/`ba1d9269`; они не переключались повторно и
среда не возвращалась к старой схеме. VERSION/метки образов, health/readiness,
двери CRM и процессов, внутренний master API и настройки камеры подтверждены.
Таблица штрафов: 8 подходящих записей связаны с 7 видами рекламаций.
Локальные адресные проверки этих процессов на текущих потомках: backend
50 passed, CRM 162 passed. Подробности — [SUM-221](https://summy.youtrack.cloud/issue/SUM-221)
и [документ выпуска](releases/production-processes-2026-10-07.md).

07.10.2026 15:19 МСК: `processes-dev-20261007` — backend `468da262786b8fca7da4e55a6089dba75dec3dd0`, CRM `93460c9619fa28003f421bdb4809e79c7ffa7263`; prepare/backend/crm exit 0, БД `0254 → 0257`. API/CRM healthy, sync running, рестартов 0; проверены gateway-вход и чтение процессов/отчётов уборки владельцем, управляющим, администратором. Локальный планировщик включён при сохранённом `YCLIENTS_READ_ONLY=true`, внешний push выключен. Копия БД проверена, счётчики сохранены. master-app/client-app/website прежние, Prod этой задачей не менялся. 177 серверных + отдельные миграционные/каталоговые проверки, 255 UI; границы и полные SHA — [выпуск](releases/dev-processes-2026-10-07.md), [матрица 25 видов](reviews/crm-processes-2026-10-07.md).

07.10.2026 14:59 МСК: `knowledge-ui-20261007` — CRM `74806fd06c77f0d57d671105680a8d3af02ad680` (единый список базы знаний, верхняя вкладка бизнес-решений, Markdown текста и истории); prepare/crm exit 0. VERSION и метка образа совпадают с SHA, образ `sha256:a079d49f4c85056892f85887f62e5c37a2e973f91735da5df965b03f0b766112`; `adminapp` running/healthy, RestartCount 0. БД `0254_complaint_penalty_catalog` без изменений. При независимом чтении 15:00 МСК остальные VERSION: backend `9dfe5317977b5eb449de0166db283a891547a3b2`, master-app `ed75c38b151a0572eea28c8b34577b1220f93771`, client-app `e4b0ecb647b908b5f76209c1296e7b223b24cf5d`, website `645216f6609953f327270d253399af8eef11cf12`; они этой задачей не обновлялись. Тесты не проводились; Prod этой задачей не менялся. Результат — [SUM-210](https://summy.youtrack.cloud/issue/SUM-210), изменение — [CHANGELOG](../CHANGELOG.md#07102026--crm-единый-список-базы-знаний-и-markdown).

07.10.2026 12:43 МСК: `sum220-all-test-dev-20261007` — состав `test` SUM-220 после публикации штрафного пакета, по прямому поручению владельца ([SUM-220 7-1096](https://summy.youtrack.cloud/issue/SUM-220?focusedComment=7-1096)): prepare, backend и crm exit 0, БД доведена до `0254_complaint_penalty_catalog`, перед миграцией сохранён полный дамп. Штатный read-only снимок 12:52:49 МСК: backend VERSION `9dfe5317977b5eb449de0166db283a891547a3b2`, CRM VERSION `3b0163cea78e2b6c482271dd9bd32c3211950572`, master-app `ed75c38b151a0572eea28c8b34577b1220f93771`, client-app `e4b0ecb647b908b5f76209c1296e7b223b24cf5d`, website `645216f6609953f327270d253399af8eef11cf12`; БД `0254_complaint_penalty_catalog`; выпуск ACTIVE, последняя запись 12:43:34 МСК, замок свободен; adminapp и API healthy, sync, master, client, БД и minio запущены. Снимок подтверждает версии, ревизию БД и состояние контейнеров; тесты и прохождение карточек не проводились. CRM позже заменена `knowledge-ui-20261007` (выше).

06.10.2026 18:57: `sfx15-dev-20261006` — backend `965d1c22ad06fe47678452ac74d227c260a3b6a5`, БД `0245` → `0247_document_folders` (копия проверена `pg_restore`; `process_types` +1 — сид вида «сообщение о поломке»); CRM `b4c264891451af2ac5d533834165f0419ea48cee` (`sfx14`); master-app `af33ca8`, client-app `e4b0ecb`, website `645216f`; exit 0. SUM-220 — доставка на Dev по готовности, Prod на паузе. Проверены только миграции БД.

06.10.2026 17:18: `sfx6-dev-20261006` — backend `5be05eba29b85f6cd70b20bcf9771683fdd73adb` (оптимизация БД DB1/DB2); остальные продукты как в `sfx5b`; БД `0233` → `0235_client_views_cte_materialization`, копия проверена `pg_restore`; exit 0. Проверены только миграции БД.

06.10.2026 17:08: `sfx5b-dev-20261006` — backend `55ea44341f9706df31828f60be534942aec7538d`, CRM `50c7be6e1a8bfdee1bf8fc18b03078b316df354d`, master-app `af33ca88ae58fdb93cc151c19f89ad755fb14642`, client-app `e4b0ecb`, website `645216f`; БД `0227` → `0233_staff_birthday_skipped_tone`, копия до миграции проверена `pg_restore`; exit 0. Prod R1006 на паузе ([SUM-219](https://summy.youtrack.cloud/issue/SUM-219)). Проверены только миграции БД.

06.10.2026 12:49: `sfx4-dev-20261006` — backend `402d6aa06550dd29c0d604383495e34402b598c7`, CRM `c59a9eacd9c79ded132f768157ed9a9a1d1d6b1c` (UX1–UX3), client-app `e4b0ecb647b908b5f76209c1296e7b223b24cf5d`; master-app `4c7e4f6`, website `645216f` без изменений; БД `0227` без изменений; exit 0. Не входит в R1006. Кассовые транзакции YClients 481570 на Dev — с 2023-07-01 (дозагрузка 06.10). Тесты не проводились.

06.10.2026 11:45: `sfx2-dev-20261006` — backend `3abc1bbe81c13a8da82cbb5e89c47fa695465f14` (исправления подготовки Prod и гарантированный минимум), CRM `29d1e5ec64d040476d610103fcbd0763e2a91c31`, master-app `9ce7716fac64df12f67485bffabe8a6194d19c47`, client-app `cf102a88b90bffa63423bf91ac5ce0afcf9a4988`; website `645216f` без изменений; БД `0226` → `0227_guarantee_after_month_end`, копия до миграции проверена `pg_restore`; exit 0. Кандидат Prod R1006 ([SUM-219](https://summy.youtrack.cloud/issue/SUM-219)). Проверены только миграции БД.

06.10.2026 10:07: `sfx-dev-20261006` — backend `96d2059492fbfdd240667e41c50cf503304aad2f` (импорт дат рождения из закрытого реестра), master-app `b52fe132ab451edfae7791dff35a50803e5159bb` и client-app `ff726b7a90c1d5e4e791a7ac7ca8915cdb0ce66b` (вход разработчика как в CRM), website `645216f6609953f327270d253399af8eef11cf12`; CRM `65d80f61cda19339c3a7cdd4a41f372166092821` без изменений; БД `0226_hr_documents` без изменений; exit 0. Даты рождения на Dev: 15 загружено 06.10.2026 (added 15, повторная сверка exists 15), 2 ждут года. Тесты не проводились.

06.10.2026 00:39: `pool22-dev-20261006` — только CRM `65d80f61cda19339c3a7cdd4a41f372166092821` (реестры кадровых заявок на `/staff`, в бухгалтерии и карточке сотрудника — за кнопкой, в боковой панели); backend `e18d8ad`, master-app `84b6b48`, client-app `5f83710` без изменений; БД `0226`; exit 0.

06.10.2026 00:23: `pool21-dev-20261006` — backend `e18d8ad76f6d1ccf68fa95b31f6ec802c1c9f0c7` (предпросмотр отмены, поздние отмены в выключенном расчёте предоплаты), client-app `5f83710ac488ba4c146e32c3e97e505be206161f` (предупреждение при отмене, честные состояния, типы заказа); CRM `78c4fc3`, master-app `84b6b48`; БД `0226` без изменений; exit 0.

06.10.2026 00:07: `pool20-dev-20261005` — backend `f45f5ea`, CRM `78c4fc3`, master-app `84b6b48` (волна crmmanager); БД `0226` без изменений; exit 0. `CLIENT_PREPAYMENT_ENABLED_FROM` на Dev не задан — правило предоплаты выключено.

05.10.2026 23:32: `pool19-dev-20261005` — backend `eca222d280f13141ee74b04e411ae3392b49e8ed`, CRM `ea6404f491c675becee62b9f350f693286dd9f98`, client-app `a57ceb17be90115f41cf3650a412aaf2d93e4590` (исправления ревью crmfinish, листание шаблонов, товары в карточке клиента, итоги сводки по направлениям); master-app `1aee0c3`; БД `0226` без изменений; exit 0.

05.10.2026 23:23: `pool18-dev-20261005` — backend `84e391d`, CRM `7bd1d3a` (период сводки, crmfollowup), master-app `1aee0c3` (документ к апелляции), client-app `15432fe` (никнейм); БД `0226` без изменений; exit 0. CRM и master-app включают чужие коммиты тестов SUM-218 (`3f1c82de`, `c04cbd1`).

05.10.2026 23:16: `pool17-dev-20261005` — backend `ad5eeb5`, CRM `768e215`, master-app `a73a10c` (кадровые документы, «Мои документы», данные для должности); БД `0225` → `0226_hr_documents`, копия `pool17-dev-20261005-before-0226.dump`; exit 0.

05.10.2026 23:02: `pool16-dev-20261005` — backend `371c2fe`, CRM `4fca5b2`, master-app `5c1b55a` (волна crmnext); БД `0223` → `0225_puzzle_nicknames`; exit 0. Тесты во всех выпусках не проводились; website `GRADE2+f6dd7b8` прежний, `YCLIENTS_READ_ONLY=true`.

05.10.2026 22:48: `pool15-dev-20261005` — backend `f1009cd80ed61e347f637376c0b7821258a18810` (ушедший мастер: 403 `master_departed`, экран остатка `/v1/master/departure`), master-app `612c7714ea54ea01d8071786c861bd57c8556b46` (экран ушедшего мастера; включает `59da353` из `s194s2-dev-20261005`); БД `0223` без изменений; prepare/backend/master exit 0. `pool14` — сборка master-app не прошла, не активирован.

05.10.2026 22:34: `pool13-dev-20261005` — backend `0e51e03007d3bfd72a33b62d22e7145207540e5e`, CRM `7af9b651e2ec31e18e0b65b01371989ee0a2e5c3` (дата ухода, окна закрыты с момента ухода); БД `0222` → `0223_dismissal_departure`, копия `pool13-dev-20261005-before-0223.dump`; exit 0.

05.10.2026 22:21: `pool12-dev-20261005` — backend `36155e263b7e92b008185653fbb4866d24ce4c45`, CRM `76780ab602def2eac945bc1954bf86f4b710655c` (процесс «Уход мастера: обзвон клиентов»); БД `0221` → `0222_master_departure_process` (+1 вид процесса), копия `pool12-dev-20261005-before-0222.dump`; exit 0.

05.10.2026 22:09: `pool11-dev-20261005` — backend `1713f0197a5f9ea5c59d42e0a4d6f4b044020ad9`, CRM `10d3068ab3f7b9d8901e78787732b61bd00c41f1` (файлы бухгалтера к расхождению кассы); БД `0220` → `0221_cash_discrepancy_files`, копия `pool11-dev-20261005-before-0221.dump`; exit 0. Во всех: client-app `d29e946`, website `GRADE2+f6dd7b8` прежние, `YCLIENTS_READ_ONLY=true`, тесты не проводились.

05.10.2026 21:54: `pool10-dev-20261005` — backend `4a1f876e310d64b5bb340924a9723692e8e3c5d9` («Активность» без часов, закрытых самим мастером, SUM-96 № 11); БД `0219_penalty_type_draft` → `0220_activity_master_closed_hours`, копия `pool10-dev-20261005-before-0220.dump` (sha256 `9e21ce96…`); prepare/backend exit 0; CRM `0cd59f6`, client-app `d29e946`, master-app `fdd585a`, website `GRADE2+f6dd7b8` прежние.

05.10.2026 21:43: `pool9-dev-20261005` — backend `ddcf805100930b40f197492906a8fe31a598cb23`, CRM `0cd59f6774c904e75e3674c2abc00097990af876`, client-app `d29e94698cc31eae25697ff46bad4041c3e19697` (Э5 — заканчивающиеся абонементы и предложения, № 62; P05 — черновик вида штрафа и обжалование после выплаты, № 61); БД `0217_loyalty_discount_mode` → `0219_penalty_type_draft` (через `0218_client_abonement_offers`), копия `pool9-dev-20261005-before-0219.dump` (sha256 `b5f105f5…`); prepare/backend/crm/client exit 0. Master-app `fdd585a`, website `GRADE2+f6dd7b8` прежние, `YCLIENTS_READ_ONLY=true`.

05.10.2026 21:33: `pool8-dev-20261005` — backend `5e0d49afa04025eb586091c41390ae2f676da0ff`, CRM `787df070df28e42cb10418edccf389500c4d1d53` (пять малых правок уведомлений, медкнижки и цикла клиента); БД `0217` без изменений; prepare/backend/crm exit 0.

05.10.2026 21:29: `pool7-dev-20261005` — backend `daadbf5103937317922bca5def77e98eef84b881`, CRM `48d87c86265c7ab7ea7bbae4da582306046443c1`, client-app `5bf582afe57f154d48d3730fd4c4d23f499cfaf6` (режим «скидка и бонусы», SUM-96 № 8; режим не включался); БД `0216` → `0217_loyalty_discount_mode`, копия `pool7-dev-20261005-before-0217.dump` (sha256 `2e1e97f8…`); prepare/backend/crm/client exit 0.

05.10.2026 21:09: `pool6-dev-20261005` — backend `3eb30a4a98396040564b8a481ed7b1d88c69fbea`, CRM `bdf0bf9a197e0995aea5a4fdb81d1c8d2d746e39` (вторая волна CRM-потоков: медкнижка, цикл клиента, покрытие, вложения процессов, закупки № 33, склад № 34, доставка № 35, уведомления № 36, SUM-135); БД `0211` → `0216_delivery_order_changes`, копия `pool6-dev-20261005-before-0216.dump` (sha256 `28ae1ae8…`); prepare/backend/crm exit 0. `pool4`/`pool5` — сборка CRM не прошла, не активированы, Dev не менялся. Тесты во всех выпусках не проводились.

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
поставлен неактивно, клиентский вход и клиентские SMS не включены; включение ждёт
решения владельца о секретах ([SUM-192](https://summy.youtrack.cloud/issue/SUM-192)).
Статусы отдельных контрактов — в [контрактах](../contracts/README.md).
