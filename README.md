# Interview Practice Tracker

A bold, app-style dashboard (dark by default, blue accent, bottom tab bar on phones) for tracking interview preparation: DSA questions, tasks, mock interviews, weekly goals, notes and progress analytics. Built with plain HTML, CSS and JavaScript. No framework and no build step.

## Features

- Home page with hero, feature tiles, an up-next carousel and quick filters
- Dashboard with a hero, live statistics, weekly chart with metric switching, category progress, upcoming tasks, streak heatmap and activity timeline
- Tasks, DSA problems, mock interviews and notes with add, edit, delete, search, filter and sort
- Weekly goals with editable targets and quick progress controls
- Analytics page with four charts
- Global search (`Ctrl + K`), notification panel, toast messages and custom modals
- Warm light theme (default) and a dark variant, reduced-motion preference, responsive from 320px up
- JSON export and import with validation, demo data reset, clear all data

## Tech Stack

HTML5, CSS3 (custom flat dark design system), JavaScript ES6+, LocalStorage. [Chart.js](https://www.chartjs.org/) and the Inter font load from a CDN.

## Folder Structure

```text
interview-practice-tracker/
├── index.html            Landing page
├── dashboard.html  tasks.html  dsa.html  interviews.html
├── goals.html  analytics.html  notes.html  settings.html
├── css/                  style.css, dashboard.css, responsive.css
├── js/
│   ├── storage.js        LocalStorage layer, demo data, export and import
│   ├── app.js            Shared shell, theme, search, sheets, modals and toasts
│   ├── crud.js           Reusable list, form and filter engine
│   ├── home.js           Home page
│   └── <page>.js         One script per page
└── assets/
```

## Data Storage

All data is stored in the browser's LocalStorage under keys prefixed with `ipt:`. Data stays on the device and survives refreshes. Use Settings to export a JSON backup.

## Assumptions

The app is client-side only and needs no backend. Dates use the device's local time and weeks start on Monday. Study hours are derived from completed task estimates, solved problems (30 minutes each) and mock interview durations.


## Future Improvements

These are not implemented yet.

- Authentication
- Backend database
- Cloud synchronization
- AI interview analysis
- Multi-device synchronization
