class Stylus
  engine: -> require('stylus')
  
  render: (content, options, callback) ->
    result        = ""
    self = @
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    path          = options.path
    
    preprocessor  = options.preprocessor || @constructor.preprocessor
    content       = preprocessor.call(@, content, options) if preprocessor
    
    engine        = @engine()
    
    engine.render content, options, (error, data) -> 
      result      = data
      error.message = error.message.replace(/\n$/, ", #{path}\n") if error && path
      callback.call(self, error, result) if callback
      
    result
    
module.exports = Stylus
