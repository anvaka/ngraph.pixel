/**
 * Controls physics engine settings (like spring length, drag coefficient, etc.
 */
module.exports = addLayoutSettings;

function addLayoutSettings(renderer, gui) {
  var model = createLayoutModel(renderer);
  var folder = gui.addFolder('Layout settings');

  folder.add(model, 'springLength', 0, 1000).onChange(setSimulatorOption('springLength'));
  folder.add(model, 'springCoeff', 0, 0.1).onChange(setSimulatorOption('springCoeff'));
  folder.add(model, 'gravity', -50, 0).onChange(setSimulatorOption('gravity'));
  folder.add(model, 'theta', 0, 2).onChange(setSimulatorOption('theta'));
  folder.add(model, 'dragCoeff', 0, 1).onChange(setSimulatorOption('dragCoeff'));
  folder.add(model, 'timeStep', 1, 100).onChange(setSimulatorOption('timeStep'));

  function setSimulatorOption(optionName) {
    return function() {
      // we need to call this every time, since renderer can update layout at any time
      var layout = renderer.layout();
      var simulator = layout.simulator;
      simulator[optionName](model[optionName]);
      renderer.stable(false);
      renderer.focus();
    };
  }

  function createLayoutModel(renderer) {
    var layout = renderer.layout();
    var simulator = layout.simulator;
    return {
      springLength: simulator.springLength(),
      springCoeff: simulator.springCoeff(),
      gravity: simulator.gravity(),
      theta: simulator.theta(),
      dragCoeff: simulator.dragCoeff(),
      timeStep: simulator.timeStep()
    };
  }
}
