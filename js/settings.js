document.addEventListener('app:ready', () => {
  const { $, esc } = App;
  const s = Store.settings();

  $('#view').innerHTML = `
    <section class="settings">
      <article class="card pad"><h3>Profile</h3>
        <label class="field"><span>Username</span><input id="s-name" maxlength="24" value="${esc(s.name)}"></label>
        <button class="btn primary" id="s-save">Save username</button></article>
      <article class="card pad"><h3>Appearance</h3>
        <div class="seg-group" role="group" aria-label="Theme">
          <button class="seg" data-mode="dark" aria-pressed="${s.theme === 'dark'}">Dark</button>
          <button class="seg" data-mode="light" aria-pressed="${s.theme === 'light'}">Light</button></div></article>
      <article class="card pad"><h3>Preferences</h3>
        <label class="check"><input type="checkbox" id="s-motion"${s.reduced ? ' checked' : ''}> Reduce motion</label></article>
      <article class="card pad"><h3>Data</h3>
        <div class="row">
          <button class="btn" id="s-export">Export data</button>
          <button class="btn" id="s-import">Import data</button>
          <button class="btn" id="s-reset">Reset demo data</button>
          <button class="btn danger" id="s-clear">Clear all data</button>
        </div>
        <input type="file" id="s-file" accept="application/json,.json" hidden></article>
    </section>`;

  $('#s-save').addEventListener('click', () => {
    const name = $('#s-name').value.trim();
    if (!name) { App.toast('Enter a username', 'warn'); return; }
    Store.saveSettings({ name });
    App.toast('Settings saved');
  });

  document.querySelectorAll('.seg[data-mode]').forEach(b => b.addEventListener('click', () => {
    Store.saveSettings({ theme: b.dataset.mode });
    location.reload();
  }));

  $('#s-motion').addEventListener('change', e => {
    Store.saveSettings({ reduced: e.target.checked });
    App.applyPrefs();
    App.toast('Settings saved');
  });

  $('#s-export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([Store.exportJSON()], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `interview-tracker-${Store.day()}.json` });
    a.click();
    URL.revokeObjectURL(url);
    App.toast('Data exported');
  });

  $('#s-import').addEventListener('click', () => $('#s-file').click());
  $('#s-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    try {
      JSON.parse(text);
    } catch {
      App.toast('The file is not valid JSON.', 'warn');
      return;
    }
    if (!await App.confirm('Importing replaces all current data with the contents of this file.', 'Import')) return;
    try {
      Store.importJSON(text);
      location.reload();
    } catch (err) {
      App.toast(err.message, 'warn');
    }
  });

  $('#s-reset').addEventListener('click', async () => {
    if (!await App.confirm('Replace your current data with the demo data?', 'Reset')) return;
    Store.reset();
    location.reload();
  });
  $('#s-clear').addEventListener('click', async () => {
    if (!await App.confirm('Delete every task, problem, interview, goal and note. This cannot be undone.', 'Clear all')) return;
    Store.clearAll();
    location.reload();
  });
});
