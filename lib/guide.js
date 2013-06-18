
/**
 * Module dependencies.
 */

var fs = require('fs');
var md = require('marked');

/**
 * Expose `guide`.
 */

exports = module.exports = guide;

/**
 * Expose `collection`.
 */

exports.collection = {};

/**
 * Cache a guide by name
 */

function guide(name) {
  exports.collection[name] = md(fs.readFileSync('node_modules/tower-guides/guides/' + name + '.md', 'utf-8'));

  return exports;
}