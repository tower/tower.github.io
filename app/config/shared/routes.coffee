Tower.Route.draw ->
  # @match '(/*path)', to: 'application#index'
  @match '/:dir/:slug', to: 'posts#show' if Tower.isClient
  @match '/:slug', to: 'application#welcome' if Tower.isServer
  @match '/', to: 'application#welcome'
