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
const defaultPre = require('../src/summary_html.pre.js');

const loggerMock = {
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  silly: () => {},
};

describe('Testing pre requirements for main function', () => {
  it('Exports pre', () => {
    assert.ok(defaultPre.pre);
  });

  it('pre is a function', () => {
    assert.equal('function', typeof defaultPre.pre);
  });
});

describe('Testing extractNav', () => {
  it('filterNav - basic', () => {
    const output = defaultPre.filterNav(
      [
        '<h1>Table of contents</h1>',
        '\n',
        '<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="link.md">link</a></li>\n</ul>',
      ],
      '/current/path/index.md',
      true,
      loggerMock,
    );

    assert.deepEqual(output, [
      '\n', 
      '<ul>\n<li>a</li>\n<li>b</li>\n<li><a href=\"/current/path/link.html\">link</a></li>\n</ul>'
    ]);
  });

  it('filterNav - dev reference', () => {
    const output = defaultPre.filterNav(
      [
        '<h1>Table of contents</h1>',
        '\n',
        '<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="hypermedia-pipeline/link.md">link</a></li>\n</ul>',
      ],
      '/current/path/index.md',
      true,
      loggerMock,
    );

    assert.deepEqual(output, [
      '\n', 
      '<ul>\n<li>a</li>\n<li>b</li>\n<li><a href=\"/current/path/subdomains/hypermedia-pipeline/link.html\">link</a></li>\n</ul>'
    ]);
  });

  it('filterNav - prod reference', () => {
    const output = defaultPre.filterNav(
      [
        '<h1>Table of contents</h1>',
        '\n',
        '<ul>\n<li>a</li>\n<li>b</li>\n<li><a href="hypermedia-pipeline/link.md">link</a></li>\n</ul>',
      ],
      '/current/path/index.md',
      false,
      loggerMock,
    );

    assert.deepEqual(output, [
      '\n', 
      '<ul>\n<li>a</li>\n<li>b</li>\n<li><a href=\"https://pipeline.project-helix.io/link.html\">link</a></li>\n</ul>'
    ]);
  });
});
