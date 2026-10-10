document.addEventListener('app:ready', () => {
  const { $ } = App;
  $('#view').innerHTML = `<section class="charts">
    <article class="card pad"><h3>Weekly performance</h3><div class="chart-box"><canvas id="c-week" role="img" aria-label="Tasks and problems per day this week"></canvas></div></article>
    <article class="card pad"><h3>Monthly performance</h3><div class="chart-box"><canvas id="c-month" role="img" aria-label="Problems solved per week over four weeks"></canvas></div></article>
    <article class="card pad"><h3>DSA progress by topic</h3><div class="chart-box"><canvas id="c-topics" role="img" aria-label="Solved problems by topic"></canvas></div></article>
    <article class="card pad"><h3>Interview scores</h3><div class="chart-box"><canvas id="c-scores" role="img" aria-label="Interview scores over time"></canvas></div></article>
  </section>`;

  const a = App.cssVar('--a');
  const b = App.cssVar('--b');
  const week = Store.weekDays();
  const stats = week.map(Store.dayStats);
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scales = { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } };

  App.chart($('#c-week'), {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Tasks', data: stats.map(s => s.tasks), backgroundColor: a, borderRadius: 8 },
      { label: 'Problems', data: stats.map(s => s.problems), backgroundColor: b, borderRadius: 8 }
    ] },
    options: { scales }
  });

  const weeks = [3, 2, 1, 0].map(w => {
    let n = 0;
    for (let i = 0; i < 7; i++) n += Store.dayStats(Store.day(-(w * 7 + i))).problems;
    return n;
  });
  App.chart($('#c-month'), {
    type: 'line',
    data: { labels: ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'], datasets: [{ label: 'Problems solved', data: weeks, borderColor: b, backgroundColor: 'transparent', tension: 0.35, pointRadius: 4 }] },
    options: { scales }
  });

  const topics = {};
  Store.get('dsa').filter(p => p.status === 'Solved').forEach(p => { topics[p.topic] = (topics[p.topic] || 0) + 1; });
  App.chart($('#c-topics'), {
    type: 'doughnut',
    data: { labels: Object.keys(topics), datasets: [{ data: Object.values(topics), borderWidth: 0, backgroundColor: Object.keys(topics).map((_, i) => ['#3d7bff', '#22d3ee', '#2ecc8f', '#f5a524', '#ff5d5d', '#8b93a5', '#5b6478'][i % 7]) }] },
    options: { cutout: '62%', plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }
  });

  const interviews = [...Store.get('interviews')].sort((x, y) => x.date.localeCompare(y.date));
  App.chart($('#c-scores'), {
    type: 'line',
    data: { labels: interviews.map(i => i.company), datasets: [{ label: 'Score', data: interviews.map(i => i.score), borderColor: a, backgroundColor: 'transparent', tension: 0.3, pointRadius: 5 }] },
    options: { scales: { y: { min: 0, max: 100 }, x: { grid: { display: false } } } }
  });
});
