document.addEventListener('app:ready', () => {
  const { $, esc, icon, ICONS } = App;
  const pct = App.goalPct();
  const goals = Store.get('goals');
  const met = goals.filter(g => g.done >= g.target).length;
  const next = Store.get('tasks').filter(t => t.status !== 'Completed').sort((a, b) => a.due.localeCompare(b.due))[0];
  const latest = [...Store.get('interviews')].sort((a, b) => b.date.localeCompare(a.date))[0];
  const solved = Store.get('dsa').filter(p => p.status === 'Solved').length;
  const count = key => Store.get(key).length;

  const features = [['Dashboard', 'dashboard.html', 'dashboard', 'See your week at a glance'], ['Add Question', 'dsa.html?add=1', 'plus', 'Log a problem you solved'], ['Progress', 'analytics.html', 'chart', 'Charts from your real data']]
    .map(([t, href, ic, d]) => `<a class="tile feature" href="${href}"><span class="tile-ico">${icon(ICONS[ic], 24)}</span><b>${t}</b><small>${d}</small></a>`).join('');

  const slides = [
    ['a', 'Today’s focus', next ? next.title : 'No pending tasks', next ? `${next.category} · due ${next.due}` : 'Add a task to plan your next session', 'tasks.html', 'Open tasks'],
    ['b', 'Latest mock interview', latest ? `${latest.company}` : 'No interviews yet', latest ? `${latest.type} · score ${latest.score}` : 'Record your first session', 'interviews.html', 'View interviews'],
    ['c', 'Weekly goals', `${met} of ${goals.length} met`, `${pct}% of your weekly target`, 'goals.html', 'Edit goals']
  ].map(([k, label, title, meta, href, cta]) => `<article class="slide s-${k}"><small>${label}</small><h3>${esc(title)}</h3><p>${esc(meta)}</p><a class="btn small" href="${href}">${cta}</a></article>`).join('');

  const filters = [['DSA problems', 'dsa.html'], ['Hard problems', 'dsa.html?f=Hard'], ['Mock interviews', 'interviews.html'], ['In progress', 'tasks.html?f=In%20Progress'], ['Completed', 'tasks.html?f=Completed']]
    .map(([t, href]) => `<a class="pill" href="${href}">${t}</a>`).join('');

  const areas = [['DSA', 'dsa.html', 'code', `${solved} solved`], ['Interviews', 'interviews.html', 'mic', `${count('interviews')} recorded`], ['Tasks', 'tasks.html', 'tasks', `${count('tasks')} total`], ['Notes', 'notes.html', 'notes', `${count('notes')} saved`]]
    .map(([t, href, ic, d]) => `<a class="tile area" href="${href}"><span class="tile-ico">${icon(ICONS[ic], 26)}</span><b>${t}</b><small>${d}</small></a>`).join('');

  $('#view').innerHTML = `
    <section class="banner">
      <div class="banner-copy">
        <p class="tag">InterviewPrep</p>
        <h1>Interview Prep</h1>
        <p>Track your weekly DSA, Git and technical practice in one place.</p>
        <a class="btn primary big" href="dashboard.html">Open Dashboard</a>
      </div>
      <div class="banner-stat" aria-label="Weekly progress">
        <small>This week</small><b>${pct}%</b>
        <div class="bar" role="progressbar" aria-label="Weekly progress" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
        <span>${Store.streak().current}-day streak</span>
      </div>
    </section>
    <section><header class="sec-head"><h2>Features</h2></header><div class="tiles three">${features}</div></section>
    <section><header class="sec-head"><h2>Up next</h2><div class="car-ctl"><button class="icon-btn" id="prev" aria-label="Previous">‹</button><button class="icon-btn" id="next" aria-label="Next">›</button></div></header><div class="carousel" id="car" tabindex="0" aria-label="Up next">${slides}</div></section>
    <section><header class="sec-head"><h2>Quick Filters</h2></header><div class="pills">${filters}</div></section>
    <section><header class="sec-head"><h2>Practice areas</h2></header><div class="tiles four">${areas}</div></section>`;

  const car = $('#car');
  const step = dir => car.scrollBy({ left: dir * car.clientWidth * 0.85, behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' });
  $('#prev').addEventListener('click', () => step(-1));
  $('#next').addEventListener('click', () => step(1));
});
