import { Injectable, computed, signal } from '@angular/core';
import type { NgbrChecklistItem } from '@ngbracket/guide';

export type OnboardingTask = 'tour' | 'settings' | 'tickets';

/** In-memory "getting started" progress for the overview page (resets on reload). */
@Injectable({ providedIn: 'root' })
export class OnboardingState {
  private readonly done = signal<ReadonlySet<OnboardingTask>>(new Set());

  readonly items = computed<readonly NgbrChecklistItem[]>(() => {
    const done = this.done();
    return [
      {
        id: 'tour',
        label: 'Take the tour',
        description: 'A short walk through this page.',
        done: done.has('tour'),
      },
      {
        id: 'settings',
        label: 'Review workspace settings',
        description: 'Name, time zone and notifications.',
        done: done.has('settings'),
      },
      {
        id: 'tickets',
        label: 'Open the tickets board',
        description: 'Move a ticket with the keyboard or the Move menu.',
        done: done.has('tickets'),
      },
    ];
  });

  complete(task: OnboardingTask): void {
    this.done.update((tasks) => new Set([...tasks, task]));
  }
}
