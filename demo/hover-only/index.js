var query = require('query-string').parse(window.location.search.substring(1));
var graph = getGraphFromQueryString(query);
var renderGraph = require('../..');

var renderer = renderGraph(graph, {
  link: function createLinkUI(link) {
    return; // no links rendered by default
  },
  activeLink: false
});

renderer.on('nodehover', function(node) {
  if (node) {
    // Mouse in - show connected only:
    var from = renderer.getNode(node.id)
    var idx = 0;
    var edges = [];

    graph.forEachLinkedNode(node.id, function(other) {
      var to = renderer.getNode(other.id);
      edges.push({
        fromColor: 0xFFFFFF,
        toColor: 0xFFFFFF,
        idx: edges.length,
        from: from,
        to: to
      });
    });

    renderer.edgeView().init(edges);
  } else {
    // Mouse out - hide the edges
    renderer.edgeView().init([]);
  }
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
