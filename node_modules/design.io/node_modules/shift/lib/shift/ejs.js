(function() {
  var Ejs, exports;
  Ejs = (function() {
    function Ejs() {}
    Ejs.prototype.engine = function() {
      return require('ejs');
    };
    Ejs.prototype.render = function(content, options, callback) {
      var error, result, self;
      self = this;
      result = "";
      error = null;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      try {
        result = this.engine().render(content, options);
      } catch (e) {
        error = e;
        result = null;
      }
      if (callback) {
        callback.call(self, error, result);
      }
      return result;
    };
    return Ejs;
  })();
  exports = module.exports = Ejs;
}).call(this);
