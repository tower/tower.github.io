(function() {
  var Object_keys, require;

  require = function(file, cwd) {
    var mod, res, resolved;
    resolved = require.resolve(file, cwd || "/");
    mod = require.modules[resolved];
    if (!mod) {
      throw new Error("Failed to resolve module " + file + ", tried " + resolved);
    }
    res = (mod._cached ? mod._cached : mod());
    return res;
  };

  require.paths = [];

  require.modules = {};

  require.extensions = $extensions;

  require._core = {
    assert: true,
    events: true,
    fs: true,
    path: true,
    vm: true
  };

  require.resolve = (function() {
    return function(x, cwd) {
      var loadAsDirectorySync, loadAsFileSync, loadNodeModulesSync, m, n, nodeModulesPathsSync, path, y;
      loadAsFileSync = function(x) {
        var ext, i, _results;
        if (require.modules[x]) return x;
        i = 0;
        _results = [];
        while (i < require.extensions.length) {
          ext = require.extensions[i];
          if (require.modules[x + ext]) return x + ext;
          _results.push(i++);
        }
        return _results;
      };
      loadAsDirectorySync = function(x) {
        var b, m, pkg, pkgfile;
        x = x.replace(/\/+$/, "");
        pkgfile = x + "/package.json";
        if (require.modules[pkgfile]) {
          pkg = require.modules[pkgfile]();
          b = pkg.browserify;
          if (typeof b === "object" && b.main) {
            m = loadAsFileSync(path.resolve(x, b.main));
            if (m) return m;
          } else if (typeof b === "string") {
            m = loadAsFileSync(path.resolve(x, b));
            if (m) return m;
          } else if (pkg.main) {
            m = loadAsFileSync(path.resolve(x, pkg.main));
            if (m) return m;
          }
        }
        return loadAsFileSync(x + "/index");
      };
      loadNodeModulesSync = function(x, start) {
        var dir, dirs, i, m, n;
        dirs = nodeModulesPathsSync(start);
        i = 0;
        while (i < dirs.length) {
          dir = dirs[i];
          m = loadAsFileSync(dir + "/" + x);
          if (m) return m;
          n = loadAsDirectorySync(dir + "/" + x);
          if (n) return n;
          i++;
        }
        m = loadAsFileSync(x);
        if (m) return m;
      };
      nodeModulesPathsSync = function(start) {
        var dir, dirs, i, parts;
        parts = void 0;
        if (start === "/") {
          parts = [""];
        } else {
          parts = path.normalize(start).split("/");
        }
        dirs = [];
        i = parts.length - 1;
        while (i >= 0) {
          if (parts[i] === "node_modules") continue;
          dir = parts.slice(0, i + 1).join("/") + "/node_modules";
          dirs.push(dir);
          i--;
        }
        return dirs;
      };
      if (!cwd) cwd = "/";
      if (require._core[x]) return x;
      path = require.modules.path();
      y = cwd || ".";
      if (x.match(/^(?:\.\.?\/|\/)/)) {
        m = loadAsFileSync(path.resolve(y, x)) || loadAsDirectorySync(path.resolve(y, x));
        if (m) return m;
      }
      n = loadNodeModulesSync(x, y);
      if (n) return n;
      throw new Error("Cannot find module '" + x + "'");
    };
  })();

  require.alias = function(from, to) {
    var basedir, f, i, key, keys, path, res, _results;
    path = require.modules.path();
    res = null;
    try {
      res = require.resolve(from + "/package.json", "/");
    } catch (err) {
      res = require.resolve(from, "/");
    }
    basedir = path.dirname(res);
    keys = Object_keys(require.modules);
    i = 0;
    _results = [];
    while (i < keys.length) {
      key = keys[i];
      if (key.slice(0, basedir.length + 1) === basedir + "/") {
        f = key.slice(basedir.length);
        require.modules[to + f] = require.modules[basedir + f];
      } else {
        if (key === basedir) require.modules[to] = require.modules[basedir];
      }
      _results.push(i++);
    }
    return _results;
  };

  require.define = function(filename, fn) {
    var dirname, module_, require_;
    dirname = (require._core[filename] ? "" : require.modules.path().dirname(filename));
    require_ = function(file) {
      return require(file, dirname);
    };
    require_.resolve = function(name) {
      return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    module_ = {
      exports: {}
    };
    return require.modules[filename] = function() {
      require.modules[filename]._cached = module_.exports;
      fn.call(module_.exports, require_, module_, module_.exports, dirname, filename);
      require.modules[filename]._cached = module_.exports;
      return module_.exports;
    };
  };

  Object_keys = Object.keys || function(obj) {
    var key, res;
    res = [];
    for (key in obj) {
      res.push(key);
    }
    return res;
  };

}).call(this);
