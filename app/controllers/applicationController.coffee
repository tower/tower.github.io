fs = require('fs')

class App.ApplicationController extends Tower.Controller
  @layout "application"
  
  index: ->
    pages = _.map ["application", "models", "views", "controllers", "http", "assets", "generators", "stores", "testing", "utils", "deployment", "development", "contributing"], (i) ->
      "guides/#{i}"
    pages = ['guides'].concat(pages)
    
    for page, i in pages
      content = fs.readFileSync("#{Tower.root}/public/docs/#{page}.html", "utf-8")
      pages[i] = App.Post.create
        title:  Tower.Support.String.camelize(page)
        body:   content
        slug:   page
        
    if @request.location.segments.length == 0
      currentPage = pages[0]
    else
      for page in pages
        if @request.location.segments.join('/') == page.slug
          currentPage = page
          break
    
    currentPage ||= pages[0]
    
    @render "index", locals: pages: pages, url: @request.url, currentPage: currentPage
