# ngraph.pixel

3d graph renderer based on particle material and three.js

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

You can switch between 3D and 2D layout by calling `is3d()` method:

``` js
renderer.is3d(false); // use 2d mode
renderer.is3d(true); // go back to 3d space
```

By default graph is rendered in 3D:
![3d graph is default](http://i.imgur.com/zMJCtyk.png)

You can also press `L` key to toggle layout at runtime:
![2d graph](http://i.imgur.com/SCRFvnQ.png)

# demo

You can take a look at available demos:

* [Basic "Hello world"](https://anvaka.github.io/ngraph.pixel/demo/basic/index.html?graph=balancedBinTree)
* ["Hello world" with colors](https://anvaka.github.io/ngraph.pixel/demo/colors/index.html?graph=balancedBinTree)


# Feedback?
This is very early version of the library and your feedback is very much appreciated.
Feel free to ping me over [email](https://github.com/anvaka), [twitter](https://twitter.com/anvaka), or open [issue here](https://github.com/anvaka/ngraph.pixel/issues/new)

# install

With [npm](https://npmjs.org) do:

```
npm install ngraph.pixel
```

# license

MIT
