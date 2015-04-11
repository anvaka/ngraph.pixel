module.exports = pixel;
var THREE = require('three');
var createNodeView = require('./lib/nodeView.js');
var createEdgeView = require('./lib/edgeView.js');
var createAutoFit = require('./lib/autofit.js');
var createInput = require('./lib/input.js');

function pixel(graph, options) {
  var api = {
  };
  options = options || {};
  // Let the renderer automatically fit the graph to available screen
  options.autoFit = options.autoFit !== undefined ? options.autoFit : true;
  options.container = options.container || document.body;

  var container = options.container;
  var layout = options.layout || require('ngraph.forcelayout3d')(graph, options.physicsSettings);
  var isStable = false;
  var nodeIdToIdx = Object.create(null);

  var scene, camera, renderer;
  var nodeView, edgeView, autoFit, input;

  init();
  run();

  return api;

  function run(time) {
    requestAnimationFrame(run);

    if (!isStable) {
      isStable = layout.step();
      nodeView.update();
      edgeView.update();
    }

    input.update();
    if (autoFit) {
      autoFit.update(time);
    }
    renderer.render(scene, camera);
  }

  function init() {
    initScene();
    initPositions();
  }

  function initPositions() {
    var idx = 0;
    var nodePositions = [];
    var edgePositions = [];
    graph.forEachNode(addNodePosition);
    graph.forEachLink(addEdgePosition);

    nodeView.initPositions(nodePositions);
    edgeView.initPositions(edgePositions);

    function addNodePosition(node) {
      var position = layout.getNodePosition(node.id);
      if (position.z === undefined) {
        position.z = 0;
      }
      nodePositions.push(position);
      nodeIdToIdx[node.id] = idx;
      idx += 1;
    }

    function addEdgePosition(edge) {
      edgePositions.push(nodePositions[nodeIdToIdx[edge.fromId]], nodePositions[nodeIdToIdx[edge.toId]]);
    }
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.sortObjects = false;

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 20000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 200;

    scene.add(camera);
    nodeView = createNodeView(scene);
    edgeView = createEdgeView(scene);
    if (options.autoFit) {
      autoFit = createAutoFit(nodeView, camera);
    }
    input = createInput(camera, graph, options);
    input.on('move', stopAutoFit);

    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
  }

  function stopAutoFit() {
    input.off('move');
    autoFit = null;
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
}
