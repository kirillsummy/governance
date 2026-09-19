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

## Конфигурация и проверки

package.json, components.json; ADMINAPP_GATEWAY_URL/TOKEN, auth настройки, ADMINAPP_PUBLIC_ORIGIN; orders включается флагом. npm test/typecheck/lint/build. Mock-формулировка старого README не описывает все текущие адаптеры.

## Источники

- [crm/src/lib/auth/yclients-auth.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/auth/yclients-auth.ts)
- [crm/src/lib/auth/gateway-login.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/auth/gateway-login.ts)
- [crm/src/lib/adapters/processes-gateway.ts](https://github.com/kirillsummy/crm/blob/d848696711516b83fb062b71a334ed5e84199b5b/src/lib/adapters/processes-gateway.ts)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
