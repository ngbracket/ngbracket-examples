import { Injectable, computed, signal } from '@angular/core';
import type { NgbrTreeNode } from '@ngbracket/structure';

export type ArticleFormat = 'rich' | 'markdown';
export type ArticleStatus = 'draft' | 'published';

export interface Category {
  readonly id: string;
  readonly label: string;
}

export interface Article {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly summary: string;
  /** HTML (rich) or markdown source, per `format`. */
  readonly body: string;
  readonly format: ArticleFormat;
  readonly status: ArticleStatus;
  /** ISO date (kept as a string so seed data is deterministic). */
  readonly updated: string;
}

const CATEGORIES: readonly Category[] = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'guides', label: 'Guides' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'reference', label: 'Reference' },
];

const SEED: readonly Article[] = [
  {
    id: 'a1',
    title: 'Welcome to Almanac',
    slug: 'welcome',
    categoryId: 'getting-started',
    summary: 'What this knowledge base is and how to get around it.',
    body: '<h2>Welcome</h2><p>Almanac is an accessible knowledge base built with <strong>NgBracket</strong> — navigation, structure and editor packs, all WCAG AA.</p><p>Use the tree on the left to browse. Right-click a topic for actions.</p>',
    format: 'rich',
    status: 'published',
    updated: '2026-07-18',
  },
  {
    id: 'a2',
    title: 'Keyboard shortcuts',
    slug: 'keyboard-shortcuts',
    categoryId: 'getting-started',
    summary: 'Every action here works without a mouse.',
    body: '<p>Arrow keys move within the tree, toolbar and tabs. <kbd>Enter</kbd> opens, <kbd>Esc</kbd> closes menus.</p>',
    format: 'rich',
    status: 'published',
    updated: '2026-07-17',
  },
  {
    id: 'a3',
    title: 'Writing your first article',
    slug: 'first-article',
    categoryId: 'guides',
    summary: 'Create, format and publish an article.',
    body: '# Writing your first article\n\nHit **New article**, fill the form, and pick a **category** from the tree-select.\n\n- Rich text or markdown\n- Live preview\n- Signal-Forms validation',
    format: 'markdown',
    status: 'published',
    updated: '2026-07-16',
  },
  {
    id: 'a4',
    title: 'Accessible by default',
    slug: 'accessible-by-default',
    categoryId: 'accessibility',
    summary: 'How every component here meets WCAG AA.',
    body: '<h2>Accessible by default</h2><p>Roving tabindex, <code>aria-*</code> states, focus management and AA contrast in both themes — nothing bolted on.</p>',
    format: 'rich',
    status: 'published',
    updated: '2026-07-15',
  },
  {
    id: 'a5',
    title: 'Component reference',
    slug: 'component-reference',
    categoryId: 'reference',
    summary: 'The packs this app is built from.',
    body: '<p>navigation · structure · editor — installed from the NgBracket registry.</p>',
    format: 'rich',
    status: 'draft',
    updated: '2026-07-14',
  },
];

/** In-memory, signal-backed store (no backend — mirrors the other example apps). */
@Injectable({ providedIn: 'root' })
export class KbStore {
  private readonly _articles = signal<readonly Article[]>(SEED);

  readonly articles = this._articles.asReadonly();
  readonly categories = CATEGORIES;

  /** Tree of categories → their articles, for the browse sidebar (NgbrTree). */
  readonly treeNodes = computed<readonly NgbrTreeNode<string>[]>(() =>
    this.categories.map((c) => ({
      value: `cat:${c.id}`,
      label: c.label,
      selectable: false,
      children: this._articles()
        .filter((a) => a.categoryId === c.id)
        .map((a) => ({ value: a.id, label: a.title })),
    })),
  );

  /** Flat category list as tree nodes, for the form's NgbrTreeSelect. */
  readonly categoryNodes = computed<readonly NgbrTreeNode<string>[]>(() =>
    this.categories.map((c) => ({ value: c.id, label: c.label })),
  );

  categoryLabel(id: string): string {
    return this.categories.find((c) => c.id === id)?.label ?? id;
  }

  byId(id: string): Article | undefined {
    return this._articles().find((a) => a.id === id);
  }

  /** Insert or update an article (by id). Returns the id. */
  upsert(article: Article): string {
    this._articles.update((list) => {
      const idx = list.findIndex((a) => a.id === article.id);
      if (idx === -1) return [...list, article];
      const next = [...list];
      next[idx] = article;
      return next;
    });
    return article.id;
  }

  remove(id: string): void {
    this._articles.update((list) => list.filter((a) => a.id !== id));
  }

  /** Deterministic next id (no Date/random — the workspace is zoneless + test-safe). */
  nextId(): string {
    const n = this._articles().reduce((max, a) => {
      const v = Number(a.id.replace(/^a/, ''));
      return Number.isFinite(v) && v > max ? v : max;
    }, 0);
    return `a${n + 1}`;
  }
}
