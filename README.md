# my-schedule

Mobile-friendly personal schedule and contacts app built on the original Vite + React JavaScript setup.

## Run locally

Use Node.js 22.12+ (or a newer supported Node version).

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Both `/` and `/contacts` work through React Router.

```bash
npm run build
npm run preview
```

`npm run lint` uses the repository's existing Oxlint setup.

## Project layout

- `src/App.jsx`: application routes.
- `src/pages/SchedulePage.jsx`: weekly day picker, schedule blocks, focus timer, daily progress, and export.
- `src/pages/ContactsPage.jsx`: search, group filters, favourites, contact editing, deletion confirmation, phone/email links, and call scheduling.
- `src/components/ui.jsx`: reusable accessible controls using Radix UI.
- `src/App.css`: app styling and responsive layouts.
- `src/index.css`: global reset.
- `public/favicon.svg`: app icon.

The project keeps the original `vite.config.js`, `src/main.jsx`, npm scripts, and React dependencies. Added runtime packages are `react-router-dom`, `lucide-react`, `radix-ui`, and `sonner`.

## Included features

- Mobile layout, touch controls, and bottom navigation.
- Desktop Schedule/Contacts navigation.
- Add, complete, and delete schedule blocks.
- Select dates and browse weeks.
- Start, pause, resume, and reset the focus timer.
- Dark/light mode shared between pages.
- Contact groups, favourites, search, add/edit, and confirmed deletion.
- Schedule a contact call on a chosen date and view it on the schedule.
- Reject overlapping blocks and calls, invalid email addresses, and invalid time ranges.
- Sample contacts and schedule blocks for a first-use preview.

## Data storage

This version uses browser localStorage: `myshcedule-blocks`, `myshcedule-contacts`, and `myshcedule-theme`. Data is specific to the browser and origin; it does not sync across devices or automatically transfer from the hosted preview.

MySQL is not connected in this frontend adaptation. To use MySQL, add a backend API (for example PHP, Laravel, or Node.js) with endpoints for contacts and schedule blocks, then replace the browser-storage operations with API calls. Database credentials belong only in the backend environment, never in React source or `VITE_` environment variables.

## Hosting

Deploy the generated `dist/` directory to a static host. Configure an SPA fallback to `index.html` so opening or refreshing `/contacts` works. Vite's dev and preview servers already provide this fallback. If hosting in a subdirectory, configure the Vite base and router basename together.

## Applying this update

Copy the files from this archive into your existing project, then run `npm ci`. Keep your existing `.git` directory. `node_modules`, build output, Git metadata, and environment secrets are excluded from the archive.

The adaptation is based on repository commit `296fc72342bf8fe9fc9050a621a965246e7b4347`. No changes have been pushed to GitHub.
