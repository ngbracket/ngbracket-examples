import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/**
 * DEV-ONLY accessibility showcase: one deliberate violation per axe impact
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
    <h1>a11y-devtools — severity showcase</h1>
    <p>
      Each block trips a different axe rule so the overlay shows every severity
      colour. Open the console for the grouped, component-attributed report.
    </p>

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

    <h2>Keyboard layer — M1 + M2</h2>
    <p>
      <strong>Tab through the controls below.</strong> The overlay numbers each
      tab stop and draws the path between them; the panel in the bottom-right
      corner shows the focused control's computed role, accessible name and
      states (a <em>computed approximation</em>, not a screen reader). The
      broken controls also raise <code>ngbr/*</code> findings in the console.
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

    <h2>Focus trap — M3</h2>
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
    `,
  ],
})
export class A11yDemo {
  /** Toggles the deliberately uncontained modal in the focus-trap section. */
  readonly dialogOpen = signal(false);

  /** Empty on purpose: the point is a (click) with no keyboard handler. */
  onFakeClick(): void {}
}
