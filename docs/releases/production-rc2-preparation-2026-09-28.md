# SUM-112 — production-проверка RC1 и подготовка RC2

**Продолжение 28.09:** после нового прямого утверждения RC2 выполнены проверки
и переключены четыре production-продукта; итоговая сверка и теги отражаются
в [отдельной записи выкладки](production-rc2-deployment-2026-09-28.md).
Ниже сохранён исторический отчёт этапа до утверждения RC2.

## Историческое состояние до утверждения RC2

Дата: 28.09.2026. RC1 получил прямое утверждение в чате агента, затем
проверка production-конфигурации выявила препятствия безопасному выпуску.
Production продолжает работать на прежнем коде и схеме 0116.
Новые исправления не подменяют утверждённые SHA RC1.

## Фактический production до переключения

| Компонент | Работающая версия |
| --- | --- |
| Backend API | bbfe5e5e22ca2eedbaf58db2899a60c4cdfa70f3 |
| CRM | 153c3ec3ea1d01ca3432e8336f3df42f6c18613d; от production main 0e3f676 отличается только AGENTS.md |
| Master | otzyvy-2026-09-08 = 84f3d0a74584c549ed50070f0f3fbc2eee0f5515 |
| Website | 164dc5253a67ae1f1ab956eaaeeb6e439e633e76; PM2 summy под kirill, Node 24.19.0 |
| БД | 0116_otzyvy_zerkalo |

На диске 8,9 ГБ свободно из 48 ГБ. Сборки выполняются последовательно на TEST,
в отдельном каталоге, без изменений работающего TEST. Старые production
образы закреплены rollback-тегами; исходники и конфигурации сохранены в
root-only /root/releases/rc1-20260928. Секреты остаются на production.

## Почему RC1 не переключён

1. Новые cash-v1 routes доступны без отдельного feature gate. Они позволяют
   создать резерв и запрос выплаты; эти сценарии исключены из принятого объёма.
2. Новый sync photo_proofs начисляет штрафы; период запуска не отключает
   первый запуск. Старый sync можно закрепить отдельно, но новый API всё равно
   создаёт v2/pending записи для будущего начисления. Это не сохраняет прежние
   правила закрытия визита без новых обязательств.
3. Legacy CRM использует прежний вход YClients. Новые lookup требуют gateway
   session независимо от PROCESS_SESSION_REQUIRED. Переключение auth на gateway
   несовместимо с текущими допусками: legacy users=7, gateway users=3,
   missing=4, extra=0, role mismatch=0. На мигрированном клоне grants=0,
   два manager/admin не имеют филиальных допусков. Пользователи и права не менялись.

## Миграции и сохранность данных

С разрешения пользователя сегодняшний production-дамп перенесён по SSH
в закрытый временный каталог TEST. SHA256 совпал:
2ab7f18a4769f8eb6987b8f0d2ca20d01ba3a11356fad871883c7c3a2e9efd85.
Внутренняя Docker-сеть без опубликованных портов исключала исходящие
интеграционные вызовы. Restore в отдельную PostgreSQL 18 и alembic
upgrade 0116→0143 завершились с exit 0.

Сравнение с отдельно восстановленным baseline не обнаружило пропавших
существующих строк. Сравнение прежних колонок обнаружило только обновление
updated_at у 1937 процессов, ожидаемое изменение одного process_type и
два новых process_types. В других существующих колонках изменений не найдено.
Это проверка конкретного дампа; перед production migration нужен свежий backup.

Все 740 файлов backend runtime совпали с SHA 37fed5ca233aa1a1728a02200aa8062482fc5217.
Образ sha256:dd35719501f80340280e8b1a5e46d6aa72bcd171246a4c92b6be8264481c318c
на мигрированном клоне вернул ready/health 200 и точный SHA; TEST-вход
и отключённый platform-id маршрут вернули 404.

После проверки удалены production.dump, обе временные БД с контейнером
и anonymous volume, probe API и отдельная сеть. В документах сохраняются
только агрегаты и хеши; клиентских данных и секретов здесь нет.

## Исправления следующей редакции

Три локальные ветки codex/prod-rc2 подготовлены от точных RC1.
Исходные codex/prod-rc1 и production-ветки сохранены.

| Продукт | Точный SHA RC2 | Изменение |
| --- | --- | --- |
| Backend | 5682ad92b828e4cfc3a8bbdbd3bbd63d6182aeff | Cash и photo-v2 gates, прежнее закрытие без нового штрафа, серверная версия правила фото |
| CRM | 07f9d7b86b2897a4c2436bfdc0f079186f39884d | Явная совместимость lookup с действующим legacy/live входом |
| Master | 070fcd4741cd0df1528c851878400a4eedbf6925 | Отключённый cash-блок скрыт, форма и дозагрузка зависят от серверного правила |
| Website | c234d88704279df85c3a56d2fceb333ae7c1b672 | Без изменения относительно RC1; booking=false при сборке |
| Client | 4a3a245c221291d2d587fbe925061b9149f2ee50 | Прежний production, новый клиент исключён |

Backend: 25 локальных тестов без БД (gates, scheduler, OpenAPI snapshot),
Ruff и mypy 11 изменённых Python-файлов прошли. Добавлены DB-регрессии
legacy closure, preupload/waiver, grade и freeze исторического pending v2,
но они ещё не запускались. Миграции в RC2 не изменены.

CRM: 78 целевых тестов, TypeScript и ESLint изменённых файлов прошли.
Master: 48 целевых тестов (cash, gateway, closure) и TypeScript прошли.
Независимое ревью всех трёх изменений выполнено другими агентами;
найденные замечания исправлены до коммитов. Полные локальные прогоны RC1
по указанию пользователя не повторялись.

Внешняя доставка RC2 остановлена: автоматическая проверка разрешений
отклонила SCP нового CRM RC2 source на TEST, поскольку утверждение пользователя
относилось к RC1. Передача не повторялась другими способами. RC2 остаётся
локальным исходным кодом: новые Docker-сборки, DB-регрессии и remote smoke
не выполнены. Пользователю предъявлен конкретный состав RC2 и запрос на
его публикацию, передачу, проверки и выпуск после успешных проверок.

Ранее успешно собраны неизменные RC1 CRM/master и website; RC1 артефакты
CRM/master не подменяют новые RC2. Website runtime archive пригоден без
пересборки: SHA256 2ad858ad34affcbf2e533a6150463fa6c356f2595f190622639a7e0c0a45216d,
Node 24.21.0 Linux, BUILD_ID OgDNUfmzwEWppQbTmoqlO, booking=false,
STAND_PRIMERKA отсутствует. Артефакты и manifest остаются в
/opt/summy-rc1-build-20260928/artifacts на TEST, вне работающих сервисов.

### Явная production-конфигурация RC2

- Backend API и sync: CASH_PAYOUTS_ENABLED=false, PHOTO_PROOF_V2_ENABLED=false.
  Существующие начисления/выплаты и остальные sync jobs сохраняются.
- Backend API: DEPLOYMENT_ENVIRONMENT=production,
  TEST_DEVELOPER_ENABLED=false, ORDERS_TEST_ENABLED=false,
  MASTER_BOOKING_ENABLED=false, CLIENT_PORTAL_ENABLED=false,
  PLATFORM_ID_ENABLED=false, STAND_ALLOW_SIGMASMS=false, пустой STAND_AUTH_PASSWORD.
  Для действующего legacy CRM: PROCESS_SESSION_REQUIRED=false,
  CRM_SESSION_REQUIRED=false. INTERNAL_MASTER_API_ENABLED=1 сохраняется.
- CRM: ADMINAPP_AUTH_PROVIDER=legacy, ADMINAPP_YCLIENTS_AUTH_MODE=live,
  ADMINAPP_LEGACY_PROCESS_LOOKUPS_ENABLED=true, ORDERS_TEST_ENABLED=false,
  ADMINAPP_DEPLOYMENT_ENV=production, ADMINAPP_TEST_DEVELOPER_ENABLED=false.
  Role mappings остаются прежними. Compatibility не включается при gateway
  или TEST/ORDERS auth и не является fallback после 401/403.
- Master build: VITE_ORDERS_TEST_ENABLED=false, VITE_PLATFORM_ID_ENABLED=false,
  VITE_API_BASE=/; runtime DEPLOYMENT_ENV=production, TEST_DEVELOPER_ENABLED=false.
- Новые внешние каналы: RECRUITMENT_NOTIFICATIONS_ENABLED=false,
  REPORTS_SMTP_HOST пуст; действующие production env не заменяются TEST env.

## Порядок выпуска и откат

После готовности новой редакции применяются требования утверждения конкретного
номера из CHARTER. Наличие готового образа не является production-выкладкой.
В текущих GitHub workflows нет доставки; понадобится последовательная ручная
поставка неизменных образов с сохранением действующих env, сетей и портов.

Перед миграцией: свежий DB backup, проверка чтения и запас диска. Миграция
применяется к существующей managed БД; TEST/clone restore на production
не применяется. API/sync, CRM и master меняются через существующие compose
projects с готовыми images, без compose down и без изменений MinIO volumes.

Website поставляется готовым каталогом Node 24 Linux с production
NEXT_PUBLIC_CLIENT_BOOKING_ENABLED=false; STAND_PRIMERKA отсутствует.
Сохраняются .env.local mode600 и владелец kirill, прежний PM2 summy.
Подготовленный каталог и /var/www/summy меняются атомарным обменом на
одной файловой системе; старый каталог остаётся целиком для возврата.

После каждого сервиса: running image/SHA, health, public ingress, отключение
TEST и непринятых сценариев, безопасные GET smoke. При ошибке очередь
останавливается. Кодовый откат использует сохранённые образы/каталог;
downgrade или restore production-БД автоматически не выполняются.
Аннотированные release tags — только после подтверждения работающих версий.
