/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.auto-confirm@myokoym.net.';
var { prefs } = Components.utils.import('resource://auto-confirm-resources/modules/lib/prefs.js', {});

function shutdown() {
  Components.utils.unload('resource://auto-confirm-resources/modules/lib/prefs.js');
}
