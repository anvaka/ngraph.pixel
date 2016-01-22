var test = require('tap').test;
var intersect = require('../lib/intersect.js');

test('it finds intersection', function(t) {
  var sphereCenter = {
    x: 0, y: 0, z: 0
  }
  var sphereRadius = 2;

  var point = {
    x: 10, y: 0, z: 0
  }
  var intersection = intersect(point, sphereCenter, sphereRadius);
  t.equals(intersection.x, 2, 'X is correct');
  t.ok(close(intersection.y, 0) && close(intersection.z,  0), 'Y, Z are correct');
  t.end();
});

function close(x, y) {
  return Math.abs(x - y) < 0.1e-10;
}
