var createSettingsView = require('config.pixel');
var query = require('query-string').parse(window.location.search.substring(1));
var graph = getGraphFromQueryString(query);
var renderGraph = require('../../');
var addCurrentNodeSettings = require('./nodeSettings.js');

var renderer = renderGraph(graph);
var settingsView = createSettingsView(renderer);
var gui = settingsView.gui();

var nodeSettings = addCurrentNodeSettings(gui, renderer);

renderer.on('nodeclick', showNodeDetails);

function showNodeDetails(node) {
  var nodeUI = renderer.getNode(node.id);
  nodeSettings.setUI(nodeUI);
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
