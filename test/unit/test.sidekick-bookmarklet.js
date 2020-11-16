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

  const getSidekickText = async (p) => p.evaluate(
    () => window.document.querySelector('.hlx-sidekick').textContent,
  );

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
      await page.evaluate(() => window.hlxSidekick.toggle());
      await page.waitForSelector('div.hlx-sidekick', {
        hidden: true,
      });
      assert.ok(true, 'Sidekick not hidden');
      // show
      await page.evaluate(() => window.hlxSidekick.toggle());
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
    assert.strictEqual(
      await getSidekickText(page),
      'Foo',
      'Did not add plugin from config',
    );
  }).timeout(10000);

  it('Adds plugins via API', async () => {
    await page.goto(`${fixturesPrefix}/add-plugins.html`, { waitUntil: 'load' });
    assert.strictEqual(
      await getSidekickText(page),
      'FooBarZapfDing',
      'Did not add plugins via API',
    );

    await (await page.$('div.hlx-sidekick .ding button')).click();
    assert.strictEqual(
      await getSidekickText(page),
      'FooBarZapfDingBaz',
      'Did not execute plugin action',
    );
  }).timeout(10000);

  it('Replaces plugin', async () => {
    await page.goto(`${fixturesPrefix}/config-plugin.html`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.hlxSidekick.add({
        id: 'foo',
        override: true,
        button: {
          text: 'CustomFoo',
        },
      });
    });
    assert.strictEqual(
      await getSidekickText(page),
      'CustomFoo',
      'Did not replace plugin',
    );
  }).timeout(10000);

  it('Removes plugin', async () => {
    await page.goto(`${fixturesPrefix}/config-plugin.html`, { waitUntil: 'load' });
    await page.evaluate(() => window.hlxSidekick.remove('foo'));
    assert.strictEqual(
      await getSidekickText(page),
      '',
      'Did not remove plugin',
    );
  }).timeout(10000);

  it('Adds HTML element', async () => {
    await page.goto(`${fixturesPrefix}/config-none.html`, { waitUntil: 'load' });
    await page.evaluate(() => window.hlxSidekick.add({
      id: 'foo',
      elements: [
        {
          tag: 'span',
          text: 'Lorem ipsum',
        },
      ],
    }));
    assert.strictEqual(
      await getSidekickText(page),
      'Lorem ipsum',
      'Did not add HTML element',
    );
  }).timeout(10000);

  it('Loads custom CSS', async () => {
    await page.goto(`${fixturesPrefix}/config-none.html`, { waitUntil: 'load' });
    await page.evaluate(() => {
      window.hlxSidekick.loadCSS('custom.css');
    });
    const bgColor = await page.$eval('div.hlx-sidekick',
      (elem) => window.getComputedStyle(elem).getPropertyValue('background-color'));
    assert.strictEqual(bgColor, 'rgb(255, 255, 0)', 'Did not load custom CSS');
  }).timeout(10000);

  it('Shows and hides notifications', async () => {
    await page.goto(`${fixturesPrefix}/config-none.html`, { waitUntil: 'load' });
    assert.strictEqual(await page.evaluate(() => {
      window.hlxSidekick.notify('Lorem ipsum');
      return window.document.querySelector('.hlx-sidekick-overlay .modal').textContent;
    }), 'Lorem ipsum', 'Did show notification');

    assert.strictEqual(await page.evaluate(() => {
      window.hlxSidekick.showModal('Sticky', true);
      return window.document.querySelector('.hlx-sidekick-overlay .modal.wait').textContent;
    }), 'Sticky', 'Did show sticky modal');

    assert.strictEqual(await page.evaluate(() => {
      window.hlxSidekick.hideModal();
      return window.document.querySelector('.hlx-sidekick-overlay').classList.contains('hidden');
    }), true, 'Did not hide sticky modal');
  }).timeout(10000);
});
