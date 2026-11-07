import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SCAN_AFTER, SCAN_BEFORE } from './results/evidence';

const SOURCE = 'https://github.com/ngbracket/ngbracket-examples/tree/main/projects/compare/src/app';

/** What the two versions are and how to compare them. */
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="intro">
      <h1>One orders screen, built twice</h1>
      <p class="result">
        The automated scan had {{ beforeFindings }} findings across {{ beforeRules }} rules on Before and
        {{ afterFindings }} on After. Automated checks cover only part of WCAG, so NVDA ran the task on both in CI. On
        Before, Tab skips the sort headers, and NVDA says nothing when the edit dialog opens or when the error appears.
        On After, NVDA reads both. <a routerLink="/results">See the test results</a>.
      </p>
      <p>
        Want the same scan on two or three pages of your own Angular app? Email
        <a href="mailto:duncan@ngbracket.com">duncan&#64;ngbracket.com</a> and we'll do it for free.
      </p>
      <p>
        Both versions of this screen show the same 24 orders, do the same jobs and work with a mouse. The difference is
        what happens with a keyboard or a screen reader.
      </p>
      <p>
        <a routerLink="/before">Before</a> is written the way many of us write a screen under a deadline. Sorting is a
        click handler on a span. The row menu is a list of divs. The edit dialog and the cancel question are styled
        divs, and the "saved" message appears and fades. Each shortcut has a comment in the source that says what it costs.
      </p>
      <p>
        <a routerLink="/after">After</a> is the same screen on NgBracket packs. &#64;ngbracket/data-table gives the
        search box, sorting, pages and row menu. &#64;ngbracket/forms gives the status filter and the edit form.
        &#64;ngbracket/overlays gives the dialog, the confirm and the messages.
      </p>

      <h2>Try it with a keyboard</h2>
      <ol>
        <li>Sort the orders by the Placed column.</li>
        <li>Open the actions menu for order #1035 and choose Edit.</li>
        <li>Delete the email address and choose Save.</li>
        <li>Type a valid email address and save again.</li>
        <li>When the dialog closes, check where your focus is.</li>
      </ol>
      <p>
        Do it on both versions. With a screen reader running, also listen for the sort order, the error and the
        "saved" message.
      </p>

      <h2>What an automated check finds</h2>
      <p>
        axe finds some of the problems in Before, such as the buttons with no name and the low-contrast text. It can't
        tell that a keyboard user can't choose the menu items, or that focus is lost when the dialog closes.
        &#64;ngbracket/a11y-devtools adds keyboard checks, and it found that Tab can't reach the sort headers. Automated
        checks cover roughly a third of WCAG, so a clean scan is where testing starts.
      </p>
      <p>
        <a routerLink="/results">The test results</a> show both scans and what NVDA said at each step of the task, for
        both versions.
      </p>

      <h2>What After saves</h2>
      <p>To work like After, Before still needs:</p>
      <ul>
        <li>sort headers that Tab can reach, with the sort order read out</li>
        <li>a row menu that works with the arrow keys and Enter</li>
        <li>focus held inside the dialog, and returned to the row's menu button when it closes</li>
        <li>the error linked to its field and read out</li>
        <li>a "saved" message in a status region</li>
      </ul>
      <p>
        After gets these from the packs. In the NVDA run, NVDA read the focus return and skipped the "saved" message
        (step 5 of the results). The names for the icon buttons and the status filter, and the text colours, are written
        in After's own template and styles.
      </p>

      <h2>Source</h2>
      <p>
        <a [href]="source + '/before'">The Before code</a> and <a [href]="source + '/after'">the After code</a> are on
        GitHub.
        The packs are at <a href="https://ngbracket.com/">ngbracket.com</a>, with a live demo for each one.
      </p>

      <h2>Use it on your own app</h2>
      <p>
        This screen uses the Data Table, Forms and Overlays packs. <a href="https://ngbracket.com/packs">See all the
        packs</a>.
      </p>
      <p>
        To run the same scan on your own app, use
        <a href="https://ngbracket.com/tools/a11y-devtools">&#64;ngbracket/a11y-devtools</a>. It is free and open
        source, and also runs in CI as a GitHub Action.
      </p>
      <p>
        Or send us two or three pages of your Angular app and we'll scan them for free:
        <a href="mailto:duncan@ngbracket.com">duncan&#64;ngbracket.com</a>.
      </p>
    </article>
  `,
  styles: [
    `
      .intro {
        max-width: 68ch;
        line-height: 1.6;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.8rem;
        line-height: 1.25;
      }
      h2 {
        margin: 28px 0 8px;
        font-size: 1.2rem;
      }
      a {
        color: var(--ngbr-color-accent, #0e7490);
        font-weight: 600;
      }
      ol,
      ul {
        padding-inline-start: 1.4em;
      }
      .result {
        padding: 12px 16px;
        font-weight: 600;
        background: var(--ngbr-color-surface, #fff);
        border: 1px solid var(--ngbr-color-border, #c4c7c9);
        border-inline-start: 4px solid var(--ngbr-color-accent, #0e7490);
        border-radius: 8px;
      }
    `,
  ],
})
export class Intro {
  protected readonly source = SOURCE;
  protected readonly beforeFindings = SCAN_BEFORE.findings;
  protected readonly beforeRules = SCAN_BEFORE.rules.length;
  protected readonly afterFindings = SCAN_AFTER.findings === 0 ? 'none' : SCAN_AFTER.findings;
}
