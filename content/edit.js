/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var gRule;

function init() {
  gRule = window.arguments[0] || {};

  Object.keys(gRule).forEach(function(aKey) {
    var value = gRule[aKey];
    var field = document.getElementById(aKey + '-field');
    if (field)
      field.value = value;
  });

  onGroupChanged();
}

function onGroupChanged() {
  var group = document.getElementById('group-field').value;
  Array.forEach(document.querySelectorAll('.group-common'), function(aItem) {
    if (group == 'common')
      aItem.removeAttribute('hidden');
    else
      aItem.setAttribute('hidden', true);
  });
  Array.forEach(document.querySelectorAll('.group-general'), function(aItem) {
    if (group == 'general')
      aItem.removeAttribute('hidden');
    else
      aItem.setAttribute('hidden', true);
  });
}

function onAccept() {
  return true;
}
