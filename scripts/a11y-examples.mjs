/*
 * Verification sweep for the Helm (admin) + Trim (booking) example apps after the
 * keyboard-a11y fixes. For each app it:
 *   1. signs in through the demo login (in-memory auth),
 *   2. runs an axe WCAG 2.0/2.1 A+AA sweep on the key routes in light AND dark,
 *   3. exercises the specific keyboard interactions that were fixed and asserts them.
 *
 * Serve the built apps first (static, SPA boots at /), then:
 *   node scripts/a11y-examples.mjs admin   http://localhost:4310   (overview, customers, tickets)
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
  const liveBefore = await page.locator('.ngbr-chart-sr[aria-live]').first().textContent().catch(() => '');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  const liveAfter = await page.locator('.ngbr-chart-sr[aria-live]').first().textContent().catch(() => '');
  record('overview: ArrowRight announces a data point (live region updates)', liveAfter !== liveBefore, `"${(liveAfter || '').trim().slice(0, 48)}"`);

  // Onboarding (@ngbracket/guide): tour from the page header, checklist, beacon.
  const tourBtn = page.getByRole('button', { name: 'Take the tour', exact: true });
  await tourBtn.focus();
  await page.keyboard.press('Enter');
  const step = page.getByRole('dialog');
  await step.waitFor();
  await page.waitForTimeout(200);
  const stepInfo = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const desc = (d?.getAttribute('aria-describedby') || '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .join(' ');
    return { name: d?.getAttribute('aria-labelledby') ? document.getElementById(d.getAttribute('aria-labelledby'))?.textContent?.trim() : '', desc, inside: !!d?.contains(document.activeElement) };
  });
  record('overview: Take the tour opens a step dialog with focus inside', stepInfo.inside, stepInfo.name);
  record('overview: the step says where you are', /Step 1 of 4/.test(stepInfo.desc), stepInfo.desc.slice(0, 48));
  await axeSweep('overview (tour open)');
  await page.keyboard.press('Escape');
  await step.waitFor({ state: 'detached' });
  await page.waitForTimeout(150);
  const backOnTrigger = await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Take the tour');
  record('overview: Escape ends the tour and focus returns to the trigger', backOnTrigger);
  const afterSkip = (await page.locator('.ngbr-checklist__progress').textContent())?.trim() ?? '';
  record('overview: skipping the tour leaves its checklist item open', /^0 of 3/.test(afterSkip), afterSkip);

  // Finish the tour: the checklist's first task is marked done.
  await tourBtn.click();
  await step.waitFor();
  const spotlit = [];
  for (let i = 0; i < 4; i++) {
    // Steps 2 to 4 point at #kpis, #revenue and the search button: the spotlight
    // shows only when the target was found (a missing target centres the step).
    if (i > 0) spotlit.push(await page.evaluate(() => document.querySelector('.ngbr-tour__spotlight')?.style.display === 'block'));
    await page.getByRole('dialog').getByRole('button', { name: /^(Next|Done)$/ }).click();
    await page.waitForTimeout(150);
  }
  record('overview: tour steps 2 to 4 find their targets', spotlit.length === 3 && spotlit.every(Boolean), spotlit.join(','));
  await step.waitFor({ state: 'detached' });
  const progress = (await page.locator('.ngbr-checklist__progress').textContent())?.trim() ?? '';
  record('overview: finishing the tour completes its checklist item', /^1 of 3/.test(progress), progress);

  // The beacon is a labelled button that opens a one-step tip.
  const beacon = page.getByRole('button', { name: /What's new: read the chart/ });
  await beacon.click();
  await step.waitFor();
  const tipTitle = (await page.getByRole('dialog').getByRole('heading').first().textContent())?.trim() ?? '';
  record('overview: the beacon opens its tip', /read the chart/.test(tipTitle), tipTitle);
  await page.keyboard.press('Escape');
  await step.waitFor({ state: 'detached' });

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

  // Tickets: the @ngbracket/board work board (keyboard move, Move menu, WIP).
  await page.locator('ngbr-nav-item').filter({ hasText: 'Tickets' }).first().click();
  await page.getByRole('heading', { name: 'Tickets', level: 1 }).waitFor();
  await axeSweep('tickets');
  const key = async (...keys) => {
    for (const k of keys) {
      await page.keyboard.press(k);
      await page.waitForTimeout(150);
    }
  };
  const focused = () =>
    page.evaluate(() => ({
      id: document.activeElement?.getAttribute('data-card-id'),
      name: document.activeElement?.getAttribute('aria-label') ?? '',
    }));
  const columnOf = (id) =>
    page.evaluate(
      (cardId) => document.querySelector(`[data-card-id="${cardId}"]`)?.closest('.ngbr-board__column')
        ?.querySelector('.ngbr-board__col-title')?.textContent,
      id,
    );
  await page.locator('[data-card-id="TCK-1040"]').focus();
  await key('Space', 'ArrowRight', 'Space');
  record('tickets: Space / → / Space moves a card to the next column', (await columnOf('TCK-1040')) === 'In progress');
  let f = await focused();
  record('tickets: focus stays on the moved card', f.id === 'TCK-1040', f.name);
  await key('Shift+F10');
  const items = await page.getByRole('menuitem').allTextContents();
  record('tickets: Shift+F10 opens the Move menu', items.some((t) => t.includes('Move to Resolved')), items.map((t) => t.trim()).join(' | '));
  await page.getByRole('menuitem', { name: 'Move to Resolved' }).focus();
  await key('Enter');
  f = await focused();
  record('tickets: a menu move focuses the card, named for the move', f.id === 'TCK-1040' && f.name.includes('moved to Resolved'), f.name);
  await key('Enter');
  const opened = (await page.locator('p.sel[role="status"]').textContent())?.trim() ?? '';
  record('tickets: Enter opens the ticket (status)', opened.startsWith('Opened TCK-1040'), opened);
  // In progress is 2/3: one add fits, the next is refused at the WIP limit.
  const addToInProgress = page.getByRole('button', { name: 'Add a card to In progress' });
  await addToInProgress.click();
  await page.waitForTimeout(150); // the new card renders and moves the button down
  await addToInProgress.click();
  await page.waitForTimeout(150);
  const wip = (await page.locator('p.sel[role="status"]').textContent())?.trim() ?? '';
  const inProgress = await page.evaluate(() => {
    const col = Array.from(document.querySelectorAll('.ngbr-board__column')).find(
      (c) => c.querySelector('.ngbr-board__col-title')?.textContent === 'In progress',
    );
    return col?.querySelectorAll('[data-card-id]').length;
  });
  record('tickets: Add a card respects the WIP limit', inProgress === 3 && wip.includes('at its limit'), `${inProgress} cards; "${wip}"`);

  // Settings: the team field array (@ngbracket/form-kit) with autosave.
  await page.locator('ngbr-nav-item').filter({ hasText: 'Settings' }).first().click();
  await page.getByRole('heading', { name: 'Settings', level: 1 }).waitFor();
  await axeSweep('settings');
  await page.getByRole('button', { name: 'Add a team member' }).click();
  await page.waitForTimeout(200);
  const newRow = await page.evaluate(() => {
    const el = document.activeElement;
    const rows = document.querySelectorAll('.ngbr-field-array__row, [data-ngbr-array-row]');
    return { tag: el?.tagName, inLast: !!rows.length && rows[rows.length - 1].contains(el), rows: rows.length };
  });
  record('settings: Add moves focus into the new team row', newRow.tag === 'INPUT' && newRow.inLast, `${newRow.rows} rows`);
  await page.keyboard.type('lin@helm.app');
  const autosaved = await page
    .waitForFunction(() => document.querySelector('ngbr-autosave-status')?.textContent?.includes('Saved'), null, { timeout: 5000 })
    .then(() => true, () => false);
  record('settings: team changes autosave', autosaved);
  const removeFirst = page.getByRole('button', { name: /^Remove/ }).first();
  await removeFirst.click();
  await page.waitForTimeout(200);
  const afterRemove = await page.evaluate(() => !!document.activeElement?.closest('ngbr-field-array'));
  record('settings: Remove keeps focus in the team list', afterRemove);
  // The list lives in a root store: it survives leaving the page.
  await page.locator('ngbr-nav-item').filter({ hasText: 'Overview' }).first().click();
  await page.getByRole('heading', { name: 'Overview', level: 1 }).waitFor();
  await page.locator('ngbr-nav-item').filter({ hasText: 'Settings' }).first().click();
  await page.getByRole('heading', { name: 'Settings', level: 1 }).waitFor();
  const kept = await page.evaluate(() => [...document.querySelectorAll('ngbr-field-array input')].some((i) => i.value === 'lin@helm.app'));
  record('settings: the team list is kept after leaving the page', kept);
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

  // Details step: "I'm bringing a guest" reveals a required guest field (@ngbracket/form-kit).
  await page.locator('section.panel [role="gridcell"]:not([aria-disabled="true"])').nth(20).click();
  await page.getByRole('button', { name: /^continue$/i }).click();
  await page.waitForTimeout(150);
  await page.locator('.ngbr-slots [role="radio"]:not([aria-disabled="true"]):not([disabled])').first().click();
  await page.getByRole('button', { name: /^continue$/i }).click();
  await page.getByRole('heading', { name: 'Your details' }).waitFor();
  await axeSweep('book details');
  await page.getByText("I'm bringing a guest").click();
  await page.waitForTimeout(250);
  const onGuest = await page.evaluate(() => document.activeElement?.id === 'bk-guest');
  record('book: ticking the guest box moves focus to the guest name', onGuest);
  await axeSweep('book details (guest shown)');
  await page.getByRole('button', { name: 'Confirm booking', exact: true }).click();
  await page.waitForTimeout(150);
  const guestInvalid = await page.locator('#bk-guest').getAttribute('aria-invalid');
  record('book: the guest name is required while it is shown', guestInvalid === 'true');

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
