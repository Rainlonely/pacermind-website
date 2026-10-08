/* Run against a local server; uses synthetic data and blocks every external request. */
const {
  chromium
} = require(process.env.PACERMIND_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PACERMIND_PREVIEW_URL || 'http://127.0.0.1:4173/';
const screenshots = process.env.PACERMIND_SCREENSHOTS;
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/synthetic-draft-v1.json')));
const key = 'pacermind-plan-draft-v1';
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PACERMIND_CHROMIUM,
    headless: true,
    args: ['--no-sandbox']
  });
  let checks = 0;
  const errors = [];
  const requests = [];
  async function context(opts = {}) {
    const ctx = await browser.newContext({
      viewport: {
        width: 1440,
        height: 1000
      },
      reducedMotion: 'reduce',
      ...opts
    });
    await ctx.route('**/*', route => {
      const u = route.request().url();
      requests.push(u);
      return u.startsWith(base) ? route.continue() : route.abort();
    });
    ctx.on('page', p => p.on('pageerror', err => errors.push(err.message)));
    return ctx;
  }
  async function open(ctx, name = 'planner.html') {
    const p = await ctx.newPage();
    await p.goto(base + name);
    await p.waitForTimeout(180);
    return p;
  }
  const ctx = await context();
  const page = await open(ctx);
  await page.locator('[data-action="preview"]').click();
  assert.equal(await page.locator('.issue-list [data-action="issue"]').filter({
    hasText: 'pending:'
  }).count(), 7);
  assert.equal(await page.locator('#json-output').count(), 0);
  checks++;
  await page.locator('[name="title"]').fill('Synthetic UI plan');
  await page.locator('[name="goal"]').fill('Values chosen only for synthetic browser testing.');
  await page.locator('[name="startDate"]').fill('2026-10-05');
  await page.locator('[name="startDate"]').press('Tab');
  await page.locator('#change-dialog [data-action="confirm"]').click();
  await page.locator('.day-card[data-slot="0"] [data-action="add-workout"]').click();
  await page.locator('#editor-dialog [name="workout.title"]').fill('Synthetic distance run');
  await page.locator('#editor-dialog [name="workout.blocks.0.segments.0.value"]').fill('5');
  await page.locator('#editor-dialog [name="workout.blocks.0.segments.0.paceMin"]').fill('5:30');
  await page.locator('#editor-dialog [name="workout.blocks.0.segments.0.paceMax"]').fill('6:00');
  await page.locator('#editor-dialog [data-action="save-day"]').click();
  while (await page.locator('[data-action="rest"]').count()) await page.locator('[data-action="rest"]').first().click();
  await page.locator('[data-action="preview"]').click();
  let app = JSON.parse(await page.locator('#json-output').inputValue());
  assert.equal(app.days.length, 7);
  assert.equal(app.days[0].workout.blocks[0].segments[0].target.pace.min, 5.5);
  assert.equal(app.days[1].rest, true);
  checks++;
  await page.getByRole('button', {
    name: '中文',
    exact: true
  }).click();
  assert.equal(await page.locator('[name="title"]').inputValue(), 'Synthetic UI plan');
  await page.reload();
  assert.equal(await page.locator('[name="title"]').inputValue(), 'Synthetic UI plan');
  assert.equal(await page.locator('.day-card[data-slot="0"] h3').innerText(), 'Synthetic distance run');
  checks++;
  await page.getByRole('button', {
    name: 'EN',
    exact: true
  }).click();
  await page.locator('.day-card[data-slot="0"] [data-action="transfer"]').click();
  await page.locator('#destination').selectOption('1');
  await page.locator('#change-dialog [data-action="confirm"]').click();
  assert.ok((await page.locator('#editor-status').innerText()).includes('Destination already'));
  assert.equal(await page.locator('.day-card[data-slot="1"] h3').innerText(), 'Rest · confirmed');
  checks++;
  await page.locator('.day-card[data-slot="1"] [data-action="clear-day"]').click();
  await page.locator('#change-dialog [data-action="confirm"]').click();
  await page.locator('.day-card[data-slot="0"] [data-action="transfer"]').click();
  await page.locator('#destination').selectOption('1');
  await page.locator('#change-dialog [data-action="confirm"]').click();
  assert.equal(await page.locator('.day-card[data-slot="1"] h3').innerText(), 'Synthetic distance run');
  await page.locator('[data-action="undo"]').click();
  assert.equal(await page.locator('.day-card[data-slot="1"] .pending').count(), 1);
  checks++;
  await page.locator('.day-card[data-slot="0"]').dragTo(page.locator('.day-card[data-slot="1"]'));
  await page.locator('#change-dialog [data-action="confirm"]').click();
  assert.equal(await page.locator('.day-card[data-slot="0"] .pending').count(), 1);
  assert.equal(await page.locator('.day-card[data-slot="1"] h3').innerText(), 'Synthetic distance run');
  await page.locator('[data-action="undo"]').click();
  checks++;
  await page.locator('[name="startDate"]').fill('2026-10-12');
  await page.locator('[name="startDate"]').press('Tab');
  assert.ok((await page.locator('#change-dialog').innerText()).includes('2026-10-05 → 2026-10-12'));
  await page.locator('#change-dialog [data-action="cancel-confirm"]').click();
  assert.equal(await page.locator('[name="startDate"]').inputValue(), '2026-10-05');
  checks++;
  await page.locator('#restore-file').setInputFiles({
    name: 'draft.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture))
  });
  await page.locator('#change-dialog [data-action="confirm"]').click();
  assert.equal(await page.locator('[name="mode"]').inputValue(), 'long');
  assert.equal(await page.locator('.phase-card').count(), fixture.stages.length);
  await page.locator('[data-action="preview"]').click();
  app = JSON.parse(await page.locator('#json-output').inputValue());
  assert.equal(app.coachProgram.weeks.length, 4);
  assert.equal(app.days.length, 7);
  checks++;
  await page.locator('#restore-file').setInputFiles({
    name: 'wrong.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{bad')
  });
  assert.equal(await page.locator('[name="title"]').inputValue(), fixture.title);
  assert.ok((await page.locator('#editor-status').innerText()).includes('Backup is invalid'));
  checks++;
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    value: undefined,
    configurable: true
  }));
  await page.locator('[data-action="copy-json"]').click();
  assert.ok((await page.locator('#editor-status').innerText()).includes('copy it manually'));
  assert.equal(await page.locator('#json-output').evaluate(el => el.selectionEnd - el.selectionStart), await page.locator('#json-output').inputValue().then(x => x.length));
  checks++;
  await page.locator('[name="stages.0.focus"]').fill('Changed synthetic direction');
  await page.locator('[name="stages.0.focus"]').press('Tab');
  assert.equal(await page.locator('#json-output').count(), 0);
  await page.locator('[data-action="preview"]').click();
  app = JSON.parse(await page.locator('#json-output').inputValue());
  assert.equal(app.coachProgram.revision, 2);
  checks++;
  const second = await open(ctx);
  await page.locator('[name="title"]').fill('Synthetic tab A');
  await second.locator('.warning').filter({
    hasText: 'Another tab'
  }).waitFor();
  await second.locator('[data-action="load-other"]').click();
  await second.locator('#change-dialog [data-action="confirm"]').click();
  assert.equal(await second.locator('[name="title"]').inputValue(), 'Synthetic tab A');
  checks++;
  // Mobile, dark theme, zoom and navigation have no horizontal document overflow.
  await second.close();
  if (await page.locator('[data-action="keep-this"]').count()) {
    await page.locator('[data-action="keep-this"]').click();
    await page.locator('#change-dialog [data-action="confirm"]').click();
  }
  await page.locator('[name="title"]').fill(fixture.title);
  await page.locator('[name="title"]').press('Tab');
  await page.getByRole('button', {
    name: '中文',
    exact: true
  }).click();
  if (screenshots) {
    fs.mkdirSync(screenshots, {
      recursive: true
    });
    await page.screenshot({
      path: path.join(screenshots, 'planner-desktop-zh.png'),
      fullPage: true
    });
  }
  await page.setViewportSize({
    width: 375,
    height: 812
  });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  if (screenshots) await page.screenshot({
    path: path.join(screenshots, 'planner-mobile-zh.png'),
    fullPage: true
  });
  await page.locator('[data-nav-toggle]').click();
  assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-nav-toggle]').getAttribute('aria-expanded'), 'false');
  checks++;
  await page.emulateMedia({
    colorScheme: 'dark'
  });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  if (screenshots) await page.screenshot({
    path: path.join(screenshots, 'planner-mobile-dark-zh.png'),
    fullPage: true
  });
  await page.evaluate(() => document.documentElement.style.zoom = '2');
  assert.equal(await page.evaluate(() => document.documentElement.getBoundingClientRect().width > innerWidth + .5), false);
  checks++;
  const deniedCtx = await context();
  await deniedCtx.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Denied', 'SecurityError');
    };
  });
  const denied = await open(deniedCtx);
  await denied.locator('[name="title"]').fill('Synthetic unsaved');
  assert.ok((await denied.locator('#editor-status').innerText()).includes('saving is unavailable'));
  checks++;
  const corruptCtx = await context();
  await corruptCtx.addInitScript(k => {
    try {
      localStorage.setItem(k, '{broken');
    } catch {}
  }, key);
  const corrupt = await open(corruptCtx);
  assert.equal(await corrupt.locator('[data-action="raw-backup"]').count(), 1);
  await corrupt.locator('[name="title"]').fill('Does not overwrite corruption');
  assert.equal(await corrupt.evaluate(k => localStorage.getItem(k), key), '{broken');
  checks++;
  const freshCtx = await context();
  for (const name of ['index.html', 'notes.html', 'support.html', 'privacy.html']) {
    const p = await open(freshCtx, name);
    await p.getByRole('button', {
      name: '中文',
      exact: true
    }).click();
    await p.getByRole('button', {
      name: 'EN',
      exact: true
    }).click();
    if (name === 'index.html') {
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 650) {
          scrollTo(0, y);
          await new Promise(r => setTimeout(r, 70));
        }
        scrollTo(0, 0);
      });
      await p.waitForTimeout(300);
      assert.equal(await p.locator('img').evaluateAll(els => els.every(el => el.complete && el.naturalWidth > 0)), true);
      assert.equal(await p.locator('[data-skip]').isVisible(), false);
    }
    if (name === 'notes.html') {
      assert.ok((await p.locator('.note-entry').count()) > 0);
      await p.locator('[data-tab="development"]').click();
      assert.ok((await p.locator('.notes-empty').innerText()).includes('Development notes will appear'));
      await p.locator('[data-tab="running"]').click();
    }
    await p.setViewportSize({
      width: 375,
      height: 812
    });
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (screenshots && ['index.html', 'notes.html'].includes(name)) {
      await p.getByRole('button', {
        name: '中文',
        exact: true
      }).click();
      await p.screenshot({
        path: path.join(screenshots, name.replace('.html', '') + '-mobile-zh.png'),
        fullPage: true
      });
      await p.setViewportSize({
        width: 1440,
        height: 1000
      });
      await p.getByRole('button', {
        name: 'EN',
        exact: true
      }).click();
      await p.screenshot({
        path: path.join(screenshots, name.replace('.html', '') + '-desktop-en.png'),
        fullPage: true
      });
    }
    await p.close();
    checks++;
  }
  const schemaCtx = await context();
  await schemaCtx.route('**/assets/data/schema/plan-v2.json', route => route.abort());
  const schemaPage = await open(schemaCtx);
  await schemaPage.locator('[data-action="preview"]').click();
  assert.equal(await schemaPage.locator('[data-action="copy-json"]').count(), 0);
  assert.ok((await schemaPage.locator('.issue-list').innerText()).includes('schemaUnavailable'));
  checks++;
  const malicious = JSON.parse(JSON.stringify(fixture));
  malicious.days['1'].workout.title = '<img src=x onerror="window.injected=1">';
  const safePage = await open(freshCtx);
  await safePage.locator('#restore-file').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(malicious))});
  await safePage.locator('#change-dialog [data-action="confirm"]').click();
  assert.equal(await safePage.locator('.day-card[data-slot="1"] img').count(), 0);
  assert.equal(await safePage.evaluate(() => window.injected), undefined);
  assert.equal(await safePage.locator('.day-card[data-slot="1"] h3').innerText(), malicious.days['1'].workout.title);
  await safePage.locator('#restore-file').setInputFiles({name:'oversized.json',mimeType:'application/json',buffer:Buffer.from(' '.repeat(1500001))});
  assert.ok((await safePage.locator('#editor-status').innerText()).includes('too large'));
  checks++;
  // Emulate a static GitHub Pages project prefix without deploying anything.
  const prefixCtx = await context();
  const prefix = base + 'project-preview/';
  await prefixCtx.route(prefix+'**', route => route.fetch({url:base+route.request().url().slice(prefix.length)}).then(response=>route.fulfill({response})));
  const prefixPage = await prefixCtx.newPage();
  await prefixPage.goto(prefix+'planner.html');
  await prefixPage.locator('[name="title"]').waitFor();
  await prefixPage.locator('a[href="notes.html"]').click();
  await prefixPage.locator('.note-entry').first().waitFor();
  assert.equal(prefixPage.url(),prefix+'notes.html');
  await prefixPage.reload();
  await prefixPage.locator('.note-entry').first().waitFor();
  checks++;
  assert.deepEqual(errors, []);
  assert.equal(requests.filter(u => u.startsWith(base) && /journey\.json/.test(u)).length, 0);
  assert.equal(requests.filter(u => !u.startsWith(base) && !u.includes('cloud.umami.is')).length, 0);
  console.log(`PASS: ${checks} browser scenarios; no page errors; no external plan requests or full journey load.`);
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
