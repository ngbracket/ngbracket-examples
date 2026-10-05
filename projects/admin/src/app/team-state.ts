import { Injectable, signal, type WritableSignal } from '@angular/core';

/** A team row. The email is its own signal so typing never replaces the row object. */
export interface TeamMember {
  readonly id: number;
  readonly email: WritableSignal<string>;
}

/** The settings page's team list, kept in memory for the session (this demo has no backend). */
@Injectable({ providedIn: 'root' })
export class TeamState {
  readonly members = signal<readonly TeamMember[]>([
    { id: 1, email: signal('ada@helm.app') },
    { id: 2, email: signal('grace@helm.app') },
  ]);
  private nextId = 3;

  add(): void {
    this.members.update((list) => [...list, { id: this.nextId++, email: signal('') }]);
  }

  remove(index: number): void {
    this.members.update((list) => list.filter((_, i) => i !== index));
  }

  move(from: number, to: number): void {
    this.members.update((list) => {
      const next = [...list];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  }
}
