# NgBracket Examples

> 🚀 **New to NgBracket?** Accessible Angular component packs, built to support WCAG 2.2 AA — see [ngbracket.com](https://ngbracket.com?utm_source=github&utm_medium=readme&utm_content=examples).

Close-to-real-world Angular applications that consume the **published
[NgBracket](https://ngbracket.com) component packs** straight from the private
registry. They exist to (1) prove the packages work in real apps, and (2) give you
clone-and-go starter templates.

All data is **hardcoded** — there's no backend or API to run.

| App | Port | Packs showcased | What it is |
| --- | --- | --- | --- |
| **admin** | 4301 | dashboard · data-table · board · forms · auth | A SaaS back-office: KPI dashboard, customers table, support-ticket work board, settings forms |
| **storefront** | 4302 | marketing · commerce · auth · forms | A DTC shop: marketing landing page, product catalogue, cart & checkout |
| **booking** | 4303 | scheduler · forms · auth | An appointments app: booking wizard, calendar views, availability |
| **editor** | 4304 | navigation | A document editor showcasing the navigation toolbar & menus |
| **overlays** | 4306 | overlays | Project settings built from overlays: dialogs, confirm, toasts, drawer, tooltips, popover, banners |
| **kb** | 4305 | navigation · structure · editor · forms | Almanac, a knowledge base: article tree, rich-text/markdown editors, editable grid, Signal Form (`formRoot` + `submit`) |

Built with Angular 22 (standalone, zoneless, signals).

## Prerequisites

- Node 22+ (CI/dev uses 24.19.0).
- An **NgBracket access token** (`ngbr_…`). You get one with any pack purchase —
  see your [account page](https://ngbracket.com/account). It is read from the
  `NGBRACKET_TOKEN` environment variable at install time.

## Getting started

```bash
# 1. Point npm at your NgBracket token (never commit this).
export NGBRACKET_TOKEN=ngbr_your_token_here

# 2. Install — pulls @ngbracket/* from registry.ngbracket.com.
npm install

# 3. Run an app (pick one):
npm run start:admin       # http://localhost:4301
npm run start:storefront  # http://localhost:4302
npm run start:booking     # http://localhost:4303
npm run start:editor      # http://localhost:4304
npm run start:overlays    # http://localhost:4306
npm run start:kb          # http://localhost:4305
```

The committed [`.npmrc`](./.npmrc) only references `${NGBRACKET_TOKEN}` — **no token
is stored in this repo**. Without the variable set, `npm install` will fail with a
401 on the `@ngbracket/*` packages.

Apps with a route-by-route README:
[admin](projects/admin/README.md) · [storefront](projects/storefront/README.md) ·
[booking](projects/booking/README.md) · [editor](projects/editor/README.md) ·
[kb](projects/kb/README.md).

## How the packs are wired

- Every app shares `projects/shared` — a small library with a `ThemeService`
  (light/dark), a `ThemeToggle` button, and the global design-token stylesheet
  (`projects/shared/src/styles/theme.scss`) that themes every pack via the
  `--ngbr-*` CSS custom properties.
- Each app imports pack components directly, e.g.
  `import { NgbrDataTable } from '@ngbracket/data-table';`.

## Accessibility & theming

- Every app has a light/dark toggle in its chrome. Theme tokens are defined once in
  `projects/shared/src/styles/theme.scss`; the pack components and the app shells both
  read the `--ngbr-*` variables, so dark mode "just works" across packs.
- The NgBracket components are built to support WCAG 2.2 AA; the example app
  chrome (shells, nav, custom cells) is built to the same bar — semantic landmarks,
  visible focus rings, `aria-pressed`/`aria-label` on toggles, and AA contrast in both
  themes.

## Building

```bash
npm run build            # builds every app
npm run build:admin      # or one at a time
```

## Deploy (Cloudflare)

Each app deploys as a static-assets Cloudflare Worker (SPA fallback) to its own
subdomain:

| App | URL |
| --- | --- |
| admin | https://admin.ngbracket.com |
| storefront | https://storefront.ngbracket.com |
| booking | https://booking.ngbracket.com |
| editor | https://editor.ngbracket.com |
| overlays | https://overlays.ngbracket.com |
| kb | https://kb.ngbracket.com |
| a11y-demo (admin, development build with a11y-devtools) | https://a11y-demo.ngbracket.com/a11y-demo |

Config lives in `wrangler.<app>.jsonc`. With Cloudflare credentials in the
environment (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`):

```bash
npm run deploy            # build + deploy every app (incl. a11y-demo)
npm run deploy:admin      # or one at a time
```

(Builds use the already-installed packages, so deploying doesn't need the
`NGBRACKET_TOKEN`.)

## Licence

MIT — see [LICENSE](./LICENSE). The `@ngbracket/*` packages themselves are
commercial and require a valid licence/token.
