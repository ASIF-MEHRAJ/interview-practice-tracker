const Store = (() => {
  const PREFIX = 'ipt:';
  const LISTS = ['tasks', 'dsa', 'interviews', 'goals', 'notes', 'activity'];

  const get = (key, fallback = []) => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const set = (key, value) => localStorage.setItem(PREFIX + key, JSON.stringify(value));
  const uid = () => Math.random().toString(36).slice(2, 10);

  const pad = n => String(n).padStart(2, '0');
  const day = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const weekDays = () => {
    const back = (new Date().getDay() + 6) % 7;
    return Array.from({ length: 7 }, (_, i) => day(i - back));
  };

  const settings = () => ({ name: 'Alex', theme: 'dark', reduced: false, ...get('settings', {}) });
  const saveSettings = patch => set('settings', { ...settings(), ...patch });

  const log = text => {
    const items = get('activity');
    items.unshift({ id: uid(), text, ts: Date.now() });
    set('activity', items.slice(0, 40));
  };

  const dayStats = date => {
    const done = get('tasks').filter(t => t.doneOn === date);
    const problems = get('dsa').filter(p => p.status === 'Solved' && p.date === date).length;
    const mocks = get('interviews').filter(i => i.date === date);
    const hours = done.reduce((a, t) => a + Number(t.est || 0), 0)
      + problems * 0.5
      + mocks.reduce((a, i) => a + Number(i.duration || 0) / 60, 0);
    return { tasks: done.length, problems, interviews: mocks.length, hours: Math.round(hours * 10) / 10 };
  };
  const isActive = date => {
    const s = dayStats(date);
    return s.tasks + s.problems + s.interviews > 0;
  };

  const streak = () => {
    let current = 0;
    let offset = isActive(day()) ? 0 : -1;
    while (isActive(day(offset))) { current++; offset--; }
    let longest = 0;
    let run = 0;
    for (let i = -180; i <= 0; i++) {
      run = isActive(day(i)) ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
    return { current, longest: Math.max(longest, current) };
  };

  const seed = () => {
    const hoursAgo = h => Date.now() - h * 36e5;
    const dsa = [
      ['Two Sum', 'LeetCode', 'Arrays', 'Easy', 'Solved', 0, 'Hash map in one pass.'],
      ['Valid Parentheses', 'LeetCode', 'Stack', 'Easy', 'Solved', 0, ''],
      ['Merge Intervals', 'LeetCode', 'Arrays', 'Medium', 'Solved', -1, 'Sort by start time first.'],
      ['Reverse Linked List', 'LeetCode', 'Linked List', 'Easy', 'Solved', -1, ''],
      ['Binary Tree Level Order Traversal', 'LeetCode', 'Trees', 'Medium', 'Solved', -2, 'BFS with a queue.'],
      ['Number of Islands', 'LeetCode', 'Graphs', 'Medium', 'Solved', -2, ''],
      ['Coin Change', 'LeetCode', 'DP', 'Medium', 'Solved', -3, 'Bottom-up table.'],
      ['Longest Substring Without Repeating Characters', 'LeetCode', 'Strings', 'Medium', 'Solved', -3, ''],
      ['Search in Rotated Sorted Array', 'LeetCode', 'Binary Search', 'Medium', 'Solved', -4, ''],
      ['Word Break', 'GeeksforGeeks', 'DP', 'Medium', 'Solved', -5, ''],
      ['Course Schedule', 'LeetCode', 'Graphs', 'Medium', 'Solved', -6, 'Topological sort.'],
      ['Jump Game', 'LeetCode', 'Greedy', 'Medium', 'Solved', -7, ''],
      ['Trapping Rain Water', 'LeetCode', 'Arrays', 'Hard', 'Attempted', -8, 'Two-pointer approach unclear.'],
      ['Median of Two Sorted Arrays', 'LeetCode', 'Binary Search', 'Hard', 'Revisit', -9, ''],
      ['Generate Parentheses', 'LeetCode', 'Recursion', 'Medium', 'Solved', -10, '']
    ].map(([name, platform, topic, difficulty, status, o, notes]) =>
      ({ id: uid(), name, platform, topic, difficulty, status, date: day(o), notes }));

    const tasks = [
      ['Revise graph traversal', 'BFS, DFS and cycle detection patterns.', 'DSA', 'High', 0, 1.5, 'In Progress', ''],
      ['Prepare STAR stories', 'Three stories covering conflict, ownership and failure.', 'HR / Behavioral', 'Medium', 1, 1, 'Todo', ''],
      ['Design a URL shortener', 'Capacity estimates, schema and caching.', 'System Design', 'High', 2, 2, 'Todo', ''],
      ['Update resume', 'Add the latest project and tighten bullet points.', 'Resume', 'Medium', -1, 1, 'Completed', day(-1)],
      ['Review OS scheduling', 'Round robin, priority and multilevel queues.', 'Core CS', 'Low', 4, 1, 'Todo', '']
    ].map(([title, description, category, priority, due, est, status, doneOn]) =>
      ({ id: uid(), title, description, category, priority, due: day(due), est, status, doneOn }));

    const interviews = [
      ['Razorpay', 'Backend screening round', -2, 'Technical', 60, 78, 'Arrays, Hashing', 'Clear approach. Tighten edge-case handling.', ''],
      ['Infosys', 'HR round', -5, 'HR', 30, 84, 'Introduction, Strengths', 'Confident delivery and good examples.', ''],
      ['Zomato', 'Low-level design', -8, 'System Design', 75, 66, 'Schema, Caching', 'Discuss trade-offs earlier.', 'Revisit rate limiting.']
    ].map(([company, title, o, type, duration, score, topics, feedback, notes]) =>
      ({ id: uid(), company, title, date: day(o), type, duration, score, topics, feedback, notes }));

    const notes = [
      ['Tell me about yourself', 'HR Questions', 'Present, past, future in under ninety seconds. Anchor it on the strongest project.'],
      ['Razorpay research', 'Company Research', 'Payments infrastructure, strong engineering blog, focus on reliability and latency.'],
      ['Graph patterns', 'Revision Notes', 'Visited set before pushing to the queue. Use indegree arrays for topological order.']
    ].map(([title, category, content], i) => ({ id: uid(), title, category, content, date: day(-i) }));

    const goals = [
      ['DSA problems', 20, 14],
      ['Mock interviews', 4, 3],
      ['Study hours', 20, 18.5],
      ['HR questions', 15, 9],
      ['Applications', 10, 6]
    ].map(([name, target, done]) => ({ id: uid(), name, target, done }));

    const activity = [
      ['Solved Two Sum', 2],
      ['Finished mock interview with Razorpay', 26],
      ['Updated resume', 30],
      ['Reached 14 of 20 weekly DSA problems', 52]
    ].map(([text, h]) => ({ id: uid(), text, ts: hoursAgo(h) }));

    Object.entries({ tasks, dsa, interviews, notes, goals, activity }).forEach(([k, v]) => set(k, v));
  };

  const ensure = () => {
    if (localStorage.getItem(PREFIX + 'seeded')) return;
    seed();
    localStorage.setItem(PREFIX + 'seeded', '1');
  };

  const exportJSON = () => JSON.stringify({
    app: 'interview-practice-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { ...Object.fromEntries(LISTS.map(k => [k, get(k)])), settings: settings() }
  }, null, 2);

  const importJSON = text => {
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw new Error('The file is not valid JSON.'); }
    const data = parsed && parsed.app === 'interview-practice-tracker' ? parsed.data : null;
    if (!data) throw new Error('This file is not an Interview Practice Tracker export.');
    for (const key of LISTS) {
      if (!Array.isArray(data[key])) throw new Error(`The "${key}" section is missing or invalid.`);
      if (data[key].some(item => typeof item !== 'object' || item === null)) throw new Error(`The "${key}" section contains invalid entries.`);
    }
    if (typeof data.settings !== 'object' || data.settings === null) throw new Error('The settings section is missing.');
    LISTS.forEach(k => set(k, data[k]));
    set('settings', data.settings);
  };

  const reset = () => { seed(); log('Demo data restored'); };
  const clearAll = () => {
    LISTS.forEach(k => set(k, []));
    localStorage.setItem(PREFIX + 'seeded', '1');
  };

  return { get, set, uid, day, weekDays, settings, saveSettings, log, dayStats, streak, ensure, exportJSON, importJSON, reset, clearAll };
})();
