/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var gRule;
var gMessages;
var gActions;

function init() {
  gRule = window.arguments[0] || {};
  if (gRule.name) {
    let title = document.documentElement.getAttribute('title-template');
    document.title = title.replace(/%s/i, gRule.name);
  }

  gMessages = document.getElementById('messages');
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

function captureActualOperation(aAction) {
  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                          .getService(Components.interfaces.nsIPromptService);
  var type = document.getElementById('type-field');
  console.log(type.value);
  var title = gMessages.getString('config.edit.capture.dialog.title');
  var description = gMessages.getString('config.edit.capture.dialog.description');
  var checkboxLabel = gMessages.getString('config.edit.capture.dialog.checkbox');
  var checked = {value: false};
  var inputMessage = {value: ''};
  var buttonLabels = [];
  buttonLabels[0] = gMessages.getString('config.edit.capture.dialog.button.0');
  buttonLabels[1] = gMessages.getString('config.edit.capture.dialog.button.1');
  buttonLabels[2] = gMessages.getString('config.edit.capture.dialog.button.2');

  switch (type.value) {
  case 'alert':
    prompts.alertCheck(window,
                       title,
                       description,
                       checkboxLabel,
                       checked);
    if (checked.value) {
      actionAdd('check');
    }
    actionAdd('accept');
    break;
  case 'confirm':
    var result = prompts.confirmCheck(window,
                                      title,
                                      description,
                                      checkboxLabel,
                                      checked);
    console.log(result);
    if (checked.value) {
      actionAdd('check');
    }
    if (result) {
      actionAdd('accept');
    } else {
      actionAdd('cancel');
    }
    break;
  case 'confirmEx':
    var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;
    var pressedButtonIndex = prompts.confirmEx(window,
                                               title,
                                               description,
                                               flags,
                                               buttonLabels[0],
                                               buttonLabels[1],
                                               buttonLabels[2],
                                               null,
                                               checked);
    console.log(pressedButtonIndex);
    if (checked.value) {
      actionAdd('check');
    }
    actionAdd('push;' + buttonLabels[pressedButtonIndex]);
    break;
  case 'prompt':
    var result = prompts.prompt(window,
                                title,
                                description,
                                inputMessage,
                                checkboxLabel,
                                checked);
    console.log(result);
    if (inputMessage.value) {
      actionAdd('input;' + inputMessage.value);
    }
    if (checked.value) {
      actionAdd('check');
    }
    if (result) {
      actionAdd('accept');
    } else {
      actionAdd('cancel');
    }
    break;
  case 'select':
    // TODO
    //select();
    break;
  }
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
  gActions.insertBefore(aItem, aItem.nextSibling.nextSibling);
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
