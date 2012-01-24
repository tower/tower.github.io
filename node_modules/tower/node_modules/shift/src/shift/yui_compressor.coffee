class YuiCompressor
  compressor: ->
    require("../../vendor/cssmin").cssmin
    
  render: (content, options, callback) ->
    if typeof(options) == "function"
      callback    = options
      options     = {}
    options     ||= {}
    path          = options.path
    error         = null
    
    try
      result = @compressor()(content)
    catch e
      error = e
      error.message += ", #{path}" if path
      
    callback.call(@, error, result) if callback
    
    result
    
  compress: (string) ->
    @render(string)
    
module.exports = YuiCompressor
