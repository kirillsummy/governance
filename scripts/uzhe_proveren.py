"""Страж-дедупликатор: полный контур не гоняется ДВАЖДЫ по одному дереву.

Зачем. Сдача идёт через PR: `pull_request` поднимает полный контур (~11 минут),
а после мержа `push` в dev поднимает его снова. Сторож слияния заведён не зря —
комбинация после мержа бывает новой, «зелёное на ветке ≠ зелёное на слиянии».
Но если дерево коммита ПОБАЙТОВО то же, что уже проходило полный контур,
никакой новой комбинации нет: проверять нечего.

Мера (замер по всем прогонам августа 2026): 24 push-прогона бэкенда подняты на
дереве, у которого зелёный полный контур уже был, — 241 оплачиваемая минута,
это ~10% месячного счёта Actions по всем продуктам.

Два предохранителя, оба важнее экономии:

1. **Сравнивается ДЕРЕВО, а не коммит.** Squash и merge-commit меняют sha, но
   оставляют содержимое тем же; одинаковый tree-sha — это побайтово тот же
   рабочий каталог, включая сам файл воркфлоу и версии зависимостей.

2. **Зелёный ПРОГОН доказательством не является.** Прогон на feature-ветке
   заканчивается `success` и тогда, когда полный контур в нём ПРОПУЩЕН по
   условию. Принять такой за проверку — своими руками сделать прогон-лжец.
   Поэтому спрашивается не вывод прогона, а вывод САМОЙ ДЖОБЫ полного контура.

⛔ Ошибка стража = ПРОГНАТЬ. Ни один путь через этот файл не заканчивается
пропуском по недосмотру: не разобрали ответ, не нашли коммит, упал `gh` — гоним
полный контур. Дорогой прогон дешевле зелёного прогона, который ничего не
проверял.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from collections.abc import Callable, Iterable

# Имя джобы полного контура задаёт ВОРКФЛОУ, а не этот файл.
#
# Так сделано ради канонной байт-в-байт копии между продуктами (решение
# архитектора 26.08.2026, по образцу check-karantin.mjs). Пока имя было
# зашито сюда строкой «Миграции, схема, тесты», копия в другом продукте
# искала бы джобу с бэкендовым именем, НИКОГДА бы её не находила и всегда
# возвращала False.
#
# 🔴 Опасно не то, что такая копия сломается, а то, что она НЕ сломается:
# страж просто перестал бы что-либо пропускать, прогоны шли бы как раньше,
# сторож канона был бы зелёным (байты-то совпадают) — и прибор выглядел бы
# работающим, ничего не делая. Проверка, не умеющая краснеть, создаёт вид
# охраны.
#
# Теперь продуктовое отличие лежит в воркфлоу — рядом с той джобой, которую
# называет, где его видно глазами. Имя не задано → «гоним».
NAZVANIE_DZHOBY = "STRAZH_DZHOBA_POLNOGO_KONTURA"

# Сколько последних успешных прогонов просматривать. Дубль возникает через
# минуты после прогона PR, поэтому глубина нужна небольшая; каждый кандидат —
# один запрос к API.
GLUBINA = 20


def reshenie(
    nashe_derevo: str,
    kandidaty: Iterable[tuple[int, str]],
    derevo_po_sha: Callable[[str], str | None],
    polnyy_kontur_proshel: Callable[[int], bool],
) -> int | None:
    """Номер прогона, который УЖЕ проверил это дерево полным контуром, или None.

    `kandidaty` — пары (номер прогона, sha его головного коммита), от новых к
    старым. Чистая логика без ввода-вывода: подменяемые `derevo_po_sha` и
    `polnyy_kontur_proshel` позволяют ломать стража тестом.
    """
    for nomer, sha in kandidaty:
        chuzhoe = derevo_po_sha(sha)
        if chuzhoe is None or chuzhoe != nashe_derevo:
            continue
        # Дерево совпало — но прогон мог закончиться зелёным С ПРОПУЩЕННЫМ
        # полным контуром. Спрашиваем джобу, а не прогон.
        if polnyy_kontur_proshel(nomer):
            return nomer
    return None


def kontur_proshel_v_otvete(otvet: object, imya_dzhoby: str) -> bool:
    """Прошёл ли ПОЛНЫЙ контур в этом прогоне — по ответу API про его джобы.

    🔴 Несущая стена. Прогон feature-ветки заканчивается `success` с джобой
    полного контура в состоянии `skipped`; и `skipped`, и `cancelled`, и
    `failure` — это «контур НЕ проверял», а не «проверил». Ослабить сравнение
    здесь — значит начать пропускать полный контур на непроверенных деревьях,
    то есть вливать зелёную галочку, за которой ничего не стоит.

    Вынесена из замыкания намеренно: пока она жила внутри `main()`, её нельзя
    было позвать тестом, и подмена `== "success"` на `in ("success",
    "skipped")` проходила весь набор зелёной. Нашёл релиз-инженер при приёмке
    26.08.2026 — своим изломом, не чтением. Излом теперь стоит здесь:
    tests/test_uzhe_proveren.py.

    Неизвестный ответ (не словарь, нет списка джоб, чужая форма) — False, то
    есть «прогнать»: ошибка стража всегда в дорогую сторону.
    """
    # Второй пояс, а не защита: джобы с именем «» не бывает, поэтому пустое
    # имя дало бы False и без этой строки — проверено изломом, её снятие
    # тестов не красит. Настоящие ворота против незаданного имени — в main().
    if not imya_dzhoby:
        return False
    if not isinstance(otvet, dict):
        return False
    dzhoby = otvet.get("jobs")
    if not isinstance(dzhoby, list):
        return False
    return any(
        isinstance(d, dict)
        and d.get("name") == imya_dzhoby
        and d.get("conclusion") == "success"
        for d in dzhoby
    )


def imya_dzhoby_vstrechalos(otvety: Iterable[object], imya_dzhoby: str) -> bool:
    """Попадалась ли джоба с настроенным именем хоть в одном осмотренном прогоне.

    Нужно, чтобы отличить два случая, которые снаружи выглядят ОДИНАКОВО —
    «страж вернул False, контур прогнался, всё зелено»:

    * дерево и правда новое либо контур в нём не проходил — гоним по делу;
    * имя джобы настроено НЕВЕРНО (опечатка, джобу переименовали, копию в
      другой продукт перенесли, значение недоправили). Тогда страж честно
      возвращает False всегда, экономии ноль, и понять это неоткуда.

    Пустое имя закрывала проверка в main(), но неверное непустое — нет:
    находка релиз-инженера при приёмке 26.08.2026. Молчащий бесполезный
    прибор хуже отсутствующего, поэтому этот случай говорится вслух.
    """
    for otvet in otvety:
        if not isinstance(otvet, dict):
            continue
        dzhoby = otvet.get("jobs")
        if not isinstance(dzhoby, list):
            continue
        if any(isinstance(d, dict) and d.get("name") == imya_dzhoby for d in dzhoby):
            return True
    return False


def _vypolnit(*argv: str) -> str | None:
    """Вывод команды или None, если она упала. Падение — повод прогнать."""
    try:
        gotovo = subprocess.run(argv, capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.SubprocessError):
        return None
    if gotovo.returncode != 0:
        return None
    return gotovo.stdout.strip()


def _api(put: str) -> object | None:
    syroe = _vypolnit("gh", "api", "-H", "Accept: application/vnd.github+json", put)
    if syroe is None:
        return None
    try:
        return json.loads(syroe)
    except json.JSONDecodeError:
        return None


def main() -> int:
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    etot_progon = os.environ.get("GITHUB_RUN_ID", "")
    vyhod = os.environ.get("GITHUB_OUTPUT", "")
    if not repo:
        print("страж: неизвестен репозиторий — гоним полный контур")
        return 0

    imya_dzhoby = os.environ.get(NAZVANIE_DZHOBY, "").strip()
    if not imya_dzhoby:
        print(f"страж: {NAZVANIE_DZHOBY} не задан — гоним полный контур")
        return 0

    nashe_derevo = _vypolnit("git", "rev-parse", "HEAD^{tree}")
    if not nashe_derevo:
        print("страж: не удалось прочитать дерево HEAD — гоним полный контур")
        return 0

    spisok = _api(
        f"/repos/{repo}/actions/workflows/ci.yml/runs"
        f"?status=success&per_page={GLUBINA}"
    )
    if not isinstance(spisok, dict):
        print("страж: список прогонов не прочитан — гоним полный контур")
        return 0
    progony = spisok.get("workflow_runs")
    if not isinstance(progony, list):
        print("страж: список прогонов не прочитан — гоним полный контур")
        return 0

    kandidaty: list[tuple[int, str]] = []
    for p in progony:
        if not isinstance(p, dict):
            continue
        nomer, sha = p.get("id"), p.get("head_sha")
        if not isinstance(nomer, int) or not isinstance(sha, str):
            continue
        if str(nomer) == etot_progon:  # свой же прогон за доказательство не идёт
            continue
        kandidaty.append((nomer, sha))

    def derevo_po_sha(sha: str) -> str | None:
        kommit = _api(f"/repos/{repo}/commits/{sha}")
        if not isinstance(kommit, dict):
            return None
        derevo = kommit.get("commit", {})
        if not isinstance(derevo, dict):
            return None
        t = derevo.get("tree", {})
        return t.get("sha") if isinstance(t, dict) else None

    osmotrennye: list[object] = []

    def polnyy_kontur_proshel(nomer: int) -> bool:
        otvet = _api(f"/repos/{repo}/actions/runs/{nomer}/jobs?per_page=50")
        osmotrennye.append(otvet)
        return kontur_proshel_v_otvete(otvet, imya_dzhoby)

    nayden = reshenie(nashe_derevo, kandidaty, derevo_po_sha, polnyy_kontur_proshel)
    if nayden is None:
        # Джобы осмотрены только у прогонов, где дерево СОВПАЛО. Если такие
        # были, а джобы с настроенным именем не оказалось ни в одном — это не
        # «нечего было находить», это неверно настроенное имя. Молчать здесь
        # значит оставить бесполезный прибор неотличимым от работающего.
        if osmotrennye and not imya_dzhoby_vstrechalos(osmotrennye, imya_dzhoby):
            print(
                f"страж: ⚠️ дерево совпало в {len(osmotrennye)} прогоне(ах), но джобы "
                f"«{imya_dzhoby}» нет ни в одном из них — имя настроено неверно? "
                f"Проверь {NAZVANIE_DZHOBY} в воркфлоу и `name:` дорогой джобы."
            )
        print(f"страж: дерево {nashe_derevo[:12]} полный контур не проходило — гоним")
        return 0

    print(
        f"страж: дерево {nashe_derevo[:12]} побайтово то же, что в прогоне "
        f"{nayden}, и полный контур там ПРОШЁЛ (не пропущен) — не повторяем"
    )
    if vyhod:
        with open(vyhod, "a", encoding="utf-8") as f:
            f.write("uzhe-proveren=da\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
