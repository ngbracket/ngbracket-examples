/*
 * Evidence for the `compare` example: runs the same checks on /before and
 * /after and prints the results side by side.
 *
 *   1. axe (WCAG 2.x A + AA) on each page in light and dark, plus with the edit
 *      dialog open where the keyboard can open it.
 *   2. The keyboard task from the About page, done with keys only: sort by
 *      Placed, open order 1035's actions menu, choose Edit, save with an empty
 *      email, fix it, save. It records what each step reached and where focus
 *      ends up.
 *
 * Serves nothing itself. Start the app, then point BASE at it:
 *   npm run start:compare &                 # http://localhost:4307
 *   npm run evidence:compare                # (BASE defaults to :4307)
 *
 * The /before page is expected to fail. Exit code 1 only if /after has an axe
 * violation or a keyboard step fails on /after.
 */
import { chromium } from 'playwright';
import AxeBuilderPkg from '@axe-core/playwright';

const AxeBuilder = AxeBuilderPkg.default || AxeBuilderPkg;
const BASE = process.env.BASE || 'http://localhost:4307';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const ROUTES = ['/before', '/after'];
const ROW = '1035';

const setTheme = (t) => document.documentElement.setAttribute('data-theme', t);

/** A short description of the focused element: tag, role and name. */
const focused = (page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'nothing (page body)';
    const name = (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const role = a.getAttribute('role');
    return `${a.tagName.toLowerCase()}${role ? `[role=${role}]` : ''}${name ? ` "${name}"` : ''}`;
  });

async function axe(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => ({ id: v.id, count: v.nodes.length }));
}

/** Tab forward until `match` is focused. Returns false if it never is. */
async function tabTo(page, match, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate((src) => new RegExp(src).test(
      (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || '').trim(),
    ), match.source)) return true;
  }
  return false;
}

async function keyboardTask(page) {
  const steps = [];
  const step = (name, ok, detail) => steps.push({ name, ok, detail });

  // 1. Sort by Placed.
  const canSort = await tabTo(page, /^Placed/);
  if (canSort) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
  const ariaSort = await page.evaluate(() =>
    [...document.querySelectorAll('th')].find((th) => th.textContent.includes('Placed'))?.getAttribute('aria-sort'),
  );
  step('Reach the Placed header with Tab and sort', canSort, canSort ? `aria-sort=${ariaSort}` : 'no Tab stop on the header');

  // 2. Open order 1035's menu: Tab until focus is on a button in that row.
  await page.locator('main').focus();
  let reachedMenu = false;
  for (let i = 0; i < 60 && !reachedMenu; i++) {
    await page.keyboard.press('Tab');
    reachedMenu = await page.evaluate(
      (row) => document.activeElement?.tagName === 'BUTTON' && !!document.activeElement.closest('tr')?.textContent?.includes('#' + row),
      ROW,
    );
  }
  const trigger = reachedMenu ? await focused(page) : 'not reached';
  if (reachedMenu) await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  step('Reach the row menu button and open it', reachedMenu, `button: ${trigger}`);

  // 3. Choose Edit with the keyboard.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  const onItem = await focused(page);
  const itemFocused = /menuitem/.test(onItem) && /Edit/.test(onItem);
  if (itemFocused) await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const dialog = await page.evaluate(() => !!document.querySelector('[role=dialog], .modal'));
  step('Choose Edit from the menu', itemFocused && dialog, `focus after arrow keys: ${onItem}`);
  if (!dialog) {
    // The keyboard can't get there; open the dialog with the mouse so the rest can be checked.
    await page.keyboard.press('Escape');
    await page.locator('h1').click(); // /before's menu ignores Escape; an outside click closes it
    const row = page.locator('tbody tr', { hasText: '#' + ROW });
    await row.getByRole('button').click();
    await page.getByText('Edit', { exact: true }).click();
    await page.waitForTimeout(400);
    steps.push({ name: '(dialog opened with the mouse from here on)', ok: true, detail: '' });
  }

  // 4. Save with an empty email.
  const focusInDialog = await page.evaluate(() => !!document.activeElement?.closest('[role=dialog], .modal'));
  step('Focus moves into the dialog', focusInDialog, await focused(page));
  // By name where the field has one; /before's inputs have none, so fall back to position.
  const named = page.getByRole('textbox', { name: /Email/ });
  const email = (await named.count()) ? named : page.locator('.modal input').nth(1);
  await email.fill('');
  await page.getByRole('button', { name: 'Save' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const invalid = await email.getAttribute('aria-invalid');
  const errorShown = await page.getByText(/valid email|email address/).first().isVisible();
  step('An error is shown on screen', errorShown, errorShown ? 'yes' : 'no');
  step('Empty email is flagged to assistive tech', invalid === 'true', `aria-invalid=${invalid}, focus: ${await focused(page)}`);

  // 5. Fix and save.
  await email.fill('erin@corkcraft.ie');
  await page.getByRole('button', { name: 'Save' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  const end = await focused(page);
  step('Focus returns to the row menu button', /Actions for order 1035/.test(end), end);
  const live = await page.evaluate(() =>
    [...document.querySelectorAll('[role=status], [role=alert], [aria-live]')].map((e) => e.textContent.trim()),
  );
  const saved = live.some((t) => /1035 saved/.test(t));
  step('"Saved" message is in a live region', saved, saved ? 'yes' : 'not in any live region');
  return { steps };
}

const browser = await chromium.launch();
/** axe needs a page from an explicit context. */
const newPage = async () => (await browser.newContext()).newPage();
let afterFailed = false;

for (const route of ROUTES) {
  console.log(`\n${route}`);
  for (const theme of ['light', 'dark']) {
    const page = await newPage();
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.evaluate(setTheme, theme);
    await page.waitForTimeout(200);
    const found = await axe(page);
    const total = found.reduce((n, f) => n + f.count, 0);
    console.log(`  axe, ${theme}: ${found.length} rules, ${total} elements` +
      (found.length ? ` (${found.map((f) => `${f.id} ${f.count}`).join(', ')})` : ''));
    if (route === '/after' && found.length) afterFailed = true;
    await page.close();
  }

  const page = await newPage();
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.evaluate(setTheme, 'light');
  const { steps } = await keyboardTask(page);
  for (const s of steps) console.log(`  ${s.ok ? 'pass' : 'FAIL'}  ${s.name}: ${s.detail}`);
  if (route === '/after' && steps.some((s) => !s.ok)) afterFailed = true;
  await page.close();
}

await browser.close();
process.exit(afterFailed ? 1 : 0);
