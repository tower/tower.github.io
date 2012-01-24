(function() {
  var Logger;

  Logger = (function() {

    Logger.FATAL = 0;

    Logger.ERROR = 1;

    Logger.WARN = 2;

    Logger.INFO = 3;

    Logger.DEBUG = 4;

    Logger.TRACE = 5;

    Logger.levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

    Logger.ANSI = {
      OFF: 0,
      BOLD: 1,
      ITALIC: 3,
      UNDERLINE: 4,
      BLINK: 5,
      INVERSE: 7,
      HIDDEN: 8,
      BLACK: 30,
      RED: 31,
      GREEN: 32,
      YELLOW: 33,
      BLUE: 34,
      MAGENTA: 35,
      CYAN: 36,
      WHITE: 37,
      BLACK_BG: 40,
      RED_BG: 41,
      GREEN_BG: 42,
      YELLOW_BG: 43,
      BLUE_BG: 44,
      MAGENTA_BG: 45,
      CYAN_BG: 46,
      WHITE_BG: 47
    };

    Logger.colors = [Logger.ANSI.MAGENTA, Logger.ANSI.RED, Logger.ANSI.YELLOW, Logger.ANSI.GREEN, Logger.ANSI.CYAN, Logger.ANSI.BLUE];

    function Logger(options) {
      if (options == null) options = {};
      this.level = options.level || Logger.DEBUG;
      if (options.out) this.out = options.out;
      this.colorized = options.hasOwnProperty("colorized") ? options.colorized : false;
      this.colors = Logger.colors.concat();
    }

    Logger.prototype.out = function(message) {
      return console.log(message);
    };

    Logger.prototype.colorize = function() {
      var color, colors, i, result, string;
      colors = Array.prototype.slice.call(arguments);
      string = colors.shift();
      result = "";
      i = 0;
      while (color = colors[i]) {
        result += "\033[" + color + "m";
        i++;
      }
      result += "" + string + "\033[" + Logger.ANSI.OFF + "m";
      return result;
    };

    Logger.prototype.format = function(date, level, message) {
      return "[" + (date.toUTCString()) + "] " + Logger.levels[level] + " " + message;
    };

    Logger.prototype._log = function(level, args) {
      var i, message;
      if (level <= this.level) {
        i = 0;
        message = args[0].replace(/%s/g, function() {
          return args[i++];
        });
        message = this.format(new Date(), level, message);
        if (this.colorized) message = this.colorize(message, this.colors[level]);
        return this.out(message);
      }
    };

    Logger.prototype.log = function() {
      return console.log.apply(console, arguments);
    };

    Logger.prototype.fatal = function() {
      return this._log(Logger.FATAL, arguments);
    };

    Logger.prototype.error = function() {
      return this._log(Logger.ERROR, arguments);
    };

    Logger.prototype.warn = function() {
      return this._log(Logger.WARN, arguments);
    };

    Logger.prototype.info = function() {
      return this._log(Logger.INFO, arguments);
    };

    Logger.prototype.debug = function() {
      return this._log(Logger.DEBUG, arguments);
    };

    Logger.prototype.trace = function() {
      return this._log(Logger.TRACE, arguments);
    };

    Logger.prototype.group = function() {};

    Logger.prototype.on = function(event, callback) {
      var _ref;
      switch (event) {
        case "message":
          this;
          break;
        case "line":
          this;
          break;
        case "frame":
          if ((_ref = this.timer) == null) this.timer = new Logger.Timer();
          this.timer.on(event, callback);
          break;
        case "bench":
          this;
      }
      return this;
    };

    Logger.prototype.toObject = function() {
      var logger;
      logger = this;
      return {
        log: function() {
          return logger.log.apply(logger, arguments);
        },
        fatal: function() {
          return logger.fatal.apply(logger, arguments);
        },
        error: function() {
          return logger.error.apply(logger, arguments);
        },
        warn: function() {
          return logger.warn.apply(logger, arguments);
        },
        info: function() {
          return logger.info.apply(logger, arguments);
        },
        debug: function() {
          return logger.debug.apply(logger, arguments);
        },
        trace: function() {
          return logger.trace.apply(logger, arguments);
        }
      };
    };

    Logger.Timer = (function() {

      function Timer() {
        this.now = Date.now();
        this.time_last_frame = this.now;
        this.time_last_second = this.now;
        this.fps = 0;
        this.fps_min = 1000;
        this.fps_max = 0;
        this.ms = 0;
        this.ms_min = 0;
        this.ms_max = 0;
        this.frames = 0;
        this.handlers = [];
      }

      Timer.prototype.on = function(event, callback) {
        this.handlers.push(callback);
        return this.start();
      };

      Timer.prototype.start = function() {
        var self;
        if (this.timer) return this;
        self = this;
        this.timer = setInterval((function() {
          return self.update();
        }), 1000 / 60);
        return this;
      };

      Timer.prototype.stop = function() {
        clearInterval(this.timer);
        this.timer = null;
        return this;
      };

      Timer.prototype.update = function() {
        var handler, _i, _len, _ref, _results;
        this.now = Date.now();
        this.ms = this.now - this.time_last_frame;
        this.ms_min = Math.min(this.ms_min, this.ms);
        this.ms_max = Math.max(this.ms_max, this.ms);
        this.time_last_frame = this.now;
        this.frames += 1;
        if (this.now > (this.time_last_second + 1000)) {
          this.fps = Math.round((this.frames * 1000) / (this.now - this.time_last_second));
          this.fps_min = Math.min(this.fps_min, this.fps);
          this.fps_max = Math.max(this.fps_max, this.fps);
          this.time_last_second = this.now;
          this.frames = 0;
          _ref = this.handlers;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            handler = _ref[_i];
            _results.push(handler.apply(this));
          }
          return _results;
        }
      };

      return Timer;

    })();

    return Logger;

  })();

  if (typeof module === 'undefined' || typeof window !== 'undefined') {
    window["_console"] = new Logger({
      colorized: false
    });
  } else {
    module.exports = new Logger({
      colorized: true
    });
    global["_console"] || (global["_console"] = module.exports);
  }

}).call(this);
