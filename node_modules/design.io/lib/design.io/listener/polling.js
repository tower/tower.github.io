(function() {
  var Polling;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Polling = (function() {

    __extends(Polling, require('../listener'));

    function Polling() {
      Polling.__super__.constructor.apply(this, arguments);
    }

    return Polling;

  })();

  module.exports = Polling;

}).call(this);
