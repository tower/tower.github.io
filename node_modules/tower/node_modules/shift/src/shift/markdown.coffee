class Markdown
  engine: -> require('markdown')
  
  render: (content, options, callback) ->
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options ||= {}
    error = null
    
    preprocessor = options.preprocessor || @constructor.preprocessor
    content = preprocessor.call(@, content, options) if preprocessor
    
    try
      result = @engine().parse content
    catch e
      error = e
    
    callback.call(@, error, result) if callback
    
    result
    
exports = module.exports = Markdown
