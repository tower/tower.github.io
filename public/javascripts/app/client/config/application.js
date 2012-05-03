var App,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

App = (function(_super) {

  __extends(App, _super);

  App.name = 'App';

  function App() {
    return App.__super__.constructor.apply(this, arguments);
  }

  App.configure(function() {
    this.use(Tower.Middleware.Agent);
    this.use(Tower.Middleware.Location);
    return this.use(Tower.Middleware.Router);
  });

  return App;

})(Tower.Application);

window.App = App;

App.initialze();
