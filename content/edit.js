/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var gRule;
var gActions;

function init() {
  gRule = window.arguments[0] || {};

  gActions = document.getElementById('actions');

  Object.keys(gRule).forEach(function(aKey) {
    var value = gRule[aKey];
    var field = document.getElementById(aKey + '-field');
    if (field)
      field.value = value;
  });

  var actions = [];
  if (gRule.actions)
    actions = JSON.parse(gRule.actions);
  else if (gRule.action)
    actions = [gRule.action];

  actions.forEach(actionAdd);

  onGroupChanged();
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
  gActions.isnertBefore(aItem, aItem.previousSibling);
}

function actionDown(aItem) {
  if (aItem.nextSibling == gActions.lastChild)
    return;
  gActions.isnertBefore(aItem, aItem.nextSibling);
}

function actionDelete(aItem) {
  gActions.removeChild(aItem);
}

function onAccept() {
  return true;
}
