var THREE = require('three');

module.exports = nodeView;

function nodeView(scene) {
  var particleMaterial = require('./createMaterial.js')();
  var total;
  var nodes;
  var colors, points, sizes;
  var geometry, particleSystem;
  var colorDirty, sizeDirty, positionDirty;

  // declares bindings between node properties to functions within current view
  var nodeConnector = {
    position: position,
    color: color,
    size: size
  };

  return {
    init: init,
    update: update,
    needsUpdate: needsUpdate,
    getBoundingSphere: getBoundingSphere
  };

  function needsUpdate() {
    return colorDirty || sizeDirty;
  }

  function color(node) {
    var idx3 = node.idx * 3;
    var hexColor = node.color;
    colors[idx3    ] = (hexColor >> 16) & 0xff;
    colors[idx3 + 1] = (hexColor >>  8) & 0xff;
    colors[idx3 + 2] = (hexColor      ) & 0xff;
    colorDirty = true;
  }

  function size(node) {
    sizes[node.idx] = node.size;
    sizeDirty = true;
  }

  function position(node) {
    var idx3 = node.idx * 3;
    var pos = node.position;

    points[idx3 + 0] = pos.x;
    points[idx3 + 1] = pos.y;
    points[idx3 + 2] = pos.z;

    positionDirty = true;
  }

  function update() {
    if (positionDirty) {
      geometry.getAttribute('position').needsUpdate = true;
      positionDirty = false;
    }
    if (colorDirty) {
      geometry.getAttribute('customColor').needsUpdate = true;
      colorDirty = false;
    }
    if (sizeDirty) {
      geometry.getAttribute('size').needsUpdate = true;
      sizeDirty = false;
    }
  }

  function getBoundingSphere() {
    if (!geometry) return;
    geometry.computeBoundingSphere();
    return geometry.boundingSphere;
  }

  function init(nodeCollection) {
    disconnectOldNodes();

    total = nodeCollection.length;
    nodes = nodeCollection;
    // if we can ruse old arrays - do it! No need to stress the GC
    var pointsInitialized = points !== undefined && points.length === total * 3;
    if (!pointsInitialized) points = new Float32Array(total * 3);
    var colorsInitialized = colors !== undefined && colors.length === total * 3;
    if (!colorsInitialized) colors = new Float32Array(total * 3);
    var sizesInitialized = sizes !== undefined && sizes.length === total;
    if (!sizesInitialized) sizes = new Float32Array(total);

    geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    if (particleSystem) {
      scene.remove(particleSystem);
    }

    particleSystem = new THREE.Points(geometry, particleMaterial);
    particleSystem.name = 'nodes';
    particleSystem.frustumCulled = false;

    scene.add(particleSystem);

    for (var i = 0; i < total; ++i) {
      var node = nodes[i];
      // first make sure any update to underlying node properties result in
      // graph update:
      node.connect(nodeConnector);

      // then invoke first-time node rendering
      position(node);
      color(node);
      size(node);
    }
  }

  function disconnectOldNodes() {
    if (!nodes) return;
    for (var i = 0; i < nodes.length; ++i) {
      nodes[i].disconnect(nodeConnector);
    }
  }
}
