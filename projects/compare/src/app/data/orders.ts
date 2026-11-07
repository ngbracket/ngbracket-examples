import { Injectable, signal } from '@angular/core';

export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Cancelled';

export interface Order {
  readonly id: number;
  readonly customer: string;
  readonly email: string;
  readonly status: OrderStatus;
  /** Order total in pounds. */
  readonly total: number;
  /** Date placed, ISO yyyy-mm-dd, so it sorts as text. */
  readonly placed: string;
}

export const STATUSES: readonly OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Cancelled'];

const SEED: readonly Order[] = [
  { id: 1031, customer: 'Amara Okafor', email: 'amara@northwind.co.uk', status: 'Shipped', total: 248, placed: '2026-10-02' },
  { id: 1032, customer: 'Ben Hartley', email: 'ben.hartley@fieldline.io', status: 'Shipped', total: 92.5, placed: '2026-10-04' },
  { id: 1033, customer: 'Chloé Martin', email: 'chloe@atelier-m.fr', status: 'Cancelled', total: 61, placed: '2026-10-05' },
  { id: 1034, customer: 'Dev Patel', email: 'dev@patelandco.com', status: 'Shipped', total: 1180, placed: '2026-10-07' },
  { id: 1035, customer: 'Erin Walsh', email: 'erin.walsh@corkcraft.ie', status: 'Paid', total: 37.99, placed: '2026-10-09' },
  { id: 1036, customer: 'Fatima Zahra', email: 'fatima@souklane.ma', status: 'Shipped', total: 412, placed: '2026-10-11' },
  { id: 1037, customer: 'Gareth Lloyd', email: 'gareth@lloydjoinery.wales', status: 'Paid', total: 156, placed: '2026-10-12' },
  { id: 1038, customer: 'Hana Sato', email: 'hana.sato@kumo.jp', status: 'Shipped', total: 74.2, placed: '2026-10-14' },
  { id: 1039, customer: 'Isaac Mensah', email: 'isaac@goldcoastgoods.com', status: 'Pending', total: 530, placed: '2026-10-15' },
  { id: 1040, customer: 'Julia Novak', email: 'julia.novak@brnoprint.cz', status: 'Paid', total: 89, placed: '2026-10-17' },
  { id: 1041, customer: 'Kwame Asante', email: 'kwame@asantestudio.com', status: 'Shipped', total: 265.4, placed: '2026-10-18' },
  { id: 1042, customer: 'Lena Fischer', email: 'lena.fischer@holzwerk.de', status: 'Paid', total: 143, placed: '2026-10-20' },
  { id: 1043, customer: 'Mateo Rossi', email: 'mateo@rossicafe.it', status: 'Pending', total: 48.5, placed: '2026-10-21' },
  { id: 1044, customer: 'Nadia Haddad', email: 'nadia@cedarhome.lb', status: 'Paid', total: 702, placed: '2026-10-23' },
  { id: 1045, customer: 'Owen Price', email: 'owen.price@valleybikes.co.uk', status: 'Cancelled', total: 389, placed: '2026-10-24' },
  { id: 1046, customer: 'Priya Nair', email: 'priya@spicetrail.in', status: 'Shipped', total: 58, placed: '2026-10-26' },
  { id: 1047, customer: 'Quinn Murphy', email: 'quinn@murphyfarm.ie', status: 'Pending', total: 210, placed: '2026-10-27' },
  { id: 1048, customer: 'Rosa Jiménez', email: 'rosa@ceramicasol.es', status: 'Paid', total: 96.75, placed: '2026-10-29' },
  { id: 1049, customer: 'Sami Virtanen', email: 'sami@saunakit.fi', status: 'Pending', total: 1540, placed: '2026-10-30' },
  { id: 1050, customer: 'Tara Singh', email: 'tara.singh@loomhouse.co.uk', status: 'Paid', total: 132, placed: '2026-11-01' },
  { id: 1051, customer: 'Umar Farooq', email: 'umar@farooqtech.pk', status: 'Pending', total: 64, placed: '2026-11-02' },
  { id: 1052, customer: 'Vera Ivanova', email: 'vera@birchandbark.com', status: 'Paid', total: 318, placed: '2026-11-03' },
  { id: 1053, customer: 'Will Turner', email: 'will@turnerboats.co.uk', status: 'Pending', total: 875, placed: '2026-11-04' },
  { id: 1054, customer: 'Yara Costa', email: 'yara@costaflores.br', status: 'Pending', total: 45, placed: '2026-11-05' },
];

/**
 * The orders both versions of the screen show. Each route gets its own copy
 * (provided at the route), so edits on one page don't show up on the other.
 */
@Injectable()
export class OrdersStore {
  readonly orders = signal<readonly Order[]>(SEED);

  update(id: number, changes: Partial<Omit<Order, 'id'>>): void {
    this.orders.update((list) => list.map((o) => (o.id === id ? { ...o, ...changes } : o)));
  }
}

/** £1,180.00 */
export function formatTotal(total: number): string {
  return '£' + total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 20 Oct 2026 */
export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
