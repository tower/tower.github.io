
Tower.Route.draw(function() {
  this.resources("posts");
  return this.match("(/*path)", {
    to: "application#index"
  });
});
