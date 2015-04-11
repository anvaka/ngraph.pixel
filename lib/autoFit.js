var THREE = require('three');
var intersect = require('./intersect.js');

module.exports = createAutoFit;

function createAutoFit(nodeView, camera) {
  return {
    update: update
  };

  function update() {
    var sphere = nodeView.getBoundingSphere();
    var cameraOffset = Math.max(sphere.radius, 100) / Math.tan(Math.PI / 180.0 * camera.fov * 0.5);
    var to = sphere.center;

    var from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    camera.lookAt(new THREE.Vector3(to.x, to.y, to.z));
    var cameraEndPos = intersect(from, to, cameraOffset);
    camera.position.x = cameraEndPos.x;
    camera.position.y = cameraEndPos.y;
    camera.position.z = cameraEndPos.z;
  }
}
