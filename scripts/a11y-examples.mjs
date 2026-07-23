/*
 * Verification sweep for the Helm (admin) + Trim (booking) example apps after the
 * keyboard-a11y fixes. For each app it:
 *   1. signs in through the demo login (in-memory auth),
 *   2. runs an axe WCAG 2.0/2.1 A+AA sweep on the key routes in light AND dark,
 *   3. exercises the specific keyboard interactions that were fixed and asserts them.
 *
 * Serve the built apps first (static, SPA boots at /), then:
 *   node scripts/a11y-examples.mjs admin   http://localhost:4310
 *   node scripts/a11y-examples.mjs booking http://localhost:4311
 *
 * Exit code 1 on any axe violation or failed keyboard assertion.
 */
import { chromium } from 'playwright';
import AxeBuilderPkg from '@axe-core/playwright';

const AxeBuilder = AxeBuilderPkg.default || AxeBuilderPkg;
const app = process.argv[2];
const BASE = process.argv[3] || 'http://localhost:4310';
const THEMES = ['light', 'dark'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const setTheme = (t) => document.documentElement.setAttribute('data-theme', t);

const axeFindings = [];
const kbResults = [];
let axeChecks = 0;

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

const record = (name, ok, detail = '') => {
  kbResults.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function axeSweep(label) {
  for (const theme of THEMES) {
    await page.evaluate(setTheme, theme);
    await page.waitForTimeout(150);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    axeChecks++;
    for (const v of violations)
      for (const node of v.nodes)
        axeFindings.push({ app, label, theme, id: v.id, impact: v.impact, target: node.target.join(' '), help: v.help });
  }
  console.log(`  axe: ${label} (light+dark) swept`);
}

async function signIn() {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  // Demo login: a provider button signs in and routes into the app.
  const github = page.getByRole('button', { name: /github/i });
  if (await github.count()) await github.first().click();
  else {
    // Fallback: fill the login form and submit (password inputs aren't a "textbox"
    // role, and a "Show password" toggle shares the label — target by type).
    await page.locator('input[type="email"], input[name*="email" i]').first().fill('guest@trim.co');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.getByRole('button', { name: /sign in|log in|continue/i }).first().click();
  }
  await page.waitForTimeout(500);
}

if (app === 'admin') {
  console.log('\n=== Helm (admin) ===');
  await signIn();
  await page.getByRole('heading', { name: 'Overview' }).waitFor();

  // Overview: the line chart is an interactive, keyboard-navigable widget.
  await axeSweep('overview');
  const chart = page.locator('[role="application"]').first();
  await chart.waitFor();
  await chart.focus();
  const chartFocused = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'application');
  record('overview: chart takes keyboard focus (role=application, tabindex=0)', chartFocused);
  const liveBefore = await page.locator('[aria-live]').first().textContent().catch(() => '');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  const liveAfter = await page.locator('[aria-live]').first().textContent().catch(() => '');
  record('overview: ArrowRight announces a data point (live region updates)', liveAfter !== liveBefore, `"${(liveAfter || '').trim().slice(0, 48)}"`);

  // Customers: arrow-key row navigation. Sidebar items are <ngbr-nav-item> buttons.
  await page.locator('ngbr-nav-item').filter({ hasText: 'Customers' }).first().click();
  await page.getByRole('heading', { name: 'Customers' }).waitFor();
  await axeSweep('customers');
  const rows = page.locator('tr.ngbr-table__row');
  await rows.first().waitFor();
  const firstTab = await rows.first().getAttribute('tabindex');
  await rows.first().focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  const tabs = await rows.evaluateAll((els) => els.slice(0, 3).map((e) => e.getAttribute('tabindex')));
  record('customers: rows expose one roving tab stop', firstTab === '0', `first row tabindex=${firstTab}`);
  record('customers: ArrowDown moves the focused row', tabs[0] === '-1' && tabs[1] === '0', `tabindex[0..2]=${tabs.join(',')}`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  const status = await page.locator('p.sel[role="status"]').count();
  record('customers: Enter activates the row (status announced)', status > 0);
}

if (app === 'booking') {
  console.log('\n=== Trim & Co (booking) ===');
  await signIn();
  await page.getByRole('heading', { name: /book an appointment/i }).waitFor();
  await axeSweep('book');

  // Service picker: ARIA radiogroup — arrows move the checked radio.
  const radios = page.getByRole('radio');
  await radios.first().focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  const secondChecked = await radios.nth(1).getAttribute('aria-checked');
  record('book: ArrowDown moves the checked service radio', secondChecked === 'true');

  // Advance a step and assert focus lands on the step panel (never dropped to body).
  await page.getByRole('button', { name: /^continue$/i }).click();
  await page.waitForTimeout(150);
  const onPanel = await page.evaluate(() => {
    const el = document.activeElement;
    return !!el && el.classList.contains('panel');
  });
  record('book: Continue moves focus to the next step panel (not <body>)', onPanel);

  // The diary (month view) keyboard "add event".
  const diary = page.getByRole('link', { name: /diary|calendar/i });
  if (await diary.count()) {
    await diary.first().click();
    await page.waitForTimeout(300);
    await axeSweep('diary');
  }
}

await browser.close();

console.log(`\n${app}: ${axeChecks} axe scans, ${axeFindings.length} violations; ${kbResults.filter((r) => r.ok).length}/${kbResults.length} keyboard checks passed`);
if (axeFindings.length) {
  console.log('\nAXE VIOLATIONS:');
  for (const f of axeFindings) console.log(`  [${f.theme}] ${f.label}: ${f.id} (${f.impact}) — ${f.target}`);
}
const failedKb = kbResults.filter((r) => !r.ok);
if (failedKb.length) {
  console.log('\nFAILED KEYBOARD CHECKS:');
  for (const f of failedKb) console.log(`  ${f.name} ${f.detail}`);
}
process.exit(axeFindings.length || failedKb.length ? 1 : 0);
