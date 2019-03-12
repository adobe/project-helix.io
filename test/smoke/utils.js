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
const http = require('http');
const fse = require('fs-extra');
const path = require('path');

async function assertHttp(url, status, spec, replacements = []) {
  return new Promise((resolve, reject) => {
    let data = '';
    http.get(url, (res) => {
      try {
        assert.equal(res.statusCode, status);
      } catch (e) {
        res.resume();
        reject(new Error(`Error while checking status code for request ${url}`, e));
      }

      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          try {
            if (spec) {
              let expected = fse.readFileSync(path.resolve(__dirname, 'specs', spec)).toString();
              replacements.forEach((r) => {
                expected = expected.replace(r.pattern, r.with);
              });
              assert.equal(data, expected);
            }
            resolve(data);
          } catch (e) {
            reject(new Error(`Error while reading data for request ${url}`, e));
          }
        });
    }).on('error', (e) => {
      reject(e);
    }).setTimeout(5000, () => {
      if (status === 404 || status === 408) {
        resolve();
      } else {
        reject(new Error(`Request timeout: ${url}`));
      }
    });
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.assertHttp = assertHttp;
module.exports.sleep = sleep;
