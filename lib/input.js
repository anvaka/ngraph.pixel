var FlyControls = require('three.fly');
var eventify = require('ngraph.events');
var THREE = require('three');

module.exports = createInput;

function createInput(camera, graph, options) {
  var controls = new FlyControls(camera, options.container, THREE);
  var domElement = options.container;
  // todo: this should all be based on graph size/options:
  var totalNodes = graph.getNodesCount();
  controls.movementSpeed =  Math.max(totalNodes * 0.1, 200);
  controls.rollSpeed = 0.5;
  controls.autoForward = false;
  controls.dragToLook = true;

  var keyMap = Object.create(null);
  var api = {
    update: update,
    onKey: onKey
  };

  eventify(api);
  controls.on('move', fireMove);
  domElement.addEventListener('keydown', globalKeyHandler, false);

  return api;

  function update() {
    controls.update(0.1);
  }

  function fireMove(moveArg) {
    api.fire('move', moveArg);
  }

  function onKey(keyName, handler) {
    keyMap[keyName] = handler;
  }

  function globalKeyHandler(e) {
    var handler = keyMap[e.which];
    if (typeof handler === 'function') {
      handler(e);
    }
  }
}
