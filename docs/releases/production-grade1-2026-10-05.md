# Production GRADE1 — 05.10.2026: точечный хотфикс сайта (грейд мастера)

Прямое поручение 05.10.2026: сначала залить фикс на Dev; если выкладка пройдёт без ошибок — сразу выпустить на Prod без тестов именно этот фикс и ничего больше. Release-карточка — [SUM-216](https://summy.youtrack.cloud/issue/SUM-216), часть — [SUM-215](https://summy.youtrack.cloud/issue/SUM-215). Prod до выпуска — [S194](production-s194-2026-10-05.md).

**Итог:** 05.10.2026 16:04 МСК на Prod переключён только сайт: `fa90db7` → `008ebb2`. Остальные продукты не менялись. **Prod точечного фикса выпущен без тестов по прямому поручению 05.10.2026.** Это исключение относится только к этому выпуску и не меняет правило [устава](../../CHARTER.md#релиз-prod).

## Причина и правка

После смены грейда мастера в CRM профиль на сайте показывал новый грейд, а карточки каталога, страниц направлений и главной — прежний. Сверено по коду `fa90db7`:

- профиль берёт грейд из публичной карточки платформы (`GET /v1/public/masters/{staff_id}`, `grade_label`);
- карточки брали звёзды из поля `category` файла `content/masters.ts`.

`withPlatformGrades` в `src/lib/platform.ts` подставляет в карточки грейд по правилу профиля:

- платформа ответила — её грейд; у мастера без грейда звёзд нет;
- платформа молчит — грейд файла.

Правило применено на главной, `/mastera` и `/mastera/<направление>`. Рейтинг отзывов, состав, порядок, фото и услуги не менялись. Тариф «от» в мобильном каталоге следует тому же актуальному грейду. Backend не менялся. Данные, грейды и деньги не правились.

## Состав

| Продукт | Prod до | Prod после | Git |
|---|---|---|---|
| website | `fa90db7238a0a5eb17835838e99940b829916422`, VERSION `S194+fa90db7…`, BUILD_ID `x0rmY-42mpFMjzRKbHWbj` | `008ebb282fd07d97b0644a5e7b7d5401b88c341f`, VERSION `GRADE1+008ebb2…`, BUILD_ID `St6xm8XBsnkHTm7DNIGcK` | `main` `fa90db7` → `008ebb2` fast-forward, тег `v2.33.1`; `test` = `008ebb2` |
| backend, CRM, master-app, client-app | S194 | без изменений (те же VERSION, образы и ID контейнеров) | — |

Свежая `test` сайта на момент фикса совпадала с `main` (`fa90db7`), поэтому хотфикс — один коммит поверх Prod-базы. Он же опубликован в `test` fast-forward.

`git diff fa90db7..008ebb2`: 5 файлов, +25/−8:

- `src/lib/platform.ts`;
- `src/app/page.tsx`;
- `src/app/mastera/page.tsx`;
- `src/app/mastera/[slug]/page.tsx`;
- `CHANGELOG.md`.

Миграций нет.

## Dev

`wgh-dev-20261005` после `cnf-dev-20261005`:

- prepare 15:48:14 exit 0, website 15:48:28 exit 0;
- VERSION `008ebb2…`, BUILD_ID `DnUXc-6H7EgH0AKOVSvmZ`, pm2 online;
- БД `0204_hr_action_request_links`, другие продукты не менялись.

## Сборка и перенос

Сборка шла на Dev в отдельном каталоге `/opt/summy-gradefix-build-20261005`, вне стенда, с production-параметрами S194:

- `node:24-bookworm`, Node 24.21.0, npm 11.19.0;
- `NEXT_PUBLIC_CLIENT_BOOKING_ENABLED=false`;
- `npm ci && npm run build` — успешно.

Источник — архив `git archive` коммита `008ebb2` (sha256 `844805aa…`).

Артефакт `website-gradefix.runtime.tar.gz`:

- 151 339 690 байт, sha256 `0a4c96e3865324f53583e7a377adc314abc5d6be312364cffbc2759dd6b415bc`;
- без `.next/cache` и env-файлов;
- все 330 файлов дерева коммита в артефакте побайтно равны blob `008ebb2`.

Перенос Dev → ПК → Prod: одним файлом соединение рвалось, поэтому передано восемью частями по 20 МБ, каждая сверена по sha256, итог сверен с sha256 артефакта. Bundle Git (`gradefix-release`, только `008ebb2` поверх `fa90db7`), sha256 `1e5ab1d2…`.

## Выкладка

Каталог `/root/releases/gradefix-20261005`, `gradefix.py` (sha256 `7b462a45…`, фазы `stage`/`website`/`rollback-website`/`status`, образец — фаза website `s194.py`), замок `/var/lock/summy-production-release.lock`.

| Фаза | Время МСК | Exit |
|---|---|---|
| `stage` | 16:03:30–16:03:51 | 0 |
| `website` | 16:04:09–16:04:13 | 0 |

`stage` проверил:

- базу Prod: VERSION и BUILD_ID S194;
- sha256 артефакта и bundle, безопасность путей архива;
- что `.env.local` скопирован с Prod без изменений и пустые `STAND_PRIMERKA`/`NEXT_PUBLIC_SUMMY_OPERATOR_ENABLED`;
- Git `HEAD` каталога: `fa90db7` → `008ebb2`.

`website`: атомарный обмен каталогов `renameat2`, `pm2 restart summy`, health `/healthz` = `GRADE1+008ebb2…`, `pm2 save`.

## Prod после выпуска

- website: VERSION `GRADE1+008ebb282fd07d97b0644a5e7b7d5401b88c341f`, BUILD_ID `St6xm8XBsnkHTm7DNIGcK`, Git `HEAD` `008ebb2`, pm2 `summy` online, cwd `/var/www/summy`.
- Остальные продукты не менялись:
  - контейнеры api, sync, adminapp, bff — те же ID и образы, что до выпуска (`containers-before.json` = после), running, перезапусков 0;
  - VERSION: backend `dfde65b…`, CRM `S194+792d123…`, master `S194+04643ca…`, client `S194+9a2cbd1… staged-only`.
- Env, БД, YClients, платежи и сообщения не менялись.

## Откат

`python3 gradefix.py rollback-website` меняет каталоги обратно на сохранённый `/var/www/.summy-gradefix-swap-20261005`: `S194+fa90db7…`, BUILD_ID `x0rmY-42mpFMjzRKbHWbj`. Откат не применялся.

## Проверки

По прямому исключению поручения тесты, smoke/e2e, ручные сценарии, lint/typecheck и проверочные сборки не проводились. Выполнены только сборки для выкладки и сверка хешей и версий.

Push в `main` запускает штатный CI сайта; его результат при выпуске не проверялся.


## Уточнение по скриншотам владельца 05.10.2026

GRADE1 доставлен, но расхождение каталога и профиля сохранялось: MastersCatalog выбирал объекты старого справочника при фильтрации. Повторный фикс — website f6dd7b8d5e7cc211b953062beb42028272d777f2; текущий факт доставки указан в CHANGELOG и docs/current-state.md. Первоначальный отчёт о версии не подтверждал исправление отображения.
