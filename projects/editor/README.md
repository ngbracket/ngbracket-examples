# editor — NgBracket example app

A tiny document editor that showcases **@ngbracket/navigation**: an application
menu bar, a formatting toolbar, and a right-click context menu driving a
`contenteditable` canvas. Runs on port **4304**; deploys to
**editor.ngbracket.com**.

## What it demonstrates

- `NgbrAppMenubar` — a config-driven File / Edit / Format / View / Help menu bar
  with submenus, checkbox items and keyboard shortcuts.
- `NgbrFormatToolbar` — the ready-made bold / italic / underline + list + align
  toolbar, two-way bound to the active command set.
- `[ngbrContextMenu]` — a right-click menu on the document surface.
- `shared` `ThemeService` / `ThemeToggle` for light/dark.

Formatting is applied to the canvas with classic `document.execCommand` — fine
for a demo surface.

## Run

```bash
export NGBRACKET_TOKEN=…      # to resolve @ngbracket/* from the private registry
npm install
npm run start:editor          # http://localhost:4304
```

> Note: `@ngbracket/navigation` is a pre-release pack. Until it's published to the
> registry it is linked locally; the `package.json` dep (`0.1.0`) resolves from the
> registry once published.
