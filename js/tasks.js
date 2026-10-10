document.addEventListener('app:ready', () => {
  const categories = ['DSA', 'System Design', 'Mock Interview', 'HR / Behavioral', 'Aptitude', 'Resume', 'Projects', 'Core CS'];
  const priorities = ['Low', 'Medium', 'High'];
  const statuses = ['Todo', 'In Progress', 'Completed'];
  const rank = p => priorities.indexOf(p);

  Crud({
    key: 'tasks', noun: 'Task', plural: 'tasks',
    empty: 'No tasks match. Add one to plan your next session.',
    fields: [
      { name: 'title', label: 'Title', required: true, full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'category', label: 'Category', type: 'select', options: categories },
      { name: 'priority', label: 'Priority', type: 'select', options: priorities, def: 'Medium' },
      { name: 'due', label: 'Due date', type: 'date' },
      { name: 'est', label: 'Estimated time (hours)', type: 'number', def: 1 },
      { name: 'status', label: 'Status', type: 'select', options: statuses }
    ],
    filter: { field: 'status', label: 'All statuses', options: statuses },
    sorts: [
      ['Due date', (a, b) => a.due.localeCompare(b.due)],
      ['Priority', (a, b) => rank(b.priority) - rank(a.priority)],
      ['Title', (a, b) => a.title.localeCompare(b.title)]
    ],
    done: { field: 'status', on: 'Completed', off: 'Todo' },
    stamp: (next, prev) => ({ ...next, doneOn: next.status === 'Completed' ? (prev?.status === 'Completed' && prev.doneOn) || Store.day() : '' }),
    card: t => ({
      title: t.title, sub: t.description,
      chips: [[t.category], [t.priority], [`Due ${t.due}`], [`${t.est}h`], [t.status]]
    }),
    stats: items => [
      ['Total', items.length],
      ['To do', items.filter(t => t.status === 'Todo').length],
      ['In progress', items.filter(t => t.status === 'In Progress').length],
      ['Completed', items.filter(t => t.status === 'Completed').length]
    ],
    log: (t, a) => ({ add: `Added task ${t.title}`, done: `Completed ${t.title}`, edit: `Updated task ${t.title}`, del: `Deleted task ${t.title}` }[a])
  });
});
