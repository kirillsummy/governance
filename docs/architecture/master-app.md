# Приложение мастера

[Общая схема](README.md) · [Статусы](../current-state.md) · [API](../api.md)

**Стек:** React 19 · Vite 8 · React Router 7 · Node HTTP BFF.

## Назначение

День мастера, график, смены/QR места, визиты и качество, профиль/портфолио/медкнижка/отзывы, показ личных финансов.

## Модули и входы

`web/src/App.tsx` — маршруты; screens/components/api/lib — UI и транспорт. `bff/server.mjs` обслуживает `web/dist`, auth, allowlist и cookies. `bff/Dockerfile`/compose — упаковка. Legacy Django не является текущим runtime эпика.

## Связи и доступ

Браузер → same-origin BFF → backend. BFF отдаёт собранную статику с того же
origin, хранит master-сессию в HttpOnly-cookie и подставляет сервисный токен
только на сервере. Для разрешённых `/v1/*` он передаёт master-сессию и актора
из клеймов токена; logout для SUMMY ID отзывает серверную сессию перед
очисткой cookie, а legacy-сессия завершается локально. Токены не выдаются в
браузер. BFF allowlist защищает от административных маршрутов, подпись
master-сессии проверяет backend. Legacy X-Master-Id и риски auth-путей
отмечены в baseline/API и PR #93; не считать все исправления автоматически
влитыми.

Сессия мастера (`GET /v1/master/auth/session`) отдаёт `position_title` —
название первой действующей должности сотрудника по порядку связей
`staff_position_links`; без связанной должности поле равно `null`. Название
читается из справочника при запросе. Кабинет показывает его под именем на
главной. Кнопка питания находится в центре главной и ведёт в существующие
сценарии открытия смены по QR или закрытия; зелёное состояние берёт из
`shift.is_open` сессии. Пока смена закрыта, главная не запрашивает данные дня
и не показывает обзор всех записей и следующую запись. После открытия смены
доступен прежний экран дня.

## Feature-функции

Обращения с категориями, снятие смены с причиной, утреннее текстовое нарушение; заказ, начало/качество/итог/оплата и запрос отмены. Счётчик 180 часов существует в backend отдельно от зарплаты. Карта должна привязываться в клиентском продукте, не у мастера.

На первом срезе 24.09.2026 `test` и `work` разошлись (4/12 уникальных
коммитов); после обычного merge `master-app/work` `473f635` содержит
уникальные изменения `test`, но обратно в `test` ещё не перенесена.
Специального экрана рекламаций в обеих ветках не найдено; какие факты
рекламации показывать мастеру, [решает владелец](https://summy.youtrack.cloud/issue/SUM-96) (P8).
Это не мешает другим функциям мастера, но не является приёмкой на сервере.

## Конфигурация и проверки

`VITE_API_BASE` задаёт транспорт к BFF/API. В `master-app/test` `fe16e7d`
неподключённый маршрут в обычном режиме возвращает ошибку недоступности, а
учебные ответы доступны только при `VITE_DEMO_MODE=true` в локальном Vite dev:
плашка явно помечает демо, подключённые `/v1/*` продолжают ходить в API.
Production-сборка демо не включает. Это факт кода ветки `test`, не
подтверждение выкладки на общий TEST или production. BFF:
GATEWAY_URL/SERVICE_API_TOKEN/APP_VERSION. Healthz проверяет shell и версию.
web: typecheck/test/build/check:palette; BFF: node --test bff/server.test.mjs.

## Источники

- [master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/web/src/App.tsx)
- [master-app/bff/README.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/bff/README.md)
- [master-app/docs/shift-requests.md](https://github.com/kirillsummy/master-app/blob/01ce8b333ecd69abf0b747941d95c57d54b55cc5/docs/shift-requests.md)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
