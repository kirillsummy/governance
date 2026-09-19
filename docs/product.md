# Продукт SUMMY

[Вход в DOC](../AGENTS.md) · [Состояние на 19.09.2026](current-state.md)

SUMMY — сеть бьюти-студий и набор собственных приложений для клиентов, мастеров,
администраторов и управляющих. Продукт объединяет публичную витрину, запись,
работу в студии, клиентские данные, процессы, персонал, склад и расчёты.
Собственная платформа уже существует рядом с YCLIENTS; полного замещения внешней
системы текущие исходники не подтверждают.
Источники: [устав](../CHARTER.md), [website/PRODUCT.md](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/PRODUCT.md), [backend/README.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/README.md).

## Интерфейсы и сценарии

| Пользователь / приложение | Реализованная поверхность в базе снимка | Граница подтверждения |
|---|---|---|
| Посетитель / сайт | Студии, услуги, мастера, портфолио, отзывы, вакансии; переход в виджет записи; формы отклика и сертификата | Формы уведомляют Telegram; это не подтверждение созданного заказа или принятой оплаты |
| Мастер / master-app | Вход, день и записи, график, открытие/закрытие смены, QR рабочего места, профиль, портфолио, медкнижка, отзывы, финансы | Часть действий зависит от backend, флагов и YCLIENTS; экран не доказывает завершённый интеграционный поток |
| Администратор, управляющий, владелец / CRM | Операционные процессы, клиенты, сотрудники, графики, услуги/материалы, склады, зарплатные и финансовые разделы, доступы | Видимость раздела не равна серверной проверке пользовательского права |
| Клиент / client-app | В `main` только заготовка; в PR есть SMS-вход, запись, заказы, история, запрос отмены | Отдельный продукт разрабатывается; production URL и внешняя приёмка не подтверждены |
| Сервисы / backend | Данные, продуктовые API и команды, расчётные витрины, синхронизация и хранение медиа | Набор маршрутов не означает, что все включены конфигурацией работающей среды |

Источники: [website/src/lib/site.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/site.ts), [website/src/lib/platform.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/lib/platform.ts),
[website/src/app/api/vacancy-apply/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/vacancy-apply/route.ts), [website/src/app/api/certificate-order/route.ts](https://github.com/kirillsummy/website/blob/164dc5253a67ae1f1ab956eaaeeb6e439e633e76/src/app/api/certificate-order/route.ts),
[master-app/web/src/App.tsx](https://github.com/kirillsummy/master-app/blob/84f3d0a74584c549ed50070f0f3fbc2eee0f5515/web/src/App.tsx), [crm/README.md](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/README.md), [backend/app/main.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/main.py),
[client-app/README.md](https://github.com/kirillsummy/client-app/blob/4e38ed8f527f27348a4661b4d0e1c7e8a98ab42d/README.md).

## Роли

**Пользовательские:** посетитель/клиент, мастер, администратор, управляющий,
владелец. В CRM роль и доступ к разделам представлены отдельными структурами;
в backend есть таблицы допусков и прав разделов. Это не одна уже унифицированная
модель авторизации для всех приложений. Клиентская сессия появляется в отдельных
ветках. Идентификатор сотрудника платформы отличается от учётки/сотрудника YCLIENTS.
Источники: [crm/src/domain/access/sections.ts](https://github.com/kirillsummy/crm/blob/0e3f6763e00323703526f043b7fd4166b324ea55/src/domain/access/sections.ts), [backend/app/domains/auth/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/auth/models.py),
[идентичность мастера](../contracts/master-identity.md), [API](api.md).

**Команда разработки:** владелец принимает бизнес-решения; полномочия архитектора,
разработчика и релиз-инженера определяет [CHARTER](../CHARTER.md).
Эти роли нельзя подменять продуктовыми ролями CRM.

## Основные связи и бизнес-правила

1. **Деньги:** серверные правила и витрины backend; фронты показывают результат.
   Правка ставки, периода, штрафа, основания начисления требует согласованного
   правила и денежных проверок. Черновик оплаты в другом репозитории не является
   утверждённым тарифом. [Money DoD](../contracts/money-dod.md),
   [docs/README.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/README.md), [docs/dengi/oplata-masterov.md](https://github.com/kirillsummy/docs/blob/e8249d5549a2931555b1cca8a040e5096d2cc454/dengi/oplata-masterov.md).
2. **Мастер в нескольких студиях:** не заводить независимую личность на каждый
   внешний staff ID; соблюдать [master-identity](../contracts/master-identity.md).
   Фото и портфолио используются мастером, CRM и сайтом через одну платформу:
   [фото](../contracts/master-photo.md), [портфолио](../contracts/master-portfolio.md).
3. **Смена и рабочее место:** общий QR и правила краёв смены; отдельно закрытие,
   уборка/фото и связанные процессы. Источник правил —
   [QR](../contracts/qr-workplace.md), [края смены](../contracts/shift-edge-closure.md),
   [фото смены](../contracts/shift-photos.md), [штраф](../contracts/shift-penalty.md).
4. **Склад:** остаток получается из строк движений, проведённые документы
   исправляются следующим документом; это не редактируемое поле остатка.
   [backend/app/domains/warehouses/models.py](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/app/domains/warehouses/models.py).
5. **Рекламации, отзывы, медкнижка:** отдельные договорённости о статусах,
   источниках и доступе к данным. См. [рекламации](../contracts/reklamaciya.md),
   [отзывы](../contracts/master-reviews.md), [медкнижка](../contracts/staff-medbook.md).
6. **Онлайн-заказ и оплата:** общий контур нескольких продуктов есть в цепочке
   PR от 17.09.2026. Это разработка, а не доказанная принимающая деньги система.
   Контракт оплаты ещё в [Governance PR #62](https://github.com/kirillsummy/governance/pull/62).

## Что требует продуктового решения

- Финальное поведение заявок кандидатов: хранение в продукте, доставка, история,
  повторы и дедупликация; нельзя принять уведомление в Telegram за весь поток.
- Включение собственного входа и замещение YCLIENTS: согласованная миграция
  идентичности, прав и операций, а не просто переключение URL.
- Реальные платежи, возвраты, качество услуги и начисления: сквозная приёмка и
  подтверждение внешнего провайдера отдельно от sandbox-кода.

Источники: [backend/docs/DEBT.md](https://github.com/kirillsummy/backend/blob/bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3/docs/DEBT.md), [состояние PR и незавершённостей](current-state.md).

Реестр просмотренных и известных файлов: [sources.md](sources.md).
