(function() {
  var Haml, exports;
  Haml = (function() {
    function Haml() {}
    Haml.prototype.engine = function() {
      return require('hamljs');
    };
    Haml.prototype.render = function(content, options, callback) {
      var result;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      result = this.engine().render(content, options || {});
      callback.call(this, null, result);
      return result;
    };
    return Haml;
  })();
  exports = module.exports = Haml;
}).call(this);
