module.exports = pixel;
var THREE = require('three');
var eventify = require('ngraph.events');
var createNodeView = require('./lib/nodeView.js');
var createEdgeView = require('./lib/edgeView.js');
var createTooltipView = require('./lib/tooltip.js');
var createAutoFit = require('./lib/autoFit.js');
var createInput = require('./lib/input.js');
var layout3d = require('ngraph.forcelayout3d');
var layout2d = layout3d.get2dLayout;
var validateOptions = require('./options.js');
var flyTo = require('./lib/flyTo.js');

function pixel(graph, options) {
  // This is our public API.
  var api = {
    /**
     * Toggle rendering mode between 2d and 3d
     *
     * @param {boolean+} newMode if set to true, the renderer will switch to 3d
     * rendering mode. If set to false, the renderer will switch to 2d mode.
     * Finally if this argument is not defined, then current rendering mode is
     * returned.
     */
    is3d: mode3d,

    /**
     * Set or get size of a node
     *
     * @param {string} nodeId identifier of a node in question
     * @param {number+} size if undefined, then current node size is returned;
     * Otherwise the new value is set.
     */
    nodeSize: nodeSize,

    /**
     * Set or get color of a node
     *
     * @param {string} nodeId identifier of a node in question
     * @param {number+|Array} color rgb color hex code. If not specified, then current
     * node color is returned. Otherwise the new color is assigned to the node.
     * This value can also be an array of three arguments, in that case each element
     * of the array is considered to be [r, g, b]
     */
    nodeColor: nodeColor,

    /**
     * Sets color of a link
     *
     * @param {string} linkId identifier of a link.
     * @param {number} fromColorHex - rgb color hex code of a link start
     * @param {number+} toColorHex - rgb color hex code of theh link end. If not
     * specified the same value as `fromColorHex` is used.
     */
    linkColor: linkColor,

    /**
     * attempts to fit graph into available screen size
     */
    autoFit: autoFit,

    /**
     * Returns current layout manager
     */
    layout: getLayout,

    /**
     * Gets or sets value which indicates whether layout is stable. When layout
     * is stable, then no additional layout iterations are required. The renderer
     * will stop calling `layout.step()`, which in turn will save CPU cycles.
     *
     * @param {boolean+} stableValue if this value is not specified, then current
     * value of `isStable` will be returned. Otherwise the simulator stable flag
     * will be forcefully set to the given value.
     */
    stable: stable,

    /**
     * Gets or sets graph that is rendered now
     *
     * @param {ngraph.graph+} graphValue if this value is not specified then current
     * graph is returned. Otherwise renderer destroys current scene, and starts
     * render new graph.
     */
    graph: graphInternal,

    /**
     * Attempts to give keyboard input focuse to the scene
     */
    focus: focus,

    /**
     * Requests renderer to move camera and focus on given node id.
     *
     * @param {string} nodeId identifier of the node to show
     */
    showNode: showNode
  };

  eventify(api);

  options = validateOptions(options);

  var container = options.container;
  var is3d = options.is3d;
  var layout = (options.layout) ? options.layout : (
    is3d ? layout3d(graph, options.physics) : layout2d(graph, options.physics));
  var isStable = false;
  var nodeIdToIdx = Object.create(null);
  var edgeIdToIdx = Object.create(null);
  var nodeIdxToId = [];

  var scene, camera, renderer;
  var nodeView, edgeView, autoFitController, input;
  var nodePositions, edgePositions;
  var tooltipView = createTooltipView(container);

  init();
  run();
  focus();


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

  function run() {
    requestAnimationFrame(run);

    if (!isStable) {
      isStable = layout.step();
      nodeView.update();
      edgeView.update();
    } else {
      // we may not want to change positions, but colors/size could be changed
      // at this moment, so let's take care of that:
      if (nodeView.needsUpdate()) nodeView.update();
      if (edgeView.needsUpdate()) edgeView.update();
    }

    if (isStable) api.fire('stable', true);

    input.update();
    if (autoFitController) {
      autoFitController.update();
    }
    renderer.render(scene, camera);
  }

  function init() {
    initScene();
    initPositions();
    listenToGraph();
  }

  function listenToGraph() {
    // TODO: this is not efficient at all. We are recriating view from scratch on
    // every single change.
    graph.on('changed', initPositions);
  }

  function initPositions() {
    var idx = 0;
    edgePositions = [];
    nodePositions = [];
    graph.forEachNode(addNodePosition);
    graph.forEachLink(addEdgePosition);

    nodeView.initPositions(nodePositions);
    edgeView.initPositions(edgePositions);

    if (input) input.reset();

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

    if (options.autoFit) autoFitController = createAutoFit(nodeView, camera);

    renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    renderer.setClearColor(options.clearColor, 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    input = createInput(camera, graph, renderer.domElement);
    input.on('move', stopAutoFit);
    input.onKey(options.layoutToggleKey, toggleLayout);
    input.on('nodeover', setTooltip);
    input.on('nodeclick', passthrough('nodeclick'));
    input.on('nodedblclick', passthrough('nodedblclick'));

    window.addEventListener('resize', onWindowResize, false);
  }

  function nodeColor(nodeId, color) {
    var idx = getNodeIdxByNodeId(nodeId);
    return nodeView.color(idx, normalizeColor(color));
  }

  function nodeSize(nodeId, size) {
    var idx = getNodeIdxByNodeId(nodeId);
    return nodeView.size(idx, size);
  }

  function linkColor(linkId, fromColorHex, toColorHex) {
    var idx = edgeIdToIdx[linkId];
    var idxValid = (0 <= idx && idx < edgePositions.length);
    if (!idxValid) throw new Error('Link index is not valid ' + linkId);
    return edgeView.color(idx, normalizeColor(fromColorHex), normalizeColor(toColorHex));
  }

  function getNodeIdxByNodeId(nodeId) {
    var idx = nodeIdToIdx[nodeId];
    if (idx === undefined) throw new Error('Cannot find node with id ' + nodeId);
    var idxValid = (0 <= idx && idx < graph.getNodesCount());
    if (!idxValid) throw new Error('Node index is out of range' + nodeId);

    return idx;
  }

  function setTooltip(e) {
    var node = getNodeByIndex(e.nodeIndex);
    if (node) {
      tooltipView.show(e, node);
    } else {
      tooltipView.hide(e);
    }
    api.fire('nodehover', node);
  }

  function passthrough(name) {
    return function (e) {
      var node = getNodeByIndex(e.nodeIndex);
      if (node) api.fire(name, node);
    };
  }

  function getNodeByIndex(nodeIndex) {
    return nodeIndex && graph.getNode(nodeIdxToId[nodeIndex]);
  }

  function toggleLayout() {
    layout.dispose();
    is3d = !is3d;
    var physics = copyPhysicsSettings(layout.simulator);

    if (is3d) {
      layout = layout3d(graph, physics);
    } else {
      layout = layout2d(graph, physics);
    }
    Object.keys(nodeIdToIdx).forEach(initLayout);

    initPositions();
    stable(false);
    api.fire('modeChanged', is3d);

    function initLayout(nodeId) {
      var idx = nodeIdToIdx[nodeId];
      var pos = nodePositions[idx];
      // we need to bump 3d positions, so that forces are disturbed:
      if (is3d) pos.z = (idx % 2 === 0) ? -1 : 1;
      else pos.z = 0;
      layout.setNodePosition(nodeId, pos.x, pos.y, pos.z);
    }
  }

  function copyPhysicsSettings(simulator) {
    return {
      springLength: simulator.springLength(),
      springCoeff: simulator.springCoeff(),
      gravity: simulator.gravity(),
      theta: simulator.theta(),
      dragCoeff: simulator.dragCoeff(),
      timeStep: simulator.timeStep()
    };
  }

  function stopAutoFit() {
    input.off('move');
    autoFitController = null;
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function autoFit() {
    if (autoFitController) return; // we are already auto-fitting the graph.
    // otherwise fire and forget autofit:
    createAutoFit(nodeView, camera).update();
  }

  function getLayout() {
    return layout;
  }

  function stable(stableValue) {
    if (stableValue === undefined) return isStable;
    isStable = stableValue;
    api.fire('stable', isStable);
  }

  function graphInternal(newGraph) {
    if (newGraph !== undefined) throw new Error('Not implemented, Anvaka, do it!');
    return graph;
  }

  function normalizeColor(color) {
    if (color === undefined) return color;
    var colorType = typeof color;
    if (colorType === 'number') return color;
    if (colorType === 'string') return parseStringColor(color);
    if (color.length === 3) return (color[0] << 16) | (color[1] << 8) | (color[2]);
    throw new Error('Unrecognized color type: ' + color);
  }

  function parseStringColor(color) {
    if (color[0] === '#') {
      return Number.parseInt(color.substring(1), 16);
    }
    return Number.parseInt(color, 16);
  }

  function focus() {
    var sceneElement = renderer && renderer.domElement;
    if (sceneElement && typeof sceneElement.focus === 'function') sceneElement.focus();
  }

  function showNode(nodeId, stopDistance) {
    stopDistance = typeof stopDistance === 'number' ? stopDistance : 100;
    flyTo(camera, layout.getNodePosition(nodeId), stopDistance);
  }
}
