var createGraph = require('ngraph.graph');

var ajax = require('./ajax.js');
var pixel = require('../../index.js');

Promise.all([
  ajax('data/positions.bin', { responseType: 'arraybuffer' }).then(toInt32Array),
  ajax('data/links.bin', { responseType: 'arraybuffer' }).then(toInt32Array),
  ajax('data/labels.json').then(toJson)
]).then(render);

function toInt32Array(oReq) {
  return new Int32Array(oReq.response);
}

function toJson(oReq) {
  return JSON.parse(oReq.responseText);
}

function render(data) {
  var positions = data[0];
  var links = data[1];
  var labels = data[2];

  var graph = initGraphFromLinksAndLabels(links, labels);

  var renderer = pixel(graph, {
    node() {
      // use smaller node size
      return { size: 5, color: 0xFF0894 };
    },

    // We need to use "dumb" links, otherwise it will be slow
    // Dumb links cannot be updated directly via properties. Have
    // to use renderer.edgeView().setFromColor(), renderer.edgeView().setToColor(), etc.
    activeLink: false
  });

  var layout = renderer.layout();
  // no need to do any layout here
  renderer.stable(true);

  // Set node positions.
  labels.forEach(function (label, index) {
    var nodeCount = index * 3;
    var x = positions[nodeCount + 0];
    var y = positions[nodeCount + 1];
    var z = positions[nodeCount + 2];

    layout.setNodePosition(label, x, y, z);
  });

  renderer.redraw();
}

function initGraphFromLinksAndLabels(links, labels) {
  var srcIndex;

  var graph =  createGraph({ uniqueLinkId: false });
  labels.forEach(label => graph.addNode(label));
  links.forEach(processLink);

  return graph;

  function processLink(link) {
    if (link < 0) {
      srcIndex = -link - 1;
    } else {
      var toNode = link - 1;
      var fromId = labels[srcIndex];
      var toId = labels[toNode];
      graph.addLink(fromId, toId);
    }
  }
}
