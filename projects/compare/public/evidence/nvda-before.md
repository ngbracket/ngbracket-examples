# NVDA on /before

https://compare.ngbracket.com/before, 2026-11-07, Chromium 156.0.8078.4. NVDA in CI on Windows, installed by Guidepup 0.39.0.

- Keys go to NVDA through Guidepup. Each step keeps everything NVDA said until it was quiet for a second.
- Filling the email field and moving to Save are scripted (Playwright fill() and focus()), so those steps show only what Enter on Save caused.
- The transcript has one line per key press: what NVDA said for that press, its phrases joined by full stops (Guidepup joins them). A press NVDA said nothing for shows as (silent).

## 1. Sort by Placed

Keys: Tab ×3, Up Arrow ×9 (browse mode), Enter

NVDA said:

```
Search orders..., edit, blank
combo box, All statuses, collapsed
table, with 9 rows and 6 columns, row 2, , column 6, button
Status, column 5, Shipped
Total, column 4, £248.00
Placed, column 3, 2 Oct 2026
Customer, column 2, Amara Okaforamara at northwind dot co dot uk
Order, column 1, number 1031
row 1, column 6
column 5, clickable, Status
column 4, clickable, Total
column 3, clickable, Placed
(silent)
```

Focus after: main text="Orders24 orders this monthAll statusesPendingPaidShippedCancelledOrder Customer "

Tab went past the column headers into the rows: the headers have no Tab stop. In browse mode, Up Arrow ×9 brought NVDA's cursor to "column 3, clickable, Placed" and Enter was pressed there. The header now reads "Placed ▲".

## 2. Open the menu for order 1035

Keys: Tab ×7, Enter

NVDA said:

```
Search orders..., edit, blank
combo box, All statuses, collapsed
table, with 9 rows and 6 columns, row 2, , column 6, button
row 3, button
row 4, button
row 5, button
row 6, button
(silent)
```

Focus after: button

## 3. Choose Edit

Keys: Down Arrow ×1 (browse mode), Enter

NVDA said:

```
clickable, Edit
(silent)
```

Focus after: main text="Orders24 orders this monthAll statusesPendingPaidShippedCancelledOrder Customer "

Focus stayed on the menu button. In browse mode, Down Arrow ×1 brought NVDA's cursor to "clickable, Edit" and Enter was pressed there: the edit dialog opened.

## 4. Save with an empty email

Keys: Enter on Save

NVDA said:

```
(silent)
```

Focus after: button text="Save"

## 5. Fix the email and save

Keys: Enter on Save

NVDA said:

```
(silent)
```

Focus after: body (nothing focused)
