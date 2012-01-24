class Haml
  engine: -> require('hamljs')
  
  render: (content, options, callback) ->
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    
    result = @engine().render(content, options || {})
    callback.call(@, null, result)
    result
    
exports = module.exports = Haml
