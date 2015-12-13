var flyTo = require('./flyTo.js');
module.exports = createAutoFit;

function createAutoFit(nodeView, camera) {
  var radius = 100;
  return {
    update: update,
    lastRadius: getLastRadius
  };

  function update() {
    var sphere = nodeView.getBoundingSphere();
    radius = Math.max(sphere.radius, 100);
    flyTo(camera, sphere.center, radius);
  }

  function getLastRadius() {
    return radius;
  }
}
