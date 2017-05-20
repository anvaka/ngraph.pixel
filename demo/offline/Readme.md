# ngraph.dot => ngraph.offline.layout => ngraph.tobinary => ngraph.pixel

This is a simple demo that shows how to use three of these modules together.

1. Run `npm install` to install dependencies of this module.
2. Run `node offline-layout.js`. This will produce a layout from `data/graph.txt`.
The layout will be saved into compressed binary format into `./data` folder
3. Run `npm start` to build a web bundle.
4. Run `http-server` in this folder, to start an http-server, and open its url

You should see the layouted graph.
