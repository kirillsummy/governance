# CRM

[Общая схема](README.md) · [Статусы](../current-state.md) · [API](../api.md)

**Стек:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · Radix/shadcn.

## Назначение

Интерфейс администратора/управляющего/владельца: клиенты, сотрудники, процессы, расписание, прайс, склад, медиа, начисления и выплаты.

## Модули и входы

`src/app` — страницы и `/api`; `components` — UI; `domain` — типы/правила представления; `lib/adapters/*-gateway.ts` — server adapters; `lib/auth` — вход и cookies. Общие UI-компоненты и components.json определяют базу Radix.

## Авторизация

В baseline есть собственный серверный YClients auth и локальная сессия CRM. Gateway-проверяемый вход развивается в PR #184 и orders-feature. Видимость пункта меню не доказывает серверное право; новый orders проверяет подписанную backend-сессию и роль.

## Связи

CRM → Next API routes → backend. Процессы и история приходят из платформы. В orders-feature `/clients/orders` и `/api/orders/[[...path]]` дают календарь/карточку/перенос/отмену/сверку. Денежный баланс не дублируется во фронте.

### Рекламации

Этап 5: рабочая карточка получает статусы и переходы из канона, передаёт
решение через `ProcessTransition.fields` одним действием и ведёт универсальные
задания через существующий gateway процессов. Сроки и просрочка задач
отображаются по backend DTO. Это рабочая ветка, не приёмка test/production.

В `crm/work` общий раздел процессов содержит форму рекламации из визита и без
визита, production-карточку на `ProcessDetail`, задания, переходы, компенсации,
сверку неопределённого исхода, связанную переделку, штрафы и серверные фильтры.
Dev-витрина остаётся только визуальным стендом. Защитные правки опубликованы
в `crm/work` `8238dbb`; это реализация в рабочей ветке,
а не подтверждённая приёмка test/production: CRM/test отстаёт от work на одиннадцать
коммитов, не проверены реальные миграции и сквозные сценарии. В опубликованном
`crm/work` создание сохраняет исходные `request_id` и тело при неизвестном
ответе до явного нового запроса; gateway проверяет обязательные поля
`ProcessView`/`ProcessDetail` вместо подстановки пустой карточки. BFF передаёт
серверную CRM-сессию backend и использует разрешённые филиалы и режим
`scope=processes` существующих справочников; старый backend без подтверждения
филиального ограничения не отдаёт зеркало клиентов. Gateway процессов остаётся
ручным adapter, не сгенерированным клиентом OpenAPI. Уведомления рекламаций
в интерфейсе ещё не подключены: колокольчик CRM остаётся заглушкой.
Подробности: [контракт рекламаций](../../contracts/reklamaciya.md).

Dev-маршруты `/dev/vitrina-reklamaciya` и `/dev/miniatyura-reklamacii`
закрываются `notFound()` при `NODE_ENV=production`; fixture-preview не
передаётся production-карточке. Общие mock-адаптеры YClients/WhiteLines
существуют в CRM, но не являются gateway рекламации. При недоступном backend
процессный BFF отвечает ошибкой 503, не сохраняет фиктивную карточку.
Действующее значение demo-флагов на production не проверено.

При неопределённом ответе создания production-форма сохраняет в
`sessionStorage` прежние тело запроса и `request_id` даже после закрытия формы:
первый POST мог успеть создать карточку. Чтение этого хранилища откладывается
до первого клиентского рендера, чтобы HTML сервера и браузера совпал.
Gateway отказывает в клиентском и визитном зеркале, если backend не
подтвердил ограничение филиалов заголовком `X-Process-Scope-Enforced: true`:
старый backend может проигнорировать сам query-параметр. Активные процессы
дочитываются страницами по `total`, а закрытые пока ограничены одной недавней
страницей; при частичном сбое интерфейс сообщает об этом. Поэтому закрытый
раздел нельзя считать полной исторической выгрузкой.

Переход отправляет `ProcessTransition.fields` атомарно со статусом; если
изменённых полей нет, свойство опускается, поскольку `{}` мог бы означать
очистку анкеты. На мобильной ширине переход подтверждается явной кнопкой, без
drag-and-drop. Причина отказа передаётся одним переходом и как
`rejection_reason`, и как комментарий. Общий provider поставляет филиалы для
всех представлений; отдельные локальные списки ранее давали разные написания
«Батурина».

`src/components/process/complaint-create.tsx` используется только
`/dev/vitrina-reklamaciya`: фиксированные варианты и две студии, а также
неактивная кнопка создания — исторический визуальный fixture, не production
контракт. Рабочая форма — `src/components/kanban/complaint-create.tsx`.

## Конфигурация и проверки

package.json, components.json; ADMINAPP_GATEWAY_URL/TOKEN, auth настройки, ADMINAPP_PUBLIC_ORIGIN; orders включается флагом. npm test/typecheck/lint/build. Mock-формулировка старого README не описывает все текущие адаптеры.

## Источники

- [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/auth/yclients-auth.ts)
- [crm/src/lib/auth/gateway-login.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/auth/gateway-login.ts)
- [crm/src/lib/adapters/processes-gateway.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/adapters/processes-gateway.ts)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
