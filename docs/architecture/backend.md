# Backend

[Общая схема](README.md) · [Статусы](../current-state.md) · [API](../api.md)

**Стек:** Python >=3.14 · FastAPI · Pydantic 2 · SQLAlchemy 2 · PostgreSQL · Alembic.

## Назначение

Единая продуктовая логика, данные, деньги, права, аудит и интеграции. В исходниках baseline dev и отдельный feature-заказов — разные срезы.

## Входы и слои

`app/main.py` собирает `/v1`, health и зависимости. `app/config.py` — env; `app/db.py` — транзакция на запрос. Домены используют router → service → repository; DTO в schemas, ORM в models. `alembic/versions` — единственный журнал схемы; `db/verify.sql` — проверка.

## Домены

Люди: organizations/locations/staff/staff_registry/clients. День: appointments/visits/schedule/master_cabinet. Операции: processes/cleaning/materials/warehouses/tech_cards. Деньги: pricing/payroll/earnings/bonus_tasks/calculator. Публикация: media/public_api/reviews/vacancies/recruitment. Наблюдение: freshness/sync_jobs/mirror_check/analytics.

## Интеграции и фон

YClients facade — общий транспорт и компоненты. `app/sync/loop.py` работает отдельным процессом: YClients → raw/external_refs → core/contract. Файлы — S3/MinIO. SMTP, SMS.ru и Яндекс sandbox имеют feature-адаптеры; код адаптера не доказывает рабочее подключение.

## Новый контур

client_portal и orders добавляют OTP, резерв, общий заказ, команды и серверную сверку платежа. Качество до оплаты, начисление через существующие payroll/earnings. Миграции двух линий после 0116 нужно согласовать; карта и касса ещё не завершены.

## Конфигурация и проверки

pyproject.toml, docker-compose*.yml, Alembic, app/config.py. Backend владеет PostgreSQL/S3 credentials. pytest с настоящей PostgreSQL, ruff, mypy; денежные проверки в UTC/Moscow. Тестовые restore могут очищать БД и не запускаются для проверки DOC.

## Источники

- [backend/app/main.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/main.py)
- [backend/app/sync/loop.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/sync/loop.py)
- [backend/app/config.py](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/app/config.py)
- [backend/docs/orders-test.md](https://github.com/kirillsummy/backend/blob/ea174dd267c873cc7ae1b8a95fb63d6c456fdf8a/docs/orders-test.md)

Полный реестр чтения и отдельные baseline SHA: [sources](../sources.md), [repositories](../repositories.md).
