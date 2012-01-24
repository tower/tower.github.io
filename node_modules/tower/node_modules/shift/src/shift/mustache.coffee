class Mustache
  engine: -> require('mustache')
  
  render: (content, options, callback) ->
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    path          = options.path
    error         = null
    
    preprocessor  = options.preprocessor || @constructor.preprocessor
    content       = preprocessor.call(@, content, options) if preprocessor
    
    try
      result      = @engine().to_html content, options.locals
    catch e
      error       = e
      result      = null
      error.message += ", #{path}" if path
      
    callback.call(@, error, result) if callback
    
    result
    
exports = module.exports = Mustache
