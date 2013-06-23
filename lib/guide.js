
/**
 * Module dependencies.
 */

var fs = require('fs');
var md = require('marked');
var string = require('tower-strcase');

/**
 * Expose `guide`.
 */

exports = module.exports = guide;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Cache a guide by name
 */

function guide(name) {
  exports.collection.push(exports.compile(name));
}

exports.compile = function(name) {
  var content = fs.readFileSync('node_modules/tower-guides/guides/' + name + '.md', 'utf-8');
  return {
    name: name,
    title: string.titleCase(name),
    content: content,
    href: '#' + name
  };
}