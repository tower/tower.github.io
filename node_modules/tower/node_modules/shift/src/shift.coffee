Shift =
  Stylus:               require('./shift/stylus')
  Jade:                 require('./shift/jade')
  Haml:                 require('./shift/haml')
  Ejs:                  require('./shift/ejs')
  CoffeeScript:         require('./shift/coffee_script')
  Less:                 require('./shift/less')
  Mustache:             require('./shift/mustache')
  Markdown:             require('./shift/markdown')
  Sprite:               require('./shift/sprite')
  YuiCompressor:        require('./shift/yui_compressor')
  UglifyJS:             require('./shift/uglifyjs')
  
  engine: (extension) ->
    extension = extension.replace(/^\./, '')
    
    @engines[extension] ||= switch extension
      when "styl", "stylus"
        new Shift.Stylus
      when "jade"
        new Shift.Jade
      when "haml"
        new Shift.Haml
      when "ejs"
        new Shift.Ejs
      when "coffee", "coffeescript", "coffee-script"
        new Shift.CoffeeScript
      when "less"
        new Shift.Less
      when "mu", "mustache"
        new Shift.Mustache
      when "md", "mkd", "markdown", "mdown"
        new Shift.Markdown
    
  engines: {}
  
  # Pass in path, it computes the extensions and what engine you'll want
  enginesFor: (path) ->
    engines     = []
    extensions  = path.split("/")
    extensions  = extensions[extensions.length - 1]
    extensions  = extensions.split(".")[1..-1]
    
    for extension in extensions
      engine    = Shift.engine(extension)
      engines.push engine if engine
    
    engines
  
  render: (options, callback) ->
    self        = @
    path        = options.path
    string      = options.string  || require('fs').readFileSync(path, 'utf-8')
    engines     = options.engines || @enginesFor(path)
    
    iterate = (engine, next) ->
      engine.render string, options, (error, output) ->
        if error
          next(error)
        else
          string = output
          next()
    
    require('async').forEachSeries engines, iterate, (error) ->
      callback.call(self, error, string)
  
module.exports = Shift
