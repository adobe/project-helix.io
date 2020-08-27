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

'use strict';

const assert = require('assert');
const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');

describe('Test preview bookmarklet', () => {
  let browser;
  let page;
  const allCoverage = [];

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

  // tests based on alert dialog messages
  const basics = [
    {
      name: 'Checks missing config',
      url: `file://${__dirname}/../fixtures/preview-bookmarklet/config-none.html`,
      alertShown: false,
      expect: 'unable to find a valid configuration',
      failedMsg: 'Missing config not detected',
    },
    {
      name: 'Checks invalid config',
      url: `file://${__dirname}/../fixtures/preview-bookmarklet/config-invalid.html`,
      alertShown: false,
      expect: 'is misconfigured',
      failedMsg: 'Invalid config not detected',
    },
    {
      name: 'Detects if innerHost is a URL',
      url: `file://${__dirname}/../fixtures/preview-bookmarklet/url-innerhost.html`,
      alertShown: false,
      expect: '\nhttps://helix-home--adobe.hlx.page',
      failedMsg: 'Inner hostname not extracted from URL',
    },
    {
      name: 'Detects if outerHost is a URL',
      url: `file://${__dirname}/../fixtures/preview-bookmarklet/url-outerhost.html`,
      alertShown: false,
      expect: '\nhttps://www.hlx.page',
      failedMsg: 'Outer hostname not extracted from URL',
    },
    {
      name: 'Uses default project name',
      url: `file://${__dirname}/../fixtures/preview-bookmarklet/project-name-default.html`,
      alertShown: false,
      expect: 'your Helix Pages project',
      failedMsg: 'Default project name not used',
    },
    {
      name: 'Uses custom project name',
      url: `file://${__dirname}/../fixtures/preview-bookmarklet/project-name-custom.html`,
      alertShown: false,
      expect: 'Test Project',
      failedMsg: 'Custom project name not used',
    },
  ];
  basics.forEach(async (test) => {
    it(test.name, async () => {
      page.on('dialog', async (dialog) => {
        // eslint-disable-next-line no-param-reassign
        test.alertShown = dialog.message().includes(test.expect);
        await dialog.accept();
      });
      await page.goto(test.url, { waitUntil: 'load' });
      assert.equal(test.alertShown, true, test.failedMsg);
    });
  });

  it('Opens a new tab with staging lookup URL', async () => {
    let lookupUrl;
    browser.on('targetcreated', (target) => {
      lookupUrl = target.url();
    });
    await page.goto(`file://${__dirname}/../fixtures/preview-bookmarklet/onedrive-staging.html`, { waitUntil: 'networkidle0' });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          assert.equal(lookupUrl, 'https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v1?owner=adobe&repo=theblog&ref=master&path=%2F&lookup=https%3A%2F%2Fadobe.sharepoint.com%2F%3Aw%3A%2Fr%2Fsites%2FTheBlog%2F_layouts%2F15%2FDoc.aspx%3Fsourcedoc%3D%257BE8EC80CB-24C3-4B95-B082-C51FD8BC8760%257D%26file%3Dcafebabe.docx%26action%3Ddefault%26mobileredirect%3Dtrue', 'Staging lookup URL not opened');
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 3000);
    });
  }).timeout(10000);

  it('Switches from staging to production URL', async () => {
    let switched = false;
    browser.on('targetchanged', (target) => {
      switched = target.url() === 'https://blog.adobe.com/en/topics/news.html';
    });
    await page.goto(`file://${__dirname}/../fixtures/preview-bookmarklet/staging-production.html`, { waitUntil: 'networkidle0' });
    assert.equal(switched, true, 'Production URL not opened');
  }).timeout(5000);

  it('Switches from production to staging URL', async () => {
    let switched = false;
    browser.on('targetchanged', (target) => {
      switched = target.url() === 'https://theblog--adobe.hlx.page/en/topics/news.html';
    });

    await page.goto(`file://${__dirname}/../fixtures/preview-bookmarklet/production-staging.html`, { waitUntil: 'networkidle0' });
    assert.equal(switched, true, 'Staging URL not opened');
  }).timeout(30000);
});
