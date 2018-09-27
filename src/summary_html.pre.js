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

function filterNav(navChildren, path, logger) {
    logger.debug('html-pre.js - Extracting nav');

    if (navChildren && navChildren.length > 0) {
        let currentFolderPath = path.substring(0, path.lastIndexOf('/'));
        let nav = navChildren;

        // remove first title
        if (nav && nav.length > 0) {
            nav = nav.slice(1);
        }
        nav = nav.map(element => element
            .replace(new RegExp('href="', 'g'), `href="${currentFolderPath}/`)
            .replace(new RegExp('.md"', 'g'), '.html"'));

        logger.debug('html-pre.js - Managed to collect some content for the nav');
        return nav;
    }

    logger.debug('html-pre.js - Navigation payload has no children');
    return [];
}

// module.exports.pre is a function (taking next as an argument)
// that returns a function (with payload, config, logger as arguments)
// that calls next (after modifying the payload a bit)
async function pre(payload, action) {
    const {
        logger
    } = action;

    try {
        if (!payload.content) {
            logger.debug('html-pre.js - Payload has no resource, nothing we can do');
            return payload;
        }

        const p = payload;

        // clean up the resource
        p.content.children = filterNav(p.content.children, action.request.params.path, logger);

        return p;
    } catch (e) {
        logger.error(`Error while executing html.pre.js: ${e.stack || e}`);
        return {
            error: e,
        };
    }
}

module.exports.pre = pre;