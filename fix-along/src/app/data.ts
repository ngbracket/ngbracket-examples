export type OrderStatus = 'Shipped' | 'Pending' | 'Cancelled';

export interface Order {
  id: number;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
}

export interface Customer {
  name: string;
  email: string;
  orders: number;
}

export interface ReportLink {
  slug: string;
  label: string;
}

export const ORDERS: readonly Order[] = [
  { id: 1042, customer: 'Amara Okafor', date: '2026-11-18', total: 184.5, status: 'Shipped' },
  { id: 1041, customer: 'Ben Hughes', date: '2026-11-18', total: 62, status: 'Pending' },
  { id: 1040, customer: 'Chloe Martin', date: '2026-11-17', total: 310.25, status: 'Shipped' },
  { id: 1039, customer: 'Dev Patel', date: '2026-11-17', total: 48.99, status: 'Cancelled' },
  { id: 1038, customer: 'Ewa Nowak', date: '2026-11-16', total: 129, status: 'Shipped' },
  { id: 1037, customer: 'Finn Murphy', date: '2026-11-15', total: 75.4, status: 'Pending' },
  { id: 1036, customer: 'Grace Lee', date: '2026-11-15', total: 240, status: 'Shipped' },
  { id: 1035, customer: 'Hamza Ali', date: '2026-11-14', total: 19.99, status: 'Shipped' },
];

export const CUSTOMERS: readonly Customer[] = [
  { name: 'Amara Okafor', email: 'amara@example.com', orders: 6 },
  { name: 'Ben Hughes', email: 'ben@example.com', orders: 2 },
  { name: 'Chloe Martin', email: 'chloe@example.com', orders: 11 },
  { name: 'Dev Patel', email: 'dev@example.com', orders: 1 },
  { name: 'Ewa Nowak', email: 'ewa@example.com', orders: 4 },
];

export const REPORTS: readonly ReportLink[] = [
  { slug: 'sales', label: 'Sales' },
  { slug: 'returns', label: 'Returns' },
  { slug: 'stock', label: 'Stock' },
  { slug: 'refunds', label: 'Refunds' },
  { slug: 'shipping', label: 'Shipping' },
];
