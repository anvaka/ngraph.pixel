/**
 * Controls available settings for the gobal view settings (like node colors,
 * size, 3d/2d, etc.)
 */
module.exports = addGlobalViewSettings;

function addGlobalViewSettings(renderer, gui) {
  var folder = gui.addFolder('View settings');

  var model = {
    nodeColor: [0xff, 0xff, 0xff],
    linkStartColor: [0x33, 0x33, 0x33],
    linkEndColor: [0x33, 0x33, 0x33],
    nodeSize: 15,
    is3d: true,
    stable: changeStable
  };

  var stableController = folder.add(model, 'stable').setName('Pause Layout');
  folder.addColor(model, 'nodeColor').onChange(setNodeColor);
  folder.add(model, 'nodeSize', 0, 200).onChange(setNodeSize);
  folder.addColor(model, 'linkStartColor').onChange(setLinkColor);
  folder.addColor(model, 'linkEndColor').onChange(setLinkColor);
  folder.add(model, 'is3d').onChange(set3dMode);
  folder.open();

  // whenever user changes mode via API/keyboard, reflect it in our UI:
  renderer.on('modeChanged', updateMode);
  renderer.on('stable', updateStableUI);

  function changeStable() {
    renderer.stable(!renderer.stable());
    renderer.focus();
  }

  function updateStableUI() {
    var isStable = renderer.stable();
    stableController.setName(isStable ? 'Resume Layout' : 'Pause Layout');
  }

  function updateMode(newMode) {
    model.is3d = newMode;
    updateGUI(gui);
  }

  function set3dMode() {
    renderer.is3d(model.is3d);
    renderer.focus();
  }

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

function updateGUI(root) {
  // Iterate over all controllers
  updateControllers(root.__controllers);
  Object.keys(root.__folders).forEach(function(key) {
    updateGUI(root.__folders[key]);
  });
}

function updateControllers(controllers) {
  for (var i in controllers) {
    controllers[i].updateDisplay();
  }
}
