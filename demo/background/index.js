var query = require('query-string').parse(window.location.search.substring(1));
var graph = getGraphFromQueryString(query);
var renderGraph = require('../../');

renderGraph(graph, {
  container: document.querySelector('.container'),
  clearAlpha: 0.0
});

function getGraphFromQueryString(query) {
  var graphGenerators = require('ngraph.generators');
  var createGraph = graphGenerators[query.graph] || graphGenerators.grid;
  return createGraph(getNumber(query.n), getNumber(query.m), getNumber(query.k));
}

function getNumber(string, defaultValue) {
  var number = parseFloat(string);
  return (typeof number === 'number') && !isNaN(number) ? number : (defaultValue || 10);
}
