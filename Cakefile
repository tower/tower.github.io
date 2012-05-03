require 'tower'
#knox  = require 'knox'
fs    = require 'fs'
{spawn, exec} = require('child_process')
async = require 'async'
coffeekup = require('coffeekup')

task 'environment', ->
  Tower.env = 'production'
  Tower.Application.instance().initialize()
  
task 'routes', ->
  invoke 'environment'

  result  = []
  routes  = Tower.Route.all()

  result

task 'assets:upload', ->
  invoke 'assets:upload:s3'

task 'assets:upload:s3', ->
  invoke 'environment'
  
  client  = knox.createClient Tower.secrets.s3
  
  Tower.Application.Assets.upload (from, to, headers, callback) ->
    client.putFile from, to, headers, callback

task 'assets:bundle', ->
  invoke 'environment'
  Tower.Application.Assets.bundle()
  
task 'assets:stats', 'Table displaying uncompressed, minified, and gzipped asset sizes', ->
  invoke 'environment'
  Tower.Application.Assets.stats()
  
task 'compile', ->
  try fs.mkdirSync("public/docs")
  try fs.mkdirSync("public/docs/guides")
  
  class Post
    constructor: (options = {}) ->
      @[key] = value for key, value of options
      
  wiki  = "/Users/viatropos/Documents/git/personal/plugins/tower.js/wiki/en"
  posts = []
  
  template = ->
    post = posts.shift()
    header class: "header subhead", id: "overview", ->
      text post.body
      nav class: "subnav", ->
        ul class: "nav nav-pills", ->
          for post in posts
            li ->
              a href: "##{post.slug}", -> post.title
    for post in posts
      section class: "section", id: post.slug, ->
        post.body
  
  compileFile = (path, next) ->
    console.log path
    file = "#{wiki}/#{path}"
    slug = path.split("/")
    slug = slug[slug.length - 1].split(".")[0]
    fs.readFile file, "utf-8", (error, body) ->
      return next(new Error("No content found in #{file}")) if body == undefined
      toMarkdown file, body, (error, body) ->
        post = new Post(
          file: file, 
          slug: slug, 
          body: body,
          title: slug
        )
        posts.push(post)
        next()
        
  compilePage = (paths, next) ->
    posts.length = 0
    async.forEachSeries paths, compileFile, (error) ->
      result = coffeekup.render template, locals: posts: posts
      fs.writeFileSync "public/docs/#{paths[0].replace(/\.md$/, ".html")}", result
      next()
      
  toMarkdown = (file, content, callback) ->
    command   = spawn 'ruby', ["#{__dirname}/lib/md.rb"]
    command.stdout.setEncoding('utf8')
    command.stdout.on 'data', (data) -> 
      callback(null, data)
      
    command.stdout.setEncoding('utf8')
    command.stderr.on 'data', (data) -> 
      data = data.toString().trim()
      console.log file
      console.log "error"
      console.log data
      callback(data)
    
    command.stdin.write JSON.stringify(input: content)
    command.stdin.end()
    
  overview = [
    "guides.md"
  ]
  
  models = [
    "guides/models.md"
    "guides/models/attributes.md"
    "guides/models/callbacks.md"
    "guides/models/changes.md"
    "guides/models/finders.md"
    "guides/models/querying.md"
    "guides/models/naming.md"
    "guides/models/persistence.md"
    "guides/models/validations.md"
  ]
  
  controllers = [
    "guides/controllers.md",
    "guides/controllers/actions.md",
    "guides/controllers/events.md",
    "guides/controllers/params.md",
    "guides/controllers/rendering.md",
    "guides/controllers/resources.md",
    "guides/controllers/routes.md"
  ]
  
  views = [
    "guides/views.md",
    "guides/views/layouts.md",
    "guides/views/forms.md",
    "guides/views/tables.md",
    "guides/views/templates.md"
  ]
  
  http = [
    "guides/http.md",
    "guides/http/cookies.md",
    "guides/http/session.md",
    "guides/http/caching.md",
    "guides/http/cdn.md"
  ]
  
  assets = [
    "guides/assets.md",
    "guides/assets/pipeline.md",
    "guides/assets/helpers.md",
    "guides/assets/twitter-bootstrap.md"
  ]
  
  generators = [
    "guides/generators.md",
    "guides/generators/application-generator.md",
    "guides/generators/scaffold-generator.md",
    "guides/generators/model-generator.md",
    "guides/generators/view-generator.md",
    "guides/generators/controller-generator.md"
  ]
  
  application = [
    "guides/application.md",
    "guides/application/structure.md",
    "guides/application/package-json.md",
    "guides/application/configuration.md",
    "guides/application/server.md",
    "guides/application/client.md",
    "guides/application/environments.md",
    "guides/application/dotfiles.md",
    "guides/application/commands.md",
    "guides/application/helpers.md",
    "guides/application/i18n.md",
    "guides/application/watchfile.md"
  ]
  
  testing = [
    "guides/testing.md",
    "guides/testing/models.md",
    "guides/testing/browser.md",
    "guides/testing/factories.md"
  ]
  
  stores = [
    "guides/stores.md",
    "guides/stores/persistence.md",
    "guides/stores/querying.md",
    "guides/stores/memory.md",
    "guides/stores/mongodb.md"
  ]
  
  utils = [
    "guides/utils.md",
    "guides/utils/string.md"
    "guides/utils/date.md"
  ]
  
  deployment = [
    "guides/deployment.md",
    "guides/deployment/environment.md",
    "guides/deployment/heroku.md"
  ]
  
  development = [
    "guides/development.md",
    "guides/development/environment.md"
    "guides/development/git-workflow.md"
    "guides/development/style-guide.md"
  ]
  
  contributing = [
    "guides/contributing.md",
    "guides/contributing/issues.md"
    "guides/contributing/code.md"
    "guides/contributing/documentation.md"
    "guides/contributing/translations.md"
  ]
  
  pages = [overview, models, controllers, views, http, stores, assets, generators, application, testing, utils, deployment, development, contributing]
  
  async.forEachSeries pages, compilePage, (error) ->
    
task 'copy-docs', ->
  wrench  = require 'wrench'
  from    = "/Users/viatropos/Documents/git/personal/plugins/tower.js/doc"
  to      = "./public/api"
  wrench.copyDirSyncRecursive(from, to)