(function() {

  Tower.Route.draw(function() {
    return this.match('/', {
      to: 'application#welcome'
    });
  });

}).call(this);
