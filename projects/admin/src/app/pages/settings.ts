import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { form, required, email, FormField } from '@angular/forms/signals';
import { NgbrPageHeader, NgbrCard } from '@ngbracket/dashboard';
import {
  NgbrFormField,
  NgbrInput,
  NgbrSelect,
  NgbrSwitch,
  NgbrErrorSummary,
} from '@ngbracket/forms';
import type { NgbrSelectOption, NgbrFieldError } from '@ngbracket/forms';

const PLANS: NgbrSelectOption[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise' },
];

/** Workspace settings — a Signal-Forms form with an error summary + inline errors. */
@Component({
  selector: 'admin-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbrPageHeader,
    NgbrCard,
    NgbrFormField,
    NgbrInput,
    NgbrSelect,
    NgbrSwitch,
    NgbrErrorSummary,
    FormField,
  ],
  template: `
    <ngbr-page-header heading="Settings" subtitle="Manage your workspace profile" />

    <ngbr-card heading="Company profile">
      @if (saved()) {
        <p class="saved" role="status">Settings saved ✓</p>
      }

      <ngbr-error-summary [errors]="errorList()" heading="Please fix the following" />

      <form (submit)="onSubmit($event)" novalidate>
        <ngbr-form-field label="Workspace name" hint="Shown across the app.">
          <ngbr-input id="set-name" [formField]="f.name" [forceShowErrors]="submitted()" />
        </ngbr-form-field>

        <ngbr-form-field label="Billing email">
          <ngbr-input id="set-email" type="email" [formField]="f.email" [forceShowErrors]="submitted()" />
        </ngbr-form-field>

        <ngbr-form-field label="Plan">
          <ngbr-select [(value)]="plan" [options]="plans" aria-label="Plan" />
        </ngbr-form-field>

        <ngbr-switch [(checked)]="notify">Email me about product updates</ngbr-switch>

        <button type="submit" class="save-btn">Save changes</button>
      </form>
    </ngbr-card>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 560px;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }
      .save-btn {
        align-self: flex-start;
        padding: 0.6rem 1.2rem;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
        border: 0;
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .save-btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .saved {
        margin: 0 0 0.5rem;
        color: var(--ngbr-color-accent);
        font-weight: 600;
      }
    `,
  ],
})
export class Settings {
  protected readonly plans = PLANS;
  protected readonly plan = signal<string | null>('pro');
  protected readonly notify = signal(true);
  protected readonly submitted = signal(false);
  protected readonly saved = signal(false);

  protected readonly model = signal({ name: 'Helm Inc.', email: 'billing@helm.app' });
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: 'Enter a workspace name' });
    required(p.email, { message: 'Enter a billing email' });
    email(p.email, { message: 'Enter a valid email address' });
  });

  protected readonly errorList = computed<NgbrFieldError[]>(() => {
    if (!this.submitted()) return [];
    const list: NgbrFieldError[] = [];
    const nameErrors = this.f.name().errors();
    if (nameErrors.length) list.push({ fieldId: 'set-name', message: nameErrors[0].message ?? 'Invalid' });
    const emailErrors = this.f.email().errors();
    if (emailErrors.length) list.push({ fieldId: 'set-email', message: emailErrors[0].message ?? 'Invalid' });
    return list;
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.saved.set(this.errorList().length === 0);
  }
}
