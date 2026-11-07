/*
 * The test output behind the Results page. The files in public/evidence are
 * the raw reports, copied in unchanged, so the page and the downloads always
 * agree. To refresh them after a new run:
 *
 *   scan.*         ngbr-a11y-report --route /before --route /after --keyboard
 *                  --focus-traps --walkthrough --dark-attribute data-theme=dark
 *                  --format all --out public/evidence/scan (dev build)
 *   nvda-*.{json,md}  the sr-compare artifact of ngbr-components' sr.yml
 *                  (target=compare), compare-before/after renamed
 *   *-scan.png     dev build, 1280x900, a11y-devtools overlay on
 *
 * Then check the hand-written outcomes in STEP_OUTCOMES still match. They are
 * keyed by step name; a step with no outcome shows as such on the page.
 */
import nvdaAfterJson from '../../../public/evidence/nvda-after.json';
import nvdaBeforeJson from '../../../public/evidence/nvda-before.json';
import scanJson from '../../../public/evidence/scan.json';

export interface NvdaStep {
  name: string;
  keys: string;
  spoken: string;
  focus: string;
  note?: string;
}

export interface NvdaRun {
  route: string;
  date: string;
  browser: string;
  guidepup: string;
  steps: NvdaStep[];
}

interface ScanFinding {
  id: string;
  impact: string;
  help: string;
}

interface ScanPage {
  label: string;
  colorScheme: string;
  nodeInstances: number;
  findings: ScanFinding[];
  walkthrough?: { steps: { role: string; name: string; component: string }[] };
}

interface ScanReport {
  generatedAt: string;
  checks: { axeVersion: string };
  pages: ScanPage[];
}

export interface RuleCount {
  id: string;
  impact: string;
  help: string;
  count: number;
}

export interface TabStop {
  role: string;
  name: string;
}

export interface ScanSummary {
  findings: number;
  rules: RuleCount[];
  /** Tab stops inside the orders screen, page chrome left out. */
  tabStops: TabStop[];
}

export const NVDA_BEFORE = nvdaBeforeJson as NvdaRun;
export const NVDA_AFTER = nvdaAfterJson as NvdaRun;

const scan = scanJson as ScanReport;

export const SCAN_DATE = scan.generatedAt.slice(0, 10);
export const AXE_VERSION = scan.checks.axeVersion;

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];

/** Light and dark pages of one route, findings counted by rule. */
function summarise(route: string): ScanSummary {
  const pages = scan.pages.filter((p) => p.label === route);
  const byRule = new Map<string, RuleCount>();
  for (const f of pages.flatMap((p) => p.findings)) {
    const rule = byRule.get(f.id) ?? { id: f.id, impact: f.impact, help: f.help, count: 0 };
    byRule.set(f.id, { ...rule, count: rule.count + 1 });
  }
  const rules = [...byRule.values()].sort(
    (a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact) || b.count - a.count,
  );
  const light = pages.find((p) => p.colorScheme === 'light');
  const tabStops = (light?.walkthrough?.steps ?? [])
    .filter((s) => !['App', 'SkipLink', 'ThemeToggle', 'ResultsNote'].includes(s.component))
    .map((s) => ({ role: s.role, name: s.name }));
  return { findings: rules.reduce((n, r) => n + r.count, 0), rules, tabStops };
}

export const SCAN_BEFORE = summarise('/before');
export const SCAN_AFTER = summarise('/after');

/** What each NVDA step shows, in one sentence per version, keyed by step name. */
export const STEP_OUTCOMES: Record<string, { before: string; after: string }> = {
  'Sort by Placed': {
    before:
      'Tab skips the column headers. NVDA reached "Placed" only in browse mode, read it as "clickable" and said nothing about the sort order.',
    after: 'Tab reaches the "Placed" header. After Enter, NVDA said "sorted ascending".',
  },
  'Open the menu for order 1035': {
    before: 'The row menu buttons have no name, so NVDA read each one as "button". Enter opened the menu and NVDA said nothing.',
    after: 'NVDA read "Actions for order 1035, menu button". Enter opened the menu and NVDA read "Edit, 1 of 3".',
  },
  'Choose Edit': {
    before:
      'Focus stayed on the menu button. NVDA reached "Edit" only in browse mode. The dialog opened and NVDA said nothing.',
    after: 'NVDA read the dialog name, "Edit order number 1035", and then the first field.',
  },
  'Save with an empty email': {
    before: 'Red text under the field says "Enter a valid email address". Focus stayed on Save and NVDA said nothing.',
    after: 'Focus moved to the error summary and NVDA read "Enter an email address".',
  },
  'Fix the email and save': {
    before: 'The dialog closed, focus was lost to the page body and NVDA said nothing.',
    after:
      'Focus went back to "Actions for order 1035" and NVDA read it. NVDA did not read the "Order #1035 saved" message: it read the focus move instead.',
  },
};
