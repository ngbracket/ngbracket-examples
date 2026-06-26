# Admin Console (`admin`)

A SaaS back-office built with **`@ngbracket/dashboard`, `@ngbracket/data-table`,
`@ngbracket/forms` and `@ngbracket/auth`**. All data is hardcoded in
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
| `/overview` | dashboard | `NgbrAppShell` shell, `NgbrStatCard` KPIs with sparklines, line / bar / donut charts |
| `/customers` | dashboard · data-table | `NgbrDataTable` with sort, search, pagination, **CSV export** and a custom status-badge cell |
| `/settings` | dashboard · forms | Signal-Forms form with `NgbrErrorSummary`, validation and `forceShowErrors` |

The sidebar (`NgbrSidebarNav`) is wired to the router; the top bar carries the
dark-mode toggle and sign-out.

## Key files

- `shell/admin-shell.ts` — `NgbrAppShell` + router-driven `NgbrSidebarNav`
- `pages/overview.ts` — charts + stat cards
- `pages/customers.ts` — the data table
- `pages/settings.ts` — the Signal-Forms settings form
