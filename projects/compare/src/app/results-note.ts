import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SCAN_AFTER, SCAN_BEFORE } from './results/evidence';

/** A short summary of the test results under each version, linking to the full page. */
@Component({
  selector: 'app-results-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <aside class="note" aria-labelledby="results-note-title">
      <h2 id="results-note-title">Test results for this page</h2>
      @if (version() === 'before') {
        <p>
          The automated scan found {{ before.findings }} problems across {{ before.rules.length }} rules. NVDA reached
          the sort headers and the Edit item only in browse mode. It said nothing when the dialog opened, when the
          error appeared or when the order was saved, and focus was lost when the dialog closed.
        </p>
      } @else {
        <p>
          The automated scan found {{ afterFound }}. NVDA read the
          sort order, the menu, the dialog name and the error, and focus went back to the row's menu button after
          saving. NVDA did not read the "saved" message.
        </p>
      }
      <p><a routerLink="/results">See the scan, screenshots and NVDA transcripts</a></p>
    </aside>
  `,
  styles: [
    `
      .note {
        max-width: 72ch;
        margin-top: 28px;
        padding: 14px 18px;
        line-height: 1.6;
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-inline-start: 4px solid var(--ngbr-color-accent, #0e7490);
        border-radius: 8px;
      }
      h2 {
        margin: 0 0 6px;
        font-size: 1.1rem;
      }
      p {
        margin: 0 0 8px;
      }
      p:last-child {
        margin: 0;
      }
      a {
        color: var(--ngbr-color-accent, #0e7490);
        font-weight: 600;
      }
    `,
  ],
})
export class ResultsNote {
  readonly version = input.required<'before' | 'after'>();
  protected readonly before = SCAN_BEFORE;
  protected readonly afterFound = SCAN_AFTER.findings === 0 ? 'nothing' : `${SCAN_AFTER.findings} problems`;
}
