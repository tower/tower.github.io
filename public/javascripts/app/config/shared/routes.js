
Tower.Route.draw(function() {
  if (Tower.isClient) {
    this.match('/:dir/:slug', {
      to: 'posts#show'
    });
  }
  if (Tower.isServer) {
    this.match('/:slug', {
      to: 'application#welcome'
    });
  }
  return this.match('/', {
    to: 'application#welcome'
  });
});
