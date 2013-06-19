var path = require('path');
var exec = require('child_process').exec;
var docCB = require('tower-doc-cookbook');

exports = module.exports = doc;
exports.towerModules = [];

function doc(moduleName) {
  exports.towerModules.push(moduleName);
}

exports.compile = function(){
  var args = [
    'tower',
    'create',
    'doc:tower',
    '-t', path.resolve(__dirname, '../views/api.html'),
    '-m', exports.towerModules.join(',')
  ];

  // XXX: Hacky way to run the doc tower command
  require(docCB('tower')).create({}, args, function(){});
};

exports.clear = function(){
  exports.towerModules.length = 0;
};