(function() {
  var Less, exports;
  Less = (function() {
    function Less() {}
    Less.prototype.engine = function() {
      return require('less');
    };
    Less.prototype.render = function(content, options, callback) {
      var engine, parser, path, result, self;
      result = "";
      self = this;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      path = options.path;
      engine = this.engine();
      parser = new engine.Parser(options);
      parser.parse(content, function(error, tree) {
        if (error) {
          if (path) {
            error.message += ", " + path;
          }
        } else {
          result = tree.toCSS();
        }
        if (callback) {
          return callback.call(self, error, result);
        }
      });
      return result;
    };
    return Less;
  })();
  exports = module.exports = Less;
}).call(this);
