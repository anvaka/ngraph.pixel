var query = require('query-string').parse(window.location.search.substring(1));
var graph = getGraphFromQueryString(query);
var renderGraph = require('../../');

var renderer = renderGraph(graph, {
  settings: true // request to render settings user interface
});

renderer.on('nodeclick', showNodeDetails);

var allSettings = renderer.settings();
var gui = allSettings.gui();
var nodeSettings = gui.addFolder('Current Node');
var currentNode = {
  id: '',
  color: 0,
  size: 0
};

nodeSettings.add(currentNode, 'id');
nodeSettings.addColor(currentNode, 'color').onChange(setColor);
nodeSettings.add(currentNode, 'size', 0, 200).onChange(setSize);

function setColor() {
  if (currentNode.id) {
    renderer.nodeColor(currentNode.id, currentNode.color);
  }
}

function setSize() {
  if (currentNode.id) {
    renderer.nodeSize(currentNode.id, currentNode.size);
  }
}

function showNodeDetails(node) {
  currentNode.id = node.id;
  currentNode.color = renderer.nodeColor(node.id);
  currentNode.size = renderer.nodeSize(node.id);
  nodeSettings.update();
}

// you can list all available settings by calling: allSettings.list();
// you can also remove individual settings that you don't want to show:
// allSettings.remove(['View Settings', 'springCoeff']);

function getGraphFromQueryString(query) {
  var graphGenerators = require('ngraph.generators');
  var createGraph = graphGenerators[query.graph] || graphGenerators.grid;
  return createGraph(getNumber(query.n), getNumber(query.m), getNumber(query.k));
}

function getNumber(string, defaultValue) {
  var number = parseFloat(string);
  return (typeof number === 'number') && !isNaN(number) ? number : (defaultValue || 10);
}
