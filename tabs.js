
(function () {
  'use strict';

  // Feature detection: without these, keep the no-JS fallback (all panels visible).
  if (!document.querySelector || !('classList' in document.documentElement)) {
    document.documentElement.className = document.documentElement.className.replace('js', 'no-js');
    return;
  }

  function Tabs(root) {
    if (!root) { throw new Error('Tabs: root element is required'); }
    this.root = root;
    this.list = root.querySelector('[role="tablist"]');
    this.tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!this.list || this.tabs.length === 0) {
      throw new Error('Tabs: markup needs a [role="tablist"] containing [role="tab"] buttons');
    }
    this.vertical = root.getAttribute('data-orientation') === 'vertical';
    this.useHash = root.hasAttribute('data-hash');
    this.list.setAttribute('aria-orientation', this.vertical ? 'vertical' : 'horizontal');

    // Map each tab to its panel through aria-controls; fail loudly if broken.
    this.panels = this.tabs.map(function (tab) {
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (!panel) { throw new Error('Tabs: no panel found for #' + tab.id); }
      return panel;
    });

    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onHash = this._onHash.bind(this);
    this.list.addEventListener('click', this._onClick);   // event delegation: one listener
    this.list.addEventListener('keydown', this._onKeydown);
    if (this.useHash) { window.addEventListener('hashchange', this._onHash); }

    // Starting tab: URL hash > data-default-index > first enabled tab.
    var start = this._indexFromHash();
    if (start === -1) {
      var d = parseInt(root.getAttribute('data-default-index'), 10);
      start = isNaN(d) ? this._nextEnabled(-1, 1) : d;
    }
    this.select(start, { focus: false, updateHash: false });
  }

  Tabs.prototype._isDisabled = function (i) {
    return this.tabs[i].getAttribute('aria-disabled') === 'true';
  };

  /** Find the next enabled index from `from` in direction `step` (+1/-1), wrapping. */
  Tabs.prototype._nextEnabled = function (from, step) {
    var n = this.tabs.length;
    for (var k = 1; k <= n; k++) {
      var i = (from + step * k + n * k) % n;
      if (!this._isDisabled(i)) { return i; }
    }
    return 0;
  };

  Tabs.prototype._indexFromHash = function () {
    if (!this.useHash || !window.location.hash) { return -1; }
    var id = window.location.hash.slice(1);
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].id === id && !this._isDisabled(i)) { return i; }
    }
    return -1;
  };

  /** Activate tab at index. opts: { focus: true, updateHash: true } */
  Tabs.prototype.select = function (index, opts) {
    opts = opts || {};
    if (index < 0 || index >= this.tabs.length || this._isDisabled(index)) { return; }
    var self = this;
    this.tabs.forEach(function (tab, i) {
      var active = i === index, panel = self.panels[i];
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');   // roving tabindex
      if (active) {
        panel.hidden = false;
        panel.classList.add('tabs__panel--enter');
        var done = function () { panel.classList.remove('tabs__panel--enter'); };
        panel.addEventListener('animationend', done, { once: true });
        setTimeout(done, 400);                              // fallback if animationend never fires
      } else {
        panel.hidden = true;
        panel.classList.remove('tabs__panel--enter');
      }
    });
    if (opts.focus !== false) { this.tabs[index].focus(); }
    if (this.useHash && opts.updateHash !== false && window.history && history.replaceState) {
      history.replaceState(null, '', '#' + this.tabs[index].id);  // no extra history entries
    }
    this.root.dispatchEvent(new CustomEvent('tabs:change', {
      bubbles: true, detail: { index: index, tab: this.tabs[index], panel: this.panels[index] }
    }));
  };

  Tabs.prototype._onClick = function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab) { this.select(this.tabs.indexOf(tab)); }
  };

  Tabs.prototype._onKeydown = function (e) {
    var i = this.tabs.indexOf(document.activeElement), next;
    if (i === -1) { return; }
    var prevKey = this.vertical ? 'ArrowUp' : 'ArrowLeft';
    var nextKey = this.vertical ? 'ArrowDown' : 'ArrowRight';
    if (e.key === nextKey) { next = this._nextEnabled(i, 1); }
    else if (e.key === prevKey) { next = this._nextEnabled(i, -1); }
    else if (e.key === 'Home') { next = this._nextEnabled(-1, 1); }
    else if (e.key === 'End') { next = this._nextEnabled(this.tabs.length, -1); }
    else { return; }                                        // ignore other keys
    e.preventDefault();                                     // stop page scrolling
    this.select(next);
  };

  Tabs.prototype._onHash = function () {
    var i = this._indexFromHash();
    if (i !== -1) { this.select(i, { focus: false, updateHash: false }); }
  };

  /** Remove listeners (useful in single-page apps). */
  Tabs.prototype.destroy = function () {
    this.list.removeEventListener('click', this._onClick);
    this.list.removeEventListener('keydown', this._onKeydown);
    window.removeEventListener('hashchange', this._onHash);
  };

  // One broken instance must not break the others.
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (el) {
      try { el.tabsInstance = new Tabs(el); }
      catch (err) { console.error(err.message); el.classList.add('tabs--error'); }
    });
  }
  window.Tabs = Tabs;
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
