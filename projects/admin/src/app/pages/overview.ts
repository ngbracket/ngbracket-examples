import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbrPageHeader,
  NgbrWidgetGrid,
  NgbrStatCard,
  NgbrSparkline,
  NgbrCard,
} from '@ngbracket/dashboard';
// Interactive, keyboard-navigable charts (arrow keys across data points +
// live-region announcements) — the dashboard pack's own charts are static.
import { NgbrLineChart, NgbrBarChart, NgbrDonutChart } from '@ngbracket/charts';
import { NgbrBeacon, NgbrChecklist, NgbrTour, type NgbrChecklistItem, type NgbrTourStep } from '@ngbracket/guide';

import { OnboardingState } from '../onboarding-state';

import {
  KPIS,
  REVENUE_MONTHS,
  REVENUE_SERIES,
  SIGNUP_QUARTERS,
  SIGNUP_BARS,
  PLAN_BREAKDOWN,
} from '../data/admin-data';

/** Dashboard overview: KPI stat cards + line/bar/donut charts. */
@Component({
  selector: 'admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbrPageHeader,
    NgbrWidgetGrid,
    NgbrStatCard,
    NgbrSparkline,
    NgbrCard,
    NgbrLineChart,
    NgbrBarChart,
    NgbrDonutChart,
    NgbrChecklist,
    NgbrBeacon,
  ],
  template: `
    <ngbr-page-header heading="Overview" subtitle="Your workspace at a glance — last 30 days">
      <div ngbrPageActions class="ph-actions">
        <button type="button" class="ph-btn ph-btn--quiet" (click)="startTour()">Take the tour</button>
        <button type="button" class="ph-btn">Export report</button>
      </div>
    </ngbr-page-header>

    @if (!onboarding.allDone()) {
      <ngbr-checklist
        class="getting-started"
        label="Get started"
        [headingLevel]="2"
        [items]="onboarding.items()"
        (itemActivate)="openTask($event)"
      />
    }

    <ngbr-widget-grid id="kpis" [minColWidth]="220">
      @for (kpi of kpis; track kpi.label) {
        <ngbr-stat-card [label]="kpi.label" [value]="kpi.value" [delta]="kpi.delta" [caption]="kpi.caption">
          <ngbr-sparkline ngbrStatSpark [data]="kpi.spark" kind="area" />
        </ngbr-stat-card>
      }
    </ngbr-widget-grid>

    <div class="charts">
      <ngbr-card id="revenue" heading="Revenue by month" [headingLevel]="2">
        <ngbr-beacon
          class="chart-beacon"
          label="What's new: read the chart with the keyboard"
          [pulsing]="!onboarding.tipSeen()"
          (activated)="showChartTip()"
        />
        <ngbr-line-chart
          ariaLabel="Revenue by month"
          summary="Monthly recurring revenue in £k, split into new, expansion and churned, January to June."
          [series]="revenueSeries"
          [categories]="months"
          [area]="true"
          unit="k"
        />
      </ngbr-card>

      <ngbr-card heading="Sign-ups by quarter" [headingLevel]="2">
        <ngbr-bar-chart
          ariaLabel="Sign-ups by quarter"
          summary="New sign-ups per quarter, stacked by self-serve and sales-led channels."
          [series]="signupBars"
          [categories]="quarters"
          mode="stacked"
        />
      </ngbr-card>

      <ngbr-card heading="Customers by plan" [headingLevel]="2">
        <ngbr-donut-chart
          ariaLabel="Customers by plan"
          summary="1,204 customers split across the Starter, Pro, Team and Enterprise plans."
          [data]="planBreakdown"
        />
      </ngbr-card>
    </div>
  `,
  styles: [
    `
      .ph-btn {
        padding: 8px 14px;
        font: inherit;
        color: var(--ngbr-color-accent-contrast, #fff);
        background: var(--ngbr-color-accent);
        border: 0;
        border-radius: var(--ngbr-radius);
        cursor: pointer;
      }
      .ph-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .ph-btn--quiet {
        color: var(--ngbr-color-accent);
        background: transparent;
        box-shadow: inset 0 0 0 1px var(--ngbr-color-border-control);
      }
      #revenue {
        position: relative;
      }
      .chart-beacon {
        position: absolute;
        top: 12px;
        right: 12px;
      }
      .getting-started {
        display: block;
        max-width: 40rem;
        margin-bottom: 20px;
      }
      .charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      .charts ngbr-card:first-child {
        grid-column: 1 / -1;
      }
    `,
  ],
})
export class Overview {
  private readonly tour = inject(NgbrTour);
  private readonly router = inject(Router);
  protected readonly onboarding = inject(OnboardingState);

  constructor() {
    // A tour step can lead off the page (the search step's target opens the
    // palette). End the tour with the page so the next one isn't left inert.
    inject(DestroyRef).onDestroy(() => {
      if (this.tour.active()) this.tour.skip();
    });
  }

  protected readonly kpis = KPIS;
  protected readonly months = REVENUE_MONTHS;
  protected readonly revenueSeries = REVENUE_SERIES;
  protected readonly quarters = SIGNUP_QUARTERS;
  protected readonly signupBars = SIGNUP_BARS;
  protected readonly planBreakdown = PLAN_BREAKDOWN;

  private readonly tourSteps: readonly NgbrTourStep[] = [
    {
      title: 'Welcome to your workspace',
      body: 'This short tour shows where to find the main numbers. Use Next to move on, and Skip or Escape to stop.',
    },
    {
      target: '#kpis',
      title: 'Key numbers',
      body: 'MRR, active customers, trials and churn, each compared with last month.',
    },
    {
      target: '#revenue',
      title: 'Revenue by month',
      body: 'Tab to the chart and use the arrow keys to go through it month by month.',
    },
    {
      target: '#command-palette-button',
      title: 'Search',
      body: 'After the tour, select this button or press Ctrl+K (Command+K on a Mac) to jump to any page or action.',
    },
  ];

  protected startTour(): void {
    this.tour.start(this.tourSteps, {
      onDone: (completed) => {
        if (completed) this.onboarding.complete('tour');
      },
    });
  }

  protected showChartTip(): void {
    this.onboarding.markTipSeen();
    this.tour.start([
      {
        target: '#revenue',
        title: 'New: read the chart with the keyboard',
        body: 'Tab to the chart, then use ← and → to move between months and ↑ and ↓ to change series. Each value is also sent to screen readers as you move.',
      },
    ]);
  }

  protected openTask(item: NgbrChecklistItem): void {
    switch (item.id) {
      case 'tour':
        this.startTour();
        break;
      case 'settings':
        this.onboarding.complete('settings');
        void this.router.navigate(['/settings']);
        break;
      case 'tickets':
        this.onboarding.complete('tickets');
        void this.router.navigate(['/tickets']);
        break;
    }
  }
}
