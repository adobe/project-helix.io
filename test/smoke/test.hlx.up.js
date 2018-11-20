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

    beforeEach(async function before() {
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
    
    afterEach(async function after() {
        hlxup.kill();
        hlxup = null;
        await sleep(1000);
    });

    it('Pages are rendered using project htl scripts', async () => {
        // test for root request
        let html = await assertHttp('http://localhost:3000', 200).toLowerCase();

        assert.ok(html.includes('<body>'), 'html.htl is rendered and outputs a body tag')
        assert.ok(html.includes('<div class="summary">'), 'summary_html.htl is included')

        // test specific URL
        html = await assertHttp('http://localhost:3000/README.html', 200).toLowerCase();

        assert.ok(html.includes('<body>'), 'html.htl is rendered and outputs a body tag');
        assert.ok(html.includes('<div class="summary">'), 'nav (summary_html.htl) is included via ESI include');

        // check if logo can be downloaded
        const match = html.match(/("([^"]|"")*helix_logo.png")/g);
        assert.equal(match.length, 1, 'helix_logo.png is present in the HTML');
        let logoURL = match[0].split('"')[1];
        if(logoURL.indexOf('./') === 0) {
            logoURL = logoURL.substring(1);
        }

        await assertHttp(`http://localhost:3000${logoURL}`, 200);
    });
});
