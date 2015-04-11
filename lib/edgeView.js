var THREE = require('three');

module.exports = edgeView;

function edgeView(scene) {
  var total = 0;
  var positions; // positions of each edge in the graph (array of objects pairs from, to)
  var colors, points; // buffer attributes that represent edge.
  var geometry, edgeMesh;

  return {
    initPositions: initPositions,
    update: update
  };

  function update() {
    for (var i = 0; i < total; ++i) {
      updateEdgePosition(i);
    }
    geometry.getAttribute('position').needsUpdate = true;
  }

  function initPositions(edgePositions) {
    positions = edgePositions;
    total = positions.length/2;
    points = new Float32Array(total * 6);
    colors = new Float32Array(total * 6);
    for (var i = 0; i < total; ++i) {
      updateEdgePosition(i);
      updateEdgeColor(i);
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

  function updateEdgeColor(i) {
    var i6 = i * 6;
    colors[i6    ] = 0.2;
    colors[i6 + 1] = 0.2;
    colors[i6 + 2] = 0.2;
    colors[i6 + 3] = 0.2;
    colors[i6 + 4] = 0.2;
    colors[i6 + 5] = 0.2;
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
