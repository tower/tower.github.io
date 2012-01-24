(function() {
  var File, Listener, Pathfinder, _path;

  _path = require('path');

  Pathfinder = require('pathfinder');

  File = Pathfinder.File;

  Listener = (function() {

    function Listener(root, callback) {
      var directories, files, path, paths, self, source, stat, _i, _len;
      this.root = root;
      this.directories = directories = {};
      this.files = files = {};
      paths = require('findit').sync(root);
      self = this;
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        source = paths[_i];
        stat = File.stat(source);
        path = _path.join(root, source.replace(root, ""));
        if (!stat.isDirectory()) {
          files[path] = stat;
          try {
            callback.call(self, File.relativePath(path), {
              action: "initialize"
            });
          } catch (error) {
            console.log(error.stack);
          }
        } else {
          directories[path] = File.entries(path);
        }
      }
    }

    Listener.prototype.changed = function(path, callback) {
      var absolutePath, action, base, changed, current, deleted, directories, entries, entry, files, previous, relativePath, timestamp, _i, _len, _results;
      entries = File.entries(path);
      action = null;
      timestamp = new Date;
      directories = this.directories;
      files = this.files;
      base = this.root;
      if (directories[path] && entries.length < directories[path].length) {
        directories = this.directories;
        action = "destroy";
        deleted = directories[path].filter(function(i) {
          return !(entries.indexOf(i) > -1);
        });
        directories[path] = entries;
        relativePath = File.join(path, deleted[0]).replace(base + '/', '');
        this.log(relativePath, {
          action: action,
          timestamp: timestamp
        }, callback);
        return;
      }
      directories[path] = entries;
      _results = [];
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        entry = entries[_i];
        if (entry === '.' || entry === '..') continue;
        absolutePath = File.join(path, entry);
        current = File.stat(absolutePath);
        if (current.isDirectory()) continue;
        previous = files[absolutePath];
        changed = !(previous && current.size === previous.size && current.mtime.getTime() === previous.mtime.getTime());
        if (!changed) continue;
        files[absolutePath] = current;
        if (!previous) {
          action || (action = "create");
        } else {
          action || (action = "update");
        }
        relativePath = absolutePath.replace(base.toString() + '/', '');
        _results.push(this.log(relativePath, {
          action: action,
          timestamp: timestamp,
          previous: previous,
          current: current
        }, callback));
      }
      return _results;
    };

    Listener.prototype.log = function(path, options, callback) {
      var name;
      if (options == null) options = {};
      name = options.action === "destroy" ? "deleted" : "" + options.action + "d";
      _console.info("" + name + " " + path);
      try {
        return callback.call(this, path, options);
      } catch (error) {
        return console.log(error.stack);
      }
    };

    return Listener;

  })();

  require('./listener/mac');

  require('./listener/polling');

  require('./listener/windows');

  module.exports = Listener;

}).call(this);
