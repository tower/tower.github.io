(function() {
  var Uglifier;
  Uglifier = (function() {
    function Uglifier() {}
    Uglifier.prototype.compressor = function() {
      return require("uglify-js").uglify;
    };
    Uglifier.prototype.parser = function() {
      return require("uglify-js").parser;
    };
    Uglifier.prototype.render = function(string) {
      var ast;
      ast = this.parser().parse(string);
      ast = this.compressor().ast_mangle(ast);
      ast = this.compressor().ast_squeeze(ast);
      return this.compressor().gen_code(ast);
    };
    Uglifier.prototype.compress = function(string) {
      return this.render(string);
    };
    return Uglifier;
  })();
  module.exports = Uglifier;
}).call(this);
