class Ejs
  engine: -> require('ejs')
  
  render: (content, options, callback) ->
    self          = @
    result        = ""
    error         = null
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    
    try
      result      = @engine().render(content, options)
    catch e
      error       = e
      result      = null
    
    callback.call(self, error, result) if callback
    
    result
    
exports = module.exports = Ejs
