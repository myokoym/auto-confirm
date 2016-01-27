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

var log = require('log').log;

var generalUrls = [];
var generalConfigs = [];

function updateConfigs() {
  log("updateConfigs");
  generalUrls = [];
  generalConfigs = [];
  var configs = prefs.getChildren(BASE + 'general');
  for (let config of configs) {
    log(config);
    let url = prefs.getPref(config + '.url');
    if (!url)
      continue;
    generalUrls.push(url);
    generalConfigs.push({
      text:    prefs.getPref(config + '.text'),
      title:   prefs.getPref(config + '.title'),
      action:  prefs.getPref(config + '.action'),
      actions: prefs.getPref(config + '.actions')
    });
  }
  log(JSON.stringify(generalUrls));
  log(JSON.stringify(generalConfigs));
}
updateConfigs();

var timer = Cu.import('resource://gre/modules/Timer.jsm', {});
var updateConfigsTimer;
var listener = {
  domains : [
    BASE + 'general'
  ],
  observe : function(aSubject, aTopic, aData)
  {
    log("observe: start");
    if (aTopic != 'nsPref:changed')
      return;
    log(updateConfigsTimer);
    if (updateConfigsTimer)
      timer.clearTimeout(updateConfigsTimer);
    updateConfigsTimer = timer.setTimeout(function() {
      updateConfigs();
      delete updateConfigsTimer;
    }, 100);
    log("observe: end");
  }
};
prefs.addPrefListener(listener);

prefs.setPref(BASE + 'editing', false);

load('lib/WindowManager');

var TYPE_BROWSER = "navigator:browser";

var global = this;
function handleWindow(aWindow)
{
  log(prefs.getPref(BASE + 'editing'));
  if (prefs.getPref(BASE + 'editing')) {
    return;
  }

  log("handleWindow");
  var doc = aWindow.document;
  if (doc.documentElement.localName === 'dialog' &&
      doc.documentElement.id === 'commonDialog') {
    log("commonDialog");
    handleCommonDialog(aWindow);
    return;
  } else {
    log("generalWindow");
    if (doc.documentElement.getAttribute("windowtype") === TYPE_BROWSER) {
      startObserveTabModalDialogs(aWindow);
    }
    aWindow.addEventListener('load', function onload() {
      aWindow.removeEventListener('load', onload);
      handleGeneralWindow(aWindow);
    });
    return;
  }

}

function handleCommonDialog(aWindow, aRootElement)
{
  var doc = aWindow.document;
  var root = aRootElement /* for tabmodaldialog */ ||
               doc.documentElement /* for common dialog */;
  var commonDialog = root.Dialog /* for tabmodaldialog */ ||
                       aWindow.Dialog /* for common dialog */;
  if (!commonDialog) {
    log("missing common dialog");
    return;
  }
  var args = commonDialog.args;
  log("args: " + JSON.stringify(args));
  var configs = prefs.getChildren(BASE + 'common');
  log("commonDialog: " + configs);
  var matched = false;
  for (let config of configs) {
    let typeMatcher = prefs.getPref(config + '.type');
    if (typeMatcher !== normalizeType(args.promptType))
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
      processAction(aWindow, action, aRootElement);
    let actions = prefs.getPref(config + '.actions');
    if (actions)
      processActions(aWindow, actions, aRootElement);
  }
  if (!matched)
    log("no match");
}

function normalizeType(aType)
{
  switch (aType) {
    case 'alertCheck':
      return 'alert';
    case 'confirmCheck':
      return 'confirm';
    default:
      return aType;
  }
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
      }, 500);
      return;
    }
    fromIndex = index + 1;
  }
}

function processActions(aWindow, aActions, aRootElement)
{
  var doc = aWindow.document;
  log("actions: " + aActions);
  for (let action of JSON.parse(aActions)) {
    log("action: " + action);
    processAction(aWindow, action, aRootElement);
  }
}

function processAction(aWindow, aAction, aRootElement)
{
  var doc = aWindow.document;
  var root = aRootElement /* for tabmodaldialog */ ||
               doc.documentElement /* for chrome window */;
  var commonDialog = root.Dialog /* for tabmodaldialog */ ||
                       aWindow.Dialog /* for common dialog */;
  log("action: " + aAction);
  var actions = aAction.match(/^([^;]+);?(.*)/);
  if (actions === null)
    return;
  var action = actions[1];
  var value = actions[2];
  switch (action) {
  case 'accept':
    if (commonDialog) {
    commonDialog.ui.button0.click();
    }
    log("accept");
    return;
  case 'cancel':
    if (commonDialog) {
    commonDialog.ui.button1.click();
    }
    log("cancel");
    return;
  case 'click':
    log("click");
    {
      let element = findVisibleElementByLabel(root, value);
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
    var buttons = [];
    if (commonDialog) {
      buttons.push(commonDialog.ui.button0);
      buttons.push(commonDialog.ui.button1);
      buttons.push(commonDialog.ui.button2);
      buttons.push(commonDialog.ui.button3);
    }
    for (let index in buttons) {
      var button = buttons[index];
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
    if (commonDialog) {
    commonDialog.ui.loginTextbox.value = value;
    }
    log("input");
    return;
  case 'check':
    log("check");
    if (value) {
      let element = findVisibleElementByLabel(root, value);
      log("  element: " + element);
      log("  element.checked: ready");
      element.checked = true;
      log("  element.checked: done");
    } else if (commonDialog) {
      commonDialog.ui.checkbox.checked = true;
      commonDialog.args.checked = true;
    }
    return;
  case 'uncheck':
    log("uncheck");
    if (value) {
      let element = findVisibleElementByLabel(root, value);
      log(element);
      log("  element.checked: ready");
      element.checked = false;
      log("  element.checked: done");
    } else if (commonDialog) {
      commonDialog.ui.checkbox.checked = true;
      commonDialog.args.checked = false;
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
  if (textMatcher && !findVisibleElementByLabel(aWindow.document.documentElement, textMatcher))
    return false;
  let titleMatcher = aConfig.title;
  log("  titleMatcher: " + titleMatcher);
  let title = aWindow.document.title;
  if (titleMatcher && !title.match(titleMatcher))
    return false;

  log("  match");
  return  true;
}

function findVisibleElementByLabel(aRootElement, text) {
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
  var doc = aRootElement.ownerDocument;
  var global = doc.defaultView;
  var elements = doc.evaluate(
                   expression,
                   aRootElement,
                   null,
                   global.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
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

var tabModalDialogObservers = new WeakMap();

function handleMutationsOnBrowserWindow(aMutations, aObserver) {
  aMutations.forEach(function(aMutation) {
    if (aMutation.type !== "childList" ||
        !aMutation.addedNodes) {
      return;
    }
    Array.forEach(aMutation.addedNodes, function(aNode) {
      if (aNode.localName !== "tabmodalprompt") {
        return;
      }
      log("handle new tabmodalprompt");
      var window = aNode.ownerDocument.defaultView;
      window.setTimeout(function() {
        // operate the dialog after successfully initialized
        handleCommonDialog(window, aNode);
      }, 0);
    });
  });
}

function startObserveTabModalDialogs(aWindow) {
  var MutationObserver = aWindow.MutationObserver;
  var observer = new MutationObserver(handleMutationsOnBrowserWindow);
  observer.observe(aWindow.document.documentElement, {
    childList: true,
    subtree:   true
  });
  tabModalDialogObservers.set(aWindow, observer);
  aWindow.addEventListener("unload", function onunload() {
    aWindow.removeEventListener("unload", onunload);
    endObserveTabModalDialogs(aWindow);
  });
}

function endObserveTabModalDialogs(aWindow) {
  var observer = tabModalDialogObservers.get(aWindow);
  if (observer) {
    observer.disconnect();
    tabModalDialogObservers.delete(aWindow);
  }
}

WindowManager.getWindows(null).forEach(handleWindow);
WindowManager.addHandler(handleWindow);

function shutdown()
{
  WindowManager.getWindows(null).forEach(endObserveTabModalDialogs);
  tabModalDialogObservers = undefined;
  prefs.setPref(BASE + 'editing', false)
  prefs.removePrefListener(listener);
  WindowManager = undefined;
  global = undefined;
}
