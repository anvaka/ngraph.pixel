var query = require('query-string').parse(window.location.search.substring(1));
var dat = require('exdat');
var graph = getGraphFromQueryString(query);
var renderGraph = require('../../');

var renderer = renderGraph(graph);

// Here we add user interface to change various parameters of the renderer:
var settings = require('./settings/index.js');
settings(renderer, dat);

function getGraphFromQueryString(query) {
  var graphGenerators = require('ngraph.generators');
  var createGraph = graphGenerators[query.graph] || graphGenerators.grid;
  return createGraph(getNumber(query.n), getNumber(query.m), getNumber(query.k));
}

function getNumber(string, defaultValue) {
  var number = parseFloat(string);
  return (typeof number === 'number') && !isNaN(number) ? number : (defaultValue || 10);
}
