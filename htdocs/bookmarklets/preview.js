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
/* eslint-disable no-alert */
/* global window */

'use strict';

/**
 * The ${TITLE} allows jumping from a source document to
 * the corresponding page on staging, and toggling between staging and production.
 * Requires a config object in <code>window.hlxPreviewBookmarklet</code>:
 * @property {string} innerHost The staging host name (<repo>--<owner>.hlx.page) (required)
 * @property {string} outerHost The production host name (optional)
 * @property {string} project The project name (optional)
 */
(() => {
  const BOOKMARKLET = 'Helix Pages Preview Bookmarklet';
  // config
  if (!window.hlxPreviewBookmarklet || typeof window.hlxPreviewBookmarklet !== 'object') {
    window.alert(`${BOOKMARKLET} was unable to find a valid configuration.`);
  }
  const c = window.hlxPreviewBookmarklet;
  const projectName = c.project || 'your Helix Pages project';
  let ref;
  let repo;
  let owner;
  if (c.innerHost) {
    if (c.innerHost.startsWith('http')) c.innerHost = new URL(c.innerHost).host;
    const hostSegments = c.innerHost.split(c.innerHost.includes('--') ? '--' : '-');
    if (hostSegments.length >= 2) {
      ref = hostSegments.length === 3 ? hostSegments.shift() : null;
      repo = hostSegments.shift();
      [owner] = hostSegments.shift().split('.');
    }
    ref = ref || 'master';
  }
  if (!owner || !repo) {
    window.alert(`${BOOKMARKLET} is misconfigured for ${projectName}.`);
    return;
  }
  if (c.outerHost && c.outerHost.startsWith('http')) c.outerHost = new URL(c.outerHost).host;

  if (window.confirm('Try out the new Helix Sidekick, your one-stop bookmarklet for preview, edit and publish! \n\nDo you want to install it now? It will only take a minute ...')) {
    const skUrl = new URL('https://www.hlx.page/tools/sidekick/');
    skUrl.search = new URLSearchParams([
      ['project', c.project],
      ['giturl', `https://github.com/${owner}/${repo}/tree/${ref}`],
      ['host', c.outerHost],
      ['from', window.location.href],
    ]).toString();
    window.location.href = skUrl.toString();
  } else {
    let loc = window.location;
    const $test = window.document.getElementById('test_location');
    if ($test && $test.value) {
      try {
        loc = new URL($test.value);
      } catch (e) {
        window.alert(`${BOOKMARKLET} detected a malformed Test URL: ${$test.value}`);
        return;
      }
    }
    const currentHost = loc.hostname;
    const currentPath = loc.pathname;

    if (/.*\.sharepoint\.com/.test(currentHost)
      || currentHost === 'docs.google.com') {
      // source document, open window with staging url
      const u = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v1');
      u.search = new URLSearchParams([
        ['owner', owner],
        ['repo', repo],
        ['ref', ref],
        ['path', '/'],
        ['lookup', loc.href],
      ]).toString();
      window.open(u, `hlxPreview-${ref}--${repo}--${owner}`);
    } else {
      switch (currentHost) {
        case c.innerHost: {
          // staging, switch to production
          if (!c.outerHost) {
            window.alert(`${BOOKMARKLET} does not know the production host name for ${projectName}.`);
            return;
          }
          window.location.href = `https://${c.outerHost}${currentPath.replace('/publish', '')}`;
          break;
        }
        case c.outerHost: {
          // production, switch to staging
          window.location.href = `https://${c.innerHost}${currentPath.replace(/^\/(.*)\/(\d{4})/, '/$1/publish/$2')}`;
          break;
        }
        default: {
          window.alert(`${BOOKMARKLET} allows you to preview pages on ${projectName}.\n\nTry it on a valid source document, or any page on:\nhttps://${c.innerHost}${c.outerHost ? `/\nhttps://${c.outerHost}/` : ''}`);
        }
      }
    }
  }
})();
