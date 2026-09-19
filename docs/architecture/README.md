# Архитектура SUMMY

Описание кода по закреплённым срезам 19.09.2026. [Состояние и незавершённое](../current-state.md)
отделяет основные ветки, feature-код и наблюдения среды.

| Раздел | Содержание |
|---|---|
| [Сайт](website.md) | Next.js, публичные страницы, контент, формы, запись |
| [Backend](backend.md) | FastAPI, домены, БД, sync, права и расчёты |
| [CRM](crm.md) | Управление, Next BFF, gateway-адаптеры и роли |
| [Приложение мастера](master-app.md) | React, BFF, смены, визиты, профиль и финансы |
| [Клиентское приложение](client-app.md) | Телефон, бронирование, заказы, история, оплата |

## Общая схема

Сплошные связи обозначают существующий путь кода, пунктир — feature/непринятое
внешнее подключение. Это не измеренная сеть production. Вход CRM ещё имеет
legacy-путь к YClients; нельзя считать все способы входа уже объединёнными в backend.

```mermaid
flowchart TB
  visitor[Посетитель] --> site[website / Next.js]
  client[Клиент] --> ca[client-app / React + Vite]
  master[Мастер] --> ma[master-app / React + Vite]
  admin[Администратор / управляющий] --> crm[CRM / Next.js]
  site -. флаг записи .-> ca
  site --> ss[Серверные routes и platform.ts]
  ca --> cb[Node BFF /client/api]
  ma --> mb[Node BFF]
  crm --> cr[Next.js API routes / адаптеры]
  ss --> api[backend / FastAPI /v1]
  site --> forms[Серверные формы сайта]
  forms --> telegram[Telegram API]
  sync[Python sync process] --> yc
  sync --> pg
  cb -. клиентский feature API .-> api
  mb --> api
  cr --> api
  crm --> legacy[Legacy auth CRM]
  legacy --> yc
  api --> pg[(PostgreSQL / summy_data)]
  api --> media[S3 / медиа]
  api <--> yc[YClients / facade + sync]
  api -. orders feature .-> pay[Яндекс Пэй sandbox]
  pay -. подписанный webhook и сверка .-> api
  api -. OTP адаптер .-> sms[SMS.ru]
  api -. очередь обращений .-> smtp[SMTP]
  api -. напоминания .-> sink[(Тестовый приёмник в БД)]
```

## Владение

Данные и расчёты принадлежат backend. BFF хранит сессию/секреты на сервере и
ограничивает HTTP-поверхность. Сайт сохраняет часть редакционного контента у себя.
YClients остаётся внешним источником/исполнителем части операций; полного отказа нет.
Синхронизация запускается отдельным Python-процессом, не во frontend.

Общие детали: [БД](../database.md), [API и авторизация](../api.md),
[инфраструктура](../infrastructure.md), [цепочки модулей](../modules.md).
Репозитории governance/docs/context/workspace не являются продуктовыми API.

Источники и SHA: [реестр](../sources.md), [репозитории](../repositories.md).
Исторический Django/прямой SQL из фронтов не переносить из ADR-0001 в актуальную схему:
его уточняет [ADR-0002](../../decisions/0002-single-backend.md).
