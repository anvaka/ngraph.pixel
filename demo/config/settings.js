module.exports = settings;

function settings(renderer, dat) {
  var gui = new dat.GUI();
  addGlobalViewSettings(renderer, gui);
  addLayoutSettings(renderer, gui);
}

function addGlobalViewSettings(renderer, gui) {
  var folder = gui.addFolder('View settings');

  var model = {
    nodeColor: [0xff, 0xff, 0xff],
    linkStartColor: [0x33, 0x33, 0x33],
    linkEndColor: [0x33, 0x33, 0x33],
    nodeSize: 15
  };

  folder.addColor(model, 'nodeColor').onChange(setNodeColor);
  folder.add(model, 'nodeSize', 0, 200).onChange(setNodeSize);
  folder.addColor(model, 'linkStartColor').onChange(setLinkColor);
  folder.addColor(model, 'linkEndColor').onChange(setLinkColor);
  folder.open();

  function setNodeColor() {
    var graph = renderer.graph();
    graph.forEachNode(setCustomNodeColor);
    renderer.focus();

    function setCustomNodeColor(node) {
      renderer.nodeColor(node.id, model.nodeColor);
    }
  }

  function setNodeSize() {
    var graph = renderer.graph();
    graph.forEachNode(setCustomNodeSize);
    renderer.focus();

    function setCustomNodeSize(node) {
      renderer.nodeSize(node.id, model.nodeSize);
    }
  }

  function setLinkColor() {
    var graph = renderer.graph();
    graph.forEachLink(setCustomLinkUI);
    renderer.focus();
  }


  function setCustomLinkUI(link) {
    renderer.linkColor(link.id, model.linkStartColor, model.linkEndColor);
  }
}

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
