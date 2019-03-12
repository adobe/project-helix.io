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
const { JSDOM } = require('jsdom');
const { pre, removeHeading, rewriteLinks } = require('../../src/summary_html.pre.js');

const { loggerMock } = require('./utils');

describe('Testing pre requirements for main function', () => {
  it('Exports pre', () => {
    assert.ok(pre);
  });

  it('pre is a function', () => {
    assert.equal('function', typeof pre);
  });
});

describe('Testing removeHeading', () => {
  it('removeHeading() removes h1 elements', () => {
    const before = new JSDOM(`<div>
      <h1>A Heading</h1>
      <p>Not a heading</p>
    </div>`).window.document;

    const after = new JSDOM('<div>\n      \n      <p>Not a heading</p>\n    </div>').window.document;
    removeHeading(before, loggerMock);
    assert.equal(before.body.innerHTML, after.body.innerHTML);
  });
});

describe('Testing rewriteLinks', () => {
  it('rewriteLinks() - basic', () => {
    const before = new JSDOM('<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="link.md">link</a></li>\n</ul>').window.document;

    const after = new JSDOM('<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="/current/path/link.html">link</a></li>\n</ul>').window.document;

    rewriteLinks(before, '/current/path/index.md', loggerMock);

    assert.equal(before.body.innerHTML, after.body.innerHTML);
  });

  it('rewriteLinks() - client', () => {
    const before = new JSDOM('<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="/client/link.md">link</a></li>\n</ul>').window.document;

    const after = new JSDOM('<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="/current/path/client/link.html">link</a></li>\n</ul>').window.document;

    rewriteLinks(before, '/current/path/index.md', loggerMock);

    assert.equal(before.body.innerHTML, after.body.innerHTML);
  });

  it('rewriteLinks() - pipeline', () => {
    const before = new JSDOM('<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="/pipeline/link.md">link</a></li>\n</ul>').window.document;

    const after = new JSDOM('<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="/pipeline/link.html">link</a></li>\n</ul>').window.document;

    rewriteLinks(before, '/index.md', loggerMock);

    assert.equal(before.body.innerHTML, after.body.innerHTML);
  });
});
