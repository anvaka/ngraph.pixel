var FlyControls = require('three.fly');
var eventify = require('ngraph.events');
var THREE = require('three');

module.exports = createInput;

function createInput(camera, graph, options) {
  var controls = new FlyControls(camera, options.container, THREE);
  // todo: this should all be based on graph size/options:
  var totalNodes = graph.getNodesCount();
  controls.movementSpeed =  Math.max(totalNodes * 0.1, 200);
  controls.rollSpeed = 0.5;
  controls.autoForward = false;
  controls.dragToLook = true;

  var api = {
    update: update
  };

  eventify(api);
  controls.on('move', fireMove);

  return api;

  function update() {
    controls.update(0.1);
  }

  function fireMove(moveArg) {
    api.fire('move', moveArg);
  }
}
