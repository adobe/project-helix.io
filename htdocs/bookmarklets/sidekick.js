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
/* global window, document, HTMLElement */

'use strict';

(() => {
  /**
   * A sidekick with helper tools for authors.
   */
  class Sidekick {
    /**
     * Creates a new sidekick.
     * @param {object} cfg The configuration options
     */
    constructor(cfg) {
      this._initConfig(cfg);
      this.root = Sidekick.appendTag(document.body, {
        tag: 'div',
        attrs: {
          class: 'hlx-sidekick hidden',
        },
      });
      this.location = Sidekick.getLocation();
      this.loadCSS();
      if (this.config.plugins && Array.isArray(this.config.plugins)) {
        this.config.plugins.forEach((plugin) => this.add(plugin));
      }
      this._loadCustomPlugins();
    }

    /**
     * Initializes the configuration.
     * @private
     * @param {object} cfg The configuration options
     */
    _initConfig(cfg = {}) {
      const prefix = (cfg && cfg.owner && cfg.repo)
        ? `${cfg.ref ? `${cfg.ref}--` : ''}${cfg.repo}--${cfg.owner}`
        : null;
      this.config = {
        ...cfg,
        innerHost: prefix ? `${prefix}.hlx.page` : null,
        outerHost: prefix ? `${prefix}.hlx.live` : null,
        project: cfg.project || 'your Helix Pages project',
      };
    }

    /**
     * Creates a tag.
     * @private
     * @static
     * @param {object} elem The tag configuration object
     *   with the following properties:
     *   - {string} tag    The tag name (mandatory)
     *   - {string} text   The text content (optional)
     *   - {object} attrs  The attributes (optional)
     *   - {object} lstnrs The event listeners (optional)
     * @returns {HTMLElement} The new tag
     */
    static createTag(elem) {
      if (typeof elem.tag !== 'string') {
        return null;
      }
      const el = document.createElement(elem.tag);
      if (typeof elem.attrs === 'object') {
        for (const [key, value] of Object.entries(elem.attrs)) {
          el.setAttribute(key, value);
        }
      }
      if (typeof elem.lstnrs === 'object') {
        for (const [name, fn] of Object.entries(elem.lstnrs)) {
          if (typeof fn === 'function') {
            el.addEventListener(name, fn);
          }
        }
      }
      if (typeof elem.text === 'string') {
        el.textContent = elem.text;
      }
      return el;
    }

    /**
     * Creates a tag with the given name, attributes and listeners,
     * and appends it to the parent element.
     * @private
     * @static
     * @param {HTMLElement} parent The parent element
     * @param {object}      elem   The tag configuration object
     *   with the following properties:
     *   - {string} tag    The tag name (mandatory)
     *   - {string} text   The text content (optional)
     *   - {object} attrs  The attributes (optional)
     *   - {object} lstnrs The event listeners (optional)
     * @returns {HTMLElement} The new tag
     */
    static appendTag(parent, elem) {
      return parent.appendChild(Sidekick.createTag(elem));
    }

    /**
     * Returns the location of the current document.
     * @private
     * @static
     * @returns {Location} The location object
     */
    static getLocation() {
      // first check if there is a test location
      const $test = document.getElementById('sidekick_test_location');
      if ($test) {
        try {
          return new URL($test.value);
        } catch (e) {
          return null;
        }
      }
      // fall back to window location
      return window.location;
    }

    /**
     * Loads custom plugins from the current Helix site.
     * @private
     */
    _loadCustomPlugins() {
      if (!(this.isHelix() || this.isEditor()) || !this.config.innerHost) {
        return;
      }
      Sidekick.appendTag(document.head, {
        tag: 'script',
        attrs: {
          src: `https://${this.config.innerHost}/tools/sidekick/plugins.js`,
        },
      });
    }

    /**
     * Shows/hides the sidekick.
     * @returns {object} The sidekick
     */
    toggle() {
      this.root.classList.toggle('hidden');
      return this;
    }

    /**
     * Adds a plugin to the sidekick.
     * @param {object|string|function|HTMLElement} plugin The plugin, e.g.:
     *   - A {string} or {HTMLElement}
     *   - A {function} that returns a plugin object when called with the sidekick as argument
     *   - An {object} with the following properties:
     *     - {string} id          The plugin ID (mandatory)
     *     - {object} button      A button configuration object (optional)
     *       - {string}   text    The button text
     *       - {function} action  The click listener
     *     - {array} elements An array of tag configuration objects (optional)
     *       A tag configuration object can have the following properties:
     *       - {string} tag    The tag name (mandatory)
     *       - {string} text   The text content (optional)
     *       - {object} attrs  The attributes (optional)
     *       - {object} lstnrs The event listeners (optional)
     *     - {function} condition A function determining whether to show this plugin (optional)
     *       This function is expected to return a boolean when called with the sidekick as argument
     *     - {function} callback  A function called after adding the plugin (optional)
     *       This function is called with the sidekick and the newly added plugin as arguments
     * @returns {HTMLElement} The plugin
     */
    add(plugin) {
      if (plugin instanceof HTMLElement) {
        this.root.appendChild(plugin);
      } else if (typeof plugin === 'string') {
        this.root.innerHTML += plugin;
      } else if (typeof plugin === 'function') {
        this.add(plugin(this));
      } else if (typeof plugin === 'object') {
        if (typeof plugin.condition === 'function' && !plugin.condition(this)) {
          return null;
        }
        const $plugin = Sidekick.appendTag(this.root, {
          tag: 'div',
          attrs: {
            class: plugin.id,
          },
        });
        if (Array.isArray(plugin.elements)) {
          plugin.elements.forEach((elem) => Sidekick.appendTag($plugin, elem));
        }
        if (plugin.button) {
          Sidekick.appendTag($plugin, {
            tag: 'button',
            text: plugin.button.text,
            lstnrs: {
              click: plugin.button.action,
            },
          });
        }
        if (typeof plugin.callback === 'function') {
          plugin.callback(this, $plugin);
        }
      }
      return this.get(plugin.name);
    }

    /**
     * Returns the sidekick plugin with the specified ID.
     * @param {string} id The plugin ID
     * @returns {HTMLElement} The plugin
     */
    get(id) {
      return this.root.querySelector(`.${id}`);
    }

    /**
     * Removes the plugin with the specified ID from the sidekick.
     * @param {string} id The plugin ID
     * @returns {object} The sidekick
     */
    remove(id) {
      const $plugin = this.get(id);
      if ($plugin) {
        $plugin.remove();
      }
      return this;
    }

    /**
     * Checks if the current location is an editor URL (SharePoint or Google Docs).
     * @returns {boolean} true if editor URL, else false
     */
    isEditor() {
      return /.*\.sharepoint\.com/.test(this.location.host)
        || this.location.host === 'docs.google.com';
    }

    /**
     * Checks if the current location is a configured Helix URL.
     * @returns {boolean} true if Helix URL, else false
     */
    isHelix() {
      const { config, location } = this;
      return [
        'localhost:3000', // for local testing
        config.host,
        config.outerHost,
        config.innerHost,
      ].includes(location.host);
    }

    /**
     * Displays a non-sticky notification.
     * @param {string} msg The message to display
     * @param {number} level error (0), warning (1), of info (2) (default)
     */
    notify(msg, level) {
      this.showModal(msg, false, level);
    }

    /**
     * Displays a modal notification.
     * @param {string} msg The message to display
     * @param {boolean} sticky True if message should be sticky, else false (default)
     * @param {number} level error (0), warning (1), of info (2) (default)
     * @returns {object} The sidekick
     */
    showModal(msg, sticky, level = 2) {
      if (!this._modal) {
        const $spinnerWrap = Sidekick.appendTag(document.body, {
          tag: 'div',
          attrs: {
            class: 'hlx-sidekick-overlay',
          },
        });
        this._modal = Sidekick.appendTag($spinnerWrap, { tag: 'div' });
      } else {
        this._modal.parentNode.classList.remove('hidden');
      }
      if (msg) {
        this._modal.innerHTML = msg;
        this._modal.className = `modal${level < 2 ? ` level-${level}` : ''}`;
      }
      if (!sticky) {
        const sk = this;
        window.setTimeout(() => {
          sk.hideModal();
        }, 3000);
      } else {
        this._modal.classList.add('wait');
      }
      return this;
    }

    /**
     * Hides the modal if shown.
     * @returns {object} The sidekick
     */
    hideModal() {
      if (this._modal) {
        this._modal.innerHTML = '';
        this._modal.className = '';
        this._modal.parentNode.classList.add('hidden');
      }
      return this;
    }

    /**
     * Loads the specified default CSS file, or a sibling of the
     * current JS or HTML file. E.g. when called without argument from
     * /foo/bar.js, it will attempt to load /foo/bar.css.
     * @param {string} path The path to the CSS file (optional)
     * @returns {object} The sidekick
     */
    loadCSS(path) {
      let href = path;
      if (!href) {
        const scripts = document.getElementsByTagName('script');
        const lastScript = scripts[scripts.length - 1];
        if (lastScript.src) {
          href = lastScript.src.replace('.js', '.css');
        } else {
          const filePath = this.location.pathname;
          href = `${filePath.substring(filePath.lastIndexOf('/') + 1).split('.')[0]}.css`;
        }
      }
      Sidekick.appendTag(document.head, {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href,
        },
      });
      return this;
    }
  }

  // launch sidekick
  if (!window.sidekick) {
    window.sidekick = new Sidekick(window.sidekickConfig).toggle();
  }
})();
