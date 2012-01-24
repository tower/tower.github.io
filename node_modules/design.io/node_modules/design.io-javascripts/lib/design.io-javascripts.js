(function() {
  var File, Pathfinder, Shift, fs, _path;
  Shift = require('shift');
  _path = require('path');
  fs = require('fs');
  Pathfinder = require('pathfinder');
  File = Pathfinder.File;
  module.exports = function() {
    var args, compressor, debug, ignore, importPaths, options, outputPath, pathfinder, touchDependencies, write, writeMethod;
    pathfinder = Watcher.pathfinder;
    args = Array.prototype.slice.call(arguments, 0, arguments.length);
    options = typeof args[args.length - 1] === "object" ? args.pop() : {};
    if (!(args.length > 0)) {
      args[0] = /\.(coffee|js)$/;
    }
    if (options.hasOwnProperty("patterns")) {
      args[0] || (args[0] = options.patterns);
    }
    outputPath = options.outputPath;
    writeMethod = options.write;
    importPaths = options.paths || [];
    debug = options.hasOwnProperty("debug") && options.debug === true;
    ignore = options.ignore;
    if (options.hasOwnProperty("compress") && options.compress === true) {
      compressor = new Shift.UglifyJS;
    }
    write = function(path, string) {
      var _outputPath;
      if (writeMethod) {
        return writeMethod.call(this, path, string);
      } else if (outputPath) {
        _outputPath = outputPath.call(this, path);
        if (_outputPath) {
          return File.write(_outputPath, string);
        }
      }
    };
    touchDependencies = function(file) {
      var dependentPath, dependentPaths, _i, _len, _results;
      dependentPaths = pathfinder.dependsOn(file.absolutePath());
      if (dependentPaths && dependentPaths.length > 0) {
        _results = [];
        for (_i = 0, _len = dependentPaths.length; _i < _len; _i++) {
          dependentPath = dependentPaths[_i];
          _results.push(File.touch(dependentPath));
        }
        return _results;
      }
    };
    return Watcher.create(args, {
      ignore: ignore,
      toSlug: function(path) {
        return path.replace(process.cwd() + '/', '').replace(/[\/\.]/g, '-');
      },
      initialize: function(path, callback) {
        return this.update(path, callback);
      },
      update: function(path, callback) {
        var self;
        self = this;
        return pathfinder.compile(path, function(error, string, file) {
          if (error) {
            return callback(error);
          }
          if (compressor) {
            return compressor.render(string, function(error, result) {
              if (error) {
                return self.error(error);
              }
              self.broadcast({
                body: result,
                slug: self.toSlug(path)
              });
              write.call(self, path, result);
              touchDependencies(file);
              return callback();
            });
          } else {
            self.broadcast({
              body: string,
              slug: self.toSlug(path)
            });
            write.call(self, path, string);
            touchDependencies(file);
            return callback();
          }
        });
      },
      client: {
        debug: debug,
        update: function(data) {
          if (this.debug) {
            console.log(data.body);
          }
          return eval("(function() { " + data.body + " })")();
        }
      }
    });
  };
}).call(this);
