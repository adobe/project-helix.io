/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */
/* global window */

'use strict';

const assert = require('assert');
const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');

describe('Test sidekick bookmarklet', () => {
  let browser;
  let page;
  const allCoverage = [];
  const fixturesPrefix = `file://${__dirname}/../fixtures/sidekick-bookmarklet`;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      args: [
        '--disable-popup-blocking',
        '--disable-web-security',
        '–no-sandbox',
        '–disable-setuid-sandbox',
      ],
    });
    page = await browser.newPage();
    await page.coverage.startJSCoverage({
      reportAnonymousScripts: true,
    });
  });

  afterEach(async () => {
    allCoverage.concat(await Promise.all([
      page.coverage.stopJSCoverage(),
    ]));
    await browser.close();
    browser = null;
    page = null;
  });

  after(() => {
    pti.write(allCoverage);
  });

  it('Renders empty with missing config', async () => {
    await page.goto(`${fixturesPrefix}/config-none.html`, { waitUntil: 'load' });
    const skHandle = await page.$('div.hlx-sidekick');
    assert.ok(skHandle, 'Did not render empty with missing config');
    const zIndex = await page.evaluate(
      (elem) => window.getComputedStyle(elem).getPropertyValue('z-index'),
      skHandle,
    );
    assert.strictEqual(zIndex, '1000', 'Did not apply CSS');
  }).timeout(10000);

  it('Toggles visibility', async () => {
    try {
      await page.goto(`${fixturesPrefix}/config-none.html`, { waitUntil: 'load' });
      // hide
      await page.evaluate(() => window.sidekick.toggle());
      await page.waitForSelector('div.hlx-sidekick', {
        hidden: true,
      });
      assert.ok(true, 'Sidekick not hidden');
      // show
      await page.evaluate(() => window.sidekick.toggle());
      await page.waitForSelector('div.hlx-sidekick', {
        visible: true,
      });
      assert.ok(true, 'Sidekick not visible');
    } catch (e) {
      assert.fail(e);
    }
  }).timeout(10000);

  it('Adds plugin from config', async () => {
    await page.goto(`${fixturesPrefix}/config-plugin.html`, { waitUntil: 'load' });
    const skHandle = await page.$('div.hlx-sidekick');
    const text = await page.evaluate((elem) => elem.textContent, skHandle);
    assert.strictEqual(text, 'Foo', 'Did not add plugin from config');
  }).timeout(10000);

  it('Adds plugin via API', async () => {
    await page.goto(`${fixturesPrefix}/add-plugin.html`, { waitUntil: 'load' });
    const skHandle = await page.$('div.hlx-sidekick');
    let text = await page.evaluate((elem) => elem.textContent, skHandle);
    assert.strictEqual(text, 'Bar', 'Did not add plugin via API');
    const button = await page.$('div.hlx-sidekick button');
    await button.click();
    text = await page.evaluate((elem) => elem.textContent, skHandle);
    assert.strictEqual(text, 'BarBaz', 'Did not execute plugin action');
  }).timeout(10000);

  it('Removes plugin', async () => {
    await page.goto(`${fixturesPrefix}/remove-plugin.html`, { waitUntil: 'load' });
    const skHandle = await page.$('div.hlx-sidekick');
    const text = await page.evaluate((elem) => elem.textContent, skHandle);
    assert.strictEqual(text, '', 'Did not remove plugin');
  }).timeout(10000);

  it('Loads custom CSS', async () => {
    await page.goto(`${fixturesPrefix}/load-css.html`, { waitUntil: 'load' });
    const bgColor = await page.$eval('div.hlx-sidekick',
      (elem) => window.getComputedStyle(elem).getPropertyValue('background-color'));
    assert.strictEqual(bgColor, 'rgb(255, 255, 0)', 'Did not load custom CSS');
  }).timeout(10000);
});
