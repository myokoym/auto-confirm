/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var gRule;
var gActions;

function init() {
  gRule = window.arguments[0] || {};
  if (gRule.name) {
    let title = document.documentElement.getAttribute('title-template');
    document.title = title.replace(/%s/i, gRule.name);
  }

  gActions = document.getElementById('actions');

  Object.keys(gRule).forEach(function(aKey) {
    var value = gRule[aKey];
    var field = document.getElementById(aKey + '-field');
    if (field && value)
      field.value = value;
  });

  var actions = [];
  if (gRule.actions) {
    actions = JSON.parse(gRule.actions);
  } else if (gRule.action) {
    actions = [gRule.action];
  }

  actions.forEach(actionAdd);

  onGroupChanged();
  validateName();
}

function validateName() {
  var nameField = document.getElementById('name-field');
  var name = nameField.value;
  var accept = document.documentElement.getButton('accept');
  if (window.opener.isRuleDuplicated(name, gRule)) {
    accept.setAttribute('disabled', true);
    document.documentElement.setAttribute('validation-errors', 'duplicated-name');
    return false;
  } else if (name.trim() === '') {
    accept.setAttribute('disabled', true);
    document.documentElement.setAttribute('validation-errors', 'blank-name');
    return false;
  } else {
    accept.removeAttribute('disabled');
    document.documentElement.removeAttribute('validation-errors');
    return true;
  }
}

function onGroupChanged() {
  var group = document.getElementById('group-field').value;
  document.documentElement.setAttribute('group-type', group);
}

function actionAdd(aAction) {
  var template = document.getElementById('action-item-template');
  var item = template.cloneNode(true);
  item.removeAttribute('id');
  gActions.insertBefore(item, gActions.lastChild);

  aAction = aAction || '';
  var matched = aAction.match(/^([^;]+)(?:;(.*)$)?/);
  if (!matched)
    return;

  var name = matched[1];
  var params = matched[2];
  if (name)
    item.querySelector('.action-name-field').value = name;
  if (params)
    item.querySelector('.action-params-field').value = params;
}

function actionUp(aItem) {
  if (aItem == gActions.firstChild)
    return;
  gActions.insertBefore(aItem, aItem.previousSibling);
}

function actionDown(aItem) {
  if (aItem.nextSibling == gActions.lastChild)
    return;
  gActions.insertBefore(aItem, aItem.nextSibling);
}

function actionDelete(aItem) {
  gActions.removeChild(aItem);
}

function serializeAction(aItem) {
  var nameField = aItem.querySelector('.action-name-field');
  var paramsField = aItem.querySelector('.action-params-field');
  if (paramsField.clientWidth > 0 &&
      paramsField.clientHeight > 0 &&
      paramsField.value) {
    return nameField.value + ';' + paramsField.value;
  } else {
    return nameField.value;
  }
}

function onAccept() {
  ['name',
   'group',
   'type',
   'url',
   'title',
   'text'].forEach(function(aProperty) {
    gRule[aProperty] = document.getElementById(aProperty + '-field').value;
  });
  switch (gRule.group) {
  case 'common':
    gRule.url = '';
    break;
  case 'general':
    gRule.type = '';
    break;
  }

  var actions = document.querySelectorAll('#actions richlistitem.action');
  if (actions.length === 0) {
    gRule.actions = gRule.action = '';
  } else if (actions.length == 1) {
    gRule.actions = '';
    gRule.action = serializeAction(actions[0]);
  } else {
    gRule.action = '';
    gRule.actions = JSON.stringify(Array.map(actions, serializeAction));
  }

  gRule.changed = true;

  return true;
}
