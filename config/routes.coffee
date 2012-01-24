Tower.Route.draw ->
  @resources "posts"
  
  @match "(/*path)", to: "application#index"