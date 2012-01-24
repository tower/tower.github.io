(function() {
  var File, crypto, exec, fs, mime, mkdirp, util, _path;

  fs = require('fs');

  crypto = require('crypto');

  mime = require('mime');

  _path = require('path');

  util = require('util');

  mkdirp = require('mkdirp');

  exec = require('child_process').exec;

  File = (function() {

    File.stat = function(path) {
      return fs.statSync(path);
    };

    File.digestHash = function() {
      return crypto.createHash('md5');
    };

    File.digest = function(path, data) {
      var stat;
      stat = this.stat(path);
      if (stat == null) return;
      data || (data = this.read(path));
      if (data == null) return;
      return this.digestHash().update(data).digest("hex");
    };

    File.read = function(path) {
      return fs.readFileSync(path, "utf-8");
    };

    File.readAsync = function(path, callback) {
      return fs.readFile(path, "utf-8", callback);
    };

    File.slug = function(path) {
      return this.basename(path).replace(new RegExp(this.extname(path) + "$"), "");
    };

    File.contentType = function(path) {
      return mime.lookup(path);
    };

    File.mtime = function(path) {
      return this.stat(path).mtime;
    };

    File.size = function(path) {
      return this.stat(path).size;
    };

    File.expandFile = function(path) {
      return _path.normalize(path);
    };

    File.absolutePath = function(path, root) {
      if (root == null) root = this.pwd();
      if (path.charAt(0) !== "/") path = root + "/" + path;
      return _path.normalize(path);
    };

    File.relativePath = function(path, root) {
      if (root == null) root = this.pwd();
      if (path[0] === ".") path = this.join(root, path);
      return _path.normalize(path.replace(new RegExp("^" + root.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "/"), ""));
    };

    File.pwd = function() {
      return process.cwd();
    };

    File.basename = function() {
      return _path.basename.apply(_path, arguments);
    };

    File.extname = function(path) {
      return _path.extname(path);
    };

    File.exists = function(path) {
      return _path.existsSync(path);
    };

    File.existsAsync = function(path, callback) {
      return _path.exists(path, callback);
    };

    File.extensions = function(path) {
      return this.basename(path).match(/(\.\w+)/g);
    };

    File.join = function() {
      return Array.prototype.slice.call(arguments, 0, arguments.length).join("/").replace(/\/+/, "/");
    };

    File.isUrl = function(path) {
      return !!path.match(/^[-a-z]+:\/\/|^cid:|^\/\//);
    };

    File.isAbsolute = function(path) {
      return path.charAt(0) === "/";
    };

    File.glob = function() {
      var path, paths, result, _i, _len;
      paths = Array.prototype.slice.call(arguments, 0, arguments.length);
      result = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        if (this.exists(path)) {
          result = result.concat(require('findit').sync(path));
        }
      }
      return result;
    };

    File.remove = function(path) {
      return fs.unlinkSync(path);
    };

    File.files = function() {
      var path, paths, result, self, _i, _len;
      paths = this.glob.apply(this, arguments);
      result = [];
      self = this;
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        if (self.isFile(path)) result.push(path);
      }
      return result;
    };

    File.directories = function() {
      var path, paths, result, self, _i, _len;
      paths = this.glob.apply(this, arguments);
      result = [];
      self = this;
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        if (self.isDirectory(path) && !(path === "." || path === "..")) {
          result.push(path);
        }
      }
      return result;
    };

    File.entries = function(path) {
      return fs.readdirSync(path);
    };

    File.dirname = function(path) {
      return _path.dirname(path);
    };

    File.isDirectory = function(path) {
      return this.stat(path).isDirectory();
    };

    File.isFile = function(path) {
      return !this.isDirectory(path);
    };

    File.write = function(path, data, callback) {
      var dirname;
      dirname = this.dirname(path);
      return mkdirp(dirname, 0755, function(error) {
        if (error) console.error(error);
        return fs.writeFile(path, data, callback);
      });
    };

    File.writeSync = function(path, data) {
      var dirname;
      dirname = this.dirname(path);
      this.mkdirpSync(dirname);
      return fs.writeFileSync(path, data);
    };

    File.mkdirpSync = function(dir) {
      dir = _path.resolve(_path.normalize(dir));
      try {
        return fs.mkdirSync(dir, 0755);
      } catch (e) {
        switch (e.errno) {
          case 47:
            break;
          case 34:
            mkdirpSync(_path.dirname(dir));
            return mkdirpSync(dir);
          default:
            return console.error(e);
        }
      }
    };

    File.copy = function(from, to) {
      var newFile, oldFile;
      oldFile = fs.createReadStream(from);
      newFile = fs.createWriteStream(to);
      return newFile.once('open', function(data) {
        return util.pump(oldFile, newFile);
      });
    };

    File.digestFile = function(path) {
      return this.pathWithFingerprint(path, this.digest(path));
    };

    File.pathFingerprint = function(path) {
      var result;
      result = this.basename(path).match(/-([0-9a-f]{32})\.?/);
      if (result != null) {
        return result[1];
      } else {
        return null;
      }
    };

    File.pathWithFingerprint = function(path, digest) {
      var oldDigest;
      if (oldDigest = this.pathFingerprint(path)) {
        return path.replace(oldDigest, digest);
      } else {
        return path.replace(/\.(\w+)$/, "-" + digest + ".\$1");
      }
    };

    function File(path) {
      this.path = path;
      this.previousMtime = this.mtime();
    }

    File.prototype.stale = function() {
      var newMtime, oldMtime, result;
      oldMtime = this.previousMtime;
      newMtime = this.mtime();
      result = oldMtime.getTime() !== newMtime.getTime();
      this.previousMtime = newMtime;
      return result;
    };

    File.prototype.stat = function() {
      return this.constructor.stat(this.path);
    };

    File.prototype.contentType = function() {
      return this.constructor.contentType(this.path);
    };

    File.prototype.mtime = function() {
      return this.constructor.mtime(this.path);
    };

    File.prototype.size = function() {
      return this.constructor.size(this.path);
    };

    File.prototype.digest = function() {
      return this.constructor.digest(this.path);
    };

    File.prototype.extensions = function() {
      return this.constructor.extensions(this.path);
    };

    File.prototype.extension = function() {
      return this.constructor.extname(this.path);
    };

    File.prototype.read = function() {
      return this.constructor.read(this.path);
    };

    File.prototype.readAsync = function(callback) {
      return this.constructor.readAsync(this.path, callback);
    };

    File.prototype.absolutePath = function() {
      return this.constructor.absolutePath(this.path);
    };

    File.prototype.relativePath = function() {
      return this.constructor.relativePath(this.path);
    };

    File.prototype.dirname = function() {
      return this.constructor.dirname(this.path);
    };

    File.touch = function(path, callback) {
      var self;
      self = this;
      return exec("touch -m " + path, function(error) {
        if (callback) {
          return callback.call(self, error);
        } else {
          if (error) throw error;
        }
      });
    };

    File.prototype.touch = function(callback) {
      var self;
      self = this;
      return this.constructor.touch(this.path, function(error) {
        if (callback) {
          return callback.call(self, error);
        } else {
          if (error) throw error;
        }
      });
    };

    File.prototype.digestFile = function() {
      return this.constructor.digestFile(this.path);
    };

    File.prototype.pathFingerprint = function() {
      return this.constructor.pathFingerprint(this.path);
    };

    File.prototype.pathWithFingerprint = function(digest) {
      return this.constructor.pathWithFingerprint(this.path, digest);
    };

    File.prototype.write = function(data, callback) {
      return this.constructor.write(this.path, data, callback);
    };

    return File;

  })();

  module.exports = File;

}).call(this);
