# ngraph.pixel [![Build Status](https://travis-ci.org/anvaka/ngraph.pixel.svg?branch=master)](https://travis-ci.org/anvaka/ngraph.pixel)

Fast graph renderer based on low level ShaderMaterial from three.js

# usage

This will render a simple graph in 3D:

``` js
// let's create a simple graph:
var graph = require('ngraph.graph')();
graph.addLink(1, 2);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph);
```

By default use keyboard keys `WASD` to fly around, and click and drag with
mouse to point the camera. This is not the most convenient way to navigate
the scene, so your feedback is very welcome.

By default graph is laid out using [pixel.layout](https://github.com/anvaka/pixel.layout)
module, which can layout graphs in both 3D:
![3d graph is default](http://i.imgur.com/zMJCtyk.png)

and 2D spaces:
![2d graph](http://i.imgur.com/SCRFvnQ.png)


# demo

You can take a look at available demos:

* [Basic "Hello world"](https://anvaka.github.io/ngraph.pixel/demo/basic/index.html?graph=balancedBinTree)
* ["Hello world" with colors](https://anvaka.github.io/ngraph.pixel/demo/colors/index.html?graph=balancedBinTree)
* [Configuring pixel](https://anvaka.github.io/ngraph.pixel/demo/config/index.html?graph=balancedBinTree)
* [Editing graph](https://anvaka.github.io/ngraph.pixel/demo/edit/index.html)

## mouse events

How to detect when user clicks/hovers a node?

``` js
var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph);
renderer.on('nodeclick', function(node) {
  console.log('Clicked on ' + JSON.stringify(node));
});

renderer.on('nodedblclick', function(node) {
  console.log('Double clicked on ' + JSON.stringify(node));
});

renderer.on('nodehover', function(node) {
  console.log('Hover node ' + JSON.stringify(node));
});

// If you want to unsubscribe from event, just use `off()` method:
renderer.on('nodehover', handler);
renderer.off('nodehover', handler);
```

## custom node UI

### How to set default node UI?

``` js
var graph = require('ngraph.graph')();
graph.addLink(1, 2);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph, {
  node: createNodeUI
});

function createNodeUI(node) {
  return {
    color: 0xFF00FF,
    size: 20
  };
}
```

### How to update node color/size?

``` js
var graph = require('ngraph.graph')();
var myNode = graph.addNode(1);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph);

var nodeUI = renderer.getNode(myNode.id);
nodeUI.color = 0xFF0000; // update node color
nodeUI.size = 30; // update size

// that's it, nothing else is required.
```

### How to make transparent nodes?

Best way to do so, is tell the renderer that you are not interested
in rendering such nodes:

``` js
var graph = require('ngraph.graph')();
graph.addNode(1);
graph.addNode(2, 'hidden');

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph, {
  node: function createNodeUI(node) {
    if (node.data === 'hidden') return; // don't need to render!
    // otherwise return default UI:
    return {
      color: 0xFF00FF,
      size: 30
    };
  }
});
```

Note: Hiding nodes from UI does not remove them from a graph or layout algorithm.

### How to get node UI?

``` js
// There are several ways to do so.

var graph = require('ngraph.graph')();
var node = graph.add(2, 3);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph);

// if you know link id you can pass it directly:
var ui = renderer.getNode(node.id);

// if you want to get all UI elements:
renderer.forEachNode(function (nodeUI) {
  // nodeUI - is your UI object
});

// of course you can also iterate over each link of the graph:
graph.forEachNode(function (nodeModel) {
  var ui = renderer.getLink(nodeModel.id);
  // but be careful! If your link UI creation function decided to skip this
  // node, you will get `ui === undefined` here.
});
```

## custom link UI

The API for links is symmetrical to nodes. Please take a look below:

### How to set default link color?

``` js
var graph = require('ngraph.graph')();
var myLink = graph.addLink(1, 2);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph, {
  link: createLinkUI
});

function createLinkUI(link) {
  return {
    fromColor: 0xFF00FF,
    toColor: 0x00FFFF
  };
}
```

### How to update link color?

``` js
var graph = require('ngraph.graph')();
var myLink = graph.addLink(1, 2);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph);

var linkUI = renderer.getLink(myLink.id);
linkUI.fromColor = 0xFF0000; // update link head color
linkUI.toColor = 0x00FF00; // update link tail color

// that's it, nothing else is required.
```

### How to make transparent links?

Best way to do so, is tell the renderer that you are not interested
in rendering such links:

``` js
var graph = require('ngraph.graph')();
graph.addLink(1, 2);
graph.addLink(2, 3, 'hidden');

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph, {
  link: function createLinkUI(link) {
    if (link.data === 'hidden') return; // don't need to render!
    // otherwise return default link:
    return {
      fromColor: 0xFF00FF,
      toColor: 0x00FFFF
    };
  }
});
```

Note: Hiding links from UI does not remove them from a graph or layout algorithm.

### How to get link UI?

``` js
// There are several ways to do so.

var graph = require('ngraph.graph')();
var link = graph.addLink(2, 3);

var renderGraph = require('ngraph.pixel');
var renderer = renderGraph(graph);

// if you know link id you can pass it directly:
var ui = renderer.getLink(link.id);

// if you want to get all UI elements:
renderer.forEachLink(function (linkUI) {
  // linkUI - is your UI object
});

// of course you can also iterate over each link of the graph:
graph.forEachLink(function (linkModel) {
  var ui = renderer.getLink(linkModel.id);
  // but be careful! If your link UI creation function decided to skip this
  // link, you will get `ui === undefined` here.
});
```

## Layout

### How to make 2d layout?

``` js
var graph = require('ngraph.graph')();
var link = graph.addLink(2, 3);

var renderGraph = require('ngraph.pixel');

// By default the layout is 3D. To switch it to 2d mode:
var renderer = renderGraph(graph, {
  is3d: false
});
```

### How to change layout forces configuration

``` js
var graph = require('ngraph.graph')();
var link = graph.addLink(2, 3);

var renderGraph = require('ngraph.pixel');

// pass physics property to the options; See more information here: 
// https://github.com/anvaka/ngraph.forcelayout#configuring-physics
var renderer = renderGraph(graph, {
  physics: {
    springLength : 80,
    springCoeff : 0.0002,
    gravity: -1.2,
    theta : 0.8,
    dragCoeff : 0.02
  }
});
```


# Feedback?
This is very early version of the library and your feedback is very much appreciated.
Feel free to ping me over [email](https://github.com/anvaka), [twitter](https://twitter.com/anvaka), or open [issue here](https://github.com/anvaka/ngraph.pixel/issues/new).
You can also join library discussion on [gitter](https://gitter.im/anvaka/VivaGraphJS).

# install

With [npm](https://npmjs.org) do:

```
npm install ngraph.pixel
```

# license

MIT
