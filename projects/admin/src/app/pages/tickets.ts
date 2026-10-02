import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgbrPageHeader } from '@ngbracket/dashboard';
import { NgbrBoard, NgbrCardDef } from '@ngbracket/board';
import type { NgbrCardMove, NgbrColumnMove } from '@ngbracket/board';

import { TICKET_COLUMNS, TICKETS, ticket, type Ticket } from '../data/admin-data';

/**
 * Support tickets as a work board (@ngbracket/board). Move a ticket with the
 * keyboard (focus a card, Space to grab, arrows, Space to drop, Escape to
 * cancel), with its ⋯ Move menu (or Shift+F10), or by dragging. Columns reorder
 * from their header handle; "Add a card" files a new ticket.
 */
@Component({
  selector: 'admin-tickets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrPageHeader, NgbrBoard, NgbrCardDef],
  template: `
    <ngbr-page-header
      heading="Tickets"
      subtitle="{{ tickets().length }} support tickets by status"
    />

    <p class="hint" id="tickets-hint">
      Focus a ticket and press Space to pick it up, the arrow keys to move it and Space to put
      it down (Escape cancels) — or use its Move menu
      (<span aria-hidden="true">⋯ </span>Shift+F10), or drag it. Enter opens a ticket. Reorder
      columns from their handle<span aria-hidden="true"> ⠿</span>.
    </p>

    @if (opened(); as t) {
      <p class="sel" role="status">
        Opened <strong>{{ t.id }}</strong>: {{ t.subject }} — {{ t.customer }}
      </p>
    }

    <ngbr-board
      label="Support tickets"
      aria-describedby="tickets-hint"
      [headingLevel]="2"
      allowAdd
      reorderableColumns
      [columns]="columns()"
      [cards]="tickets()"
      (cardActivate)="open($event.id)"
      (cardMove)="applyMove($event)"
      (cardAdd)="addTicket($event)"
      (columnMove)="moveColumn($event)"
    >
      <ng-template ngbrCardDef let-card>
        <span class="id">{{ card['id'] }}</span>
        <strong class="subject">{{ card['subject'] }}</strong>
        <span class="meta">
          <span class="priority" [attr.data-priority]="card['priority']">{{ card['priority'] }}</span>
          <span class="customer">{{ card['customer'] }}</span>
        </span>
      </ng-template>
    </ngbr-board>
  `,
  styles: [
    `
      .hint {
        max-width: 70ch;
        margin: 0 0 14px;
        color: var(--ngbr-color-text-muted);
      }
      .sel {
        margin: 0 0 14px;
        color: var(--ngbr-color-accent);
      }
      .id {
        display: block;
        font-size: 0.75rem;
        color: var(--ngbr-color-text-muted);
      }
      .subject {
        display: block;
        margin-block: 2px 8px;
        font-weight: 600;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: var(--ngbr-color-text-muted);
      }
      /* The text label carries the priority; the dot only reinforces it. */
      .priority {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 1px 8px;
        font-weight: 600;
        border-radius: 999px;
        color: var(--ngbr-color-text);
        background: color-mix(in srgb, var(--ngbr-color-text) 8%, transparent);
      }
      .priority::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--dot, var(--ngbr-color-text-muted));
      }
      .priority[data-priority='Urgent'] {
        --dot: #dc2626;
      }
      .priority[data-priority='High'] {
        --dot: #ea580c;
      }
      .priority[data-priority='Normal'] {
        --dot: #2563eb;
      }
    `,
  ],
})
export class Tickets {
  protected readonly columns = signal(TICKET_COLUMNS);
  protected readonly tickets = signal<Ticket[]>(TICKETS);
  /** The ticket last activated (Enter / click), shown as a status. */
  protected readonly opened = signal<Ticket | null>(null);
  private nextId = 1040 + TICKETS.length;

  protected open(id: string): void {
    this.opened.set(this.tickets().find((t) => t.id === id) ?? null);
  }

  /**
   * Apply a move synchronously, as the board asks: it puts focus on the card in
   * its new place right after this handler.
   */
  protected applyMove(move: NgbrCardMove): void {
    this.tickets.update((tickets) => {
      const moving = tickets.find((t) => t.id === move.id);
      if (!moving) return tickets;
      const rest = tickets.filter((t) => t.id !== move.id);
      const inTarget = rest.filter((t) => t.columnId === move.to);
      const before = inTarget[move.index];
      const at = before ? rest.indexOf(before) : rest.length;
      rest.splice(at, 0, { ...moving, columnId: move.to });
      return rest;
    });
  }

  protected addTicket(columnId: string): void {
    const id = `TCK-${this.nextId++}`;
    this.tickets.update((tickets) => [
      ...tickets,
      ticket(id, columnId, 'New ticket', 'Normal', 'Unassigned'),
    ]);
  }

  protected moveColumn(move: NgbrColumnMove): void {
    this.columns.update((cols) => {
      const next = [...cols];
      const [moved] = next.splice(move.from, 1);
      next.splice(move.to, 0, moved);
      return next;
    });
  }
}
