class App.ApplicationController extends Tower.Controller
  @layout 'application'

  @param 'page', type: 'Number', allowRange: false, allowNegative: false
  @param 'limit', type: 'Number', allowRange: false, allowNegative: false
  @param 'sort', type: 'Order'
  @param 'fields', type: 'Array'
  @param 'createdAt', type: 'Date'
  @param 'updatedAt', type: 'Date'

  @beforeAction 'bootstrap', only: 'welcome'

  # Example of how you might bootstrap a one-page application.
  bootstrap: (callback) ->
    App.Post.preload()

    data = @bootstrapData = {}
    App.Post.all (error, posts) =>
      data.posts = posts

    data

    callback()

  welcome: ->
    # if @isStale @bootstrapData  
    @render 'welcome', locals: {@bootstrapData}
