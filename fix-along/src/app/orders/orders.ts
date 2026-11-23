import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { ORDERS, Order } from '../data';

export type OrderSort = 'newest' | 'oldest' | 'total';

@Component({
  selector: 'app-orders',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  protected readonly query = signal('');
  protected readonly sort = signal<OrderSort>('newest');
  protected readonly selected = signal<ReadonlySet<number>>(new Set());

  protected readonly rows = computed(() => {
    const query = this.query().trim().toLowerCase();
    const rows = ORDERS.filter((order) => order.customer.toLowerCase().includes(query));
    return [...rows].sort(compareBy(this.sort()));
  });

  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.rows().every((order) => this.selected().has(order.id)),
  );

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected setSort(value: string): void {
    this.sort.set(value as OrderSort);
  }

  protected toggle(id: number): void {
    this.selected.update((selected) => {
      const next = new Set(selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.rows().map((o) => o.id)));
  }
}

function compareBy(sort: OrderSort): (a: Order, b: Order) => number {
  switch (sort) {
    case 'oldest':
      return (a, b) => a.date.localeCompare(b.date) || a.id - b.id;
    case 'total':
      return (a, b) => b.total - a.total;
    case 'newest':
      return (a, b) => b.date.localeCompare(a.date) || b.id - a.id;
  }
}
