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
}

function log(message) {
  if (prefs.getPref(BASE + 'debug')) {
    console.log("auto-confirm: " + message);
  }
}

var generalUrls = [];
var generalConfigs = [];
var configs = prefs.getChildren(BASE + 'general');
for (let config of configs) {
  log(config);
  let url = prefs.getPref(config + '.url');
  generalUrls.push(url);
  generalConfigs.push({
    text:    prefs.getPref(config + '.text'),
    title:   prefs.getPref(config + '.title'),
    action:  prefs.getPref(config + '.action'),
    actions: prefs.getPref(config + '.actions')
  });
}

load('lib/WindowManager');

var global = this;
function handleWindow(aWindow)
{
  log("handleWindow");
  var doc = aWindow.document;
  if (doc.documentElement.localName === 'dialog' &&
      doc.documentElement.id === 'commonDialog') {
    log("commonDialog");
    handleCommonDialog(aWindow);
    return;
  } else {
    log("generalWindow");
    aWindow.addEventListener('load', function onload() {
      aWindow.removeEventListener('load', onload);
      handleGeneralWindow(aWindow);
    });
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

function handleGeneralWindow(aWindow)
{
  var doc = aWindow.document;
  var url = aWindow.location.href;
  log("url: " + url);
  var fromIndex = 0;
  while (true) {
    log("fromIndex: " + fromIndex);
    let index = generalUrls.indexOf(url, fromIndex);
    log("index: " + index);
    if (index === -1)
      return;
    let config = generalConfigs[index];
    log("config: " + config);
    if (matchedWindow(aWindow, config)) {
      aWindow.setTimeout(function() {
        let action = config.action;
        if (action)
          processAction(aWindow, action);
        let actions = config.actions;
        if (actions)
          processActions(aWindow, actions);
      }, 0);
      return;
    }
    fromIndex = index + 1;
  }
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
  case 'click':
    log("click");
    {
      let element = findVisibleElementByLabel(aWindow, value);
      log(element);
      if (typeof element.click === "function") {
        log("element.click(): ready");
        element.click();
        log("element.click(): done");
      } else {
        log("element is not clickable");
        Cu.reportError(new Error("found element is not clickable."));
      }
    }
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
    log("check");
    if (value) {
      let element = findVisibleElementByLabel(aWindow, value);
      log("  element: " + element);
      log("  element.checked: ready");
      element.checked = true;
      log("  element.checked: done");
    } else {
      // For commonDialog
      doc.getElementById("checkbox").checked = true;
      aWindow.args.checked = true;
    }
    return;
  case 'uncheck':
    log("uncheck");
    if (value) {
      let element = findVisibleElementByLabel(aWindow, value);
      log(element);
      log("  element.checked: ready");
      element.checked = false;
      log("  element.checked: done");
    } else {
      // For commonDialog
      doc.getElementById("checkbox").checked = false;
      aWindow.args.checked = false;
    }
    return;
  default:
    log("no action");
    return;
  }
}

function matchedWindow(aWindow, aConfig) {
  log("matchedWindow");
  let textMatcher = aConfig.text;
  log("  textMatcher: " + textMatcher);
  if (textMatcher && !findVisibleElementByLabel(aWindow, textMatcher))
    return false;
  let titleMatcher = aConfig.title;
  log("  titleMatcher: " + titleMatcher);
  let title = aWindow.document.title;
  if (titleMatcher && !title.match(titleMatcher))
    return false;

  log("  match");
  return  true;
}

function findVisibleElementByLabel(aWindow, text) {
  log("findVisibleElementByLabel");
  if (text.indexOf('"') !== -1) {
    text = 'concat("' + text.replace(/"/g, '", \'"\', "') + '")';
  } else {
    text = '"' + text + '"';
  }
  var expression = '/descendant::*[contains(@label, ' + text + ')] | ' +
                   '/descendant::*[local-name()="label" or local-name()="description"][contains(@value, ' + text + ')] | ' +
                   '/descendant::*[contains(text(), ' + text + ')]';
  log("  expression: " + expression);
  try {
  var elements = aWindow.document.evaluate(
                   expression,
                   aWindow.document,
                   null,
                   aWindow.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                   null
                 );
  } catch(e) {
    log("  error: " + e);
  }
  log("  elements.length: " + elements.snapshotLength);
  for (var i = 0, maxi = elements.snapshotLength; i < maxi; i++)
  {
    let element = elements.snapshotItem(i);
    if (element.clientHeight > 0 &&
        element.clientWidth > 0) {
      return element;
    }
  }

  log("  no visible element");
  return null;
}

WindowManager.addHandler(handleWindow);

function shutdown()
{
  WindowManager = undefined;
  global = undefined;
}
