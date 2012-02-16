fs = require('fs')
require(Tower.root + "/app/models/post")

class App.ApplicationController extends Tower.Controller
  @layout "application"
  
  index: ->
    pages = ["home", "application", "models", "views", "controllers", "assets", "generators", "stores", "testing"]
    
    for page, i in pages
      content = fs.readFileSync(process.cwd() + "/public/docs/#{page}.html", "utf-8")
      pages[i] = new App.Post(
        title:  Tower.Support.String.camelize(page)
        body:   content
        slug:   page
      )
    
    if @request.location.segments.length == 0
      currentPage = pages[0]
    else
      for page in pages
        for segment in @request.location.segments
          if segment == page.slug
            currentPage = page
            break
    
    currentPage ||= pages[0]
    
    @render template: "index", locals: pages: pages, url: @request.url, currentPage: currentPage