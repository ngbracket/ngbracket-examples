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
  /** Free-form tags, shown as chips in the editor. */
  readonly tags?: readonly string[];
}

/** The article form's working copy, autosaved as a draft while you edit. */
export interface ArticleDraft {
  title: string;
  slug: string;
  category: string | null;
  summary: string;
  body: string;
  tags: readonly string[];
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
    body: '<h2>Welcome</h2><p>Almanac is an accessible knowledge base built with the <strong>NgBracket</strong> navigation, structure and editor packs, which are built to support WCAG 2.2 AA.</p><p>Use the tree on the left to browse. Right-click a topic for actions.</p>',
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
    title: 'How accessibility works here',
    slug: 'accessible-by-default',
    categoryId: 'accessibility',
    summary: 'What the components do for keyboard and screen-reader users.',
    body: '<h2>How accessibility works here</h2><p>The components use roving tabindex, <code>aria-*</code> states and managed focus, with AA colour contrast in light and dark. They are built to support WCAG 2.2 AA, and this app is checked with axe.</p>',
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

  /** Autosaved drafts, keyed by article id ('new' for an unsaved article). In memory only. */
  private readonly _drafts = signal<Readonly<Record<string, ArticleDraft>>>({});

  draft(key: string): ArticleDraft | undefined {
    return this._drafts()[key];
  }

  saveDraft(key: string, draft: ArticleDraft): void {
    this._drafts.update((all) => ({ ...all, [key]: draft }));
  }

  clearDraft(key: string): void {
    this._drafts.update(({ [key]: _, ...rest }) => rest);
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
