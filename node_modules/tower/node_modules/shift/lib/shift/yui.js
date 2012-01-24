(function() {
  var Yui;
  Yui = (function() {
    function Yui() {}
    Yui.prototype.compressor = function() {
      return require("../../vendor/cssmin").cssmin;
    };
    Yui.prototype.render = function(string) {
      return this.compressor()(string);
    };
    Yui.prototype.compress = function(string) {
      return this.render(string);
    };
    return Yui;
  })();
  module.exports = Yui;
}).call(this);
