/* Audit log data, kept out of admin-data.ts so only the Audit log page builds it. */
import { FIRST, LAST } from './admin-data';

export interface AuditEvent {
  id: number;
  time: string;
  actor: string;
  action: string;
  target: string;
}

const ACTIONS = ['Signed in', 'Changed plan', 'Updated billing', 'Invited user', 'Exported CSV', 'Reset password', 'Closed ticket', 'Changed role'];
const TARGETS = ['Account', 'Subscription', 'Invoice', 'Team', 'Customers', 'Password', 'Ticket', 'Permissions'];

/** 5,000 events, newest first, one every 7 minutes back from 25 Nov 2026 18:00 UTC. */
export const AUDIT_LOG: AuditEvent[] = Array.from({ length: 5000 }, (_, i) => {
  const at = new Date(Date.UTC(2026, 10, 25, 18, 0) - i * 7 * 60_000);
  const kind = (i * 5 + 3) % ACTIONS.length;
  return {
    id: 5000 - i,
    time: at.toISOString().slice(0, 16).replace('T', ' '),
    actor: `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 11) % LAST.length]}`,
    action: ACTIONS[kind],
    target: TARGETS[kind],
  };
});
