/**
 * Ideally this should be checked by compiler, but since we are in javascript
 * world, let's make sure we cover some basic expectations from the API
 */
var test = require('tap').test;
var createRenderer = require('../');

test('it exposes basic api', function(t) {
  t.ok(typeof createRenderer === 'function', 'Renderer is a function');
  t.ok(createRenderer.THREE, 'THREE.js is exposed');
  t.end();
});
