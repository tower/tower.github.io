
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("tower-stream/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var load = require('tower-load');
var proto = require('./lib/proto');
var statics = require('./lib/static');
var api = require('./lib/api');

/**
 * Expose `stream`.
 */

exports = module.exports = stream;

/**
 * Find or create a stream by `name`.
 *
 * @param {String} name
 * @param {Function} [fn]
 */

function stream(name, fn) {
  if (exports.collection[name]) return exports.collection[name];
  if (exports.load(name)) return exports.collection[name];

  /**
   * Initialize a new `Stream`.
   *
   * @api public
   */

  function Stream(options) {
    options || (options = {});

    for (var key in options) this[key] = options[key];

    this.name = name;
    this.inputs = options.inputs || [];
    this.outputs = options.outputs || [];
    Stream.emit('init', this);
  }

  api.init(name, Stream, statics, proto, stream);

  Stream.action = function(x, fn){
    return stream(Stream.ns + '.' + x, fn);
  }

  if ('function' === typeof fn) Stream.on('exec', fn);

  api.dispatch(stream, name, Stream);

  return Stream;
}

/**
 * Mixin API behavior.
 */

api(exports, statics, proto);

/**
 * Extend the `stream` API under a namespace.
 */

exports.ns = function(ns){
  function stream(name, fn) {
    return exports(ns + '.' + name, fn);
  }

  api.extend(stream, exports);

  stream.exists = function(name){
    return exports.exists(ns + '.' + name);
  }

  return stream;
};

/**
 * Lazy-load.
 */

exports.load = function(name, path){
  return 1 === arguments.length
    ? load(exports, name)
    : load.apply(load, [exports].concat(Array.prototype.slice.call(arguments)));
};

/**
 * Check if `stream` exists by `name`.
 *
 * @param {String} name
 */

exports.exists = function(name){
  // try lazy loading
  if (undefined === exports.collection[name])
    return !!exports.load(name);

  return !!exports.collection[name];
};
});
require.register("tower-stream/lib/static.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Param = require('tower-param').Param;
var Attr = require('tower-attr').Attr;

/**
 * Instantiate a new `Stream`.
 *
 * XXX: rename to `init`.
 *
 * @param {Object} options
 * @api public
 */

exports.create = function(options){
  return new this(options);
};
exports.init = exports.create;

/**
 * Instantiate a new `Param`.
 *
 * @api public.
 */

exports.param = function(name, type, options){
  this.params || (this.params = []);
  this.context = this.params[name] = new Param(name, type, options);
  this.params.push(this.context);
  return this;
};

/**
 * Instantiate a new `Attr`.
 *
 * @api public.
 */

exports.attr = function(name, type, options){
  this.attrs || (this.attrs = []);
  this.context = this.attrs[name] = new Attr(name, type, options);
  this.attrs.push(this.context);
  return this;
};

exports.alias = function(name){
  this.context.alias(name);
  return this;
};

/**
 * Define a validator.
 *
 * @param {String} key Name of the operator for assertion.
 * @param {Mixed} val
 * @return {this}
 */

exports.validate = function(key, val){
  if (this === this.context)
    // key is a function
    this.validator(key, val)
  else
    // param or attr
    this.context.validator(key, val);

  return this;
};

/**
 * Append a validator function to the stack.
 *
 * @param {Function} fn
 * @return {this}
 */

exports.validator = function(fn){
  // XXX: just a function in this case, but could handle more.
  this.validators.push(fn);
  return this;
};

/**
 * Reset the `context` to `this`.
 *
 * @return {this}
 */

exports.self = function(){
  return this.context = this;
};
});
require.register("tower-stream/lib/proto.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var noop = function(){}; // XXX: temp until async emitter.

/**
 * Execute the stream.
 */

exports.exec = function(data, fn){
  this.constructor.emit('exec', this, data, fn || noop);
  // XXX: need to handle with/without cases.
  //if (fn) fn();
};

/**
 * Open the stream.
 */

exports.open = function(data, fn){
  // XXX: refactor
  if (this.constructor.hasListeners('open'))
    this.constructor.emit('open', this, data, fn || noop);
  if (this.hasListeners('open'))
    this.emit('open', fn || noop);

  if (!this.hasListeners('open') && !this.constructor.hasListeners('open'))
    fn();
};

/**
 * Close the stream.
 */

exports.close = function(fn){
  this.constructor.emit('close', this, fn);
  this.emit('close', fn);
};
});
require.register("tower-stream/lib/api.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');

/**
 * Expose `constructorFn`
 */

exports = module.exports = api;

/**
 * Setup the DSL API for a library.
 *
 * This is called once per "apiFn method".
 */

function api(apiFn, statics, proto){
  apiFn.collection = [];

  // mixin `Emitter`

  Emitter(apiFn);
  Emitter(statics);
  Emitter(proto);

  apiFn.clear = clear.bind(apiFn);
  apiFn.remove = remove.bind(apiFn);

  return apiFn;
}

/**
 * Add base behavior to a `Function`.
 *
 * This is called inside the API method.
 */

exports.init = function(name, fn, statics, proto, apiFn){
  fn.id = name;

  // namespace

  fn.ns = name.replace(/\.\w+$/, '');

  // statics

  for (var key in statics) fn[key] = statics[key];

  // prototype

  fn.prototype = {};
  fn.prototype.constructor = fn;
  
  for (var key in proto) fn.prototype[key] = proto[key];

  apiFn.collection[name] = fn;
  apiFn.collection.push(fn);

  return apiFn;
};

/**
 * Emit events for the `name`,
 * so that external libraries can add extensions.
 */

exports.dispatch = function(apiFn, name, fn){
  var parts = name.split('.');

  for (var i = 1, n = parts.length + 1; i < n; i++) {
    apiFn.emit('define ' + parts.slice(0, i).join('.'), fn);
  }

  apiFn.emit('define', fn);

  return apiFn;
};

/**
 * Scope the `constructorFn` names under a namespace.
 */

exports.extend = function(childApi, parentApi){
  // XXX: copy functions?
  for (var key in parentApi) {
    if ('function' === typeof parentApi[key])
      childApi[key] = parentApi[key];
  }
  return childApi;
};

/**
 * Clear API behavior.
 */

function clear(){
  // remove all listeners
  this.off();

  while (this.collection.length)
    this.remove(this.collection.pop());

  return this;
}

function remove(val, i){
  var emitter = this.collection[val] || val;
  emitter.off();
  delete this.collection[emitter.id];
  // XXX: delete from collection array.
}
});
require.register("tower-text/index.js", function(exports, require, module){

/**
 * DSL context.
 */

var context;

/**
 * Current language.
 */

var locale;

/**
 * Expose `text`.
 */

exports = module.exports = text;

/**
 * Example:
 *
 *    text('messages')
 *
 * @param {String} key
 * @api public
 */

function text(key, val) {
  return undefined === val
    ? (locale[key] || (locale[key] = new Text))
    : (locale[key] = new Text).one(val);
}

exports.has = function(key){
  return !!locale[key];
};

/**
 * Set locale.
 */

exports.locale = function(val){
  locale = exports[val] || (exports[val] = {});
  return exports;
};

/**
 * Default locale is `en`.
 */

exports.locale('en');

/**
 * Instantiate a new `Text`.
 *
 * @api private
 */

function Text() {
  this.inflections = [];
}

/**
 * @param {String} string
 * @api public
 */

Text.prototype.past = function(string){
  return this.inflection(string, context.count, 'past');
};

/**
 * @param {String} string
 * @api public
 */

Text.prototype.present = function(string){
  return this.inflection(string, context.count, 'present');
};

/**
 * @param {String} string
 * @api public
 */

Text.prototype.future = function(string){
  return this.inflection(string, context.count, 'future');
};

/**
 * @param {String} string
 * @param {String} tense
 * @param {String} count
 * @api public
 */

Text.prototype.tense = function(string, tense, count){
  return this.inflection(string, count, tense);
};

/**
 * @param {String} string
 * @api public
 */

Text.prototype.none = function(string){
  return this.inflection(string, 'none');
};

/**
 * @param {String} string
 * @api public
 */

Text.prototype.one = function(string){
  return this.inflection(string, 'one');
};

/**
 * @param {String} string
 * @api public
 */

Text.prototype.other = function(string){
  return this.inflection(string, 'other');
};

/**
 * @param {String} string
 * @param {String} count
 * @param {String} tense
 * @api public
 */

Text.prototype.inflection = function(string, count, tense){
  // this isn't quite correct...
  this.inflections.push(context = {
    string: string,
    count: count == null ? 'all' : count,
    tense: tense || 'present'
  });

  return this;
};

/**
 * This could be a view on the client.
 *
 * @param {Object} options
 * @api public
 */

Text.prototype.render = function(options){
  options || (options = {});

  var count = (options.count ? (1 === options.count ? 'one' : 'other') : 'none')
    , tense = options.tense || 'present'
    , key = tense + '.' + count
    , inflections = this.inflections
    , inflection = inflections[0]
    , currScore = 0
    , prevScore = 0;

  for (var i = 0, n = inflections.length; i < n; i++) {
    currScore = 0
      + (count === inflections[i].count ? 1 : 0)
      + (tense === inflections[i].tense ? 1 : 0);

    if (currScore > prevScore) {
      inflection = inflections[i];
      prevScore = currScore; 
    }
  }

  return inflection.string.replace(/\{\{(\w+)\}\}/g, function(_, $1){
    return options[$1];
  });
};
});
require.register("part-async-series/index.js", function(exports, require, module){
module.exports = function(fns, val, done, binding){
  var i = 0, fn;

  function handle(err) {
    if (err) return done(err);
    next();
  }

  function next() {
    if (fn = fns[i++]) {
      if (2 === fn.length) {
        fn.call(binding, val, handle);
      } else {
        if (false === fn.call(binding, val))
          done(new Error('haulted'));
        else
          next();
      }
    } else {
      if (done) done();
    }
  }

  next();
}
});
require.register("tower-resource/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var stream = require('tower-stream');
var validator = require('tower-validator').ns('resource');
var load = require('tower-load');
var proto = require('./lib/proto');
var statics = require('./lib/static');
var slice = [].slice;

/**
 * Expose `resource`.
 */

exports = module.exports = resource;

/**
 * Expose `collection`
 */

exports.collection = [];

/**
 * Expose `validator`.
 */

exports.validator = validator;

/**
 * Create a new resource constructor with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function resource(name) {
  if (exports.collection[name]) return exports.collection[name];
  if (exports.load(name)) return exports.collection[name];

  /**
   * Initialize a new resource with the given `attrs`.
   *
   * @param {Object} attrs
   * @api public
   */

  function Resource(attrs, storedAttrs) {
    // XXX: if storedAttrs, don't set to dirty
    this.attrs = {};
    this.dirty = {};
    this._callbacks = {};
    attrs = Resource._defaultAttrs(attrs, this);

    for (var key in attrs) {
      if (attrs.hasOwnProperty(key))
        this.set(key, attrs[key], true);
    }

    Resource.emit('init', this);
  }

  Resource.toString = function toString(){
    return 'resource("' + name + '")';
  }

  // statics

  Resource.className = name;
  Resource.id = name;
  Resource.attrs = [];
  // optimization
  Resource.attrs.__default__ = {};
  Resource.validators = [];
  Resource.prototypes = [];
  Resource.relations = [];
  Resource._callbacks = {};
  // starting off context
  Resource.context = Resource;

  for (var key in statics) Resource[key] = statics[key];

  // prototype

  Resource.prototype = {};
  Resource.prototype.constructor = Resource;
  
  for (var key in proto) Resource.prototype[key] = proto[key];

  Resource.action = stream.ns(name);
  Resource.id();

  exports.collection[name] = Resource;
  exports.collection.push(Resource);
  exports.emit('define', Resource);
  exports.emit('define ' + name, Resource);

  return Resource;
}

/**
 * Mixin `Emitter`.
 */

Emitter(resource);
Emitter(statics);
Emitter(proto);

/**
 * Mixins.
 */

exports.use = function(obj){
  if ('function' === typeof obj) {
    obj.call(exports, statics, proto, exports);
  } else {
    for (var key in obj) statics[key] = obj[key]
  }
};

/**
 * Lazy-load stuff for a particular constructor.
 *
 * Example:
 *
 *    resource.load('user', require.resolve('./lib/user'));
 *
 * @param {String} name
 * @param {String} path
 */

exports.load = function(name, path){
  return 1 === arguments.length
    ? load(exports, name)
    : load.apply(load, [exports].concat(Array.prototype.slice.call(arguments)));
};

/**
 * Create a `resource` function that
 * just prepends a namespace to every key.
 *
 * This is used to make the DSL simpler,
 * check out the `tower-adapter` code for an example.
 */

exports.ns = function(ns){
  function resource(name) {
    return exports(ns + '.' + name);
  }

  // XXX: copy functions?
  for (var key in exports) {
    if ('function' === typeof exports[key])
      resource[key] = exports[key];
  }
  return resource;
};

// XXX: maybe remove "resource('name')" as toString.
exports.is = function(obj){
  return obj && obj.constructor.toString().indexOf('resource(') === 0;
};

/**
 * Clear resources.
 */

exports.clear = function(){
  exports.collection.forEach(function(emitter){
    emitter.off('define');
    delete exports.collection[emitter.className];
  });

  exports.collection.length = 0;

  return exports;
};
});
require.register("tower-resource/lib/static.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var attr = require('tower-attr'); // XXX needs something like this: .ns('resource')
var validator = require('tower-validator').ns('resource');
var text = require('tower-text'); // XXX: rename `tower-text`?
var query = require('tower-query');
var series = require('part-async-series');

text('resource.error', 'Resource validation failed');

/**
 * Instantiate a new `Resource`.
 *
 * @param {Object} attrs
 * @return {Object} instance
 */

exports.init = function(attrs, storedAttrs){
  return new this(attrs, storedAttrs);
};

/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(fn){
  fn(this);
  return this;
};

/**
 * Add validation `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.validate = function(key, val){
  // XXX: add validator to validate attributes.
  if (!this.validators.attrs && this !== this.context) {
    var self = this;
    this.validators.attrs = true;
    this.validator(function validateAttributes(obj, fn){
      var validators = [];

      self.attrs.forEach(function(attr){
        if (attr.validators && attr.validators.length) {
          validators.push(function validate(obj){
            attr.validate(obj);
          });
        }
      });

      series(validators, obj, fn);
    });
  }
  
  if ('function' === typeof key)
    this.validator(key);
  else
    this.context.validator(key, val);

  return this;
};

exports.validator = function(key, val){
  if ('function' === typeof key) {
    // XXX: needs to handle pushing errors.
    this.validators.push(key);
  } else {
    var assert = validator(key);
    // XXX: should be set somewhere earlier.
    var path = this.path || 'resource.' + this.className + '.' + key;

    this.validators.push(function validate(obj, fn){
      if (!assert(obj, val)) {
        // XXX: hook into `tower-text` for I18n
        var error = text.has(path)
          ? text(path).render(obj)
          : text('resource.error').render(obj);

        obj.errors[attr.name] = error;
        obj.errors.push(error);
      }
    });
  }
  return this;
};

/**
 * Define an `id`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 */

exports.id = function(name, type, options){
  options || (options = {});
  return this.attr(name || 'id', type || 'id', options);
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

exports.attr = function(name, type, options){
  var obj = this.context = attr(name, type, options);
  // XXX: needs to be something like this:
  // var obj = this.context = attr(this.id + '.' + name, type, options);

  // set?
  this.attrs[name] = obj;
  this.attrs.push(obj);
  // optimization
  if (obj.hasDefaultValue)
    this.attrs.__default__[name] = obj;

  // implied pk
  if ('id' === name) {
    options.primaryKey = true;
    this.primaryKey = name;
  }

  // getter / setter method
  accessor(this.prototype, name);

  return this;
};

/**
 * Insert/POST/create a new record.
 *
 * @param {Object} [attrs]
 * @param {Function} [fn]
 * @return {Topology} A stream object
 */

exports.create = function(attrs, fn){
  if ('function' === typeof attrs) {
    fn = attrs;
    attrs = undefined;
  }
  return this.init(attrs).save(fn);
};

exports.save = function(attrs, fn){
  if ('function' === typeof attrs) {
    fn = attrs;
    attrs = undefined;
  }
  return this.init(attrs).save(fn);
};

exports.query = function(name){
  return null == name
    ? query().select(this.className)
    // XXX: this should only happen first time.
    : query(this.className + '.' + name).select(this.className);
};

exports.find = function(fn){
  return this.query().find(fn);
};

/**
 * Remove all records of this type.
 *
 * @param {Function} fn
 */

exports.remove = function(fn){
  return this.query().remove(fn);
};

exports.update = function(updates, fn){
  return this.query().update(updates, fn);
};

/**
 * Begin defining a query.
 *
 * @param {String} key Attribute path
 */

exports.where = function(key){
  return this.query().where(key);
};

exports.all = function(fn){
  return this.query().all(fn);
};

/**
 * XXX: Load data into store.
 */

exports.load = function(data){
  // XXX require('tower-memory-adapter').load(data);
};

/**
 * @api private
 */

exports._defaultAttrs = function(attrs, binding){
  // XXX: this can be optimized further.
  var defaultAttrs = this.attrs.__default__;
  attrs || (attrs = {});
  for (var name in defaultAttrs) {
    if (undefined === attrs[name])
      attrs[name] = defaultAttrs[name].apply(binding);
  }
  return attrs;
};

function accessor(proto, name) {
  // XXX: should probably check if method is already defined.
  proto[name] = function(val){
    return 0 === arguments.length
      ? this.get(name)
      : this.set(name, val);
  };
}
});
require.register("tower-resource/lib/proto.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var query = require('tower-query');
var each = require('part-async-series');

/**
 * Check if this resource is new.
 *
 * @return {Boolean}
 * @api public
 */

exports.isNew = function(){
  var key = this.constructor.primaryKey;
  return !this.has(key);
};

/**
 * Save and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `save` on updates and saves
 *  - `saving` pre-update or save, after validation
 *
 * @param {Function} [fn]
 * @api public
 */

exports.save = function(fn){
  var self = this;
  this.constructor.emit('saving', this);
  this.emit('saving');
  // XXX: needs to somehow set default properties
  // XXX: this itself should probably be
  //      bundled into a topology/stream/action.
  this.validate(function(err){
    if (err) {
      fn(err);
    } else {
      query()
        .select(self.constructor.className)
        .create(self, function(){
          self.dirty = {};
          self.constructor.emit('save', self);
          self.emit('save');
          if (fn) fn(null, self);
        });
    }
  });
};

/**
 * Update and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api private
 */

exports.update = function(fn){
  return query()
    .select(this.constructor.className)
    .action('update', this).exec(fn);
};

/**
 * Remove the resource and mark it as `.removed`
 * and invoke `fn(err)`.
 *
 * Events:
 *
 *  - `removing` before deletion
 *  - `remove` on deletion
 *
 * @param {Function} [fn]
 * @api public
 */

exports.remove = function(fn){
  return query()
    .select(this.constructor.className)
    .where('id').eq(this.get('id'))
    .action('remove').exec(fn);
};

/**
 * Validate the resource and return a boolean.
 */

exports.isValid = function(fn){
  this.validate(fn);
  return 0 === this.errors.length;
};

/**
 * Perform validations.
 *
 * @api private
 */

exports.validate = function(fn){
  var self = this;
  this.errors = [];
  this.emit('validating', this);
  // XXX: need single `validateAttributes`
  // XXX: need to store validators by key.
  each(this.constructor.validators, this, function(){
    // self.emit('after-validate', self);
    // self.emit('validated', self);
    self.emit('validate', self);

    if (fn) {
      if (self.errors.length)
        fn(new Error('Validation Error'));
      else
        fn(); 
    }
  });
  return 0 === this.errors.length;
};

/**
 * Set attribute value.
 *
 * @param {String} name
 * @param {Mixed} val
 * @param {Boolean} quiet If true, won't dispatch change events.
 * @return {Object} self
 * @api public
 */

exports.set = function(name, val, quiet){
  var attr = this.constructor.attrs[name];
  if (!attr) return; // XXX: throw some error, or dynamic property flag?
  if (undefined === val && attr.hasDefaultValue)
    val = attr.apply(this);
  val = attr.typecast(val);
  var prev = this.attrs[name];
  this.dirty[name] = val;
  this.attrs[name] = val;

  // XXX: this `quiet` functionality could probably be implemented
  //   in a less ad-hoc way. It is currently only used when setting
  //   properties passed in through `init`, such as from a db/adapter
  //   serializing data into a resource, doesn't need to dispatch changes.
  if (!quiet) {
    this.constructor.emit('change ' + name, this, val, prev);
    this.emit('change ' + name, val, prev); 
  }
  return this;
};

/**
 * Get `name` value.
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

exports.get = function(name){
  // XXX: need a better way to do this
  if ('id' === name && this.__id__) return this.__id__;
  if (undefined === this.attrs[name]) {
    var attr = this.defaultAttr(name)
    if (attr)
      return this.attrs[name] = attr.apply(this);
  } else {
    return this.attrs[name];
  }
};

/**
 * Check if `attr` is present (not `null` or `undefined`).
 *
 * @param {String} attr
 * @return {Boolean}
 * @api public
 */

exports.has = function(attr){
  return null != this.attrs[attr];
};

/**
 * Return the JSON representation of the resource.
 *
 * @return {Object}
 * @api public
 */

exports.toJSON = function(){
  return this.attrs;
};

/**
 * Returns `Attr` definition if it has a default value.
 *
 * @param {String} name
 * @api private
 */

exports.defaultAttr = function(name){
  var defaultAttrs = this.constructor.attrs.__default__;
  return defaultAttrs.hasOwnProperty(name) && defaultAttrs[name];
};
});
require.register("tower-program/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var stream = require('tower-stream').ns('program');
var proto = require('./lib/proto');
var statics = require('./lib/statics');

/**
 * Expose `program`.
 */

exports = module.exports = program;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Get/set `Program`.
 */

function program(name) {
  if (exports.collection[name])
    return exports.collection[name];

  function Program(name) {
    this.inputs = initStreams(Program.inputs);
    this.outputs = initStreams(Program.outputs);
  }

  // statics

  for (var key in statics) Program[key] = statics[key];

  Program.id = name;
  Program.inputs = [];
  Program.outputs = [];
  Program.stream = stream.ns(name);

  // prototype

  Program.prototype = {};
  Program.prototype.constructor = Program;
  
  for (var key in proto) Program.prototype[key] = proto[key];

  exports.collection[name] = Program;
  exports.collection.push(Program);

  return Program;
}

function initStreams(streams) {
  var result = [];
  for (var name in streams) {
    result.push(streams[name].create());
  }
  return result;
}
});
require.register("tower-program/lib/proto.js", function(exports, require, module){

exports.input = function(name, fn){
  if (undefined === fn) return this.inputs[name];
  this.inputs[name] = fn;
  this.inputs.push(fn);
  return this;
};

exports.output = function(name, fn){
  if (undefined === fn) return this.outputs[name];
  this.outputs[name] = fn;
  this.outputs.push(fn);
  return this;
};
});
require.register("tower-program/lib/statics.js", function(exports, require, module){

/**
 * Instantiate a new `Program`.
 *
 * @param {Object} options
 * @return {Program}
 */

exports.init = function(options){
  return new this(options);
};

/**
 * Define input by `name`.
 *
 * @param {String} name
 * @param {Mixed} obj Function or stream constructor.
 */

exports.input = function(name, obj){
  // XXX: 'function' === typeof obj ...
  this.inputs[name] = obj = this.stream(name, obj);
  // this.inputs.push(obj);
  return this;
};

/**
 * Define output by `name`.
 *
 * @param {String} name
 * @param {Mixed} obj Function or stream constructor.
 */

exports.output = function(name, obj){
  this.outputs[name] = obj = this.stream(name, obj);
  //this.outputs.push(obj);
  return this;
};
});
require.register("part-each-array/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var nativeForEach = [].forEach;

/**
 * Expose `each`.
 */

module.exports = each;

/**
 * Array iterator.
 */

function each(array, iterator, context) {
  if (null == array) return;
  if (nativeForEach && array.forEach === nativeForEach) {
    array.forEach(iterator, context);
  } else {
    for (var i = 0, n = array.length; i < l; i++) {
      if (false === iterator.call(context, array[i], i, array)) return;
    }
  }
}

});
require.register("part-is-array/index.js", function(exports, require, module){

/**
 * Expose `isArray`.
 */

module.exports = Array.isArray || isArray;

function isArray(obj) {
  return '[object Array]' === toString.call(obj);
}
});
require.register("tower-query/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var each = require('part-each-array');
var isArray = require('part-is-array');
var Constraint = require('./lib/constraint');
var validate = require('./lib/validate');
var validateConstraints = require('./lib/validate-constraints');
var filter = require('./lib/filter');
var subscriber = require('./lib/subscriber');

/**
 * Expose `query`.
 */

exports = module.exports = query;

/**
 * Expose `Query`.
 */

exports.Query = Query;

/**
 * Expose `Constraint`.
 */

exports.Constraint = Constraint;

/**
 * Wrap an array for chaining query criteria.
 *
 * @param {String} name A query name.
 * @return {Query} A query.
 * @api public
 */

function query(name) {
  return null == name
    ? new Query
    : exports.collection[name]
      ? exports.collection[name].clone()
      : (exports.collection[name] = new Query(name));
}

/**
 * Named queries.
 */

exports.collection = {};

/**
 * Queryable adapters.
 */

exports.adapters = [];

/**
 * Expose `filter`.
 */

exports.filter = filter;

/**
 * Validate query constraints.
 */

exports.validate = validateConstraints;

/**
 * Make an adapter queryable.
 *
 * XXX: The main reason for doing it this way
 *      is to not create circular dependencies.
 *
 * @chainable
 * @param {Adapter} adapter An adapter object.
 * @return {Function} exports The main `query` function.
 * @api public
 */

exports.use = function(adapter){
  exports.adapters[adapter.name] = adapter;
  exports.adapters.push(adapter);
  return exports;
};

/**
 * Class representing a query.
 *
 * @class
 * @param {String} name A query instance's name.
 * @api public
 */

function Query(name) {
  this.name = name;
  this.constraints = [];
  this.selects = [];
  this.sorting = [];
  this.paging = {};
  // XXX: accomplish both joins and graph traversals.
  this.relations = [];
  // this.starts = []
  // this.groupings = {}
}

/**
 * Explicitly tell the query what adapters to use.
 *
 * If not specified, it will do its best to find
 * the adapter. If one or more are specified, the
 * first specified will be the default, and its namespace
 * can be left out of the resources used in the query
 * (e.g. `user` vs. `facebook.user` if `query().use('facebook').select('user')`).
 *
 * @chainable
 * @param {Mixed} name Name of the adapter, or the adapter object itself.
 *   In `package.json`, maybe this is under a `"key": "memory"` property.
 * @return {Query}
 * @api public
 */

Query.prototype.use = function(name){
  (this.adapters || (this.adapters = []))
    .push('string' === typeof name ? exports.adapters[name] : name);
  return this;
};

/**
 * The starting table or record for the query.
 *
 * @chainable
 * @param {String} key The starting table or record name.
 * @param {Object} val
 * @return {Query}
 * @api public
 */

Query.prototype.start = function(key, val){
  this._start = key;
  (this.starts || (this.starts = [])).push(queryModel(key));
  return this;
};

/**
 * Add a query pattern to be returned.
 * XXX: http://docs.neo4j.org/chunked/stable/query-return.html
 *
 * @param {String} key A query pattern that you want to be returned.
 * @return {Query}
 */

Query.prototype.returns = function(key){
  this.selects.push(queryAttr(key, this._start));
  return this;
};

/**
 * Start a SELECT query.
 *
 * @chainable
 * @param {String} key A record or table name.
 * @return {Query}
 * @api public
 */
Query.prototype.select = function(key){
  this._start = this._start || key;
  this.selects.push(queryAttr(key, this._start));
  return this;
};

/**
 * Add a WHERE clause.
 *
 * @param {String} key A record or table property/column name.
 * @return {Query}
 * @api public
 */
Query.prototype.where = function(key){
  this.context = key;
  return this;
};

/**
 * In a graph database, the data pointing _to_ this node.
 * In a relational/document database, the records with
 * a foreign key pointing to this record or set of records.
 *
 * Example:
 *
 *    query().start('users')
 *      .incoming('friends')
 *      .incoming('friends');
 *
 * @chainable
 * @param {String} key Name of the data coming to the start node.
 * @return {Query}
 * @api public
 */

Query.prototype.incoming = function(key){
  return this.relation('incoming', key);
};

/**
 * In a graph database, the data pointing _from_ this node.
 * In a relational/document database, the record this
 * record points to via its foreign key.
 *
 * Example:
 *
 *    query().start('users')
 *      .outgoing('friends')
 *      .outgoing('friends');
 *
 * @chainable
 * @param {String} key Name of the data going out from the start node.
 * @return {Query}
 * @api public
 */

Query.prototype.outgoing = function(key){
  return this.relation('outgoing', key);
};

/**
 * What the variable should be called for the data returned.
 * References the previous item in the query.
 *
 * Example:
 *
 *    query().start('users').as('people');
 *
 * @param {String} key The data's new variable name.
 * @return {Query}
 * @api public
 */

Query.prototype.as = function(key){
  // XXX: todo
  this.selects[this.selects.length - 1].alias = key;
  return this;
};

/**
 * Append constraint to query.
 *
 * Example:
 *
 *    query().start('users').where('likeCount').lte(200);
 *
 * @param {String} key The property to compare `val` to.
 * @param {Number|Date} val The number or date value.
 * @api public
 */

each(['eq', 'neq', 'gte', 'gt', 'lte', 'lt', 'nin', 'match'], function(operator){
  Query.prototype[operator] = function(val){
    return this.constraint(this.context, operator, val);
  }
});

/**
 * Check if the value exists within a set of values.
 *
 * @chainable
 * @param {Object} val The constraint value.
 * @return {Query}
 * @api public
 */

Query.prototype.contains = function(val){
  return this.constraint(this.context, 'in', val);
};

/**
 * Append action to query, then execute.
 *
 * Example:
 *
 *    query().start('users')
 *      .insert({ email: 'john.smith@gmail.com' });
 *
 *    query().start('users').query(fn);
 *
 * @api public
 */

each([
    'find'
  , 'remove'
  , 'pipe'
  , 'stream'
  , 'count'
  , 'exists'
], function(action){
  Query.prototype[action] = function(fn){
    return this.action(action).exec(fn);
  }
});

Query.prototype.all = Query.prototype.find;

/**
 * Create one or more records.
 *
 * This is different from the other actions 
 * in that it can take data (records) as arguments.
 *
 * Example:
 *
 *    query()
 *      .use('memory')
 *      .select('post')
 *      .create({ title: 'Foo' }, function(err, post){
 *
 *      });
 *
 * @param {Object} data Data record.
 * @param {Function} fn Function to be executed on record creation.
 * @return {Mixed} Whatever `fn` returns on the `create` action.
 * @api public
 */

Query.prototype.create = function(data, fn){
  return this.action('create', data).exec(fn);
};

/**
 * Update one or more records.
 *
 * This is different from the other actions
 * in that it can take data (records) as arguments.
 *
 * Example:
 *
 *    query()
 *      .use('memory')
 *      .select('post')
 *      .update({ title: 'Foo' }, function(err, post){
 *
 *      });
 *
 * @param {Object} data Data record.
 * @param {Function} fn Function to be executed on record update.
 * @return {Mixed} Whatever `fn` returns on the `update` action.
 * @api public
 */

Query.prototype.update = function(data, fn){
  return this.action('update', data).exec(fn);
};

/**
 * Return the first record that matches the query pattern.
 *
 * @param {Function} fn Function to execute on records after `find` action finishes.
 * @api public
 */

Query.prototype.first = function(fn){
  this.limit(1).action('find').exec(function(err, records){
    if (err) return fn(err);
    fn(err, records[0]);
  });
};

/**
 * Return the last record that matches the query pattern.
 *
 * @param {Function} fn Function to execute on records after `find` action finishes.
 * @api public
 */

Query.prototype.last = function(fn){
  this.limit(1).action('find').exec(function(err, records){
    if (err) return fn(err);
    fn(err, records[0]);
  });
};

/**
 * Add a record query LIMIT.
 *
 * @chainable
 * @param {Integer} val The record limit.
 * @return {Query}
 * @api public
 */

Query.prototype.limit = function(val){
  this.paging.limit = val;
  return this;
};

/**
 * Specify the page number.
 *
 * Use in combination with `limit` for calculating `offset`.
 *
 * @chainable
 * @param {Integer} val The page number.
 * @return {Query}
 * @api public
 */

Query.prototype.page = function(val){
  this.paging.page = val;
  return this;
};

/**
 * Specify the offset.
 *
 * @chainable
 * @param {Integer} val The offset value.
 * @return {Query}
 * @api public
 */
Query.prototype.offset = function(val){
  this.paging.offset = val;
  return this;
};

/**
 * Sort ascending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the query.
 *
 * Example:
 *
 *    query().start('users').asc('createdAt');
 *
 * @chainable
 * @param {String} key A property name.
 * @return {Query}
 * @api public
 */

Query.prototype.asc = function(key){
  return this.sort(key, 1);
};

/**
 * Sort descending by `key`.
 *
 * If the key is a property name, it will
 * be combined with the table/collection name
 * defined somewhere earlier in the query.
 *
 * Example:
 *
 *    query().start('users').desc('createdAt');
 *
 * @chainable
 * @param {String} key A property name.
 * @return {Query}
 * @api public
 */

Query.prototype.desc = function(key){
  return this.sort(key, -1);
};

/**
 * Pushes a `"relation"` onto the query.
 *
 * @chainable
 * @param {String} dir The direction.
 * @param {String} key The key.
 * @return {Query}
 * @api private
 */

Query.prototype.relation = function(dir, key){
  var attr = queryAttr(key, this._start);
  attr.direction = dir;
  this.relations.push(attr);
  return this;
};

/**
 * Pushes a `"constraint"` onto the query.
 *
 * @chainable
 * @param {String} key The constraint key.
 * @param {String} op Operator string
 * @param {Object} val The constraint value.
 * @return {Query}
 * @api public
 *
 * @see http://en.wikipedia.org/wiki/Lagrange_multiplier
 */

Query.prototype.constraint = function(key, op, val){
  this.constraints.push(new Constraint(key, op, val, this._start));
  return this;
};

/**
 * Pushes an `"action"` onto the query.
 *
 * Example:
 *
 *    query().action('insert', { message: 'Test' });
 *    query().action('insert', [ { message: 'one.' }, { message: 'two.' } ]);
 *
 * @chainable
 * @param {String} type The action type.
 * @param {Object|Array} data The data to act on.
 * @return {Query}
 * @api private
 */

Query.prototype.action = function(type, data){
  this.type = type
  this.data = data ? isArray(data) ? data : [data] : undefined;
  return this;
};

// XXX: only do if it decreases final file size
// each(['find', 'create', 'update', 'delete'])

/**
 * Pushes a sort direction onto the query.
 *
 * @chainable
 * @param {String} key The property to sort on.
 * @param {Integer} dir Direction it should point (-1, 1, 0).
 * @return {Query}
 * @api private
 */

Query.prototype.sort = function(key, dir){
  var attr = queryAttr(key, this._start);
  attr.direction = key;
  this.sorting.push(attr);
  return this;
};

/**
 * A way to log the query criteria,
 * so you can see if the adapter supports it.
 *
 * @chainable
 * @param {Function} fn The query criteria logging function
 * @return {Query}
 * @api public
 */

Query.prototype.explain = function(fn){
  this._explain = fn;
  return this;
};

/**
 * Clone the current `Query` object.
 *
 * @return {Query} A cloned `Query` object.
 * @api public
 */

Query.prototype.clone = function(){
  return new Query(this.name);
};

/**
 * Execute the query.
 * XXX: For now, only one query per adapter.
 *      Later, you can query across multiple adapters
 *
 * @see http://en.wikipedia.org/wiki/Query_optimizer
 * @see http://en.wikipedia.org/wiki/Query_plan
 * @see http://homepages.inf.ed.ac.uk/libkin/teach/dbs12/set5.pdf
 * @param {Function} fn Function that gets called on adapter execution.
 * @return {Mixed} Whatever `fn` returns on execution.
 * @api public
 */

Query.prototype.exec = function(fn){
  this.context = this._start = undefined;
  var adapter = this.adapters && this.adapters[0] || exports.adapters[0];
  this.validate(function(){});
  if (this.errors && this.errors.length) return fn(this.errors);
  if (!this.selects[0]) throw new Error('Must `.select(resourceName)`');
  return adapter.exec(this, fn);
};

/**
 * Validate the query on all adapters.
 *
 * @param {Function} fn Function called on query validation.
 * @api public
 */

Query.prototype.validate = function(fn){
  var adapter = this.adapters && this.adapters[0] || exports.adapters[0];
  validate(this, adapter, fn);
};

/**
 * Subscribe to a type of query.
 *
 * @param {Function} fn Function executed on each subscriber output.
 * @api public
 */

Query.prototype.subscribe = function(fn){
  var self = this;
  subscriber.output(this.type, function(record){
    if (self.test(record)) fn(record);
  });
};

/**
 * Define another query on the parent scope.
 *
 * XXX: wire this up with the resource (for todomvc).
 *
 * @param {String} name A query name.
 * @return {Query} A `Query` object.
 * @api public
 */

Query.prototype.query = function(name) {
  return query(name);
};

function queryModel(key) {
  key = key.split('.');

  if (2 === key.length)
    return { adapter: key[0], resource: key[1], ns: key[0] + '.' + key[1] };
  else
    return { resource: key[0], ns: key[0] }; // XXX: adapter: adapter.default()
}

/**
 * Variables used in query.
 */

function queryAttr(val, start){
  var variable = {};

  val = val.split('.');

  switch (val.length) {
    case 3:
      variable.adapter = val[0];
      variable.resource = val[1];
      variable.attr = val[2];
      variable.ns = variable.adapter + '.' + variable.resource;
      break;
    case 2:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.resource = val[0];
      variable.attr = val[1];
      variable.ns = variable.resource;
      break;
    case 1:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.resource = start;
      variable.attr = val[0];
      variable.ns = variable.resource;
      break;
  }

  variable.path = variable.ns + '.' + variable.attr;

  return variable;
}

function queryValue(val) {
  // XXX: eventually handle relations/joins.
  return { value: val, type: typeof(val) };
}
});
require.register("tower-query/lib/constraint.js", function(exports, require, module){

/**
 * Expose `Constraint`.
 */

module.exports = Constraint;

/**
 * Class representing a query constraint.
 *
 * @class
 *
 * @param {String} a The left constraint.
 * @param {String} operator The constraint.
 * @param {String} b The right constraint.
 * @param {Object} start The starting object.
 * @api public
 */

function Constraint(a, operator, b, start) {
  this.left = left(a, start);
  this.operator = operator;
  this.right = right(b);
}

function left(val, start) {
  var variable = {};

  val = val.split('.');

  switch (val.length) {
    case 3:
      variable.adapter = val[0];
      variable.resource = val[1];
      variable.attr = val[2];
      variable.ns = variable.adapter + '.' + variable.resource;
      break;
    case 2:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.resource = val[0];
      variable.attr = val[1];
      variable.ns = variable.resource;
      break;
    case 1:
      variable.adapter = 'memory'; // XXX: adapter.default();
      variable.resource = start;
      variable.attr = val[0];
      variable.ns = variable.resource;
      break;
  }
  
  variable.path = variable.ns + '.' + variable.attr;

  return variable;
}

function right(val) {
  // XXX: eventually handle relations/joins.
  return { value: val, type: typeof(val) };
}
});
require.register("tower-query/lib/validate.js", function(exports, require, module){

/**
 * Expose `validate`.
 */

module.exports = validate;

/**
 * Add validations to perform before this is executed.
 *
 * XXX: not implemented.
 *
 * @param {Query} query A query object.
 * @param {Adapter} adapter An adapter object.
 * @param {Function} fn Function executed at the end of validation.
 */

function validate(query, adapter, fn) {
  // XXX: only supports one action at a time atm.
  var constraints = query.constraints;
  var type = query.type;
  query.errors = [];
  // XXX: collect validators for resource and for each attribute.
  // var resourceValidators = resource(criteria[0][1].ns).validators;
  for (var i = 0, n = constraints.length; i < n; i++) {
    var constraint = constraints[i];

    if (!adapter.action.exists(constraint.left.resource + '.' + type))
      continue;

    var stream = adapter.action(constraint.left.resource + '.' + type);
    var param = stream.params && stream.params[constraint.left.attr];
    if (param && param.validate(query, constraint)) {
      // $ tower list ec2:group --name 'hello-again-again,hello-again'
      constraint.right.value = param.typecast(constraint.right.value);
    }
  }

  query.errors.length ? fn(query.errors) : fn();
}
});
require.register("tower-query/lib/validate-constraints.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var validator = require('tower-validator');

/**
 * Expose `validate`.
 */

module.exports = validate;

/**
 * Validate an object against an array of constraints.
 *
 * To define validations, use the `tower-validator` module.
 * XXX: that isn't implemented yet, they're in here.
 *
 * @param {Object} obj Record or other simple JavaScript object.
 * @param {Array} constraints Array of constraints.
 * @return {Boolean} true if obj passes all constraints, otherwise false.
 */

function validate(obj, constraints) {
  for (var i = 0, n = constraints.length; i < n; i++) {
    // XXX: obj vs. obj.get
    var constraint = constraints[i]
      , left = obj.get ? obj.get(constraint.left.attr) : obj[constraint.left.attr]
      , right = constraint.right.value;

    if (!validator(constraint.operator)(left, right))
      return false;
  }

  return true;
}
});
require.register("tower-query/lib/filter.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var validateConstraints = require('./validate-constraints');

/**
 * Expose `filter`.
 */

module.exports = filter;

/**
 * Filter records based on a set of constraints.
 *
 * This is a robust solution, hooking into an
 * extendable validation system. If you just need
 * something simple, use the built-in `array.filter`.
 *
 * @param {Array} array Array of plain objects (such as records).
 * @param {Array} constraints Array of constraints.
 * @return {Array} The filtered records.
 */

function filter(array, constraints) {
  if (!constraints.length) return array;

  var result = [];

  // XXX: is there a more optimal algorithm?
  for (var i = 0, n = array.length; i < n; i++) {
    if (validateConstraints(array[i], constraints))
      result.push(array[i]);
  }

  return result;
}
});
require.register("tower-query/lib/subscriber.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var program = require('tower-program');

/**
 * Expose `query-subscriber` program.
 */

module.exports = subscriber();

/**
 * Define a query subscribing program.
 *
 * @return {Program} A query subscriber program.
 */

function subscriber() {
  program('query-subscriber')
    .input('create')
    .input('update')
    .input('remove');

  return program('query-subscriber').init();
}
});
require.register("tower-adapter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var stream = require('tower-stream');
var resource = require('tower-resource');
var query = require('tower-query');
var type = require('tower-type');
var load = require('tower-load');

/**
 * Expose `adapter`.
 */

exports = module.exports = adapter;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Expose `Adapter` constructor.
 */

exports.Adapter = Adapter;

/**
 * Lazily get an adapter instance by `name`.
 *
 * @param {String} name An adapter name.
 * @return {Adapter} An adapter.
 * @api public
 */

function adapter(name) {
  if (exports.collection[name]) return exports.collection[name];
  if (exports.load(name)) return exports.collection[name];

  var obj = new Adapter(name);
  exports.collection[name] = obj;
  // exports.collection.push(obj);
  // XXX: if has any event listeners...
  exports.emit('define', obj);
  exports.emit('define ' + name, obj);
  return obj;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Lazy-load adapters.
 *
 * @param {String} name An adapter name.
 * @return {Adapter} An adapter.
 * @api public
 */

exports.load = function(name, path){
  return 1 === arguments.length
    ? load(exports, name)
    : load.apply(load, [exports].concat(Array.prototype.slice.call(arguments)));
};

/**
 * Check if adapter `name` exists.
 *
 * @param {String} name An adapter name.
 * @return {Boolean} true if adapter exists, otherwise false.
 * @api public
 */

exports.exists = function(name){
  return !!exports.collection[name];
};

// XXX: remove `exists` in favor of `has`.
exports.has = exports.exists;

/**
 * Class representing an abstraction over remote services and databases.
 *
 * @class
 *
 * @param {String} name An adapter name.
 * @api public
 */

function Adapter(name) {
  this.name = name;
  this.context = this;
  this.types = {};
  this.settings = {};
  // XXX
  this.resources = {};
  this.connections = {};
  //this.resource = this.resource.bind(this);
  // XXX: refactor, should handle namespacing.
  this.resource = resource.ns(name);
  this.action = stream.ns(name);
  // XXX: todo
  // this.type = type.ns(name);

  // make queryable.
  // XXX: add to `clear` for both (or something like).
  query.use(this);
}

/**
 * Start a query against this adapter.
 *
 * @return {Mixed} Whatever the implementation of the use function attribute returns.
 * @api public
 */

Adapter.prototype.query = function(){
  return query().use(this);
};

/**
 * Use database/connection (config).
 *
 * @param {String} name An adapter name.
 * @api public
 */

Adapter.prototype.use = function(name){
  throw new Error('Adapter#use not implemented');
};

/**
 * Define connection settings.
 *
 * @param {String} name An adapter name.
 * @param {Object} options Adapter options.
 * @api public
 */

Adapter.prototype.connection = function(name, options){
  if (1 === arguments.length && 'string' == typeof name) {
    setting = this.context = settings[name]
    return this;
  }

  if ('object' === typeof name) options = name;
  options || (options = {});
  options.name || (options.name = name);
  setting = this.context = settings[options.name] = options;

  return this;
};

/**
 * Datatype serialization.
 *
 * @chainable
 * @param {String} name An adapter name.
 * @return {Adapter}
 * @api public
 */

Adapter.prototype.type = function(name){
  this.context =
    this.types[name] || (this.types[name] = type(this.name + '.' + name));
  return this;
};

/**
 * Delegate to `type`.
 *
 * XXX: This may just actually become the `type` object itself.
 *
 * @chainable
 * @param {String} name An adapter name.
 * @return {Adapter}
 * @api public
 */

Adapter.prototype.serializer = function(name){
  // `this.types[x] === this.context`
  this.context.serializer(name);
  return this;
};

/**
 * Set a `to` relationship.
 *
 * @chainable
 * @param {Function} fn Function executed on `to` query.
 * @return {Adapter}
 * @api public
 */

Adapter.prototype.to = function(fn){
  this.context.to(fn);
  return this;
};

/**
 * Set a `from` relationship.
 *
 * @chainable
 * @param {Function} fn Function executed on `from` query.
 * @return {Adapter}
 * @api public
 */

Adapter.prototype.from = function(fn){
  this.context.from(fn);
  return this;
};

/**
 * Main Adapter function the query object executes which you need to implement on your own adapter.
 *
 * @chainable
 * @param {Query} query A query object.
 * @param {Function} fn Adapter implementation function.
 * @return {Adapter}
 * @api public
 */

Adapter.prototype.exec = function(query, fn){
  throw new Error('Adapter#exec not implemented.');
};

/**
 * Reset the context to `this`.
 *
 * @chainable
 * @return {Adapter}
 * @api public
 */

Adapter.prototype.self = function(){
  return this.context = this;
};

exports.api = function(name, fn){
  ['connect', 'disconnect'].forEach(function(method){
    fn[method] = function(){
      return fn()[method].apply(adapter(name), arguments);
    }
  });
};
});
require.register("tower-client-router/index.js", function(exports, require, module){

/**
 * Module dependencies
 */

var route = require('tower-route');
var series = require('part-async-series');

/**
 * Expose `router`.
 */

exports = module.exports = router;

/**
 * Expose `route`.
 */

exports.route = route;

/**
 * Expose `Context`.
 */

exports.Context = Context;

/**
 * Callback functions (middleware).
 */

var callbacks = exports.callbacks = [];

/**
 * Perform initial dispatch.
 */

var dispatch = true;

/**
 * Running flag.
 */

var running = false;

/**
 * Modern flag (for hash/history api).
 */

var modern = !!(history && history.pushState);

/**
 * Event handler for `onpopstate` or `hashchange`.
 */

var onchange;

/**
 * Event name.
 */

var event = modern ? 'onpopstate' : 'hashchange';

/**
 * Router as middleware.
 */

function router(context, next) {
  exports.dispatch(context, next);
}

/**
 * Dispatch the given `context`.
 *
 * @param {Object} context
 * @api private
 */

exports.dispatch = function(context, fn){
  if ('string' === typeof context)
    context = new Context({ path: context });

  series(callbacks, context, function(err){
    if (err && fn) fn(err);
  });

  return exports;
};

/**
 * Clear routes and callbacks.
 */

exports.clear = function(){
  callbacks.length = 0;
  route.routes.length = 0;
  return exports;
};

/**
 * When a route is created, add it to the router.
 */

route.on('define', function(_route){
  callbacks.push(function(context, next){
    return _route.handle(context, next);
  });
});

/**
 * Bind `onpopstate` or `hashchange` event handler.
 *
 * @api public
 */

exports.start = function(d){
  if (running) return;
  running = true;
  dispatch = false !== d;
  window.addEventListener(event, onchange);
  // be wary of location protocol == file:
  exports.replace(location.pathname + location.search);
};

/**
 * Unbind `onpopstate` or `hashchange` event handler.
 *
 * @api public
 */

exports.stop = function(){
  running = false;
  window.removeEventListener(event, onchange);
};

/**
 * Show `path` with optional `state` object.
 *
 * This is the same as if the server got a request.
 *
 * @param {String} path
 * @param {Object} state
 * @param {Boolean} dispatch
 * @api public
 */

exports.show = function(path, state, dispatch){
  var context = new Context({
    path: path,
    state: state
  });

  if (false !== dispatch) exports.dispatch(context);
  if (!context.unhandled) context.pushState();
  return context;
};

/**
 * Replace `path` with optional `state` object.
 *
 * @param {String} path
 * @param {Object} state
 * @api public
 */

exports.replace = function(path, state, dispatch){
  var context = new Context({
    path: path,
    state: state
  });

  if (null == dispatch) dispatch = true;
  if (dispatch) exports.dispatch(context);
  context.save();
  return context;
};

/**
 * Instantiate a new `Context`.
 *
 * XXX: Maybe this becomes `tower-client-context`.
 */

function Context(options) {
  options || (options = {});

  for (var key in options) this[key] = options[key];

  var path = options.path;
  var i = path.indexOf('?');
  this.canonicalPath = path;
  this.path = path || '/';
  this.state = {};
  this.state.path = path;
  this.querystring = ~i ? path.slice(i + 1) : '';
  this.pathname = ~i ? path.slice(0, i) : path;
  this.params = [];
  this.title = document.title;
  this.state = options.state || {};
}

Context.prototype.save = function(){
  this.replaceState();
};

Context.prototype.redirect = function(path){
  exports.replace(path);
  return this;
};

/**
 * Transition to a new route.
 *
 * This first exits out of the current route,
 * then enters into the new one.
 *
 * @param {String} name   Name of the route.
 * @api public
 */

Context.prototype.transition = function(name){
  // TODO: use the `queue` module, or somehow better configure.
  series(this.route.actions['exit'], this, function(){
    exports.dispatch(route(name));
  });
};

if (modern) { // for browsers supporting history.pushState
  Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
  };

  Context.prototype.replaceState = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
  };
  
  onchange = function onpopstate(e){
    if (e.state) exports.replace(e.state.path, e.state);
  };
} else { // for IE7/8
  Context.prototype.replaceState = Context.prototype.pushState = function(){
    window.location.hash = '#' + this.canonicalPath;
    document.title = this.title;
  };

  onchange = function onhashchange(e){
    // e.newURL.split(hash)[1];
    exports.replace(e.oldURL.split('#')[1]);
    return false;
  };
}
});
require.register("component-path-to-regexp/index.js", function(exports, require, module){
/**
 * Expose `pathtoRegexp`.
 */

module.exports = pathtoRegexp;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  var sensitive = options.sensitive;
  var strict = options.strict;
  keys = keys || [];

  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';

  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
};

});
require.register("tower-route/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var pathToRegexp = require('path-to-regexp');
var param = require('tower-param');
var series = require('part-async-series');

/**
 * Expose `route`.
 */

exports = module.exports = route;

/**
 * Expose `Route`.
 */

exports.Route = Route;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Mixins array.
 */
 
var mixins = [];

/**
 * Find or define a route.
 *
 * Examples:
 *
 *    route('/posts', 'posts.index')
 *    route('/posts', 'posts.index', 'GET')
 *    route('/posts', 'posts.index', { method: 'GET' })
 *    route('/posts', { name: 'posts.index', method: 'GET' })
 *    route({ path: '/posts', name: 'posts.index', method: 'GET' })
 *    route('posts.index')
 *
 * @param {String} name Route name.
 * @param {String} path Route path delimited with periods `.`.
 * @param {Object} options Route options.
 * @return {Route} Route instance.
 * @api public
 */

function route(name, path, options) {
  if (1 === arguments.length && exports.collection[name])
    return exports.collection[name];

  options || (options = {});

  var fn;

  if ('/' === name.charAt(0)) {
    if ('function' === typeof path)
      fn = path;
    else
      options.name = path;
    options.path = name;
  } else {
    options.name = name;
    options.path = path;
  }

  var instance = new Route(options);
  if (fn) instance.action(fn);
  exports.collection[instance.id] = instance;
  exports.collection.push(instance);
  exports.emit('define', instance);
  return instance;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Add mixin to exports.collection.
 *
 * @chainable
 * @param {Function} fn Function to add to list of mixins.
 * @return {Function} exports The main `route` function.
 * @api public
 */

exports.use = function(fn){
  mixins.push(fn);
  return exports;
};

/**
 * Remove all exports.collection.
 *
 * @api public
 */

exports.clear = function(){
  mixins.length = 0;
  exports.collection.length = 0;
};

/**
 * Class representing a route.
 *
 * @class
 *
 * @param {Object} options Route options.
 * @api public
 */

function Route(options){
  this.context = this;
  this.id = this.name = options.name;
  this.path = options.path;
  this.method = options.method || 'GET';
  this.regexp = pathToRegexp(
    options.path,
    this.keys = [],
    options.sensitive,
    options.strict);

  this.formats = {};
  this.params = [];
  this.accepts = [];
  this.middlewares = [];
  this.validators = [];
  this.actions = {};
}

/**
 * Make the `Route` instance an event emitter.
 */

Emitter(Route.prototype);

/**
 * Specify how to parse a URL parameter.
 *
 * This is roughly equivalent to an attribute
 * on a model, e.g. `model('Post').attr(x)`.
 *
 * @chainable
 * @param {String} name A param name.
 * @param {String} type A param type.
 * @return {Route}
 * @api public
 */

Route.prototype.param = function(name, type, options){
  this.context = this.params[name] = param(name, type, options);
  return this;
};

/**
 * Define a validator.
 *
 * @chainable
 * @param {String} key Name of the operator for assertion.
 * @param {Mixed} val
 * @return {Route}
 */

Route.prototype.validate = function(key, val){
  if (this === this.context)
    // key is a function
    this.validator(key, val)
  else
    // param or attr
    this.context.validator(key, val);

  return this;
};

/**
 * Append a validator function to the stack.
 *
 * @chainable
 * @param {Function} fn
 * @return {Route}
 */

Route.prototype.validator = function(fn){
  // XXX: just a function in this case, but could handle more.
  this.validators.push(fn);
  return this;
};

/**
 * The accepted HTTP methods.
 *
 * @chainable
 * @param {Object} type
 * @return {Route}
 * @api public
 */

Route.prototype.type = function(type){
  // maybe it should accept an array?
  this.method = type;
  return this;
};

/**
 * Add a function to process the incoming request.
 *
 * If called multiple times they will be executed
 * in sequence. They can be asynchronous, just
 * pass a `done` argument to `fn`.
 *
 * @chainable
 * @param {Function} fn A function to process the incoming request.
 * @return {Route}
 * @api public
 */

Route.prototype.use = function(fn){
  this.middlewares.push(fn);
  return this;
};

/**
 * Accepted `Content-Type`s.
 *
 * If not specified, it will accept any.
 *
 * @chainable
 * @param {Arguments} arguments The default JavaScript function argument list.
 * @return {Route}
 * @api public
 */

Route.prototype.accept = function(){
  var n = arguments.length
  var accepts = new Array(n);

  for (var i = 0; i < n; i++)
    this.accepts.push(arguments[i]);

  return this;
};

/**
 * Specify how to format the data for the response.
 *
 * Example:
 *
 *    route('/', 'index')
 *      .format('json', function(content){
 *        content.render({ hello: 'world' });
 *      })
 *
 * @chainable
 * @param {String} name The data format name.
 * @param {Function} fn The function to respond to the data format.
 * @return {Route}
 * @api public
 */

Route.prototype.format = function(name, fn){
  if ('function' === typeof name) {
    this.formats['*'] = name;
  } else {
    this.formats[name] = fn;
    this.accepts.push(name);
  }

  return this;
};

Route.prototype.before = function(name, fn){
  if ('function' === typeof name) {
    fn = name;
    name = 'request';
  }
  this._action(name).before.push(fn);
  return this;
};

/**
 * Add an action to the actions list.
 *
 * @chainable
 * @param name Action name.
 * @return {Route}
 * @api public
 */

Route.prototype.action = function(name, fn){
  if ('function' === typeof name) {
    fn = name;
    name = 'request';
  }
  this._action(name).fn = fn;
  return this;
};

Route.prototype.after = function(name, fn){
  if ('function' === typeof name) {
    fn = name;
    name = 'request';
  }
  this._action(name).after.push(fn);
  return this;
};

/**
 * Clear the chainable API context.
 *
 * @chainable
 * @return {Route}
 * @api public
 */

Route.prototype.self = function(){
  context = this;
  return this;
};

/**
 * Check if this route matches `path`, if so
 * populate `params`.
 *
 * @param {String} path A path.
 * @param {Array} params Array of param objects.
 * @return {Boolean} true if this route matches `path`, else false.
 * @api private
 */

Route.prototype.match = function(path, params){
  var keys = this.keys;
  var qsIndex = path.indexOf('?');
  var pathname = ~qsIndex ? path.slice(0, qsIndex) : path;
  var m = this.regexp instanceof RegExp
    ? this.regexp.exec(pathname)
    : new RegExp(this.regexp).exec(pathname);

  if (!m) return false;

  for (var i = 1, n = m.length; i < n; ++i) {
    var key = keys[i - 1];

    var val = 'string' == typeof m[i]
      ? decodeURIComponent(m[i])
      : m[i];

    if (key) {
      params[key.name] = params.hasOwnProperty(key.name) && undefined !== params[key.name]
        ? params[key.name]
        : val;
    } else {
      params.push(val);
    }
  }

  return true;
};

/**
 * Process a request given a context.
 *
 * @param {Context} context
 * @param {Function} next Function used to handle non-matching context path and params.
 * @return {Boolean} true if a request can be processed, else falsy.
 * @api public
 */

Route.prototype.handle = function(context, next){
  if (!this.match(context.path, context.params))
    return next();

  this.parseParams(context);

  context.event || (context.event = 'request');
  context.route = this;

  // TODO: defaults for exports.collection?
  // if (this._enter.length) {
  var self = this;

  try {
    var actions = self.actions[context.event];
    var callbacks = self.middlewares.concat(
      actions.before,
      [actions.fn],
      //  self.formats['*'] ? [self.formats['*']] : []
      actions.after
    );

    // req.accepted[0].subtype
    // req.ip
    // http://expressjs.com/api.html
    // req.xhr
    // req.subdomains
    // req.acceptedLanguages for tower-inflector
    // TODO: handle multiple formats.
    series(callbacks, context, next, self);
  } catch (e) {
    //self.emit(500, e);
    // Errors that occurs won't be caught but an error
    // within the `series` method will.
    throw e;
    context.error = e;
    series(self.actions['500'], context, function(){}, self)
  }
  
  return true;
};

/**
 * Parse the params from a given context.
 *
 * @param {Context} context A context.
 * @api public
 */

Route.prototype.parseParams = function(context){
  for (var key in this.params) {
    if (context.params.hasOwnProperty(key)) {
      // XXX: serialize params
      // tower-type
      context.params[key] = parseInt(context.params[key], 10);
    }
  }
};

/**
 * Get action object for route.
 *
 * @api private
 */

Route.prototype._action = function(name){
  return this.actions[name] ||
    (this.actions[name] = { before: [], after: [] });
};

/**
 * Apply all mixins.
 */

exports.on('define', function(route){
  for (var i = 0, n = mixins.length; i < n; i++) {
    mixins[i](route);
  }
});
});
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("tower-validator/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var validators = require('./lib/validators');

/**
 * Expose `validator`.
 */

exports = module.exports = validator;

/**
 * All validators in the order they were defined.
 */

exports.collection = [];

/**
 * Get or set a validator function.
 *
 * @param {String} name
 * @param {Function} [fn]
 */

function validator(name, fn) {
  if (undefined === fn) return exports.collection[name];

  exports.collection[name] = fn;
  exports.collection.push(fn);
  exports.emit('define', name, fn);
  
  return fn;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Check if validator exists.
 *
 * @param {String} name
 */

exports.has = function(name){
  return !!exports.collection[name];
};

/**
 * Scope validators to a namespace.
 */

exports.ns = function(ns){
  return function validator(name, fn) {
    return exports(ns + '.' + name, fn);
  }
};

/**
 * Remove all validators.
 */

exports.clear = function(){
  var collection = exports.collection;

  exports.off('define');
  for (var key in collection) {
    if (collection.hasOwnProperty(key)) {
      delete collection[key];
    }
  }
  collection.length = 0;
  return exports;
};

validators(exports);
});
require.register("tower-validator/lib/validators.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var indexof = require('indexof');

/**
 * Expose `validators`.
 */

module.exports = validators;

/**
 * Define basic operators/validators.
 */

function validators(validator) {
  validator('eq', function eq(a, b){
    return a === b;
  });

  validator('neq', function neq(a, b){
    return a !== b;
  });

  validator('contains', function contains(a, b){
    return !!~indexof(b, a);
  });

  validator('in', validator('contains'));

  validator('excludes', function nin(a, b){
    return !~indexof(b, a);
  });

  validator('nin', validator('excludes'));

  validator('gte', function gte(a, b){
    return a >= b;
  });

  validator('gt', function gt(a, b){
    return a > b;
  });

  validator('lte', function gte(a, b){
    return a <= b;
  });

  validator('lt', function gt(a, b){
    return a < b;
  });

  validator('match', function match(a, b){
    return !!a.match(b);
  });
}
});
require.register("tower-type/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var validator = require('tower-validator');
var types = require('./lib/types');

/**
 * Expose `type`.
 */

exports = module.exports = type;

/**
 * Expose `Type`.
 */

exports.Type = Type;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Expose `validator`.
 */

exports.validator = validator.ns('type');

/**
 * Define or get a type.
 */

function type(name, fn) {
  if (undefined === fn && exports.collection[name])
      return exports.collection[name];

  var instance = new Type(name, fn);
  exports.collection[name] = instance;
  exports.collection.push(instance);
  exports.emit('define', name, instance);
  return instance;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Check if validator exists.
 *
 * @param {String} name
 */

exports.has = function(name){
  return !!exports.collection[name];
};

/**
 * Scope validators to a namespace.
 */

exports.ns = function(ns){
  return function type(name, fn) {
    return exports(ns + '.' + name, fn);
  }
};

/**
 * Remove all validators.
 */

exports.clear = function(){
  var collection = exports.collection;

  exports.off();
  for (var key in collection) {
    if (collection.hasOwnProperty(key)) {
      delete collection[key];
    }
  }
  collection.length = 0;
  return exports;
};

function Type(name, fn) {
  // XXX: name or path? maybe both.
  this.name = name;
  // XXX: or maybe just delegate:
  // this.validator = type.validator.ns(name);
  // that might reduce memory quite a bit.
  // even though it's still only a tiny bit of it.
  this.validators = [];
  // serialization/sanitization function.
  if (fn) this.use(fn);
}

Type.prototype.validator = function(name, fn){
  // XXX: see above, this should probably just
  // be happening in `validator.ns(this.name)`.
  exports.validator(this.name + '.' + name, fn);
  this.validators.push(this.validators[name] = fn);
  return this;
};

/**
 * Sanitize functions to pass value through.
 *
 * @param {Function} fn
 * @return {Type} this
 */

Type.prototype.use = function(fn){
  (this.sanitizers || (this.sanitizers = [])).push(fn);
  return this;
};

/**
 * Sanitize (or maybe `serialize`).
 *
 * XXX: maybe rename to `cast`?
 */

Type.prototype.sanitize = function(val){
  if (!this.sanitizers) return val;

  this.sanitizers.forEach(function sanitize(sanitizer){
    val = sanitizer(val);
  });

  return val;
};

/**
 * Seralizer object by name.
 *
 * XXX: Maybe refactor into `tower/serializer` module.
 *
 * @param {String} name
 */

Type.prototype.serializer = function(name){
  this.context = (this.serializers || (this.serializers = {}))[name] = {};
  return this;
};

/**
 * Define how to serialize type from
 * JavaScript to external API/service request format.
 *
 * XXX: to/out/request/serialize/format/use
 *
 * @param {Function} fn
 */

Type.prototype.to = function(fn){
  // XXX: some way to set a default serializer.
  if (!this.context) this.serializer('default');
  this.context.to = fn;
  return this;
};

/**
 * Define how to deserialize type from 
 * external API/service request format to JavaScript.
 *
 * XXX: from/in/response/deserialize
 *
 * @param {Function} fn
 */

Type.prototype.from = function(fn){
  if (!this.context) this.serializer('default');
  this.context.from = fn;
  return this;
};

/**
 * Bring back to parent context.
 *
 * XXX: need more robust way to do this across modules.
 */

Type.prototype.type = function(name){

};

types(exports);
});
require.register("tower-type/lib/types.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var isArray = require('part-is-array');

/**
 * Expose `types`.
 */

module.exports = types;

/**
 * Define basic types and type validators.
 */

function types(type) {
  // XXX: type('string').validator('lte')
  // would default to `validator('gte')` if not explicitly defined.
  type('string')
    .use(String)
    .validator('gte', function gte(a, b){
      return a.length >= b.length;
    })
    .validator('gt', function gt(a, b){
      return a.length > b.length;
    });

  type('id');

  type('integer')
    .use(parseInt);

  type('float')
    .use(parseFloat);

  type('decimal')
    .use(parseFloat);

  type('number')
    .use(parseFloat);
    
  type('date')
    .use(parseDate);

  type('boolean')
    .use(parseBoolean);

  type('array')
    // XXX: test? test('asdf') // true/false if is type.
    // or `validate`
    .use(function(val){
      // XXX: handle more cases.
      return isArray(val)
        ? val
        : val.split(/,\s*/);
    })
    .validator('lte', function lte(a, b){
      return a.length <= b.length;
    });

  function parseDate(val) {
    return isDate(val)
      ? val
      : new Date(val);
  }

  function parseBoolean(val) {
    // XXX: can be made more robust
    return !!val;
  }
}

// XXX: refactor to `part`
function isDate(val) {
  return '[object Date]' === Object.prototype.toString.call(val);
}
});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("tower-attr/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var validator = require('tower-validator').ns('attr');
var text = require('tower-text');
var type = require('tower-type');
var kindof = 'undefined' === typeof window ? require('type-component') : require('type');
var validators = require('./lib/validators');

text('attr', 'Invalid attribute: {{name}}');

/**
 * Expose `attr`.
 */

exports = module.exports = attr;

/**
 * Expose `Attr`.
 */

exports.Attr = Attr;

// XXX:
// module.exports = attr;
// attr('user.email')
// attr.on('define', function(name, obj));

/**
 * Expose `validator`.
 */

exports.validator = validator;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Get an `Attr`.
 */

function attr(name, type, options) {
  if (undefined === type && exports.collection[name])
    return exports.collection[name];

  var instance = new Attr(name, type, options);
  exports.collection[name] = instance;
  exports.collection.push(instance);
  exports.emit('define', name, instance);
  return instance;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Create an `attr` function that
 * just prepends a namespace to every key.
 */

exports.ns = function(ns){
  function attr(name, type, options) {
    return exports(ns + '.' + name, type, options);
  }

  // XXX: copy functions?
  for (var key in exports) {
    if ('function' === typeof exports[key])
      attr[key] = exports[key];
  }
  return attr;
};

/**
 * Instantiate a new `Attr`.
 */

function Attr(name, type, options){
  if (!type) {
    options = { type: 'string' };
  } else {
    var kind = kindof(type);
    if ('object' === kind) {
      options = type;
    } else if ('function' === kind) {
      options = { value: type };
      // XXX: array too
    } else {
      if ('object' !== kindof(options)) {
        options = { value: options };
      } else {
        options || (options = {}); 
      }
      options.type = type;
    }
  }

  this.name = name;
  this.type = options.type || 'string';
  // XXX: I18n path, maybe should be
  // model.user.attr.
  this.path = options.path || 'attr.' + name;
  if (undefined !== options.value) {
    this.value = options.value;
    this.hasDefaultValue = true;
    this.defaultType = kindof(options.value);
  }

  if (options.validators) this.validators = [];
  if (options.alias) this.aliases = [ options.alias ];
  else if (options.aliases) this.aliases = options.aliases;

  // XXX: maybe it should allow any custom thing to be set?
}

/**
 * Add validator to stack.
 */

Attr.prototype.validator = function(key, val){
  var assert = validator(key);
  // XXX: need some sort of error handling so it's
  // easier to tell `assert` is undefined.

  // lazily instantiate validators
  (this.validators || (this.validators = []))
    .push(function validate(attr, obj, fn){
      if (!assert(attr, obj, val)) {
        // XXX: hook into `tower-inflector` for I18n
        var error = text.has(attr.path)
          ? text(attr.path).render(attr)
          : text('attr').render(attr);

        obj.errors[attr.name] = error;
        obj.errors.push(error);
      }
    });
};

Attr.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
};

Attr.prototype.validate = function(obj, fn){
  if (!this.validators) return fn();

  var self = this;

  // XXX: part-async-series
  this.validators.forEach(function(validate){
    validate(self, obj);
  });

  if (fn) fn(); // XXX
};

/**
 * Convert a value into a proper form.
 *
 * Typecasting.
 *
 * @param {Mixed} val
 */

Attr.prototype.typecast = function(val){
  return type(this.type).sanitize(val);
};

/**
 * Get default value.
 *
 * @param {Mixed} obj the object/record/instance to use
 *    in computing the default value (if it's a function).
 */

Attr.prototype.apply = function(obj){
  if (!this.hasDefaultValue) return;

  // XXX: this should be computed in the constructor.
  switch (this.defaultType) {
    case 'function':
      return this.value(obj);
      break;
    case 'array':
      return this.value.concat();
      break;
    default:
      return this.value;
      break;
  }
};

validators(exports);
});
require.register("tower-attr/lib/validators.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var validator = require('tower-validator');

/**
 * Expose `validators`.
 */

module.exports = validators;

/**
 * Define default validators.
 */

function validators(attr) {
  // XXX: maybe this goes into a separate module.
  attr.validator('present', function(self, obj){
    return null != obj.get(self.name);
  });

  ['eq', 'neq', 'in', 'nin', 'contains', 'gte', 'gt', 'lt', 'lte'].forEach(function(key){
    attr.validator(key, function(self, obj, val){
      return validator(key)(obj.get(self.name), val);
    });
  });
}
});
require.register("tower-param/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var validator = require('tower-validator');
var type = require('tower-type');
var isArray = require('part-is-array');
var validators = require('./lib/validators');

/**
 * Expose `param`.
 */

exports = module.exports = param;

/**
 * Expose `Param`.
 */

exports.Param = Param;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Expose `validator`.
 */

exports.validator = validator.ns('param');

/**
 * Get a `Param`.
 */

function param(name, type, options) {
  if (exports.collection[name])
    return exports.collection[name];

  var instance = new Param(name, type, options);
  exports.collection[name] = instance;
  exports.collection.push(instance);
  exports.emit('define', name, instance);
  return instance;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Instantiate a new `Param`.
 */

function Param(name, type, options){
  if (!type) {
    options = { type: 'string' };
  } else if (isArray(type)) {
    options = { type: 'array' };
    options.itemType = type[0] || 'string';
  } else if ('object' === typeof type) {
    options = type;
  } else {
    options || (options = {});
    options.type = type;
  }

  this.name = name;
  this.type = options.type || 'string';

  if (options.validators) this.validators = [];
  if (options.alias) this.aliases = [ options.alias ];
  else if (options.aliases) this.aliases = options.aliases;

  // XXX: lazily create validators/operators?
  // this.validators = options.validators || [];
  // this.operators = options.operators || [];
}

/**
 * Add validator to stack.
 */

Param.prototype.validator = function(key, val){
  var assert = exports.validator(key);

  (this.validators || (this.validators = []))
    .push(function validate(self, query, constraint){ // XXX: fn callback later
      if (!assert(self, constraint.right.value, val))
        query.errors.push('Invalid Constraint something...');
    });
};

/**
 * Append operator to stack.
 */

Param.prototype.operator = function(name){
  if (!this.operators) {  
    this.operators = [];

    var assert = validator('in');

    (this.validators || (this.validators = []))
      .push(function validate(self, query, constraint){
        if (!assert(self, constraint.operator, self.operators)) {
          query.errors.push('Invalid operator ' + constraint.operator);
        }
      });
  }

  this.operators.push(name);
};

Param.prototype.validate = function(query, constraint, fn){
  if (!this.validators) return true;

  for (var i = 0, n = this.validators.length; i < n; i++) {
    this.validators[i](this, query, constraint);
  }

  return !(query.errors && query.errors.length);
};

Param.prototype.alias = function(key){
  (this.aliases || (this.aliases = [])).push(key);
};

// XXX: this might be too specific, trying it out for now.
Param.prototype.format = function(type, name){
  this.serializer = { type: type, name: name };
};

/**
 * Convert a value into a proper form.
 *
 * Typecasting.
 *
 * @param {Mixed} val
 */
 
Param.prototype.typecast = function(val){
  // XXX: handle item type for array.
  return type(this.type).sanitize(val);
};

validators(exports);
});
require.register("tower-param/lib/validators.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var validator = require('tower-validator');

/**
 * Expose `validators`.
 */

module.exports = validators;

/**
 * Define default validators.
 */

function validators(param) {
  // XXX: todo
  param.validator('present', function(self, obj){
    return null != obj;
  });

  ['eq', 'neq', 'in', 'nin', 'contains', 'gte', 'gt', 'lt', 'lte', 'match'].forEach(function(key){
    param.validator(key, function(self, obj, val){
      return validator(key)(obj, val);
    });
  });
}
});
require.register("tower-content/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var proto = require('./lib/proto');
var statics = require('./lib/statics');
var root;

/**
 * Expose `content`.
 */

exports = module.exports = content;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Public API. Gets an existing content or creates a new one.
 *
 * @param {String} name The content's name.
 * @param {Function} fn Function called on content initialization.
 * @return {Content} A `Content` object.
 * @api public
 */

function content(name, fn) {
  if (exports.collection[name]) return exports.collection[name];

  /**
   * Class representing a specific data segment in the DOM.
   *
   * @class
   *
   * @param {Object} data The content's data.
   * @api public
   */

  function Content(data) {
    this.name = name;
    // all actual attributes/values
    this.attrs = {};
    this.children = [];

    if (data) {
      // special prop
      this.parent = data.parent;
      delete data.parent;
      this.update(data);
    }

    // XXX: probably should do `this.set('parent')`
    //      so there is a standard way of managing parents.
    if (!this.parent && 'root' !== name)
      this.parent = exports.root();
    if (this.parent)
      this.parent.children.push(this);

    this.root = 'root' === name
      ? this
      : exports.root();

    // for being able to emit events to instances from class.
    Content.instances.push(this);
    Content.emit('init', this);
  }

  Content.prototype = {};
  Content.prototype.constructor = Content;
  Content.id = name;
  Content.attrs = [];
  Content.actions = {};
  Content.helpers = {};
  Content.instances = [];

  // statics

  for (var key in statics) Content[key] = statics[key];

  // proto

  for (var key in proto) Content.prototype[key] = proto[key];

  if (fn) Content.on('init', fn);

  exports.collection.push(Content);
  exports.collection[name] = Content;
  exports.emit('define', Content);
  return Content;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(proto);
Emitter(statics);

// XXX: maybe so you can do:
// content('body').emit('change x')
// to notify all instances of body
//statics._emit = statics.emit;
//statics.emit = function(name){
//  
//}

/**
 * Clear the collections.
 * Used for testing.
 *
 * @chainable
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.clear = function(){
  exports.off();
  exports.root().remove();
  exports.collection = [];
  root = undefined;
  return this;
};

/**
 * Check if a content has been defined.
 *
 * @param {String} name The content's name.
 * @return {Boolean} true if the `Content` has been defined, but false otherwise.
 * @api public
 */

exports.defined = function(name){
  return exports.collection.hasOwnProperty(name);
};

/**
 * Check if `obj` is a `Content` object
 *
 * @param {Content} obj A content object.
 * @return {Boolean} true if `obj` is a Content object, but false otherwise.
 * @api public
 */

exports.is = function(obj){
  return obj && '[object Content]' === obj.toString();
};

/**
 * Get the initiated root content.
 *
 * @return {Content} The root content.
 * @api public
 */

exports.root = function(){
  if (root) return root;
  return root = content('root').init();
};
});
require.register("tower-content/lib/proto.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var indexOf = require('indexof')
var slice = [].slice;

/**
 * Get attr.
 *
 * Attributes can be functions.
 * However, an `action` can not be called through `get`.
 *
 * @constructor Content
 * @param {String} str A path delimited by periods `.`.
 * @return {Mixed} An attribute.
 * @api public
 */

exports.get = function(str){
  var path = str.split('.');
  var val = findAttr(this, path.shift());

  // XXX: refactor to more generic/better system.
  while (path.length && undefined !== val) {
    var name = path.shift();
    // XXX: should this be hasOwnProperty?
    //      doesn't allow you to do `.constructor` though.
    if (val[name] !== undefined) {
      val = val[name];
    // XXX: unoptimized, but should work for the moment.
    } else if ('function' === typeof val.get) {
      val = val.get([name].concat(path).join('.'));
      path = [];
    } else {
      val = undefined;
    }
  }

  return val;
};

/**
 * Set attr.
 *
 * @constructor Content
 * @param {String} name The attribute's name.
 * @param {Mixed} val The attribute's value.
 * @return {Object} The attribute's value.
 * @api public
 */

exports.set = function(name, val, broadcaster){
  // XXX: set for `nested.path`.
  // XXX: make better comparator.
  if (this.attrs[name] !== val) {
    var prev = this.attrs[name];
    this.attrs[name] = val;
    // XXX: maybe it looks for `dependencies` on
    //      `this.constructor.attrs[name].dependencies`,
    //      to see if it should emit change events for computed props.
    if (broadcaster) {
      if (true === broadcaster) broadcaster = this.root;
      broadcaster.broadcast('change ' + name, val, prev);
    } else {
      this.changed(name, val, prev);
    }
  }

  return val;
};

/**
 * Update attribute value.
 *
 * @constructor Content
 * @chainable
 * @param {Object} data The new attribute value.
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.update = function(data){
  for (var key in data) this.set(key, data[key]);
  return this;
};

/**
 * Trigger the `change` event on an attribute.
 *
 * @constructor Content
 * @param {String} name The attribute's name.
 * @param {Mixed} val The attribute's value.
 * @param {Object} prev The attribute's previous value.
 * @api public
 */

exports.changed = function(name, val, prev){
  this.emit('change ' + name, val, prev);
  this.emit('change', name, val, prev);
  if (this.parent) this.parent.changed(name, val, prev);
};

/**
 * Notify self and all children of event.
 *
 * @param {String} name The attribute's name.
 * @api public
 */

exports.broadcast = function(){
  this.emit.apply(this, arguments);
  if (!this.children.length) return this;

  for (var i = 0, n = this.children.length; i < n; i++)
    this.children[i].broadcast.apply(this.children[i], arguments);

  return this;
};

/**
 * Simple wrapper around `.on('change <attr>')`.
 *
 * @constructor Content
 * @param {String} attr The attribute's name.
 * @param {Function} fn The callback to trigger when on an attribute's change event.
 * @api public
 */

exports.watch = function(attr, fn){
  return this.on('change ' + attr, fn);
};

/**
 * Apply an action.
 *
 * @constructor Content
 * @param {String} name The action's name.
 * @param {Array} args The action's list of parameters.
 * @return {Function} The named action.
 * @api public
 */

exports.apply = function(name, args){
  return findAction(this, name).apply(this, args);
};

/**
 * Call an action.
 *
 * @constructor Content
 * @param {String} name The action's name.
 * @return {Function} The named action.
 * @api public
 */

exports.call = function(name){
  return findAction(this, name).apply(this, slice.call(arguments, 1));
};

/**
 * Emit `'remove'` event for directives
 * to teardown custom functionality for their element.
 *
 * @constructor Content
 * @chainable
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.remove = function(){
  for (var i = 0, n = this.children.length; i < n; i++) {
    this.children[i].remove();
  }
  this.emit('remove');
  // XXX: not sure this is necessary
  this.constructor.emit('remove', this);

  var i = indexOf(this.constructor.instances, this);
  if (i >= 0)
    this.constructor.instances.splice(i, 1);

  this.root = undefined;
  return this;
};

/**
 * Standard `toString`.
 *
 * @constructor Content
 * @see http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 * @return {String} A specifically formatted String.
 * @api public
 */

exports.toString = function(){
  return '[object Content]';
};

/**
 * Traverse content tree to find attribute.
 *
 * @param {Content} content The starting content.
 * @param {String} name The attribute's name.
 * @return {Object} The named attribute.
 */

function findAttr(content, name) {
  while (content) {
    // the order of lookups:
    // this.attrs[name]
    // this.constructor.attrs[name].value // default
    // this.parent.get(name);
    if (undefined !== content.attrs[name]) return content.attrs[name];

    // try getting default value
    var attr = content.constructor.attrs[name];
    if (attr && attr.hasDefaultValue)
      return content.attrs[name] = attr.apply(content);
    // try getting value from parent
    // XXX: not sure if it should cache
    content = content.parent;
  }
}

/**
 * Traverse content tree to find action `fn`.
 *
 * @param {Content} content The starting content.
 * @param {String} name The action's name.
 * @return {Function} The named action.
 */

function findAction(content, name) {
  while (content) {
    if (content.constructor.actions[name])
      return content.constructor.actions[name];
    content = content.parent;
  }

  throw new Error('content action [' + name + '] not found.');
}
});
require.register("tower-content/lib/statics.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var attr = require('tower-attr').ns('content');

/**
 * Instantiate a new `Content`.
 *
 * @constructor Content
 * @param {Object} data The content's data.
 * @return {Content} self
 */

exports.init = function(data){
  return new this(data);
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @constructor Content
 * @chainable
 * @param {String} name
 * @param {Object} options
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.attr = function(name, type, options){
  var obj = this.context = attr(this.id + '.' + name, type, options);

  this.attrs[name] = obj;
  this.attrs.push(obj);

  return this;
};

/**
 * Define an action.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The action's name.
 * @param {Function} fn The action's function definition.
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.action = function(name, fn){
  this.actions[name] = fn;

  this.prototype[name] = function(){
    fn.apply(this, arguments);
    return this; // chainable
  };

  return this;
};

/**
 * Define a helper method.
 *
 * Helpers are used mainly for dynamically generating values,
 * while actions are used for user actions.
 *
 * @param {String} name The action's name.
 * @param {Function} fn The action's function definition.
 * @return {Function} self.
 *
 * @chainable
 * @api public
 */

exports.helper = function(name, fn){
  // XXX: need to think about this more.
  this.actions[name] = fn;

  this.prototype[name] = function(){
    return fn.apply(this, arguments);
  };

  return this;
};

/**
 * Set property across all content instances.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The attribute name.
 * @param {Mixed} val The attribute value
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.set = function(name, val){
  if (this.instances.length) {
    for (var i = 0, n = this.instances.length; i < n; i++) {
      this.instances[i].set(name, val);
    }
  }
  return this;
};

/**
 * Trigger `change` event on all content instances.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The attribute name
 * @return {Function} exports The main `content` function.
 * @api public
 */
exports.changed = function(name){
  if (this.instances.length) {
    for (var i = 0, n = this.instances.length; i < n; i++) {
      this.instances[i].changed(name);
    }
  }
  return this;
};
});
require.register("tower-template/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var directive = require('tower-directive');

/**
 * Expose `template`.
 */

exports = module.exports = template;

/**
 * Expose `collection`.
 */

exports.collection = {};

/**
 * Expose `compile`.
 */

exports.compile = compile;

/**
 * Expose `parse`.
 */

exports.parse = parse;

/**
 * Client-side reactive templates (just plain DOM node manipulation, no strings).
 *
 * @module template
 *
 * @param {String} name The template's name.
 * @param {HTMLNode} node The HTML node.
 * @return {Function} The compiled template function.
 * @api public
 */

function template(name, node) {
  // if `name` is a DOM node, arguments are shifted by 1
  if ('string' !== typeof name) return compile(name);
  // only 1 argument
  if (undefined === node) return exports.collection[name];
  // compile it
  return exports.collection[name] = compile(node);
}

/**
 * Check if template with `name` exists.
 *
 * @api public
 */

exports.has = function(name){
  return !!exports.collection.hasOwnProperty(name);
};

/**
 * Parse HTML string or, if HTMLNode, just return that.
 *
 * @param {Mixed} obj
 */

function parse(obj) {
  
}

/**
 * Traverse `node` and children recursively,
 * and collect and execute directives.
 *
 * @param {HTMLNode} node
 * @param {Content} scope
 * @return {Function} The compiled template function.
 */

function compile(node) {
  // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  var fn = node.nodeType
    ? compileNode(node)
    : compileEach(node);

  // clone original element
  fn.clone = function clone(scope){
    return fn(scope, node.cloneNode(true));
  }

  fn.clone2 = function(){
    return node.cloneNode(true);
  }

  return fn;
}

function compileNode(node) {
  var directivesFn = compileDirectives(node, nodeFn);
  var terminal = directivesFn && directivesFn.terminal;
  
  // recursive
  var eachFn = !terminal && node.childNodes
    ? compileEach(node.childNodes)
    : undefined;

  // `returnNode` is used for recursively 
  // passing children. this is used for cloning, 
  // where it should apply the directives to 
  // the new children, not the original 
  // template's children.

  function nodeFn(scope, returnNode) {
    returnNode || (returnNode = node);

    // apply directives to node.
    if (directivesFn) scope = directivesFn(scope, returnNode);

    // recurse, apply directives to children.
    //if (eachFn && returnNode.childNodes)
    if (eachFn && returnNode.childNodes)
      eachFn(scope, returnNode.childNodes, returnNode);

    return returnNode;
  }

  return nodeFn;
}

function compileEach(children) {
  var fns = [];
  // doesn't cache `length` b/c items can be removed
  //for (var i = 0, n = children.length; i < n; i++) {
  for (var i = 0; i < children.length; i++) {
    fns.push(compileNode(children[i]));
  }

  return createEachFn(fns);
}

function compileDirectives(node, nodeFn) {
  var directives = getDirectives(node);

  if (!directives.length) return; // don't execute function if unnecessary.

  var terminal = false;
  var fns = [];
  for (var i = 0, n = directives.length; i < n; i++) {
    var fn = directives[i].compile(node, nodeFn);
    fns.push(fn);
    terminal = directives[i]._terminal;
    if (terminal) break;
  }

  var directivesFn = createDirectivesFn(fns);

  directivesFn.terminal = terminal;

  return directivesFn;
}

function getDirectives(node) {
  var directives = [];

  // https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
  switch (node.nodeType) {
    case 1: // element node (visible tags plus <style>, <meta>)
      // first, appendDirective directive named after node, if it exists.
      appendDirective(node.nodeName.toLowerCase(), directives);
      getDirectivesFromAttributes(node, directives);
      break;
    case 3: // text node
      // node.nodeValue
      appendDirective('interpolation', directives);
      break;
    case 8: // comment node
      //
      break;
  }

  if (directives.length) directives.sort(priority);
  return directives;
}

function getDirectivesFromAttributes(node, directives) {
  var attr;
  for (var i = 0, n = node.attributes.length; i < n; i++) {
    attr = node.attributes[i];
    // The specified property returns true if the 
    // attribute value is set in the document, 
    // and false if it's a default value in a DTD/Schema.
    // http://www.w3schools.com/dom/prop_attr_specified.asp
    // XXX: don't know what this does.
    if (!attr.specified) continue;
    appendDirective(attr.name, directives);
  }
}

/**
 * Add directive.
 *
 * @param {String} name The directive's name.
 * @param {String} directives The list of directives.
 */

function appendDirective(name, directives) {
  if (directive.defined(name)) {
    directives.push(directive(name));
  }
}

/**
 * Creates a template function for node children
 * in an isolated JS scope.
 */

function createEachFn(fns) {
  var n = fns.length, i;

  function eachFn(scope, children, returnNode) {
    for (i = 0; i < n; i++) {
      // XXX: not sure this is correct.
      fns[i](scope, children[i]);
    }
  }

  return eachFn;
}

/**
 * Creates a template function for node directives
 * in an isolated JS scope.
 *
 * @param {Array} fns Array of directive functions.
 * @return {Function} A template function for node directives.
 */

function createDirectivesFn(fns) {
  var n = fns.length, i;

  function directivesFn(scope, node) {
    // XXX: maybe we can collect the directives in reverse
    //      and then use a `while` loop.
    for (i = 0; i < n; i++) {
      scope = fns[i](node, scope);
    }

    return scope;
  }

  return directivesFn;
}

/**
 * Sort by priority.
 */

function priority(a, b) {
  return b._priority - a._priority;
}
});
require.register("tower-uuid/index.js", function(exports, require, module){

/**
 * Expose `uuid`.
 */

module.exports = uuid;

/**
 * Taken straight from https://github.com/gjohnson/uuid,
 * which was taken straight from jed's gist: https://gist.github.com/982883
 *
 * If there is a more optimal/ideal approach, submit that sh**!
 *
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 */

function uuid(a) {
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        uuid         // random hex digits
      )
}
});
require.register("tower-memory-adapter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var adapter = require('tower-adapter');
var resource = require('tower-resource');
var stream = require('tower-stream');
var query = require('tower-query');
var uuid = require('tower-uuid');

/**
 * Expose `memory` adapter.
 */

exports = module.exports = adapter('memory');

/**
 * Collections by name.
 */

exports.collections = {};

/**
 * Adapter data types.
 */

exports
  .type('string')
  .type('text')
  .type('date')
  .type('float')
  .type('integer')
  .type('number')
  .type('boolean')
  .type('bitmask')
  .type('array');

/**
 * Find records.
 */

stream('memory.find', find);

/**
 * Create records.
 */

stream('memory.create', create);

/**
 * Update records.
 */

stream('memory.update', update);

/**
 * Remove records.
 */

stream('memory.remove', remove);

/**
 * Execute a database query.
 */

exports.exec = function(query, fn){
  var program = stream('memory' + '.' + query.type).create({
    collectionName: query.selects[0],
    query: query
  });

  // XXX: process.nextTick
  program.on('data', function(records){
    fn(null, records);
  });

  program.exec();

  return program;
};

/**
 * Load data.
 */

exports.load = function(name, val){
  if ('object' === typeof name) {
    for (var key in name)
      exports.load(key, name[key]);
  } else {
    var collection = exports.find(name) || exports.create(name);
    for (var i = 0, n = val.length; i < n; i++) {
      collection.push(identify(val[i], name))
    }
  }

  return exports;
};

/**
 * Reset everything.
 */

exports.clear = function(){
  // XXX: should be more robust.
  exports.collections = {};
};

exports.collection = function(name){
  return exports.find(name) || exports.create(name);
};

/**
 * Create a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.create = function(name, fn){
  return exports.collections[name] = [];
};

/**
 * Update a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.update = function(name, fn){

};

/**
 * Remove a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.remove = function(name, fn){
  delete exports.collections[name];
  return exports;
};

/**
 * Find a database/collection/index.
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */

exports.find = function(name, fn){
  return exports.collections[name];
};

function collection(name) {
  return exports.collections[name] || (exports.collections[name] = []);
}

function find(ctx, data, fn) {
  var records = collection(ctx.collectionName.resource);
  var constraints = ctx.query.constraints;

  if (constraints.length) {
    records = query.filter(records, constraints)
  } else {
    records = records.concat();
  }

  // XXX: sort
  // https://github.com/viatropos/tower/blob/master/packages/tower-support/shared/array.coffee
  //records = records.sort(function(a, b){
  //  a.id < b.id
  //});

  // limit
  if (ctx.query.paging.limit) records.splice(ctx.query.paging.limit);
  
  ctx.emit('data', records);
  
  fn();

  ctx.close();
}

function create(ctx, data, fn) {
  var name = ctx.collectionName.resource;
  var records = collection(name);
  var constraints = ctx.query.constraints;

  for (var i = 0, n = ctx.query.data.length; i < n; i++) {
    records.push(ctx.query.data[i] = identify(ctx.query.data[i], name));
  }

  ctx.emit('data', ctx.query.data);
  fn();
  ctx.close();
}

function update(ctx, data, fn) {
  var records = collection(ctx.collectionName.resource);
  var data = ctx.query.data && ctx.query.data[0]; // XXX: refactor
  var constraints = ctx.query.constraints;

  // XXX: or `isBlank`
  // if (!data)

  if (constraints.length) {
    records = query.filter(records, constraints);
  }

  // XXX: this could be optimized to just iterate once
  //      by reimpl part of `filter` here.
  // XXX: or maybe there is a `each-array-and-remove` that
  // is a slightly different iteration pattern so you can
  // remove/modify items while iterating.
  for (var i = 0, n = records.length; i < n; i++) {
    // XXX: `merge` part?
    // for (var key in data) records[i][key] = data[key];
    for (var key in data) records[i].set(key, data[key]);
  }

  ctx.emit('data', records);
  fn();
  ctx.close();
}

function remove(ctx, data, fn) {
  var records = collection(ctx.collectionName.resource);
  var constraints = ctx.query.constraints;
  var result = [];

  if (constraints.length) {
    var i = records.length;

    while (i--) {
      if (query.validate(records[i], constraints)) {
        result.unshift(records.splice(i, 1)[0]);
      }
    }
  }

  ctx.emit('data', result);
  fn();
}

/**
 * Create a hidden `__id__` on `record`,
 * so it can be stored in memory by id.
 */

function identify(record, name) {
  // XXX: refactor. maybe adapters allow raw objects (not resources)
  // used for storing in memory on the client.
  if (!resource.is(record)) {
    record = resource(name).init(record); 
  }

  if (null == record.__id__) {
    record.__id__ = (record.get ? record.get('id') : record.id) || uuid();
  }

  return record;
}
});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-value/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

});
require.register("tower-directive/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
var content = require('tower-content')
var expression = require('tower-expression')
var directives = require('./lib/directives')
var noop = function(){};

/**
 * Expose `directive`.
 */

exports = module.exports = directive;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Expose `Directive`.
 */

exports.Directive = Directive;

/**
 * Get/set directive function.
 * 
 * @param {String} name The directive's name.
 * @param {Function} fn Function called on directive definition.
 * @return {Directive} A `Directive` object.
 * @api public
 */

function directive(name, fn) {
  if (undefined === fn && exports.collection[name])
    return exports.collection[name];

  var instance = new Directive(name, fn);
  exports.collection[name] = instance;
  exports.collection.push(instance);
  exports.emit('define', instance);
  return instance;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);

/**
 * Check if a directive is defined.
 *
 * @param {String} name A directive name.
 * @return {Boolean} true if the `Directive` has been defined, but false otherwise
 * @api public
 */

exports.defined = function(name){
  return exports.collection.hasOwnProperty(name);
};

exports.has = exports.defined;

/**
 * Standard `toString`.
 *
 * @return {String} A specifically formatted String.
 * @api public
 */

exports.toString = function(){
  return 'directive';
};

/**
 * Clear all directives.
 *
 * @chainable
 * @return {Function} exports The main `directive` function.
 * @api public
 */

exports.clear = function(){
  exports.off();
  // recursively emit `"remove"`.
  content.clear();
  exports.collection = [];
  directives(exports);
  return exports;
};

/**
 * Class representing the extensions to HTML.
 *
 * @class
 *
 * @param {String} name The directive's name.
 * @param {Function} The directive function to be executed.
 * @api private
 */

function Directive(name, fn) {
  this.name = name;
  this._priority = 0;
  if (fn) this._exec = fn;
}

/**
 * Apply the directive.
 *
 * This one (compared to `compile`)
 * is useful for testing. It is slightly less optimized.
 *
 * @param {DOMNode} element The DOM element to apply the internal exec function to.
 * @param {Content} scope The content to apply the internal exec function to.
 * @return {Object} A scope.
 */

Directive.prototype.exec = function(element, scope){
  // way to quickly access scope on element later.
  // XXX: pretty sure if the element gets removed,
  //      this won't create a memory leak.
  element.__scope__ = scope;
  var attr = this._compileAttr(element);
  if (!content.is(scope)) scope = content('anonymous').init(scope);

  // return a scope.
  return this._exec(scope, element, attr) || scope;
};

/**
 * Return optimized function for use in templates.
 *
 * @param {DOMNode} element Element used for template.
 * @param {Function} nodeFn The template function used for transclusion.
 * @return {Object} A scope.
 * @api private
 */

Directive.prototype.compile = function(element, nodeFn){
  var self = this;
  var attr = this._compileAttr(element);
  var execFn = this._compiler
    ? this._compiler(element, attr, nodeFn)
    : this._exec;

  return function exec(element, scope) {
    element.__scope__ = scope;
    return execFn.call(self, scope, element, attr) || scope;
  }
};

/**
 * Define custom compiler function.
 *
 * @param {Function} fn Custom compiler function.
 * @return {Directive} this
 * @api private
 */

Directive.prototype.compiler = function(fn){
  this._compiler = fn;
  return this;
};

/**
 * XXX: The only types of elements this can be defined on.
 *
 * Comment/Script/Element/Text
 *
 * @chainable
 * @return {Function} exports The main `directive` function.
 */

Directive.prototype.types = function(){
  return this;
};

/**
 * Compile attribute from element.
 *
 * XXX: Maybe this becomes a separate module/object,
 *      or uses `tower-attr`.
 *
 * @param {Content} element The element to extract attributes from.
 * @return {Object} Extracted directive and element data.
 */

Directive.prototype._compileAttr = function(element){
  var val = element.getAttribute
    ? element.getAttribute(this.name)
    : undefined; // text/comment node

  return {
    name: this.name,
    value: val, // raw value
    expression: val ? expression(val) : noop
  };
};

/**
 * Sorting priority.
 *
 * Higher means it gets moved toward the front.
 *
 * @chainable
 * @param {Integer} val Defaults to 0.
 * @return {Function} exports The main `directive` function.
 */

Directive.prototype.priority = function(val){
  this._priority = val;
  return this;
};

/**
 * Terminal.
 *
 * If set to true, it will stop processing the template right there.
 * Then it is up to the directive itself to handling creating sub-templates.
 * This is used mainly for creating iterators.
 *
 * @chainable
 * @param {Boolean} [val]
 * @return {Directive} this
 */

Directive.prototype.terminal = function(val){
  this._terminal = false === val ? false : true;
  return this;
};

/**
 * Standard `toString`.
 *
 * @return {String} A specifically formatted String.
 */

Directive.prototype.toString = function(){
  return 'directive("' + this.name + '")';
};

/**
 * Define base directives.
 */

directives(exports);
});
require.register("tower-directive/lib/directives.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var content = require('tower-content')
if ('undefined' !== typeof window) {
  var event = require('event') // XXX: this file should be moved to separate module.
  var value = require('value'); 
}

/**
 * Expose `directives`.
 */

module.exports = directives;

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'name',
  'href',
  'title',
  'style',
  'width',
  'value',
  'height',
  'tabindex',
  'placeholder'
];

/**
 * Events supported.
 */

var events = [
  'change',
  'click',
  'mousedown',
  'mouseup',
  'blur',
  'focus',
  'input',
  'keydown',
  'keypress',
  'keyup'
];

/**
 * Define base directives.
 *
 * @param {Function} The directive module.
 */

function directives(directive) {

  // simple helpers for defining extra directives.

  directive.event = eventDirective;
  directive.attr = attrDirective;
  
  // creates a new scope

  directive('data-scope', function(scope, el, attr){
    return content(attr.value).init({ parent: scope });
  });

  directive('data-text', function(scope, el, attr){
    var val = scope.get(attr.value);
    if (undefined !== val)
      el.textContent = val;
  });

  // attr directives

  for (var i = 0, n = attrs.length; i < n; i++) {
    attrDirective(attrs[i]);
  }

  // event directives

  if ('undefined' !== typeof window) {
    // only on client, note server. tmp solution

    for (var i = 0, n = events.length; i < n; i++) {
      eventDirective(events[i]);
    }
  }

  function attrDirective(name) {
    directive('data-' + name, function(scope, el, attr){
      var exp = attr.expression;
      var prop = exp.deps[0];
      var val = scope.get(prop);

      if (undefined !== val)
        el.setAttribute(name, val);

      if (!event) return;

      if (exp.bindTo) {
        function handle(evt) {
          scope.attrs.event = evt;
          // XXX: `exp.broadcast` option.
          scope.set(prop, el.value);
          delete scope.attrs.event;
        }

        event.bind(el, 'change', handle);

        scope.on('remove', function(){
          event.unbind(el, 'change', handle);
        });
      }

      if (exp.bindFrom) {
        scope.on('change ' + prop, function(curr, prev){
          el.setAttribute(curr, val);
        });
      }
    });
  }

  function eventDirective(name) {
    // XXX: refactor to optimize for specific cases.
    directive('on-' + name, function(scope, el, attr){
      function handle(evt) {
        // so it can be used by expression
        scope.attrs.event = evt;
        if ('change' === name) evt.value = value(el);
        // scope.apply(attr.value, [evt]);
        attr.expression(scope);
        delete scope.attrs.event;
      }

      event.bind(el, name, handle);

      scope.on('remove', function(){
        event.unbind(el, name, handle);
      });
    });
  }
}
});
require.register("tower-load/index.js", function(exports, require, module){

/**
 * Expose `load`.
 */

exports = module.exports = load;

/**
 * Map of `api + '.' + key` to absolute module path.
 */

exports.paths = {};

/**
 * Map of path to array of `api + '.' + key`.
 */

exports.keys = {};

/**
 * Map of path to `fn`.
 */

exports.fns = {};

/**
 * Lazy-load a module.
 *
 * This is something like an IoC container.
 * Make sure the `api.toString()` is unique.
 *
 * @param {Function} api An api.
 * @param {String} key A unique key.
 * @param {Path} path Full `require.resolve(x)` path.
 * @return {Function} A module.
 * @api public
 */

function load(api, key, path) {
  return undefined === path
    ? exports.get(api, key)
    : exports.set.apply(exports, arguments);
}

/**
 * Get a module.
 *
 * @param {Function} api An api.
 * @param {String} key A unique key
 * @return {Function} A module.
 * @api public
 */

exports.get = function(api, key){
  var path = exports.paths[api.name + '.' + key];
  if (path) {
    var fn = exports.fns[path];
    if (fn) return fn();
  }
}

/**
 * Define how to lazy-load a module.
 *
 * @chainable
 * @param {Function} api An api.
 * @param {String} key A unique key.
 * @param {Path} path Full `require.resolve(x)` path.
 * @return {Function} exports The main `load` function.
 * @api public
 */

exports.set = function(api, key, path){
  var pathKey = api.name + '.' + key;
  if (!exports.paths[pathKey]) {
    exports.paths[pathKey] = path;
    (exports.keys[path] || (exports.keys[path] = [])).push(pathKey);
    if (!exports.fns[path]) {
      exports.fns[path] = requireFn(path, Array.prototype.slice.call(arguments, 3));
    }
  }
  return exports;
};

/**
 * Clear all modules.
 *
 * @param {Path} path Full `require.resolve(x)` path.
 * @api public
 */

exports.clear = function(path){
  for (var i = 0, n = exports.keys[path].length; i < n; i++) {
    delete exports.paths[exports.keys[path][i]];
  }
  exports.keys[path].length = 0;
  delete exports.keys[path];
  delete exports.fns[path];
};

/**
 * Return module function results.
 *
 * @param {Path} path Full `require.resolve(x)` path.
 * @param {Array} args Module function arguments array.
 * @return {Mixed} Module function return value.
 */

function requireFn(path, args) {
  return function(obj) {
    // remove all listeners
    exports.clear(path);

    var result = require(path);

    if ('function' === typeof result) {
      //args.unshift(obj);
      result.apply(result, args);
    }
    
    args = undefined;
    return result;
  }
}
});
require.register("tower-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');
var slice = [].slice;

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks || (this._callbacks = {});
  (this._callbacks[event] || (this._callbacks[event] = []))
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks || (this._callbacks = {});

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  if (!this._callbacks) return this;

  // all
  if (0 === arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 === arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  if (!this._callbacks) return this;

  this._callbacks || (this._callbacks || {});

  var callbacks = this._callbacks[event];

  if (callbacks) {
    var args = slice.call(arguments, 1);
    callbacks = callbacks.slice(0);
    for (var i = 0, n = callbacks.length; i < n; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks || (this._callbacks = {});
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !!this.listeners(event).length;
};
});
require.register("tower-operator/index.js", function(exports, require, module){

/**
 * Expose `operator`.
 */

exports = module.exports = operator;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Define/get an operator.
 */

function operator(name, fn) {
  if (!fn && exports.collection[name])
    return exports.collection[name];

  exports.collection[name] = fn;
  exports.collection.push(name);
  return fn;
}

// inspired from https://github.com/angular/angular.js/blob/master/src/ng/parse.js
operator('null', function(){
  return null;
});

operator('true', function(){
  return true;
});

operator('false', function(){
  return false;
});

var noop = function(){};

operator('undefined', noop);

operator('+', function(self, locals, a, b){
  a = a(self, locals);
  b = b(self, locals);

  if (undefined !== a) {
    return undefined !== b
      ? a + b
      : a;
  }
  return undefined !== b
    ? b
    : undefined;
});

// XXX: todo
operator('-');
operator('*');
operator('/');
operator('%');
operator('^');
operator('=');
operator('===');
operator('!==');
operator('==');
operator('!=');
operator('<=');
operator('<');
operator('>');
operator('>=');
operator('&&');
operator('||');
operator('&');
operator('|');
operator('!');
});
require.register("component-escape-regexp/index.js", function(exports, require, module){

/**
 * Escape regexp special characters in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

module.exports = function(str){
  return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
};
});
require.register("tower-expression/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var operator = require('tower-operator')
  , escapeRegExp = 'undefined' === typeof window
    ? require('escape-regexp-component')
    : require('escape-regexp');

/**
 * Expose `expression`.
 */

module.exports = expression;

/**
 * RegExps.
 */

var filterRegExp = / +| +/g;
var bindingRegExp = /^ *\[(\*)?([+-=])\] */;
var fnRegExp = /(\w+)\(([^\)]*)\)/;
var numberRegExp = /^\d+(?:\.\d+)*$/;
var propertyRegExp = /[\w\d\.]+/;
var optionsRegExp = /(.*)\[([^\[\]]+)\]/;
var argsRegExp = / *, */g;
var keyValueRegExp = /(\w+)*: *(\w+)/;
var operatorRegExp = [];
for (var i = 0, n = operator.collection.length; i < n; i++) {
  operatorRegExp.push(escapeRegExp(operator.collection[i]));
}
operatorRegExp = new RegExp('(' + propertyRegExp.source + ') +(' + operatorRegExp.join('|') + ') +(' + propertyRegExp.source + ')');

/**
 * Parse a directive expression.
 *
 * XXX: Maybe there are "named" expressions later.
 *
 * @param {String} val The directive expression string.
 * @return {Function} fn Expression to evaluate
 *    against the current `scope`.
 * @api public
 */

function expression(val) {
  // property used in this expression.
  var deps = { options: {} };
  var fn = Function('scope', '  return ' + parseExpression(val, deps));
  switch (deps.bind) {
    case 'to':
      fn.bindTo = true;
      break;
    case 'from':
      fn.bindFrom = true;
      break;
    case 'both':
      fn.bindTo = fn.bindFrom = true;
      break;
  }
  fn.broadcast = deps.broadcast;
  var options = deps.options;
  delete deps.options;
  delete deps.bind;
  delete deps.broadcast;
  var keys = [];
  for (var key in deps) keys.push(key);
  fn.deps = keys;
  fn.opts = options;
  return fn;
}

function filterExpression(val) {
  val = val.split(filterRexExp);
  for (var i = 0, n = val.length; i < n; i++) {
    // XXX
    // val[i] = x
  }
  return val
}

function parseExpression(val, deps) {
  // XXX: bindingExpression(val)
  val = bindingExpression(val, deps);
  return optionsExpression(val, deps)
    || keyValueExpression(val, deps)
    || fnExpression(val, deps)
    || operatorExpression(val, deps)
    || propertyExpression(val, deps);
}

function optionsExpression(val, deps) {
  if (!val.match(':') || !val.match(optionsRegExp)) return;

  var code = parseExpression(RegExp.$1, deps);
  val = RegExp.$2.split(argsRegExp);
  for (var i = 0, n = val.length; i < n; i++) {
    keyValueExpression(val[i], deps);
  }
  return code;
}

// <input on-keypress="enter:createTodo">
// <input on-keypress="enter : createTodo">
// <input on-keypress="enter:create(todo)">
function keyValueExpression(val, deps) {
  // XXX: todo
  // val.match(fnRegExp);
  if (!val.match(keyValueRegExp)) return;
  val = RegExp.$2;
  deps.options[RegExp.$1] = numberExpression(val) || expression(val);
}

// <input on-keypress="create(todo)">
function fnExpression(val, deps) {
  if (!val.match(fnRegExp)) return;

  var name = RegExp.$1;
  var args = RegExp.$2;
  
  if (args) {
    return "scope.call('" + name + "', " + argumentsExpression(args, deps) + ")";
  } else {
    return "scope.call('" + name + "')";
  }
}

function argumentsExpression(val, deps) {
  val = val.split(argsRegExp);
  var result = [];
  for (var i = 0, n = val.length; i < n; i ++) {
    // XXX: special cases: `i`, `event`, `this`.
    result.push(parseExpression(val[i], deps));
  }
  return result.join(', ');
}

function operatorExpression(val, deps) {
  if (!val.match(operatorRegExp)) return;

  var left = RegExp.$1;
  var operator = RegExp.$2;
  var right = RegExp.$3;

  var code = parseExpression(left, deps)
    + ' ' + operator + ' '
    + parseExpression(right, deps);

  return code;
}

function propertyExpression(val, deps) {
  return numberExpression(val, deps)
    || pathExpression(val, deps);
}

function numberExpression(val, deps) {
  if (val.match(numberRegExp)) return parseFloat(val);
}

function pathExpression(val, deps) {
  deps[val] = true;
  return "scope.get('" + val + "')";
}

var bindings = {
  '=': 'both',
  '+': 'to',
  '-': 'from'
};

function bindingExpression(val, deps) {
  if (!val.match(bindingRegExp)) return val;

  deps.broadcast = '*' === RegExp.$1;
  deps.bind = bindings[RegExp.$2];

  return val.substr(RegExp.lastMatch.length);
}
});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});
require.register("tower-element/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var content = require('tower-content');
var proto = require('./lib/proto');
var statics = require('./lib/statics');

/**
 * Expose `element`.
 */

exports = module.exports = element;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Get an `Element`.
 *
 * @param {String} name The element name.
 * @return {Function} The Element class constructor.
 * @api public
 */

function element(name) {
  if (exports.collection[name])
    return exports.collection[name];

  function Element(options) {
    this.name = name;
    // if you pass in a scope, it will be the parent scope.
    if (content.is(options)) options = { parent: options };
    this.content = this.constructor.content.init(options);
  }

  for (var key in statics) Element[key] = statics[key];

  // prototype

  Element.prototype = {};
  Element.prototype.constructor = Element;
  
  for (var key in proto) Element.prototype[key] = proto[key];

  Element.id = name;
  Element.content = content(name);
  // XXX: not sure if this should be done, but it simplifies
  // the api if you want to use the attrs on the element.
  Element.attrs = Element.content.attrs;
  Element.superclasses = [];
  Element.subclasses = [];
  exports.collection[name] = Element;
  exports.collection.push(Element);
  exports.emit('define', Element);
  exports.emit('define ' + name, Element);
  return Element;
}

/**
 * Mixin `Emitter`.
 */

Emitter(element);
Emitter(statics);
Emitter(proto);

/**
 * Add parent class props/fns.
 *
 * @chainable
 * @param {String} name Property/function name.
 * @return {Element} The element class constructor.
 * @api public
 */

statics.inherit = function(name){
  var parent = exports(name);

  if (this.superclasses.hasOwnProperty(name))
    return this;

  this.superclasses[name] = true;
  this.superclasses.push(name);

  if (!parent.subclasses.hasOwnProperty(this.id)) {
    parent.subclasses[this.id] = true;
    parent.subclasses.push(this.id);
  }

  for (var i = 0, n = parent.content.attrs.length; i < n; i++) {
    // XXX: should just have to be like this:
    // this.attr(parent.attrs[i]);
    var attr = parent.content.attrs[i];
    this.attr(attr.name, attr.type, attr);
  }

  return this;
};

/**
 * Remove parent class props/fns.
 *
 * @chainable
 * @param {String} name Property/function name.
 * @return {Element} The element class constructor.
 * @api public
 */

statics.disinherit = function(name){
  var parent = exports(name);

  if (this.superclasses.hasOwnProperty(name)) {
    delete this.superclasses[name];
    this.superclasses.splice(1, this.superclasses.indexOf(name));
  }

  if (parent.subclasses.hasOwnProperty(this.id)) {
    delete parent.subclasses[this.id];
    parent.subclasses.splice(1, parent.subclasses.indexOf(this.id));
  }

  return this;
};

/**
 * Clear everything (for testing).
 *
 * @chainable
 * @return {Function} exports The main `element` function.
 */

exports.clear = function(){
  exports.off();
  return this;
};
});
require.register("tower-element/lib/proto.js", function(exports, require, module){

/**
 * Render template against content.
 *
 * @constructor Element
 * @return {Content} The current element's content.
 */

exports.render = function(){
  this.detach();
  if (this.el)
    this.el = this.constructor.fn(this.content, this.el);
  else
    this.el = this.constructor.fn.clone(this.content);
  return this.el;
};

/**
 * Remove the element.
 *
 * @constructor Element
 * @chainable
 * @return {Element}
 */

exports.remove = function(){
  this.detach();
  this.el = undefined;

  return this;
};

/**
 * Detach the element.
 *
 * @constructor Element
 * @chainable
 * @return {Element}
 */

exports.detach = function(){
  if (this.el && this.el.parentNode) {
    this.el.parentNode.removeChild(this.el);
  }

  return this;
};

/**
 * Get attr. Delegates to `content`.
 *
 * @param {String} name
 */

exports.get = function(name){
  return this.content.get(name);
};

/**
 * Set attr. Delegates to `content`.
 *
 * @param {String} name
 * @param {Mixed} val
 */

exports.set = function(name, val){
  return this.content.set(name, val);
};
});
require.register("tower-element/lib/statics.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var template = require('tower-template');
var domify = require('domify');
var slice = [].slice;

/**
 * Instantiate a new `Element`.
 *
 * @constructor Element
 * @param {Object} Element options.
 * @return {Element} New element instance.
 * @api public
 */

exports.init = function(options){
  return new this(options);
};

/**
 * Add functionality to DSL.
 *
 * @constructor Element
 * @chainable
 * @param {Function} fn Function that is used in the DSL.
 * @return {Function} exports The main `element` function.
 * @api public
 */

exports.use = function(fn){
  fn.call(this, this);
  return this;
};

/**
 * DOM Element or HTML string.
 *
 * @constructor Element
 * @chainable
 * @param {Mixed} html String or DOM node.
 * @return {Function} exports The main `element` function.
 * @api public
 */

exports.template = function(html){
  //this.fn = template(this.id, domify(html));
  this.fn = template('string' === typeof html ? domify(html) : html);
  return this;
};

/**
 * Add attribute to content.
 *
 * @constructor Element
 * @chainable
 * @param {String} name Attribute name.
 * @param {String} type Attribute type.
 * @param {Object} options Attribute options.
 * @return {Function} exports The main `element` function.
 * @api public
 */

exports.attr = function(name, type, options){
  this.content.attr(name, type, options);
  return this;
};

/**
 * Add action to content.
 *
 * @constructor Element
 * @chainable
 * @param {String} name Action name.
 * @param {Function} fn The action function definition.
 * @return {Function} exports The main `element` function.
 * @api public
 */

exports.action = function(name, fn){
  this.content.action(name, fn);
  return this;
};

/**
 * Add helper to content.
 *
 * Helpers are used mainly for dynamically generating values,
 * while actions are used for user actions.
 *
 * @constructor Element
 * @chainable
 * @param {String} name Helper name.
 * @param {Function} fn The helper function definition.
 * @return {Function} exports The main `element` function.
 * @api public
 */

exports.helper = function(name, fn){
  this.content.helper(name, fn);
  return this;
};

/**
 * Define a new DSL method.
 *
 * @constructor Element
 * @chainable
 * @param {String} name DSL method name.
 * @param {Function} fn DSL method function definition.
 * @return {Function} exports The main `element` function.
 * @api public
 */

exports.method = function(name, fn){
  this[name] = function(){
    fn.apply(this, [this].concat(slice.call(arguments)));
    return this;
  };
  return this;
};
});
require.register("tower-collection/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var indexof = require('indexof');
var slice = [].slice;

/**
 * Expose `collection`.
 */

exports = module.exports = collection;

/**
 * Expose `collection` of collections.
 */

exports.collection = {};

/**
 * Expose `Collection`.
 */

exports.Collection = Collection;

/**
 * Instantiate a new `Collection`.
 */

function collection(name, array) {
  if ('string' !== typeof name)
    return new Collection(name);

  if (exports.collection[name] && !array)
    return exports.collection[name];

  return exports.collection[name] = new Collection(array, name);
}

/**
 * Instantiate a new `Collection`.
 */

function Collection(array, name) {
  this.array = array || [];
  this.length = this.array.length;
  if (name) this.name = name;
}

/**
 * Mixin `Emitter`.
 */

Emitter(Collection.prototype);

Collection.prototype.push = function(){
  var startIndex = this.array.length;
  var result = this.apply('push', arguments);
  this.length = this.array.length;
  if (this.hasListeners('add'))
    this.emit('add', this.array.slice(startIndex, this.length), startIndex);
  return result;
};

Collection.prototype.pop = function(){
  var startIndex = this.array.length;
  var result = this.apply('pop', arguments);
  this.length = this.array.length;
  if (this.hasListeners('remove'))
    this.emit('remove', [result], startIndex - 1);
  return result;
};

Collection.prototype.shift = function(){
  var startIndex = this.array.length;
  var result = this.apply('shift', arguments);
  this.length = this.array.length;
  if (this.hasListeners('remove'))
    this.emit('remove', [result], 0);
  return result;
};

Collection.prototype.unshift = function(){
  this.apply('unshift', arguments);
  this.length = this.array.length;
};

// XXX: maybe it emits a `replace` event if 
// it both adds and removes at the same time.
Collection.prototype.splice = function(index, length){
  var startIndex = this.array.length;
  var removed = this.apply('splice', arguments);
  this.length = this.array.length;
  if (removed.length && this.hasListeners('remove')) {
    this.emit('remove', removed, index);
  }
  if (arguments.length > 2 && this.hasListeners('add')) {
    this.emit('add', slice.call(arguments, 2), index);
  }
  return removed;
};

Collection.prototype.remove = function(item){
  this.splice(this.indexOf(item), 1);
};

Collection.prototype.indexOf = function(item){
  return indexof(this.array, item);
};

Collection.prototype.reset = function(array){
  var prev = this.array;
  this.array = array;
  this.emit('reset', array, prev);
};

Collection.prototype.toArray = function(){
  return this.array;
};

/**
 * Subscribe to a query.
 *
 * @param {Query} query
 * @return {Collection} self
 */

Collection.prototype.subscribe = function(query){
  var self = this;
  this.unsubscribe();
  this._query = query;

  function fn(record) {
    switch (query.type) {
      case 'create':
        self.push(record);
        break;
      case 'update':
        break;
      case 'remove':
        self.remove(record);
        break;
    }
  }

  query.__collectionFn__ = fn;
  query.subscribe(fn);
  return this;
};

/**
 * Unsubscribe from current query.
 *
 * @return {Collection} self
 */

Collection.prototype.unsubscribe = function(){
  if (!this._query) return this;

  this._query.unsubscribe(this._query.__collectionFn__);
  delete this._query;
  return this;
};

/**
 * @api private
 */

Collection.prototype.apply = function(method, args){
  return this.array[method].apply(this.array, args);
};
});
require.register("tower-list-directive/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var directive = require('tower-directive');
var content = require('tower-content');
var template = require('tower-template');
var Collection = require('tower-collection').Collection;

/**
 * Expose `data-list` directive.
 */

exports = module.exports = directive('data-list').compiler(compiler).terminal();

exports.document = 'undefined' !== typeof document && document;

/**
 * Alias to `data-each` as well.
 */

directive('data-each').compiler(compiler).terminal();

function compiler(templateEl, attr, nodeFn) {
  // do all this stuff up front
  // XXX: add hoc expression, should use tower-expression.
  var val = attr.value.split(/ +/);
  templateEl.removeAttribute(attr.name);

  if (val.length > 1) {
    // user in users
    var name = val[0];
    var prop = val[2];
    // user in users track by user.username
    // XXX: to-refine
    var trackBy = (val[5] || 'index').split('.').pop();
  } else {
    var prop = val[0];
    var name = 'this';
    var trackBy = 'index';
  }

  var parent = templateEl.parentNode;
  // you have to replace nodes, not remove them, to keep order.
  var comment = exports.document.createComment(' ' + attr.name + ':' + attr.value + ' ');
  templateEl.parentNode.replaceChild(comment, templateEl);
  // XXX: shouldn't have to be doing this, need to figure out.
  nodeFn = template(templateEl);

  /**
   * List directive.
   *
   * 1. compute new items added that are not visible (so, have array of visible items)
   * 2. compute which new items will be visible if inserted
   *    (remove ones that won't be visible)
   * 3. for each new item
   *  - if (buffer.length) pop element from buffer, then apply scope
   *  - else templateFn.clone(scope)
   * 4. insert new item into DOM at correct position.
   *    (so, basically it has a sorted collection, listening for events)
   */

  function list(scope, el, attr) {
    var cursor = el;
    var cache = el.cache || (el.cache = {});

    // e.g. todos
    var array = scope.get(prop);
    var collection;
    if (array instanceof Collection) {
      collection = array;
      array = collection.toArray();
    } // XXX: else if (isObject)

    var getId;
    if ('index' === trackBy) {
      getId = function getId(record, index) {
        return index;
      }
    } else {
      getId = function getId(record, index) {
        // XXX: tower-accessor
        return record.get
          ? record.get(trackBy)
          : record[trackBy];
      }
    }

    // update DOM with [possibly] new array
    change(array);

    // XXX: todo
    if (collection) watch(collection);

    function change(records) {
      for (var i = 0, n = records.length; i < n; i++) {
        // XXX: should allow tracking by custom tracking function
        // (such as by `id`), but for now just by index.
        var id = getId(records[i], i);

        // if it's already been processed, then continue.
        if (cache[id]) continue;

        var attrs = {
          parent: scope,
          index: i,
          first: 0 === i,
          last: (n - 1) === i
        };

        attrs.middle = !(attrs.first || attrs.last);
        attrs.even = 0 === attrs.index % 2;
        attrs.odd = !attrs.even;

        attrs[name] = records[i];
        var childScope = content(name || 'anonymous').init(attrs);
        var childEl = templateEl.cloneNode(true);
        cache[id] = childEl;
        cursor.parentNode.insertBefore(childEl, cursor.nextSibling);
        cursor = childEl;
        nodeFn(childScope, childEl);
      }
    }

    // XXX: tmp hack
    if ('undefined' === typeof $) {
      var remove = function remove(id) {
        if (cache[id]) {
          cache[id].parentNode.removeChild(cache[id]);
          delete cache[id];
        }
      }
    } else {
      var remove = function remove(id) {
        if (cache[id]) {
          $(cache[id]).remove(); 
          delete cache[id];
        }
      }
    }

    function watch(collection) {
      //scope.on('change ' + prop, function(array){
      collection.on('add', function(records){
        change(records);
      });

      collection.on('remove', function(records){
        for (var i = 0, n = records.length; i < n; i++) {
          remove(getId(records[i], i));
        }
      });

      collection.on('reset', function(records){
        for (var id in cache) {
          remove(id);
        }
        change(records);
      }); 
    }
  }

  return list;
}
});
require.register("tower-interpolation-directive/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var directive = require('tower-directive');

/**
 * Expose `directive('interpolation')`.
 */

module.exports = directive('interpolation').compiler(interpolationDirective);

/**
 * Define interpolation directive compiler.
 */

function interpolationDirective(el, attr) {
  var val = el.nodeValue;
  var expressions = {};
  val.replace(/\{\{([^\{\}]+)\}\}/g, function(_, $1){
    // XXX: probably do more here.
    expressions[$1] = true;
  });

  function exec(scope, el, attr) {
    el.nodeValue = val.replace(/\{\{([^\{\}]+)\}\}/g, function(_, $1){
      return scope.get($1);
    });
  }

  return exec;
}
});
require.register("tower-tower/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

exports.resource = require('tower-resource');
exports.query = require('tower-query');
exports.adapter = require('tower-adapter');
exports.router = require('tower-router');
exports.route = require('tower-route');
exports.validator = require('tower-validator');
exports.type = require('tower-type');
exports.memory = require('tower-memory-adapter');

if ('undefined' !== typeof window) {
  exports.directive = require('tower-directive');
  exports.content = require('tower-content');
  exports.template = require('tower-template');

  // basic directives
  require('tower-list-directive');
  require('tower-interpolation-directive');
}

/**
 * Version 0.5.0!
 */

exports.version = '0.5.0';
});
require.register("component-jquery/index.js", function(exports, require, module){
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();

// Expose for component
module.exports = jQuery;

// Expose jQuery to the global object
//window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

});
require.register("tower-website/public/js/index.js", function(exports, require, module){
module.exports = function() {
  $(document).ready(function () {
    function toggleApiModule(event) {
      event.stopPropagation();
      var currLink = $(this).toggleClass('active'),
          moduleLinks = $('li.module a'),
          moduleHeadLinks = $('li.module > h4 > a');
          


      if (currLink.hasClass('mod-link')) {
        currLink.parent()
          .siblings()        
            .toggle();

          moduleHeadLinks.not(currLink)
            .removeClass('active')
          .parent()
            .siblings()
              .hide()

        $('li.module a').not(currLink).removeClass('active');
      } else if (currLink.hasClass('klass-method') || currLink.hasClass('klass-property')) {
        moduleLinks.not(moduleHeadLinks)
          .not(currLink).removeClass('active');
        $(currLink).closest('ul.module-class')
          .find('a.klass').addClass('active');
      } else {
        moduleLinks.not(moduleHeadLinks)
          .not(currLink).removeClass('active');
      }
    }

    var urlParts = document.URL.split('/'),
        page = urlParts[3].split('#')[0];

    $('li.pull-right a[href="' + page + '"]').addClass('active');
    $('.module ul.module-items')
      .slice(1)
      .hide();

    $('.api-page')
      .on('click', '.module a', toggleApiModule);
    $('.module h4 a:first').addClass('active');
  });
}
});
require.alias("tower-tower/index.js", "tower-website/deps/tower/index.js");
require.alias("tower-tower/index.js", "tower-website/deps/tower/index.js");
require.alias("tower-tower/index.js", "tower/index.js");
require.alias("tower-resource/index.js", "tower-tower/deps/tower-resource/index.js");
require.alias("tower-resource/lib/static.js", "tower-tower/deps/tower-resource/lib/static.js");
require.alias("tower-resource/lib/proto.js", "tower-tower/deps/tower-resource/lib/proto.js");
require.alias("tower-resource/index.js", "tower-tower/deps/tower-resource/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-resource/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-resource/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-resource/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-resource/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-resource/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-resource/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-resource/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-resource/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-resource/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-resource/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-resource/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-resource/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-load/index.js", "tower-resource/deps/tower-load/index.js");

require.alias("part-async-series/index.js", "tower-resource/deps/part-async-series/index.js");

require.alias("tower-resource/index.js", "tower-resource/index.js");

require.alias("tower-query/index.js", "tower-tower/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-tower/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-tower/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-tower/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-tower/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-tower/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-adapter/index.js", "tower-tower/deps/tower-adapter/index.js");
require.alias("tower-emitter/index.js", "tower-adapter/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-adapter/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-adapter/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-adapter/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-adapter/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-adapter/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-adapter/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-adapter/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-adapter/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-adapter/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-adapter/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-adapter/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-adapter/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-resource/index.js", "tower-adapter/deps/tower-resource/index.js");
require.alias("tower-resource/lib/static.js", "tower-adapter/deps/tower-resource/lib/static.js");
require.alias("tower-resource/lib/proto.js", "tower-adapter/deps/tower-resource/lib/proto.js");
require.alias("tower-resource/index.js", "tower-adapter/deps/tower-resource/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-resource/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-resource/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-resource/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-resource/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-resource/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-resource/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-resource/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-resource/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-resource/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-resource/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-resource/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-resource/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-load/index.js", "tower-resource/deps/tower-load/index.js");

require.alias("part-async-series/index.js", "tower-resource/deps/part-async-series/index.js");

require.alias("tower-resource/index.js", "tower-resource/index.js");

require.alias("tower-type/index.js", "tower-adapter/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-adapter/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("tower-load/index.js", "tower-adapter/deps/tower-load/index.js");

require.alias("tower-client-router/index.js", "tower-tower/deps/tower-router/index.js");
require.alias("tower-route/index.js", "tower-client-router/deps/tower-route/index.js");
require.alias("component-path-to-regexp/index.js", "tower-route/deps/path-to-regexp/index.js");

require.alias("tower-emitter/index.js", "tower-route/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-route/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-route/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-route/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("part-async-series/index.js", "tower-route/deps/part-async-series/index.js");

require.alias("part-async-series/index.js", "tower-client-router/deps/part-async-series/index.js");

require.alias("tower-route/index.js", "tower-tower/deps/tower-route/index.js");
require.alias("component-path-to-regexp/index.js", "tower-route/deps/path-to-regexp/index.js");

require.alias("tower-emitter/index.js", "tower-route/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-route/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-route/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-route/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("part-async-series/index.js", "tower-route/deps/part-async-series/index.js");

require.alias("tower-validator/index.js", "tower-tower/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-tower/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-tower/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-tower/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-tower/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-tower/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-tower/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-param/index.js", "tower-tower/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-tower/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-content/index.js", "tower-tower/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-tower/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-tower/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-tower/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-template/index.js", "tower-tower/deps/tower-template/index.js");
require.alias("tower-directive/index.js", "tower-template/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-template/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-memory-adapter/index.js", "tower-tower/deps/tower-memory-adapter/index.js");
require.alias("tower-adapter/index.js", "tower-memory-adapter/deps/tower-adapter/index.js");
require.alias("tower-emitter/index.js", "tower-adapter/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-adapter/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-adapter/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-adapter/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-adapter/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-adapter/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-adapter/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-adapter/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-adapter/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-adapter/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-adapter/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-adapter/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-adapter/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-resource/index.js", "tower-adapter/deps/tower-resource/index.js");
require.alias("tower-resource/lib/static.js", "tower-adapter/deps/tower-resource/lib/static.js");
require.alias("tower-resource/lib/proto.js", "tower-adapter/deps/tower-resource/lib/proto.js");
require.alias("tower-resource/index.js", "tower-adapter/deps/tower-resource/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-resource/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-resource/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-resource/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-resource/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-resource/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-resource/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-resource/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-resource/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-resource/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-resource/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-resource/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-resource/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-load/index.js", "tower-resource/deps/tower-load/index.js");

require.alias("part-async-series/index.js", "tower-resource/deps/part-async-series/index.js");

require.alias("tower-resource/index.js", "tower-resource/index.js");

require.alias("tower-type/index.js", "tower-adapter/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-adapter/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("tower-load/index.js", "tower-adapter/deps/tower-load/index.js");

require.alias("tower-resource/index.js", "tower-memory-adapter/deps/tower-resource/index.js");
require.alias("tower-resource/lib/static.js", "tower-memory-adapter/deps/tower-resource/lib/static.js");
require.alias("tower-resource/lib/proto.js", "tower-memory-adapter/deps/tower-resource/lib/proto.js");
require.alias("tower-resource/index.js", "tower-memory-adapter/deps/tower-resource/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-resource/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-resource/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-resource/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-resource/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-resource/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-resource/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-resource/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-resource/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-resource/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-resource/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-resource/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-resource/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-resource/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-resource/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-resource/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-resource/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-load/index.js", "tower-resource/deps/tower-load/index.js");

require.alias("part-async-series/index.js", "tower-resource/deps/part-async-series/index.js");

require.alias("tower-resource/index.js", "tower-resource/index.js");

require.alias("tower-stream/index.js", "tower-memory-adapter/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-memory-adapter/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-memory-adapter/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-memory-adapter/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-memory-adapter/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("tower-query/index.js", "tower-memory-adapter/deps/tower-query/index.js");
require.alias("tower-query/lib/constraint.js", "tower-memory-adapter/deps/tower-query/lib/constraint.js");
require.alias("tower-query/lib/validate.js", "tower-memory-adapter/deps/tower-query/lib/validate.js");
require.alias("tower-query/lib/validate-constraints.js", "tower-memory-adapter/deps/tower-query/lib/validate-constraints.js");
require.alias("tower-query/lib/filter.js", "tower-memory-adapter/deps/tower-query/lib/filter.js");
require.alias("tower-query/lib/subscriber.js", "tower-memory-adapter/deps/tower-query/lib/subscriber.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-query/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-query/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-program/index.js", "tower-query/deps/tower-program/index.js");
require.alias("tower-program/lib/proto.js", "tower-query/deps/tower-program/lib/proto.js");
require.alias("tower-program/lib/statics.js", "tower-query/deps/tower-program/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-program/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-stream/lib/static.js", "tower-program/deps/tower-stream/lib/static.js");
require.alias("tower-stream/lib/proto.js", "tower-program/deps/tower-stream/lib/proto.js");
require.alias("tower-stream/lib/api.js", "tower-program/deps/tower-stream/lib/api.js");
require.alias("tower-stream/index.js", "tower-program/deps/tower-stream/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-stream/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-param/index.js", "tower-stream/deps/tower-param/index.js");
require.alias("tower-param/lib/validators.js", "tower-stream/deps/tower-param/lib/validators.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-param/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-param/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-param/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-type/index.js", "tower-param/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-param/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("part-is-array/index.js", "tower-param/deps/part-is-array/index.js");

require.alias("tower-attr/index.js", "tower-stream/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-stream/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("tower-load/index.js", "tower-stream/deps/tower-load/index.js");

require.alias("tower-stream/index.js", "tower-stream/index.js");

require.alias("part-each-array/index.js", "tower-query/deps/part-each-array/index.js");

require.alias("part-is-array/index.js", "tower-query/deps/part-is-array/index.js");

require.alias("tower-uuid/index.js", "tower-memory-adapter/deps/tower-uuid/index.js");

require.alias("tower-directive/index.js", "tower-tower/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-tower/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-load/index.js", "tower-tower/deps/tower-load/index.js");

require.alias("tower-emitter/index.js", "tower-tower/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-tower/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-operator/index.js", "tower-tower/deps/tower-operator/index.js");

require.alias("tower-expression/index.js", "tower-tower/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("tower-element/index.js", "tower-tower/deps/tower-element/index.js");
require.alias("tower-element/lib/proto.js", "tower-tower/deps/tower-element/lib/proto.js");
require.alias("tower-element/lib/statics.js", "tower-tower/deps/tower-element/lib/statics.js");
require.alias("tower-emitter/index.js", "tower-element/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-element/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-template/index.js", "tower-element/deps/tower-template/index.js");
require.alias("tower-directive/index.js", "tower-template/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-template/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-directive/index.js", "tower-element/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-element/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-content/index.js", "tower-element/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-element/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-element/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-element/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-domify/index.js", "tower-element/deps/domify/index.js");

require.alias("tower-list-directive/index.js", "tower-tower/deps/tower-list-directive/index.js");
require.alias("tower-directive/index.js", "tower-list-directive/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-list-directive/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-content/index.js", "tower-list-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-list-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-list-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-list-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-template/index.js", "tower-list-directive/deps/tower-template/index.js");
require.alias("tower-directive/index.js", "tower-template/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-template/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-collection/index.js", "tower-list-directive/deps/tower-collection/index.js");
require.alias("tower-emitter/index.js", "tower-collection/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-collection/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("part-is-array/index.js", "tower-collection/deps/part-is-array/index.js");

require.alias("component-indexof/index.js", "tower-collection/deps/indexof/index.js");

require.alias("tower-interpolation-directive/index.js", "tower-tower/deps/tower-interpolation-directive/index.js");
require.alias("tower-directive/index.js", "tower-interpolation-directive/deps/tower-directive/index.js");
require.alias("tower-directive/lib/directives.js", "tower-interpolation-directive/deps/tower-directive/lib/directives.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-directive/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-directive/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-directive/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-directive/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("tower-expression/index.js", "tower-directive/deps/tower-expression/index.js");
require.alias("tower-operator/index.js", "tower-expression/deps/tower-operator/index.js");

require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-content/lib/proto.js", "tower-expression/deps/tower-content/lib/proto.js");
require.alias("tower-content/lib/statics.js", "tower-expression/deps/tower-content/lib/statics.js");
require.alias("tower-content/index.js", "tower-expression/deps/tower-content/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-content/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-attr/index.js", "tower-content/deps/tower-attr/index.js");
require.alias("tower-attr/lib/validators.js", "tower-content/deps/tower-attr/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-attr/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-attr/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-attr/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-attr/deps/tower-text/index.js");
require.alias("tower-text/index.js", "tower-text/index.js");

require.alias("tower-type/index.js", "tower-attr/deps/tower-type/index.js");
require.alias("tower-type/lib/types.js", "tower-attr/deps/tower-type/lib/types.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-type/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("tower-validator/lib/validators.js", "tower-type/deps/tower-validator/lib/validators.js");
require.alias("tower-validator/index.js", "tower-type/deps/tower-validator/index.js");
require.alias("component-indexof/index.js", "tower-validator/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("tower-emitter/index.js", "tower-validator/deps/tower-emitter/index.js");
require.alias("component-indexof/index.js", "tower-emitter/deps/indexof/index.js");

require.alias("tower-emitter/index.js", "tower-emitter/index.js");

require.alias("tower-validator/index.js", "tower-validator/index.js");

require.alias("part-is-array/index.js", "tower-type/deps/part-is-array/index.js");

require.alias("component-type/index.js", "tower-attr/deps/type/index.js");

require.alias("component-indexof/index.js", "tower-content/deps/indexof/index.js");

require.alias("tower-content/index.js", "tower-content/index.js");

require.alias("component-escape-regexp/index.js", "tower-expression/deps/escape-regexp/index.js");

require.alias("component-event/index.js", "tower-directive/deps/event/index.js");

require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-value/index.js", "tower-directive/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("tower-tower/index.js", "tower-tower/index.js");

require.alias("component-jquery/index.js", "tower-website/deps/jquery/index.js");
require.alias("component-jquery/index.js", "jquery/index.js");

require.alias("tower-website/public/js/index.js", "tower-website/index.js");

