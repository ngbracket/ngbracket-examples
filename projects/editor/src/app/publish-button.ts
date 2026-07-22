import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  NgbrButton,
  NgbrMenu,
  NgbrMenuOption,
  NgbrMenuPanel,
  NgbrMenuDivider,
  NgbrSplitButton,
  NgbrSplitButtonPrimary,
} from '@ngbracket/buttons';

/**
 * The editor's "Publish ▾" split button (from @ngbracket/buttons). Kept in its
 * own component. The buttons-pack menu directives (`button[ngbrMenuOption]`,
 * `ngbr-menu-divider`) no longer collide with the navigation-pack selectors
 * (`button[ngbrMenuItem]`, `ngbr-menu-separator`) used by the parent editor.
 */
@Component({
  selector: 'app-publish-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbrButton,
    NgbrSplitButton,
    NgbrSplitButtonPrimary,
    NgbrMenu,
    NgbrMenuPanel,
    NgbrMenuOption,
    NgbrMenuDivider,
  ],
  template: `
    <ngbr-split-button ariaLabel="Publish options" (action)="publish.emit()">
      <button ngbrButton ngbrSplitButtonPrimary>Publish</button>
      <ng-template ngbrMenu>
        <ngbr-menu-panel ariaLabel="Publish options">
          <button ngbrMenuOption (select)="schedule.emit()">Schedule…</button>
          <button ngbrMenuOption (select)="saveDraft.emit()">Save draft</button>
          <ngbr-menu-divider />
          <button ngbrMenuOption danger (select)="discard.emit()">Discard</button>
        </ngbr-menu-panel>
      </ng-template>
    </ngbr-split-button>
  `,
})
export class PublishButton {
  readonly publish = output<void>();
  readonly schedule = output<void>();
  readonly saveDraft = output<void>();
  readonly discard = output<void>();
}
