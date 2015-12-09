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

/**
 * load() works like Components.utils.import(). EXPORTED_SYMBOLS
 * in loaded scripts are exported to the global object of this script.
 */
load('lib/WindowManager');
load('lib/prefs');

/**
 * Sample code for addons around browser windows.
 */
const TYPE_BROWSER = 'navigator:browser';

var global = this;
function handleWindow(aWindow)
{
	var doc = aWindow.document;
	if (doc.documentElement.getAttribute('windowtype') != TYPE_BROWSER)
		return;

}

WindowManager.getWindows(TYPE_BROWSER).forEach(handleWindow);
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
