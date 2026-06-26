# Booking (`booking`)

An appointment-booking app for a salon, built with **`@ngbracket/scheduler`,
`@ngbracket/forms` and `@ngbracket/auth`**. All data is hardcoded in
[`src/app/data/booking-data.ts`](src/app/data/booking-data.ts).

## Run

```bash
export NGBRACKET_TOKEN=ngbr_…    # once per shell (see the root README)
npm install                       # once
npm run start:booking             # http://localhost:4303
```

## What it shows

| Route | Packs | Highlights |
| --- | --- | --- |
| `/signin` | auth | `NgbrLoginForm` (any credentials sign you in) |
| `/book` | scheduler · forms | Wizard: choose service → `NgbrMiniCalendar` date → `NgbrTimeSlots` time → Signal-Forms details → confirmation |
| `/calendar` | scheduler | `NgbrMonthView` / `NgbrWeekView` / `NgbrAgenda` over the day's appointments |
| `/availability` | scheduler | `NgbrDateRangePicker` + `NgbrRecurrenceEditor` to set a recurring schedule |

Routes are guarded — you'll be sent to `/signin` until you sign in.

## Key files

- `shell/booking-shell.ts` — top-nav layout + auth gate
- `pages/book.ts` — the booking wizard
- `pages/calendar.ts` — the month/week/agenda diary
- `pages/availability.ts` — recurring availability editor
