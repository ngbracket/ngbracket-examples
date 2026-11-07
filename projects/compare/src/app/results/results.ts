import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  AXE_VERSION,
  NVDA_AFTER,
  NVDA_BEFORE,
  SCAN_AFTER,
  SCAN_BEFORE,
  SCAN_DATE,
  STEP_OUTCOMES,
  type NvdaStep,
} from './evidence';

interface StepPair {
  number: number;
  name: string;
  sides: { label: 'Before' | 'After'; run: NvdaStep & { outcome: string } }[];
}

const NO_OUTCOME = 'No summary written for this step yet. The transcript is below.';
const MISSING_STEP: NvdaStep = { name: '', keys: 'none', spoken: '(this step is not in the Before run)', focus: '' };

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** The scan and NVDA results for both versions, side by side. */
@Component({
  selector: 'app-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  protected readonly scanBefore = SCAN_BEFORE;
  protected readonly scanAfter = SCAN_AFTER;
  protected readonly axeVersion = AXE_VERSION;
  protected readonly scanDate = longDate(SCAN_DATE);
  protected readonly nvdaDate = longDate(NVDA_AFTER.date);
  protected readonly nvdaBrowser = NVDA_AFTER.browser;
  protected readonly guidepup = NVDA_AFTER.guidepup;

  protected readonly unnamedBefore = SCAN_BEFORE.tabStops.filter((s) => !s.name).length;
  protected readonly unnamedAfter = SCAN_AFTER.tabStops.filter((s) => !s.name).length;

  /** Steps are paired by name, so a refreshed run with a changed step can't borrow another step's text. */
  protected readonly steps: StepPair[] = NVDA_AFTER.steps.map((after, i) => {
    const before = NVDA_BEFORE.steps.find((s) => s.name === after.name) ?? MISSING_STEP;
    const outcome = STEP_OUTCOMES[after.name] ?? { before: NO_OUTCOME, after: NO_OUTCOME };
    return {
      number: i + 1,
      name: after.name,
      sides: [
        { label: 'Before', run: { ...before, outcome: outcome.before } },
        { label: 'After', run: { ...after, outcome: outcome.after } },
      ],
    };
  });
}
