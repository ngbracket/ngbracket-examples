import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  form,
  required,
  minLength,
  pattern,
  submit,
  FormField,
  FormRoot,
} from '@angular/forms/signals';
import { NgbrFormField, NgbrInput, NgbrTextarea } from '@ngbracket/forms';
import { NgbrTreeSelect } from '@ngbracket/structure';
import { NgbrRichText, NgbrMarkdownEditor } from '@ngbracket/editor';
import { NgbrTabs, NgbrTabList, NgbrTab, NgbrTabPanel } from '@ngbracket/navigation';
import { NgbrChipSet, NgbrInputChip } from '@ngbracket/primitives';
import { NgbrAutosaveStatusComponent, ngbrAutosave } from '@ngbracket/form-kit';

import { KbStore, type ArticleDraft, type ArticleFormat } from '../data/kb-store';

/** The form's fields: a draft without the body format, which lives in `bodyTab`. */
type ArticleFields = Omit<ArticleDraft, 'format'>;

/** Create / edit an article — Signal Forms with `formRoot` + `submit()` (the headline dogfood). */
@Component({
  selector: 'kb-article-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormField,
    FormRoot,
    NgbrFormField,
    NgbrInput,
    NgbrTextarea,
    NgbrTreeSelect,
    NgbrRichText,
    NgbrMarkdownEditor,
    NgbrTabs,
    NgbrTabList,
    NgbrTab,
    NgbrTabPanel,
    NgbrChipSet,
    NgbrInputChip,
    NgbrAutosaveStatusComponent,
  ],
  template: `
    <div class="wrap">
      <h1 #heading tabindex="-1">{{ editId() ? 'Edit article' : 'New article' }}</h1>

      <!-- Present from the start and filled after render, so screen readers announce it. -->
      <!-- A live region for the restore note; when it's the focus target (after
           Discard) it drops the role, so the message is read once, from focus. -->
      <div #restoredEl class="restored" tabindex="-1" [attr.role]="noteFocused() ? null : 'status'">
        @if (restoredNote()) {
          {{ restoredNote() }}
          @if (hasDraft()) {
            <button type="button" class="discard" (click)="discardDraft()">Discard draft</button>
          }
        }
      </div>

      <!-- Always present and filled after the save, so screen readers announce it. -->
      <!-- After creating an article, focus moves here and it's read from focus,
           so it isn't a live region then (NVDA reads only one of the two). -->
      <div #savedEl class="saved" tabindex="-1" [attr.role]="savedFocused() ? null : 'status'">
        @if (saved()) {
          Saved ✓. <a routerLink="/browse">Back to browse</a>.
        }
      </div>

      <!-- formRoot binds the FieldTree, sets novalidate, intercepts the native submit. -->
      <form [formRoot]="f" (submit)="save($event)" novalidate>
        <ngbr-form-field label="Title" hint="At least 3 characters.">
          <ngbr-input id="title" [formField]="f.title" [forceShowErrors]="submitted()" />
        </ngbr-form-field>

        <ngbr-form-field label="Slug" hint="Lowercase letters, numbers and hyphens.">
          <ngbr-input id="slug" [formField]="f.slug" [forceShowErrors]="submitted()" />
        </ngbr-form-field>

        <div class="field">
          <label id="cat-label" class="field__label">Category</label>
          <ngbr-tree-select
            [formField]="f.category"
            [nodes]="store.categoryNodes()"
            placeholder="Search categories…"
            aria-labelledby="cat-label"
          />
          @if (submitted() && f.category().invalid()) {
            <p class="err">Please choose a category.</p>
          }
        </div>

        <ngbr-form-field label="Summary" hint="One line shown in the list.">
          <ngbr-textarea id="summary" [formField]="f.summary" />
        </ngbr-form-field>

        <div class="field">
          <span class="field__label" aria-hidden="true">Tags</span>
          @if (model().tags.length) {
            <div ngbrChipSet label="Tags" class="tags">
              @for (tag of model().tags; track tag) {
                <ngbr-input-chip [label]="tag" (removed)="removeTag(tag)" />
              }
            </div>
          }
          <ngbr-form-field label="Add a tag" [hint]="tagHint()">
            <ngbr-input #tagInput [(value)]="newTag" (keydown.enter)="addTag($event)" />
          </ngbr-form-field>
        </div>

        <div class="field">
          <span id="body-label" class="field__label">Body</span>
          <ngbr-tabs>
            <ngbr-tab-list [(selectedTab)]="bodyTab" aria-labelledby="body-label">
              <button ngbrTab value="rich">Rich text</button>
              <button ngbrTab value="markdown">Markdown</button>
            </ngbr-tab-list>
            <ngbr-tab-panel value="rich">
              @if (bodyTab() === 'rich') {
                <ngbr-rich-text [formField]="f.body" aria-label="Body (rich text)" />
              }
            </ngbr-tab-panel>
            <ngbr-tab-panel value="markdown">
              @if (bodyTab() === 'markdown') {
                <ngbr-markdown-editor [formField]="f.body" aria-label="Body (markdown)" />
              }
            </ngbr-tab-panel>
          </ngbr-tabs>
          @if (submitted() && f.body().invalid()) {
            <p class="err">Body can’t be empty.</p>
          }
        </div>

        <div class="actions">
          <button type="submit" class="save" [disabled]="f().submitting()">
            {{ f().submitting() ? 'Saving…' : 'Save article' }}
          </button>
          <a routerLink="/browse" class="cancel" (click)="store.clearDraft(draftKey())">Cancel</a>
          <ngbr-autosave-status class="autosave" [autosave]="autosave" />
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .wrap {
        max-width: 720px;
      }
      h1 {
        font-size: clamp(1.4rem, 3vw, 1.9rem);
      }
      form {
        display: grid;
        gap: 20px;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field__label {
        font-weight: 600;
        font-size: 0.9rem;
      }
      .err {
        margin: 0;
        color: var(--ngbr-color-error);
        font-size: 0.85rem;
      }
      .saved:empty {
        display: none;
      }
      .saved {
        padding: 10px 14px;
        border-radius: var(--ngbr-radius);
        background: color-mix(in srgb, var(--ngbr-color-success) 15%, transparent);
        color: var(--ngbr-color-text);
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .restored:not(:empty) {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin: 0 0 12px;
        color: var(--ngbr-color-text-muted);
      }
      .discard {
        padding: 4px 10px;
        font: inherit;
        color: var(--ngbr-color-accent);
        background: transparent;
        border: 1px solid var(--ngbr-color-border-control);
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .autosave {
        margin-left: auto;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .save {
        padding: 10px 20px;
        font: inherit;
        font-weight: 600;
        color: var(--ngbr-color-accent-contrast);
        background: var(--ngbr-color-accent);
        border: 0;
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .save:disabled {
        opacity: 0.6;
        cursor: progress;
      }
      .save:focus-visible {
        outline: 2px solid var(--ngbr-color-accent);
        outline-offset: 2px;
      }
      .cancel {
        color: var(--ngbr-color-text-muted);
        text-decoration: none;
      }
      .cancel:hover {
        color: var(--ngbr-color-text);
        text-decoration: underline;
      }
    `,
  ],
})
export class ArticleForm {
  protected readonly store = inject(KbStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly editId = signal<string | null>(null);
  protected readonly bodyTab = signal<ArticleFormat>('rich');
  protected readonly submitted = signal(false);
  protected readonly saved = signal(false);

  protected readonly model = signal<ArticleFields>({
    title: '',
    slug: '',
    category: null,
    summary: '',
    body: '',
    tags: [],
  });
  protected readonly newTag = signal('');
  protected readonly restoredNote = signal('');
  protected readonly hasDraft = signal(false);
  protected readonly noteFocused = signal(false);
  protected readonly savedFocused = signal(false);
  private readonly injector = inject(Injector);
  private readonly restoredEl = viewChild.required<ElementRef<HTMLElement>>('restoredEl');
  private readonly savedEl = viewChild.required<ElementRef<HTMLElement>>('savedEl');
  /** The value the last autosave (or load, or save) dealt with: a newer one is pending. */
  private lastAutosaved = '';
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  protected readonly tagHint = signal('Press Enter to add it.');
  private readonly tagInput = viewChild.required('tagInput', { read: ElementRef });

  /** Drafts are kept per article; a new article uses the 'new' slot. */
  protected readonly draftKey = computed(() => this.editId() ?? 'new');
  /** What was last loaded or saved; a draft equal to it isn't kept. */
  private lastCommitted = '';
  private loaded: ArticleDraft | null = null;

  protected readonly autosave = ngbrAutosave({
    value: (): ArticleDraft => ({ ...this.model(), format: this.bodyTab() }),
    save: (draft) => {
      // An autosave still pending when Save ran carries the saved content:
      // clear the draft rather than keep a copy of what's already saved.
      this.lastAutosaved = JSON.stringify(draft);
      if (this.lastAutosaved === this.lastCommitted) {
        this.store.clearDraft(this.draftKey());
        return;
      }
      // Editing again: "Draft discarded" no longer describes the page.
      if (this.restoredNote().startsWith('Draft discarded')) this.restoredNote.set('');
      this.store.saveDraft(this.draftKey(), draft);
    },
    messages: { saving: 'Saving draft…', saved: 'Draft saved', error: 'Draft not saved. Try again.' },
  });

  protected readonly f = form(this.model, (p) => {
    required(p.title, { message: 'A title is required.' });
    minLength(p.title, 3, { message: 'Use at least 3 characters.' });
    pattern(p.slug, /^[a-z0-9-]*$/, { message: 'Lowercase letters, numbers and hyphens only.' });
    required(p.category, { message: 'Please choose a category.' });
    required(p.body, { message: 'Body can’t be empty.' });
  });

  // ISO date for "updated" — a constant keeps saves deterministic (no `new Date()`).
  private readonly savedDate = '2026-07-20';

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const a = this.store.byId(id);
      if (a) {
        this.editId.set(a.id);
        this.bodyTab.set(a.format);
        this.model.set({
          title: a.title,
          slug: a.slug,
          category: a.categoryId,
          summary: a.summary,
          body: a.body,
          tags: a.tags ?? [],
        });
      }
    }
    // Arriving here straight after creating the article: keep its confirmation.
    if (this.router.currentNavigation()?.extras.state?.['saved']) {
      // Arrived straight after creating this article. The Save button that had
      // focus is gone: focus the confirmation itself, which is read from focus.
      this.savedFocused.set(true);
      this.saved.set(true);
      afterNextRender(() => this.savedEl().nativeElement.focus());
    }
    this.loaded = { ...this.model(), format: this.bodyTab() };
    this.lastCommitted = JSON.stringify(this.loaded);
    this.lastAutosaved = this.lastCommitted;
    const draft = this.store.draft(this.draftKey());
    if (draft) {
      const { format, ...fields } = draft;
      this.model.set(fields);
      this.bodyTab.set(format);
      this.hasDraft.set(true);
      this.lastAutosaved = JSON.stringify(draft);
      afterNextRender(() => this.restoredNote.set('Your unsaved draft was restored.'));
    }
  }

  /** Go back to the last saved version and forget the draft. */
  protected discardDraft(): void {
    this.store.clearDraft(this.draftKey());
    if (this.loaded) {
      const { format, ...fields } = this.loaded;
      this.model.set(fields);
      this.bodyTab.set(format);
    }
    this.hasDraft.set(false);
    // The Discard button is gone: focus the note, which says what happened.
    this.noteFocused.set(true);
    this.restoredNote.set('Draft discarded. Showing the saved version.');
    afterNextRender(() => this.restoredEl().nativeElement.focus(), { injector: this.injector });
  }

  protected addTag(event: Event): void {
    // Enter adds the tag; it mustn't submit the form.
    event.preventDefault();
    const tag = this.newTag().trim().toLowerCase();
    if (!tag) return;
    if (this.model().tags.includes(tag)) {
      this.tagHint.set(`"${tag}" is already added.`);
      return;
    }
    this.model.update((m) => ({ ...m, tags: [...m.tags, tag] }));
    this.tagHint.set('Press Enter to add it.');
    this.newTag.set('');
  }

  protected removeTag(tag: string): void {
    const remaining = this.model().tags.filter((t) => t !== tag);
    this.model.update((m) => ({ ...m, tags: remaining }));
    // The chip set moves focus to a neighbouring chip; with none left, go back to the input.
    if (!remaining.length) this.tagInput().nativeElement.querySelector('input')?.focus();
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    this.submitted.set(true);
    // Write any pending draft now, so a debounced autosave can't land after
    // the article is saved.
    if (JSON.stringify({ ...this.model(), format: this.bodyTab() }) !== this.lastAutosaved) {
      this.autosave.saveNow();
    }
    await submit(this.f, {
      action: async () => {
        const d = this.model();
        const id = this.editId() ?? this.store.nextId();
        this.store.upsert({
          id,
          title: d.title.trim(),
          slug: d.slug.trim(),
          categoryId: d.category!,
          summary: d.summary.trim(),
          body: d.body,
          format: this.bodyTab(),
          status: 'draft',
          updated: this.savedDate,
          tags: d.tags,
        });
        this.lastCommitted = JSON.stringify({ ...d, format: this.bodyTab() });
        this.store.clearDraft(this.draftKey());
        this.restoredNote.set('');
        this.hasDraft.set(false);
        this.saved.set(true);
        if (!this.editId()) {
          // A new article now has an id: carry on editing it at its own URL, so
          // later saves update it and "New" starts another one.
          void this.router.navigate(['/articles', id, 'edit'], { replaceUrl: true, state: { saved: true } });
        }
        return undefined; // no server-side validation errors
      },
    });
  }
}
