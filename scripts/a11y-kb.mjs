/*
 * Browser-based axe accessibility sweep for the `kb` example app
 * (WCAG 2.0/2.1 A + AA), across every route in BOTH light and dark themes.
 *
 * Serves nothing itself — start the app then point BASE at it:
 *   npm run start:kb &                     # http://localhost:4305
 *   npm run test:a11y:kb                    # (BASE defaults to :4305)
 *
 * Theme is driven by `data-theme` on <html> (shared ThemeService). The kb chrome
 * is opaque (no translucent/backdrop-filter surfaces), so colour-contrast runs
 * on the whole page with no exclusions. Exit code 1 on any violation.
 */
import { chromium } from 'playwright';
import AxeBuilderPkg from '@axe-core/playwright';

const AxeBuilder = AxeBuilderPkg.default || AxeBuilderPkg;
const BASE = process.env.BASE || 'http://localhost:4305';
const THEMES = ['light', 'dark'];
const ROUTES = ['/browse', '/articles/new', '/manage', '/settings'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const setTheme = (t) => document.documentElement.setAttribute('data-theme', t);

const browser = await chromium.launch();
const findings = [];
let checked = 0;

for (const route of ROUTES) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
    for (const theme of THEMES) {
      await page.evaluate(setTheme, theme);
      await page.waitForTimeout(200);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      checked++;
      for (const v of violations) {
        for (const node of v.nodes) {
          findings.push({
            theme,
            route,
            id: v.id,
            impact: v.impact,
            target: node.target.join(' '),
            help: v.help,
          });
        }
      }
    }
  } catch (e) {
    console.log(`  ! skip ${route}: ${String(e.message).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}

// Article form: tag chips (@ngbracket/primitives) and draft autosave (@ngbracket/form-kit).
const checks = [];
const record = (name, ok, detail = '') => {
  checks.push({ name, ok });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
};
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + '/articles/new', { waitUntil: 'networkidle', timeout: 20000 });
    const tagInput = page.getByRole('textbox', { name: 'Add a tag' });
    await tagInput.fill('Keyboard');
    await tagInput.press('Enter');
    await page.waitForTimeout(150);
    const chips = await page.locator('ngbr-input-chip').count();
    const submitted = await page.getByText('Saved ✓').count();
    record('article: Enter in "Add a tag" adds a chip and does not submit', chips === 1 && submitted === 0, `${chips} chip(s)`);
    for (const theme of THEMES) {
      await page.evaluate(setTheme, theme);
      await page.waitForTimeout(200);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      checked++;
      for (const v of violations)
        for (const node of v.nodes)
          findings.push({ theme, route: '/articles/new (with a tag)', id: v.id, impact: v.impact, target: node.target.join(' '), help: v.help });
    }
    await page.locator('ngbr-input-chip button').first().focus();
    await page.keyboard.press('Delete');
    await page.waitForTimeout(150);
    const backOnInput = await page.evaluate(() => document.activeElement?.closest('ngbr-form-field')?.textContent?.includes('Add a tag') ?? false);
    record('article: removing the last tag returns focus to "Add a tag"', backOnInput);
    // Wait for the tag edits' "Draft saved" to clear, so the next one is the title's.
    await page.waitForFunction(() => !document.querySelector('ngbr-autosave-status')?.textContent?.trim(), null, { timeout: 5000 }).catch(() => {});
    await page.locator('input#title').fill('Draft about tags');
    const statusIs = (text) =>
      page
        .waitForFunction((t) => document.querySelector('ngbr-autosave-status')?.textContent?.includes(t), text, { timeout: 5000 })
        .then(() => true, () => false);
    record('article: edits autosave a draft', await statusIs('Draft saved'));
    await page.getByRole('link', { name: 'Browse', exact: true }).click();
    await page.waitForTimeout(300);
    await page.getByRole('link', { name: 'New', exact: true }).click();
    await page.waitForTimeout(300);
    const title = await page.locator('input#title').inputValue();
    const note = await page.getByText('Your unsaved draft was restored.').count();
    record('article: the draft is restored on return', title === 'Draft about tags' && note === 1, title);

    // Discard draft goes back to the saved (empty) article.
    await page.getByRole('button', { name: 'Discard draft' }).click();
    await page.waitForTimeout(150);
    const afterDiscard = await page.locator('input#title').inputValue();
    const discardFocus = await page.evaluate(() => document.activeElement?.textContent?.includes('Draft discarded') ?? false);
    record('article: Discard draft restores the saved version and focuses the note', afterDiscard === '' && discardFocus, `"${afterDiscard}"`);

    // Save a new article: it moves to its edit URL, keeps the confirmation, and
    // a later visit shows no stale draft.
    await page.locator('input#title').fill('Saved article');
    await page.locator('ngbr-tree-select input').first().click();
    await page.getByRole('treeitem').first().click();
    await page.locator('.ngbr-rte__content').first().click();
    await page.keyboard.type('Body text');
    await page.getByRole('button', { name: 'Save article' }).click();
    await page.waitForURL(/\/articles\/a\d+\/edit$/, { timeout: 5000 }).catch(() => {});
    const url = page.url();
    const savedNote = await page.getByText('Saved ✓').count();
    await page.waitForTimeout(150);
    const onConfirmation = await page.evaluate(() => document.activeElement?.textContent?.includes('Saved') ?? false);
    record('article: saving a new article moves to its edit URL and focuses the confirmation', /\/articles\/a\d+\/edit$/.test(url) && savedNote === 1 && onConfirmation, url.replace(BASE, ''));

    // Existing article: edit and save at once. The autosave pending from typing
    // must not leave a draft behind (the page stays, so its timer would fire).
    await page.getByRole('link', { name: 'Browse', exact: true }).click();
    await page.locator('a.edit').first().click();
    await page.locator('input#title').waitFor();
    await page.locator('input#title').fill('Quick save title');
    await page.getByRole('button', { name: 'Save article' }).click();
    await page.waitForTimeout(1500);
    // Back to the same article through the UI (a reload would reset the in-memory store).
    await page.getByRole('link', { name: 'Browse', exact: true }).click();
    await page.locator('a.edit').first().click();
    await page.locator('input#title').waitFor();
    await page.waitForTimeout(300);
    const stale = await page.getByText('Your unsaved draft was restored.').count();
    record('article: a quick save leaves no draft behind', stale === 0);

    // A save that fails validation keeps the edits as a draft, even when the
    // user leaves straight away (before the autosave debounce).
    await page.locator('input#title').fill('');
    await page.getByRole('button', { name: 'Save article' }).click();
    await page.getByRole('link', { name: 'Browse', exact: true }).click();
    await page.locator('a.edit').first().click();
    await page.locator('input#title').waitFor();
    await page.waitForTimeout(300);
    const kept = await page.getByText('Your unsaved draft was restored.').count();
    record('article: a save that fails validation keeps the draft', kept === 1);
  } catch (e) {
    record('article: interaction checks ran', false, String(e.message).split('\n')[0]);
  } finally {
    await ctx.close();
  }
}

await browser.close();

console.log(`\nChecked ${checked} page/theme combinations across ${ROUTES.length} routes.`);
const checksFailed = checks.some((c) => !c.ok);
console.log(`Article form checks: ${checks.filter((c) => c.ok).length}/${checks.length} passed.`);
if (findings.length === 0) {
  console.log('✅ No WCAG A/AA violations in light or dark.');
} else {
  console.log(`\n❌ ${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.log(`  [${f.theme}] ${f.route}  ${f.id} (${f.impact})  →  ${f.target}\n     ${f.help}`);
  }
}
process.exit(findings.length > 0 || checksFailed ? 1 : 0);
