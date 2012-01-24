(function() {
  var Jade, exports;
  Jade = (function() {
    function Jade() {}
    Jade.prototype.engine = function() {
      return require('jade');
    };
    Jade.prototype.render = function(content, options, callback) {
      var path, preprocessor, result, self;
      self = this;
      result = "";
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
      this.engine().render(content, options, function(error, data) {
        result = data;
        if (error && path) {
          error.message += ", " + path;
        }
        if (callback) {
          return callback.call(self, error, result);
        }
      });
      return result;
    };
    return Jade;
  })();
  exports = module.exports = Jade;
}).call(this);
