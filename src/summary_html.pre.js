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

const DOMAINS = [{
    'name': 'project-helix.io/',
    'dev': '',
    'prod': 'https://www.project-helix.io/'
},{
    'name': 'hypermedia-pipeline',
    'dev': 'subdomains/hypermedia-pipeline',
    'prod': 'https://pipeline.project-helix.io'
},{
    'name': 'helix-cli',
    'dev': 'subdomains/helix-cli',
    'prod': 'https://client.project-helix.io'
}];

function removeHeading(document, logger) {
    const h1 = Array.from(document.getElementsByTagName('h1'));
    logger.debug('Found h1: ' + h1.length);
    h1.forEach(e => {
        logger.debug('removing ' + e);
        e.remove();
    });
}

function rewriteLinks(document, isDev, currentFolderPath, logger) {
    const links = Array.from(document.getElementsByTagName('a'));
    logger.debug('Found links: ' + links.length);

    // build a list of rewriting rules from the mapping defined in DOMAINS
    const rewrites = DOMAINS.map(mapping => {
        return function(url) {
            return url.replace(new RegExp(mapping.name, 'g'), isDev ? mapping.dev : mapping.prod);
        }
    });

    // go over each rewriting function and apply it to the passed URL
    function rewrite(url) {
        return rewrites.reduce((rurl, rewriter) => rewriter(rurl), url);
    }

    function md2html(url) {
        // pipeline does this only for relative links, but we do it for all links
        return url.replace(/\.md$/, '.html');
    }

    // do some stuff with the current folder path, at least for non-absolute URLs
    function path(url) {
        if (!/^https?:\/\//.test(url)) {
            return currentFolderPath.substring(0, currentFolderPath.lastIndexOf('/')) + '/' + url
        }
        return url;
    }

    links.forEach(e => {
        logger.debug('rewriting ' + e.href);
        e.href = rewrite(e.href);
        e.href = path(e.href);
        e.href = md2html(e.href);
    });
}

// module.exports.pre is a function (taking next as an argument)
// that returns a function (with payload, config, logger as arguments)
// that calls next (after modifying the payload a bit)
async function pre(payload, action) {
    const {
        logger
    } = action;

    if (payload.content.document) {
        const isDev = action.request.headers.host ? action.request.headers.host.indexOf('localhost') != -1 : false;

        logger.debug('Working with DOM, development: ', isDev);
        const document = payload.content.document;

        removeHeading(document, logger);
        rewriteLinks(document, isDev, action.request.params.path, logger);
        

        return payload;
    } else {
        logger.error(`summary_html.pre.js - could not get a DOM to work with`);
    }
}

module.exports = { pre, removeHeading, rewriteLinks }



