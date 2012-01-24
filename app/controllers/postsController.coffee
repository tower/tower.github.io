class App.PostsController extends Tower.Controller
  @param "title"
  @param "body"
  
  new: ->
    @post = new App.Post
    
    @respondWith @post, (format) =>
      format.json => @render json: @post
  
  create: ->
    @_create (success, failure) =>
      success.json => @render json: @resource
      failure.json => @render status: 404