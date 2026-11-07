import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { ResultsNote } from '../results-note';
import { OrdersStore, STATUSES, formatDate, formatTotal, type Order, type OrderStatus } from '../data/orders';

type SortKey = 'id' | 'customer' | 'placed' | 'total' | 'status';

const PAGE_SIZE = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * BEFORE: the orders screen written the way a busy team often writes it, with
 * plain elements and click handlers. It looks the same as the "after" version
 * and works with a mouse. Nothing here is broken on purpose; each NOTE marks a
 * shortcut that is common in real code and what it costs keyboard and screen
 * reader users.
 */
@Component({
  selector: 'app-orders-before',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResultsNote],
  host: { '(document:click)': 'menuFor.set(null)' },
  template: `
    <div class="head">
      <h1>Orders</h1>
      <p class="sub">{{ store.orders().length }} orders this month</p>
    </div>

    <div class="tools">
      <!-- NOTE: the placeholder is the only label, and it disappears as soon as you type. -->
      <input class="search" type="search" placeholder="Search orders…" [value]="query()" (input)="onSearch($event)" />
      <!-- NOTE: no label at all, so a screen reader announces just "combo box". -->
      <select class="status-filter" (change)="onStatus($event)">
        <option value="">All statuses</option>
        @for (s of statuses; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
    </div>

    <div class="card">
      <table class="tbl">
        <thead>
          <tr>
            <!-- NOTE: sorting is a click handler on a span. It can't be reached with Tab,
                 and nothing tells a screen reader the column is sorted. -->
            <th><span class="sort" (click)="sortBy('id')">Order {{ arrow('id') }}</span></th>
            <th><span class="sort" (click)="sortBy('customer')">Customer {{ arrow('customer') }}</span></th>
            <th><span class="sort" (click)="sortBy('placed')">Placed {{ arrow('placed') }}</span></th>
            <th class="num"><span class="sort" (click)="sortBy('total')">Total {{ arrow('total') }}</span></th>
            <th><span class="sort" (click)="sortBy('status')">Status {{ arrow('status') }}</span></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (o of pageRows(); track o.id) {
            <tr>
              <td class="id">#{{ o.id }}</td>
              <td>
                {{ o.customer }}
                <!-- NOTE: light grey text, about 2.5:1 against white. -->
                <span class="email">{{ o.email }}</span>
              </td>
              <td>{{ date(o.placed) }}</td>
              <td class="num">{{ money(o.total) }}</td>
              <td><span class="pill" [attr.data-status]="o.status">{{ o.status }}</span></td>
              <td class="actions">
                <!-- NOTE: an icon-only button with no name: "button", nothing else. -->
                <button type="button" class="kebab" (click)="toggleMenu(o.id, $event)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                @if (menuFor() === o.id) {
                  <!-- NOTE: the menu items are divs. Tab skips them and arrow keys do nothing,
                       so the menu opens but a keyboard user can't pick anything. -->
                  <div class="menu" (click)="$event.stopPropagation()">
                    <div class="menu-item" (click)="edit(o)">Edit</div>
                    <!-- NOTE: greyed out with a class only; nothing tells a screen reader it's unavailable. -->
                    <div class="menu-item" [class.menu-item--off]="!canShip(o)" (click)="canShip(o) && ship(o)">
                      Mark as shipped
                    </div>
                    <div
                      class="menu-item menu-item--danger"
                      [class.menu-item--off]="o.status === 'Cancelled'"
                      (click)="o.status !== 'Cancelled' && askCancel(o)"
                    >
                      Cancel order
                    </div>
                  </div>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty">No orders match.</td></tr>
          }
        </tbody>
      </table>

      <div class="pager">
        <!-- NOTE: arrow glyphs as the only text; read as "button" or "single left-pointing angle quotation mark". -->
        <button type="button" (click)="page.set(page() - 1)" [disabled]="page() === 0">‹</button>
        <span>Page {{ page() + 1 }} of {{ pageCount() }}</span>
        <button type="button" (click)="page.set(page() + 1)" [disabled]="page() >= pageCount() - 1">›</button>
      </div>
    </div>

    @if (editing(); as o) {
      <!-- NOTE: a div that looks like a dialog. Focus stays on the page behind it, Tab walks
           into the page underneath, Escape does nothing, and on close focus is lost. -->
      <div class="backdrop">
        <div class="modal">
          <div class="modal__head">
            <h2>Edit order #{{ o.id }}</h2>
            <span class="close" (click)="editing.set(null)">×</span>
          </div>
          <!-- NOTE: labels without "for", so the inputs have no name. -->
          <div class="field">
            <label>Customer</label>
            <input type="text" [value]="draftCustomer()" (input)="draftCustomer.set(value($event))" />
          </div>
          <div class="field" [class.field--error]="showErrors() && !emailValid()">
            <label>Email</label>
            <input type="text" [value]="draftEmail()" (input)="draftEmail.set(value($event))" />
            <!-- NOTE: the error is red text near the field, not tied to it, and never announced. -->
            @if (showErrors() && !emailValid()) {
              <div class="error">Enter a valid email address</div>
            }
          </div>
          <div class="field">
            <label>Status</label>
            <select (change)="draftStatus.set(statusOf($event))">
              @for (s of statuses; track s) {
                <option [value]="s" [selected]="s === draftStatus()">{{ s }}</option>
              }
            </select>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn" (click)="editing.set(null)">Cancel</button>
            <button type="button" class="btn btn--primary" (click)="save(o)">Save</button>
          </div>
        </div>
      </div>
    }

    @if (cancelling(); as o) {
      <!-- NOTE: the same div dialog again. Nothing reads the question out or moves focus to it. -->
      <div class="backdrop">
        <div class="modal">
          <h2>Cancel order #{{ o.id }}?</h2>
          <p>{{ o.customer }}'s order for {{ money(o.total) }} will be marked as cancelled.</p>
          <div class="modal__actions">
            <button type="button" class="btn" (click)="cancelling.set(null)">Keep order</button>
            <button type="button" class="btn btn--danger" (click)="cancel(o)">Cancel order</button>
          </div>
        </div>
      </div>
    }

    <app-results-note version="before" />

    @if (toast(); as message) {
      <!-- NOTE: appears and fades out, but isn't a live region, so a screen reader never hears it. -->
      <div class="toast">{{ message }}</div>
    }
  `,
  styleUrl: './orders-before.scss',
})
export class OrdersBefore {
  protected readonly store = inject(OrdersStore);
  protected readonly statuses = STATUSES;

  protected readonly query = signal('');
  protected readonly statusFilter = signal<OrderStatus | ''>('');
  protected readonly sortKey = signal<SortKey | null>(null);
  protected readonly sortDir = signal<1 | -1>(1);
  protected readonly page = signal(0);
  protected readonly menuFor = signal<number | null>(null);
  protected readonly toast = signal<string | null>(null);

  protected readonly editing = signal<Order | null>(null);
  protected readonly cancelling = signal<Order | null>(null);
  protected readonly draftCustomer = signal('');
  protected readonly draftEmail = signal('');
  protected readonly draftStatus = signal<OrderStatus>('Pending');
  protected readonly showErrors = signal(false);
  protected readonly emailValid = computed(() => EMAIL.test(this.draftEmail().trim()));

  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.toastTimer));
  }

  private readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    const key = this.sortKey();
    const dir = this.sortDir();
    const rows = this.store
      .orders()
      .filter((o) => !status || o.status === status)
      .filter((o) => !q || `${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q));
    if (!key) return rows;
    return rows.sort((a, b) => (a[key] < b[key] ? -dir : a[key] > b[key] ? dir : 0));
  });
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  protected readonly pageRows = computed(() =>
    this.filtered().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE),
  );

  protected readonly money = formatTotal;
  protected readonly date = formatDate;

  protected arrow(key: SortKey): string {
    if (this.sortKey() !== key) return '';
    return this.sortDir() === 1 ? '▲' : '▼';
  }

  protected sortBy(key: SortKey): void {
    if (this.sortKey() === key) this.sortDir.update((d) => (d === 1 ? -1 : 1));
    else {
      this.sortKey.set(key);
      this.sortDir.set(1);
    }
    this.page.set(0);
  }

  protected onSearch(event: Event): void {
    this.query.set(this.value(event));
    this.page.set(0);
  }

  protected onStatus(event: Event): void {
    this.statusFilter.set(this.value(event) as OrderStatus | '');
    this.page.set(0);
  }

  protected toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.menuFor.update((open) => (open === id ? null : id));
  }

  protected edit(o: Order): void {
    this.menuFor.set(null);
    this.draftCustomer.set(o.customer);
    this.draftEmail.set(o.email);
    this.draftStatus.set(o.status);
    this.showErrors.set(false);
    this.editing.set(o);
  }

  protected save(o: Order): void {
    this.showErrors.set(true);
    if (!this.emailValid() || !this.draftCustomer().trim()) return;
    this.store.update(o.id, {
      customer: this.draftCustomer().trim(),
      email: this.draftEmail().trim(),
      status: this.draftStatus(),
    });
    this.editing.set(null);
    this.flash(`Order #${o.id} saved`);
  }

  protected canShip(o: Order): boolean {
    return o.status !== 'Shipped' && o.status !== 'Cancelled';
  }

  protected askCancel(o: Order): void {
    this.menuFor.set(null);
    this.cancelling.set(o);
  }

  protected ship(o: Order): void {
    this.menuFor.set(null);
    this.store.update(o.id, { status: 'Shipped' });
    this.flash(`Order #${o.id} marked as shipped`);
  }

  protected cancel(o: Order): void {
    this.cancelling.set(null);
    this.store.update(o.id, { status: 'Cancelled' });
    this.flash(`Order #${o.id} cancelled`);
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected statusOf(event: Event): OrderStatus {
    return this.value(event) as OrderStatus;
  }

  private flash(message: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }
}
