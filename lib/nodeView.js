var THREE = require('three');
var particleMaterial = require('./createMaterial.js')();

module.exports = nodeView;

function nodeView(scene) {
  var total;
  var positions;
  var colors, points, sizes;
  var geometry, particleSystem;

  return {
    initPositions: initPositions,
    update: update
  };

  function update() {
    for (var i = 0; i < total; ++i) {
      setNodePosition(i * 3, positions[i]);
    }
    geometry.getAttribute('position').needsUpdate = true;
  }

  function setNodePosition(nodeIdx, pos) {
    points[nodeIdx + 0] = pos.x;
    points[nodeIdx + 1] = pos.y;
    points[nodeIdx + 2] = pos.z;
  }

  function setNodeUI(idx, color, size) {
    var idx3 = idx * 3;
    colors[idx3 + 0] = (color & 0xff0000) >> 16;
    colors[idx3 + 1] = (color & 0x00ff00) >> 8;
    colors[idx3 + 2] = color & 0xff;

    sizes[idx] = size;
  }

  function initPositions(nodePositions) {
    total = nodePositions.length;
    positions = nodePositions;
    points = new Float32Array(total * 3);
    colors = new Float32Array(total * 3);
    sizes = new Float32Array(total);
    geometry = new THREE.BufferGeometry();

    geometry.addAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    if (particleSystem) {
      scene.remove(particleSystem);
    }

    particleSystem = new THREE.PointCloud(geometry, particleMaterial);
    particleSystem.name = 'nodes';
    particleSystem.frustumCulled = false;

    scene.add(particleSystem);

    for (var i = 0; i < total; ++i) {
      setNodePosition(i * 3, positions[i]);
      setNodeUI(i, 0xffffff, 15);
    }
  }
}
