import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

/**
 * DEV-ONLY accessibility showcase, also the public devtools demo
 * (a11y-demo.ngbracket.com, a development build). One deliberate violation per axe impact
 * level, so `provideA11yDevtools({ overlay: true })` renders every severity
 * colour (critical = red, serious = orange, moderate = yellow, minor = blue)
 * and the console reporter groups them under this component.
 *
 * Registered only under `isDevMode()` in `app.routes.ts` — never shipped to
 * production. The violations here are intentional; do not "fix" them.
 */
@Component({
  selector: 'admin-a11y-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>&#64;ngbracket/a11y-devtools demo</h1>
    <p>
      This is a development build of the Helm admin example with
      <a href="https://ngbracket.com/tools/a11y-devtools">&#64;ngbracket/a11y-devtools</a>
      running, as it would while you build your own app. Every problem on this page
      is there on purpose.
    </p>
    <ul class="howto">
      <li>
        <strong>The boxes</strong> mark each issue, coloured by severity and labelled
        with the Angular component that rendered it.
      </li>
      <li>
        <strong>The a11y pill</strong> (bottom left) switches the devtools on and off,
        as does Alt+Shift+A. Its <strong>⋯</strong> menu chooses what's drawn,
        filters by severity and downloads an HTML report.
      </li>
      <li>
        <strong>Press Tab</strong> to walk the tab order; the panel in the bottom right
        shows each control's computed role, name and state.
      </li>
      <li>
        <strong>Open the browser console</strong> for the same issues grouped by
        component.
      </li>
    </ul>
    <p>
      <a href="/login" (click)="continueToApp($event)">Continue to the app</a> (sign in with any email and
      password) to see it on real pages. The report covers every page you visit.
    </p>

    <h2>One issue per severity</h2>

    <div class="demo">
      <!-- CRITICAL (red): image with no alt text → axe rule image-alt -->
      <figure>
        <img
          src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
          width="120"
          height="80"
        />
        <figcaption>critical · image-alt — image has no alt text</figcaption>
      </figure>

      <!-- SERIOUS (orange): low-contrast text → axe rule color-contrast -->
      <p class="low-contrast">
        serious · color-contrast — this text fails the minimum contrast ratio
      </p>

      <!-- MINOR (blue): empty heading → axe rule empty-heading -->
      <h2></h2>
      <p>minor · empty-heading — the empty &lt;h2&gt; above has no text</p>

      <!-- MODERATE (yellow): content outside any landmark → axe rule region -->
      <p>moderate · region — nothing here is wrapped in a main landmark</p>
    </div>

    <hr />

    <h2>Keyboard</h2>
    <p>
      <strong>Tab through the controls below.</strong> The overlay numbers each
      tab stop and draws the path between them; the panel in the bottom-right
      corner shows the focused control's computed role, accessible name and
      states (a <em>computed approximation</em>, not a screen reader). The
      broken controls also raise <code>ngbr/*</code> keyboard findings.
    </p>

    <div class="kbd">
      <!-- ngbr/unreachable-control: an ARIA role, but no tabindex → keyboard can't reach it -->
      <div role="button" class="fake-btn">
        role="button", no tabindex — the keyboard can't reach me
        (ngbr/unreachable-control)
      </div>

      <!-- ngbr/click-without-key: focusable + (click) but no keyboard handler -->
      <div tabindex="0" class="fake-btn" (click)="onFakeClick()">
        tabindex="0" + (click), no key handler — Enter/Space won't fire it
        (ngbr/click-without-key)
      </div>

      <!-- Positive tabindex hijacks the order → warning badge in the tab-order overlay -->
      <button type="button" tabindex="3">
        positive tabindex="3" — hijacks the tab order
      </button>

      <!-- Healthy controls: good targets for the accessibility-tree preview -->
      <button type="button" aria-expanded="false" aria-haspopup="menu">
        Menu — try me for expanded / has-popup states
      </button>
      <label class="chk">
        <input type="checkbox" checked /> Subscribe — a checkbox in the checked
        state
      </label>
    </div>

    <hr />

    <h2>A modal that doesn't keep focus in</h2>
    <p>
      <strong>Open the dialog, then Tab.</strong> It's marked
      <code>aria-modal="true"</code> but the page behind it isn't made
      <code>inert</code>, so focus walks straight out of it — raising
      <code>ngbr/modal-focus-not-contained</code>. Close it and the finding goes
      away.
    </p>

    <button type="button" (click)="dialogOpen.set(true)">Open broken dialog</button>

    @if (dialogOpen()) {
      <!-- ngbr/modal-focus-not-contained: aria-modal, but the background is still tabbable -->
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="broken-dialog-title"
        class="dialog"
      >
        <h3 id="broken-dialog-title">Broken modal dialog</h3>
        <p>aria-modal="true", no inert background — Tab escapes to the page.</p>
        <button type="button" (click)="dialogOpen.set(false)">Close</button>
      </div>
    }

    <hr />

    <h2>Issues inside a modal dialog</h2>
    <p>
      Modal dialogs, including Angular Material ones, open in the browser's top
      layer. The overlay and the pill stay on top of them, so issues inside a modal
      are marked too.
    </p>
    <button type="button" (click)="openModal()">Open modal dialog</button>
    <dialog #modal class="modal" aria-labelledby="modal-title">
      <h3 id="modal-title">Modal dialog</h3>
      <!-- CRITICAL: an image with no alt text, inside the modal -->
      <img
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        width="120"
        height="60"
      />
      <p>The image above has no alt text.</p>
      <button type="button" (click)="modal.close()">Close</button>
    </dialog>

    <hr />

    <h2>A keyboard trap (found by report mode)</h2>
    <p>
      <strong>Tab into these fields.</strong> Tab on the second one sends focus back
      to the first, so Tab alone never gets out (Shift+Tab does). This one needs real
      key presses, so it's found by report mode, not the overlay:
      <code>npx ngbr-a11y-report --base http://localhost:4200 --route /a11y-demo --focus-traps</code>
      raises <code>ngbr/focus-trap</code>.
    </p>

    <!-- ngbr/focus-trap: Tab on the last field is intercepted and sent back to the first -->
    <div class="trap">
      <input #trapFirst aria-label="Trapped field one" placeholder="Trapped field one" />
      <input
        aria-label="Trapped field two"
        placeholder="Trapped field two"
        (keydown.tab)="$event.preventDefault(); trapFirst.focus()"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 640px;
        margin: 40px auto;
        padding: 0 24px;
        font: 15px/1.6 system-ui, sans-serif;
      }
      h1 {
        font-size: 22px;
      }
      .demo > * {
        margin: 28px 0;
      }
      figcaption,
      p {
        font-size: 14px;
      }
      img {
        display: block;
        background: #eee;
        border-radius: 6px;
      }
      /* Deliberately low contrast (~1.7:1) to trip color-contrast. */
      .low-contrast {
        color: #bcbcbc;
        background: #fff;
      }
      hr {
        margin: 40px 0;
        border: 0;
        border-top: 1px solid #ddd;
      }
      .kbd {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .fake-btn {
        padding: 8px 14px;
        border: 1px solid #c9a227;
        border-radius: 6px;
        background: #fffdf3;
        cursor: pointer;
      }
      .chk {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .dialog {
        margin-top: 16px;
        padding: 16px 20px;
        border: 2px solid #444;
        border-radius: 8px;
        background: #fff;
        color: #1a1a1a;
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.15);
      }
      /* Inherit the theme's text colour (works light and dark); the underline marks the link. */
      a {
        color: inherit;
        text-decoration: underline;
      }
      .howto {
        padding-left: 20px;
        font-size: 14px;
      }
      .howto li {
        margin: 6px 0;
      }
      .modal {
        padding: 16px 20px;
        border: 2px solid #444;
        border-radius: 8px;
        background: #fff;
        color: #1a1a1a;
      }
      .modal img {
        margin: 8px 0;
      }
      .trap {
        display: flex;
        gap: 12px;
        padding: 12px;
        border: 2px dashed #c9a227;
        border-radius: 8px;
      }
    `,
  ],
})
export class A11yDemo {
  /** Toggles the deliberately uncontained modal in the focus-trap section. */
  readonly dialogOpen = signal(false);

  private readonly router = inject(Router);

  /**
   * In-app navigation, so the devtools' report keeps the pages visited so far.
   * Router rather than RouterLink: the directive would add ~5 KB to the
   * production main bundle for a page that only exists in dev builds.
   */
  continueToApp(event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return; // new tab etc.
    event.preventDefault();
    void this.router.navigateByUrl('/login');
  }

  private readonly modal = viewChild.required<ElementRef<HTMLDialogElement>>('modal');

  /** Opens the native modal dialog (top layer) to show the overlay drawing over it. */
  openModal(): void {
    this.modal().nativeElement.showModal();
  }

  /** Empty on purpose: the point is a (click) with no keyboard handler. */
  onFakeClick(): void {}
}
