(function() {
  var Client;
  Client = (function() {
    function Client(options) {
      options || (options = {});
      this.port = options.port || 4181;
      this.url = options.url || ("http://localhost:" + this.port);
      this.socket = io.connect(this.url);
      this.callbacks = {};
      this.stylesheets = {};
      this.javascripts = {};
      this.connect();
    }
    Client.prototype.connect = function() {
      var self, socket;
      socket = this.socket;
      self = this;
      return socket.on('connect', function() {
        socket.emit('userAgent', self.userAgent());
        return socket.on('update', function(changes) {
          return self.runCallback("update", changes);
        });
      });
    };
    Client.prototype.on = function(name, callback) {
      return this.callbacks[name] = callback;
    };
    Client.prototype.runCallback = function(name, options) {
      if (this.callbacks[name] != null) {
        return this.callbacks[name].call(this, options);
      } else {
        return this[name](options);
      }
    };
    Client.prototype.update = function(data) {
      if (data.css) {
        this.updateStylesheets(data.css);
      }
      if (data.js) {
        this.updateJavaScripts(data.js);
      }
      return true;
    };
    Client.prototype.updateStylesheets = function(data) {
      var node, stylesheets;
      stylesheets = this.stylesheets;
      if (stylesheets[data.id] != null) {
        stylesheets[data.id].remove();
      }
      node = $("<style id='" + data.id + "' type='text/css'>" + data.body + "</style>");
      stylesheets[data.id] = node;
      return $("body").append(node);
    };
    Client.prototype.updateJavaScripts = function(data) {
      var javascripts, node;
      javascripts = this.javascripts;
      console.log("HERE!! " + data.id);
      if (javascripts[data.id] != null) {
        javascripts[data.id].remove();
      }
      node = $("<script id='" + data.id + "' type='text/javascript'>" + data.body + "</script>");
      javascripts[data.id] = node;
      return $("body").append(node);
    };
    Client.prototype.userAgent = function() {
      return {
        userAgent: window.navigator.userAgent,
        url: window.location.href
      };
    };
    return Client;
  })();
  window.designer = new Client();
}).call(this);
