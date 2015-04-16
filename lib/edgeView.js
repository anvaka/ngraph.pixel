var THREE = require('three');

module.exports = edgeView;

function edgeView(scene) {
  var total = 0;
  var positions; // positions of each edge in the graph (array of objects pairs from, to)
  var colors, points; // buffer attributes that represent edge.
  var geometry, edgeMesh;
  var colorDirty;

  return {
    initPositions: initPositions,
    update: update,
    color: color
  };

  function update() {
    for (var i = 0; i < total; ++i) {
      updateEdgePosition(i);
    }
    geometry.getAttribute('position').needsUpdate = true;
    if (colorDirty) {
      geometry.getAttribute('color').needsUpdate = true;
      colorDirty = false;
    }
  }

  function color(idx, fromColorHex, toColorHex) {
    updateEdgeColor(idx/2, fromColorHex, toColorHex);
  }

  function initPositions(edgePositions) {
    positions = edgePositions;
    total = positions.length/2;
    points = new Float32Array(total * 6);
    var colorsInitialized = (colors !== undefined) && colors.length === total * 6;
    if (!colorsInitialized) colors = new Float32Array(total * 6);

    for (var i = 0; i < total; ++i) {
      updateEdgePosition(i);
      if (!colorsInitialized) updateEdgeColor(i);
    }
    geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors
    });

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    if (edgeMesh) {
      scene.remove(edgeMesh);
    }

    edgeMesh = new THREE.Line(geometry, material, THREE.LinePieces);
    edgeMesh.frustumCulled = false;
    scene.add(edgeMesh);
  }

  function updateEdgeColor(i, fromColorHex, toColorHex) {
    var i6 = i * 6;
    if (fromColorHex === undefined) {
      colors[i6    ] = 0.2;
      colors[i6 + 1] = 0.2;
      colors[i6 + 2] = 0.2;
    } else {
      colors[i6    ] = ((fromColorHex >> 16) & 0xFF)/0xFF;
      colors[i6 + 1] = ((fromColorHex >> 8) & 0xFF)/0xFF;
      colors[i6 + 2] = (fromColorHex & 0xFF)/0xFF;
    }

    if (toColorHex === undefined) toColorHex = fromColorHex;

    colors[i6 + 3] = ((toColorHex >> 16) & 0xFF)/0xFF;
    colors[i6 + 4] = ((toColorHex >> 8) & 0xFF)/0xFF;
    colors[i6 + 5] = ( toColorHex & 0xFF)/0xFF;

    colorDirty = true;
  }

  function updateEdgePosition(i) {
    var from = positions[2 * i];
    var to = positions[2 * i + 1];
    var i6 = i * 6;
    points[i6] = from.x;
    points[i6 + 1] = from.y;
    points[i6 + 2] = from.z;
    points[i6 + 3] = to.x;
    points[i6 + 4] = to.y;
    points[i6 + 5] = to.z;
  }
}
