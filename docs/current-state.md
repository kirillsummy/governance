# Фактическое состояние · 19 сентября 2026

[Вход в DOC](../AGENTS.md) · [Репозитории и SHA](repositories.md) · [Все ветки](branches.md)

## Как читать статусы

- **Реализовано в базе** — код в закреплённой основной ветке. Это не доказательство деплоя.
- **Реализовано в feature / PR открыт** — отдельный код, не принятая основная версия.
- **Обнаружено, требует проверки** — runbook, конфигурация, исторический замер или непроверенный runtime.
- **Планируется/упоминается** — предложение, черновик, не реализованное в проверенной базе.

Исследованы metadata/деревья девяти известных репозиториев, все 111 remote-веток,
открытые PR и ключевые документы/entrypoints. Полный аудит каждой строки не проводился.
На серверы не входили, реальные API YCLIENTS, SMS и платежей не вызывали.
Health, пользовательские входы и внешние интеграционные циклы заново не проверялись.
Метод и файлы: [sources](sources.md).

## Реализовано в основных ветках

| Продукт | Что есть | Чего это не доказывает |
|---|---|---|
| Backend `dev` | FastAPI, PostgreSQL/Alembic до файлов `0116`, домены людей/записей/смен/денег/склада/процессов/медиа, sync YCLIENTS, S3 adapter | Полное замещение YCLIENTS, отсутствие дрейфа реальной БД, единые пользовательские права |
| CRM `main` | Next.js приложение, серверные routes/адаптеры, роли/видимость, управленческие экраны | Включение gateway-входа из PR #184 или проверку каждого действия backend по роли |
| Master `feature/react-client` | React-приложение, Node BFF, рабочий день/график/смены, профиль/медиа/медкнижка/отзывы/финансы | Приёмку всех действий на production и исправления из PR #93 |
| Website `main` | Next.js сайт, контент, платформенная публичная витрина, виджет YCLIENTS, формы Telegram | Завершённый продуктовый поток заявки/сертификата или онлайн-оплату |
| Client `main` | Три файла заготовки: AGENTS, CLAUDE, README | Отсутствие работы над клиентским продуктом: код уже в отдельных PR |
| Governance / docs / context / workspace | Канон, знания, память, инструменты | Отдельные работающие SaaS-продукты |

Источники реализации: [архитектура](architecture.md), [API](api.md),
[репозитории](repositories.md), закреплённые файлы в [реестре](sources.md).

## Разработка в отдельных ветках

| Работа | Доказательство на дату снимка | Осталось / граница |
|---|---|---|
| Надёжность backend | [PR #80](https://github.com/kirillsummy/backend/pull/80): защитные проверки доступа/скриптов, схема/VIEW/OpenAPI, кандидаты/outbox, PG/tooling/dev-окружение | PR открыт; согласование продуктового поведения и совместная приёмка, не считать исправления уже в `dev` |
| Доступы CRM | [PR #184](https://github.com/kirillsummy/crm/pull/184): опциональный gateway-вход и защита маршрутов/сессии | PR открыт; включение согласованно с backend, проверка реальных ролей |
| BFF мастера | [PR #93](https://github.com/kirillsummy/master-app/pull/93): auth-path/token hardening и контрактные проверки | PR открыт; после объединения проверить login/refresh и отрицательные маршруты |
| Обращения мастера/часы | [backend #81](https://github.com/kirillsummy/backend/pull/81), [master #94](https://github.com/kirillsummy/master-app/pull/94) | В feature; письма/повторы и сценарии надо принимать на согласованном стенде |
| Клиентский контур | [backend #82](https://github.com/kirillsummy/backend/pull/82), [client #3](https://github.com/kirillsummy/client-app/pull/3) | SMS, сессия, запись/история и отмена описаны/реализованы в ветках; внешняя приёмка не подтверждена |
| Общие заказы/платежи | [backend #83](https://github.com/kirillsummy/backend/pull/83), [crm #185](https://github.com/kirillsummy/crm/pull/185), [master #95](https://github.com/kirillsummy/master-app/pull/95), [client #4](https://github.com/kirillsummy/client-app/pull/4), [website #46](https://github.com/kirillsummy/website/pull/46), [governance #62](https://github.com/kirillsummy/governance/pull/62) | Тестовый контур; merchant/external цикл не подтверждён, не production-платежи |
| Собственный вход Platform ID | `backend/test` содержит дополнительные коммиты и `0117_staff_invitations`; основные фронтовые `test` равны базам снимка | Нельзя считать миграцию входа всех продуктов завершённой; проверить совместимость с другой линией `0117` |
| Общий стенд | [backend #79](https://github.com/kirillsummy/backend/pull/79), runbook `STAND-SERVER.md` | Документ описывает подъём 15.09; доступность/версию 19.09 не измеряли |

Основа таблицы — открытые PR и их базы, а не предположения по именам веток.
Цепочки backend/master/client зависят друг от друга: см. [branches](branches.md).
Исторические зелёные тесты из хендоффа 16.09 не заменяют свежий CI на итоговом merge tree.

## Интеграции: код есть, runtime отдельно

| Интеграция | Подтверждение | Неизвестно сейчас |
|---|---|---|
| YCLIENTS | API-клиент/sync backend, вход CRM, отдельные живые команды, виджет сайта | Текущая свежесть зеркала, квоты, токены, все успешные сценарии |
| S3 / MinIO | SDK, storage metadata, compose и runbook | Фактический endpoint и содержимое каждой среды, восстановимость медиа |
| Telegram | Формы сайта и описанный поток кандидатов | Доставка сейчас; наличие уведомления не означает сохранённую заявку |
| PostgreSQL / Timeweb / nginx / контейнеры / pm2 | Конфигурации и инструкции размещения | Текущее здоровье/версия/ресурсы сервера |
| SMS.ru, SMTP, Yandex Pay/Split | Документы/код отдельных feature-веток | Действующие реквизиты, доставка, внешний полный цикл и production-включение |
| Телефония, прочие подписки | Исчерпывающий корпоративный реестр договоров не найден в исследованных источниках | Провайдеры, счета, владельцы и статус: не выдумывать |

Адреса и точные источники: [infrastructure](infrastructure.md).

## Известный долг / TODO

Статусы ниже относятся к базе снимка либо к указанному runbook. При взятии задачи
сначала проверить код и текущий PR; не открывать повторно исправленный пункт.

| Приоритет работы | Проблема | Источник / текущая граница |
|---|---|---|
| Сначала согласовать доступ | CRM/BFF/backend имеют разные модели входа и legacy-заголовки; сервисный токен не пользовательское право | Backend DEBT §5–6, CRM #184, master #93, [API](api.md) |
| Сначала согласовать БД | Две линии после `0116`, разные `0117`; определения денежных VIEW и неполное ORM-покрытие | [database](database.md), backend #80 и новые feature-ветки |
| Надёжность операций | Скрипты графика с неявным назначением БД, дубли импортов/HTTP, ошибки/повторы | Backend DEBT §9, §20–21; часть исправлений в #80 |
| Заявки | Telegram-уведомление вместо завершённого продуктового потока; требуются согласованные хранение, история, повторы и дедупликация | Backend DEBT §7, website routes, backend #80 |
| Деньги и калькулятор | Разные источники ставок, необходимость актуальных VIEW и контрактов фронтов | Backend DEBT §1, §8, money-dod |
| Воспроизводимость | Локальные PG skip, dev S3 hostname, Python/tooling, изоляция теста аудита профиля | Backend DEBT §10–12, §22; #80 открыт |
| Стенд | Server-only overrides/nginx, пустое медиа, проблемы восстановления образов MinIO | STAND-SERVER от 15.09; состояние сейчас требует проверки |
| Производительность | В runbook финансовый VIEW ~73 с, CRM баланс ~15 с на данных дампа | Исторический замер 15.09, не новый бенчмарк |
| Неполный media error mapping | Пустой бакет давал 500 вместо 404 | Runbook стенда; повторно здесь не воспроизводили |

Источники: [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md), [crm/docs/DEBT.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/docs/DEBT.md),
[master-app/docs/DEBT.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/docs/DEBT.md), [website/docs/DEBT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/docs/DEBT.md),
[backend/docs/STAND-SERVER.md](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md).
Приоритеты таблицы — порядок проверки рисков для новой сессии, не новая
утверждённая дорожная карта владельца.

## Расхождения документов и реализации

| Старое утверждение | Подтверждённое уточнение | Как читать дальше |
|---|---|---|
| «Клиентского кода нет» в старом MAP/AGENTS client | Верно только для `main`; feature уже содержит приложение | Указывать ветку, не обобщать на весь репозиторий |
| Health мастера «в работе» в CHARTER | BFF основной ветки содержит `/healthz` и проверку shell | Код доказывает endpoint, не состояние сервера |
| `backend/prod` как релизная ветка в workspace README | Текущий CHARTER назначает `dev`; удалённая `prod` может оставаться исторической | Релизный процесс — по CHARTER, не старому README |
| Схема `docs` уровня 0010/0011 и исторические 139 таблиц в MAP | Backend Git уже имеет миграции до 0116; есть отдельный снимок PR #80 | Исторические числа не считать актуальным DDL |
| Нет динамических отзывов/вакансий в старом backend architecture | Текущий `main.py` регистрирует reviews/vacancies/public routes | Старый обзор датирован; смотреть реализацию выбранного SHA |
| Стенд «не поднят» в старом SIGNALS | Более поздний STAND-SERVER описывает подъём 15.09 | Оба документа исторические; текущий runtime отдельно |
| Root workspace всегда Git repo | GitHub workspace описывает нормализованную структуру; исследованный Windows root — контейнер независимых checkout | Проверять `git rev-parse`, а не предполагать по пути |

Источники: [workspace/README.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/README.md), [workspace/test-stands/SIGNALS.md](https://github.com/kirillsummy/workspace/blob/3eacd57efc4706c74e44e592c01e1443eead3b7e/test-stands/SIGNALS.md),
[docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md), [backend/docs/architecture.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/architecture.md), [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py),
[master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/bff/README.md), [историческая MAP](../MAP.md), [CHARTER](../CHARTER.md).

## Неподтверждённое и планы

Нет новой проверки production SHA, health, входов, ролей и операций; неизвестны
текущая схема/данные боевой БД, настройки флагов, внешний платёжный цикл и
полный список оплачиваемых компанией подписок. Отдельный Kubernetes pod не
обнаружен: известен сервер `summy-test` с Docker Compose, это другой тип ресурса.
Предлагаемый адрес client `/client/` не объявляется работающим production URL.

Общий вход, собственная клиентская запись и платёжный контур — работы в PR.
Полное замещение YCLIENTS и любых внешних сервисов этим срезом не доказано.
PostgreSQL, объектное хранилище, хостинг и доставка сообщений остаются техническими
зависимостями даже при развитии собственных приложений.
