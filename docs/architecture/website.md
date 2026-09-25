# Сайт

[Общая схема](README.md) · [Статусы](../current-state.md) · [API](../api.md)

**Стек:** Next.js 16 · React 19 · TypeScript · Tailwind 4.

## Назначение

Публичные страницы услуг, студий и мастеров, портфолио/отзывы, SEO, вакансии и формы. Личный кабинет клиента — отдельное приложение.

## Модули и входы

`src/app` — App Router; `src/content` — редакционные данные; `src/lib/site.ts` — контакты и ссылки; `platform.ts` — server-only доступ к backend. `src/app/api/vacancy-apply/route.ts` и `certificate-order/route.ts` — серверные формы Telegram.

## Связи

Серверный слой читает публичные DTO backend и проксирует медиа. Формы отправляют сообщения Telegram. В основной версии запись ведёт во внешний YClients; это не созданный заказ SUMMY. В feature флаг направляет в `/client/book` с контекстом услуги/студии/мастера.

## Конфигурация и запуск

`package.json`, `next.config.ts`, `deploy/server/`, `docs/nginx.reference.conf`. Серверные GATEWAY_URL/SERVICE_API_TOKEN; публичные NEXT_PUBLIC_CLIENT_BOOKING_ENABLED/NEXT_PUBLIC_CLIENT_APP_URL; Telegram-реквизиты только на сервере. Применимость pm2/конфигурации требует проверки среды.

В `next.config.ts` старые нерегулярные URL профилей мастеров явно
перенаправляются на новые slug: маска могла бы обрезать уже выданные ссылки.
Список ширин изображений ограничен максимумом 1920 px вместо стандартной
ступени 3840; по локальному замеру главной от 09.08.2026 это сокращало
число ссылок и больших производных кадров. Этот замер не является текущей
производственной метрикой и требует повторения перед изменением настройки.
Портрет мастера отдаётся с адреса сайта, не раскрывая браузеру внутренний
адрес gateway и сервисный токен. Если фото платформы недоступно, обработчик
читает студийный снимок из локального `public/` и отдаёт байты с 404 при
отсутствии файла. Нельзя заменять это редиректом: оптимизатор Next не следует
такому ответу. Нельзя делать self-fetch по `request.url`: за HTTPS-прокси
сайт слушает HTTP, и такая реализация ранее дала 500 на всех портретах
(`v2.17.0`, откат в тот же час). Локальный HTTP-тест этой ошибки не ловит.
Кэш портретов ограничен пятью минутами, потому что статические страницы не
содержат версию фото в адресе.

## Границы и незавершённое

Локальные цены/контент/калькулятор ещё не полностью централизованы. Уведомление кандидата или сертификата не равно завершённому заказу/оплате. Привязка карты не реализуется в сайте. Проверки: build, lint, check:palette.
Отдельного `npm test`-скрипта нет; `check:pages` проверяет связность страниц,
не их внешний вид. На 25.09.2026 он проходил 28 проверок, но предупреждал о
двух отсутствующих целевых статьях `bezopasnost` и `otvetstvennost`.

## Источники

- [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/lib/platform.ts)
- [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/lib/site.ts)
- [website/src/app/api/vacancy-apply/route.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/app/api/vacancy-apply/route.ts)
- [website/src/app/api/certificate-order/route.ts](https://github.com/kirillsummy/website/blob/109648cdade7511ab656a60a0e277372cd7a72d6/src/app/api/certificate-order/route.ts)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
