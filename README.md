# NgBracket Examples

Three close-to-real-world Angular applications that consume the **published
[NgBracket](https://ngbracket.com) component packs** straight from the private
registry. They exist to (1) prove the packages work in real apps, and (2) give you
clone-and-go starter templates.

All data is **hardcoded** — there's no backend or API to run.

| App | Port | Packs showcased | What it is |
| --- | --- | --- | --- |
| **admin** | 4301 | dashboard · data-table · forms · auth | A SaaS back-office: KPI dashboard, customers table, settings forms |
| **storefront** | 4302 | marketing · commerce · auth · forms | A DTC shop: marketing landing page, product catalogue, cart & checkout |
| **booking** | 4303 | scheduler · forms · auth | An appointments app: booking wizard, calendar views, availability |

Built with Angular 22 (standalone, zoneless, signals).

## Prerequisites

- Node 22+ (CI/dev uses 24.15.0).
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
```

The committed [`.npmrc`](./.npmrc) only references `${NGBRACKET_TOKEN}` — **no token
is stored in this repo**. Without the variable set, `npm install` will fail with a
401 on the `@ngbracket/*` packages.

Each app has its own README with a route-by-route breakdown:
[admin](projects/admin/README.md) · [storefront](projects/storefront/README.md) ·
[booking](projects/booking/README.md).

## How the packs are wired

- All three apps share `projects/shared` — a small library with a `ThemeService`
  (light/dark), a `ThemeToggle` button, and the global design-token stylesheet
  (`projects/shared/src/styles/theme.scss`) that themes every pack via the
  `--ngbr-*` CSS custom properties.
- Each app imports pack components directly, e.g.
  `import { NgbrDataTable } from '@ngbracket/data-table';`.

## Accessibility & theming

- Every app has a light/dark toggle in its chrome. Theme tokens are defined once in
  `projects/shared/src/styles/theme.scss`; the pack components and the app shells both
  read the `--ngbr-*` variables, so dark mode "just works" across packs.
- The NgBracket components ship WCAG 2 AA-compliant and AXE-clean; the example app
  chrome (shells, nav, custom cells) is built to the same bar — semantic landmarks,
  visible focus rings, `aria-pressed`/`aria-label` on toggles, and AA contrast in both
  themes.

## Building

```bash
npm run build            # builds all three apps
npm run build:admin      # or one at a time
```

## Licence

MIT — see [LICENSE](./LICENSE). The `@ngbracket/*` packages themselves are
commercial and require a valid licence/token.
