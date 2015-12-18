/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.auto-confirm@myokoym.net.';
var { prefs } = Components.utils.import('resource://auto-confirm-resources/modules/lib/prefs.js', {});

var gRules;

var gMessages;
var gRulesList;

function initGeneral() {
  gMessages = document.getElementById('messages');
  gRulesList = document.getElementById('rules');
  gRules = loadRules();
  buildRulesList();
}

function loadRules() {
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
  range.deleteContents();
  range.detach();

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
    editButton.setAttribute('oncommand', 'edit(this.parentNode.rule)');

    let deleteButton = document.createElement('button');
    deleteButton.setAttribute('label', gMessages.getString('config.rule.item.controls.delete.label'));
    deleteButton.setAttribute('tooltiptext', gMessages.getString('config.rule.item.controls.delete.tooltip'));
    deleteButton.setAttribute('style', 'min-width:0');

    item.appendChild(editButton);
    item.appendChild(deleteButton);

    fragment.appendChild(item);

    if (lastSelectedRule &&
        rule === lastSelectedRule) {
      itemToBeSelected = item;
    }
  }
  gRulesList.appendChild(fragment);

  if (itemToBeSelected) {
    gRulesList.selectedItem = itemToBeSelected;
  }
}

function edit(aRule) {
  console.log(aRule);
  window.openDialog('chrome://auto-confirm/content/edit.xul',
                    'auto-confirm-config-edit',
                    'resizable,chrome,modal,titlebar,centerscreen',
                    aRule);
  if (aRule.changed) {
    console.log(aRule);
    buildRulesList();
  }
}

function shutdown() {
  Components.utils.unload('resource://auto-confirm-resources/modules/lib/prefs.js');
}
