var THREE = require('three');
var MeshLine = require('three.meshline');

module.exports = edgeView;

function edgeView(scene, options) {
  var total = 0;
  var edges; // edges of the graph
  var edgesMeshes = [];
  var positionDirtyMeshes = [];

  // declares bindings between model events and update handlers
  var edgeConnector = {
    width: toWidth,
    fromColor: fromColor,
    'from.position': fromPosition,
    'to.position': toPosition,
  };

  return {
    init: init,
    update: update,
    needsUpdate: needsUpdate,
    setFromColor: fromColor,
    setFromPosition: fromPosition,
    setToPosition: toPosition,
    setWidth: toWidth,
    refresh: refresh,
  };

  function needsUpdate() {
    return positionDirtyMeshes.length > 0;
  }

  function update() {
    if (positionDirtyMeshes.length > 0) {
      for (var m = 0; m < positionDirtyMeshes.length; ++m){
        var edgeMesh = edgesMeshes[positionDirtyMeshes[m]]
        edgeMesh.line.setGeometry(edgeMesh.geo)
      }
      positionDirtyMeshes = [];
    }
  }

  function init(edgeCollection) {
    disconnectOldEdges();
    edges = edgeCollection;
    total = edges.length;

    for (var i = 0; i < total; ++i) {
      var edge = edges[i];
      if (options.activeLink) edge.connect(edgeConnector);

      toWidth(edge);

      fromPosition(edge);
      toPosition(edge);

      fromColor(edge);
    }

    if (edgesMeshes) {
      for (var m = 0; m < edgesMeshes.length; ++m){
        scene.remove(edgesMeshes[m]);
      }
    }
    edgesMeshes = [];
    for (var e = 0; e < total; ++e) {
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      var line = new MeshLine.MeshLine();
      line.setGeometry(geometry);
      var material = new MeshLine.MeshLineMaterial({
        useMap: false,
        lineWidth:1,
        opacity: 1,
        color: new THREE.Color(0x333333),
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        resolution: new THREE.Vector2( window.innerWidth, window.innerHeight )
      });
      edgesMeshes[e] = new THREE.Mesh( line.geometry, material );
      edgesMeshes[e].geo = geometry;
      edgesMeshes[e].line = line;
      scene.add(edgesMeshes[e]);
    }
  }

  function refresh() {
    for (var i = 0; i < total; ++i) {
      var edge = edges[i];

      toWidth(edge);

      fromPosition(edge);
      toPosition(edge);

      fromColor(edge);
    }
  }

  function disconnectOldEdges() {
    if (!edges) return;
    if (!options.activeLink) return;
    for (var i = 0; i < edges.length; ++i) {
      edges[i].disconnect(edgeConnector);
    }
  }

  function fromColor(edge) {
    var fromColorHex = edge.fromColor;
    if(edge.idx <= edgesMeshes.length && undefined != edgesMeshes[edge.idx]) {
      edgesMeshes[edge.idx].material.uniforms.color.value.r=((fromColorHex >> 16) & 0xFF)/0xFF;
      edgesMeshes[edge.idx].material.uniforms.color.value.g=((fromColorHex >> 8) & 0xFF)/0xFF;
      edgesMeshes[edge.idx].material.uniforms.color.value.b=(fromColorHex & 0xFF)/0xFF;
    }
  }

  function fromPosition(edge) {
    if(edge.idx <= edgesMeshes.length && undefined != edgesMeshes[edge.idx]) {
      edgesMeshes[edge.idx].geo.vertices[0].x = edge.from.position.x
      edgesMeshes[edge.idx].geo.vertices[0].y = edge.from.position.y
      edgesMeshes[edge.idx].geo.vertices[0].z = edge.from.position.z
      positionDirtyMeshes.push(edge.idx)
    }
  }

  function toPosition(edge) {
    if(edge.idx <= edgesMeshes.length && undefined != edgesMeshes[edge.idx]) {
      edgesMeshes[edge.idx].geo.vertices[1].x = edge.to.position.x
      edgesMeshes[edge.idx].geo.vertices[1].y = edge.to.position.y
      edgesMeshes[edge.idx].geo.vertices[1].z = edge.to.position.z
      positionDirtyMeshes.push(edge.idx)
    }
  }

  function toWidth(edge) {
    if(edge.idx <= edgesMeshes.length && undefined != edgesMeshes[edge.idx]) {
      edgesMeshes[edge.idx].material.uniforms.lineWidth.value=edge.width;
    }
  }
}
