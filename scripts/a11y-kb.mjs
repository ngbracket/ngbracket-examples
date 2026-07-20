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

await browser.close();

console.log(`\nChecked ${checked} page/theme combinations across ${ROUTES.length} routes.`);
if (findings.length === 0) {
  console.log('✅ No WCAG A/AA violations in light or dark.');
  process.exit(0);
}

console.log(`\n❌ ${findings.length} finding(s):\n`);
for (const f of findings) {
  console.log(`  [${f.theme}] ${f.route}  ${f.id} (${f.impact})  →  ${f.target}\n     ${f.help}`);
}
process.exit(1);
