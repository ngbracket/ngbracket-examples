import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  NgbrBanner,
  NgbrConfirm,
  NgbrDialog,
  NgbrDialogActions,
  NgbrDialogClose,
  NgbrDialogTitle,
  NgbrDrawer,
  NgbrPopover,
  NgbrToast,
  NgbrTooltip,
} from '@ngbracket/overlays';
import { SkipLink, ThemeToggle } from 'shared';

/** Body opened by NgbrDialog — a small "edit" form. */
@Component({
  selector: 'app-edit-project-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrDialogTitle, NgbrDialogActions, NgbrDialogClose],
  template: `
    <h2 ngbrDialogTitle>Edit project</h2>
    <label class="field">
      <span>Name</span>
      <input #name type="text" value="NgBracket Overlays" />
    </label>
    <label class="field">
      <span>Description</span>
      <textarea rows="3">Accessible overlays for Angular.</textarea>
    </label>
    <div ngbrDialogActions>
      <button class="btn" ngbrDialogClose>Cancel</button>
      <button class="btn btn--primary" [ngbrDialogClose]="name.value">Save</button>
    </div>
  `,
  styles: [
    `
      .field {
        display: block;
        margin-bottom: 14px;
      }
      .field span {
        display: block;
        margin-bottom: 4px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .field input,
      .field textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        font: inherit;
        color: var(--ngbr-color-text, #0f172a);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #cbd5e1);
        border-radius: 8px;
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
export class EditProjectDialog {}

/** Body opened by NgbrDrawer — a filters panel. */
@Component({
  selector: 'app-filters-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrDialogTitle, NgbrDialogActions, NgbrDialogClose],
  template: `
    <h2 ngbrDialogTitle>Filters</h2>
    <fieldset class="group">
      <legend>Status</legend>
      <label><input type="checkbox" checked /> Active</label>
      <label><input type="checkbox" /> Archived</label>
      <label><input type="checkbox" /> Draft</label>
    </fieldset>
    <fieldset class="group">
      <legend>Visibility</legend>
      <label><input type="radio" name="vis" checked /> Everyone</label>
      <label><input type="radio" name="vis" /> Team only</label>
    </fieldset>
    <div ngbrDialogActions>
      <button class="btn" ngbrDialogClose>Cancel</button>
      <button class="btn btn--primary" [ngbrDialogClose]="true">Apply filters</button>
    </div>
  `,
  styles: [
    `
      .group {
        margin: 0 0 16px;
        padding: 12px 14px;
        border: 1px solid var(--ngbr-color-border, #cbd5e1);
        border-radius: 10px;
      }
      .group legend {
        padding: 0 6px;
        font-weight: 700;
      }
      .group label {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 5px 0;
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
export class FiltersDrawer {}

/**
 * A tiny "Project settings" page showcasing every component in
 * @ngbracket/overlays: a dialog, a promise-based confirm, toasts, an edge
 * drawer, tooltips, a popover and banners — all keyboard-accessible, WCAG AA,
 * in light and dark.
 */
@Component({
  selector: 'app-overlays-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrBanner, NgbrTooltip, NgbrPopover, ThemeToggle, SkipLink],
  template: `
    <app-skip-link />
    <header class="chrome">
      <div class="brand"><span class="brand__mark" aria-hidden="true">◇</span> NgBracket Overlays</div>
      <app-theme-toggle />
    </header>

    <main id="main-content" tabindex="-1" class="page">
      @if (showIntro()) {
        <ngbr-banner tone="info" [dismissible]="true" (dismissed)="showIntro.set(false)">
          Every overlay on this page is built with <strong>&#64;ngbracket/overlays</strong> — keyboard-accessible,
          focus-managed and WCAG AA in light and dark.
        </ngbr-banner>
      }

      <section class="card" aria-labelledby="settings-heading">
        <div class="card__head">
          <h1 id="settings-heading">Project settings</h1>
          <div class="card__tools">
            <button type="button" class="icon" [ngbrTooltip]="'Help'" aria-label="Help">?</button>
            <button
              type="button"
              class="icon"
              [ngbrPopover]="share"
              ngbrPopoverLabel="Share project"
              #pop="ngbrPopover"
              aria-label="Share"
            >
              ⇪
            </button>
          </div>
        </div>

        <ul class="rows">
          <li class="row">
            <div>
              <p class="row__title">Details</p>
              <p class="row__sub">Name and description</p>
            </div>
            <button type="button" class="btn" (click)="edit()">Edit…</button>
          </li>
          <li class="row">
            <div>
              <p class="row__title">Results</p>
              <p class="row__sub">Refine what you see</p>
            </div>
            <button type="button" class="btn" (click)="filters()">Filters…</button>
          </li>
          <li class="row">
            <div>
              <p class="row__title">Save</p>
              <p class="row__sub">Persist your changes</p>
            </div>
            <button type="button" class="btn btn--primary" (click)="save()">Save changes</button>
          </li>
          <li class="row">
            <div>
              <p class="row__title">Danger zone</p>
              <p class="row__sub">Delete this project permanently</p>
            </div>
            <button type="button" class="btn btn--danger" (click)="remove()">Delete project</button>
          </li>
        </ul>
      </section>

      <section class="card" aria-labelledby="tones-heading">
        <h2 id="tones-heading">Banners</h2>
        <div class="stack">
          <ngbr-banner tone="success" heading="Saved">Your changes are live.</ngbr-banner>
          <ngbr-banner tone="warning" heading="Heads up">Your trial ends in 3 days.</ngbr-banner>
          <ngbr-banner tone="danger" heading="Action needed">Payment failed — update your card.</ngbr-banner>
        </div>
      </section>
    </main>

    <ng-template #share>
      <p class="share__title">Share project</p>
      <div class="share__actions">
        <button type="button" class="btn" (click)="pick('Link copied', pop)">Copy link</button>
        <button type="button" class="btn" (click)="pick('Shared by email', pop)">Email</button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
        background: var(--app-bg, #f6f8f9);
        color: var(--ngbr-color-text, #1a1c1e);
      }
      .chrome {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: var(--ngbr-color-surface, #fff);
        border-bottom: 1px solid var(--ngbr-color-border, #c4c7c9);
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
      }
      .brand__mark {
        color: var(--ngbr-color-accent, #0e7490);
        font-size: 1.2rem;
      }
      .page {
        max-width: 760px;
        margin: 0 auto;
        padding: 28px 16px 64px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .card {
        padding: 20px 22px;
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: 14px;
      }
      .card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }
      .card h1 {
        margin: 0;
        font-size: 1.3rem;
      }
      .card h2 {
        margin: 0 0 12px;
        font-size: 1.1rem;
      }
      .card__tools {
        display: flex;
        gap: 8px;
      }
      .icon {
        width: 34px;
        height: 34px;
        font-size: 1rem;
        cursor: pointer;
        color: var(--ngbr-color-text, #0f172a);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #cbd5e1);
        border-radius: 8px;
      }
      .icon:focus-visible,
      .btn:focus-visible {
        outline: none;
        box-shadow: var(--ngbr-focus-ring, 0 0 0 3px rgba(14, 116, 144, 0.4));
      }
      .rows {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 0;
        border-top: 1px solid var(--ngbr-color-border, #c4c7c9);
      }
      .row:first-child {
        border-top: 0;
      }
      .row__title {
        margin: 0;
        font-weight: 600;
      }
      .row__sub {
        margin: 2px 0 0;
        font-size: 0.88rem;
        color: var(--ngbr-color-text-muted, #475569);
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .btn {
        padding: 9px 16px;
        font: inherit;
        font-weight: 600;
        white-space: nowrap;
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
      .btn--danger {
        color: var(--ngbr-color-danger-contrast, #fff);
        background: var(--ngbr-color-danger, #b91c1c);
        border-color: transparent;
      }
      .share__title {
        margin: 0 0 0.5rem;
        font-weight: 700;
      }
      .share__actions {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class OverlaysDemo {
  private readonly dialog = inject(NgbrDialog);
  private readonly drawer = inject(NgbrDrawer);
  private readonly confirm = inject(NgbrConfirm);
  private readonly toast = inject(NgbrToast);

  protected readonly showIntro = signal(true);

  protected async edit(): Promise<void> {
    const ref = this.dialog.open<string>(EditProjectDialog, { ariaLabel: 'Edit project' });
    const name = await ref.result;
    if (name) this.toast.success(`Saved “${name}”.`);
  }

  protected async filters(): Promise<void> {
    const ref = this.drawer.open<boolean>(FiltersDrawer, { side: 'end', ariaLabel: 'Filters' });
    if (await ref.result) this.toast.info('Filters applied.');
  }

  protected save(): void {
    this.toast.success('Project saved.');
  }

  protected async remove(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete project?',
      message: 'This can’t be undone.',
      confirmText: 'Delete',
      tone: 'danger',
    });
    if (ok) this.toast.danger('Project deleted.');
  }

  protected pick(message: string, pop: { close: () => void }): void {
    pop.close();
    this.toast.success(message);
  }
}
