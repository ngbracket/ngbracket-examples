# Fix-along: accessibility in an Angular dashboard

A small Angular dashboard with the accessibility problems we found most often in the
[State of Angular accessibility report](https://ngbracket.com/blog/state-of-angular-accessibility-2026-q4),
fixed one git tag at a time. It was built for the Angular Space livestream on accessibility.

The app uses only public packages, so you don't need an NgBracket token to install it.
[@ngbracket/a11y-devtools](https://ngbracket.com/tools/a11y-devtools/docs/introduction) shows the
problems in the page while it runs.

## Run it

```bash
git clone https://github.com/ngbracket/ngbracket-examples.git
cd ngbracket-examples
git checkout fix-along-step-0
cd fix-along
npm install
npm start          # http://localhost:4310
```

Leave `npm start` running. Each time you check out the next tag, the dev server reloads the page.

## The steps

| Tag | What changes | Files |
| --- | --- | --- |
| `fix-along-step-0` | The starting point. Open the a11y pill in the corner to see the findings. | |
| `fix-along-step-1` | Landmarks and headings: `<header>`, `<nav>` and `<main>` in the app shell, an `<h1>` on each page, and `aria-current` on the link to the current page. | `app.html`, `orders.html`, `customers.ts`, `report.ts`, `sidebar.html`, `app.spec.ts` |
| `fix-along-step-2` | Names: `aria-label` on the icon-only buttons, and `aria-hidden="true"` on decorative icons. | `header.ts`, `icon.ts`, `header.spec.ts` |
| `fix-along-step-3` | Keyboard: the collapsed Reports menu no longer takes focus, its button reports `aria-expanded`, and the report links get `aria-current`. | `sidebar.html`, `sidebar.css`, `sidebar.spec.ts` |
| `fix-along-step-4` | Forms and zoom: labels on the filter, sort, row checkboxes and table, and zoom allowed again in the viewport tag. | `orders.html`, `orders.css`, `index.html`, `orders.spec.ts` |
| `fix-along-step-5` | Contrast: darker status badges and secondary text. | `styles.css` |

To see one step's changes:

```bash
git diff fix-along-step-2 fix-along-step-3 -- fix-along
```

## The steps in detail

The counts are the findings in the a11y pill on the Orders page.

### Step 0: the starting point

The pill shows 46 findings from 6 components. Each problem in the app is one we saw often in the
report. Nothing here is unusual for a real dashboard.

### Step 1: landmarks and headings

The app shell was all `<div>` elements, and each page started at `<h2>`. A screen reader user moves
around a page by landmark and by heading, so with neither there was no quick way to reach the main
content or tell what the page was. The fix uses `<header>`, `<nav aria-label="Main">` and `<main>`,
and an `<h1>` on each page. `ariaCurrentWhenActive="page"` on the sidebar links tells a screen reader
which page is open. Before, only the highlight showed it, and a screen reader doesn't announce that.
WCAG 1.3.1 Info and Relationships and 2.4.1 Bypass Blocks. 46 findings to 39.

### Step 2: names for icons and icon buttons

The bell, help and settings buttons held only an icon, so a screen reader announced each one as
"button" with no name. The icons had `role="img"` and no name, so axe flagged those as well. The
buttons now have an `aria-label`, and the icons are `aria-hidden="true"` with `focusable="false"`,
because the button's name already says what the icon means. WCAG 4.1.2 Name, Role, Value and 1.1.1
Non-text Content. 39 findings to 28.

Tick **Focus preview** in the pill's menu and Tab to the bell on each tag. The card shows
"(no accessible name)" on step 1 and "Notifications" on step 2.

### Step 3: the collapsed Reports menu

axe doesn't find this one, so the count stays at 28. The Reports submenu was hidden with
`max-height: 0` and `overflow: hidden`. That hides the links from sight but leaves them in the Tab
order, so keyboard focus went into 5 links you couldn't see. Put the mouse away and press Tab through
the sidebar on `fix-along-step-2` to try it, or tick **Tab order** in the pill's menu and look for the
badges under Reports. The fix renders the submenu with `@if` only while it's open, and the Reports
button reports its state with `aria-expanded`. The 5 report links also get `aria-current`, like the
top-level links in step 1. WCAG 2.4.3 Focus Order, 2.4.7 Focus Visible and 4.1.2 Name, Role, Value.

### Step 4: labels and zoom

The row checkboxes and the select had no label, and the select-all checkbox left its column header
with no text. The filter had only a placeholder. axe accepts a placeholder as a name, but it
disappears as soon as you type, so the filter gets a visible `<label>` too. The checkboxes are named
"Select all orders" and "Select order 1042" and so on, and the table is named "Orders". The viewport
tag had `maximum-scale=1, user-scalable=no`, which stops people zooming on a phone; this step removes
both. WCAG 3.3.2 Labels or Instructions, 4.1.2 Name, Role, Value and 1.4.4 Resize Text. 28 findings
to 16.

### Step 5: contrast

The last 16 findings are all contrast. WCAG 1.4.3 Contrast (Minimum) asks for 4.5:1 for normal-size
text. The change is four colour values in `styles.css`:

| Token | Before | Ratio | After | Ratio |
| --- | --- | --- | --- | --- |
| `--text-muted` on white | `#a3a3a3` | 2.52:1 | `#5f6670` | 5.80:1 |
| White on `--status-shipped` | `#4caf50` | 2.78:1 | `#2e7d32` | 5.13:1 |
| White on `--status-pending` | `#ff9800` | 2.16:1 | `#b45309` | 5.02:1 |
| White on `--status-cancelled` | `#f44336` | 3.68:1 | `#c62828` | 5.62:1 |

The pill now shows 0 on Orders, Customers and each report page. That is the end of what axe can
find, which is the reason for the next section.

## What this doesn't cover

An automated scan covers roughly a third of WCAG. A page with no findings in the overlay still needs a
keyboard pass, a screen reader check and someone who knows WCAG to look at it. The sample is a single
light theme, and its pages hold hardcoded data. It doesn't move focus when the route changes.

## Tests

```bash
npm test
```
