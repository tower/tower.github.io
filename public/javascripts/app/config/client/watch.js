(function() {

  App.watchers = {
    stylesheets: {
      nodes: {},
      create: function(data) {
        return this.update(data);
      },
      update: function(data) {
        var newNode, node, nodes;
        nodes = this.nodes;
        if (nodes[data.path] != null) {
          node = nodes[data.path];
        } else {
          node = $("link[href='" + data.url + "']");
        }
        data.url = null;
        if (node) {
          if (data.url) {
            node.attr("href", "" + data.url + "?" + ((new Date()).getTime().toString()));
          } else {
            newNode = $("<style id='" + data.path + "' type='text/css'>" + data.content + "</style>");
            node.replaceWith(newNode);
            node = newNode;
          }
        } else {
          node = $("<style id='" + data.path + "' type='text/css'>" + data.content + "</style>");
          $("body").append(node);
        }
        return nodes[data.path] = node;
      },
      destroy: function(data) {
        if (this.nodes[data.path] != null) {
          return this.nodes[data.path].remove();
        }
      }
    },
    javascripts: {
      create: function(data) {},
      update: function(data) {
        return eval("(function() { " + data.content + " })")();
      }
    },
    watch: function() {
      var _this = this;
      Tower.connection.on('fileCreated', function(data) {
        return _this._handle('create', data);
      });
      return Tower.connection.on('fileUpdated', function(data) {
        return _this._handle('update', data);
      });
    },
    _handle: function(action, data) {
      data = JSON.parse(data, this._jsonReviver);
      if (data.path.match(/\.js$/)) {
        return this.javascripts[action](data);
      } else if (data.path.match(/\.css$/)) {
        return this.stylesheets[action](data);
      }
    },
    _jsonReviver: function(key, value) {
      if (typeof value === "string" && !!value.match(/^(?:\(function\s*\([^\)]*\)\s*\{|\(\/)/) && !!value.match(/(?:\}\s*\)|\/\w*\))$/)) {
        return eval(value);
      } else {
        return value;
      }
    }
  };

}).call(this);
