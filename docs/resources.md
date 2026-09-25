# Реестр ресурсов SUMMY

Дата инвентаризации исходников: 19.09.2026; ссылки из переданного владельцем
гайда дополнены 24.09.2026. URL в этой таблице не означает успешную
проверку доступности. Репозитории проверены GitHub API; адреса приложений — из
документов и чата. Неизвестные адреса намеренно не достраиваются.

| Ресурс | Назначение | Подтверждение / статус |
|---|---|---|
| [summy.ru](https://summy.ru/) | Публичный сайт | Устав и website |
| [CRM](https://admin.summy.ru/) | Администратор/управляющий | Устав и CRM |
| [Приложение мастера](https://master.summy.ru/) | Работа мастера | Устав и master BFF |
| [Предлагаемый клиентский адрес](https://summy.ru/client/) | Клиентское приложение | Предложен владельцем и README; развёртывание не подтверждено |
| [Тестовый сайт](https://201.51.9.79/) | Общий тест | Адрес владельца, STAND-SERVER от 15.09 |
| [Тестовая CRM](https://201.51.9.79:8443/) | Общий тест CRM | Тот же источник |
| [Тестовый мастер](https://201.51.9.79:9443/) | Общий тест мастера | Тот же источник |
| [Тестовый клиент](https://201.51.9.79/client/) | Путь клиентского приложения на TEST | Гайд владельца 24.09; фактическое развёртывание не проверено |
| [YouTrack](https://summy.youtrack.cloud/dashboard?id=177-0) | Задачи команды | Гайд владельца 24.09; права и доступность не проверены |
| [Локальный client](http://127.0.0.1:5190/client/) | Dev/demo с этого ПК | README и текущий контекст; жизнь процесса не проверялась |
| [Локальный backend docs](http://localhost:8000/docs) | OpenAPI стандартного dev-запуска | Backend README; другой порт возможен в stand |
| [Локальный stand health](http://127.0.0.1:8091/health) | Проверка изолированного API | STAND.md; только при запущенном stand |
| [Сетевая запись YClients](https://n662275.yclients.com) | Прежний внешний вход записи | website/src/lib/site.ts, используется без client-флага |
| [Запись YClients — Батурина](https://n508972.yclients.com/) | Внешняя форма записи филиала | Гайд владельца 24.09; фактические настройки не проверены |
| [Запись YClients — Офицерская](https://n643080.yclients.com/) | Внешняя форма записи филиала | Гайд владельца 24.09; фактические настройки не проверены |
| [Telegram для связи](https://t.me/summybeauty) | Публичный контакт | website/src/lib/site.ts |
| [Telegram-канал](https://t.me/summybeauty33) | Публичный канал | website/src/lib/site.ts |
| [ВКонтакте](https://vk.com/summybeauty) | Социальная площадка | website/src/lib/site.ts |
| [MAX](https://max.ru/u/f9LHodD0cOL9YRXjwcrIj0aCB4Vrv3gjusZKhNn0Moj0oOvzis00euQu_Bc) | Публичный контакт | website/src/lib/site.ts |
| [Instagram](https://www.instagram.com/summy.beauty/) | Социальная площадка | website/src/lib/site.ts; юридическая пометка остаётся в исходном сайте |

Прежние локальные preview 5194/5195/5196/5197 из хендоффа 17.09 — временные процессы,
не постоянные staging-адреса. Отдельные dev/staging домены клиента и адрес тестового
Kubernetes pod не подтверждены. Дзен в source задан пустым URL.

Переданный гайд не подтверждает deployed SHA или работу сценариев.

## Код и документы

- [Профиль GitHub](https://github.com/kirillsummy) — обзор репозиториев;
  права доступа к приватным проектам проверяются отдельно.
- [backend](https://github.com/kirillsummy/backend) — общий backend/API/DDL.
- [client-app](https://github.com/kirillsummy/client-app) — клиент.
- [master-app](https://github.com/kirillsummy/master-app) — мастер.
- [crm](https://github.com/kirillsummy/crm) — управление.
- [website](https://github.com/kirillsummy/website) — публичный сайт.
- [governance](https://github.com/kirillsummy/governance) — центральный DOC.
- [docs](https://github.com/kirillsummy/docs) — прежние деловые и технические знания.
- [context](https://github.com/kirillsummy/context) — приватная память/хендоффы.
- [workspace](https://github.com/kirillsummy/workspace) — инструменты рабочего пространства.
- [Инструкция Codex для Windows](https://learn.chatgpt.com/docs/windows/windows-app) —
  ссылка из гайда владельца 24.09, её актуальность не проверялась.

Подробности по назначению, директориям и commit-ссылкам — [repositories](repositories.md).
Внутренний API production не имеет подтверждённого публичного URL; не публиковать
весь /v1 как открытый reverse proxy ради удобства фронта.

## Внешние API и историческое наблюдение

- [YClients API](https://api.yclients.com/api/v1) — auth/данные/операции по серверным адаптерам.
- [Telegram API](https://api.telegram.org) — серверные уведомления форм сайта; токен в DOC не публикуется.
- [Замер health от 19.09](https://github.com/kirillsummy/governance/blob/263d84b60a4f03bf158453f1fe7d295db146e1ab/docs/history/health-2026-09-19.md) — сохранён из PR #65, не повторялся при объединении.

## Инфраструктурные ссылки и интерфейсы

- GitHub Actions/PR — внутри соответствующего репозитория; [все ветки](branches.md).
- Timeweb: managed PostgreSQL, серверы, S3 по ранбукам; URL конкретных панелей аккаунта
  не проверен и не выдумывается. S3 endpoint `s3.twcstorage.ru` — инфраструктурный host,
  не публичная ссылка на клиентские файлы.
- Яндекс Пэй sandbox host `sandbox.pay.yandex.ru` — адаптер интеграции, не SUMMY UI.
- [Контракт тестовых заказов](../contracts/orders-payments-test.md)
  описывает payment-link feature; новое требование карты отмечено в current-state.

Проверки версий: у сайта/мастера `/healthz`, CRM `/api/health`, backend `/health`
и `/ready`. Это относительные endpoints соответствующей среды; не путать их с
подтверждением входа, владения заказом или оплаты.


## Просмотренные источники

- [governance/CHARTER.md](https://github.com/kirillsummy/governance/blob/3f013b1071d38e1f534c297011d76e467f73ee14/CHARTER.md) — домены
- [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/lib/site.ts) — публичные ссылки
- [backend/README.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/README.md) — локальный API
- [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/STAND.md) — stand health
- [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/DEPLOY.md) — S3 и backend
- [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md) — предлагаемый адрес

Границы чтения и полный реестр: [sources.md](sources.md).
