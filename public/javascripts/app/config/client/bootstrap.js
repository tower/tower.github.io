(function() {

  App.bootstrap = function(data) {
    Ember.Handlebars.bootstrap(Ember.$(document));
    Tower.NetConnection.transport = Tower.StoreTransportAjax;
    if (Tower.env === 'development') {
      Tower.StoreTransportAjax.defaults.async = false;
    }
    App.initialize();
    App.listen();
    Ember.run.autorun();
    return Ember.run.currentRunLoop.flush('render');
  };

  if (Tower.env === 'development') {
    $(function() {
      var watch, watchInterval,
        _this = this;
      watch = function() {
        if (Tower.connection) {
          App.watchers.watch();
          return clearInterval(watchInterval);
        }
      };
      return watchInterval = setInterval(watch, 500);
    });
  }

}).call(this);
