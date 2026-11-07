import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { DialogRef } from '@angular/cdk/dialog';
import { NGBR_DIALOG_DATA, NgbrDialogActions, NgbrDialogClose, NgbrDialogTitle } from '@ngbracket/overlays';
import { NgbrErrorSummary, NgbrFormField, NgbrInput, NgbrSelect } from '@ngbracket/forms';
import type { NgbrFieldError, NgbrSelectOption } from '@ngbracket/forms';

import { STATUSES, type Order, type OrderStatus } from '../data/orders';

/** What the dialog hands back on Save. */
export type OrderChanges = Pick<Order, 'customer' | 'email' | 'status'>;

/**
 * AFTER: the edit form, opened in an NgbrDialog. The dialog holds focus and
 * returns it on close; the form wires labels and errors to each control, and
 * a failed Save moves focus to an error summary that links to the fields.
 */
@Component({
  selector: 'app-edit-order-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    NgbrDialogTitle,
    NgbrDialogActions,
    NgbrDialogClose,
    NgbrErrorSummary,
    NgbrFormField,
    NgbrInput,
    NgbrSelect,
  ],
  template: `
    <h2 ngbrDialogTitle>Edit order #{{ order.id }}</h2>

    <ngbr-error-summary [errors]="errorList()" heading="Please fix the following" />

    <form id="edit-order" (submit)="onSubmit($event)" novalidate>
      <ngbr-form-field label="Customer">
        <ngbr-input id="order-customer" [formField]="f.customer" [forceShowErrors]="submitted()" />
      </ngbr-form-field>
      <ngbr-form-field label="Email">
        <ngbr-input id="order-email" type="email" [formField]="f.email" [forceShowErrors]="submitted()" />
      </ngbr-form-field>
      <ngbr-form-field label="Status">
        <ngbr-select [(value)]="status" [options]="statusOptions" aria-label="Status" />
      </ngbr-form-field>
    </form>

    <div ngbrDialogActions>
      <button type="button" class="btn" ngbrDialogClose>Cancel</button>
      <button type="submit" form="edit-order" class="btn btn--primary">Save</button>
    </div>
  `,
  styles: [
    `
      form {
        display: grid;
        gap: 4px;
        margin-bottom: 8px;
      }
      .btn {
        padding: 9px 16px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        color: var(--ngbr-color-text, #0f172a);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #cbd5e1);
        border-radius: 8px;
      }
      .btn--primary {
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent, #0e7490);
        border-color: transparent;
      }
    `,
  ],
})
export class EditOrderDialog {
  protected readonly order = inject<Order>(NGBR_DIALOG_DATA);
  private readonly ref = inject<DialogRef<OrderChanges>>(DialogRef);

  protected readonly statusOptions: NgbrSelectOption<OrderStatus>[] = STATUSES.map((s) => ({ value: s, label: s }));
  protected readonly status = signal<OrderStatus | null>(this.order.status);
  protected readonly submitted = signal(false);

  protected readonly model = signal({ customer: this.order.customer, email: this.order.email });
  protected readonly f = form(this.model, (p) => {
    required(p.customer, { message: 'Enter the customer name' });
    required(p.email, { message: 'Enter an email address' });
    email(p.email, { message: 'Enter a valid email address' });
  });

  protected readonly errorList = computed<NgbrFieldError[]>(() => {
    if (!this.submitted()) return [];
    const list: NgbrFieldError[] = [];
    const customer = this.f.customer().errors();
    if (customer.length) list.push({ fieldId: 'order-customer', message: customer[0].message ?? 'Invalid' });
    const mail = this.f.email().errors();
    if (mail.length) list.push({ fieldId: 'order-email', message: mail[0].message ?? 'Invalid' });
    return list;
  });

  private readonly summary = viewChild.required(NgbrErrorSummary);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.errorList().length) {
      this.summary().focus();
      return;
    }
    const { customer, email: mail } = this.model();
    this.ref.close({ customer: customer.trim(), email: mail.trim(), status: this.status() ?? this.order.status });
  }
}
