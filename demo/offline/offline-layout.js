/**
 * This file reads a dot file from the data folder, performs layout and saves
 * output into the data folder
 */
var dot = require('ngraph.fromdot');
var saveBinaryGraph = require('ngraph.tobinary');

var fs = require('fs');
var path = require('path');
var DATA_FROM_FILE = fs.readFileSync(path.join('data', 'graph.txt'), 'utf8');
var graph = dot(DATA_FROM_FILE);

var createLayout = require('ngraph.offline.layout');
var layout = createLayout(graph, {
  iterations: 1000,
  saveEach: 50
});

layout.run();

saveBinaryGraph(graph, {
  outDir: 'data'
});
