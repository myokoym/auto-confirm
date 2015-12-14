/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.auto-confirm@myokoym.net.';
var prefs = require('lib/prefs').prefs;

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
  log("commonDialog");
  aWindow.setTimeout(function() {
    log("cancelDialog");
    doc.documentElement.cancelDialog();
  }, 10000);
}

WindowManager.addHandler(handleWindow);

function shutdown()
{
	WindowManager = undefined;
	global = undefined;
}
