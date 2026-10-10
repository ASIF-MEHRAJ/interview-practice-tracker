const App = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const reduced = () => document.documentElement.dataset.motion === 'reduced';
  const icon = (d, size = 18) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    tasks: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    notes: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
    panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.4 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'
  };

  const ago = ts => {
    const m = Math.round((Date.now() - ts) / 6e4);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
    const d = Math.round(h / 24);
    return d === 1 ? 'Yesterday' : `${d} days ago`;
  };

  const applyPrefs = () => {
    const s = Store.settings();
    document.documentElement.dataset.theme = s.theme;
    const osReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.dataset.motion = s.reduced || osReduced ? 'reduced' : '';
  };

  const toast = (message, type = 'ok') => {
    let box = $('#toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toasts';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.append(box);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    box.append(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 2600);
  };

  const modal = ({ title, body, save = 'Save', onSave, onClose }) => {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<form class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <h2>${esc(title)}</h2><div class="modal-body">${body}</div>
      ${save === null ? '' : `<div class="modal-actions"><button type="button" class="btn" data-x>Cancel</button><button class="btn primary">${esc(save)}</button></div>`}</form>`;
    document.body.append(wrap);
    const previous = document.activeElement;
    const close = () => {
      wrap.classList.add('out');
      setTimeout(() => { wrap.remove(); previous?.focus?.(); onClose?.(); }, 180);
    };
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.dataset.x !== undefined) close(); });
    wrap.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    wrap.firstElementChild.addEventListener('submit', e => {
      e.preventDefault();
      if (onSave?.(Object.fromEntries(new FormData(e.target))) !== false) close();
    });
    requestAnimationFrame(() => { wrap.classList.add('in'); $('input,select,textarea,.btn.primary,.sheet-link', wrap)?.focus(); });
  };

  const confirm = (message, label = 'Confirm') => new Promise(resolve => {
    let accepted = false;
    modal({
      title: 'Are you sure?',
      body: `<p class="muted">${esc(message)}</p>`,
      save: label,
      onSave: () => { accepted = true; resolve(true); },
      onClose: () => { if (!accepted) resolve(false); }
    });
  });

  const chart = (canvas, config) => {
    Chart.defaults.color = cssVar('--muted');
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Object.assign(Chart.defaults.plugins.tooltip, { backgroundColor: cssVar('--surface2'), titleColor: cssVar('--ink'), bodyColor: cssVar('--muted'), borderColor: cssVar('--line'), borderWidth: 1, padding: 12, cornerRadius: 10, displayColors: false });
    Chart.defaults.borderColor = cssVar('--line');
    config.options = { responsive: true, maintainAspectRatio: false, animation: { duration: reduced() ? 0 : 800 }, ...config.options };
    return new Chart(canvas, config);
  };

  const goalPct = () => {
    const goals = Store.get('goals');
    return goals.length ? Math.round(goals.reduce((a, g) => a + Math.min(1, g.done / g.target), 0) / goals.length * 100) : 0;
  };

  const NAV = [
    ['home', 'Home', 'Everything in one place.', 'home', 'index.html'],
    ['dashboard', 'Dashboard', 'Your preparation at a glance.', 'dashboard', 'dashboard.html'],
    ['dsa', 'Questions', 'Log every problem you practice.', 'code', 'dsa.html'],
    ['tasks', 'Tasks', 'Plan and finish your preparation work.', 'tasks', 'tasks.html'],
    ['interviews', 'Interviews', 'Record mock sessions and scores.', 'mic', 'interviews.html'],
    ['goals', 'Goals', 'Set weekly targets and track progress.', 'target', 'goals.html'],
    ['analytics', 'Progress', 'See how your preparation is trending.', 'chart', 'analytics.html'],
    ['notes', 'Notes', 'Keep research and revision in one place.', 'notes', 'notes.html'],
    ['settings', 'Settings', 'Profile, appearance and data.', 'settings', 'settings.html']
  ];
  const PRIMARY = ['home', 'dashboard', 'dsa', 'analytics'];
  const ADD = [['Task', 'tasks.html', 'tasks'], ['Question', 'dsa.html', 'code'], ['Mock interview', 'interviews.html', 'mic'], ['Note', 'notes.html', 'notes']];
  const SEARCH = [
    ['Task', 'tasks.html', 'tasks', 'title', ['description', 'category']],
    ['Problem', 'dsa.html', 'dsa', 'name', ['topic', 'platform']],
    ['Interview', 'interviews.html', 'interviews', 'company', ['title', 'type']],
    ['Note', 'notes.html', 'notes', 'title', ['content', 'category']]
  ];

  const notifications = () => {
    const due = Store.get('tasks').filter(t => t.status !== 'Completed' && t.due <= Store.day()).length;
    const { current } = Store.streak();
    const list = [`Weekly goal is ${goalPct()}% complete.`];
    if (due) list.push(`You have ${due} ${due === 1 ? 'task' : 'tasks'} due today.`);
    if (current) list.push(`Your interview streak is ${current} ${current === 1 ? 'day' : 'days'}.`);
    return list;
  };

  const shell = () => {
    const page = document.body.dataset.page;
    const { theme } = Store.settings();
    const current = NAV.find(n => n[0] === page);
    const view = $('#view');
    const link = ([id, label, , ic, href]) => `<a href="${href}" class="nav-link${id === page ? ' active' : ''}"${id === page ? ' aria-current="page"' : ''}>${icon(ICONS[ic], 20)}<span>${label}</span></a>`;
    document.body.insertAdjacentHTML('afterbegin', `
      <header class="appbar">
        <a class="brand" href="index.html"><span class="logo">IP</span><span>InterviewPrep</span></a>
        <nav class="top-nav" aria-label="Primary">${NAV.map(link).join('')}</nav>
        <div class="tools">
          <button class="icon-btn" id="open-search" aria-label="Search">${icon(ICONS.search)}</button>
          <div class="bell-wrap"><button class="icon-btn" id="bell" aria-label="Notifications" aria-expanded="false">${icon(ICONS.bell)}<b id="bell-count"></b></button><div class="panel" id="bell-panel" hidden></div></div>
          <button class="icon-btn" id="theme" aria-label="Switch to ${theme === 'dark' ? 'light' : 'dark'} theme">${icon(theme === 'dark' ? ICONS.sun : ICONS.moon)}</button>
          <button class="add-btn" id="add" aria-label="Add new">${icon(ICONS.plus, 18)}<span>Add</span></button>
        </div>
      </header>
      <main class="page" id="stage">${page === 'dashboard' || page === 'home' ? '' : `<div class="page-head"><h1>${current[1]}</h1><p>${current[2]}</p></div>`}</main>
      <nav class="bottom-nav" aria-label="Primary mobile">${NAV.filter(n => PRIMARY.includes(n[0])).map(link).join('')}<button class="nav-link" id="more">${icon(ICONS.more, 20)}<span>More</span></button></nav>
      <div class="palette-wrap" id="palette" hidden><div class="palette" role="dialog" aria-modal="true" aria-label="Search">
        <input type="search" id="palette-input" placeholder="Search tasks, problems, interviews and notes" aria-label="Search everything"><div id="palette-results"></div></div></div>`);
    $('#stage').append(view);

    $('#add').addEventListener('click', () => modal({
      title: 'Add new', save: null,
      body: `<div class="sheet-links">${ADD.map(([label, href, ic]) => `<a class="sheet-link" href="${href}?add=1">${icon(ICONS[ic], 20)}<span>${label}</span></a>`).join('')}</div>`
    }));
    $('#more').addEventListener('click', () => modal({
      title: 'More', save: null,
      body: `<div class="sheet-links">${NAV.filter(n => !PRIMARY.includes(n[0])).map(([, label, , ic, href]) => `<a class="sheet-link" href="${href}">${icon(ICONS[ic], 20)}<span>${label}</span></a>`).join('')}</div>`
    }));
    $('#theme').addEventListener('click', () => {
      Store.saveSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
      location.reload();
    });

    const notes = notifications();
    $('#bell-count').textContent = notes.length;
    $('#bell-panel').innerHTML = notes.map(n => `<p>${esc(n)}</p>`).join('');
    $('#bell').addEventListener('click', e => {
      const panel = $('#bell-panel');
      panel.hidden = !panel.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
    });
    document.addEventListener('click', e => { if (!e.target.closest('.bell-wrap')) { $('#bell-panel').hidden = true; $('#bell').setAttribute('aria-expanded', 'false'); } });

    const palette = $('#palette');
    const input = $('#palette-input');
    const results = $('#palette-results');
    const openSearch = () => { palette.hidden = false; input.value = ''; results.innerHTML = ''; input.focus(); };
    const closeSearch = () => { palette.hidden = true; };
    $('#open-search').addEventListener('click', openSearch);
    palette.addEventListener('click', e => { if (e.target === palette) closeSearch(); });
    addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') closeSearch();
    });
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }
      const hits = SEARCH.flatMap(([label, href, key, main, extra]) => Store.get(key)
        .filter(i => [main, ...extra].some(f => String(i[f] ?? '').toLowerCase().includes(q)))
        .slice(0, 4).map(i => `<a class="hit" href="${href}?q=${encodeURIComponent(input.value.trim())}"><span class="chip">${label}</span>${esc(i[main])}</a>`));
      results.innerHTML = hits.join('') || '<p class="muted pad">No matches. Try a different keyword.</p>';
    });
    palette.addEventListener('keydown', e => {
      const items = $$('.hit', palette);
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0])?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? items[i - 1] : input).focus(); }
    });
  };

  const transitions = () => {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href$=".html"], a[href*=".html?"]');
      if (!a || a.target || e.ctrlKey || e.metaKey || e.shiftKey || reduced()) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(() => { location.href = a.href; }, 170);
    });
  };

  const init = () => {
    Store.ensure();
    applyPrefs();
    if (document.body.dataset.page !== 'landing') shell();
    transitions();
  };

  return { $, $$, esc, ago, cssVar, icon, ICONS, toast, modal, confirm, chart, applyPrefs, goalPct, init };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  document.dispatchEvent(new Event('app:ready'));
});
