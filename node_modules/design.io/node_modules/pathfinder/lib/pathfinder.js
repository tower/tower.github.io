(function() {
  var Pathfinder;

  require('coffee-script');

  Pathfinder = (function() {

    Pathfinder.Compiler = require('./pathfinder/compiler');

    Pathfinder.File = require('./pathfinder/file');

    Pathfinder.Lookup = require('./pathfinder/lookup');

    function Pathfinder(root) {
      if (root == null) root = process.cwd();
      this.root = root;
      this.lookup = new Pathfinder.Lookup({
        root: root
      });
      this.compiler = new Pathfinder.Compiler(this.lookup);
    }

    Pathfinder.prototype.compile = function() {
      var _ref;
      return (_ref = this.compiler).compile.apply(_ref, arguments);
    };

    Pathfinder.prototype.requirements = function() {
      return this.lookup.requirements;
    };

    Pathfinder.prototype.directories = function() {
      return [];
    };

    Pathfinder.prototype.dependsOn = function(path) {
      return this.lookup.dependsOn(path);
    };

    Pathfinder.prototype.find = function(source, relativeRoot) {
      return this.lookup.find(source, relativeRoot);
    };

    Pathfinder.prototype.paths = function() {};

    Pathfinder.prototype.bootstrap = function() {};

    Pathfinder.instance = function() {
      return this._instance || (this._instance = new Pathfinder);
    };

    return Pathfinder;

  })();

  module.exports = Pathfinder;

}).call(this);
