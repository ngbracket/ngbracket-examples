import { Component, computed, input } from '@angular/core';

import { REPORTS } from '../data';

@Component({
  selector: 'app-report',
  template: `
    <h1 class="page-title">{{ label() }} report</h1>
    <p>This report is a placeholder. The sample only needs the menu that links to it.</p>
  `,
})
export class Report {
  readonly slug = input.required<string>();
  protected readonly label = computed(
    () => REPORTS.find((report) => report.slug === this.slug())?.label ?? 'Unknown',
  );
}
