var FlyControls = require('three.fly');
var eventify = require('ngraph.events');
var THREE = require('three');
var createHitTest = require('./hitTest.js');

module.exports = createInput;

function createInput(camera, graph, options) {
  var controls = new FlyControls(camera, options.container, THREE);
  var domElement = options.container;
  var hitTest = createHitTest(domElement);
  // todo: this should all be based on graph size/options:
  var totalNodes = graph.getNodesCount();
  controls.movementSpeed =  Math.max(totalNodes * 0.1, 200);
  controls.rollSpeed = 0.20;
  controls.autoForward = false;
  controls.dragToLook = true;

  var keyMap = Object.create(null);
  var api = {
    update: update,
    onKey: onKey,
    reset: reset
  };

  eventify(api);

  hitTest.on('nodeover', fireHover);
  controls.on('move', inputChanged);
  domElement.addEventListener('keydown', globalKeyHandler, false);
  domElement.addEventListener('mousemove', globalMouseMove, false);

  return api;

  function update() {
    controls.update(0.1);
  }

  function fireHover(e) {
    api.fire('nodehover', e);
  }

  function inputChanged(moveArg) {
    api.fire('move', moveArg);
    updateHitTest();
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

  function globalMouseMove() {
    updateHitTest();
  }

  function updateHitTest() {
    var scene = camera.parent;
    hitTest.update(scene, camera);
  }

  function reset() {
    hitTest.reset();
  }
}
