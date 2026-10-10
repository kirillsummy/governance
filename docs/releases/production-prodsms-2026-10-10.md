# Production PRODSMS — 10.10.2026

**Выпущено на Prod и возвращено на общий Dev.** Prod проверен 10.10.2026 07:56:55 МСК; обязательный возврат на Dev — 08:04:06 МСК. Production/test refs и теги сверены exact non-force readback. Full CI, сборки, изолированный runtime141/141, согласованная копия БД и native prepare/activate/verify приняты.

Карточка: [SUM-232](https://summy.youtrack.cloud/issue/SUM-232). Владелец поручил перенести изменения Ильи по SMS для CRM и приложения мастера, сохранив оба способа входа. Исполнитель — Codex. Основа — [R1009](production-r1009-2026-10-09.md) от 09.10.2026 17:40 МСК; прочитанная Governance `main` — `90b3f732369476d57d7edc566ef2ab772d1edc99`.

## Состав и поведение

CRM и приложение мастера показывают явные варианты «По номеру телефона» и «По логину и паролю». Прежние формы, подписанные сессии, cookie и сроки действия сохраняются для действующих сотрудников, включая сотрудника с привязанным SUMMY ID. При временном 404 ID API старый вход мастера остаётся доступен. Регистрация, приглашения и восстановление используют SMS/ID сценарии; создание аккаунта само по себе не выдаёт рабочих прав.

Backend проверяет текущий доступ, роль, действующего сотрудника и привязку. Блокировка, увольнение, отзыв привязки, удаление допуска и несовпадение старых claims продолжают запрещать доступ. CRM передаёт токен сессии во всех затронутых адаптерах.

Подготовка обязательного CI закрепила действующие контракты: наличные команды только управляющему; сверка операторских процессов только управляющему/владельцу; отмена штрафа смены с сохранением области автора; снятие фотографии только владельцем. В CRM исправлены повторное чтение медиатеки и фильтра и очистка ошибки после успешного ответа. Исправления типов/стиля, снимка схемы и fixtures не вводят новых денежных правил; отрицательные проверки доступа сохраняются. Полный продуктовый diff — в PR ниже.

| Продукт | Prod R1009 до выпуска | Exact кандидат | Production-ветка / PR |
|---|---|---|---|
| backend API + sync | `4af883af929580b7d7623ffdd7c93131f0a321f4` | `1c00e5f2c9aa6893dc375547524cd067ec3652f7` | `dev` / [PR90](https://github.com/kirillsummy/backend/pull/90) |
| CRM | `72c77d70366fb3304dc3a6da4f4d4095fc124b34` | `fcbe4a1cac3283ca646f44d1e9d4238482a8c0ee` | `main` / [PR189](https://github.com/kirillsummy/crm/pull/189) |
| master-app | `79db16f26f2218c0f58c0cacd4b9cf86bb8d380b` | `6c916e930c6ee106c86bd208ed15ecde658c5d8b` | `feature/react-client` / [PR105](https://github.com/kirillsummy/master-app/pull/105) |

Client-app сохраняет код/образ R1009 `d96822cf6624ee4cf907eb7a2d653c377d8300b7`; существующий клиентский SMS путь обслуживает общий backend. Website сохраняет `f6dd7b8d5e7cc211b953062beb42028272d777f2`. Их новый frontend в пакет не входит. Analytics, Events/дни рождения и схема общего Dev 0277 в Prod-пакет не переносятся.

## Подтверждённые проверки exact SHA

| Продукт | Полный обязательный GitHub CI | Фактический результат |
|---|---|---|
| backend `1c00e5f2…` | [run38011688325](https://github.com/kirillsummy/backend/actions/runs/38011688325), completed/success | MSK: 2867 passed, 1 прежний skipped; UTC money: 274 passed; failed/errors 0. API/BFF контракт, Ruff, mypy, vulture, deptry, fresh Alembic до0271, снимок схемы/VIEW и verify.sql — success |
| CRM `fcbe4a1c…` | [run38004246750](https://github.com/kirillsummy/crm/actions/runs/38004246750), completed/success | 2379 passed, 1 прежний skipped, 184 файла; lint 0 errors/4 warnings; обязательные contract/lint/type/knip/build — success |
| master `6c916e93…` | [run38004167489](https://github.com/kirillsummy/master-app/actions/runs/38004167489), completed/success | 346 web + 51 BFF passed; обязательные typecheck/palette/knip/build — success |

GitHub checkout — синтетический merge; деревья проверенных checkout совпали с exact кандидатами: backend checkout `c8122249f52be0cee1ea6b3ba516fdeb716c62f8` / tree `9d8d8f941d3e13858c0db06eb5936f52027e810d`; CRM checkout `ae9ab3755fcb55fb0e6bb572014bb84c928a0e53` / tree `9e123d53d3f4c66036f448e9a9fc7178565e816f`; master checkout `5f5798609d32e685663d49b12565e609c55ff669` / tree `4a4c56ca28583dabf005a9e8ba86101a342e10ab`.

Дополнительно exact backend: локально 144 MSK и 43 UTC earnings passed; fast/schema/verify/config exit0. Exact master: локальные palette/knip и сборка с `VITE_PLATFORM_ID_ENABLED=true` exit0. Исходные квитанции `BACKEND-1c00e5f2-final-ci.json`, `CRM-fcbe-GitHubCI.json`, `MASTER-6c916e9-final-ci.json` сохраняются неизменными.

## Фактическая упаковка e и сохранённые неудачные попытки

Новые отдельные каталоги — `prodsms-codex-20261010e` и `prodsms-preview-codex-20261010e`. Продуктовые SHA, исходные Git-архивы, Dockerfile, CI и публичные build args остались прежними. Изменения e исправляют упаковку и способ проверки собственного изолированного preview.

Import b завершился native exit1 из-за смешения native OCI manifest ID и configuration digest. Проверка теперь связывает оба самостоятельных значения, индекс/manifest, сжатые слои и распакованные DiffID. Activate c завершился native exit1 с `EACCES scandir /app/public/brand`: извлечение под umask077 создало внутренние каталоги0700. Сборки d/e проверяют внутренние каталоги0755 и файлы0644/0755, UID владельца и отсутствие ссылок; внешний рабочий каталог остаётся приватным0700.

Import d прошёл native exit0, invocation `72023df3fb5444959d9dd6cb0d32fc4f`. Activate d завершился native exit1 10.10.2026 03:46:14 UTC, invocation `6dd4a5bcfeb546d2b90d588944529122`, причина `preview health/version backend`. Docker29 не опубликовал запрошенные loopback-порты внутренней сети. Дополнительная собственная recovery-проверка d, invocation `3648f1f4aaee495da69c5ba2ba4b6a7a`, также завершилась native exit1. Она выявила CRM health `version=0.1.0` без SHA: сборка записывала `/app/VERSION` как один логический `PRODSMS+sha`, хотя CRM читает поля `version` и `sha`. Эти результаты сохраняются как неудачные; runtime141/export d не объявляются успешными.

Упаковка e записывает точные байты CRM `/app/VERSION`: `version=PRODSMS-20261010+<fullSHA>\nsha=<fullSHA>\n`. Логический VERSION ответа остаётся `PRODSMS-20261010+<fullSHA>`. Backend сохраняет `<fullSHA>\n`; master проверяется по runtime `APP_VERSION`, OCI/source/build proof. Формат контекста, его SHA256, байты встроенного VERSION, import и живой source VERSION связаны одной строгой проверкой; исходные VERSION для rollback восстанавливаются побайтно.

Пять фиксированных health/ready/login GET собственного preview e выполняются через его API-контейнер к внутренним alias. Проверяются точные четыре контейнера/образа, приватный Compose, project/network/alias/volume, отсутствие опубликованных портов и неизменность общего Dev до/после. Внешние URL, redirect, proxy и внешние SMS-реквизиты исключены; native ошибки не превращаются в успех. Полный runtime worker141 не менялся, кроме собственного scope literal.

Четыре собственных контейнера неудачного d остановлены 10.10.2026 04:15:11 UTC (07:15:11 МСК), native exit0. Общий Dev не изменён; volume, БД, образы, файлы и failure history сохранены. SHA256 окончательной failure-квитанции recovery d — `b1d33e4a89d23e593747761ceec46bf2b8d690aa27f87edd0a7ff9c522b7b381`. Обезличенная квитанция quiescence: отдельный SHA safe receipt остановки в этот документ не перенесён; исходное native0 подтверждение и сохранённая история остаются у выпуска.

Три native-сборки e прошли `exit=0/process_exit=0`: backend завершён 04:16:01 UTC, CRM04:17:57 UTC, master04:18:04 UTC. Общая сборка — 10.10.2026 04:15:49.926608–04:18:05.691178 UTC (07:15:49–07:18:05 МСК), invocation `d3a1b392769b4cca8e0c37e98f1ca833`. Строгий collector завершился native exit0 и перенёс исходную квитанцию и три архива без изменения байтов.

Фактические локальные проверки e: 50 unit guard-тестов — OK, 14.505с; 12 проверок целостности kit — exit0; разбор пяти PowerShell helpers — 0 ошибок; `--finalize` — native exit0. Сюда входят дополнительные отрицательные проверки канонического CRM VERSION и фиксированного внутреннего HTTP. Проверка упаковки/guards и отдельная завершённая runtime-приёмка141 учитываются раздельно.

| Доказательство e | SHA256 |
|---|---|
| Исходный build manifest | `7059c04cfbcb07396264d966320abf944252dd9e91c931fab1ddc01df020aa1f` |
| Helper фактической native-сборки | `f4da147e59439f2d91c328b8650b36bdc146368540fbafc01f54a83a628618c1` |
| Исходная квитанция трёх сборок | `0b5ba8ae1dc046980f2cf3353002a2f27ae76d8c4f7886f6b7fbb581e00ac998` |
| Собственный build job | `e3533a586746ae48b3ff355ca57a82f35f85ff2916a623030eae916a624cf988` |
| Итоговый preview manifest | `53c8a690eb7d47482866677e6442f74de2600be3350412b7af024697d644c730` |
| Source inventory, все25 файлов | `f121dafe4ccf817fd7abf7278f97e1202c0b693feedaee31054fed8b14251403` |

| Продукт | Фактический prebuilt тег e | Native OCI image ID | Configuration digest | Размер / SHA256 prebuilt архива |
|---|---|---|---|---|
| backend | `summy-backend:prodsms-codex-20261010e-1c00e5f2c9aa` | `sha256:5045db8e9ff1b0e8892afa0975f39235ec1968e055193b850a5d2eb56cefd494` | `sha256:13508baea1800cabee7f90159678774624e74079acde6e4ea1680847389aaed4` | 111704064 байт / `bdd45d1aeb84e6d3035000ad3c3addcadd47d457772a47fd28d83ce9ac4b4016` |
| CRM | `summy-crm:prodsms-codex-20261010e-fcbe4a1cac32` | `sha256:1ad92f8aa6cd8a4fe4d0fba5e76835b1b28ce32bdf1a215571e98431ae6baf8a` | `sha256:e6afddcca64b3e6bf85d18ea5d69a2171282ae58e54facb94b7360bde7743a42` | 78191616 байт / `396e7b1be344a02a25ef94df39637d47eee7f7b0ba902f2eda1ea6ea49c92234` |
| master | `summy-master:prodsms-codex-20261010e-6c916e930c6e` | `sha256:400a5339ab0f57a3a2fec8ea44bd522ac02cf5b67af07b7746a313a8f92815d7` | `sha256:d101f8cc5055af3bd1f53b723c230d36eff0dbbe42b821928370a6ff6eb87117` | 64129536 байт / `2d29b68324a02eb39d15dc849720b1047a19c313254791e0a573cb18dccb951e` |

Это входные prebuilt архивы. Фактический Dev export может иметь другой SHA256 при прежних native/config identities. Prod связывается с принятыми runtime141 и actual Dev-export байтами. SHA256 канонического CRM VERSION — `cb401ce567c4122784a23c218b87aa96bf4d559ae4984739c78efdc22f671622`.

## Изолированный Dev preview e — принят

Перенос17 файлов завершён native exit0 с remote hash audit. Шесть неизменных source/CI файлов скопированы из прежнего b после строгой проверки; три новых e образа, пять helpers, manifest и две подлинные e build proofs переданы заново. Download12 файлов (девять safe proofs/helpers и три actual export архива) завершён native exit0 с сверкой байтов. Локальный Prod finalizer завершён native exit0, manifestSHA256 `b3b8787ce59584740ab35110f7cbb6a1ecd391d58dbc6654b4f8146dad3c9cca`. Передача24 файлов Prod package e завершена native exit0 с сверкой фактических байтов.

Собственный синтетический стек использует DB0271, stand SMS и пустые внешние реквизиты. Общий DevDB0277 сохранился. Фактические фазы e:

- Import: native exit0, 10.10.2026 04:26:05UTC (07:26:05МСК), invocation `6e60da352a474447959ef15c2127fbae`.
- Activate: native exit0, 04:27:09UTC (07:27:09МСК), invocation `a2ef5e535de04221b0b10b835199e5a8`; ready=true, DB0271, точные product IDs/VERSION.
- Runtime: 141 passed, failed0, native exit0, завершён 04:28:47.698810UTC (07:28:47МСК); invocation `d6d692cfeabf4f5288f31b319af7f8c4`, run UUID `f2841a12-f5d3-4df2-901a-e50366567d00`, receiptSHA `4d5a2655904a988ecbe8313b32b9617ac041d603bae0b3784da290aad8eec814`.
- Integrity: stand SMS, external_credentials_present=false, shared_containers_unchanged=true, DB0271; frozen verificationSHA `7559ef2bf09f82adff541111ac8ded3b61dc1bb7a56188eb47c5090ab95e4da6`.
- Export: native exit0, 04:30:03UTC (07:30:03МСК), invocation `f3297101108c4636a611f7e9613bbe44`; artifact receiptSHA `de229bdf608fc38e066c3ac5bc2c616c168b88ba9e7fc5bfd35382e8300c6768`.

Actual финальный Prod manifest связывает ровно восемь frozen acceptance references:

| Reference | Путь внутри Prod package | SHA256 |
|---|---|---|
| receipt | `check-receipts/runtime/runtime-auth.safe.json` | `4d5a2655904a988ecbe8313b32b9617ac041d603bae0b3784da290aad8eec814` |
| started | `check-receipts/runtime/runtime-auth.started.safe.json` | `ed49a8eabf575b497087376103fe428bcebe28dff819d551c78158de2ce7f907` |
| verification | `check-receipts/runtime/runtime-verification.safe.json` | `7559ef2bf09f82adff541111ac8ded3b61dc1bb7a56188eb47c5090ab95e4da6` |
| preview_manifest | `check-receipts/runtime/preview-manifest.json` | `53c8a690eb7d47482866677e6442f74de2600be3350412b7af024697d644c730` |
| wrapper | `check-receipts/runtime/runtime_auth.py` | `f412b6c63c481880170db5786896570e422368826a26c6319e900c45d6ebab28` |
| worker | `check-receipts/runtime/runtime_auth_worker.py` | `d788f7da8caae16f8c0e767db339728ddccc16f54ef7838d29c0d0da13fe6c03` |
| build_manifest | `check-receipts/runtime/local-build-manifest.original.json` | `7059c04cfbcb07396264d966320abf944252dd9e91c931fab1ddc01df020aa1f` |
| build_receipt | `check-receipts/runtime/local-images.original.safe.json` | `0b5ba8ae1dc046980f2cf3353002a2f27ae76d8c4f7886f6b7fbb581e00ac998` |

По сообщению владельца, Илья проверил реальные SMS на Dev. Это человеческое свидетельство. Релизный preview использует stand SMS; ограничения `real_sms_executed=false`, `external_login_executed=false`, `crm_browser_secure_cookie_verified=false` сохраняются в отчёте. Зелёная синтетическая приёмка не подтверждает отправку внешнего SMS или secure-cookie сценарий реального браузера.

| Продукт | Живой Dev native/config ID и VERSION | Actual Dev-export bytes / SHA256 |
|---|---|---|
| backend | native `5045db8e…`, config `13508bae…`; VERSION exact `1c00e5f2c9aa6893dc375547524cd067ec3652f7` | 111703552 байт / `035d25d4787641e7bbda204f5a66e500961c3e64c867f71412a127df4b554ded` |
| CRM | native `1ad92f8a…`, config `e6afddcc…`; health VERSION `PRODSMS-20261010+fcbe4a1cac3283ca646f44d1e9d4238482a8c0ee` | 78191104 байт / `e7111b7e137fc5ef46a7c1fbaf4ea341ac2a322c3c4341eab733ad87f14a4fee` |
| master | native `400a5339…`, config `d101f8cc…`; APP_VERSION `PRODSMS-20261010+6c916e930c6ee106c86bd208ed15ecde658c5d8b` | 64129024 байт / `a451ca125b3015b8c98cd1dac184140a6c49773bebaafebaadf4c2f4f6313f14` |

## Фактическое включение Prod e2 — проверено

Prod verify завершён 10.10.2026 **04:56:55.573998 UTC / 07:56:55 МСК**; native job завершён 04:56:56.535733 UTC. Схема **0271_payroll_threshold_versions → 0271_payroll_threshold_versions** сохранена. DDL/upgrade/downgrade не запускались; образы на Prod заново не собирались.

Первая Prod prepare e завершилась native exit1 10.10.2026 04:38:25.163240 UTC (07:38:25 МСК), invocation `b7966fe17b994618a9f5e0253debc56b`, MainPID0. `compose-resolve` неверно разрешил относительный master env_file из родительского каталога release helper вместо каталога исходного compose. На этой попытке продукты остались exact R1009; prepared/activate/verify success не было. Первая failure evidence и журналы сохранены; её полный safe receipt hash: original failed prepare job SHA256 `07df30b252b707143add2bfc8f689da5871555cda65a33a833c46ec5e53cda13`, проверенный guard нового e2 перед каждой фазой.

Успешный отдельный retry e2 размещён в `/root/releases/prodsms-codex-20261010e2`; неизменный cfg/artifact ID — `prodsms-codex-20261010e`. Сохранены все24 исходных payload-файла e, полный manifest `b3b8787ce59584740ab35110f7cbb6a1ecd391d58dbc6654b4f8146dad3c9cca`, exact images/архивы и все141 proof. Additive wrapper/controller выбирают compose project directory только как `Path(spec.compose).parent`. Frozen helpers, продуктовые SHA и исходная failure evidence не переписывались. Stage native0 подтверждён remote receipt `f130c54ffad3fad86c827fdba29e6a3b73a017909e20232ee8234d2d5f01f107`; локальный safe stage readback SHA256 `6f936e4a2210ca43b48855ae6430b3c8a3bf51fd14532942aa19aaa88ed9f82d`.

Свежая согласованная копия БД — `/root/db-backups/summy-2026-10-10-0753.dump`; её приватный дубликат выпуска — `private/pre-activation.dump` в e2. Размер **50484316 байт**, SHA256 **`9f22e78bbb6c3a4b6faa1c576f86adf2442ce5eb273f685d884ffc5e3f3014e6`**. Полное `pg_restore`-чтение в null началось 04:53:45.359314 UTC и завершилось 04:53:46.789281 UTC с native exit0; полная проверка копии и приватного дубля завершена 04:53:47.226978 UTC. Содержимое копии, секреты и списки сотрудников в документацию не переносились.

Prepared receipt создан 04:53:52.226674 UTC, SHA256 `3f6c78bbbd2ff034ef995d37019c0350d6425f53a5d3bac65a64f0511ab5d5e4`. Подготовка сохранила original compose/env, предыдущие VERSION bytes и старые image IDs в отдельных приватных before snapshots и rollback archive. Prepared receipt закрепляет rollback archive SHA256 `2e0e1161e188353145caf02aa88bdb3c61dcd1ea8bc9eaef601606ed17d51fb4`, DB0271, согласованную копию БД, runtime acceptance и exact три новых product image/config rows из Dev export; три native/config IDs остаются исходными e. Все9 safe server metadata-файлов скопированы root с nativeSSH0; prepared receipt и завершающие job/verification bytes независимо прочитаны локально. Download receipt SHA256 `925f02803150488d19ef021b0381300a321f2d51d8a1e7d075fd10acb763c53a`. Copy/restore-read времена подтверждены safe events root.

| Фаза | Actual UTC / МСК | Native результат и proof |
|---|---|---|
| prepare e2 | 04:52:10.364357–04:53:54.093324 / 07:52:10–07:53:54 | exit0, MainPID0, success; invocation `1319469e5c894261a010dad6caa36b02`; job `0d09527497c3fb78980fd9490330164af82dfda88f5ccb849414a333396670e0`; launch `b6fb3f3465e6fc9726f8a932caf03eae3df73d3da912b7547fb83a149a8fcfc8`; local status `b779bdad01a30bc5086e5837baf6c437c043e8ff43a707e1055da5df8e6e1eed` |
| activate e2: CRM → master → API+sync | 04:54:42.963584–04:55:56.909746 / 07:54:42–07:55:56 | exit0, MainPID0, success; invocation `a0996e82002a42dd861da13fa4766946`; job `db4d72b3288d76da8710a5fa8434f4882c519845844857cdf2d46b2fe3ca3a4e`; launch `ba285febaa5d0bf4eee33de348de0dcb984f9290b1a45c2cb88524c642b328ef`; activation.done `68342ab4e0d8ac42e213192191083155490f81d5154696b557db7d9c7779ba67` at04:55:55.818185; complete predecessor закреплён в verify launcher |
| verify e2 | 04:56:37.760743–04:56:56.535733 / 07:56:37–07:56:56 | exit0, MainPID0, success; invocation `526ffa0e669f4399bf7a445c91b40d43`; local status `abd371f0b7d476d26ecca00da3ba09cb76ab1dce1e9c224046b9bf1ec9ac88e8`; verification `3852a0537ca0a30cbb95767bc2cfe07f5642b3ff10b4d05a0ce81dab1df00737`; job `12ec7e2ce433c83d92a423afb3df15c378c934796365283548ef2406498e3f41`; `deployment_complete=true`, DB0271, `rollback=false` |

Порядок читателей **CRM → master → API+sync** выполнен под общим замком. Overlays выбрали immutable image IDs с `--no-build --no-deps --pull never`. Нативная итоговая проверка подтвердила running exact образов, отсутствие новых mounts, отсутствие unhealthy, окружение разрешённых overlays, неизменность signing/service secrets, TTL и YClients login settings, полный exact live VERSION/health SHA, DB0271 и сохранение остальных контейнеров. Значения секретов не раскрывались. API/sync `PLATFORM_ID_ENABLED=true`, master build `VITE_PLATFORM_ID_ENABLED=true`; действующие Prod SMS/provider/stand/developer настройки сохранены. Рабочие compose overlays выпуска остаются действующей конфигурацией. Original compose/env не изменены; live VERSION обновлён до нового exact состава, его предыдущие байты и старые образы сохранены приватно для восстановления.


Действующий release root — `/root/releases/prodsms-codex-20261010e2`. Overlays: `private/backend.overlay.json`, `private/crm.overlay.json`, `private/master.overlay.json`. Master BFF использует original compose `/home/kirill/master-bff/bff/docker-compose.bff.yml`, env `/home/kirill/master-bff/bff/.env`, project `bff` и **project directory `/home/kirill/master-bff/bff`**; дополнительно применяется полный e2 path `/root/releases/prodsms-codex-20261010e2/private/master.overlay.json`. Live master VERSION записан в `/home/kirill/master-bff/VERSION`; путь VERSION не является compose project directory. Root e2 и cfg ID e различаются намеренно; вызов старого original compose без release overlay не воспроизводит новый выпуск.

10.10.2026 04:58:42.773620 UTC (07:58:42 МСК) выполнены только анонимные публичные GET: `https://admin.summy.ru/login` и `https://master.summy.ru/` ответили HTTP200 при проверенном TLS; в обоих интерфейсах найдены «По номеру телефона» и «По логину и паролю». Safe proof SHA256 `73bb8c3f13539640a89d5f519f39218fd8f714ba2433571245581490f660e683`. Реальные SMS и запросы с пользовательскими учётными данными при release-приёмке не выполнялись. Browser secure-cookie сценарий также не проверялся; это сохранённое ограничение runtime141.

## Production refs и обязательный возврат test/Dev — завершены

Production refs и теги подтверждены exact non-force fast-forward/readback: backend `dev` → `1c00e5f2c9aa6893dc375547524cd067ec3652f7`, `v0.8.0`; CRM `main` → `fcbe4a1cac3283ca646f44d1e9d4238482a8c0ee`, `v0.184.0`; master `feature/react-client` → `6c916e930c6ee106c86bd208ed15ecde658c5d8b`, `v0.86.0`. Все6 production/test rows имеют `readback=true`, `force=false`; safe receipt SHA256 `fb83b5ad49390f0ea87b1aab15286ff0f29825898001cef053b80f6ea61fe9e6`. Root GET3PR подтвердил `closed/merged=true` и exact candidate `merge_commit_sha`: backend PR90 04:59:36, CRM PR189 05:00:05, master PR105 05:00:34 UTC.

Return test refs также опубликованы и сверены: backend `33ac9f49688fc0092748cec696d365e053fe0b41` на Dev-base `dc68196dee46915feccc2e694261a38c4875e8fc`; CRM `217f459395995a0b9f0766fdcaa420827ea70fd0` на `7a2a9179c8981e844275873d6451b2c2baa3498f`; master exact `6c916e930c6ee106c86bd208ed15ecde658c5d8b`. Возврат сохраняет более поздние custom roles/credential revocation, Analytics, Events/дни рождения, компактные экраны, schema0277 и Dev developer/SMS flags; источник и env gates Dev stand доступа восстановлены. Дополнительный HTTP/functional smoke `/login_dev` не выполнялся, ответ200 этой страницы не заявляется.

Новый return d build unit `prodsms-return-build-20261010d` завершил обе native-сборки с `exit=0/process_exit=0`, 10.10.2026 04:21:07.165621–04:23:29.424904 UTC (07:21:07–07:23:29 МСК), invocation `62716a2458a3464c81997e9a5f78c8af`. Строгий collector завершён native0. Исходный manifest `002a8813556b1d7c2650f8123f78843c2ad450ef6881566d71f2b6b59e9c11e2`, inventory `9079cf90c739643fa934774f03eac6cde426943cb1faa4aa79b65f95c5375759`, raw receipt14526байт SHA256 `38e5125822d783520a2ef6f22506699297c4ef5e526c42d4e730a92029f58b66`; delivery manifest `a9049688fad624d901006dcb3031e8a1d5ffdb8c9e87f567588c54ec90c9a438`.

Перенос16 delivery-файлов на `/opt/summy-test/releases/prodsms-return-dev-20261010d` завершён 04:48:01.576969–04:49:53.944665 UTC: initialize, все16 copy и remote hash verify native0; local transfer receipt SHA256 `53893c7582dbd68825ee4610248a069a0cc5cfd78b5ecc10fb01eacaebb11c90`. На этом этапе `transferred=true`, `deployment_complete=false`; дальнейшая actual приёмка выполнена отдельными native фазами ниже.

| Фаза Dev return d | Actual UTC / МСК | Native результат и proof |
|---|---|---|
| prepare | 04:59:52.653670–05:00:20.717084 / 07:59:52–08:00:20 | exit0, MainPID0, success; invocation `ee5793e31543412cb123b5b461372bd2`; load backend/CRM0; job `72f30796419deaec0b0346237e1fea2cd6aec3fa46055e82254cdf717a433ddc`; launch `b0102ebbcc10dc503fa9d2ece168708c27ae97b59bb49d3fac3fe6008d441d05`; prepared `fc0099d4ff9504e54c639f4e5eaff5e5e6c1968cf94d72ff012ec0887e99ee88` |
| activate | 05:01:38.641018–05:02:52.373964 / 08:01:38–08:02:52 | exit0, MainPID0, success; invocation `f2cc638505cb45aaa1eb007e25b637d9`; все7 steps0: API/sync/CRM/master и publish3 source; job `db60ee2c720018292011af6b47ce706e83af98564320422a1c7c466162b12198`; launch `fecc995e15ed132d86fda339b0cf3e77fd02dc302821a0c66bef1f32992f62e8` |
| verify | 05:03:57.093127–05:04:06.232234 / 08:03:57–08:04:06 | exit0, MainPID0, success; invocation `1facfdd09f954ba5817b0985369a1170`; verified `1ecec226f4ff922d3fbebd7c2cf8ef2fef69f20be3703f0b6519c52c98d7f414` at05:04:06.228242; job `8a5d0d54680e1f569164d3b86eb064f06af88cdd3e27fe6b5439e7998076c28c`; launch `cd41e0ec86449ad479f764dce39617bc1a52b7a2be5ae245c04d5904c6ddba42` |

Итоговая Dev safe verification2186байт имеет `passed=true`, DB `0277_custom_role_deletion`, `tests_executed=false`, `unrelated_containers_preserved=true`. Все4 продукта running, RestartCount0, с сохранёнными env/ports/mounts/networks. API/CRM Dockerhealth — healthy; у sync/master Dockerhealthcheck не настроен (`health=null`), они не названы healthy. Native IDs: backend API/sync `sha256:8251f6642315fa95c8931c9e226f276932070e0e3382157f3e03eb23c4146e44`; CRM `sha256:45e715876a28ee76757bb4f0bd04afba7b3fb0a79da09a75224168f170b295f5`; master `sha256:400a5339ab0f57a3a2fec8ea44bd522ac02cf5b67af07b7746a313a8f92815d7`. Источники/VERSION/OCI labels/образы сверены guard при фактической доставке; client/website и прочие контейнеры сохранены.

**Тесты на Dev не проводились.** При обязательном возврате дополнительные product tests, CI, lint/typecheck, smoke/e2e не запускались; проведены только сборка и проверки доставки, миграционной и конфигурационной целостности. Изолированный release runtime141 относится к собственному preview и не подменяет этот факт. Все9 safe Dev metadata-файлов скачаны root с nativeSSH0, затем независимо прочитаны локально; download proof SHA256 `1ad1853363628076f917353d0cdfca64d9b4cb0eca4ea7b3dc1ff164089167ce`.

Старый return c завершил native-сборки успешно; отказ относился к последующей упаковке CRM VERSION. Его build0/job/inputs/архивы сохранены и не переименованы в новые return d proofs. Новый return d использует корректный canonical stamp.

Фактический результат: оба способа входа выпущены на Prod 07:56:55 МСК и обязательные подготовительные изменения возвращены на общий Dev 08:04:06 МСК.

## Восстановление

Original compose/env остаются неизменными; предыдущие exact VERSION bytes и старые образы сохранены приватно. Live VERSION уже обновлён на новый состав. Возврат R1009 разрешён только при DB0271 и нулевых всех исторических accounts/bindings/sessions, проверенных после приостановки API/sync. При появлении identity state guard отказывает; нужна совместимая forward recovery с сохранением аккаунтов/истории. При отказе API/sync возобновляются. Данные identity не стираются ради отката.

Rollback использует исходные image IDs/байты VERSION, `--pull never` и приватные overlays; схема остаётся0271. Downgrade до0261 из исторического R1009 runbook не используется. Restore БД требует отдельного решения. Фактический исход Prod: **rollback не применялся**, итоговый verify `rollback=false`.
