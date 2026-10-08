/* Synthetic rendering regression: no external requests or user plan data. */
const playwright = require(process.env.PACERMIND_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PACERMIND_PREVIEW_URL || 'http://127.0.0.1:4173/';
const engines = (process.env.PACERMIND_FORM_BROWSERS || 'chromium').split(',');
const screenshots = process.env.PACERMIND_CONTROL_SCREENSHOTS;
const fixturePath = path.join(__dirname, 'fixtures/synthetic-draft-v1.json');
const measurements = [];

async function checkFields(page, selector, zoom) {
  const groups = await page.locator(selector).evaluateAll(rows => rows.map(row =>
    [...row.querySelectorAll('input:not([type=checkbox]):not([type=file]),select')]
      .filter(el => el.getBoundingClientRect().width > 0)
      .map(el => {
        const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        const bounds = row.getBoundingClientRect();
        return { name: el.name, tag: el.tagName, top: r.top, height: r.height,
          contained: r.left >= bounds.left - 1 && r.right <= bounds.right + 1,
          font: s.fontFamily, size: s.fontSize, line: s.lineHeight,
          paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
          paddingRight: s.paddingRight, boxSizing: s.boxSizing,
          appearance: s.appearance, arrow: s.backgroundImage };
      })));
  assert.ok(groups.flat().some(el => el.tag === 'SELECT'), 'Measure real select controls');
  for (const fields of groups) {
    for (const el of fields) {
      assert.ok(Math.abs(el.height - 44 * zoom) < 0.6, `${el.name}: height ${el.height}`);
      assert.equal(el.boxSizing, 'border-box');
      assert.equal(el.size, '16px');
      assert.equal(el.line, '24px');
      assert.equal(el.paddingTop, '9px');
      assert.equal(el.paddingBottom, '9px');
      assert.equal(el.font, fields[0].font);
      assert.ok(el.contained, `${el.name}: contained in its form row`);
      if (el.tag === 'SELECT') {
        assert.equal(el.appearance, 'none');
        assert.equal(el.paddingRight, '36px');
        assert.notEqual(el.arrow, 'none');
      }
    }
  }
  if (zoom === 1) {
    const pageBounds = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('body *')]
        .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 8).map(el => ({ tag: el.tagName, name: el.name, class: el.className,
          right: el.getBoundingClientRect().right }))
    }));
    assert.ok(pageBounds.scrollWidth <= pageBounds.width + 1, `No horizontal page overflow: ${JSON.stringify(pageBounds)}`);
  }
  return groups.flat();
}

(async () => {
  let count = 0;
  const errors = [];
  for (const engine of engines) {
    assert.ok(['chromium', 'webkit'].includes(engine), 'Supported rendering engine');
    const browser = await playwright[engine].launch({
      executablePath: engine === 'chromium' ? process.env.PACERMIND_CHROMIUM : undefined,
      headless: true,
      ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {})
    });
    try {
      for (const width of [375, 768, 1440]) for (const lang of ['en', 'zh'])
        for (const colorScheme of ['light', 'dark']) for (const zoom of [1, 2]) {
          const context = await browser.newContext({
            viewport: { width, height: 1000 }, colorScheme, reducedMotion: 'reduce'
          });
          await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
          const page = await context.newPage();
          page.on('pageerror', err => errors.push(err.message));
          try {
            await page.goto(base + 'planner.html');
            await page.getByRole('button', { name: lang === 'zh' ? '中文' : 'EN', exact: true }).click();
            await page.locator('#restore-file').setInputFiles(fixturePath);
            await page.locator('#change-dialog [data-action=confirm]').click();
            await page.evaluate(z => { document.documentElement.style.zoom = String(z); }, zoom);
            const fields = await checkFields(page, '#setup .fields', zoom);
            const row = page.locator('#setup > .fields').first();
            if (width === 1440 && zoom === 1) {
              const tops = fields.slice(0, 4).map(f => f.top);
              assert.ok(Math.max(...tops) - Math.min(...tops) < 0.6, 'Adjacent control tops align');
            }
            // Stress the existing native select without changing application values.
            await page.locator('[name=weekStart]').evaluate((el, language) => {
              el.selectedOptions[0].textContent = language === 'zh'
                ? '星期一 · 这是一个用于检查箭头空间和截断行为的很长的中文选项'
                : 'Monday · A very long synthetic option to check clipping and arrow space';
            }, lang);
            await checkFields(page, '#setup .fields', zoom);
            await page.locator('[name=startDate]').focus();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            // Date-input keyboard segments differ by engine; focus the native select,
            // then Tab to the adjacent native control to test visible keyboard focus.
            await page.locator('[name=weekStart]').focus();
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => document.activeElement.name), 'mode');
            const focused = await page.locator('[name=mode]').evaluate(el => {
              const s = getComputedStyle(el);
              return { visible: el.matches(':focus-visible'), width: s.outlineWidth, style: s.outlineStyle };
            });
            assert.ok(focused.visible);
            assert.equal(focused.width, '3px');
            assert.equal(focused.style, 'solid');
            if (screenshots && zoom === 1) {
              fs.mkdirSync(screenshots, { recursive: true });
              await row.screenshot({ path: path.join(screenshots, `${engine}-${width}-${lang}-${colorScheme}.png`) });
            }
            const state = await page.locator('[name=weekStart]').evaluate(el => {
              el.disabled = true;
              const disabled = getComputedStyle(el).opacity;
              el.disabled = false;
              el.setAttribute('aria-invalid', 'true');
              const border = getComputedStyle(el).borderColor;
              const probe = document.createElement('span');
              probe.style.color = 'var(--color-route)';
              document.body.append(probe);
              const expected = getComputedStyle(probe).color;
              probe.remove();
              el.removeAttribute('aria-invalid');
              return { disabled, border, expected };
            });
            assert.equal(state.disabled, '0.45');
            assert.equal(state.border, state.expected);
            await page.locator('.day-card[data-slot="1"] [data-action=edit-day]').click();
            await checkFields(page, '#editor-dialog .fields', zoom);
            const checkboxHeight = await page.locator('#event-enabled').evaluate(el => el.getBoundingClientRect().height);
            assert.ok(Math.abs(checkboxHeight - 20 * zoom) < 0.6, 'Checkbox retains its own size');
            await page.keyboard.press('Escape');
            measurements.push({ engine, width, lang, colorScheme, zoom, heights: [...new Set(fields.map(f => f.height))] });
            count++;
          } catch (err) {
            err.message = `${engine} ${width}px ${lang} ${colorScheme} ${zoom * 100}%: ${err.message}`;
            throw err;
          } finally {
            await context.close();
          }
        }
      console.log(`PASS: ${engine} form-control matrix (24 cases)`);
      // High-contrast mode falls back to the operating system's select arrow.
      if (engine === 'chromium') {
        const context = await browser.newContext({ forcedColors: 'active' });
        await context.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
        const page = await context.newPage();
        await page.goto(base + 'planner.html');
        const state = await page.locator('[name=weekStart]').evaluate(el => {
          const s = getComputedStyle(el);
          return { appearance: s.appearance, image: s.backgroundImage };
        });
        assert.equal(state.appearance, 'auto');
        assert.equal(state.image, 'none');
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
  assert.deepEqual(errors, []);
  if (screenshots) fs.writeFileSync(path.join(screenshots, 'measurements.json'), JSON.stringify(measurements, null, 2));
  console.log(`PASS: ${count} form-control cases (${engines.join(', ')}); 375/768/1440, EN/ZH, light/dark, 100/200% CSS zoom, long options, keyboard focus, disabled/error states; no page errors.`);
})().catch(err => { console.error(err); process.exitCode = 1; });
