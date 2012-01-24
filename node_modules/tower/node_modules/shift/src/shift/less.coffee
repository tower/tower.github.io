class Less
  engine: -> require('less')
  
  # need to specify lookup paths for imports!
  # compile "background: red", paths: ["./app/assets/stylesheets"]
  render: (content, options, callback) ->
    result        = ""
    self          = @
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    path          = options.path
    
    engine = @engine()
    parser = new engine.Parser(options)
    
    parser.parse content, (error, tree) -> 
      if error
        error.message += ", #{path}" if path
      else
        result = tree.toCSS()
        
      callback.call(self, error, result) if callback
    
    result
    
exports = module.exports = Less
