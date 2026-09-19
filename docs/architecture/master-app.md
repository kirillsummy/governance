# Приложение мастера

[Общая схема](README.md) · [Статусы](../current-state.md) · [API](../api.md)

**Стек:** React 19 · Vite 8 · React Router 7 · Node HTTP BFF.

## Назначение

День мастера, график, смены/QR места, визиты и качество, профиль/портфолио/медкнижка/отзывы, показ личных финансов.

## Модули и входы

`web/src/App.tsx` — маршруты; screens/components/api/lib — UI и транспорт. `bff/server.mjs` обслуживает `web/dist`, auth, allowlist и cookies. `bff/Dockerfile`/compose — упаковка. Legacy Django не является текущим runtime эпика.

## Связи и доступ

Браузер → same-origin BFF → backend. Токены не выдаются в браузер. BFF allowlist защищает от административных маршрутов, подпись master-сессии проверяет backend. Legacy X-Master-Id и риски auth-путей отмечены в baseline/API и PR #93; не считать все исправления автоматически влитыми.

## Feature-функции

Обращения с категориями, снятие смены с причиной, утреннее текстовое нарушение; заказ, начало/качество/итог/оплата и запрос отмены. Счётчик 180 часов существует в backend отдельно от зарплаты. Карта должна привязываться в клиентском продукте, не у мастера.

## Конфигурация и проверки

VITE_API_BASE задаёт реальный транспорт; без него возможен frontend mock. BFF: GATEWAY_URL/SERVICE_API_TOKEN/APP_VERSION. Healthz проверяет shell и версию. web: typecheck/test/build/check:palette; BFF: node --test bff/server.test.mjs.

## Источники

- [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/web/src/App.tsx)
- [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/bff/README.md)
- [master-app/docs/shift-requests.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/shift-requests.md)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
