# Текущее состояние

Только подтверждённое состояние сред со ссылками на выпуски. Ход задач — в
YouTrack, изменения — в [CHANGELOG](../CHANGELOG.md), датированные записи до
02.10.2026 — в [журнале](history/current-state-log-2026-10-02.md). Перед
выводом о среде сверяй живое состояние: VERSION, образы, ревизию БД.

## Prod: RC6 с 02.10.2026 03:00 МСК

Прямое поручение владельца 02.10.2026: выпустить весь код пяти продуктов,
работающий на TEST. Работают backend `8190e4b2902a013eaa5914d2005461247e80f473`
(`dev`, `v0.3.0`), CRM `6f9c316a034f09dcac58d8412629bff497d000b8` (`v0.179.0`;
`main` = merge `7b8d4bf` с тем же деревом), master-app
`fb76db82f760befdbb16472054a2bab917169c1c` (`feature/react-client`, `v0.81.0`),
website `ef6c6b013a2935c33b9e145c0f11b16db81a1d47` (`main`, `v2.32.0`); БД
`0166_optional_manicure_closure`, вход CRM `gateway`. client-app
`c36f92c93583c21b1ec615fdf4a1f88de3354fdf` (`main`, `v0.1.0`) только поставлен:
образ и файлы запуска неактивны, клиентский вход не включён — на production нет
его runtime-конфигурации. Deploy-фазы exit 0, проверка после выкладки 50/50,
API и sync стояли ≈2 мин 12 с. Тесты до выкладки, репетиция миграций, копия
БД и откат — в [документе выпуска](releases/production-rc6-2026-10-02.md).
Прежние выпуски — [журнал](history/current-state-log-2026-10-02.md) и [релизы](releases/).

## Dev

Последний записанный выпуск — `master-ui-dev-20261002` (02.10.2026,
[SUM-194](https://summy.youtrack.cloud/issue/SUM-194)/SUM-155): master-app
`fb76db82f760befdbb16472054a2bab917169c1c` →
`1ce2cea637f272bed5fdb4990fffce66ed5ca7b4`. Изменения интерфейса мастера,
контейнер, образ, сохранённый состав и откат — в
[записи выпуска](releases/dev-master-ui-2026-10-02.md). BFF мастера running,
RestartCount 0, Docker healthcheck отсутствует. Сборка выполнена для
поставки; тестов, проверочных сборок и HTTP-запросов не было. Prod не менялся.

Backend `0adf690b41f2106cc38ad9a9774dd8f3d5084195` (включает backend-часть
SUM-194 `a486b9b`), CRM `2cc39389d4a409bd1c37cbe67e0c3cd6b54bd600`,
client-app `bf9491f29da9efb77882283f313b04789a9a69e2` сохранены после
`p24-20261002` (02.10.2026 16:13–16:18 МСК, P24
[SUM-196](https://summy.youtrack.cloud/issue/SUM-196)/[SUM-192](https://summy.youtrack.cloud/issue/SUM-192);
шаги `prepare`, `backend`, `crm`, `client`, `status` exit 0).
Website `ef6c6b013a2935c33b9e145c0f11b16db81a1d47` и БД
`0166_optional_manicure_closure` без изменений; миграций не было. Финальный
снимок выпуска мастера подтверждает прежние ID остальных контейнеров,
running и RestartCount 0, healthy у имеющих Docker healthcheck.
`YOUTRACK_TOKEN` на Dev не задан ни у backend, ни у BFF мастера, поэтому
баг-репорты CRM, клиента и мастера на Dev не отправляются (по коду — ответ 503;
HTTP-запросы не выполнялись).

CRM `df9ce3aa236bace634d2a92b83dbccd50154bc2c` (SUM-203 P01/P02) опубликован
в `test`, но на Dev пока не доставлен. Начисление за перезапись не включено,
доставка UI мастера не завершает всю SUM-194. Назначение веток и правила Git —
в [ветках](branches.md). Снимок для записи факта —
`scripts/test_state.py` ([инфраструктура](infrastructure.md#доставка-ветки-test-на-dev)).

## Включённость функций

Поставка выключенного кода не означает включения функции. На Prod client-app
поставлен неактивно, клиентский вход и SMS не включены; включение ждёт
решения владельца о секретах ([SUM-192](https://summy.youtrack.cloud/issue/SUM-192)).
Статусы отдельных контрактов — в [контрактах](../contracts/README.md).
