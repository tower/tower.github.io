# Design.IO JavaScripts Extension

## Install

```
npm install design.io-javascripts
```

## Usage

``` coffeescript
# Watchfile

require('design.io-javascripts')
  compress: true
  ignore:   /ignore-me/
  # outputPath: (path) ->
  #   "public/something.js"
  # write: (path, string) ->
  #   console.log("do something manually with it")
```

Then just make sure you have `design.io` running from your project's root:

```
design.io
```
