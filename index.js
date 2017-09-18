var THREE = require('three');

module.exports = pixel;

/**
 * Expose to the outter world instance of three.js
 * so that they can use it if they need it
 */
module.exports.THREE = THREE;

var eventify = require('ngraph.events');

var createNodeView = require('./lib/nodeView.js');
var createEdgeView = require('./lib/edgeView.js');
var createTooltipView = require('./lib/tooltip.js');
var createAutoFit = require('./lib/autoFit.js');
var createInput = require('./lib/input.js');
var validateOptions = require('./options.js');
var flyTo = require('./lib/flyTo.js');

var makeActive = require('./lib/makeActive.js');

function pixel(graph, options) {
  // This is our public API.
  var api = {
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
    showNode: showNode,

    /**
     * Allows clients to provide a callback function, which is invoked before
     * each rendering frame
     *
     * @param {function} newBeforeFrameCallback the callback function. This
     * argument is not chained, and any new value overwrites the old one
     */
    beforeFrame: beforeFrame,

    /**
     * Returns instance of the three.js camera
     */
    camera: getCamera,

    /**
     * Allows clients to set/get current clear color of the scene (the background)
     *
     * @param {number+} color if specified, then new color is set. Otherwise
     * returns current clear color.
     */
    clearColor: clearColor,

    /**
     * Allows clients to set/get current clear color opacity
     *
     * @param {number+} alpha if specified, then new alpha opacity is set. Otherwise
     * returns current clear color alpha.
     */
    clearAlpha: clearAlpha,

    /**
     * Synonmim for `clearColor`. Sets the background color of the scene
     *
     * @param {number+} color if specified, then new color is set. Otherwise
     * returns current clear color.
     */
    background: clearColor,

    /**
     * Gets UI for a given node id. If node creation function decided not to
     * return UI for this node, falsy object is returned.
     *
     * @param {string} nodeId - identifier of the node
     * @returns Object that represents UI for the node
     */
    getNode: getNode,

    /**
     * Gets UI for a given link id. If link creation function decided not to
     * return UI for this link, falsy object is returned.
     *
     * @param {string} linkId - identifier of the link
     * @returns Object that represents UI for the link
     */
    getLink: getLink,

    /**
     * Iterates over every link UI element
     *
     * @param {Function} cb - link visitor. Accepts one argument, which is linkUI
     */
    forEachLink: forEachLink,

    /**
     * Iterates over every node UI element
     *
     * @param {Function} cb - node visitor. Accepts one argument, which is nodeUI
     */
    forEachNode: forEachNode,

    /**
     * Gets three.js scene where current graph is rendered
     */
    scene: getScene,

    /**
     * Forces renderer to update scene, without waiting for notifications
     * from layouter
     */
    redraw: redraw,

    // Low level methods to get edgeView/nodeView.
    // TODO: update docs if this sticks.
    edgeView: getEdgeView,
    nodeView: getNodeView
  };

  eventify(api);

  options = validateOptions(options);

  var beforeFrameCallback;
  var container = options.container;
  verifyContainerDimensions(container);

  var layout = options.createLayout(graph, options);
  if (layout && typeof layout.on === 'function') {
    layout.on('reset', layoutReset);
  }
  var isStable = false;
  var nodeIdToIdx = new Map();
  var edgeIdToIndex = new Map();

  var scene, camera, renderer;
  var nodeView, edgeView, autoFitController, input;
  var nodes, edges;
  var tooltipView = createTooltipView(container);

  init();
  run();
  focus();

  return api;

  function layoutReset() {
    initPositions();
    stable(false);
  }

  function getCamera() {
    return camera;
  }

  function getEdgeView() {
    return edgeView;
  }

  function getNodeView() {
    return nodeView;
  }

  function redraw() {
    edgeView.refresh();
    nodeView.refresh();
  }

  function clearColor(newColor) {
    newColor = normalizeColor(newColor);
    if (typeof newColor !== 'number') return renderer.getClearColor();

    renderer.setClearColor(newColor);
  }

  function clearAlpha(newAlpha) {
    if (typeof newAlpha !== 'number') return renderer.getClearAlpha();

    renderer.setClearAlpha(newAlpha);
  }

  function run() {
    requestAnimationFrame(run);

    if (beforeFrameCallback) {
      beforeFrameCallback();
    }
    if (!isStable) {
      isStable = layout.step();

      updatePositions();

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
      input.adjustSpeed(autoFitController.lastRadius());
    }
    renderer.render(scene, camera);
  }

  function getScene() {
    return scene;
  }

  function beforeFrame(newBeforeFrameCallback) {
    beforeFrameCallback = newBeforeFrameCallback;
  }

  function init() {
    initScene();
    initPositions();
    listenToGraph();
  }

  function listenToGraph() {
    // TODO: this is not efficient at all. We are recreating view from scratch on
    // every single change.
    graph.on('changed', initPositions);
  }

  function updatePositions() {
    if (!nodes) return;

    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      node.position = layout.getNodePosition(node.id);
    }
  }

  function initPositions() {
    edges = [];
    nodes = [];
    nodeIdToIdx = new Map();
    edgeIdToIndex = new Map();
    graph.forEachNode(addNodePosition);
    graph.forEachLink(addEdgePosition);

    nodeView.init(nodes);
    edgeView.init(edges);

    if (input) input.reset();

    function addNodePosition(node) {
      var nodeModel = options.node(node);
      if (!nodeModel) return;
      var idx = nodes.length;

      var position = layout.getNodePosition(node.id);
      if (typeof position.z !== 'number') position.z = 0;

      nodeModel.id = node.id;
      nodeModel.position = position;
      nodeModel.idx = idx;

      if (options.activeNode) {
        nodes.push(makeActive(nodeModel));
      } else {
        nodes.push(nodeModel);
      }

      nodeIdToIdx.set(node.id, idx);
    }

    function addEdgePosition(edge) {
      var edgeModel = options.link(edge);
      if (!edgeModel) return;

      var fromNode = nodes[nodeIdToIdx.get(edge.fromId)];
      if (!fromNode) return; // cant have an edge that doesn't have a node

      var toNode = nodes[nodeIdToIdx.get(edge.toId)];
      if (!toNode) return;

      edgeModel.idx = edges.length;
      edgeModel.from = fromNode;
      edgeModel.to = toNode;

      edgeIdToIndex.set(edge.id, edgeModel.idx);

      if (options.activeLink) {
        edges.push(makeActive(edgeModel));
      } else {
        edges.push(edgeModel);
      }
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
    nodeView = createNodeView(scene, options);
    edgeView = createEdgeView(scene, options);

    if (options.autoFit) autoFitController = createAutoFit(nodeView, camera);

    var glOptions = {
      antialias: false,
    };
    if (options.clearAlpha !== 1) {
      glOptions.alpha = true;
    }

    renderer = new THREE.WebGLRenderer(glOptions);

    renderer.setClearColor(options.clearColor, options.clearAlpha);
    if (window && window.devicePixelRatio) renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    input = createInput(camera, graph, renderer.domElement);
    input.on('move', stopAutoFit);
    input.on('nodeover', setTooltip);
    input.on('nodeclick', passthrough('nodeclick'));
    input.on('nodedblclick', passthrough('nodedblclick'));

    window.addEventListener('resize', onWindowResize, false);
  }

  function getNode(nodeId) {
    var idx = nodeIdToIdx.get(nodeId);
    if (idx === undefined) return;

    return nodes[idx];
  }

  function getLink(linkId) {
    var idx = edgeIdToIndex.get(linkId);
    if (idx === undefined) return;

    return edges[idx];
  }

  function forEachLink(cb) {
    if (typeof cb !== 'function') throw new Error('link visitor should be a function');
    edges.forEach(cb);
  }

  function forEachNode(cb) {
    if (typeof cb !== 'function') throw new Error('node visitor should be a function');
    nodes.forEach(cb);
  }

  function setTooltip(e) {
    var node = getNodeByIndex(e.nodeIndex);
    if (node !== undefined) {
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
    var nodeUI = nodes[nodeIndex];
    return nodeUI && graph.getNode(nodeUI.id);
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

function verifyContainerDimensions(container) {
  if (!container) {
    throw new Error('container is required for the renderer');
  }

  if (container.clientWidth <= 0 || container.clientHeight <= 0) {
    console.warn('Container is not visible. Make sure to set width/height to see the graph');
  }
}
