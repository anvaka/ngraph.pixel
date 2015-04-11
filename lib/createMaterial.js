var THREE = require('three');
var glslify = require('glslify');

module.exports = createParticleMaterial;

function createParticleMaterial() {

  var vertexShader = glslify(__dirname + '/node-vertex.glsl');
  var fragmentShader = glslify(__dirname + '/node-fragment.glsl');

  var attributes = {
    size: {
      type: 'f',
      value: null
    },
    customColor: {
      type: 'c',
      value: null
    }
  };

  var uniforms = {
    color: {
      type: "c",
      value: new THREE.Color(0xffffff)
    },
    texture: {
      type: "t",
      value: THREE.ImageUtils.loadTexture(require('./defaultTexture.js'))
    }
  };

  return new THREE.ShaderMaterial({
    uniforms: uniforms,
    attributes: attributes,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
}
