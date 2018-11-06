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

describe('project-helix.io renders properly', function suite() {
    this.timeout(10000);

    let hlxup;

    beforeEach(async function before() {
        hlxup = $.exec('hlx up --open false', {
            silent: true,
            async: true
        }, (code, stdout, stderr) => {
            assert.ok(!stdout.includes('[hlx] error'), 'No error message allowed');
        });

        await sleep(3000);
    });
    
    afterEach(async function after() {
        hlxup.kill();
        hlxup = null;
        await sleep(1000);
    });

    it('Pages are rendered using project htl scripts', async () => {
        let html = await assertHttp('http://localhost:3000', 200);

        assert.ok(html.toLowerCase().includes('<body>'), 'html.htl is rendered')
        assert.ok(html.toLowerCase().includes('<div class="summary">'), 'summary_html.htl is included')

        html = await assertHttp('http://localhost:3000/README.html', 200);

        assert.ok(html.toLowerCase().includes('<body>'), 'html.htl is rendered')
        assert.ok(html.toLowerCase().includes('<div class="summary">'), 'summary_html.htl is included')
    });
});
