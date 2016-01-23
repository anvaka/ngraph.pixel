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

test('it finds intersection between random points', function(t) {
  for (var i = 0; i < 100; ++i) {
    var sphereCenter = getRandomPoint();
    var sphereRadius = Math.random() * 10;
    var point = getRandomPoint();

    var intersection = intersect(point, sphereCenter, sphereRadius);
    var dx = (intersection.x - sphereCenter.x);
    var dy = (intersection.y - sphereCenter.y);
    var dz = (intersection.z - sphereCenter.z);
    var distanceToPoint = Math.sqrt(dx * dx + dy * dy + dz * dz);
    t.ok(close(distanceToPoint, sphereRadius), 'Point OK: ' + JSON.stringify({
      sphereCenter: sphereCenter,
      sphereRadius: sphereRadius,
      point: point
    }))
  }
  t.end();

  function getRandomPoint() {
    return { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 };
  }
});

function close(x, y) {
  return Math.abs(x - y) < 0.1e-10;
}
