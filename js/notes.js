document.addEventListener('app:ready', () => {
  const categories = ['Interview Notes', 'HR Questions', 'Company Research', 'Technical Notes', 'Revision Notes'];

  Crud({
    key: 'notes', noun: 'Note', plural: 'notes',
    empty: 'No notes match. Capture what you learned from your last session.',
    fields: [
      { name: 'title', label: 'Title', required: true, full: true },
      { name: 'category', label: 'Category', type: 'select', options: categories },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'content', label: 'Content', type: 'textarea', full: true }
    ],
    filter: { field: 'category', label: 'All categories', options: categories },
    sorts: [
      ['Newest', (a, b) => b.date.localeCompare(a.date)],
      ['Title', (a, b) => a.title.localeCompare(b.title)]
    ],
    card: n => ({ title: n.title, sub: n.content, chips: [[n.category], [n.date]] }),
    stats: items => [['Total notes', items.length], ...categories.slice(0, 3).map(c => [c, items.filter(n => n.category === c).length])],
    log: (n, a) => ({ add: `Added note ${n.title}`, edit: `Updated note ${n.title}`, del: `Deleted note ${n.title}` }[a])
  });
});
