/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.auto-confirm@myokoym.net.';
var { prefs } = Components.utils.import('resource://auto-confirm-resources/modules/lib/prefs.js', {});

var gRules;

function initGeneral() {
  gRules = document.getElementById('rules');
  buildRulesList();
}

function buildRulesList() {
  var commonDialogRules = prefs.getChildren(BASE + 'common');
  var generalRules = prefs.getChildren(BASE + 'general');

  var allRules = commonDialogRules.concat(generalRules);
  var basePartMatcher = new RegExp('^' + BASE + '(common|general)\\.');
  allRules.sort(function(aA, aB) {
    aA = aA.replace(basePartMatcher, '');
    aB = aB.replace(basePartMatcher, '');
    return aA < aB ?  -1 :
           aA == aB ? 0 :
                      1;
  });

  var fragment = document.createDocumentFragment();
  for (let base of allRules) {
    let name = decodeURIComponent(base.replace(basePartMatcher, ''));
    let group = RegExp.$1;

    let item = document.createElement('listitem');
    let cell = document.createElement('listcell');
    cell.setAttribute('label', name);

    // common properties
    item.setAttribute('data-name', name);
    item.setAttribute('data-group', group);
    item.setAttribute('data-title', prefs.getPref(base + '.title') || '');
    item.setAttribute('data-text', prefs.getPref(base + '.text') || '');
    item.setAttribute('data-action', prefs.getPref(base + '.action') || '');
    item.setAttribute('data-actions', prefs.getPref(base + '.actions') || '');

    // commonDialog rule specific properties
    item.setAttribute('data-type', prefs.getPref(base + '.type') || '');

    // general rule specific properties
    item.setAttribute('data-url', prefs.getPref(base + '.url') || '');

    item.appendChild(cell);
    fragment.appendChild(item);
  }
  gRules.appendChild(fragment);
}

function shutdown() {
  Components.utils.unload('resource://auto-confirm-resources/modules/lib/prefs.js');
}
