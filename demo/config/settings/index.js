var addGlobalViewSettings = require('./view.js');
var addLayoutSettings = require('./layout.js');

module.exports = settings;

function settings(renderer, dat) {
  var gui = new dat.GUI();
  addGlobalViewSettings(renderer, gui);
  addLayoutSettings(renderer, gui);
}
