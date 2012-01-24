# Design.io

> CSS3 + TextMate + Node.js = Real-Time Web Design

## Video Tutorial

[![Here's a video tutorial on vimeo](http://i.imgur.com/JunAS.png)](http://player.vimeo.com/video/31589739?title=0&amp;byline=0&amp;portrait=0&autoplay=true)

Here is the [example app](https://github.com/viatropos/design.io-example) for the video.

## Install

```
npm install design.io -g
```

## Extensions

- [design.io-stylesheets](https://github.com/viatropos/design.io-stylesheets)
- [design.io-javascripts](https://github.com/viatropos/design.io-javascripts)

## Usage

Add the [design.io.js](https://raw.github.com/viatropos/design.io/master/design.io.js) client to your html head.  You also need jQuery, and [Socket.IO](http://socket.io/).

``` html
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>
<script type="text/javascript" src="/javascripts/socket.io.js"></script>
<script type="text/javascript" src="/javascripts/design.io.js"></script>
```

You can just [grab socket.io from here](https://raw.github.com/viatropos/design.io/master/spec/app/javascripts/socket.io.js) as well.

Next, create a file named `Watchfile` at the root of your project, and start the watcher with this command:

```
design.io
```

If you want to install it locally and run the command, do this:

```
npm install design.io # no '-g' flag
node_modules/design.io/bin/design.io
```

## The Watchfile

This is what a blank `watch` task looks like in a Watchfile:

``` coffeescript
# ./Watchfile

watch /\.(styl|less|sass|scss|css)$/
  create: (path) ->
    @update(path)
    
  update: (path) ->
      
  delete: (path) ->
  
  client:
    # id, path, body
    create: (data) ->
      # this is in the browser's context!
    
    update: (data) ->
      
    delete: (data) ->
      
```

You can update the Watchfile and the changes will be affected in real time by adding this extension:

``` coffeescript
# Watchfile

require('design.io').extension('watchfile')()

# ... more watchers
```

## Using Extensions

Design.io comes with two basic extensions:

1. Stylesheet watching/compressing/injecting
2. JavaScript watching/compressing/injecting

You can include them in your `Watchfile` like this:

``` coffeescript
require("design.io").extension("watchfile")
require("design.io").extension("stylesheets", compress: true)
require("design.io").extension("javascripts")

watch /\.md$/ # some custom one...
```

## Connecting with a Remote Server

``` coffeescript
designer = require("design.io").connection(app || 4181)

app.post '/design.io/:action', (request, response) ->
  designer.emit request.params.action, request.body
  response.send request.params.action
```

## Possibilities

- Incrementing values with keyboard and swipe pad in textmate.  http://old.nabble.com/Incremental-Sequences-for-Replacement-td27741019.html
- http://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node
- http://francisshanahan.com/index.php/2011/stream-a-webcam-using-javascript-nodejs-android-opera-mobile-web-sockets-and-html5/

## License

(The MIT License)

Copyright &copy; 2011 [Lance Pollard](http://twitter.com/viatropos) &lt;lancejpollard@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
