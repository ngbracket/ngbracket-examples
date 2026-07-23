import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  ],
  template: `
    <ngbr-page-header heading="Overview" subtitle="Your workspace at a glance — last 30 days">
      <button ngbrPageActions type="button" class="ph-btn">Export report</button>
    </ngbr-page-header>

    <ngbr-widget-grid [minColWidth]="220">
      @for (kpi of kpis; track kpi.label) {
        <ngbr-stat-card [label]="kpi.label" [value]="kpi.value" [delta]="kpi.delta" [caption]="kpi.caption">
          <ngbr-sparkline ngbrStatSpark [data]="kpi.spark" kind="area" />
        </ngbr-stat-card>
      }
    </ngbr-widget-grid>

    <div class="charts">
      <ngbr-card heading="Revenue by month">
        <ngbr-line-chart
          ariaLabel="Revenue by month"
          summary="Monthly recurring revenue in £k, split into new, expansion and churned, January to June."
          [series]="revenueSeries"
          [categories]="months"
          [area]="true"
          unit="k"
        />
      </ngbr-card>

      <ngbr-card heading="Sign-ups by quarter">
        <ngbr-bar-chart
          ariaLabel="Sign-ups by quarter"
          summary="New sign-ups per quarter, stacked by self-serve and sales-led channels."
          [series]="signupBars"
          [categories]="quarters"
          mode="stacked"
        />
      </ngbr-card>

      <ngbr-card heading="Customers by plan">
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
  protected readonly kpis = KPIS;
  protected readonly months = REVENUE_MONTHS;
  protected readonly revenueSeries = REVENUE_SERIES;
  protected readonly quarters = SIGNUP_QUARTERS;
  protected readonly signupBars = SIGNUP_BARS;
  protected readonly planBreakdown = PLAN_BREAKDOWN;
}
