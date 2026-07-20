import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { marked } from 'marked';
import { NgbrTree, NgbrAccordion, NgbrAccordionItem } from '@ngbracket/structure';
import { NgbrContextMenu, NgbrMenu, NgbrMenuItem } from '@ngbracket/navigation';

import { KbStore } from '../data/kb-store';

/** Browse: NgbrTree sidebar (+ context menu) | article reader with a metadata accordion. */
@Component({
  selector: 'kb-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgbrTree,
    NgbrAccordion,
    NgbrAccordionItem,
    NgbrContextMenu,
    NgbrMenu,
    NgbrMenuItem,
  ],
  template: `
    <div class="browse">
      <aside class="sidebar" [ngbrContextMenu]="treeMenu">
        <h2 class="sidebar__title">Topics</h2>
        <ngbr-tree
          [nodes]="store.treeNodes()"
          [value]="treeValue()"
          (valueChange)="onTreeSelect($event)"
          aria-label="Knowledge base topics"
        />
        <p class="hint">Tip: right-click for actions.</p>
      </aside>

      <article class="reader">
        @if (selectedArticle(); as a) {
          <header class="reader__head">
            <h1>{{ a.title }}</h1>
            <a class="edit" [routerLink]="['/articles', a.id, 'edit']">Edit</a>
          </header>
          <p class="summary">{{ a.summary }}</p>
          <div class="body" [innerHTML]="bodyHtml()"></div>

          <ngbr-accordion class="meta">
            <ngbr-accordion-item heading="Details" [headingLevel]="2" [expanded]="true">
              <dl>
                <dt>Category</dt>
                <dd>{{ store.categoryLabel(a.categoryId) }}</dd>
                <dt>Status</dt>
                <dd>{{ a.status }}</dd>
                <dt>Slug</dt>
                <dd>/{{ a.slug }}</dd>
                <dt>Format</dt>
                <dd>{{ a.format }}</dd>
                <dt>Updated</dt>
                <dd>{{ a.updated }}</dd>
              </dl>
            </ngbr-accordion-item>
            <ngbr-accordion-item heading="Related in this category" [headingLevel]="2">
              @if (related().length) {
                <ul class="related">
                  @for (r of related(); track r.id) {
                    <li>
                      <button type="button" class="link" (click)="select(r.id)">{{ r.title }}</button>
                    </li>
                  }
                </ul>
              } @else {
                <p>No other articles here yet.</p>
              }
            </ngbr-accordion-item>
          </ngbr-accordion>
        } @else {
          <p class="empty">Select a topic from the list to read it.</p>
        }
      </article>
    </div>

    <ng-template #treeMenu>
      <ngbr-menu contextual>
        <button ngbrMenuItem value="new" (click)="menu('new')">New article</button>
        <button ngbrMenuItem value="manage" (click)="menu('manage')">Manage articles</button>
      </ngbr-menu>
    </ng-template>
  `,
  styles: [
    `
      .browse {
        display: grid;
        grid-template-columns: minmax(220px, 280px) 1fr;
        gap: clamp(16px, 3vw, 32px);
        align-items: start;
      }
      .sidebar {
        border: 1px solid var(--ngbr-color-border);
        border-radius: var(--ngbr-radius);
        padding: 14px;
        background: var(--ngbr-color-surface);
      }
      .sidebar__title {
        margin: 0 0 10px;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--ngbr-color-text-muted);
      }
      .hint {
        margin: 12px 0 0;
        font-size: 0.78rem;
        color: var(--ngbr-color-text-muted);
      }
      .reader {
        max-width: 72ch;
      }
      .reader__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .reader__head h1 {
        margin: 0;
        font-size: clamp(1.4rem, 3vw, 1.9rem);
      }
      .edit {
        flex: 0 0 auto;
        padding: 7px 14px;
        border-radius: var(--ngbr-radius);
        border: 1px solid var(--ngbr-color-border);
        color: var(--ngbr-color-text);
        text-decoration: none;
        font-size: 0.9rem;
      }
      .edit:hover {
        border-color: var(--ngbr-color-accent);
        color: var(--ngbr-color-accent);
      }
      .summary {
        color: var(--ngbr-color-text-muted);
        font-size: 1.02rem;
      }
      .body {
        line-height: 1.65;
      }
      .body :is(h1, h2, h3) {
        line-height: 1.3;
      }
      .body :is(code, kbd) {
        font-family: ui-monospace, monospace;
        font-size: 0.9em;
        background: color-mix(in srgb, var(--ngbr-color-text) 8%, transparent);
        padding: 1px 5px;
        border-radius: 4px;
      }
      .meta {
        display: block;
        margin-top: 28px;
      }
      dl {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 6px 12px;
        margin: 0;
      }
      dt {
        color: var(--ngbr-color-text-muted);
      }
      dd {
        margin: 0;
      }
      .related {
        margin: 0;
        padding-left: 18px;
      }
      .link {
        background: none;
        border: 0;
        padding: 2px 0;
        font: inherit;
        color: var(--ngbr-color-accent);
        text-decoration: underline;
        cursor: pointer;
      }
      .empty {
        color: var(--ngbr-color-text-muted);
      }
      @media (max-width: 720px) {
        .browse {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class Browse {
  protected readonly store = inject(KbStore);
  private readonly router = inject(Router);

  protected readonly selectedId = signal<string | null>('a1');
  protected readonly selectedArticle = computed(() => {
    const id = this.selectedId();
    return id ? this.store.byId(id) : undefined;
  });
  protected readonly treeValue = computed(() => {
    const id = this.selectedId();
    return id ? [id] : [];
  });

  protected readonly bodyHtml = computed(() => {
    const a = this.selectedArticle();
    if (!a) return '';
    // Angular auto-sanitizes the [innerHTML] binding.
    return a.format === 'markdown' ? (marked.parse(a.body) as string) : a.body;
  });

  protected readonly related = computed(() => {
    const a = this.selectedArticle();
    if (!a) return [];
    return this.store.articles().filter((x) => x.categoryId === a.categoryId && x.id !== a.id);
  });

  protected select(id: string): void {
    this.selectedId.set(id);
  }

  protected onTreeSelect(values: readonly string[]): void {
    const id = values.find((v) => !v.startsWith('cat:'));
    if (id) this.selectedId.set(id);
  }

  protected menu(value: string): void {
    void this.router.navigate([value === 'new' ? '/articles/new' : '/manage']);
  }
}
