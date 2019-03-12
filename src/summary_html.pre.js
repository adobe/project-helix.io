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

function removeHeading(document, logger) {
  const h1 = Array.from(document.getElementsByTagName('h1'));
  logger.debug(`Found h1: ${h1.length}`);
  h1.forEach((e) => {
    logger.debug(`removing ${e}`);
    e.remove();
  });
}

function rewriteLinks(document, currentFolderPath, logger) {
  const links = Array.from(document.getElementsByTagName('a'));
  logger.debug(`Found links: ${links.length}`);

  function md2html(url) {
    // pipeline does this only for relative links, but we do it for all links
    return url.replace(/\.md$/, '.html');
  }

  // do some stuff with the current folder path, at least for non-absolute URLs
  function path(url) {
    if (!/^https?:\/\//.test(url)) {
      return currentFolderPath.substring(0, currentFolderPath.lastIndexOf('/')) + (url.charAt(0) === '/' ? '' : '/') + url;
    }
    return url;
  }

  links.forEach((e) => {
    logger.debug(`rewriting ${e.href}`);
    e.href = path(e.href);
    e.href = md2html(e.href);
  });
}

// module.exports.pre is a function (taking next as an argument)
// that returns a function (with payload, config, logger as arguments)
// that calls next (after modifying the payload a bit)
async function pre(payload, action) {
  const {
    logger,
  } = action;

  if (payload.content.document) {
    const { document } = payload.content;

    removeHeading(document, logger);
    rewriteLinks(document, action.request.params.path, logger);
  } else {
    logger.error('summary_html.pre.js - could not get a DOM to work with');
  }
  return payload;
}

module.exports = { pre, removeHeading, rewriteLinks };
