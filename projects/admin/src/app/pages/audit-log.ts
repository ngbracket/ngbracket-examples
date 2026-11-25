import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgbrPageHeader } from '@ngbracket/dashboard';
import { NgbrDataTable } from '@ngbracket/data-table';
import type { NgbrColumnDef } from '@ngbracket/data-table';

import { AUDIT_LOG, type AuditEvent } from '../data/audit-log-data';

/** Audit log: 5,000 events in one data-table with virtual scroll instead of pages. */
@Component({
  selector: 'admin-audit-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrPageHeader, NgbrDataTable],
  template: `
    <ngbr-page-header heading="Audit log" subtitle="{{ count }} events, newest first" />

    <p class="hint">Arrow keys, Home and End move between rows, and Enter selects one.</p>
    <!-- Always in the page, so screen readers announce each new selection. -->
    <p class="sel" role="status">
      @if (selected(); as e) {
        Selected: event <strong>{{ e.id }}</strong>, {{ e.action }} by {{ e.actor }} at {{ e.time }}
      }
    </p>

    <ngbr-data-table
      [data]="events"
      [columns]="columns"
      [virtualScroll]="true"
      [searchable]="true"
      [showExport]="true"
      [navigableRows]="true"
      (rowActivate)="selected.set($event)"
      searchLabel="Search events"
      exportFilename="audit-log.csv"
      caption="Audit log"
    />
  `,
  styles: [
    `
      .hint {
        margin: 0 0 8px;
        color: var(--ngbr-color-text-muted);
      }
      .sel {
        margin: 0 0 14px;
        color: var(--ngbr-color-accent);
      }
    `,
  ],
})
export class AuditLog {
  protected readonly events = AUDIT_LOG;
  protected readonly count = AUDIT_LOG.length.toLocaleString('en-GB');
  /** The row the keyboard user last activated (Enter or click), shown as a status. */
  protected readonly selected = signal<AuditEvent | null>(null);
  protected readonly columns: NgbrColumnDef<AuditEvent>[] = [
    { key: 'id', header: 'Event', sortable: true },
    { key: 'time', header: 'Time (UTC)', sortable: true },
    { key: 'actor', header: 'User', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
    { key: 'target', header: 'Target' },
  ];
}
