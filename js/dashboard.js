document.addEventListener('app:ready', () => {
  const { $, $$, esc, ago, icon, ICONS } = App;
  const view = $('#view');
  const week = Store.weekDays();
  const previous = week.map(d => Store.day(Math.round((new Date(d) - new Date(Store.day())) / 864e5) - 7));
  const sum = (days, key) => days.map(Store.dayStats).reduce((a, d) => a + d[key], 0);
  const stats = week.map(Store.dayStats);
  const pct = App.goalPct();
  const streak = Store.streak();
  const goals = Store.get('goals');
  const categories = ['DSA', 'System Design', 'Mock Interview', 'HR / Behavioral', 'Aptitude', 'Resume', 'Projects', 'Core CS'];
  const targets = { DSA: 30, 'Mock Interview': 10 };
  const rangeFmt = d => new Date(d + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  const trend = (now, before, unit = '') => {
    const diff = Math.round((now - before) * 10) / 10;
    const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
    const sign = diff > 0 ? '↑ ' : diff < 0 ? '↓ ' : '';
    return `<span class="trend ${cls}">${diff === 0 ? 'Same as' : `${sign}${Math.abs(diff)}${unit} vs`} last week</span>`;
  };

  const hero = () => {
    const planned = Store.get('tasks').filter(t => week.includes(t.due));
    const done = planned.filter(t => t.status === 'Completed').length;
    const met = goals.filter(g => g.done >= g.target).length;
    return `<section class="hero card" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="live"></span>Week of ${rangeFmt(week[0])} – ${rangeFmt(week[6])}</p>
        <h2 id="hero-title">Your next opportunity starts here.</h2>
        <p class="sub">Build consistency. Sharpen your skills. Walk into every interview prepared.</p>
        <div class="hero-progress"><div><span>Weekly preparation</span><b>${pct}%</b></div>
          <div class="bar" role="progressbar" aria-label="Weekly preparation" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div></div>
        <dl class="hero-facts">
          <div><dt>Sessions</dt><dd>${done}<small> of ${planned.length} planned</small></dd></div>
          <div><dt>Current streak</dt><dd>${streak.current}<small> ${streak.current === 1 ? 'day' : 'days'}</small></dd></div>
          <div><dt>Weekly target</dt><dd>${met}<small> of ${goals.length} goals met</small></dd></div>
        </dl>
        <div class="hero-actions"><a class="btn primary" href="tasks.html">Plan today</a><a class="btn" href="interviews.html">Log a mock interview</a></div>
      </div>
    </section>`;
  };

  const kpis = () => {
    const solved = Store.get('dsa').filter(p => p.status === 'Solved').length;
    const dsaGoal = goals.find(g => g.name.startsWith('DSA'));
    const dsaPct = dsaGoal ? Math.min(100, Math.round(dsaGoal.done / dsaGoal.target * 100)) : 0;
    const interviews = Store.get('interviews');
    const latest = [...interviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const average = interviews.length ? Math.round(interviews.reduce((a, i) => a + Number(i.score), 0) / interviews.length) : '–';
    const hours = sum(week, 'hours');
    const peak = Math.max(1, ...stats.map(d => d.hours));
    const r = 22;
    return `
      <article class="kpi"><header>${icon(ICONS.code)}<small>DSA problems solved</small></header>
        <strong>${solved}</strong>
        <div class="bar" role="progressbar" aria-label="Weekly DSA target" aria-valuenow="${dsaPct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${dsaPct}%"></i></div>
        <footer>${trend(sum(week, 'problems'), sum(previous, 'problems'))}</footer></article>
      <article class="kpi"><header>${icon(ICONS.mic)}<small>Mock interviews</small></header>
        <strong>${interviews.length}</strong>
        <div class="scores" aria-label="Latest scores">${latest.map(i => `<span>${i.score}</span>`).join('') || '<em>No scores yet</em>'}<small>avg ${average}</small></div>
        <footer>${trend(sum(week, 'interviews'), sum(previous, 'interviews'))}</footer></article>
      <article class="kpi"><header>${icon(ICONS.clock)}<small>Study hours</small></header>
        <strong>${hours.toFixed(1)}<small> hrs</small></strong>
        <div class="spark" aria-hidden="true">${stats.map(d => `<i style="height:${Math.max(8, d.hours / peak * 100)}%"></i>`).join('')}</div>
        <footer>${trend(hours, sum(previous, 'hours'), 'h')}</footer></article>
      <article class="kpi kpi-ring"><header>${icon(ICONS.target)}<small>Weekly completion</small></header>
        <div class="mini-ring"><svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="${r}" pathLength="100"/><circle class="val" cx="28" cy="28" r="${r}" pathLength="100" transform="rotate(-90 28 28)" style="stroke-dasharray:${pct} 100"/></svg><strong>${pct}%</strong></div>
        <footer><span class="trend">${goals.filter(g => g.done >= g.target).length} of ${goals.length} goals met</span></footer></article>`;
  };

  const dueLabel = due => {
    if (due < Store.day()) return ['Overdue', true];
    if (due === Store.day()) return ['Today', false];
    if (due === Store.day(1)) return ['Tomorrow', false];
    return [new Date(due + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), false];
  };

  const upcoming = () => {
    const pending = Store.get('tasks').filter(t => t.status !== 'Completed').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 6);
    if (!pending.length) return `<div class="empty-state">${icon(ICONS.check, 28)}<b>You're all caught up</b><span>Add a task to plan your next session.</span></div>`;
    return pending.map(t => {
      const [label, late] = dueLabel(t.due);
      return `<label class="task"><input type="checkbox" class="tick" data-id="${t.id}"><span class="task-main"><b>${esc(t.title)}</b><span><em>${esc(t.category)}</em><em class="${late ? 'late' : ''}">${label}</em></span></span><i class="prio ${t.priority.toLowerCase()}" title="${t.priority} priority"></i></label>`;
    }).join('');
  };

  const goalRows = () => goals.map(g => {
    const p = Math.min(100, Math.round(g.done / g.target * 100)) || 0;
    return `<li><div><span>${esc(g.name)}</span><b>${g.done} / ${g.target}</b></div><div class="bar${p >= 100 ? ' full' : ''}" role="progressbar" aria-label="${esc(g.name)}" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div></li>`;
  }).join('');

  const categoryRows = () => {
    const tasks = Store.get('tasks');
    return categories.map(c => {
      const count = c === 'DSA' ? Store.get('dsa').filter(p => p.status === 'Solved').length
        : c === 'Mock Interview' ? Store.get('interviews').length
          : tasks.filter(t => t.category === c && t.status === 'Completed').length;
      const target = targets[c] || 5;
      const p = Math.min(100, Math.round(count / target * 100));
      return `<li><div><span>${c}</span><b>${count} / ${target}</b></div><div class="bar" role="progressbar" aria-label="${c} progress" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div></li>`;
    }).join('');
  };

  const activityIcon = text => {
    if (/solved|problem/i.test(text)) return ICONS.code;
    if (/interview/i.test(text)) return ICONS.mic;
    if (/goal/i.test(text)) return ICONS.target;
    if (/note|resume|updated/i.test(text)) return ICONS.notes;
    return ICONS.tasks;
  };
  const timeline = () => Store.get('activity').slice(0, 6)
    .map(a => `<li><span class="t-ico">${icon(activityIcon(a.text), 14)}</span><div><p>${esc(a.text)}</p><small>${ago(a.ts)}</small></div></li>`).join('');

  const heatmap = () => {
    const back = (new Date().getDay() + 6) % 7;
    const cells = [];
    for (let i = -(15 * 7 + back); i <= 0; i++) {
      const date = Store.day(i);
      const s = Store.dayStats(date);
      const level = Math.min(4, s.tasks + s.problems + s.interviews);
      cells.push(`<button class="cell l${level}" data-date="${date}" aria-label="${date}: ${s.tasks} tasks, ${s.hours} hours, ${s.problems} problems"></button>`);
    }
    return cells.join('');
  };

  const today = Store.dayStats(Store.day());
  view.innerHTML = `
    ${hero()}
    <section class="kpis" aria-label="Key statistics">${kpis()}</section>
    <section class="grid">
      <article class="card pad s8">
        <header class="card-head"><div><h3>Weekly performance</h3><p>Seven-day activity from your logged work</p></div>
          <div class="seg-group" role="group" aria-label="Chart metric">${['Tasks', 'DSA', 'Study Hours', 'Mock Interviews'].map((t, i) => `<button class="seg" aria-pressed="${i === 0}" data-i="${i}">${t}</button>`).join('')}</div></header>
        <div class="chart-box"><canvas id="week-chart" aria-label="Weekly performance chart" role="img"></canvas></div>
      </article>
      <article class="card pad s4"><header class="card-head"><div><h3>Upcoming tasks</h3><p>Next up, by due date</p></div><a class="link" href="tasks.html">View all</a></header><div class="tasks" id="upcoming">${upcoming()}</div></article>
      <article class="card pad s5"><header class="card-head"><div><h3>Recent activity</h3><p>What you did lately</p></div></header><ul class="timeline" id="timeline">${timeline()}</ul></article>
      <article class="card pad s7"><header class="card-head"><div><h3>Categories</h3><p>Progress toward each focus area</p></div></header><ul class="meters">${categoryRows()}</ul></article>
      <article class="card pad s5"><header class="card-head"><div><h3>Weekly goals</h3><p>Targets you set</p></div><a class="link" href="goals.html">Edit</a></header><ul class="meters one">${goalRows()}</ul></article>
      <article class="card pad s7">
        <header class="card-head"><div><h3>Consistency</h3><p>Sixteen weeks of practice</p></div></header>
        <dl class="streak-row"><div><dt>Current streak</dt><dd>${streak.current}</dd></div><div><dt>Longest streak</dt><dd>${streak.longest}</dd></div><div><dt>Today</dt><dd>${today.tasks + today.problems + today.interviews}</dd></div></dl>
        <div class="heat" id="heat">${heatmap()}</div>
        <p class="heat-tip" id="heat-tip" aria-live="polite">Hover a day to see its details.</p>
      </article>
    </section>`;

  const series = [
    ['Tasks completed', stats.map(d => d.tasks)],
    ['Problems solved', stats.map(d => d.problems)],
    ['Study hours', stats.map(d => d.hours)],
    ['Mock interviews', stats.map(d => d.interviews)]
  ];
  const canvas = $('#week-chart');
  const fill = canvas.getContext('2d').createLinearGradient(0, 0, 0, 280);
  fill.addColorStop(0, 'rgba(61,123,255,.35)');
  fill.addColorStop(1, 'rgba(34,211,238,0)');
  const chart = App.chart(canvas, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ label: series[0][0], data: series[0][1], borderColor: App.cssVar('--a'), backgroundColor: fill, fill: true, tension: 0.42, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6, pointHoverBackgroundColor: App.cssVar('--b') }]
    },
    options: { interaction: { intersect: false, mode: 'index' }, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: App.cssVar('--line') }, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } } }
  });

  $$('.seg').forEach(btn => btn.addEventListener('click', () => {
    $$('.seg').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const [label, data] = series[Number(btn.dataset.i)];
    chart.data.datasets[0].label = label;
    chart.data.datasets[0].data = data;
    chart.update();
  }));

  $('#upcoming').addEventListener('change', e => {
    const row = e.target.closest('.task');
    if (!row || !e.target.dataset.id) return;
    const tasks = Store.get('tasks');
    const t = tasks.find(x => x.id === e.target.dataset.id);
    t.status = 'Completed';
    t.doneOn = Store.day();
    Store.set('tasks', tasks);
    Store.log(`Completed ${t.title}`);
    App.toast('Task completed');
    row.classList.add('leaving');
    setTimeout(() => { $('#upcoming').innerHTML = upcoming(); $('#timeline').innerHTML = timeline(); }, 320);
  });

  $('#heat').addEventListener('pointerover', e => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const s = Store.dayStats(cell.dataset.date);
    $('#heat-tip').textContent = `${rangeFmt(cell.dataset.date)}: ${s.tasks} tasks completed, ${s.hours} study hours, ${s.problems} problems solved`;
  });
});
