import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgbrGrid } from '@ngbracket/structure';
import type { NgbrGridColumn, NgbrGridRow } from '@ngbracket/structure';
import { NgbrToolbar, NgbrToolbarButton, NgbrToolbarSeparator } from '@ngbracket/navigation';

import { KbStore } from '../data/kb-store';

/** Manage: navigation toolbar + editable structure grid over all articles. */
@Component({
  selector: 'kb-manage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrGrid, NgbrToolbar, NgbrToolbarButton, NgbrToolbarSeparator],
  template: `
    <div class="head">
      <h1>Manage articles</h1>
      <ngbr-toolbar aria-label="Article actions">
        <button ngbrToolbarButton value="new" (click)="newArticle()">＋ New</button>
        <ngbr-toolbar-separator />
        <button ngbrToolbarButton value="export" (click)="exportCsv()">⬇ Export CSV</button>
      </ngbr-toolbar>
    </div>

    <p class="hint">Double-click a Title or Status cell to edit inline.</p>

    <ngbr-grid
      [columns]="columns"
      [data]="rows()"
      (dataChange)="onData($event)"
      aria-label="All articles"
    />
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      h1 {
        font-size: clamp(1.4rem, 3vw, 1.9rem);
        margin: 0;
      }
      .hint {
        color: var(--ngbr-color-text-muted);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class Manage {
  protected readonly store = inject(KbStore);
  private readonly router = inject(Router);

  protected readonly columns: readonly NgbrGridColumn[] = [
    { key: 'title', header: 'Title', editable: true },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status', editable: true },
    { key: 'updated', header: 'Updated', align: 'end' },
  ];

  protected readonly rows = computed<readonly NgbrGridRow[]>(() =>
    this.store.articles().map((a) => ({
      id: a.id,
      title: a.title,
      category: this.store.categoryLabel(a.categoryId),
      status: a.status,
      updated: a.updated,
    })),
  );

  protected onData(next: readonly NgbrGridRow[]): void {
    // Commit inline edits (title / status) back to the store, matched by id.
    for (const row of next) {
      const a = this.store.byId(String(row['id']));
      if (!a) continue;
      const title = String(row['title'] ?? a.title);
      const status = row['status'] === 'published' ? 'published' : 'draft';
      if (title !== a.title || status !== a.status) {
        this.store.upsert({ ...a, title, status });
      }
    }
  }

  protected newArticle(): void {
    void this.router.navigate(['/articles/new']);
  }

  protected exportCsv(): void {
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const header = this.columns.map((c) => c.header).join(',');
    const lines = this.rows().map((r) =>
      this.columns.map((c) => esc(String(r[c.key] ?? ''))).join(','),
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'articles.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
