(() => {
  'use strict';

  const container = document.getElementById('claude-limits');
  if (!container) return;

  const refreshEveryMs = 30_000;
  const staleAfterMs = 5 * 60_000;
  const percentFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
  const dateFormat = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  let sample = null;
  let requestPending = false;
  let failed = false;
  let pendingRefreshPoll = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function dateMs(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }

  function percent(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
  }

  function percentage(value) {
    return value === null ? '—' : percentFormat.format(value) + '%';
  }

  function resetDateMs(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
    const ms = value * 1000;
    return Number.isFinite(new Date(ms).getTime()) ? ms : null;
  }

  function relativeReset(ms) {
    const minutes = Math.ceil((ms - Date.now()) / 60_000);
    if (minutes <= 0) return 'срок сброса прошёл';
    if (minutes < 60) return 'через ' + minutes + ' мин';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (hours < 24) return 'через ' + hours + ' ч' + (remainder ? ' ' + remainder + ' мин' : '');
    const days = Math.floor(hours / 24);
    return 'через ' + days + ' д' + (hours % 24 ? ' ' + (hours % 24) + ' ч' : '');
  }

  const heading = element('div', 'claude-limits-heading');
  const title = element('h2', '', 'Лимиты Claude');
  title.id = 'claude-limits-title';
  container.setAttribute('aria-labelledby', title.id);
  const freshness = element('span', 'claude-limits-freshness', 'Загрузка…');
  freshness.setAttribute('role', 'status');
  const refreshButton = element('button', 'claude-limits-refresh', 'Обновить');
  refreshButton.type = 'button';
  refreshButton.setAttribute('aria-label', 'Обновить статистику лимитов Claude');
  heading.append(title, freshness, refreshButton);
  const grid = element('div', 'claude-limits-grid');
  container.replaceChildren(heading, grid);

  function renderWindow(window, now) {
    const label = typeof window.label === 'string' && window.label.trim()
      ? window.label.slice(0, 80) : 'Лимит';
    const observedAt = dateMs(window.observedAt) ?? dateMs(sample?.updatedAt);
    const resetMs = resetDateMs(window.resetsAt);
    const expired = resetMs !== null && resetMs <= now;
    const stale = failed || Boolean(sample?.refreshError) || window.stale === true || observedAt === null
      || now - observedAt > staleAfterMs || observedAt - now > 60_000;
    const used = expired ? null : percent(window.usedPercent);
    const remaining = expired ? null : percent(window.remainingPercent);
    const unavailable = used === null && remaining === null;
    const exceeded = window.status === 'rejected' || used !== null && used >= 100;
    const warning = window.status === 'allowed_warning' || used !== null && used >= 80;

    const card = element('article', 'claude-limit-window');
    if (stale || expired) card.classList.add('is-stale');
    else if (exceeded) card.classList.add('is-exceeded');
    else if (warning) card.classList.add('is-warning');
    const cardHeading = element('div', 'claude-limit-window-heading');
    cardHeading.append(element('h3', '', label));
    let state = '';
    if (expired) state = 'Ожидаем новый замер';
    else if (unavailable) state = 'Нет данных';
    else if (stale) state = 'Устаревшие данные';
    else if (exceeded) state = 'Лимит исчерпан';
    else if (warning) state = 'Близко к лимиту';
    if (state) cardHeading.append(element('span', 'claude-limit-window-state', state));

    const values = element('div', 'claude-limit-values');
    const consumed = element('span', '', 'Использовано ');
    consumed.append(element('strong', '', percentage(used)));
    const available = element('span', '', 'Осталось ');
    available.append(element('strong', '', percentage(remaining)));
    values.append(consumed, available);

    const track = element('div', 'claude-limit-track');
    const fill = element('div', 'claude-limit-fill');
    if (used !== null) {
      fill.style.width = Math.min(100, used) + '%';
      track.setAttribute('role', 'progressbar');
      track.setAttribute('aria-label', label + ': использовано' + (stale ? ', сохранённый неактуальный замер' : ''));
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', '100');
      track.setAttribute('aria-valuenow', String(Math.min(100, used)));
      track.setAttribute('aria-valuetext', percentage(used) + (stale ? ' — устаревшие данные' : ''));
    } else {
      track.classList.add('is-empty');
      track.setAttribute('aria-hidden', 'true');
    }
    track.append(fill);
    const reset = element('p', 'claude-limit-reset');
    reset.textContent = resetMs === null ? 'Сброс: нет данных'
      : 'Сброс ' + dateFormat.format(resetMs) + ' МСК · ' + relativeReset(resetMs);
    card.append(cardHeading, values, track, reset);
    if (expired) card.append(element('p', 'claude-limit-expired', 'Предыдущий замер скрыт после срока сброса.'));
    return card;
  }

  function render() {
    const now = Date.now();
    const validWindows = Array.isArray(sample?.windows)
      ? sample.windows.filter(window => window && typeof window === 'object') : [];
    const windows = [
      validWindows.find(window => window.id === 'five_hour') || { label: '5 часов' },
      validWindows.find(window => window.id === 'seven_day') || { label: '7 дней' }
    ];
    grid.replaceChildren(...windows.map(window => renderWindow(window, now)));
    const updatedAt = dateMs(sample?.updatedAt);
    const anyStale = windows.some(window => {
      const observedAt = dateMs(window.observedAt) ?? updatedAt;
      const resetMs = resetDateMs(window.resetsAt);
      return window.stale === true || observedAt === null || now - observedAt > staleAfterMs
        || observedAt - now > 60_000 || resetMs !== null && resetMs <= now;
    });
    freshness.textContent = failed ? 'Нет связи · данные не актуальны'
      : sample?.refreshing ? 'Обновляем…'
      : sample?.refreshError ? 'Не удалось обновить · сохранённый замер'
      : sample === null ? (requestPending ? 'Загрузка…' : 'Нет данных')
      : anyStale ? 'Нужен свежий замер' : 'Актуальный замер';
    freshness.classList.toggle('is-stale', failed || Boolean(sample?.refreshError) || sample !== null && anyStale);
    refreshButton.disabled = requestPending || !failed && sample?.refreshing === true;
    container.setAttribute('aria-busy', String(requestPending || !failed && sample?.refreshing === true));
  }

  async function refreshLimits(force = false) {
    if (requestPending) return;
    clearTimeout(pendingRefreshPoll);
    requestPending = true;
    refreshButton.disabled = true;
    container.setAttribute('aria-busy', 'true');
    if (sample === null) render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(force ? '/api/limits?refresh=1' : '/api/limits', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Limits unavailable');
      const result = await response.json();
      if (!result || typeof result !== 'object' || !Array.isArray(result.windows)) {
        throw new Error('Invalid limits response');
      }
      sample = result;
      failed = false;
    } catch {
      failed = true;
    } finally {
      clearTimeout(timeout);
      requestPending = false;
      render();
      if (sample?.refreshing && !failed) pendingRefreshPoll = setTimeout(() => refreshLimits(), 3_000);
    }
  }

  refreshButton.addEventListener('click', () => refreshLimits(true));
  render();
  refreshLimits();
  setInterval(refreshLimits, refreshEveryMs);

  setInterval(render, 15_000);
})();
