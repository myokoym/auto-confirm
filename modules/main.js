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
    processAction(aWindow, action);
  }
  if (!matched)
    log("no match");
}

function processAction(aWindow, aAction)
{
  var doc = aWindow.document;
  log("action: " + aAction);
  switch (aAction) {
  case 'accept':
    doc.documentElement.acceptDialog();
    log("accept");
    return;
  case 'cancel':
    doc.documentElement.cancelDialog();
    log("cancel");
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
