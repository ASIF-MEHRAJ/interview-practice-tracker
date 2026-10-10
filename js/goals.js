document.addEventListener('app:ready', () => {
  const { $, esc } = App;
  const view = $('#view');

  const render = () => {
    const goals = Store.get('goals');
    view.innerHTML = `<div class="goal-grid">${goals.map(g => {
      const pct = Math.min(100, Math.round(g.done / g.target * 100)) || 0;
      return `<article class="goal card" data-id="${g.id}">
        <h3>${esc(g.name)}</h3>
        <div class="goal-pct">${pct}%</div>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
        <dl><div><dt>Completed</dt><dd>${g.done}</dd></div><div><dt>Remaining</dt><dd>${Math.max(0, Math.round((g.target - g.done) * 10) / 10)}</dd></div></dl>
        <div class="goal-controls">
          <label class="field"><span>Weekly target</span><input type="number" min="1" step="any" value="${g.target}" data-act="target"></label>
          <div class="stepper"><button class="btn small" data-act="minus" aria-label="Decrease completed">−</button><button class="btn small" data-act="plus" aria-label="Increase completed">+</button></div>
        </div></article>`;
    }).join('')}</div>`;
  };

  const update = (id, fn) => {
    const goals = Store.get('goals');
    const g = goals.find(x => x.id === id);
    const before = g.done >= g.target;
    fn(g);
    Store.set('goals', goals);
    if (!before && g.done >= g.target) Store.log(`Completed weekly goal: ${g.name}`);
    App.toast('Goal updated');
    render();
  };

  view.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act !== 'plus' && act !== 'minus') return;
    update(e.target.closest('.goal').dataset.id, g => { g.done = Math.max(0, g.done + (act === 'plus' ? 1 : -1)); });
  });
  view.addEventListener('change', e => {
    if (e.target.dataset.act !== 'target') return;
    const value = Number(e.target.value);
    if (!(value > 0)) { App.toast('Enter a target above zero', 'warn'); render(); return; }
    update(e.target.closest('.goal').dataset.id, g => { g.target = value; });
  });
  render();
});
