var query = require('query-string').parse(window.location.search.substring(1));
var graph = getGraphFromQueryString(query);

var renderGraph = require('../../');

renderGraph(graph, {
  link: renderLink,
  node: renderNode
});

function renderNode(/* node */) {
  return {
    color: Math.random() * 0xFFFFFF | 0,
    size: Math.random() * 21 + 10
  };
}

function renderLink(/* link */) {
  return {
    fromColor: 0xFF0000,
    toColor: 0x00FF00
  };
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
