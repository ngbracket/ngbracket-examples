/* Hardcoded data for the Admin Console. No API — everything lives here. */
import type { NgbrChartSeries, NgbrChartDatum } from '@ngbracket/charts';

export interface Customer {
  id: string;
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Team' | 'Enterprise';
  mrr: number;
  status: 'Active' | 'Trialing' | 'Past due' | 'Churned';
  joined: string;
}

export interface Kpi {
  label: string;
  value: string;
  delta: number;
  caption: string;
  spark: number[];
}

export const KPIS: Kpi[] = [
  { label: 'MRR', value: '£48.2k', delta: 12.5, caption: 'vs last month', spark: [22, 25, 24, 28, 30, 34, 38] },
  { label: 'Active customers', value: '1,204', delta: 3.4, caption: 'vs last month', spark: [980, 1010, 1050, 1080, 1120, 1170, 1204] },
  { label: 'Trials', value: '86', delta: -4.1, caption: 'vs last month', spark: [70, 78, 95, 88, 92, 90, 86] },
  { label: 'Churn', value: '1.8%', delta: -0.3, caption: 'vs last month', spark: [2.4, 2.2, 2.3, 2.1, 2.0, 1.9, 1.8] },
];

export const REVENUE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export const REVENUE_SERIES: NgbrChartSeries[] = [
  { name: 'New', data: [18, 22, 19, 27, 30, 34] },
  { name: 'Expansion', data: [6, 8, 7, 9, 11, 13] },
  { name: 'Churned', data: [3, 4, 3, 5, 4, 6] },
];

export const SIGNUP_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
export const SIGNUP_BARS: NgbrChartSeries[] = [
  { name: 'Self-serve', data: [120, 150, 138, 176] },
  { name: 'Sales-led', data: [40, 52, 61, 58] },
];

export const PLAN_BREAKDOWN: NgbrChartDatum[] = [
  { label: 'Starter', value: 540 },
  { label: 'Pro', value: 430 },
  { label: 'Team', value: 180 },
  { label: 'Enterprise', value: 54 },
];

const FIRST = ['Ada', 'Alan', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Tim', 'Anita', 'Guido', 'Katherine', 'Edsger', 'Hedy', 'James', 'Sophie', 'Omar', 'Priya', 'Marcus', 'Yara', 'Sven', 'Chen', 'Noah'];
const LAST = ['Lovelace', 'Turing', 'Hopper', 'Torvalds', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Perlman', 'Berners-Lee', 'Borg', 'van Rossum', 'Johnson', 'Dijkstra', 'Lamarr', 'Gosling', 'Wilson', 'Haddad', 'Patel', 'Cole', 'Nasser', 'Eriksson', 'Wei', 'Bennett'];
const PLANS: Customer['plan'][] = ['Starter', 'Pro', 'Team', 'Enterprise'];
const STATUSES: Customer['status'][] = ['Active', 'Active', 'Active', 'Trialing', 'Past due', 'Churned'];
const MRR_BY_PLAN: Record<Customer['plan'], number> = { Starter: 0, Pro: 12, Team: 29, Enterprise: 240 };

export const CUSTOMERS: Customer[] = Array.from({ length: 24 }, (_, i) => {
  const name = `${FIRST[i]} ${LAST[i]}`;
  const plan = PLANS[(i * 3 + 1) % PLANS.length];
  const status = STATUSES[(i * 5 + 2) % STATUSES.length];
  const day = String(((i * 7) % 27) + 1).padStart(2, '0');
  const month = String(((i * 2) % 12) + 1).padStart(2, '0');
  return {
    id: `cus_${1000 + i}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    plan,
    mrr: status === 'Churned' ? 0 : MRR_BY_PLAN[plan],
    status,
    joined: `2025-${month}-${day}`,
  };
});
