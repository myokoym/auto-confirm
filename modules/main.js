/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.auto-confirm@myokoym.net.';
var prefs = require('lib/prefs').prefs;
{
  if (prefs.getDefaultPref(BASE + 'debug') === null)
    prefs.setDefaultPref(BASE + 'debug', false);
  // For development
  if (prefs.getPref(BASE + 'debug')) {
    prefs.setDefaultPref(BASE + 'common.debug-confirm-cancel.action', 'cancel');
    prefs.setDefaultPref(BASE + 'common.debug-confirm-cancel.text', 'auto-confirm');
    prefs.setDefaultPref(BASE + 'common.debug-confirm-cancel.type', 'confirm');
    prefs.setDefaultPref(BASE + 'common.debug-confirm-ok.action', 'accept');
    prefs.setDefaultPref(BASE + 'common.debug-confirm-ok.text', 'auto-ok');
    prefs.setDefaultPref(BASE + 'common.debug-confirm-ok.type', 'confirm');
    prefs.setDefaultPref(BASE + 'common.debug-prompt.actions', '["input;auto-confirm","accept"]');
    prefs.setDefaultPref(BASE + 'common.debug-prompt.text', 'auto-input');
    prefs.setDefaultPref(BASE + 'common.debug-prompt.type', 'prompt');
    prefs.setDefaultPref(BASE + 'common.debug-alert.action', 'accept');
    prefs.setDefaultPref(BASE + 'common.debug-alert.text', 'auto-alert');
    prefs.setDefaultPref(BASE + 'common.debug-alert.type', 'alert');
    prefs.setDefaultPref(BASE + 'common.debug-check.actions', '["check","accept"]');
    prefs.setDefaultPref(BASE + 'common.debug-check.text', 'auto-check');
    prefs.setDefaultPref(BASE + 'common.debug-check.type', 'prompt');
    prefs.setDefaultPref(BASE + 'common.debug-confirmEx.action', 'push;auto');
    prefs.setDefaultPref(BASE + 'common.debug-confirmEx.text', 'auto-confirmEx');
    prefs.setDefaultPref(BASE + 'common.debug-confirmEx.type', 'confirmEx');
  }
}

function log(message) {
  if (prefs.getPref(BASE + 'debug')) {
    console.log("auto-confirm: " + message);
  }
}

load('lib/WindowManager');

var global = this;
function handleWindow(aWindow)
{
  log("handleWindow");
  var doc = aWindow.document;
  if (doc.documentElement.localName === 'dialog' &&
      doc.documentElement.id === 'commonDialog') {
    handleCommonDialog(aWindow);
    return;
  }

}

function handleCommonDialog(aWindow)
{
  var doc = aWindow.document;
  var args = aWindow.args;
  log("args: " + JSON.stringify(args));
  var configs = prefs.getChildren(BASE + 'common');
  log("commonDialog: " + configs);
  var matched = false;
  for (let config of configs) {
    let typeMatcher = prefs.getPref(config + '.type');
    if (typeMatcher !== args.promptType)
      continue;
    let textMatcher = prefs.getPref(config + '.text');
    if (textMatcher && !args.text.match(textMatcher))
      continue;
    let titleMatcher = prefs.getPref(config + '.title');
    if (titleMatcher && !args.title.match(titleMatcher))
      continue;

    matched = true;
    log("config: " + config);
    let action = prefs.getPref(config + '.action');
    if (action)
      processAction(aWindow, action);
    let actions = prefs.getPref(config + '.actions');
    if (actions)
      processActions(aWindow, actions);
  }
  if (!matched)
    log("no match");
}

function processActions(aWindow, aActions)
{
  var doc = aWindow.document;
  log("actions: " + aActions);
  for (let action of JSON.parse(aActions)) {
    log("action: " + action);
    processAction(aWindow, action);
  }
}

function processAction(aWindow, aAction)
{
  var doc = aWindow.document;
  log("action: " + aAction);
  var actions = aAction.match(/^([^;]+);?(.*)/);
  if (actions === null)
    return;
  var action = actions[1];
  var value = actions[2];
  switch (action) {
  case 'accept':
    doc.documentElement.acceptDialog();
    log("accept");
    return;
  case 'cancel':
    doc.documentElement.cancelDialog();
    log("cancel");
    return;
  case 'push':
    var buttons = doc.documentElement._buttons;
    for (let dlgtype in buttons) {
      var button = buttons[dlgtype];
      log("label: " + button.label);
      if (button.label.match(value)) {
        button.click();
        log("push");
        return;
      }
    }
    log("push: no match");
    return;
  case 'input':
    doc.getElementById("loginTextbox").value = value;
    log("input");
    return;
  case 'check':
    doc.getElementById("checkbox").checked = true;
    aWindow.args.checked = true;
    log("check");
    return;
  case 'uncheck':
    doc.getElementById("checkbox").checked = false;
    aWindow.args.checked = false;
    log("uncheck");
    return;
  default:
    log("no action");
    return;
  }
}

WindowManager.addHandler(handleWindow);

function shutdown()
{
  WindowManager = undefined;
  global = undefined;
}
