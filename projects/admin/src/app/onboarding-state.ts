import { Injectable, computed, signal } from '@angular/core';
import type { NgbrChecklistItem } from '@ngbracket/guide';

export type OnboardingTask = 'tour' | 'settings' | 'tickets';

/** In-memory "getting started" progress for the overview page (resets on reload). */
@Injectable({ providedIn: 'root' })
export class OnboardingState {
  private readonly done = signal<ReadonlySet<OnboardingTask>>(new Set());
  private readonly tipSeenState = signal(false);

  /** Whether the chart tip has been opened (the beacon stops pulsing). */
  readonly tipSeen = this.tipSeenState.asReadonly();
  /** Every getting-started task is done (the checklist is then hidden). */
  readonly allDone = computed(() => this.items().every((item) => item.done));

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
        description: 'Workspace name, billing email, plan and email updates.',
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

  markTipSeen(): void {
    this.tipSeenState.set(true);
  }

  complete(task: OnboardingTask): void {
    this.done.update((tasks) => new Set([...tasks, task]));
  }
}
