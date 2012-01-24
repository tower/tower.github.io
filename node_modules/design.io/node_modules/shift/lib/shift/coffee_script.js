(function() {
  var CoffeeScript, exports;
  CoffeeScript = (function() {
    function CoffeeScript() {}
    CoffeeScript.prototype.engine = function() {
      return require('coffee-script');
    };
    CoffeeScript.prototype.render = function(content, options, callback) {
      var error, path, preprocessor, result;
      result = "";
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      path = options.path;
      if (!options.hasOwnProperty("bare")) {
        options.bare = true;
      }
      preprocessor = options.preprocessor || this.constructor.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      try {
        result = this.engine().compile(content, options);
      } catch (e) {
        result = null;
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
    return CoffeeScript;
  })();
  exports = module.exports = CoffeeScript;
}).call(this);
