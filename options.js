/**
 * This file contains all possible configuration optins for the renderer
 */
module.exports = validateOptions;

var createLayout = require('pixel.layout'); // the default layout

function validateOptions(options) {
  options = options || {};

  /**
   * Where to render the graph? Assume `document.body` by default.
   */
  options.container = options.container || document.body;

  /**
  /* Let the renderer automatically fit the graph to available screen space.
   * Enabled by default.
   * Note: The autofit will only be executed until first user input.
   */
  options.autoFit = options.autoFit !== undefined ? options.autoFit : true;

  /**
   * Background of the scene in hexadecimal form. Default value is 0x000000 (black);
   */
  options.clearColor = typeof options.clearColor === 'number' ? options.clearColor : 0x000000;


  /**
   * Clear color opacity from 0 (transparent) to 1 (opaque); Default value is 1;
   */
  options.clearAlpha = typeof options.clearAlpha === 'number' ? options.clearAlpha : 1;

  /**
   * Layout algorithm factory. Valid layout algorithms are required to have just two methods:
   * `getNodePosition(nodeId)` and `step()`. See `pixel.layout` module for the
   * reference: https://github.com/anvaka/pixel.layout
   */
  options.createLayout = typeof options.createLayout === 'function' ? options.createLayout : createLayout;

  /**
   * Experimental API: How link should be rendered?
   */
  options.link = typeof options.link === 'function' ? options.link : defaultLink;

  /**
   * Experimental API: How node should be rendered?
   */
  options.node = typeof options.node === 'function' ? options.node : defaultNode;

  /**
   * Experimental API: When activeNode is explicitly set to false, then no proxy
   * object is created. Which means actual updates to the node have to be manual
   *
   * TODO: Extend this documentation if this approach sticks.
   */
  options.activeNode = typeof options.activeNode === 'undefined' ? true : options.activeNode;

  /**
   * Experimental API: When activeLink is explicitly set to false, then no proxy
   * object is created for links. Which means actual updates to the link have to be manual
   *
   * TODO: Extend this documentation if this approach sticks.
   */
  options.activeLink = typeof options.activeLink === 'undefined' ? true : options.activeLink;

  return options;
}

function defaultNode(/* node */) {
  return { size: 20, color: 0xFF0894 };
}

function defaultLink(/* link */) {
  return { fromColor: 0xFFFFFF,  toColor: 0xFFFFFF };
}
