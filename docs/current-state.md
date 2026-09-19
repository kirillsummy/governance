# Фактическое состояние

**Дата анализа: 19.09.2026.** Это датированный снимок, не мониторинг. Политика — [CHARTER](../CHARTER.md); code baseline — [repositories](repositories.md); 111 удалённых heads — [branches](branches.md). Основные ветки, тестовые ветки и работающий прод не отождествляются.

## Что именно проверено

- GitHub API: девять репозиториев, default branches, текущие heads, доступные последние 100 PR на репозиторий.
- Свежие Git refs: различия всех 111 heads относительно подтверждённой базы; локальные несданные checkout не принимались за основную реализацию.
- Выборочное чтение README/AGENTS, manifest, конфигураций, роутеров, моделей, runbook и DEBT; глубина по файлам в [sources](sources.md). Полного аудита каждого файла не было.
- GET трёх публичных health endpoints около **13:45 Europe/Moscow (10:45 UTC)**. Не было авторизованного прохода CRM/мастера, чтения prod DB, SSH или денежных операций.

## Production: проверено только здоровье/версия

| Endpoint | HTTP / ключевые поля ответа | Что это доказывает |
|---|---|---|
| https://admin.summy.ru/api/health | 200; status=ok; service=adminapp; version=v0.176.0; sha=153c3ec; deployed_at=2026-09-07T09:47Z; authMode=live; demoData=off | Сервер сообщает эту сборку и режим; не проверка доступа и содержимого всех экранов |
| https://master.summy.ru/healthz | 200; status=ok; service=master-bff; version=otzyvy-2026-09-08; shell=ok | BFF и SPA shell доступны; не доказательство login/DB/финансов |
| https://summy.ru/healthz | 200; status=ok; service=summy.ru; version=v2.29.0 | Отвечает health сайта; не проверка всех маршрутов/форм |

CRM SHA разрешается в `153c3ec3ea1d01ca3432e8336f3df42f6c18613d`; с main снимка отличается только AGENTS.md. Локально разрешённая метка мастера otzyvy-2026-09-08 соответствует `84f3d0a74584c549ed50070f0f3fbc2eee0f5515`. Это сопоставление метаданных Git/health, не криптографическая проверка развернутых файлов. Production backend SHA и текущий Alembic head не подтверждены. Тестовый стенд в этом аудите не открывался с авторизацией.

## Реализовано в основных ветках по коду

| Часть | Подтверждённая поверхность | Что не следует из наличия кода |
|---|---|---|
| CRM | Страницы/адаптеры клиентов, сотрудников, процессов, начислений/выплат, справочников, техкарт, складов, медиа, прав | Что каждый маршрут активен и каждая роль прошла сквозную приёмку |
| Мастер | Вход через BFF, день/запись, закрытие услуги, смены/места, профиль/портфолио/медкнижка, отзывы, финансы | Что все экраны включены; дополнительные действия смены зависят от флагов |
| Backend | Единый FastAPI, домены, PostgreSQL/Alembic, media, auth, sync YClients и jobs/freshness | Что весь синк свежий и внешние вызовы сейчас успешны |
| Website | Публичные страницы, серверные запросы к public API, формы Telegram | Что контент полностью переехал в backend или реализована новая клиентская запись |
| Client main | AGENTS/CLAUDE/README | Исполняемого приложения в main нет |

Источники: [modules](modules.md), [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/App.tsx), [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py), [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts). «Реализовано» в этой таблице означает наличие кода/маршрута, а не повторённый бизнес-сценарий на проде.

## Обнаружено в разработке, требует приёмки

| Область | Свидетельство | Оставшаяся граница |
|---|---|---|
| Клиентское приложение | Feature-ветка: React+BFF, вход/регистрация, каталог/слоты, заказ/история/оплата, demo; [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) | Main пустой; публичный адрес, реальная SMS-доставка и live e2e не подтверждены |
| Общие заказы | Backend orders/client_portal, новые миграции, CRM/master/client/site feature-ветки; [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md) | Не считать выкаченным на общий стенд или prod по имени ветки |
| Платёжная ссылка/QR | Яндекс sandbox adapter, server confirmation, идемпотентные операции и возвраты по описанию/роутерам тестового кода | Merchant ID не предоставлен; внешний цикл не пройден; касса не выбрана и adapter отсутствует |
| Связь оплаты и мастера | Order ID → CRM client/staff → provider order; существующий earnings | Нет подтверждения реальными закрытыми периодами или автоматической банковской выплаты |
| Уведомления | Очередь, дедупликация/напоминания в тестовом контуре | Получатель test DB sink; SMS/письма клиентам не доставляются |
| Безопасность/вход | Ветки crm-access/master-access/backend-reliability; собственная platform_id/auth в тестовых разработках | Эти исправления и флаги не объявляются включёнными в основных ветках |
| Общий стенд | [описание общего стенда от 15.09](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) | Runbook наблюдения от 15.09, текущий runtime не сверялся |

Общий [контракт тестовых заказов](https://github.com/kirillsummy/governance/blob/a1c3b56c4382e0520885b9b9cd3574ce16ee53ca/contracts/orders-payments-test.md) ещё в отдельной ветке governance. Не переносить его статус «тест» в статус действующего прод-контракта и не сливать автоматически в этой документационной задаче.

## Планируется / не подтверждено

Цель владельца: единый заказ, административная отмена с историей, ручные суммы, платёжная ссылка, клиентские регистрация/запись/отслеживание/история/оплата. Значительная часть уже написана в тестовых ветках, но до завершения нужны внешний sandbox-круг, выделенный YClients test филиал, SMS-провайдер, выбранная касса/адаптер/чек, межпродуктовая приёмка, затем отдельное разрешение на prod. Автосписание «как в такси», marketplace-распределение и автоматические банковские выплаты не подтверждены.

## Технический долг и незавершённое

Это выборка из DEBT/runbook, не полная и не заново воспроизведённая проверка дефектов:

- **Backend:** частичное ORM-покрытие, legacy X-Master-Id, неоднородные мастерские API, неиспользуемый сайтом recruitment API, дублирование калькулятора, тесты со skip без БД, расхождение Python runtime и target инструментов. [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md).
- **CRM:** ручные TS-контракты, повтор адаптеров/guards, большие компоненты, остатки mock/auth и недостаточное покрытие отдельных разделов. [crm/docs/DEBT.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/DEBT.md).
- **Мастер:** mock-heavy проверки, вручную поддерживаемый BFF allowlist, legacy header, исторические Django/QUEUE заметки и повтор частей UI. Закрытые пункты медкнижки не переписывать в TODO. [master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEBT.md).
- **Сайт:** дубли контента/цен/калькулятора и Telegram handlers, ручной реестр мастеров, макетные likes/часть рейтингов, контентные сроки вакансий. [website/docs/DEBT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/docs/DEBT.md).
- **Стенд, данные от 15.09:** пустой media bucket, медленные finance queries, server-only overrides/nginx, отсутствующие production cron; требуется свежая проверка. [описание общего стенда от 15.09](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md).
- **Заказы:** касса/чеки, SMS, sandbox credentials и внешний e2e остаются незавершёнными; наличия unit/DB tests недостаточно. [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md).

## Расхождения документов и реализации

| Старое утверждение | Что обнаружено / как читать |
|---|---|
| «Клиентского приложения нет» | Верно для main, неверно для feature-кода 17.09; в DOC явно разделено |
| «Master healthz в работе» | В BFF код и ответ JSON уже есть; фактическая пометка устава обновлена, полномочия не менялись |
| «Версия сайта только через git describe на сервере» | Доступен публичный /healthz; таблица устава дополнена этим способом |
| MAP содержит актуальные 139 таблиц и пустую visits | Это исторические замеры 16–18.08; сохранены с датой, не текущая статистика |
| Старые docs/schema и data описывают checksum migrations | Текущий источник схемы — backend Alembic; старые материалы исторические |
| backend README/architecture описывают завершённый перенос всех функций сайта | Реальный сайт сохраняет контент/калькулятор/Telegram; проверять consumer-код |
| workspace README указывает старую backend prod базу | GitHub default и CHARTER: dev; prod pointer упразднён |
| context README описывает старые пять ролей | Текущий CHARTER описывает тройку; память не меняет полномочия |
| Старый Windows root называет единственным релизёром архитектора | GitHub CHARTER разводит архитектора и release; текущая сессия в любом случае разработчик без права deployment |
| Python >=3.14 при tool target 3.12 | Manifest и конфиги расходятся; не исправлялись попутно документации |
| Виджет записи сначала на сайте по решению 16.08 | Новый целевой сценарий: клиентское приложение и переходы сайта; изменение отражено в отдельном тестовом контракте, не выдается за работающий prod |

Исходные документы сохранены; ссылки — [repositories](repositories.md), [sources](sources.md), [MAP](../MAP.md). Код свидетельствует о реализации, но сам не меняет утверждённую политику.

## Что остаётся неизвестным

Версия/миграции production backend; актуальные данные и свежесть sync; полные ролевые сценарии CRM/мастера; версии общего test стенда; результат внешних YClients/SMS/платёжных операций; пригодность денежного контура по money-dod; реальные restore/backup drills. Проверять отдельной задачей с соответствующим доступом, не заполнять догадками.

При обновлении этого файла повторить проверку только изменившихся источников, отметить новую дату и уровень доказательства. Реестр фактически просмотренных файлов — [sources](sources.md).
