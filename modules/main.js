/**
 * @fileOverview Main module for restartless addons
 * @author       YUKI "Piro" Hiroshi
 * @version      4
 *
 * @license
 *   The MIT License, Copyright (c) 2015 YUKI "Piro" Hiroshi.
 *   https://github.com/piroor/restartless/blob/master/license.txt
 * @url http://github.com/piroor/restartless
 */

var BASE = 'extensions.auto-confirm@myokoym.net.';
var prefs = require('lib/prefs').prefs;

function log(message) {
  if (prefs.getPref(BASE + 'debug')) {
    console.log("auto-confirm: " + message);
  }
}

/**
 * load() works like Components.utils.import(). EXPORTED_SYMBOLS
 * in loaded scripts are exported to the global object of this script.
 */
load('lib/WindowManager');

/**
 * Sample code for addons around browser windows.
 */
const TYPE_BROWSER = 'navigator:browser';
var global = this;
function handleWindow(aWindow)
{
  log("handleWindow");
  var doc = aWindow.document;
  if (doc.documentElement.localName === 'dialog' &&
      doc.documentElement.id === 'commonDialog') {
    log("commonDialog");
    aWindow.setTimeout(function() {
      log("cancelDialog");
      doc.documentElement.cancelDialog();
    }, 10000);
    return;
  }

}

WindowManager.addHandler(handleWindow);

/**
 * A handler for shutdown event. This will be called when the addon
 * is disabled or uninstalled (include updating).
 */
function shutdown()
{
	// free loaded symbols
	WindowManager = undefined;
	global = undefined;
}
