# underscore.logger

> Cross-browser and Node.js empowered logging.

## Install

```
npm install underscore.logger
```

### Browser

``` html
<script src="/javascripts/underscore.logger.js" type="text/javascript"></script>
```

### Node.js

``` coffeescript
_console = require('underscore.logger')
```

If you want to make it useable everywhere in node:

``` coffeescript
global._console ||= require('underscore.logger')
```

### Underscore Mixin

``` coffeescript
_.mixin require('underscore.logger').toObject() # _.mixin(_console.toObject())
_.log "It works!"
_.error "Log %s in RED", "something"
```

## Api

``` coffeescript
# set the log level so anything above this won't show up
_console.level  = _console.constructor.DEBUG

# you can access the constructor helpers like this as well:
Logger          = _console.constructor
_console.level  = Logger.DEBUG

# override default colors for any of the log levels
_console.colors[Logger.WARN] = Logger.ANSI.RED

# the first parameter is the message, any following parameters are variables.
_console.trace  "I'm a trace"
_console.debug  "Debug message"
_console.info   "%s %s!", "Hello", "World" #=> "Hello World!"
_console.error  "ERROR!"
_console.fatal  "oh man..."

# set a custom `out` method, which defaults to `console.log`
_console.out    = (message) -> alert(message)

# customize the format too if you'd like, which defaults to `[date] level message`
_console.format = (date, level, message) -> message

# watch the fps to see how your app is performing (`this` is the `Logger.Timer` object)
_console.on "frame" ->
  $("#log-line-template").tmpl(@fps).appendTo("#log-panel")
```

To create a new one, maybe because you want two separate loggers (the edge case), you can use the constructor:

``` coffeescript
myLogger = new _console.constructor
```

## Resources

- http://en.wikipedia.org/wiki/Common_Log_Format

## Development

```
./node_modules/coffee-script/bin/coffee -o lib -w src
./node_modules/jasmine-node/bin/jasmine-node --coffee ./spec
```

## License

(The MIT License)

Copyright &copy; 2011 [Lance Pollard](http://twitter.com/viatropos) &lt;lancejpollard@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
