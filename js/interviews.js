document.addEventListener('app:ready', () => {
  const types = ['Technical', 'HR', 'Behavioral', 'System Design'];

  Crud({
    key: 'interviews', noun: 'Interview', plural: 'interviews',
    empty: 'No interviews recorded yet. Save one after your next mock session.',
    fields: [
      { name: 'company', label: 'Company', required: true },
      { name: 'title', label: 'Interview title', required: true },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'type', label: 'Interview type', type: 'select', options: types },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', def: 45 },
      { name: 'score', label: 'Score (0 to 100)', type: 'number', max: 100, def: 70 },
      { name: 'topics', label: 'Topics', full: true },
      { name: 'feedback', label: 'Feedback', type: 'textarea', full: true },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true }
    ],
    filter: { field: 'type', label: 'All types', options: types },
    sorts: [
      ['Newest', (a, b) => b.date.localeCompare(a.date)],
      ['Highest score', (a, b) => b.score - a.score],
      ['Company', (a, b) => a.company.localeCompare(b.company)]
    ],
    card: i => ({ title: `${i.company}: ${i.title}`, sub: i.feedback, chips: [[i.type], [i.date], [`${i.duration} min`], [i.topics]] }),
    extra: i => `<div class="score-ring" style="--p:${i.score}" role="img" aria-label="Score ${i.score} out of 100"><b>${i.score}</b></div>`,
    stats: items => {
      const scores = items.map(i => Number(i.score));
      const latest = [...items].sort((a, b) => b.date.localeCompare(a.date))[0];
      return [
        ['Total interviews', items.length],
        ['Average score', scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '–'],
        ['Best score', scores.length ? Math.max(...scores) : '–'],
        ['Latest interview', latest ? latest.company : '–']
      ];
    },
    log: (i, a) => ({ add: `Finished mock interview with ${i.company}`, edit: `Updated interview with ${i.company}`, del: `Deleted interview with ${i.company}` }[a])
  });
});
