# NVDA on /after

https://compare.ngbracket.com/after, 2026-11-07, Chromium 156.0.8078.4. NVDA in CI on Windows, installed by Guidepup 0.39.0.

- Keys go to NVDA through Guidepup. Each step keeps everything NVDA said until it was quiet for a second.
- Filling the email field and moving to Save are scripted (Playwright fill() and focus()), so those steps show only what Enter on Save caused.
- The transcript has one line per key press: what NVDA said for that press, its phrases joined by full stops (Guidepup joins them). A press NVDA said nothing for shows as (silent).

## 1. Sort by Placed

Keys: Tab ×5, Enter

NVDA said:

```
Status, combo box, All statuses, collapsed, opens list
Search orders, edit, Search..., blank
Orders this month, table, with 9 rows and 6 columns, row 1, column 1, Order, button
column 2, Customer, button
column 3, Placed, button
sorted ascending
```

Focus after: button text="Placed▲"

## 2. Open the menu for order 1035

Keys: Tab ×7, Enter

NVDA said:

```
column 4, Total, button
column 5, Status, button
row 2, Actions, column 6, Actions for order 1031, menu button, collapsed, sub Menu
row 3, Actions for order 1032, menu button, collapsed, sub Menu
row 4, Actions for order 1033, menu button, collapsed, sub Menu
row 5, Actions for order 1034, menu button, collapsed, sub Menu
row 6, Actions for order 1035, menu button, collapsed, sub Menu
Edit, 1 of 3
```

Focus after: button role=menuitem text="Edit"

## 3. Choose Edit

Keys: Enter

NVDA said:

```
Edit order number 1035, dialog. form landmark. Edit order number 1035, dialog. form landmark. Customer, edit, required, Erin Walsh
```

Focus after: input

## 4. Save with an empty email

Keys: Enter on Save

NVDA said:

```
Please fix the following, heading, level 2, list, bullet, Enter an email address. Please fix the following, alert. Please fix the following, heading, level 2. list. level 1, list item, 1 of 1. Enter an email address, link
```

Focus after: div role=alert text="Please fix the followingEnter an email address"

## 5. Fix the email and save

Keys: Enter on Save

NVDA said:

```
main landmark, Orders this month, table, with 9 rows and 6 columns, row 6, Actions, column 6, Actions for order 1035, menu button, collapsed, sub Menu
```

Focus after: button role=button aria-label="Actions for order 1035" text="⋮"
