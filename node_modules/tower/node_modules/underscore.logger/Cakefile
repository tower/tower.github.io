{spawn, exec}   = require 'child_process'
fs              = require 'fs'
sys             = require 'util'

task 'coffee', ->
  coffee = spawn './node_modules/coffee-script/bin/coffee', ['-o', 'lib', '-w', 'src']
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()

task 'spec', 'Run jasmine specs', ->
  spec = spawn './node_modules/jasmine-node/bin/jasmine-node', ['--coffee', './spec']
  spec.stdout.on 'data', (data) ->
    data = data.toString().replace(/^\s*|\s*$/g, '')
    if data.match(/\u001b\[3\dm[\.F]\u001b\[0m/)
      sys.print data
    else
      data = "\n#{data}" if data.match(/Finished/)
      console.log data
  spec.stderr.on 'data', (data) -> console.log data.toString().trim()
