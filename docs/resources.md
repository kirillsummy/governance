# Адреса и ресурсы

Реестр **19.09.2026**. URL взяты из кода/документов или текущего контекста, не придуманы. «Документирован» не означает «доступен сейчас». Секреты, способы их извлечения и персональные данные не публикуются.

## GitHub и документация

- [kirillsummy/governance](https://github.com/kirillsummy/governance) — публичный DOC и канон.
- [kirillsummy/crm](https://github.com/kirillsummy/crm) — CRM.
- [kirillsummy/master-app](https://github.com/kirillsummy/master-app) — приложение мастера.
- [kirillsummy/backend](https://github.com/kirillsummy/backend) — единый backend.
- [kirillsummy/website](https://github.com/kirillsummy/website) — сайт.
- [kirillsummy/client-app](https://github.com/kirillsummy/client-app) — клиентский продукт.
- [kirillsummy/context](https://github.com/kirillsummy/context) — частная память сессий.
- [kirillsummy/workspace](https://github.com/kirillsummy/workspace) — рабочее пространство.
- [kirillsummy/docs](https://github.com/kirillsummy/docs) — частные бизнес-знания.

Вход DOC — [AGENTS](../AGENTS.md); [карта](../MAP.md), [устав](../CHARTER.md), [контракты](../contracts/), [решения](../decisions/), [команда](../roles/TEAM.md). Точные источники и SHA — [sources](sources.md).

## Production

| Ссылка | Назначение | Проверка 19.09 |
|---|---|---|
| [summy.ru](https://summy.ru/) | Публичный сайт | Проверен health, не все страницы |
| [summy.ru/healthz](https://summy.ru/healthz) | JSON версия сайта | HTTP200, v2.29.0 |
| [admin.summy.ru](https://admin.summy.ru/) | CRM, административная панель продукта | Авторизованный flow не проверен |
| [CRM health](https://admin.summy.ru/api/health) | Версия/SHA/режим CRM | HTTP200, v0.176.0, 153c3ec, live |
| [master.summy.ru](https://master.summy.ru/) | Приложение мастера | Авторизованный flow не проверен |
| [Master health](https://master.summy.ru/healthz) | Версия и наличие SPA shell | HTTP200, otzyvy-2026-09-08, shell ok |

Полный ответ и смысл проверки — [current-state](current-state.md). У отдельной production панели БД, облачного кабинета, S3-console, CI dashboard, публичного API/Swagger домена подтверждённые URL не собраны. Не угадывать их по названию провайдера.

## Тестовые и локальные адреса

| Ссылка/адрес | Назначение | Статус/источник |
|---|---|---|
| [Общий тестовый сайт](https://201.51.9.79/) | website на summy-test | Документирован 15.09; защищённый доступ и самоподписанный сертификат; [описание общего стенда от 15.09](https://github.com/kirillsummy/backend/blob/f2117b3e849a5272a146ad825153dab51899d5f0/docs/STAND-SERVER.md) |
| [Тестовая CRM](https://201.51.9.79:8443/) | CRM того же стенда | Документирован, текущая работа не проверена |
| [Тестовое приложение мастера](https://201.51.9.79:9443/) | Master того же стенда | Документирован, текущая работа не проверена |
| [Локальный backend health](http://127.0.0.1:8091/health) | Docker stand на машине разработчика | [backend/docs/STAND.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/STAND.md); появится только после локального запуска |
| http://gateway:8000 | Внутреннее имя backend в summy-internal | Не публичный URL, не адрес браузера пользователя |
| [Локальный клиент](http://127.0.0.1:5190/client/) | Демонстрация client-app | [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md); локальный режим без SMS/платежей |
| https://summy.ru/client/ | Предлагаемый адрес client-app | **План**, deployment не подтверждён; не ссылка на готовый продукт |

Отдельный staging URL и Kubernetes pod не обнаружены. Общий тестовый стенд и отдельный orders-test контур — разные конфигурации; не считать тестовые feature-ветки автоматически выкаченными на summy-test.

## Внешние системы

| Ресурс | Назначение | Основание |
|---|---|---|
| [YClients API](https://api.yclients.com/api/v1) | Внешний auth/данные/операции | [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/lib/auth/yclients-auth.ts); backend integrations |
| [Telegram API](https://api.telegram.org) | Серверная отправка отклика | [website/src/app/api/vacancy-apply/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/vacancy-apply/route.ts); token-bearing URL не публикуется |
| [Timeweb S3 endpoint](https://s3.twcstorage.ru) | Документированный S3 endpoint | [backend/docs/DEPLOY.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEPLOY.md); bucket/ключи здесь отсутствуют |
| [Яндекс Пэй sandbox](https://sandbox.pay.yandex.ru) | Тестовый платёжный adapter | [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md); внешний цикл не проверен |
| [Оплата по ссылке — документация](https://pay.yandex.ru/docs/ru/custom/integration-guide-link) | Ссылка из runbook интеграции | Официальную документацию провайдера заново не аудировали |

Файловый реестр — [sources](sources.md).
