# Admin Console (`admin`)

A SaaS back-office built with **`@ngbracket/dashboard`, `@ngbracket/data-table`,
`@ngbracket/board`, `@ngbracket/forms`, `@ngbracket/form-kit`, `@ngbracket/guide` and `@ngbracket/auth`**. All data is hardcoded in
[`src/app/data/admin-data.ts`](src/app/data/admin-data.ts).

## Run

```bash
export NGBRACKET_TOKEN=ngbr_…   # once per shell (see the root README)
npm install                      # once
npm run start:admin              # http://localhost:4301
```

## What it shows

| Route | Packs | Highlights |
| --- | --- | --- |
| `/login` | auth | `NgbrLoginForm` + provider buttons (any credentials sign you in) |
| `/overview` | dashboard · charts · guide | `NgbrAppShell` shell, `NgbrStatCard` KPIs with sparklines, line / bar / donut charts, and onboarding: a "Take the tour" product tour, a "Get started" checklist and a beacon on the revenue chart |
| `/customers` | dashboard · data-table | `NgbrDataTable` with sort, search, pagination, **CSV export** and a custom status-badge cell |
| `/tickets` | dashboard · board | `NgbrBoard` work board of support tickets by status: keyboard grab / move / drop, each card's **Move menu** (Shift+F10), pointer drag, a WIP limit, column reorder and "Add a card" |
| `/settings` | dashboard · forms · form-kit | Signal-Forms form with `NgbrErrorSummary`, validation and `forceShowErrors`; a team list built with `NgbrFieldArray` (add, remove and reorder rows) that autosaves with `ngbrAutosave` |

The sidebar (`NgbrSidebarNav`) is wired to the router; the top bar carries the
dark-mode toggle and sign-out.

## Key files

- `shell/admin-shell.ts` — `NgbrAppShell` + router-driven `NgbrSidebarNav`
- `pages/overview.ts` — charts + stat cards, and the tour, checklist and beacon
- `onboarding-state.ts` — in-memory progress for the "Get started" checklist
- `pages/customers.ts` — the data table
- `pages/tickets.ts` — the work board (applies `cardMove` synchronously, as the board asks)
- `pages/settings.ts` — the Signal-Forms settings form and the autosaved team list
