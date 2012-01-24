(function() {
  var YuiCompressor;
  YuiCompressor = (function() {
    function YuiCompressor() {}
    YuiCompressor.prototype.compressor = function() {
      return require("../../vendor/cssmin").cssmin;
    };
    YuiCompressor.prototype.render = function(content, options, callback) {
      var error, path, result;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      path = options.path;
      error = null;
      try {
        result = this.compressor()(content);
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
    YuiCompressor.prototype.compress = function(string) {
      return this.render(string);
    };
    return YuiCompressor;
  })();
  module.exports = YuiCompressor;
}).call(this);
