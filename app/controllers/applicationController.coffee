class App.ApplicationController extends Tower.Controller
  @layout "application"
  
  index: ->
    @render template: "index"
