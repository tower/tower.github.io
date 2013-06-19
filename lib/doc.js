
/**
 * Module dependencies.
 */

var path = require('path');
var exec = require('child_process').exec;
var docCB = require('tower-doc-cookbook');

/**
 * Expose `doc`.
 */

exports = module.exports = doc;

/**
 * Expose `modules`.
 */

exports.modules = [];

/**
 * Add a doc to the compiler.
 */

function doc(moduleName) {
  exports.modules.push(moduleName);
}

/**
 * Compile all docs.
 */

exports.compile = function(){
  var args = [
    'tower',
    'create',
    'doc:tower',
    '-t', path.resolve(__dirname, '../views/api.html'),
    '-m', exports.modules.join(',')
  ];

  console.log(args)

  // XXX: Hacky way to run the doc tower command
  try {
    require(docCB('tower')).create({}, args, function(){}); 
  } catch (e) {
    console.log(e);
    console.log('You may just have to download the modules so the docs can be generated');
  }
};

exports.clear = function(){
  exports.towerModules.length = 0;
};