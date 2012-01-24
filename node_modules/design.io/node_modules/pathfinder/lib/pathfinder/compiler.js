(function() {
  var Compiler, File, Lookup, Shift, async, detective;

  async = require('async');

  detective = require('detective');

  File = require('./file');

  Lookup = require('./lookup');

  Shift = require('shift');

  Compiler = (function() {

    Compiler.body = function(body, filename) {
      return "require.define({\"" + filename + "\": function (require, module, exports, __dirname, __filename) {\n  " + body + "\n}});";
    };

    Compiler.package = function(body, filename) {
      return "require.modules[" + filename + "] = function () {\n  return " + body + ";\n};";
    };

    Compiler.entry = function(body, filename) {
      return "require.define(" + filename + ", function (require, module, exports, __dirname, __filename) {\n  " + body + "\n});\nrequire(" + filename + ");";
    };

    Compiler.client = function(body, filename) {
      return "require.define(" + filename + ", function (require, module, exports, __dirname, __filename) {\n  module.exports = (function() {\n    " + body + "\n  }).call(this);\n});";
    };

    function Compiler(lookup) {
      this.lookup = lookup || new Lookup;
    }

    Compiler.DIRECTIVE_PATTERN = /(\ *)(?:\/\/|#) @(include|import) *['"]([^'"]+)['"][\ ]*?\n?/g;

    Compiler.prototype.requirements = function(string) {
      return detective.find(string);
    };

    Compiler.prototype.directives = function(string, callback) {
      var result;
      result = [];
      string.replace(this.constructor.DIRECTIVE_PATTERN, function(_, tabs, directive, source) {
        result.push({
          type: directive,
          source: source
        });
        return _;
      });
      return result;
    };

    Compiler.prototype.wrap = function(body, file) {
      var path;
      path = file.relativePath();
      return this.constructor.body(body, path);
    };

    Compiler.prototype.compile = function() {
      var absolutePath, callback, directives, file, iterateDirectives, iterator, lookup, options, pattern, postprocess, preprocess, recursive, relativeRoot, renderOptions, result, self, string, template, terminator, wrap, _ref, _require;
      _ref = this._args.apply(this, arguments), file = _ref.file, options = _ref.options, callback = _ref.callback;
      self = this;
      lookup = this.lookup;
      pattern = this.constructor.DIRECTIVE_PATTERN;
      wrap = options.wrap === true;
      recursive = options.hasOwnProperty("recursive") ? options.recursive : true;
      _require = options.hasOwnProperty("require") ? options.require : false;
      preprocess = options.preprocess;
      postprocess = options.postprocess;
      iterator = options.iterator;
      terminator = "\n";
      result = null;
      template = options.template !== false;
      renderOptions = options.renderOptions || {};
      try {
        string = file.read();
        if (preprocess) string = preprocess.call(self, file, string);
        absolutePath = file.absolutePath();
        relativeRoot = File.absolutePath(file.dirname());
        directives = self.directives(string);
        lookup.addPath(absolutePath);
        iterateDirectives = function(directive, nextDirective) {
          var nestedFile;
          nestedFile = lookup.find(directive.source, relativeRoot);
          if (!nestedFile) {
            return callback.call(self, new Error("Cannot find " + directive.type + " ed file: #" + directive.source + " in " + file.path), string, file);
          }
          lookup.addDependency(absolutePath, nestedFile.absolutePath(), directive.type);
          options.template = directive.type === "include";
          self.compile(nestedFile, options, function(error, nestedString) {
            if (error) return callback.call(self, error, null, file);
            directive.content = nestedString;
            if (iterator) iterator.call(self, nestedString, nestedFile);
            return nextDirective();
          });
          return options.template = template;
        };
        async.forEachSeries(directives, iterateDirectives, function() {
          var key, process, value, _renderOptions;
          string = string.replace(pattern, function(_, tabs, directive, source) {
            var i, line, lines, _len;
            lines = directives.shift().content.split("\n");
            for (i = 0, _len = lines.length; i < _len; i++) {
              line = lines[i];
              lines[i] = tabs + line;
            }
            return lines.join("\n") + terminator;
          });
          process = function(output) {
            var iterateRequirements, requirements;
            string = output;
            if (postprocess) string = postprocess.call(self, string, file);
            if (_require && template) {
              requirements = self.requirements(string).strings;
            } else {
              requirements = [];
            }
            iterateRequirements = function(requirement, nextRequirement) {
              var nestedFile;
              if (requirement.match(/(^\.+\/)/)) {
                nestedFile = lookup.find(requirement, relativeRoot);
                lookup.addDependency(absolutePath, nestedFile.absolutePath(), 'require');
                return self.compile(nestedFile, options, function(error, nestedString) {
                  if (iterator) iterator.call(self, nestedString, nestedFile);
                  return nextRequirement();
                });
              } else {
                lookup.addDependency(absolutePath, requirement, 'require');
                return nextRequirement();
              }
            };
            return async.forEachSeries(requirements, iterateRequirements, function() {
              if (wrap) string = self.wrap(string, file);
              result = string;
              if (callback) return callback.call(self, null, string, file);
            });
          };
          if (template) {
            _renderOptions = {
              path: file.path,
              string: string
            };
            for (key in renderOptions) {
              value = renderOptions[key];
              _renderOptions[key] = value;
            }
            return Shift.render(_renderOptions, function(error, output) {
              if (error) return callback.call(self, error, null, file);
              return process(output);
            });
          } else {
            return process(string);
          }
        });
      } catch (error) {
        if (callback) {
          callback.call(self, error, null, file);
        } else {
          throw error;
        }
      }
      return result;
    };

    Compiler.prototype._args = function() {
      var args, callback, file, last, options;
      args = Array.prototype.slice.call(arguments, 0, arguments.length);
      last = args[args.length - 1];
      if (typeof last === "function") callback = args.pop();
      last = args[args.length - 1];
      if (typeof last === "object" && last.constructor === Object) {
        options = args.pop();
      } else {
        options = {};
      }
      file = args.shift();
      if (typeof file === "string") file = new File(file);
      return {
        file: file,
        options: options,
        callback: callback
      };
    };

    Compiler.prototype._extend = function(to, from) {
      var key, value;
      for (key in from) {
        value = from[key];
        to[key] = value;
      }
      return to;
    };

    return Compiler;

  })();

  module.exports = Compiler;

}).call(this);
