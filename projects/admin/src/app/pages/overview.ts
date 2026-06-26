import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  NgbrPageHeader,
  NgbrWidgetGrid,
  NgbrStatCard,
  NgbrSparkline,
  NgbrCard,
  NgbrLineChart,
  NgbrBarChart,
  NgbrDonutChart,
} from '@ngbracket/dashboard';

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
        <ngbr-line-chart [series]="revenueSeries" [categories]="months" [area]="true" unit="k" />
      </ngbr-card>

      <ngbr-card heading="Sign-ups by quarter">
        <ngbr-bar-chart [series]="signupBars" [categories]="quarters" [stacked]="true" />
      </ngbr-card>

      <ngbr-card heading="Customers by plan">
        <ngbr-donut-chart [data]="planBreakdown">
          <div ngbrDonutCenter>
            <strong style="font-size: 1.3rem;">1,204</strong>
            <span style="font-size: 0.8rem; color: var(--ngbr-color-text-muted);">customers</span>
          </div>
        </ngbr-donut-chart>
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
