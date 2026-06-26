/* Hardcoded data for the Booking app. No API. */
import type { NgbrCalendarEvent } from '@ngbracket/scheduler';

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
}

export const SERVICES: Service[] = [
  { id: 'cut', name: 'Haircut', duration: 30, price: 28, description: 'Wash, cut and style with one of our senior stylists.' },
  { id: 'colour', name: 'Colour & highlights', duration: 90, price: 85, description: 'Full colour or balayage, including a gloss finish.' },
  { id: 'beard', name: 'Beard trim', duration: 20, price: 15, description: 'Shape-up and hot-towel finish.' },
  { id: 'treat', name: 'Treatment', duration: 45, price: 40, description: 'Deep-conditioning or scalp treatment.' },
];

/** A Date `dayOffset` days from today at the given time. */
function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Existing appointments shown on the calendar. */
export const APPOINTMENTS: NgbrCalendarEvent[] = [
  { id: 'a1', title: 'Haircut — Priya', start: at(0, 9, 30), end: at(0, 10, 0), color: '#0e7490' },
  { id: 'a2', title: 'Colour — Jordan', start: at(0, 11, 0), end: at(0, 12, 30), color: '#7c3aed', meta: 'Chair 2' },
  { id: 'a3', title: 'Beard trim — Sam', start: at(0, 14, 0), end: at(0, 14, 20), color: '#16a34a' },
  { id: 'a4', title: 'Treatment — Alex', start: at(1, 10, 0), end: at(1, 10, 45), color: '#ea580c' },
  { id: 'a5', title: 'Haircut — Noah', start: at(1, 13, 0), end: at(1, 13, 30), color: '#0e7490' },
  { id: 'a6', title: 'Colour — Mia', start: at(2, 9, 0), end: at(2, 10, 30), color: '#7c3aed', meta: 'Chair 1' },
  { id: 'a7', title: 'Team meeting', start: at(3, 9, 0), end: at(3, 9, 30), color: '#db2777', meta: 'All staff' },
];
