# Ветки SUMMY

Правила Git — в [уставе](../CHARTER.md#ветки-и-git); здесь имена, CI и
состояние. Редакция 02.10.2026; прежняя политика и разборы —
[архив 25.09](history/branches-2026-09-25.md),
[ревизия 29.09](history/branch-audit-2026-09-29.md),
[до очистки 25.09](history/branches-before-cleanup-2026-09-25.md).

## Действующие ветки

У Governance одна ветка — `main`. В продуктах две: рабочая `test` и
production-ветка, она же default в GitHub.

| Репозиторий | Production/default | Рабочая | CI автоматически |
|---|---|---|---|
| backend | `dev` | `test` | push и pull_request в `dev` |
| crm | `main` | `test` | push и pull_request в `main`; карантин — ночью и при push в `main` |
| master-app | `feature/react-client` | `test` | push и pull_request в `feature/react-client` |
| client-app | `main` | `test` | нет, только ручной запуск |
| website | `main` | `test` | push и pull_request в `main` |

Все workflow сохраняют ручной запуск (`workflow_dispatch`). Push в `test` и
pull_request в `test` CI не запускают; ветки в триггерах перечислены явно,
поэтому ни новая, ни переименованная ветка проверки не включает. CI ничего не
разворачивает: Dev и Prod обновляют релизные скрипты ([инфраструктура](infrastructure.md)).
Публикация в ветку не означает выкладку на сервер.

Состояние remote refs 02.10.2026 после внедрения правил:

| Репозиторий | Production-ветка | `test` |
|---|---|---|
| backend | `01bfa53d0184c8ff5b2b5f5ab3b3bf90b4b3f4f2` | тот же |
| crm | `fe2887a35cc8bb0a51ee2cf6bfff316416488adf` | тот же |
| master-app | `d67c5e8bd26f71a1a45a9b2ea6d7033d22a654e6` | `4faa7345f73b4689bfa3b3b8434b79f0b5b8a743` (содержит production) |
| client-app | `9a7e31de711f2bfd94c1a6ef55e05a8346f9d213` | тот же |
| website | `ff4435b9febd59a4bb449e627e417ee18e8de4a4` | тот же |

Коммиты 02.10 меняют только CI и `AGENTS.md`; runtime Dev и Prod не
менялся. Production-ветка содержится в `test` во всех продуктах, поэтому
следующий релиз продвигает её fast-forward.

## Лишние ветки

- `crm/claude/prod-sveta-processes` (`3f7795fe8187f1f25e0bd7188adb7f1ef494be61`,
  хотфикс RC5.1) — родитель merge-коммита `7b8d4bf` в `main`, то есть уже
  содержится в `main` и `test`. Переносить нечего; удаление ветки в GitHub
  02.10 не выполнено — его отклонили права исполняющей сессии. Удалить
  может участник с правом записи: `git push origin --delete claude/prod-sveta-processes`.
- Других веток в продуктах нет. Архивные головы прежних `singular` —
  теги `archive/singular-2026-09-29` в backend и website.

## Унификация имён

Целевые имена — `production` и `test` (нижний регистр) во всех продуктах;
утверждены условно, при безопасной миграции. 02.10.2026 переименование не
выполнено, имена выше сохранены. Препятствия:

1. **Нет доступа к GitHub API.** Настоящее переименование с сохранением
   защиты, default и открытых PR делает только API или интерфейс GitHub
   (`POST /repos/{owner}/{repo}/branches/{branch}/rename`) с правами
   администратора. В исполняющей сессии был только SSH-доступ к Git, без
   `gh` и токена API; правила защиты веток поэтому тоже не прочитаны.
   Создание копии ветки с новым именем переименованием не является.
2. **Привязка на Prod.** Штатный скрипт сайта `deploy/server/deploy.sh`
   выполняет на сервере `git pull origin main`; RC6 выкладывался архивом
   через релизный скрипт, но штатный путь остаётся. GitHub не перенаправляет
   `git fetch`/`pull` старого имени, поэтому переименование требует
   одновременной правки скрипта и серверного checkout сайта на Prod.
3. **Ссылки в CI и документах.** Имена production-веток стоят в триггерах
   workflow, условии полного контура backend (`refs/heads/dev`, `main`,
   `prod`), памятках продуктов и сторожах канона.

Порядок, когда доступ появится: прочитать защиту и default каждого
репозитория → переименовать через GitHub (default и защита переходят
автоматически) → в том же заходе обновить триггеры CI, `deploy.sh` и
checkout сайта на Prod, таблицы выше, памятки и `scripts/check-canon.mjs` →
записать в CHANGELOG.
