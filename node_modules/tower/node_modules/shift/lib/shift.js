(function() {
  var Shift;
  Shift = {
    Stylus: require('./shift/stylus'),
    Jade: require('./shift/jade'),
    Haml: require('./shift/haml'),
    Ejs: require('./shift/ejs'),
    CoffeeScript: require('./shift/coffee_script'),
    Less: require('./shift/less'),
    Mustache: require('./shift/mustache'),
    Markdown: require('./shift/markdown'),
    Sprite: require('./shift/sprite'),
    YuiCompressor: require('./shift/yui_compressor'),
    UglifyJS: require('./shift/uglifyjs'),
    engine: function(extension) {
      var _base;
      extension = extension.replace(/^\./, '');
      return (_base = this.engines)[extension] || (_base[extension] = (function() {
        switch (extension) {
          case "styl":
          case "stylus":
            return new Shift.Stylus;
          case "jade":
            return new Shift.Jade;
          case "haml":
            return new Shift.Haml;
          case "ejs":
            return new Shift.Ejs;
          case "coffee":
          case "coffeescript":
          case "coffee-script":
            return new Shift.CoffeeScript;
          case "less":
            return new Shift.Less;
          case "mu":
          case "mustache":
            return new Shift.Mustache;
          case "md":
          case "mkd":
          case "markdown":
          case "mdown":
            return new Shift.Markdown;
        }
      })());
    },
    engines: {},
    enginesFor: function(path) {
      var engine, engines, extension, extensions, _i, _len;
      engines = [];
      extensions = path.split("/");
      extensions = extensions[extensions.length - 1];
      extensions = extensions.split(".").slice(1);
      for (_i = 0, _len = extensions.length; _i < _len; _i++) {
        extension = extensions[_i];
        engine = Shift.engine(extension);
        if (engine) {
          engines.push(engine);
        }
      }
      return engines;
    },
    render: function(options, callback) {
      var engines, iterate, path, self, string;
      self = this;
      path = options.path;
      string = options.string || require('fs').readFileSync(path, 'utf-8');
      engines = options.engines || this.enginesFor(path);
      iterate = function(engine, next) {
        return engine.render(string, options, function(error, output) {
          if (error) {
            return next(error);
          } else {
            string = output;
            return next();
          }
        });
      };
      return require('async').forEachSeries(engines, iterate, function(error) {
        return callback.call(self, error, string);
      });
    }
  };
  module.exports = Shift;
}).call(this);
