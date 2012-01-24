(function() {
  var Stylus;
  Stylus = (function() {
    function Stylus() {}
    Stylus.prototype.engine = function() {
      return require('stylus');
    };
    Stylus.prototype.render = function(content, options, callback) {
      var engine, path, preprocessor, result, self;
      result = "";
      self = this;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      path = options.path;
      preprocessor = options.preprocessor || this.constructor.preprocessor;
      if (preprocessor) {
        content = preprocessor.call(this, content, options);
      }
      engine = this.engine();
      engine.render(content, options, function(error, data) {
        result = data;
        if (error && path) {
          error.message = error.message.replace(/\n$/, ", " + path + "\n");
        }
        if (callback) {
          return callback.call(self, error, result);
        }
      });
      return result;
    };
    return Stylus;
  })();
  module.exports = Stylus;
}).call(this);
