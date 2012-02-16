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
  class Post
    constructor: (options = {}) ->
      @[key] = value for key, value of options
      
  wiki  = "/Users/viatropos/Documents/git/personal/plugins/tower.js/wiki/docs"
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
    file = "#{wiki}/#{path}"
    slug = path.split("/")
    slug = slug[slug.length - 1].split(".")[0]
    fs.readFile file, "utf-8", (error, body) ->
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
    "home.md"
  ]
  
  models = [
    "models.md",
    "models/attributes.md",
    "models/callbacks.md",
    "models/changes.md",
    "models/finders.md",
    "models/querying.md",
    "models/naming.md",
    "models/persistence.md",
    "models/validations.md"
  ]
  
  controllers = [
    "controllers.md",
    "controllers/actions.md",
    "controllers/events.md",
    "controllers/params.md",
    "controllers/rendering.md",
    "controllers/resources.md",
    "controllers/routes.md"
  ]
  
  views = [
    "views.md",
    "views/layouts.md",
    "views/forms.md",
    "views/tables.md",
    "views/templates.md"
  ]
  
  assets = [
    "assets.md",
    "assets/pipeline.md",
    "assets/helpers.md",
    "assets/twitter-bootstrap.md"
  ]
  
  generators = [
    "generators.md",
    "generators/application-generator.md",
    "generators/scaffold-generator.md",
    "generators/model-generator.md",
    "generators/view-generator.md",
    "generators/controller-generator.md"
  ]
  
  application = [
    "application.md",
    "application/structure.md",
    "application/package-json.md",
    "application/configuration.md",
    "application/server.md",
    "application/client.md",
    "application/environments.md",
    "application/dotfiles.md",
    "application/commands.md",
    "application/helpers.md",
    "application/i18n.md",
    "application/watchfile.md"
  ]
  
  testing = [
    "testing.md",
    "testing/models.md",
    "testing/browser.md",
    "testing/factories.md"
  ]
  
  stores = [
    "stores.md",
    "stores/persistence.md",
    "stores/querying.md",
    "stores/memory.md",
    "stores/mongodb.md"
  ]
  
  pages = [overview, models, controllers, views, stores, assets, generators, application, testing]
  
  async.forEachSeries pages, compilePage, (error) ->

task 'less2stylus', ->
  less2stylus = (string) ->
    string = string
      .replace(/^(\ *)(.+)\ +\{\ *\n?\ */mg, "$1$2\n$1  ") # remove opening brackets
      .replace(/^(\ *)([^\ \n]+)\ +\{\ *\n?\ */mg, "$1$2\n$1  ") # remove opening brackets
      .replace(/\ *\{\ *\n*/g, "\n") # remove opening brackets again (some random cases I'm too lazy to think through)
      .replace(/\ *\}\ *\n*/g, "\n") # remove closing brackets
      .replace(/\;\ *?$/gm, "") # remove semicolons
      .replace(/@(\w+):(\ *)\ /g, (_, $1, $2) -> # replace @variable: with $variable =
        "$#{$1}#{$2} = "
      )
      .replace(/\@(\w+)/g, (_, $1) -> (if $1 == "import" then _ else "$#{$1}"))
      .replace(/\.([\w-]+)\(/g, "$1(") # replace mixins from .border-radius(4px) to border-radius(4px)
      .replace(/,\ */g, ", ") # make all commas have 1 space after them
      .replace(/\.less/g, ".styl")
      .replace(/(\ *)(.+)>\ *([\w-]+)\(/g, "$1$2>\n$1  $3(")
      # need to make sure things like -webkit-background-size are left-aligned
      # need to handle expressions
      .replace(/\ *$/g, "") # remove trailing whitespace

    lines   = string.split("\n")
    indent  = 0

    for line, i in lines
      if line.match(/^[^\/]?\ *[\w-\*]+: /) # property name
        lines[i]  = line.replace(/^\ */, Array(indent + 1).join(" "))
      else if line.match(/^\ +[\w-]+\([^\$\)]/) # mixin
        line
      else if !line.match(/\/{2}/)
        indent    = line.match(/^(\ *)/)[1].length + 2
      if line.match(/e\(\%\(/)
        lines[i]  = "#{Array(indent + 1).join(" ")}// #{line}"

    lines.join("\n")
  
  
  names = fs.readdirSync("lib/stylesheets/bootstrap")
  for name in names
    stylus = less2stylus(fs.readFileSync("lib/stylesheets/bootstrap/#{name}", "utf-8"))
    fs.writeFileSync("lib/stylesheets/bootstrap/#{name.replace(/\.less$/, ".styl")}", stylus)