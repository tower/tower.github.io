class Jade
  engine: -> require('jade')
  
  render: (content, options, callback) ->
    self          = @
    result        = ""
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    path          = options.path
    
    preprocessor  = options.preprocessor || @constructor.preprocessor
    content       = preprocessor.call(@, content, options) if preprocessor
    
    @engine().render content, options, (error, data) ->
      result = data
      error.message += ", #{path}" if error && path
      callback.call(self, error, result) if callback
      
    result
    
exports = module.exports = Jade
