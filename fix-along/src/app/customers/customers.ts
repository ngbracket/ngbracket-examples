import { Component } from '@angular/core';

import { CUSTOMERS } from '../data';

@Component({
  selector: 'app-customers',
  template: `
    <h1 class="page-title">Customers</h1>
    <ul class="list">
      @for (customer of customers; track customer.email) {
        <li>
          <span class="name">{{ customer.name }}</span>
          <span class="muted">{{ customer.email }}</span>
          <span class="count">{{ customer.orders }} orders</span>
        </li>
      }
    </ul>
  `,
  styles: `
    .list {
      display: grid;
      list-style: none;
      margin: 0;
      padding: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
    }

    li {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
    }

    li:last-child {
      border-bottom: 0;
    }

    .name {
      font-weight: 600;
    }

    .count {
      margin-inline-start: auto;
    }
  `,
})
export class Customers {
  protected readonly customers = CUSTOMERS;
}
