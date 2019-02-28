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
const assert = require('assert');
const expect = require('expect');
const toMatchSnapshot = require('expect-mocha-snapshot');
const beautify = require('js-beautify');
const request = require('request-promise-native');
const $ = require('shelljs');

const { sleep } = require('../smoke/utils'); 

const HLX_SNAP_EXEC = process.env.HLX_SNAP_EXEC || 'hlx';
const HLX_REQUEST_URL = process.env.HLX_REQUEST_URL || 'http://localhost:3000/index.html';
const HLX_UP_REQUIRED = process.env.HLX_UP_REQUIRED || true;
console.debug(`Running snapshot test using: ${HLX_SNAP_EXEC}`);

expect.extend({
    toMatchSnapshot
});

const beautifyHtml = html =>
    beautify.html(html, {
        indent_size: 2,
        indent_inner_html: true,
    });

describe('index.html', function suite() {
    this.timeout(10000);

    let hlxup;
    let response;

    before(async function before() {
        if (HLX_UP_REQUIRED) {
            hlxup = $.exec(`${HLX_SNAP_EXEC} up --open false`, {
                // silent: true,
                async: true
            }, (code, stdout, stderr) => {
                assert.ok(!stdout.includes('[hlx] error'), 'No error message allowed');
                assert.ok(!stdout.includes('[hlx] warn'), 'No warning message allowed');
            });

            // wait for server to properly start and hlx build to be completed
            await sleep(5000);
        }

        response = await request(HLX_REQUEST_URL, {
            resolveWithFullResponse: true
        });
    });

    after(async function after() {
        if (HLX_UP_REQUIRED) {
            hlxup.kill();
            hlxup = null;
            await sleep(1000);
        }
    });

    it('should respond with HTTP 200 (OK)', function () {
        expect(response.statusCode).toEqual(200);
    });

    it(`should have correct html`, function () {
        expect(beautifyHtml(response.body)).toMatchSnapshot(this);
    });
});
