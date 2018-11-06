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

const request = require('request-promise');

/**
 * Removes the first title from the resource children
 * @param Array children Children
 * @param {Object} logger Logger
 */
function removeFirstTitle(children, logger) {
  logger.debug('html-pre.js - Removing first title');
  let ret = children;
  if (ret && ret.length > 0) {
    ret = ret.slice(1);
  }
  return ret;
}

function fixTheLinks(children, logger) {
  logger.debug('html-pre.js - Fixing the links (md to html)');
  let ret = children;
  if (ret && ret.length > 0) {
    ret = ret.map(element => element
      .replace(new RegExp('.md"', 'g'), '.html"'));
  }
  return ret;
}

/**
 * Fetches the commits history
 * @param String apiRoot API root url
 * @param String owner Owner
 * @param String repo Repo
 * @param String ref Ref
 * @param String path Path to the resource
 * @param {Object} logger Logger
 */
async function fetchCommitsHistory(apiRoot, owner, repo, ref, path, logger) {
  logger.debug('html-pre.js - Fetching the commits history');

  const options = {
    uri: `${apiRoot}` +
      'repos/' +
      `${owner}` +
      '/' +
      `${repo}` +
      '/commits?path=' +
      `${path}` +
      '&sha=' +
      `${ref}`,
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,
  };

  logger.debug(`html-pre.js - Fetching... ${options.uri}`);
  return request(options);
}

/**
 * Extracts some committers data from the list of commits
 * and returns the list of committers
 * @param Array commits Commits
 * @param {Object} logger Logger
 */
function extractCommittersFromCommitsHistory(commits, logger) {
  logger.debug('html-pre.js - Extracting committers from metadata');
  if (commits) {
    const committers = [];

    commits.forEach((entry) => {
      if (entry.author &&
        entry.commit.author &&
        committers.map(item => item.avatar_url).indexOf(entry.author.avatar_url) < 0) {
        committers.push({
          avatar_url: entry.author.avatar_url,
          display: `${entry.commit.author.name} | ${entry.commit.author.email}`,
        });
      }
    });
    logger.debug(`html-pre.js - Number of committers extracted: ${committers.length}`);
    return committers;
  }

  logger.debug('html-pre.js - No committers found!');
  return [];
}

/**
 * Extracts the last modified date of commits and
 * returns an object containing the date details
 * @param Array commits Commits
 * @param {Object} logger Logger
 */
function extractLastModifiedFromCommitsHistory(commits, logger) {
  logger.debug('html-pre.js - Extracting last modified from metadata');

  if (commits) {
    const lastMod = commits.length > 0 &&
      commits[0].commit &&
      commits[0].commit.author ? commits[0].commit.author.date : null;

    const display = new Date(lastMod);

    const lastModified = {
      raw: lastMod,
      display: lastMod ? display : 'Unknown',
    };
    logger.debug(`html-pre.js - Managed to fetch a last modified: ${display}`);
    return lastModified;
  }

  logger.debug('html-pre.js - No last modified found!');
  return {
    raw: 'Unknown',
    display: 'Unknown',
  };
}

/**
 * Fetches the nav payload
 * @param String rawRoot Raw root url
 * @param String owner Owner
 * @param String repo Repo
 * @param String ref Ref
 * @param {Object} logger Logger
 */
function computeNavPath(isDev, logger) {
  logger.debug('html-pre.js - Fetching the nav');

  /*
  // fetch the whole tree...
  const options = {
    uri: `${apiRoot}` +
      'repos/' +
      `${owner}` +
      '/' +
      `${repo}` +
      '/git/trees/' +
      `${ref}` +
      '?recursive=1',
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,
  };

  logger.debug(`html-pre.js - Fetching... ${options.uri}`);
  const json = await request(options);

  // ...to find the "closest" SUMMARY.md
  let currentFolderPath = path.substring(0, path.lastIndexOf('/'));

  let summaryPath;
  while (!summaryPath && currentFolderPath.length > 0) {
    json.tree.forEach(function (item) {
      if ('/' + item.path == currentFolderPath + '/SUMMARY.md') {
        summaryPath = '/' + item.path;
      }
    });
    currentFolderPath = currentFolderPath.substring(0, currentFolderPath.lastIndexOf('/'));
  }

  summaryPath = summaryPath ? summaryPath.replace('.md', '') : '';
  */
  
  if (!isDev) {
    const summaryPath = 'https://www.project-helix.io/SUMMARY';
    logger.debug(`html-pre.js - Production path to SUMMARY.md to generate nav: ${summaryPath}`);
    return summaryPath;
  }
 
  const summaryPath = '/SUMMARY';
  logger.debug(`html-pre.js - Development path to SUMMARY.md to generate nav: ${summaryPath}`);
  return summaryPath;
}

// module.exports.pre is a function (taking next as an argument)
// that returns a function (with payload, config, logger as arguments)
// that calls next (after modifying the payload a bit)
async function pre(payload, action) {
  const {
    logger,
    secrets,
    request: actionReq
  } = action;

  try {
    if (!payload.content) {
      logger.debug('html-pre.js - Payload has no resource, nothing we can do');
      return payload;
    }

    const p = payload;

    // clean up the resource
    p.content.children = removeFirstTitle(p.content.children, logger);
    p.content.children = fixTheLinks(p.content.children, logger);

    // extract committers info and last modified based on commits history
    if (secrets.REPO_API_ROOT) {
      p.content.commits =
        await fetchCommitsHistory(
          secrets.REPO_API_ROOT,
          actionReq.params.owner,
          actionReq.params.repo,
          actionReq.params.ref,
          actionReq.params.path,
          logger,
        );
      p.content.committers = extractCommittersFromCommitsHistory(p.content.commits, logger);
      p.content.lastModified = extractLastModifiedFromCommitsHistory(p.content.commits, logger);
    } else {
      logger.debug('html-pre.js - No REPO_API_ROOT provided');
    }

    // fetch and inject the nav
    if (secrets.REPO_RAW_ROOT) {
      // TODO find a better way or implement one
      const isDev = action.request.headers.host ? action.request.headers.host.indexOf('localhost') != -1 : false;

      p.content.nav =
        computeNavPath(
          isDev,
          logger,
        );
    } else {
      logger.debug('html-pre.js - No REPO_RAW_ROOT provided');
    }

    return p;
  } catch (e) {
    logger.error(`Error while executing html.pre.js: ${e.stack || e}`);
    return {
      error: e,
    };
  }
}

module.exports.pre = pre;

// exports for testing purpose only
module.exports.removeFirstTitle = removeFirstTitle;
module.exports.fetchCommitsHistory = fetchCommitsHistory;
module.exports.extractCommittersFromCommitsHistory = extractCommittersFromCommitsHistory;
module.exports.extractLastModifiedFromCommitsHistory = extractLastModifiedFromCommitsHistory;
module.exports.computeNavPath = computeNavPath;