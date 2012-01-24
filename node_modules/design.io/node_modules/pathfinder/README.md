# Pathfinder.js

> Code for the File Ninja

## Install

```
npm install pathfinder
```

## Goals

- make it so any node.js code works in the browser
- make it easy to piece together code from modules without `require` (copy the code from one place to another)
- compile out asset digests
- make it easy to wrap any code in `require` for the browser.
- be a foundation for any rich watching functionality

## API

### Directives

JavaScript and CSS files can have two types of directives: `@import` and `@include`.

Files referenced with the `@import` directive will be directly copied into the location of the directive.

Files referenced with the `@include` directive will be compiled into either JavaScript or CSS (from CoffeeScript, Stylus, etc.) and then copied into the location of the directive.  That's the only difference from the `@import` directive.

For instance

``` javascript
// @import './models'
// @import './views'
// @import './controllers'

alert "application"
```

might become this CoffeeScript

``` javascript
alert "models"
alert "views"
alert "controllers"

alert "application"
```

which is then rendered to JavaScript

``` javascript
alert("models");
alert("views");
alert("controllers");

alert("application");
```

## Paths

Paths work just like they do in Node.js:

- `./relative/path`: relative paths are relative to the current file
- `/absolute/path`: absolute paths are relative to the current project
- `library`: libraries are keys

### Compile

``` javascript
Pathfinder  = require 'pathfinder'
pathfinder  = new Pathfinder(root: process.cwd())
    
pathfinder.compile (file, string) ->
  console.log string
  
pathfinder.requirements()
```

### Write to file

``` javascript
outputPath = (file) ->
  relativePath = file.relativePath()
  if relativePath.match(/^app\/javascripts\/(.*)/)
    "public/#{RegExp.$1}"
  else
    "public/#{relativePath}"
    
pathfinder.write outputPath: outputPath, (file, string) ->
  console.log("Done!") unless file
```

### Find the first file from an ambiguous source

``` javascript
file = pathfinder.find "application"
```

### Update with a Watcher

Pathfinder.js doesn't include a watcher, but it's setup to be easy to use with one.  It's used in Design.io for example.

``` javascript
watch /\.(js|coffee)/
  update: (file) ->
    file.dirname()
```

### Compile `require` libraries for the browser

``` javascript
patfinder.writeRequirements()
```

### Manifests and Digests

Outputs a JSON map of key to compressed, digest version of a file!

## License

(The MIT License)

Copyright &copy; 2011 [Lance Pollard](http://twitter.com/viatropos) &lt;lancejpollard@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
