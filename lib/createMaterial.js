var THREE = require('three');

module.exports = createParticleMaterial;

function createParticleMaterial() {

  var vertexShader = require('./node-vertex.js');
  var fragmentShader = require('./node-fragment.js');
  var defaultTexture = require('./defaultTexture.js');

  var loader = new THREE.TextureLoader();
  var texture = loader.load(defaultTexture);

  var uniforms = {
    color: {
      type: "c",
      value: new THREE.Color(0xffffff)
    },
    texture: {
      type: "t",
      value: texture
    }
  };

  var material =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
  });
  return material;
}
