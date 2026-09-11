import { ChangeDetectionStrategy, Component } from '@angular/core';

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
    `,
  ],
})
export class A11yDemo {}
