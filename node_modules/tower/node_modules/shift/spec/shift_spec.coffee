Shift = require('../lib/shift')

fs = require('fs')

describe "shift", ->
  it 'should render sequentially based on filename', ->
    output = '''
$(document).ready(function() {
  return alert("Hello World");
});
'''
    Shift.render path: "spec/fixtures/javascripts/some.extensions.js.coffee.ejs", locals: {word: "Hello World"}, (error, result) ->
      expect(result).toEqual output
  
  it 'should find engine', ->
    expect(Shift.engine(".less").constructor).toEqual Shift.Less
    expect(Shift.engine("less").constructor).toEqual Shift.Less

  it "should render minified css with yui", ->
    engine    = new Shift.YuiCompressor
    input     = "body { background: red; }"
    output    = "body{background:red}"
    
    engine.render input, (error, result) ->
      expect(result).toEqual output
  
  it "should use the UglifyJS compressor", ->
    engine    = new Shift.UglifyJS
    input     = '''
    $(document).ready(function() {
      alert("ready!")
    });
    '''
    output    = '$(document).ready(function(){alert("ready!")})'
    
    engine.render input, (error, result) ->
      expect(result).toEqual output
  
  it "should render stylus", ->
    engine    = new Shift.Stylus
    input     = fs.readFileSync("./spec/fixtures/stylesheets/stylus.styl", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/stylesheets/stylus.css", "utf-8")
    engine.render input, (error, result) ->
      expect(result).toEqual output
  
  it "should throw error in stylus", ->
    engine    = new Shift.Stylus
    path      = "spec/fixtures/stylesheets/stylus-error.styl"
    input     = fs.readFileSync(path, "utf-8")
    engine.render input, path: path, (error, result) ->
      expect(error.message).toEqual '''
stylus:2
   1| body
 > 2|   background: red@

expected "indent", got "outdent", spec/fixtures/stylesheets/stylus-error.styl

'''
  
  it "should render jade", ->
    engine    = new Shift.Jade
    input     = fs.readFileSync("./spec/fixtures/views/jade.jade", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/views/jade.html", "utf-8")
    engine.render input, (error, result) ->
      expect(result).toEqual output
    
  it "should render haml", ->
    engine    = new Shift.Haml
    input     = fs.readFileSync("./spec/fixtures/views/haml.haml", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/views/haml.html", "utf-8")
    engine.render input, (error, result) ->
      expect(result).toEqual output
  
  # it "should render doT", ->
  #   engine    = new Shift.DoT
  #   input     = fs.readFileSync("./spec/fixtures/views/doT.js", "utf-8")
  #   output    = fs.readFileSync("./spec/fixtures/views/doT.html", "utf-8")
  #   engine.render input, (error, result) ->
  #     expect(result).toEqual output

  it "should render ejs", ->
    engine    = new Shift.Ejs
    input     = fs.readFileSync("./spec/fixtures/views/ejs.ejs", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/views/ejs.html", "utf-8")
    engine.render input, {locals: {name: "My Name"}}, (error, result) ->
      expect(result).toEqual output

  it "should render coffee script", ->
    engine    = new Shift.CoffeeScript
    input     = fs.readFileSync("./spec/fixtures/javascripts/coffee.coffee", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/javascripts/coffee.js", "utf-8")
    engine.render input, {locals: {name: "My Name"}}, (error, result) ->
      expect(result).toEqual output
      
  it "should throw error with coffee script", ->
    engine    = new Shift.CoffeeScript
    path      = "spec/fixtures/javascripts/coffee-error.coffee"
    input     = fs.readFileSync(path, "utf-8")
    engine.render input, path: path, (error, result) ->
      expect(error.message).toEqual 'missing ", starting on line 2, spec/fixtures/javascripts/coffee-error.coffee'

  it "should render less", ->
    engine    = new Shift.Less
    input     = fs.readFileSync("./spec/fixtures/stylesheets/less.less", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/stylesheets/less.css", "utf-8")
    engine.render input, (error, result) ->
      expect(result).toEqual output
    
  it "should render mustache", ->
    engine    = new Shift.Mustache
    input     = fs.readFileSync("./spec/fixtures/views/mustache.mustache", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/views/mustache.html", "utf-8")
    locals = {name: "World", say_hello: -> "Hello" }
    engine.render input, locals: locals, (error, result) ->
      expect(result).toEqual output
    
  it "should render markdown", ->
    engine    = new Shift.Markdown
    input     = fs.readFileSync("./spec/fixtures/docs/markdown.markdown", "utf-8")
    output    = fs.readFileSync("./spec/fixtures/docs/markdown.html", "utf-8")
    engine.render input, (error, result) ->
      expect(result).toEqual output
  
  it 'should allow preprocessing stylus', ->
    input = '''
div
  box-shadow: 0 -2px 2px            hsl(220, 20%, 40%),
    0 -10px 10px          hsl(220, 20%, 20%),
    0 0 15px              black,
    
    inset 0 5px 1px       hsla(220, 80%, 10%, 0.4), 
    inset 0 0 5px         hsla(220, 80%, 10%, 0.1),
    inset 0 20px 15px     hsla(220, 80%, 100%, 1),
    
    inset 0 1px 0         hsl(219, 20%, 0%), 
    
    inset 0 -50px 50px -40px hsla(220, 80%, 10%, .3),  /* gradient to inset */
    
    inset 0 -1px 0px      hsl(220, 20%, 20%),
    inset 0 -2px 0px      hsl(220, 20%, 40%),
    inset 0 -2px 1px      hsl(220, 20%, 65%)  
'''
    engine    = new Shift.Stylus
    output    = '''
div {
  box-shadow: 0 -2px 2px #525f7a, 0 -10px 10px #29303d, 0 0 15px #000, inset 0 5px 1px rgba(5,19,46,0.40), inset 0 0 5px rgba(5,19,46,0.10), inset 0 20px 15px #fff, inset 0 1px 0 #000, inset 0 -50px 50px -40px rgba(5,19,46,0.30), inset 0 -1px 0px #29303d, inset 0 -2px 0px #525f7a, inset 0 -2px 1px #94a0b8;
}

'''
    options   =
      preprocessor: (content) ->
        content.replace /(\s+)(.*),\s+(?:\/\*.*\*\/)?\s*/mg, (_, indent, attribute) ->
          "#{indent}#{attribute.replace(/\s+/g, " ")}, "
        
    engine.render input, options, (error, result) ->
      expect(result).toEqual output
      
    Shift.Stylus.preprocessor = (content) ->
      content.replace /(\s+)(.*),\s+(?:\/\*.*\*\/)?\s*/mg, (_, indent, attribute) ->
        "#{indent}#{attribute.replace(/\s+/g, " ")}, "
    
    engine.render input, (error, result) ->
      expect(result).toEqual output
    
###      
  describe "sprite", ->
    it "should create a sprite map", ->
      engine = new Shift.Sprite
      images = _.map ["facebook.png", "github.png", "linkedIn.png", "twitter.png"], (file) -> "./spec/fixtures/images/#{file}"
      
      data = {}
      
      runs ->
        engine.montage images: images, (result) ->
          data = result
      
      waits 500
      
      runs ->
        expect(data[0]).toEqual
          format: 'png', width: 64, height: 64, depth: 8, path: './spec/fixtures/images/facebook.png', slug: 'facebook', y: 5
        expect(data[1]).toEqual
          format: 'png', width: 64, height: 64, depth: 8, path: './spec/fixtures/images/github.png', slug: 'github', y: 69
        expect(data[2]).toEqual
          format: 'png', width: 64, height: 64, depth: 8, path: './spec/fixtures/images/linkedIn.png', slug: 'linkedIn', y: 133
        expect(data[3]).toEqual
          format: 'png', width: 64, height: 64, depth: 8, path: './spec/fixtures/images/twitter.png', slug: 'twitter', y: 197
    
    it "should render stylus", ->
      engine = new Shift.Sprite
      images = _.map ["facebook.png", "github.png", "linkedIn.png", "twitter.png"], (file) -> "./spec/fixtures/images/#{file}"
      
      stylus = ""
      
      runs ->
        engine.render images: images, format: "stylus", (result) ->
          stylus = result
          
      waits 1000
      
      runs ->
        expect(stylus).toEqual '''
sprite(slug, x, y)
  if slug == "facebook"
    background: url(./spec/fixtures/images/facebook.png) 0px 5px no-repeat;
  else if slug == "github"
    background: url(./spec/fixtures/images/github.png) 0px 69px no-repeat;
  else if slug == "linkedIn"
    background: url(./spec/fixtures/images/linkedIn.png) 0px 133px no-repeat;
  else slug == "twitter"
    background: url(./spec/fixtures/images/twitter.png) 0px 197px no-repeat;

        '''
        
    it "should render css", ->
      engine = new Shift.Sprite
      images = _.map ["facebook.png", "github.png", "linkedIn.png", "twitter.png"], (file) -> "./spec/fixtures/images/#{file}"
      
      stylus = ""
      
      runs ->
        engine.render images: images, format: "css", name: "sprite", (result) ->
          stylus = result
          
      waits 1000
      
      runs ->
        expect(stylus).toEqual '''
.facebook-sprite {
  background: url(./spec/fixtures/images/facebook.png) 0px 5px no-repeat;
}
.github-sprite {
  background: url(./spec/fixtures/images/github.png) 0px 69px no-repeat;
}
.linkedIn-sprite {
  background: url(./spec/fixtures/images/linkedIn.png) 0px 133px no-repeat;
}
.twitter-sprite {
  background: url(./spec/fixtures/images/twitter.png) 0px 197px no-repeat;
}

        '''
###        