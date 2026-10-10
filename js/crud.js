const Crud = cfg => {
  const { $, esc } = App;
  const view = $('#view');
  const params = new URLSearchParams(location.search);
  const state = { q: params.get('q') || '', f: params.get('f') || '', s: 0 };

  view.innerHTML = `
    <section class="stats" id="cstats"></section>
    <div class="toolbar glass">
      <input type="search" id="cq" placeholder="Search ${cfg.plural}" aria-label="Search ${cfg.plural}" value="${esc(state.q)}">
      <select id="cf" aria-label="${esc(cfg.filter.label)}"><option value="">${esc(cfg.filter.label)}</option>${cfg.filter.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>
      <select id="cs" aria-label="Sort by">${cfg.sorts.map(([l], i) => `<option value="${i}">${l}</option>`).join('')}</select>
      <button class="btn primary" id="ca">Add ${cfg.noun}</button>
    </div>
    <div class="list" id="clist"></div>`;

  const control = (f, value) => {
    const attrs = `id="f-${f.name}" name="${f.name}"`;
    if (f.type === 'select') return `<select ${attrs}>${f.options.map(o => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    if (f.type === 'textarea') return `<textarea ${attrs} rows="3">${esc(value)}</textarea>`;
    const extra = f.type === 'number' ? ` min="0" step="any"${f.max ? ` max="${f.max}"` : ''}` : '';
    return `<input ${attrs} type="${f.type || 'text'}" value="${esc(value)}"${f.required ? ' required' : ''}${extra}>`;
  };
  const field = (f, value) => `<label class="field${f.full ? ' full' : ''}" for="f-${f.name}"><span>${f.label}</span>${control(f, value)}</label>`;
  const initial = f => f.def ?? (f.type === 'select' ? f.options[0] : f.type === 'date' ? Store.day() : '');

  const record = (action, item) => {
    const text = cfg.log?.(item, action);
    if (text) Store.log(text);
    const verb = { add: 'added', edit: 'saved', del: 'deleted', done: 'completed' }[action];
    App.toast(`${cfg.noun} ${verb}`);
    render();
  };
  const finish = (next, prev) => (cfg.stamp ? cfg.stamp(next, prev) : next);

  const open = item => {
    const base = item || {};
    App.modal({
      title: `${item ? 'Edit' : 'Add'} ${cfg.noun.toLowerCase()}`,
      save: item ? 'Save changes' : `Add ${cfg.noun.toLowerCase()}`,
      body: `<div class="grid-form">${cfg.fields.map(f => field(f, base[f.name] ?? initial(f))).join('')}</div>`,
      onSave: data => {
        cfg.fields.filter(f => f.type === 'number' && data[f.name] !== '').forEach(f => { data[f.name] = Number(data[f.name]); });
        const items = Store.get(cfg.key);
        if (item) {
          const i = items.findIndex(x => x.id === item.id);
          items[i] = finish({ ...items[i], ...data }, items[i]);
          Store.set(cfg.key, items);
          record('edit', items[i]);
        } else {
          const created = finish({ id: Store.uid(), ...data }, null);
          Store.set(cfg.key, [created, ...items]);
          record('add', created);
        }
      }
    });
  };

  const card = item => {
    const c = cfg.card(item);
    const done = cfg.done && item[cfg.done.field] === cfg.done.on;
    const chips = c.chips.filter(([t]) => t !== '' && t != null).map(([t, v]) => `<span class="chip" data-v="${esc(v || t)}">${esc(t)}</span>`).join('');
    return `<article class="item glass${done ? ' is-done' : ''}" data-id="${item.id}">
      ${cfg.done ? `<input type="checkbox" class="tick" data-act="done" aria-label="Mark complete"${done ? ' checked' : ''}>` : ''}
      <div class="item-main"><h3>${esc(c.title)}</h3>${c.sub ? `<p>${esc(c.sub)}</p>` : ''}<div class="chips">${chips}</div></div>
      ${cfg.extra ? cfg.extra(item) : ''}
      <div class="item-actions"><button class="btn small" data-act="edit">Edit</button><button class="btn small danger" data-act="del">Delete</button></div></article>`;
  };

  function render() {
    const all = Store.get(cfg.key);
    $('#cstats').innerHTML = cfg.stats(all).map(([l, v]) => `<article class="stat glass"><small>${l}</small><strong>${esc(v)}</strong></article>`).join('');
    const q = state.q.toLowerCase();
    const items = all
      .filter(i => (!state.f || i[cfg.filter.field] === state.f) && (!q || Object.values(i).some(v => String(v).toLowerCase().includes(q))))
      .sort(cfg.sorts[state.s][1]);
    $('#clist').innerHTML = items.length ? items.map(card).join('') : `<div class="empty glass"><p>${cfg.empty}</p></div>`;
  }

  $('#cq').addEventListener('input', e => { state.q = e.target.value; render(); });
  $('#cf').addEventListener('change', e => { state.f = e.target.value; render(); });
  $('#cs').addEventListener('change', e => { state.s = Number(e.target.value); render(); });
  $('#ca').addEventListener('click', () => open());
  $('#clist').addEventListener('click', async e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.item').dataset.id;
    const items = Store.get(cfg.key);
    const item = items.find(x => x.id === id);
    if (btn.dataset.act === 'edit') open(item);
    if (btn.dataset.act === 'del' && await App.confirm(`Delete this ${cfg.noun.toLowerCase()}? This cannot be undone.`, 'Delete')) {
      Store.set(cfg.key, items.filter(x => x.id !== id));
      record('del', item);
    }
    if (btn.dataset.act === 'done') {
      const on = btn.checked;
      const next = finish({ ...item, [cfg.done.field]: on ? cfg.done.on : cfg.done.off }, item);
      Store.set(cfg.key, items.map(x => (x.id === id ? next : x)));
      on ? record('done', next) : render();
    }
  });

  $('#cf').value = state.f;
  render();
  if (params.has('add')) open();
};
