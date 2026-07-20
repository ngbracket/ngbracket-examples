import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

import { KbStore, type ArticleFormat } from '../data/kb-store';

interface ArticleDraft {
  title: string;
  slug: string;
  category: string | null;
  summary: string;
  body: string;
}

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
  ],
  template: `
    <div class="wrap">
      <h1>{{ editId() ? 'Edit article' : 'New article' }}</h1>

      @if (saved()) {
        <p class="saved" role="status">Saved ✓ — <a routerLink="/browse">back to browse</a>.</p>
      }

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
          <a routerLink="/browse" class="cancel">Cancel</a>
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
      .saved {
        padding: 10px 14px;
        border-radius: var(--ngbr-radius);
        background: color-mix(in srgb, var(--ngbr-color-success) 15%, transparent);
        color: var(--ngbr-color-text);
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

  protected readonly model = signal<ArticleDraft>({
    title: '',
    slug: '',
    category: null,
    summary: '',
    body: '',
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
        });
      }
    }
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    this.submitted.set(true);
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
        });
        this.saved.set(true);
        return undefined; // no server-side validation errors
      },
    });
  }
}
