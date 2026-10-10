document.addEventListener('app:ready', () => {
  const topics = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs', 'DP', 'Greedy', 'Binary Search', 'Recursion'];
  const levels = ['Easy', 'Medium', 'Hard'];

  Crud({
    key: 'dsa', noun: 'Problem', plural: 'problems',
    empty: 'No problems match. Log a problem after your next practice session.',
    fields: [
      { name: 'name', label: 'Problem name', required: true, full: true },
      { name: 'platform', label: 'Platform', def: 'LeetCode' },
      { name: 'topic', label: 'Topic', type: 'select', options: topics },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: levels },
      { name: 'status', label: 'Status', type: 'select', options: ['Solved', 'Attempted', 'Revisit'] },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true }
    ],
    filter: { field: 'difficulty', label: 'All difficulties', options: levels },
    sorts: [
      ['Newest', (a, b) => b.date.localeCompare(a.date)],
      ['Name', (a, b) => a.name.localeCompare(b.name)],
      ['Difficulty', (a, b) => levels.indexOf(b.difficulty) - levels.indexOf(a.difficulty)]
    ],
    done: { field: 'status', on: 'Solved', off: 'Attempted' },
    stamp: (next, prev) => (next.status === 'Solved' && prev?.status !== 'Solved' && prev ? { ...next, date: Store.day() } : next),
    card: p => ({ title: p.name, sub: p.notes, chips: [[p.difficulty], [p.topic], [p.platform], [p.date], [p.status]] }),
    stats: items => {
      const solved = items.filter(p => p.status === 'Solved');
      const count = l => solved.filter(p => p.difficulty === l).length;
      return [['Total solved', solved.length], ['Easy', count('Easy')], ['Medium', count('Medium')], ['Hard', count('Hard')], ['Current streak', `${Store.streak().current} days`]];
    },
    log: (p, a) => ({ add: `Added problem ${p.name}`, done: `Solved ${p.name}`, edit: `Updated problem ${p.name}`, del: `Deleted problem ${p.name}` }[a])
  });
});
