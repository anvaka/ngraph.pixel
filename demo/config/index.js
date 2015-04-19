var query = require('query-string').parse(window.location.search.substring(1));
var graph = getGraphFromQueryString(query);
var renderGraph = require('../../');
var addCurrentNodeSettings = require('./nodeSettings.js');

var renderer = renderGraph(graph, {
  settings: true // request to render settings user interface
});

var allSettings = renderer.settings();
var gui = allSettings.gui();
var nodeSettings = addCurrentNodeSettings(gui, renderer);

renderer.on('nodeclick', showNodeDetails);

function showNodeDetails(node) {
  nodeSettings.id = node.id;
  nodeSettings.color = renderer.nodeColor(node.id);
  nodeSettings.size = renderer.nodeSize(node.id);
  nodeSettings.isPinned = renderer.layout().isNodePinned(node);
  gui.update();
}

function getGraphFromQueryString(query) {
  var graphGenerators = require('ngraph.generators');
  var createGraph = graphGenerators[query.graph] || graphGenerators.grid;
  return createGraph(getNumber(query.n), getNumber(query.m), getNumber(query.k));
}

function getNumber(string, defaultValue) {
  var number = parseFloat(string);
  return (typeof number === 'number') && !isNaN(number) ? number : (defaultValue || 10);
}
