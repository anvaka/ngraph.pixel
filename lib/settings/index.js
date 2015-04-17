var dat = require('exdat');
var addGlobalViewSettings = require('./view.js');
var addLayoutSettings = require('./layout.js');

module.exports = createSettingsView;

function createSettingsView(settingsAreVisible, renderer) {
  var gui;

  if (settingsAreVisible) initGUI();

  var api = {
    show: show,
    destroy: destroy,
    gui: getGUI
  };

  return api;

  function getGUI() {
    return gui;
  }

  function destroy() {
    if (gui) {
      gui.destroy();
      gui = null;
      settingsAreVisible = false;
    }
  }

  function show(isVisible) {
    if (isVisible === undefined) {
      return settingsAreVisible;
    }

    if (!isVisible && gui) {
      gui.close();
    } else if (isVisible && !gui) {
      initGUI();
    } else if (isVisible && gui) {
      gui.open();
    }

    settingsAreVisible = isVisible;
  }

  function initGUI() {
    gui = new dat.GUI();
    addGlobalViewSettings(renderer, gui);
    addLayoutSettings(renderer, gui);
  }
}
