import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgbrPageHeader } from '@ngbracket/dashboard';
import { NgbrDataTable, NgbrCellDef } from '@ngbracket/data-table';
import type { NgbrColumnDef } from '@ngbracket/data-table';

import { CUSTOMERS, type Customer } from '../data/admin-data';

/** Customers list: a data-table with sort, search, pagination and CSV export. */
@Component({
  selector: 'admin-customers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrPageHeader, NgbrDataTable, NgbrCellDef],
  template: `
    <ngbr-page-header heading="Customers" subtitle="{{ customers.length }} accounts" />

    @if (selected(); as c) {
      <p class="sel" role="status">
        Selected: <strong>{{ c.name }}</strong> — {{ c.plan }}, {{ c.status }}
      </p>
    }

    <ngbr-data-table
      [data]="customers"
      [columns]="columns"
      [pageSize]="8"
      [searchable]="true"
      [showExport]="true"
      [navigableRows]="true"
      (rowActivate)="selected.set($event)"
      exportFilename="customers.csv"
      caption="Customers — arrow keys to move between rows, Enter to select; search, sort, page and export to CSV"
    >
      <ng-template ngbrCellDef="status" [ngbrCellDefData]="customers" let-row>
        <span class="status" [attr.data-status]="row.status">{{ row.status }}</span>
      </ng-template>

      <ng-template ngbrCellDef="mrr" [ngbrCellDefData]="customers" let-row>
        {{ row.mrr ? '£' + row.mrr : '—' }}
      </ng-template>
    </ngbr-data-table>
  `,
  styles: [
    `
      .sel {
        margin: 0 0 14px;
        color: var(--ngbr-color-accent);
      }

      /* Themed text (AA in light + dark); a leading dot carries the status hue,
         and the text label means colour is never the only signal. */
      .status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 2px 10px;
        font-size: 0.8rem;
        font-weight: 600;
        border-radius: 999px;
        color: var(--ngbr-color-text);
        background: color-mix(in srgb, var(--ngbr-color-text) 8%, transparent);
      }
      .status::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--dot, var(--ngbr-color-text-muted));
      }
      .status[data-status='Active'] {
        --dot: #16a34a;
      }
      .status[data-status='Trialing'] {
        --dot: #2563eb;
      }
      .status[data-status='Past due'] {
        --dot: #ea580c;
      }
      .status[data-status='Churned'] {
        --dot: #94a3b8;
      }
    `,
  ],
})
export class Customers {
  protected readonly customers = CUSTOMERS;
  /** The row the keyboard user last activated (Enter / click) — shown as a status. */
  protected readonly selected = signal<Customer | null>(null);
  protected readonly columns: NgbrColumnDef<Customer>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'plan', header: 'Plan', sortable: true },
    { key: 'mrr', header: 'MRR', sortable: true, align: 'end' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'joined', header: 'Joined', sortable: true },
  ];
}
