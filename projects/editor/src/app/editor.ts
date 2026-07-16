import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import {
  NgbrAppMenubar,
  NgbrContextMenu,
  NgbrFormatToolbar,
  NgbrMenu,
  NgbrMenuItem,
  NgbrMenuSeparator,
  type NgbrFormatCommand,
  type NgbrTopMenu,
} from '@ngbracket/navigation';
import { ThemeToggle } from 'shared';

/** execCommand names for each formatting command / menu action. */
const COMMANDS: Record<string, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  bullet: 'insertUnorderedList',
  number: 'insertOrderedList',
  'align-left': 'justifyLeft',
  'align-center': 'justifyCenter',
  'align-right': 'justifyRight',
  undo: 'undo',
  redo: 'redo',
  cut: 'cut',
  copy: 'copy',
  paste: 'paste',
  selectAll: 'selectAll',
};

/**
 * A tiny document editor showcasing @ngbracket/navigation: an application
 * menubar, a formatting toolbar, and a right-click context menu, all driving a
 * contenteditable canvas.
 */
@Component({
  selector: 'app-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbrAppMenubar,
    NgbrFormatToolbar,
    NgbrContextMenu,
    NgbrMenu,
    NgbrMenuItem,
    NgbrMenuSeparator,
    ThemeToggle,
  ],
  template: `
    <header class="chrome">
      <div class="brand"><span class="brand__mark" aria-hidden="true">◇</span> NgBracket Editor</div>
      <app-theme-toggle />
    </header>

    <ngbr-app-menubar [menus]="menus" aria-label="Editor" (action)="onAction($event)" />

    <div class="toolbar">
      <ngbr-format-toolbar [(value)]="active" (command)="run($event)" />
    </div>

    <main class="canvas">
      <div
        #doc
        class="doc"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        aria-label="Document"
        [ngbrContextMenu]="ctx"
      >
        <h1>Welcome to the NgBracket Editor</h1>
        <p>
          Select some text and use the toolbar — or the <strong>Format</strong> menu — to style it.
          <em>Right-click</em> anywhere for a context menu, and try the keyboard: arrow keys move
          through menus, Escape closes them.
        </p>
        <p>Everything here is driven by <strong>&#64;ngbracket/navigation</strong>.</p>
      </div>
    </main>

    <ng-template #ctx>
      <ngbr-menu contextual (itemSelected)="context($event)">
        <button ngbrMenuItem value="cut">Cut</button>
        <button ngbrMenuItem value="copy">Copy</button>
        <button ngbrMenuItem value="paste">Paste</button>
        <ngbr-menu-separator />
        <button ngbrMenuItem value="selectAll">Select all</button>
      </ngbr-menu>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
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
      .toolbar {
        padding: 10px 16px;
        background: var(--ngbr-color-surface, #fff);
        border-bottom: 1px solid var(--ngbr-color-border, #c4c7c9);
      }
      .canvas {
        flex: 1;
        display: flex;
        justify-content: center;
        padding: 32px 16px 64px;
      }
      .doc {
        width: 100%;
        max-width: 720px;
        min-height: 60vh;
        padding: 48px 56px;
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-radius: 12px;
        box-shadow: 0 10px 30px -18px rgba(15, 23, 42, 0.4);
        line-height: 1.7;
      }
      .doc:focus-visible {
        outline: 2px solid var(--ngbr-color-accent, #0e7490);
        outline-offset: 2px;
      }
      .doc h1 {
        margin-top: 0;
      }
    `,
  ],
})
export class Editor {
  private readonly doc = viewChild.required<ElementRef<HTMLElement>>('doc');

  protected readonly active = signal<readonly NgbrFormatCommand[]>([]);

  protected readonly menus: NgbrTopMenu[] = [
    {
      label: 'File',
      items: [
        { label: 'New', value: 'new', shortcut: '⌘N' },
        { label: 'Open…', value: 'open', shortcut: '⌘O' },
        { label: 'Save', value: 'save', shortcut: '⌘S' },
        { separator: true },
        {
          label: 'Recent',
          items: [
            { label: 'report.docx', value: 'recent:report' },
            { label: 'notes.md', value: 'recent:notes' },
          ],
        },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', value: 'undo', shortcut: '⌘Z' },
        { label: 'Redo', value: 'redo', shortcut: '⇧⌘Z' },
        { separator: true },
        { label: 'Cut', value: 'cut' },
        { label: 'Copy', value: 'copy' },
        { label: 'Paste', value: 'paste' },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Bold', value: 'bold' },
        { label: 'Italic', value: 'italic' },
        { label: 'Underline', value: 'underline' },
        { separator: true },
        { label: 'Align left', value: 'align-left' },
        { label: 'Align centre', value: 'align-center' },
        { label: 'Align right', value: 'align-right' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom in', value: 'zoom-in' },
        { label: 'Zoom out', value: 'zoom-out' },
        { separator: true },
        { label: 'Word wrap', value: 'word-wrap', role: 'menuitemcheckbox', checked: true },
      ],
    },
    { label: 'Help', items: [{ label: 'About NgBracket Editor', value: 'about' }] },
  ];

  /** A toolbar command. */
  protected run(cmd: NgbrFormatCommand): void {
    this.exec(cmd);
  }

  /** A menubar action — route the ones that map to editor commands. */
  protected onAction(value: string): void {
    if (value in COMMANDS) {
      this.exec(value);
    }
    // Other menu actions (new/open/save/zoom/about) are demo no-ops.
  }

  /** A context-menu selection. */
  protected context(value: unknown): void {
    this.exec(String(value));
  }

  private exec(command: string): void {
    const native = COMMANDS[command];
    if (!native) {
      return;
    }
    this.doc().nativeElement.focus();
    // Classic contenteditable formatting — fine for a demo surface.
    document.execCommand(native);
  }
}
