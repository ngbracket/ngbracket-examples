import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import type { NgbrCalendarEvent } from '@ngbracket/scheduler';

/** Palette offered in the editor (mirrors the seed data hues). */
const COLOURS: readonly { label: string; value: string }[] = [
  { label: 'Teal', value: '#0e7490' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Pink', value: '#db2777' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Slate', value: '#64748b' },
];

/** `end` must be strictly after `start`. */
function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const start = group.get('start')?.value;
  const end = group.get('end')?.value;
  if (!start || !end) return null;
  return new Date(end) > new Date(start) ? null : { endBeforeStart: true };
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Date → `YYYY-MM-DDTHH:mm` in local time for `<input type="datetime-local">`. */
function toLocalInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Accessible edit dialog for a single appointment. Wraps a native `<dialog>` —
 * `showModal()` gives us focus-trapping, Escape-to-close and focus restoration
 * for free. Driven by the `event` input: set it to open (patched into the
 * reactive form), clear it to close. Emits `save` / `remove` / `cancel`.
 */
@Component({
  selector: 'booking-event-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dlg class="dlg" aria-labelledby="ee-title" (close)="onNativeClose()">
      <form class="ee" [formGroup]="form" (ngSubmit)="onSubmit()">
        <h2 id="ee-title" class="ee__title">{{ event() ? 'Edit appointment' : '' }}</h2>

        <label class="ee__field">
          <span class="ee__label">Title</span>
          <input type="text" formControlName="title" class="ee__input" autocomplete="off" />
          @if (invalid('title')) {
            <span class="ee__err" role="alert">A title is required.</span>
          }
        </label>

        <div class="ee__row">
          <label class="ee__field">
            <span class="ee__label">Starts</span>
            <input type="datetime-local" formControlName="start" class="ee__input" />
          </label>
          <label class="ee__field">
            <span class="ee__label">Ends</span>
            <input type="datetime-local" formControlName="end" class="ee__input" />
          </label>
        </div>
        @if (form.errors?.['endBeforeStart']) {
          <span class="ee__err" role="alert">The end time must be after the start time.</span>
        }

        <label class="ee__field">
          <span class="ee__label">Note <span class="ee__opt">(optional)</span></span>
          <input type="text" formControlName="meta" class="ee__input" autocomplete="off" />
        </label>

        <label class="ee__field">
          <span class="ee__label">Colour</span>
          <select formControlName="color" class="ee__input">
            @for (c of colours; track c.value) {
              <option [value]="c.value">{{ c.label }}</option>
            }
          </select>
        </label>

        <div class="ee__actions">
          <button type="button" class="ee__btn ee__btn--danger" (click)="remove.emit(event()!.id)">
            Delete
          </button>
          <span class="ee__spacer"></span>
          <button type="button" class="ee__btn" (click)="cancel.emit()">Cancel</button>
          <button type="submit" class="ee__btn ee__btn--primary" [disabled]="form.invalid">Save</button>
        </div>
      </form>
    </dialog>
  `,
  styles: [
    `
      .dlg {
        width: min(440px, calc(100vw - 32px));
        padding: 0;
        color: var(--ngbr-color-text, #1a1c1e);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: var(--ngbr-radius, 10px);
      }
      .dlg::backdrop {
        background: rgba(0, 0, 0, 0.45);
      }
      .ee {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px;
      }
      .ee__title {
        margin: 0;
        font-size: 1.25rem;
      }
      .ee__row {
        display: flex;
        gap: 12px;
      }
      .ee__field {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }
      .ee__label {
        font-size: 0.875rem;
        font-weight: 600;
      }
      .ee__opt {
        font-weight: 400;
        color: var(--ngbr-color-text-muted, #44474a);
      }
      .ee__input {
        width: 100%;
        box-sizing: border-box;
        height: 42px;
        padding: 0 12px;
        font: inherit;
        color: var(--ngbr-color-text, #1a1c1e);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: var(--ngbr-radius, 10px);
      }
      .ee__input:focus-visible {
        outline: 2px solid var(--ngbr-color-accent, #0e7490);
        outline-offset: 1px;
      }
      .ee__err {
        font-size: 0.8125rem;
        color: var(--ngbr-color-error, #b91c1c);
      }
      .ee__actions {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
      }
      .ee__spacer {
        flex: 1;
      }
      .ee__btn {
        height: 40px;
        padding: 0 16px;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-text, #1a1c1e);
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: var(--ngbr-radius, 10px);
        cursor: pointer;
      }
      .ee__btn:focus-visible {
        outline: 2px solid var(--ngbr-color-accent, #0e7490);
        outline-offset: 2px;
      }
      .ee__btn:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .ee__btn--primary {
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent, #0e7490);
        border-color: transparent;
      }
      .ee__btn--danger {
        color: var(--ngbr-color-danger, #b91c1c);
        border-color: color-mix(in srgb, var(--ngbr-color-danger, #b91c1c) 45%, transparent);
      }
    `,
  ],
})
export class EventEditor {
  private readonly fb = inject(FormBuilder);

  /** The appointment to edit; `null` keeps the dialog closed. */
  readonly event = input<NgbrCalendarEvent | null>(null);

  /** Emits the edited appointment on save. */
  readonly save = output<NgbrCalendarEvent>();
  /** Emits the appointment id to delete. */
  readonly remove = output<string>();
  /** Emits when the user dismisses without saving. */
  readonly cancel = output<void>();

  protected readonly colours = COLOURS;

  private readonly dlg = viewChild<ElementRef<HTMLDialogElement>>('dlg');

  protected readonly form = this.fb.nonNullable.group(
    {
      title: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      meta: [''],
      color: [COLOURS[0].value],
    },
    { validators: endAfterStart },
  );

  constructor() {
    // Open/close the native dialog in step with the `event` input, patching the
    // form whenever a new appointment is opened.
    effect(() => {
      const ev = this.event();
      const dialog = this.dlg()?.nativeElement;
      if (!dialog) return;

      if (ev) {
        this.form.reset({
          title: ev.title,
          start: toLocalInput(ev.start),
          end: toLocalInput(ev.end),
          meta: ev.meta ?? '',
          color: ev.color ?? COLOURS[0].value,
        });
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  protected invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Escape / backdrop dismissal of the native dialog → treat as cancel. */
  protected onNativeClose(): void {
    if (this.event()) this.cancel.emit();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const base = this.event();
    if (!base) return;
    const v = this.form.getRawValue();
    this.save.emit({
      ...base,
      title: v.title.trim(),
      start: new Date(v.start),
      end: new Date(v.end),
      meta: v.meta.trim() || undefined,
      color: v.color,
    });
  }
}
