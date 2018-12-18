/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global describe, it */
const assert = require('assert');
const $ = require('shelljs');

const { assertHttp, sleep } = require('./utils'); 

const HLX_SMOKE_EXEC = process.env.HLX_SMOKE_EXEC || 'hlx';
console.debug(`Running smoke test using: ${HLX_SMOKE_EXEC}`);

describe('project-helix.io renders properly', function suite() {
    this.timeout(10000);

    let hlxup;

    before(async function before() {
        hlxup = $.exec(`${HLX_SMOKE_EXEC} up --open false`, {
            // silent: true,
            async: true
        }, (code, stdout, stderr) => {
            assert.ok(!stdout.includes('[hlx] error'), 'No error message allowed');
            assert.ok(!stdout.includes('[hlx] warn'), 'No warning message allowed');
        });

        // wait for server to properly start and hlx build to be completed
        await sleep(5000);
    });
    
    after(async function after() {
        hlxup.kill();
        hlxup = null;
        await sleep(1000);
    });

    it('Root ("/" / index.html) is rendered using project htl scripts', async () => {
        // test for root request
        let html = (await assertHttp('http://localhost:3000', 200)).toLowerCase();

        assert.ok(html.includes('<body>'), 'index page is rendered - at least contains a body tag')
        assert.ok(html.includes('<div class="summary">'), 'nav in index (summary_html.htl) is included via ESI include');
    });

    it('README.html page is rendered using project htl scripts', async () => {
        // test specific URL
        html = (await assertHttp('http://localhost:3000/README.html', 200)).toLowerCase();

        assert.ok(html.includes('<body>'), 'README page is rendered - at least contains a body tag');
        assert.ok(html.includes('<div class="summary">'), 'nav in README (summary_html.htl) is included via ESI include');

    });

    it('index.html page source check', async () => {
        let html = (await assertHttp('http://localhost:3000/index.html', 200)).toLowerCase();

        // check if logo can be downloaded
        const match = html.match(/("([^"]|"")*helix_logo.png")/g);
        assert.equal(match.length, 1, 'helix_logo.png is present in the HTML source');
        let logoURL = match[0].split('"')[1];
        if(logoURL.indexOf('./') === 0) {
            logoURL = logoURL.substring(1);
        }

        await assertHttp(`http://localhost:3000${logoURL}`, 200);
    });

    it('static asset in index.html check', async () => {
        let html = (await assertHttp('http://localhost:3000/index.html', 200)).toLowerCase();

        // check if one asset can be downloaded
        const reg = /src="(assets\/.*?\.png)"/g

        assert.ok(reg.test(html), 'no assets found');

        let assetURL = reg.exec(html)[1];
        if (assetURL.indexOf('/') !== 0) {
            assetURL = `/${assetURL}`;
        }

        await assertHttp(`http://localhost:3000${assetURL}`, 200);
    });
});
