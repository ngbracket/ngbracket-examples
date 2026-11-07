import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const SOURCE = 'https://github.com/ngbracket/ngbracket-examples/tree/main/projects/compare/src/app';

/** What the two versions are and how to compare them. */
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="intro">
      <h1>One orders screen, built twice</h1>
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
        tell that the sort headers are out of reach of the Tab key, that the menu items can't be chosen, or that focus is
        lost when the dialog closes. Automated checks cover roughly a third of WCAG, so a clean scan is where testing
        starts.
      </p>

      <h2>Source</h2>
      <p>
        <a [href]="source + '/before'">The Before code</a> and <a [href]="source + '/after'">the After code</a> are on
        GitHub.
        The packs are at <a href="https://ngbracket.com/">ngbracket.com</a>, with a live demo for each one.
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
      ol {
        padding-inline-start: 1.4em;
      }
    `,
  ],
})
export class Intro {
  protected readonly source = SOURCE;
}
