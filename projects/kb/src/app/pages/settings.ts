import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgbrTabs, NgbrTabList, NgbrTab, NgbrTabPanel } from '@ngbracket/navigation';
import { NgbrAccordion, NgbrAccordionItem } from '@ngbracket/structure';
import { NgbrSwitch } from '@ngbracket/forms';

/** Settings: navigation Tabs, each panel a structure Accordion of preference groups. */
@Component({
  selector: 'kb-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgbrTabs, NgbrTabList, NgbrTab, NgbrTabPanel, NgbrAccordion, NgbrAccordionItem, NgbrSwitch],
  template: `
    <h1>Settings</h1>

    <ngbr-tabs>
      <ngbr-tab-list [(selectedTab)]="tab" aria-label="Settings sections">
        <button ngbrTab value="general">General</button>
        <button ngbrTab value="editor">Editor</button>
        <button ngbrTab value="a11y">Accessibility</button>
      </ngbr-tab-list>

      <ngbr-tab-panel value="general">
        <ngbr-accordion>
          <ngbr-accordion-item heading="Workspace" [headingLevel]="2" [expanded]="true">
            <ngbr-switch [(checked)]="publicKb">Make this knowledge base public</ngbr-switch>
            <ngbr-switch [(checked)]="showDrafts">Show drafts in browse</ngbr-switch>
          </ngbr-accordion-item>
          <ngbr-accordion-item heading="Notifications" [headingLevel]="2">
            <ngbr-switch [(checked)]="notify">Email me when an article changes</ngbr-switch>
          </ngbr-accordion-item>
        </ngbr-accordion>
      </ngbr-tab-panel>

      <ngbr-tab-panel value="editor">
        <ngbr-accordion>
          <ngbr-accordion-item heading="Defaults" [headingLevel]="2" [expanded]="true">
            <ngbr-switch [(checked)]="markdownDefault">Default new articles to markdown</ngbr-switch>
            <ngbr-switch [(checked)]="spellcheck">Spellcheck in the editor</ngbr-switch>
          </ngbr-accordion-item>
        </ngbr-accordion>
      </ngbr-tab-panel>

      <ngbr-tab-panel value="a11y">
        <ngbr-accordion>
          <ngbr-accordion-item heading="Motion & contrast" [headingLevel]="2" [expanded]="true">
            <ngbr-switch [(checked)]="reduceMotion">Reduce motion</ngbr-switch>
            <p class="note">
              Every control here meets WCAG AA in light and dark, with full keyboard support — the
              theme toggle is in the top bar.
            </p>
          </ngbr-accordion-item>
        </ngbr-accordion>
      </ngbr-tab-panel>
    </ngbr-tabs>
  `,
  styles: [
    `
      h1 {
        font-size: clamp(1.4rem, 3vw, 1.9rem);
      }
      ngbr-switch {
        display: block;
        margin: 8px 0;
      }
      .note {
        margin: 12px 0 0;
        color: var(--ngbr-color-text-muted);
        font-size: 0.9rem;
        max-width: 60ch;
      }
    `,
  ],
})
export class Settings {
  protected readonly tab = signal('general');

  protected readonly publicKb = signal(true);
  protected readonly showDrafts = signal(false);
  protected readonly notify = signal(true);
  protected readonly markdownDefault = signal(false);
  protected readonly spellcheck = signal(true);
  protected readonly reduceMotion = signal(false);
}
