# Клиентское приложение

[Общая схема](README.md) · [Статусы](../current-state.md) · [API](../api.md)

**Стек:** React 19 · Vite 8 · React Router 7 · Node HTTP BFF.

## Статус и назначение

Main остаётся заготовкой. Реализация из PR #3/#4 восстановлена в отдельном
репозитории client-app и 20.09.2026 включена в одинаковые `work` и `test`
([SHA и границы проверки](../history/test-integration-2026-09-20.md)).
Подтверждение телефона, выбор услуги/студии/мастера/времени, свои заказы,
история и запрос отмены. Слияние не подтверждает deployment приложения.

## Модули и входы

`src/App.tsx`, api.ts и types.ts — клиент; `server/index.mjs` — BFF; `server/demo.mjs` — явная локальная демонстрация. Префикс `/client/`, API браузера `/client/api/*`, backend `/v1/client/*`.

## Авторизация и данные

SMS OTP и связь с существующим CRM-клиентом проверяются backend. HttpOnly cookie хранится у BFF, allowlist и origin ограничивают запросы. Клиент получает только свои заказы; запрос отмены обрабатывает администратор. Цена/свободное время/статус оплаты не определяются браузером.

## Оплата и незавершённое

В просмотренном feature есть страница /client/pay/:id и ссылка Яндекс sandbox либо отключённая заглушка. Последнее требование — заменить ссылку привязкой карты. Реализация binding, касса и внешний e2e не подтверждены; правило подтверждения каждого списания/автосписания ещё не выбрано.

## Конфигурация и проверки

CLIENT_BACKEND_URL/TOKEN, CLIENT_PUBLIC_ORIGIN; CLIENT_DEMO только loopback, без реальных SMS/CRM/платежей. npm test, build, format:check. `https://summy.ru/client/` — предполагаемый публичный адрес, не подтверждённый deployment.

## Источники

- [client-app/README.md](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/README.md)
- [client-app/src/api.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/api.ts)
- [client-app/src/types.ts](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/src/types.ts)
- [client-app/server/index.mjs](https://github.com/kirillsummy/client-app/blob/319330ae8082426b8b7f00dded184d1cf22497e4/server/index.mjs)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
