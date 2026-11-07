import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgbrCellDef, NgbrDataTable, NgbrRowMenu } from '@ngbracket/data-table';
import type { NgbrColumnDef, NgbrRowMenuAction } from '@ngbracket/data-table';
import { NgbrFormField, NgbrSelect } from '@ngbracket/forms';
import type { NgbrSelectOption } from '@ngbracket/forms';
import { NgbrConfirm, NgbrDialog, NgbrToast } from '@ngbracket/overlays';

import { OrdersStore, STATUSES, formatDate, formatTotal, type Order } from '../data/orders';
import { EditOrderDialog, type OrderChanges } from './edit-order-dialog';

/**
 * AFTER: the same orders screen on NgBracket packs. @ngbracket/data-table
 * gives the labelled search box, sortable headers and pager; NgbrRowMenu the actions menu;
 * @ngbracket/forms the status filter and the edit form; @ngbracket/overlays
 * the dialog, the confirm and the toasts.
 */
@Component({
  selector: 'app-orders-after',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrDataTable, NgbrCellDef, NgbrRowMenu, NgbrFormField, NgbrSelect],
  template: `
    <div class="head">
      <h1>Orders</h1>
      <p class="sub">{{ store.orders().length }} orders this month</p>
    </div>

    <div class="tools">
      <ngbr-form-field label="Status">
        <ngbr-select [(value)]="statusFilter" [options]="statusOptions" aria-label="Status" />
      </ngbr-form-field>
    </div>

    <ngbr-data-table
      [data]="rows()"
      [columns]="columns"
      [pageSize]="8"
      [searchable]="true"
      searchLabel="Search orders"
      [rowLabel]="rowLabel"
      [rowKey]="rowKey"
      caption="Orders this month"
      emptyText="No orders match."
    >
      <ng-template ngbrCellDef="id" [ngbrCellDefData]="rows()" let-row>
        <span class="id">#{{ row.id }}</span>
      </ng-template>
      <ng-template ngbrCellDef="customer" [ngbrCellDefData]="rows()" let-row>
        {{ row.customer }}
        <span class="email">{{ row.email }}</span>
      </ng-template>
      <ng-template ngbrCellDef="placed" [ngbrCellDefData]="rows()" let-row>
        {{ date(row.placed) }}
      </ng-template>
      <ng-template ngbrCellDef="total" [ngbrCellDefData]="rows()" let-row>
        {{ money(row.total) }}
      </ng-template>
      <ng-template ngbrCellDef="status" [ngbrCellDefData]="rows()" let-row>
        <span class="pill" [attr.data-status]="row.status">{{ row.status }}</span>
      </ng-template>
      <ng-template ngbrCellDef="actions" [ngbrCellDefData]="rows()" let-row>
        <ngbr-row-menu [ariaLabel]="'Actions for order ' + row.id" [actions]="actions().get(row.id) ?? []" />
      </ng-template>
    </ngbr-data-table>
  `,
  styles: [
    `
      .head h1 {
        margin: 0;
        font-size: 1.6rem;
      }
      .sub {
        margin: 4px 0 18px;
        color: var(--ngbr-color-text-muted, #475569);
      }
      /* Above the table's sticky header, so the status list isn't drawn under it. */
      .tools {
        position: relative;
        z-index: 200;
        max-width: 240px;
      }
      .id {
        font-weight: 600;
      }
      .email {
        display: block;
        font-size: 0.82rem;
        color: var(--ngbr-color-text-muted, #475569);
      }
      /* Text label on a tinted pill; the dot carries the hue, so colour is never the only signal. */
      .pill {
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
      .pill::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--dot, var(--ngbr-color-text-muted));
      }
      .pill[data-status='Paid'] {
        --dot: #16a34a;
      }
      .pill[data-status='Pending'] {
        --dot: #d97706;
      }
      .pill[data-status='Shipped'] {
        --dot: #2563eb;
      }
    `,
  ],
})
export class OrdersAfter {
  protected readonly store = inject(OrdersStore);
  private readonly dialog = inject(NgbrDialog);
  private readonly confirm = inject(NgbrConfirm);
  private readonly toast = inject(NgbrToast);

  protected readonly statusOptions: NgbrSelectOption[] = [
    { value: '', label: 'All statuses' },
    ...STATUSES.map((s) => ({ value: s, label: s })),
  ];
  protected readonly statusFilter = signal<string | null>('');

  protected readonly rows = computed(() => {
    const status = this.statusFilter();
    return status ? this.store.orders().filter((o) => o.status === status) : this.store.orders();
  });

  protected readonly columns: NgbrColumnDef<Order>[] = [
    { key: 'id', header: 'Order', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true, value: (o) => `${o.customer} ${o.email}` },
    { key: 'placed', header: 'Placed', sortable: true },
    { key: 'total', header: 'Total', sortable: true, align: 'end' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'actions', header: 'Actions', exportable: false },
  ];

  protected readonly rowLabel = (o: Order): string => `Order ${o.id}`;
  /** Keeps a row's elements, and the focus on its menu button, when the order is edited. */
  protected readonly rowKey = (o: Order): number => o.id;
  protected readonly money = formatTotal;
  protected readonly date = formatDate;

  /** Each row's menu, rebuilt only when the orders change. */
  protected readonly actions = computed(
    () => new Map(this.store.orders().map((o) => [o.id, this.actionsFor(o)] as const)),
  );

  private actionsFor(o: Order): NgbrRowMenuAction[] {
    return [
      { label: 'Edit', run: () => void this.edit(o) },
      { label: 'Mark as shipped', disabled: o.status === 'Shipped' || o.status === 'Cancelled', run: () => this.ship(o) },
      { label: 'Cancel order', danger: true, disabled: o.status === 'Cancelled', run: () => void this.cancel(o) },
    ];
  }

  private async edit(o: Order): Promise<void> {
    const ref = this.dialog.open<OrderChanges>(EditOrderDialog, { data: o, ariaLabel: `Edit order #${o.id}` });
    const changes = await ref.result;
    if (!changes) return;
    this.store.update(o.id, changes);
    this.toast.success(`Order #${o.id} saved`);
  }

  private ship(o: Order): void {
    this.store.update(o.id, { status: 'Shipped' });
    this.toast.success(`Order #${o.id} marked as shipped`);
  }

  private async cancel(o: Order): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Cancel order #${o.id}?`,
      message: `${o.customer}'s order for ${formatTotal(o.total)} will be marked as cancelled.`,
      confirmText: 'Cancel order',
      cancelText: 'Keep order',
      tone: 'danger',
    });
    if (!ok) return;
    this.store.update(o.id, { status: 'Cancelled' });
    this.toast.info(`Order #${o.id} cancelled`);
  }
}
