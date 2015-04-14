module.exports = pixel;
var THREE = require('three');
var createNodeView = require('./lib/nodeView.js');
var createEdgeView = require('./lib/edgeView.js');
var createAutoFit = require('./lib/autoFit.js');
var createInput = require('./lib/input.js');
var layout3d = require('ngraph.forcelayout3d');
var layout2d = require('ngraph.forcelayout');
var validateOptions = require('./options.js');

function pixel(graph, options) {
  var api = {
    is3d: mode3d,
    nodeSize: nodeSize,
    nodeColor: nodeColor,
    linkColor: linkColor
  };

  options = validateOptions(options);

  var tooltipDom, tooltipVisible;
  var container = options.container;
  var is3d = options.is3d;
  var layout = is3d ? layout3d(graph, options.physicsSettings) : layout2d(graph, options.physicsSettings);
  var isStable = false;
  var nodeIdToIdx = Object.create(null);
  var edgeIdToIdx = Object.create(null);
  var nodeIdxToId = [];

  var scene, camera, renderer;
  var nodeView, edgeView, autoFit, input;
  var nodePositions, edgePositions;

  init();
  run();

  return api;

  function mode3d(newMode) {
    if (newMode === undefined) {
      return is3d;
    }
    if (newMode !== is3d) {
      toggleLayout();
    }
    return api;
  }

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
    edgePositions = [];
    nodePositions = [];
    graph.forEachNode(addNodePosition);
    graph.forEachLink(addEdgePosition);

    nodeView.initPositions(nodePositions);
    edgeView.initPositions(edgePositions);

    function addNodePosition(node) {
      var position = layout.getNodePosition(node.id);
      if (!is3d) position.z = 0;
      nodePositions.push(position);
      nodeIdToIdx[node.id] = idx;
      nodeIdxToId[idx] = node.id;
      idx += 1;
    }

    function addEdgePosition(edge) {
      var edgeOffset = edgePositions.length;
      edgeIdToIdx[edge.id] = edgeOffset;
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

    if (options.autoFit) autoFit = createAutoFit(nodeView, camera);

    input = createInput(camera, graph, options);
    input.on('move', stopAutoFit);
    input.onKey(options.layoutToggleKey, toggleLayout);
    input.on('nodehover', setTooltip);

    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setClearColor(options.clearColor, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
  }

  function nodeColor(nodeId, color) {
    var idx = getNodeIdxByNodeId(nodeId);
    return nodeView.color(idx, color);
  }

  function nodeSize(nodeId, size) {
    var idx = getNodeIdxByNodeId(nodeId);
    return nodeView.size(idx, size);
  }

  function linkColor(linkId, fromColorHex, toColorHex) {
    var idx = edgeIdToIdx[linkId];
    var idxValid = (0 <= idx && idx < edgePositions.length);
    if (!idxValid) throw new Error('Link index is not valid ' + linkId);
    return edgeView.color(idx, fromColorHex, toColorHex);
  }

  function getNodeIdxByNodeId(nodeId) {
    var idx = nodeIdToIdx[nodeId];
    if (idx === undefined) throw new Error('Cannot find node with id ' + nodeId);
    var idxValid = (0 <= idx && idx < graph.getNodesCount());
    if (!idxValid) throw new Error('Node index is out of range' + nodeId);

    return idx;
  }

  function setTooltip(args) {
    if (args.nodeIndex !== undefined) {
      var node = graph.getNode(nodeIdxToId[args.nodeIndex]);
      showTooltip(args, node);
    } else {
      hideTooltip(args);
    }
  }

  // TODO: move tooltip into its own module, make customizeable
  function showTooltip(e, node) {
    if (!tooltipDom) {
      tooltipDom = document.createElement('div');
      tooltipDom.style.position = 'absolute';
      tooltipDom.style.color = 'white';
      container.appendChild(tooltipDom);
    }
    tooltipDom.style.left = e.x + 'px';
    tooltipDom.style.top = e.y + 'px';
    tooltipDom.innerHTML = node.id;
    tooltipVisible = true;
  }

  function hideTooltip() {
    if (tooltipVisible) {
      tooltipDom.style.left = '-10000px';
      tooltipDom.style.top = '-10000px';
      tooltipVisible = false;
    }
  }

  function toggleLayout() {
    layout.dispose();
    is3d = !is3d;
    if (is3d) {
      layout = layout3d(graph, options.physicsSettings);
    } else {
      layout = layout2d(graph, options.physicsSettings);
    }
    Object.keys(nodeIdToIdx).forEach(initLayout);

    initPositions();
    input.reset();
    isStable = false;

    function initLayout(nodeId) {
      var idx = nodeIdToIdx[nodeId];
      var pos = nodePositions[idx];
      // we need to bump 3d positions, so that forces are disturbed:
      if (is3d) pos.z = (idx % 2 === 0) ? -1 : 1;
      else pos.z = 0;
      layout.setNodePosition(nodeId, pos.x, pos.y, pos.z);
    }
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
