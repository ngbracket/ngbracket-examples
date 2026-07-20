# Almanac — Knowledge Base (`kb`)

A team knowledge base / docs CMS that composes **three NgBracket packs** in one
believable product — **`@ngbracket/navigation`, `@ngbracket/structure` and
`@ngbracket/editor`** — plus **Angular Signal Forms** with the new `formRoot`
directive and `submit()`. All data is hardcoded in an in-memory signal store
([`src/app/data/kb-store.ts`](src/app/data/kb-store.ts)); there is no backend.

## Run

```bash
export NGBRACKET_TOKEN=ngbr_…   # once per shell (see the root README)
npm install                      # once
npm run start:kb                 # http://localhost:4305
```

## What it shows

| Route | Packs | Highlights |
| --- | --- | --- |
| `/browse` | structure · navigation | `NgbrTree` sidebar with a right-click `ngbrContextMenu`; article reader; metadata `NgbrAccordion` |
| `/articles/new`, `/articles/:id/edit` | **editor · structure · forms · navigation** | Signal Form via **`formRoot` + `submit()`**: `NgbrInput`/`NgbrTextarea`, `NgbrTreeSelect` category picker, and `NgbrTabs` switching `NgbrRichText` ⇄ `NgbrMarkdownEditor` for the body |
| `/manage` | structure · navigation | `NgbrToolbar` (New / Export CSV) over an editable `NgbrGrid` |
| `/settings` | navigation · structure | `NgbrTabs` (General / Editor / Accessibility), each an `NgbrAccordion` of preference groups |

The top bar uses `NgbrAppMenubar` (File / View / Help) + the shared dark-mode
toggle; a `SkipLink` and a focusable `#main-content` landmark bracket the shell.

## Accessibility

Built to the same WCAG AA / AXE bar as the packs. Automated sweep (light + dark,
every route):

```bash
npm run start:kb &               # serve on :4305
npm run test:a11y:kb             # Playwright + axe (wcag2a/2aa/21a/21aa) → 0 violations
```

## Signal Forms note

The article form is the reference implementation of the **new** signals API in
this workspace — `<form [formRoot]="f">` binds the `FieldTree` (adds `novalidate`,
intercepts submit) and `submit(f, { action })` runs the save when valid.
`NgbrTreeSelect`, `NgbrRichText` and `NgbrMarkdownEditor` bind via `[formField]`
because they implement `FormValueControl<T>` — no `ControlValueAccessor`.

## Key files

- `shell/kb-shell.ts` — `NgbrAppMenubar` chrome + primary nav + theme toggle
- `pages/browse.ts` — tree + context menu + reader + accordion
- `pages/article-form.ts` — the `formRoot` + `submit()` Signal Form
- `pages/manage.ts` — toolbar + editable grid
- `pages/settings.ts` — tabs + accordions
- `data/kb-store.ts` — in-memory signal store + seed data
