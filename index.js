module.exports = pixel;
var THREE = window.THREE = require('three');
var createNodeView = require('./lib/nodeView.js');
var createEdgeView = require('./lib/edgeView.js');
var FlyControls = require('three.fly');

function pixel(graph, options) {
  var api = {
    run: run
  };
  options = options || {};

  var container = options.layout || document.body;
  var layout = options.layout || require('ngraph.forcelayout3d')(graph, options.physicsSettings);
  var isStable = false;
  var nodeIdToIdx = Object.create(null);

  var scene, camera, renderer, controls;
  var nodeView, edgeView;

  init();
  run();
  return api;

  function run() {
    requestAnimationFrame(run);
    if (!isStable) {
      isStable = layout.step();
      nodeView.update();
      edgeView.update();
    }
    controls.update(0.1);
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
    camera.position.z = 0;
    scene.add(camera);
    nodeView = createNodeView(scene);
    edgeView = createEdgeView(scene);

    controls = new FlyControls(camera, container);
    controls.movementSpeed = 200;
    controls.rollSpeed = 0.5;
    controls.autoForward = false;
    controls.dragToLook = true;
    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
}
