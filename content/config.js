/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.auto-confirm@myokoym.net.';
var { prefs } = Components.utils.import('resource://auto-confirm-resources/modules/lib/prefs.js', {});
var { log } = Components.utils.import('resource://auto-confirm-resources/modules/log.js', {});

var gRules;

var gMessages;
var gRulesList;

function initGeneral() {
  gMessages = document.getElementById('messages');
  gRulesList = document.getElementById('rules');
  gRules = loadRules();
  buildRulesList();
  prefs.setPref(BASE + 'editing', true);
}

function loadRules() {
  var commonDialogRules = prefs.getChildren(BASE + 'common');
  var generalRules = prefs.getChildren(BASE + 'general');

  var allRules = commonDialogRules.concat(generalRules);
  var basePartMatcher = new RegExp('^' + BASE + '(common|general)\\.');
  return allRules.map(function(aBase) {
    let name = decodeURIComponent(aBase.replace(basePartMatcher, ''));
    let group = RegExp.$1;
    return {
      // common properties
      name:    name,
      group:   group,
      title:   prefs.getPref(aBase + '.title') || '',
      text:    prefs.getPref(aBase + '.text') || '',
      action:  prefs.getPref(aBase + '.action') || '',
      actions: prefs.getPref(aBase + '.actions') || '',
      // commonDialog rule specific properties
      type:    prefs.getPref(aBase + '.type') || '',
      // general rule specific properties
      url:     prefs.getPref(aBase + '.url') || ''
    };
  });
}

function buildRulesList() {
  var lastSelectedRule;
  if (gRulesList.selectedCount > 0) {
    lastSelectedRule = gRulesList.selectedItem.rule;
  }

  var range = document.createRange();
  range.selectNodeContents(gRulesList);
  range.setEndBefore(gRulesList.lastChild);
  range.deleteContents();

  gRules.sort(function(aA, aB) {
    return aA.name < aB.name ?  -1 :
           aA.name === aB.name ? 0 :
                      1;
  });

  var itemToBeSelected;
  var fragment = document.createDocumentFragment();
  for (let rule of gRules) {
    let item = document.createElement('richlistitem');
    item.setAttribute('orient', 'horizontal');
    item.setAttribute('align', 'center');
    item.rule = rule;

    Object.keys(rule).forEach(function(aKey) {
      item.setAttribute('data-' + aKey, rule[aKey]);
    });

    let label = document.createElement('label');
    label.setAttribute('value', rule.name);
    label.setAttribute('tooltiptext', rule.name);
    label.setAttribute('flex', 1);
    item.appendChild(label);

    let editButton = document.createElement('button');
    editButton.setAttribute('label', gMessages.getString('config.rule.item.controls.edit.label'));
    editButton.setAttribute('tooltiptext', gMessages.getString('config.rule.item.controls.edit.tooltip'));
    editButton.setAttribute('style', 'min-width:0');
    editButton.setAttribute('oncommand', 'editRule(this.parentNode.rule)');

    let deleteButton = document.createElement('button');
    deleteButton.setAttribute('label', gMessages.getString('config.rule.item.controls.delete.label'));
    deleteButton.setAttribute('tooltiptext', gMessages.getString('config.rule.item.controls.delete.tooltip'));
    deleteButton.setAttribute('style', 'min-width:0');
    deleteButton.setAttribute('oncommand', 'deleteRule(this.parentNode.rule)');

    item.appendChild(editButton);
    item.appendChild(deleteButton);

    fragment.appendChild(item);

    if (lastSelectedRule &&
        rule === lastSelectedRule) {
      itemToBeSelected = item;
    }
  }
  range.insertNode(fragment);
  range.detach();

  if (itemToBeSelected) {
    gRulesList.selectedItem = itemToBeSelected;
  }
}

function onRuleDoubleClick() {
  if (gRulesList.selectedItem && gRulesList.selectedItem.rule)
    editRule(gRulesList.selectedItem.rule);
}

function addNewRule() {
  var rule = {};
  gRules.push(rule);
  var saved = editRule(rule);
  if (!saved)
    gRules.splice(gRules.indexOf(rule), 1);
}

function editRule(aRule) {
  window.openDialog('chrome://auto-confirm/content/edit.xul',
                    'auto-confirm-config-edit',
                    'resizable,chrome,modal,titlebar,centerscreen',
                    aRule);
  if (aRule.changed) {
    saveRules();
    buildRulesList();
    return true;
  }
  return false;
}

function deleteRule(aRule) {
  var index = gRules.indexOf(aRule);
  if (index < 0)
    return;
  gRules.splice(index, 1);
  saveRules();
  buildRulesList();
}

function saveRules() {
  for (let key of prefs.getDescendant(BASE + 'common.')) {
    prefs.clearPref(key);
  }
  for (let key of prefs.getDescendant(BASE + 'general.')) {
    prefs.clearPref(key);
  }
  gRules.forEach(function(aRule) {
    var base = BASE + aRule.group + '.' + encodeURIComponent(aRule.name) + '.';
    Object.keys(aRule).forEach(function(aProperty) {
      if (aProperty === 'name' ||
          aProperty === 'group')
        return;
      prefs.setPref(base + aProperty, String(aRule[aProperty]))
    });
  });
}

function isRuleDuplicated(aName, aRule) {
  var items = document.querySelectorAll('richlistitem[data-name=' + JSON.stringify(aName) + ']');
  if (items.length === 0)
    return false;
  return Array.some(items, function(aItem) {
    return aItem.rule !== aRule;
  });
}

function shutdown() {
  prefs.setPref(BASE + 'editing', false);
  Components.utils.unload('resource://auto-confirm-resources/modules/lib/prefs.js');
  Components.utils.unload('resource://auto-confirm-resources/modules/log.js');
}
