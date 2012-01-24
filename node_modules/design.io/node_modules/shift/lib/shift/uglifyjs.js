(function() {
  var UglifyJS;
  UglifyJS = (function() {
    function UglifyJS() {}
    UglifyJS.prototype.compressor = function() {
      return require("uglify-js").uglify;
    };
    UglifyJS.prototype.parser = function() {
      return require("uglify-js").parser;
    };
    UglifyJS.prototype.render = function(content, options, callback) {
      var ast, error, path, result;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      path = options.path;
      error = null;
      try {
        ast = this.parser().parse(content);
        ast = this.compressor().ast_mangle(ast);
        ast = this.compressor().ast_squeeze(ast);
        result = this.compressor().gen_code(ast);
      } catch (e) {
        error = e;
        if (path) {
          error.message += ", " + path;
        }
      }
      if (callback) {
        callback.call(this, error, result);
      }
      return result;
    };
    UglifyJS.prototype.compress = function(content) {
      return this.render(content);
    };
    return UglifyJS;
  })();
  module.exports = UglifyJS;
}).call(this);
