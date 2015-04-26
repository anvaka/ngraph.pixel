/**
 * This file contains all possible configuration optins for the renderer
 */
module.exports = validateOptions;

var key = require('./lib/keyCode.js');

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
   * Shuold the graph be rendered in 3d space? True by default
   */
  options.is3d = options.is3d === undefined ? true : options.is3d;

  /**
   * Background of the scene in hexadecimal form. Default value is 0x000000 (black);
   */
  options.clearColor = typeof options.clearColor === 'number' ? options.clearColor : 0x000000;

  /**
   * Enable/disable layout toggle between 2d and 3d. Enabled by default.
   * Note: If this feature is enabled, then `options.layoutToggleKey` is used as
   * a keyboard trigger.
   */
  options.toggleEnabled = options.toggleEnabled === undefined ? true : options.toggleEnabled;

  /**
   * Key code which is used to toggle layout between 2d and 3d mode. This code
   * is ignored unless `options.toggleEnabled` is set to true;
   */
  options.layoutToggleKey = typeof options.layoutToggleKey !== 'number' ? key.L : options.layoutToggleKey;

  return options;
}
