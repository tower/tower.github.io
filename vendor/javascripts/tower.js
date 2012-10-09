/*!
 * Tower.js v0.4.2-19
 * http://viatropos.github.com/tower
 *
 * Copyright 2012, Lance Pollard
 * MIT License.
 * http://towerjs.org/license
 *
 * Date: 2012-10-09
 */
(function() {
  var Tower, action, coffeecupTags, coffeescriptMixin, key, module, nativeIndexOf, phase, specialProperties, towerMixin, _, _fn, _fn1, _fn2, _fn3, _fn4, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __defineProperty = function(clazz, key, value) {
  if (typeof clazz.__defineProperty == 'function') return clazz.__defineProperty(key, value);
  return clazz.prototype[key] = value;
},
    __defineStaticProperty = function(clazz, key, value) {
  if (typeof clazz.__defineStaticProperty == 'function') return clazz.__defineStaticProperty(key, value);
  return clazz[key] = value;
},
    __hasProp = {}.hasOwnProperty,
    __extends =   function(child, parent) {
    if (typeof parent.__extend == 'function') return parent.__extend(child);
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } 
    function ctor() { this.constructor = child; } 
    ctor.prototype = parent.prototype; 
    child.prototype = new ctor; 
    child.__super__ = parent.prototype; 
    if (typeof parent.extended == 'function') parent.extended(child); 
    return child; 
},
    _this = this;

  window.global || (window.global = window);

  module = global.module || {};

  global.Tower = Tower = Ember.Namespace.create();

  _ = Tower._ = global._;

  Tower.version = "0.4.2-19";

  Tower.logger = console;

  _.mixin(_.string.exports());

  Tower._modules = {
    validator: function() {
      return global;
    },
    accounting: function() {
      return global.accounting;
    },
    moment: function() {
      return global.moment;
    },
    geo: function() {
      return global.geolib;
    },
    inflector: function() {
      return global.inflector;
    },
    async: function() {
      return global.async;
    },
    coffeecup: function() {
      if (global.CoffeeCup) {
        return global.CoffeeCup;
      } else {
        return global.CoffeeKup;
      }
    },
    socketio: function() {
      try {
        return global.io;
      } catch (_error) {}
    },
    sockjs: function() {
      try {
        return global.SockJS;
      } catch (_error) {}
    },
    _: function() {
      return _;
    }
  };

  nativeIndexOf = Array.prototype.indexOf;

  _ = Tower._;

  _.mixin({
    toStringIndexOf: function(array, item, isSorted) {
      var i, l;
      if (array == null) {
        return -1;
      }
      i = 0;
      l = array.length;
      while (i < l) {
        if (i in array && array[i] && item && array[i].toString() === item.toString()) {
          return i;
        }
        i++;
      }
      return -1;
    },
    equals: function(a, b) {
      if (a && typeof a.equals === 'function') {
        return a.equals(b);
      } else {
        return _.isEqual(a, b);
      }
    },
    extractOptions: function(args) {
      if (typeof args[args.length - 1] === "object") {
        return args.pop();
      } else {
        return {};
      }
    },
    extractBlock: function(args) {
      if (typeof args[args.length - 1] === "function") {
        return args.pop();
      } else {
        return null;
      }
    },
    args: function(args, index, withCallback, withOptions) {
      if (index == null) {
        index = 0;
      }
      if (withCallback == null) {
        withCallback = false;
      }
      if (withOptions == null) {
        withOptions = false;
      }
      args = Array.prototype.slice.call(args, index, args.length);
      if (withCallback && !(args.length >= 2 && typeof args[args.length - 1] === "function")) {
        throw new Error("You must pass a callback to the render method");
      }
      return args;
    },
    sortBy: function(objects) {
      var arrayComparator, callbacks, sortings, valueComparator;
      sortings = this.args(arguments, 1);
      callbacks = sortings[sortings.length - 1] instanceof Array ? {} : sortings.pop();
      valueComparator = function(x, y) {
        if (x > y) {
          return 1;
        } else {
          if (x < y) {
            return -1;
          } else {
            return 0;
          }
        }
      };
      arrayComparator = function(a, b) {
        var x, y;
        x = [];
        y = [];
        sortings.forEach(function(sorting) {
          var aValue, attribute, bValue, direction;
          attribute = sorting[0];
          direction = sorting[1];
          aValue = a.get(attribute);
          bValue = b.get(attribute);
          if (typeof callbacks[attribute] !== "undefined") {
            aValue = callbacks[attribute](aValue);
            bValue = callbacks[attribute](bValue);
          }
          x.push(direction * valueComparator(aValue, bValue));
          return y.push(direction * valueComparator(bValue, aValue));
        });
        if (x < y) {
          return -1;
        } else {
          return 1;
        }
      };
      sortings = sortings.map(function(sorting) {
        if (!_.isArray(sorting)) {
          sorting = [sorting, "asc"];
        }
        if (sorting[1].toLowerCase() === "desc") {
          sorting[1] = -1;
        } else {
          sorting[1] = 1;
        }
        return sorting;
      });
      return objects.sort(function(a, b) {
        return arrayComparator(a, b);
      });
    }
  });

  specialProperties = ['included', 'extended', 'prototype', 'ClassMethods', 'InstanceMethods'];

  _ = Tower._;

  _.mixin({
    getCacheKey: function(key) {
      if (key.hasOwnProperty('cacheKey')) {
        return Ember.get(key, 'cacheKey');
      } else if (_.isArray(key)) {
        return _.toPath(_.map(key, function(i) {
          return _.getCacheKey(i);
        }));
      } else {
        return _.toPath(key);
      }
    },
    toPath: function(object) {
      if (_.isArray(object)) {
        return object.join('/');
      } else {
        return object.toString();
      }
    },
    modules: function(object) {
      var args, key, node, value, _i, _len;
      args = _.args(arguments, 1);
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        node = args[_i];
        for (key in node) {
          value = node[key];
          if (__indexOf.call(specialProperties, key) < 0) {
            object[key] = value;
          }
        }
      }
      return object;
    },
    cloneHash: function(options) {
      var key, result, value;
      result = {};
      for (key in options) {
        value = options[key];
        if (_.isArray(value)) {
          result[key] = this.cloneArray(value);
        } else if (this.isHash(value)) {
          result[key] = this.cloneHash(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    },
    cloneArray: function(value) {
      var i, item, result, _i, _len;
      result = value.concat();
      for (i = _i = 0, _len = result.length; _i < _len; i = ++_i) {
        item = result[i];
        if (_.isArray(item)) {
          result[i] = this.cloneArray(item);
        } else if (this.isHash(item)) {
          result[i] = this.cloneHash(item);
        }
      }
      return result;
    },
    deepMerge: function(object) {
      var args, key, node, value, _i, _len;
      args = _.args(arguments, 1);
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        node = args[_i];
        for (key in node) {
          value = node[key];
          if (__indexOf.call(specialProperties, key) < 0) {
            if (object[key] && _.isHash(value)) {
              object[key] = _.deepMerge(object[key], value);
            } else {
              object[key] = value;
            }
          }
        }
      }
      return object;
    },
    deepMergeWithArrays: function(object) {
      var args, key, node, oldValue, value, _i, _len;
      args = _.args(arguments, 1);
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        node = args[_i];
        for (key in node) {
          value = node[key];
          if (!(__indexOf.call(specialProperties, key) < 0)) {
            continue;
          }
          oldValue = object[key];
          if (oldValue) {
            if (_.isArray(oldValue)) {
              object[key] = oldValue.concat(value);
            } else if (typeof oldValue === "object" && typeof value === "object") {
              object[key] = _.deepMergeWithArrays(object[key], value);
            } else {
              object[key] = value;
            }
          } else {
            object[key] = value;
          }
        }
      }
      return object;
    },
    defineProperty: function(object, key, options) {
      if (options == null) {
        options = {};
      }
      if (Object.defineProperty) {
        return Object.defineProperty(object, key, options);
      }
    },
    functionName: function(fn) {
      var _ref;
      if (fn.__name__) {
        return fn.__name__;
      }
      if (fn.name) {
        return fn.name;
      }
      return (_ref = fn.toString().match(/\W*function\s+([\w\$]+)\(/)) != null ? _ref[1] : void 0;
    },
    castArray: function(object) {
      if (_.isArray(object)) {
        return object;
      } else if (object != null) {
        return [object];
      } else {
        return [];
      }
    },
    copy: function(object) {
      if (_.isArray(object)) {
        return object.concat();
      } else if (_.isHash(object)) {
        return _.extend({}, object);
      } else {
        return Object.create(object);
      }
    },
    copyArray: function(object) {
      if (object) {
        return object.concat();
      } else {
        return [];
      }
    },
    copyObject: function(object) {
      if (object) {
        return _.clone(object);
      } else {
        return {};
      }
    },
    isA: function(object, isa) {},
    isHash: function(object) {
      return object && object.constructor === Object;
    },
    timesAsync: function(n, complete, iterator) {
      var i, test;
      i = 0;
      test = function() {
        return i++ <= n;
      };
      return Tower.module('async').whilst(test, iterator, complete);
    },
    kind: function(object) {
      var type;
      type = typeof object;
      switch (type) {
        case 'object':
          if (_.isArray(object)) {
            return 'array';
          }
          if (_.isArguments(object)) {
            return 'arguments';
          }
          if (_.isBoolean(object)) {
            return 'boolean';
          }
          if (_.isDate(object)) {
            return 'date';
          }
          if (_.isRegExp(object)) {
            return 'regex';
          }
          if (_.isNaN(object)) {
            return 'NaN';
          }
          if (_.isNull(object)) {
            return 'null';
          }
          if (_.isUndefined(object)) {
            return 'undefined';
          }
          return 'object';
        case 'number':
          if (object === +object && object === (object | 0)) {
            return 'integer';
          }
          if (object === +object && object !== (object | 0)) {
            return 'float';
          }
          if (_.isNaN(object)) {
            return 'NaN';
          }
          return 'number';
        case 'function':
          if (_.isRegExp(object)) {
            return 'regex';
          }
          return 'function';
        default:
          return type;
      }
    },
    isObject: function(object) {
      return object === Object(object);
    },
    isPresent: function(object) {
      return !_.isBlank(object);
    },
    isBlank: function(object) {
      var key, value;
      switch (_.kind(object)) {
        case "object":
          for (key in object) {
            value = object[key];
            return false;
          }
          return true;
        case "string":
          return object === "";
        case "array":
          return object.length === 0;
        case "null":
        case "undefined":
          return true;
        default:
          return false;
      }
    },
    none: function(value) {
      return value === null || value === void 0;
    },
    has: function(object, key) {
      return object.hasOwnProperty(key);
    },
    oneOrMany: function() {
      var args, binding, key, method, value, _key, _results;
      binding = arguments[0], method = arguments[1], key = arguments[2], value = arguments[3], args = 5 <= arguments.length ? __slice.call(arguments, 4) : [];
      if (typeof key === "object") {
        _results = [];
        for (_key in key) {
          value = key[_key];
          _results.push(method.call.apply(method, [binding, _key, value].concat(__slice.call(args))));
        }
        return _results;
      } else {
        return method.call.apply(method, [binding, key, value].concat(__slice.call(args)));
      }
    },
    error: function(error, callback) {
      if (error) {
        if (callback) {
          return callback(error);
        } else {
          throw error;
        }
      }
    },
    "return": function(binding, callback, error) {
      if (callback) {
        callback.apply(binding, _.args(arguments, 2));
      }
      return !error;
    },
    teardown: function() {
      var object, variable, variables, _i, _len;
      object = arguments[0], variables = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      variables = _.flatten(variables);
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        object[variable] = null;
        delete object[variable];
      }
      return object;
    },
    copyProperties: function(to, from) {
      var properties, property, _i, _len;
      properties = _.args(arguments, 2);
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        if (from[property] !== void 0) {
          to[property] = from[property];
        }
      }
      return to;
    },
    moveProperties: function(to, from) {
      var properties, property, _i, _len;
      properties = _.args(arguments, 2);
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        if (from[property] !== void 0) {
          to[property] = from[property];
        }
        delete from[property];
      }
      return to;
    },
    isEmptyObject: function(object) {
      var name;
      for (name in object) {
        if (object.hasOwnProperty(name)) {
          return false;
        }
      }
      return true;
    },
    hasDefinedProperties: function(object) {
      var name;
      for (name in object) {
        if (object.hasOwnProperty(name) && object[name]) {
          return true;
        }
      }
      return false;
    },
    getNestedAttribute: function(object, key) {
      var part, parts, _i, _len;
      parts = key.split('.');
      if (parts.length === 1) {
        return Ember.get(object, key);
      }
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        part = parts[_i];
        object = Ember.get(object, part);
        if (!object) {
          break;
        }
      }
      return object;
    },
    assertValidKeys: function(options, keys) {
      var key;
      for (key in options) {
        if (!_.include(keys, key)) {
          throw new Error("" + key + " is not a valid key");
        }
      }
      return true;
    },
    except: function(object) {
      var result;
      result = _.clone(object);
      _.each(_.flatten(_.args(arguments, 1)), function(key) {
        return delete result[key];
      });
      return result;
    },
    only: function() {
      return _.pick.apply(_, arguments);
    },
    clean: function(object) {
      var key, value;
      for (key in object) {
        value = object[key];
        if (object.hasOwnProperty(key)) {
          delete object[key];
        }
      }
      return object;
    }
  });

  Tower._.mixin({
    regexpEscape: function(string) {
      return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    regexpUnion: function() {}
  });

  _ = Tower._;

  _.camelize_rx = /(?:^|_|\-|\/)(.)/g;

  _.capitalize_rx = /(^|\s)([a-z])/g;

  _.underscore_rx1 = /([A-Z]+)([A-Z][a-z])/g;

  _.underscore_rx2 = /([a-z\d])([A-Z])/g;

  _.mixin({
    constantize: function(string, scope) {
      if (scope == null) {
        scope = global;
      }
      return scope[_.camelize(string)];
    },
    camelize: function(string, firstLetterLower) {
      string = string.replace(_.camelize_rx, function(str, p1) {
        return p1.toUpperCase();
      });
      if (firstLetterLower) {
        return string.substr(0, 1).toLowerCase() + string.substr(1);
      } else {
        return string;
      }
    },
    underscore: function(string) {
      return string.replace(_.underscore_rx1, '$1_$2').replace(_.underscore_rx2, '$1_$2').replace('-', '_').toLowerCase();
    },
    singularize: function(string) {
      var _ref;
      return (_ref = Tower.module('inflector')).singularize.apply(_ref, arguments);
    },
    repeat: function(string, number) {
      return new Array(number + 1).join(string);
    },
    pluralize: function(count, string) {
      if (string) {
        if (count === 1) {
          return string;
        }
      } else {
        string = count;
      }
      return Tower.module('inflector').pluralize(string);
    },
    capitalize: function(string) {
      return string.replace(_.capitalize_rx, function(m, p1, p2) {
        return p1 + p2.toUpperCase();
      });
    },
    trim: function(string) {
      if (string) {
        return string.trim();
      } else {
        return "";
      }
    },
    interpolate: function(stringOrObject, keys) {
      var key, string, value;
      if (typeof stringOrObject === 'object') {
        string = stringOrObject[keys.count];
        if (!string) {
          string = stringOrObject['other'];
        }
      } else {
        string = stringOrObject;
      }
      for (key in keys) {
        value = keys[key];
        string = string.replace(new RegExp("%\\{" + key + "\\}", "g"), value);
      }
      return string;
    },
    grep: function(object, regex, iterator, context) {
      var found;
      regex = _.isRegExp(regex) ? regex : RegExp(String(regex).replace(/([{.(|}:)$+?=^*!\/[\]\\])/g, "\\$1"));
      found = _.select(object, function(s) {
        return regex.test(s);
      }, context);
      if (iterator) {
        return _.map(found, iterator, context);
      }
      return found;
    },
    parameterize: function(string) {
      return _.underscore(string).replace(/\.([^\.])/, function(__, $1) {
        return $1;
      }).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, '');
    },
    toStateName: function(string) {
      return "is" + (_.camelize(string)) + "Active";
    },
    uuid: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    },
    stringify: function(object, pretty) {
      if (pretty == null) {
        pretty = true;
      }
      if (pretty) {
        return JSON.stringify(object, null, 2);
      } else {
        return JSON.stringify(object);
      }
    }
  });

  Tower._.mixin({
    isInt: function(n) {
      return n === +n && n === (n | 0);
    },
    toInt: function(object) {
      switch (_.kind(object)) {
        case 'date':
          return object.getTime();
        default:
          return parseInt(object);
      }
    },
    isFloat: function(n) {
      return n === +n && n !== (n | 0);
    },
    randomSortOrder: function() {
      return Math.round(Math.random()) - 0.5;
    },
    randomIntBetween: function(min, max) {
      return min + Math.floor(Math.random() * ((max - min) + 1));
    }
  });

  Tower.SupportGeo = {};

  try {
    _.string.isBlank = Tower.SupportObject;
  } catch (_error) {}

  _ = Tower._;

  Tower.SupportCallbacks = {
    ClassMethods: {
      before: function() {
        return this.appendCallback.apply(this, ['before'].concat(__slice.call(arguments)));
      },
      after: function() {
        return this.appendCallback.apply(this, ['after'].concat(__slice.call(arguments)));
      },
      callback: function() {
        var args;
        args = _.args(arguments);
        if (!args[0].match(/^(?:before|around|after)$/)) {
          args = ['after'].concat(args);
        }
        return this.appendCallback.apply(this, args);
      },
      removeCallback: function(action, phase, run) {
        return this;
      },
      appendCallback: function(phase) {
        var args, callback, callbacks, filter, method, options, _i, _len;
        args = _.args(arguments, 1);
        if (typeof args[args.length - 1] !== 'object') {
          method = args.pop();
        }
        if (typeof args[args.length - 1] === 'object') {
          options = args.pop();
        }
        method || (method = args.pop());
        options || (options = {});
        callbacks = this.callbacks();
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          filter = args[_i];
          callback = callbacks[filter] || (callbacks[filter] = new Tower.SupportCallbacksChain);
          callback.push(phase, method, options);
        }
        return this;
      },
      prependCallback: function(action, phase, run, options) {
        if (options == null) {
          options = {};
        }
        return this;
      },
      callbacks: function() {
        return this._callbacks || (this._callbacks = {});
      }
    },
    runCallbacks: function(kind, options, block, complete) {
      var chain;
      if (typeof options === 'function') {
        complete = block;
        block = options;
        options = {};
      }
      options || (options = {});
      chain = this.constructor.callbacks()[kind];
      if (chain) {
        return chain.run(this, options, block, complete);
      } else {
        if (block) {
          block.call(this);
        }
        if (complete) {
          return complete.call(this);
        }
      }
    },
    _callback: function() {
      return Tower.callbackChain.apply(Tower, arguments);
    }
  };

  Tower.SupportCallbacksChain = (function() {

    function SupportCallbacksChain(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
      this.before || (this.before = []);
      this.after || (this.after = []);
    }

    __defineProperty(SupportCallbacksChain,  "clone", function() {
      return new Tower.SupportCallbacksChain({
        before: this.before.concat(),
        after: this.after.concat()
      });
    });

    __defineProperty(SupportCallbacksChain,  "run", function(binding, options, block, complete) {
      var done, runner,
        _this = this;
      runner = function(callback, next) {
        return callback.run(binding, options, next);
      };
      done = function(error) {
        if (error) {
          if (!(error instanceof Error)) {
            error = new Error(error);
          }
          if (complete) {
            complete.call(binding, error);
          } else {
            if (!Tower.SupportCallbacks.silent) {
              throw error;
            }
          }
        } else {
          if (complete) {
            complete.call(binding);
          }
        }
        return binding;
      };
      return Tower.async(this.before, runner, function(error) {
        if (error) {
          return done(error);
        }
        if (block) {
          switch (block.length) {
            case 0:
              block.call(binding);
              return Tower.async(_this.after, runner, done);
            default:
              return block.call(binding, function(error) {
                if (error) {
                  return done(error);
                }
                if (!error) {
                  return Tower.async(_this.after, runner, done);
                }
              });
          }
        } else {
          return Tower.async(_this.after, runner, done);
        }
      });
    });

    __defineProperty(SupportCallbacksChain,  "push", function(phase, method, filters, options) {
      return this[phase].push(new Tower.SupportCallback(method, filters, options));
    });

    return SupportCallbacksChain;

  })();

  Tower.SupportCallback = (function() {

    function SupportCallback(method, conditions) {
      if (conditions == null) {
        conditions = {};
      }
      this.method = method;
      this.conditions = conditions;
      if (conditions.hasOwnProperty('only')) {
        conditions.only = _.castArray(conditions.only);
      }
      if (conditions.hasOwnProperty('except')) {
        conditions.except = _.castArray(conditions.except);
      }
    }

    __defineProperty(SupportCallback,  "run", function(binding, options, next) {
      var conditions, method, result;
      conditions = this.conditions;
      if (options && options.hasOwnProperty('name')) {
        if (conditions.hasOwnProperty('only')) {
          if (_.indexOf(conditions.only, options.name) === -1) {
            return next();
          }
        } else if (conditions.hasOwnProperty('except')) {
          if (_.indexOf(conditions.except, options.name) !== -1) {
            return next();
          }
        }
      }
      method = this.method;
      if (typeof method === 'string') {
        if (!binding[method]) {
          throw new Error("The method `" + method + "` doesn't exist");
        }
        method = binding[method];
      }
      switch (method.length) {
        case 0:
          result = method.call(binding);
          return next(result === false ? new Error('Callback did not pass') : null);
        default:
          return method.call(binding, next);
      }
    });

    return SupportCallback;

  })();

  _ = Tower._;

  _.extend(Tower, {
    nativeExtensions: true,
    env: "development",
    port: 3000,
    client: typeof window !== "undefined",
    isClient: typeof window !== "undefined",
    isServer: typeof window === "undefined",
    root: "/",
    publicPath: "/",
    "case": "camelcase",
    accessors: typeof window === "undefined",
    logger: typeof global['_console'] !== 'undefined' ? _console : console,
    structure: "standard",
    config: {},
    namespaces: {},
    metadata: {},
    tryRequire: function(paths) {
      var path, _i, _len;
      paths = _.flatten(paths);
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        try {
          return require(path);
        } catch (error) {
          this;

        }
      }
    },
    subscribe: function() {
      var _ref;
      return (_ref = Tower.Application.instance()).subscribe.apply(_ref, arguments);
    },
    cb: function() {},
    notifyConnections: function(action, records, callback) {
      var connection, sessionId, _ref, _results;
      _ref = Tower.connections;
      _results = [];
      for (sessionId in _ref) {
        connection = _ref[sessionId];
        _results.push(connection.notify(action, records, callback));
      }
      return _results;
    },
    connections: {},
    createConnection: function(socket) {
      var connection;
      connection = Tower.NetConnection.create().setProperties({
        socket: socket
      });
      return this.connections[connection.toString()] = connection;
    },
    toMixin: function() {
      return {
        include: function() {
          return Tower.include.apply(Tower, [this].concat(__slice.call(arguments)));
        },
        className: function() {
          return Tower._.functionName(this);
        },
        build: function(attributes) {
          var object;
          object = this.create();
          if (attributes) {
            object.setProperties(attributes);
          }
          return object;
        },
        computed: function(key, block) {
          var object;
          object = {};
          object[key] = Ember.computed(block);
          return this.reopen(object);
        },
        get: function(key) {
          return Ember.get(this, key);
        },
        set: function(key, value) {
          return Ember.set(this, key, value);
        }
      };
    },
    cursors: {},
    addCursor: function(cursor) {
      var cursors, fieldName, fieldNames, type, types, _i, _j, _len, _len1;
      types = Ember.get(cursor, 'observableTypes');
      Tower.cursors[Ember.guidFor(cursor)] = cursor;
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        cursors = Tower.cursors[type];
        if (!cursors) {
          cursors = Tower.cursors[type] = {};
        }
        fieldNames = Ember.get(cursor, 'observableFields');
        for (_j = 0, _len1 = fieldNames.length; _j < _len1; _j++) {
          fieldName = fieldNames[_j];
          cursors[fieldName] = cursor;
        }
      }
      return cursor;
    },
    removeCursor: function(cursor) {
      var cursors, fieldName, fieldNames, type, types, _i, _j, _len, _len1;
      types = Ember.get(cursor, 'observableTypes');
      delete Tower.cursors[Ember.guidFor(cursor)];
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        cursors = Tower.cursors[type];
        if (cursors) {
          fieldNames = Ember.get(cursor, 'observableFields');
          for (_j = 0, _len1 = fieldNames.length; _j < _len1; _j++) {
            fieldName = fieldNames[_j];
            delete cursors[fieldName];
          }
        }
      }
      return cursor;
    },
    getCursor: function(path) {
      return Ember.get(Tower.cursors, path);
    },
    notifyCursorFromPath: function(path) {
      var cursor;
      cursor = Tower.getCursor(path);
      if (cursor) {
        cursor.refresh();
      }
      delete Tower.cursorsToUpdate[path];
      return cursor;
    },
    autoNotifyCursors: true,
    cursorsToUpdate: {},
    cursorNotification: function(path) {
      Tower.cursorsToUpdate[path] = true;
      if (Tower.autoNotifyCursors) {
        return Ember.run.schedule('sync', this, this.notifyCursors);
      }
    },
    notifyCursors: function(force) {
      var cursor, cursors, guid, path, paths, _results;
      cursors = {};
      paths = _.keys(force ? Tower.cursors : Tower.cursorsToUpdate);
      for (path in paths) {
        cursor = Tower.getCursor(path);
        if (cursor) {
          cursors[Ember.guidFor(cursor)] = cursor;
        }
      }
      Tower.cursorsToUpdate = {};
      _results = [];
      for (guid in cursors) {
        cursor = cursors[guid];
        _results.push(cursor.refresh());
      }
      return _results;
    },
    include: function(self, object) {
      var ClassMethods, InstanceMethods, included;
      included = object.included;
      ClassMethods = object.ClassMethods;
      InstanceMethods = object.InstanceMethods;
      delete object.included;
      delete object.ClassMethods;
      delete object.InstanceMethods;
      if (ClassMethods) {
        self.reopenClass(ClassMethods);
      }
      if (InstanceMethods) {
        self.include(InstanceMethods);
      }
      self.reopen(object);
      object.InstanceMethods = InstanceMethods;
      object.ClassMethods = ClassMethods;
      if (included) {
        included.apply(self);
      }
      return object;
    },
    metadataFor: function(name) {
      var _base;
      return (_base = this.metadata)[name] || (_base[name] = {});
    },
    callback: function() {
      var _ref;
      return (_ref = Tower.Application).callback.apply(_ref, arguments);
    },
    runCallbacks: function() {
      var _ref;
      return (_ref = Tower.Application.instance()).runCallbacks.apply(_ref, arguments);
    },
    raise: function() {
      throw new Error(Tower.t.apply(Tower, arguments));
    },
    t: function() {
      var _ref;
      return (_ref = Tower.SupportI18n).translate.apply(_ref, arguments);
    },
    l: function() {
      var _ref;
      return (_ref = Tower.SupportI18n).localize.apply(_ref, arguments);
    },
    stringify: function() {
      var string;
      string = Tower._.args(arguments).join("_");
      switch (Tower["case"]) {
        case "snakecase":
          return _.underscore(string);
        default:
          return _.camelize(string);
      }
    },
    namespace: function() {
      return Tower.Application.instance().toString();
    },
    modules: {},
    module: function(name) {
      var _base;
      return (_base = Tower.modules)[name] || (_base[name] = Tower._modules[name]());
    },
    constant: function(string) {
      var namespace, node, part, parts, _i, _len;
      node = global;
      parts = string.split(".");
      try {
        for (_i = 0, _len = parts.length; _i < _len; _i++) {
          part = parts[_i];
          node = node[part];
        }
      } catch (error) {
        node = null;
      }
      if (!node) {
        namespace = Tower.namespace();
        if (namespace && parts[0] !== namespace) {
          node = Tower.constant("" + namespace + "." + string);
        } else {
          throw new Error("Constant '" + string + "' wasn't found");
        }
      }
      return node;
    },
    namespaced: function(string) {
      var namespace;
      namespace = Tower.namespace();
      if (namespace) {
        return "" + namespace + "." + string;
      } else {
        return string;
      }
    },
    async: function(array, iterator, callback) {
      return this.series(array, iterator, callback);
    },
    each: function(array, iterator) {
      var index, item, _i, _len, _results;
      if (array.forEach) {
        return array.forEach(iterator);
      } else {
        _results = [];
        for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
          item = array[index];
          _results.push(iterator(item, index, array));
        }
        return _results;
      }
    },
    series: function(array, iterator, callback) {
      var completed, iterate;
      if (callback == null) {
        callback = function() {};
      }
      if (!array.length) {
        return callback();
      }
      completed = 0;
      iterate = function() {
        return iterator(array[completed], function(error) {
          if (error) {
            callback(error);
            return callback = function() {};
          } else {
            completed += 1;
            if (completed === array.length) {
              return callback();
            } else {
              return iterate();
            }
          }
        });
      };
      return iterate();
    },
    parallel: function(array, iterator, callback) {
      var completed;
      if (callback == null) {
        callback = function() {};
      }
      if (!array.length) {
        return callback();
      }
      completed = 0;
      return Tower.each(array, function(x) {
        return iterator(x, function(error) {
          if (error) {
            callback(error);
            return callback = function() {};
          } else {
            completed += 1;
            if (completed === array.length) {
              return callback();
            }
          }
        });
      });
    },
    callbackChain: function() {
      var callbacks,
        _this = this;
      callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return function(error) {
        var callback, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
          callback = callbacks[_i];
          if (callback) {
            _results.push(callback.call(_this, error));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
    },
    get: function() {
      return Tower.request.apply(Tower, ['get'].concat(__slice.call(arguments)));
    },
    post: function() {
      return Tower.request.apply(Tower, ['post'].concat(__slice.call(arguments)));
    },
    put: function() {
      return Tower.request.apply(Tower, ['put'].concat(__slice.call(arguments)));
    },
    destroy: function() {
      return Tower.request.apply(Tower, ['destroy'].concat(__slice.call(arguments)));
    },
    request: function() {
      var _ref;
      return (_ref = Tower.agent).request.apply(_ref, arguments);
    }
  });

  _ = Tower._;

  if (typeof global['Ember'] !== 'undefined') {
    Ember.Map.prototype.toArray = function() {
      return Tower._.values(this.values);
    };
    coffeescriptMixin = {
      __extend: function(child) {
        var object;
        object = Ember.Object.extend.apply(this);
        object.__name__ = child.name;
        if (this.extended) {
          this.extended.call(object);
        }
        return object;
      },
      __defineStaticProperty: function(key, value) {
        var object;
        object = {};
        object[key] = value;
        this[key] = value;
        return this.reopenClass(object);
      },
      __defineProperty: function(key, value) {
        var object;
        object = {};
        object[key] = value;
        return this.reopen(object);
      }
    };
    if (!Ember.Application) {
      Ember.Application = Ember.Namespace.extend();
    }
    Ember.Object.reopenClass(coffeescriptMixin);
    Ember.Namespace.reopenClass(coffeescriptMixin);
    Ember.Application.reopenClass(coffeescriptMixin);
    Ember.ArrayProxy.reopenClass(coffeescriptMixin);
    Ember.ArrayController.reopenClass(coffeescriptMixin);
    if (Ember.ObjectProxy) {
      Ember.ObjectProxy.reopenClass(coffeescriptMixin);
      Ember.ObjectController.reopenClass(coffeescriptMixin);
    }
    Tower.Class = Ember.Object.extend({
      className: function() {
        return this.constructor.className();
      }
    });
    Tower.Namespace = Ember.Namespace.extend();
    Tower.Collection = Ember.ArrayController.extend();
    if (Ember.State) {
      Ember.State.reopenClass(coffeescriptMixin);
      Ember.StateManager.reopenClass(coffeescriptMixin);
      Tower.State = Ember.State.extend();
      Tower.StateMachine = Ember.StateManager.extend();
    }
    towerMixin = Tower.toMixin();
    Tower.Class.reopenClass(towerMixin);
    Tower.Namespace.reopenClass(towerMixin);
    Ember.Application.reopenClass(towerMixin);
    Tower.Collection.reopenClass(towerMixin);
    if (Tower.State) {
      Tower.State.reopenClass(towerMixin);
      Tower.StateMachine.reopenClass(towerMixin);
    }
    if (Ember.View) {
      Ember.View.reopenClass(coffeescriptMixin);
      Ember.View.reopenClass(towerMixin);
      Ember.CollectionView.reopenClass(coffeescriptMixin);
      Ember.CollectionView.reopenClass(towerMixin);
      Ember.ContainerView.reopenClass(coffeescriptMixin);
      Ember.ContainerView.reopenClass(towerMixin);
    }
    Ember.NATIVE_EXTENSIONS = Tower.nativeExtensions;
    Ember.Map.prototype.replaceKey = function(oldKey, newKey) {
      var guid, list, value, values;
      values = this.values;
      list = this.keys.list;
      guid = Ember.guidFor(oldKey);
      value = values[guid];
      delete values[guid];
      list.replace(list.indexOf(oldKey), 1, newKey);
      values[Ember.guidFor(newKey)] = value;
      return void 0;
    };
    Array.prototype.toJSON = function() {
      return _.map(this, function(item) {
        if (item.toJSON) {
          return item.toJSON();
        } else {
          return item;
        }
      });
    };
  } else {

  }

  Tower.SupportEventEmitter = {
    isEventEmitter: true,
    events: function() {
      return this._events || (this._events = {});
    },
    hasEventListener: function(key) {
      return _.isPresent(this.events(), key);
    },
    event: function(key) {
      var _base;
      return (_base = this.events())[key] || (_base[key] = new Tower.Event(this, key));
    },
    on: function() {
      var args, eventMap, eventType, handler, options, _results;
      args = _.args(arguments);
      if (typeof args[args.length - 1] === "object") {
        options = args.pop();
        if (args.length === 0) {
          eventMap = options;
          options = {};
        }
      } else {
        options = {};
      }
      if (typeof args[args.length - 1] === "object") {
        eventMap = args.pop();
      } else {
        eventMap = {};
        eventMap[args.shift()] = args.shift();
      }
      _results = [];
      for (eventType in eventMap) {
        handler = eventMap[eventType];
        _results.push(this.addEventHandler(eventType, handler, options));
      }
      return _results;
    },
    addEventHandler: function(type, handler, options) {
      return this.event(type).addHandler(handler);
    },
    mutation: function(wrappedFunction) {
      return function() {
        var result;
        result = wrappedFunction.apply(this, arguments);
        this.event('change').fire(this, this);
        return result;
      };
    },
    prevent: function(key) {
      this.event(key).prevent();
      return this;
    },
    allow: function(key) {
      this.event(key).allow();
      return this;
    },
    isPrevented: function(key) {
      return this.event(key).isPrevented();
    },
    fire: function(key) {
      var event;
      event = this.event(key);
      return event.fire.call(event, _.args(arguments, 1));
    },
    allowAndFire: function(key) {
      return this.event(key).allowAndFire(_.args(arguments, 1));
    }
  };

  _ = Tower._;

  Tower.SupportI18n = {
    PATTERN: /(?:%%|%\{(\w+)\}|%<(\w+)>(.*?\d*\.?\d*[bBdiouxXeEfgGcps]))/g,
    defaultLanguage: 'en',
    load: function(pathOrObject, language) {
      var store;
      if (language == null) {
        language = this.defaultLanguage;
      }
      store = this.store();
      language = store[language] || (store[language] = {});
      _.deepMerge(language, typeof pathOrObject === 'string' ? require(pathOrObject) : pathOrObject);
      return this;
    },
    translate: function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.hasOwnProperty('tense')) {
        key += "." + options.tense;
      }
      if (options.hasOwnProperty('count')) {
        switch (options.count) {
          case 0:
            key += '.none';
            break;
          case 1:
            key += '.one';
            break;
          default:
            key += '.other';
        }
      }
      return this.interpolate(this.lookup(key, options.language), options);
    },
    localize: function() {
      return this.translate.apply(this, arguments);
    },
    lookup: function(key, language) {
      var part, parts, result, _i, _len;
      if (language == null) {
        language = this.defaultLanguage;
      }
      parts = key.split('.');
      result = this.store()[language];
      try {
        for (_i = 0, _len = parts.length; _i < _len; _i++) {
          part = parts[_i];
          result = result[part];
        }
      } catch (error) {
        result = null;
      }
      if (result == null) {
        throw new Error("Translation doesn't exist for '" + key + "'");
      }
      return result;
    },
    store: function() {
      return this._store || (this._store = {});
    },
    interpolate: function(string, locals) {
      if (locals == null) {
        locals = {};
      }
      return string.replace(this.PATTERN, function(match, $1, $2, $3) {
        var key, value;
        if (match === '%%') {
          return '%';
        } else {
          key = $1 || $2;
          if (locals.hasOwnProperty(key)) {
            value = locals[key];
          } else {
            throw new Error("Missing interpolation argument " + key);
          }
          if (typeof value === 'function') {
            value = value.call(locals);
          }
          if ($3) {
            return sprintf("%" + $3, value);
          } else {
            return value;
          }
        }
      });
    }
  };

  Tower.SupportI18n.t = Tower.SupportI18n.translate;

  _ = Tower._;

  Tower.SupportUrl = {
    toQueryValue: function(value, type, negate) {
      var item, items, result, _i, _len;
      if (negate == null) {
        negate = "";
      }
      if (_.isArray(value)) {
        items = [];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          item = value[_i];
          result = negate;
          result += item;
          items.push(result);
        }
        result = items.join(",");
      } else {
        result = negate;
        if (type === 'date') {
          result += _(value).strftime('YYYY-MM-DD');
        } else {
          result += value.toString();
        }
      }
      result = result.replace(" ", "+").replace(/[#%\"\|<>]/g, function(_) {
        return encodeURIComponent(_);
      });
      return result;
    },
    toQuery: function(object, schema) {
      var data, key, negate, param, range, rangeIdentifier, result, set, type, value;
      if (schema == null) {
        schema = {};
      }
      result = [];
      for (key in object) {
        value = object[key];
        param = "" + key + "=";
        type = schema[key] ? schema[key].type.toLowerCase() : 'string';
        negate = type === "string" ? "-" : "^";
        if (_.isHash(value)) {
          data = {};
          if (value.hasOwnProperty(">=")) {
            data.min = value[">="];
          }
          if (value.hasOwnProperty(">")) {
            data.min = value[">"];
          }
          if (value.hasOwnProperty("<=")) {
            data.max = value["<="];
          }
          if (value.hasOwnProperty("<")) {
            data.max = value["<"];
          }
          if (value.hasOwnProperty("=~")) {
            data.match = value["=~"];
          }
          if (value.hasOwnProperty("!~")) {
            data.notMatch = value["!~"];
          }
          if (value.hasOwnProperty("==")) {
            data.eq = value["=="];
          }
          if (value.hasOwnProperty("!=")) {
            data.neq = value["!="];
          }
          data.range = data.hasOwnProperty("min") || data.hasOwnProperty("max");
          set = [];
          if (data.range && !(data.hasOwnProperty("eq") || data.hasOwnProperty("match"))) {
            range = "";
            rangeIdentifier = type === 'date' ? 't' : 'n';
            if (data.hasOwnProperty("min")) {
              range += Tower.SupportUrl.toQueryValue(data.min, type);
            } else {
              range += rangeIdentifier;
            }
            range += "..";
            if (data.hasOwnProperty("max")) {
              range += Tower.SupportUrl.toQueryValue(data.max, type);
            } else {
              range += rangeIdentifier;
            }
            set.push(range);
          }
          if (data.hasOwnProperty("eq")) {
            set.push(Tower.SupportUrl.toQueryValue(data.eq, type));
          }
          if (data.hasOwnProperty("match")) {
            set.push(Tower.SupportUrl.toQueryValue(data.match, type));
          }
          if (data.hasOwnProperty("neq")) {
            set.push(Tower.SupportUrl.toQueryValue(data.neq, type, negate));
          }
          if (data.hasOwnProperty("notMatch")) {
            set.push(Tower.SupportUrl.toQueryValue(data.notMatch, type, negate));
          }
          param += set.join(",");
        } else {
          param += Tower.SupportUrl.toQueryValue(value, type);
        }
        result.push(param);
      }
      return result.sort().join("&");
    },
    extractDomain: function(host, tldLength) {
      var parts;
      if (tldLength == null) {
        tldLength = 1;
      }
      if (!this.namedHost(host)) {
        return null;
      }
      parts = host.split('.');
      return parts.slice(0, (parts.length - 1 - 1 + tldLength) + 1 || 9e9).join(".");
    },
    extractSubdomains: function(host, tldLength) {
      var parts;
      if (tldLength == null) {
        tldLength = 1;
      }
      if (!this.namedHost(host)) {
        return [];
      }
      parts = host.split('.');
      return parts.slice(0, (-(tldLength + 2)) + 1 || 9e9);
    },
    extractSubdomain: function(host, tldLength) {
      if (tldLength == null) {
        tldLength = 1;
      }
      return this.extractSubdomains(host, tldLength).join('.');
    },
    namedHost: function(host) {
      return !!!(host === null || /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.exec(host));
    },
    rewriteAuthentication: function(options) {
      if (options.user && options.password) {
        return "" + (encodeURI(options.user)) + ":" + (encodeURI(options.password)) + "@";
      } else {
        return "";
      }
    },
    hostOrSubdomainAndDomain: function(options) {
      var host, subdomain, tldLength;
      if (options.subdomain === null && options.domain === null) {
        return options.host;
      }
      tldLength = options.tldLength || 1;
      host = "";
      if (options.subdomain !== false) {
        subdomain = options.subdomain || this.extractSubdomain(options.host, tldLength);
        if (subdomain) {
          host += "" + subdomain + ".";
        }
      }
      host += options.domain || this.extractDomain(options.host, tldLength);
      return host;
    },
    urlForBase: function(options) {
      var params, path, port, result, schema;
      if (!(options.host || options.onlyPath)) {
        throw new Error('Missing host to link to! Please provide the :host parameter, set defaultUrlOptions[:host], or set :onlyPath to true');
      }
      result = "";
      params = options.params || {};
      path = (options.path || "").replace(/\/+/, "/");
      schema = options.schema || {};
      delete options.path;
      delete options.schema;
      if (!options.onlyPath) {
        port = options.port;
        delete options.port;
        if (options.protocol !== false) {
          result += options.protocol || "http";
          if (!result.match(_.regexpEscape(":|//"))) {
            result += ":";
          }
        }
        if (!result.match("//")) {
          result += "//";
        }
        result += this.rewriteAuthentication(options);
        result += this.hostOrSubdomainAndDomain(options);
        if (port) {
          result += ":" + port;
        }
      }
      if (options.trailingSlash) {
        result += path.replace(/\/$/, "/");
      } else {
        result += path;
      }
      if ((options.format != null) && !result.match(new RegExp('\.' + options.format + '$'))) {
        result += "." + options.format;
      }
      if (!_.isBlank(params)) {
        result += "?" + (Tower.SupportUrl.toQuery(params, schema));
      }
      if (options.anchor) {
        result += "#" + (Tower.SupportUrl.toQuery(options.anchor));
      }
      return result;
    },
    urlFor: function() {
      var args, item, last, options, result, route, _i, _len;
      args = _.args(arguments);
      if (!args[0]) {
        return null;
      }
      if (args[0] instanceof Tower.Model || (typeof args[0]).match(/(string|function)/)) {
        last = args[args.length - 1];
        if (last instanceof Tower.Model || (typeof last).match(/(string|function)/)) {
          options = {};
        } else {
          options = args.pop();
        }
      }
      options || (options = args.pop());
      result = "";
      if (options.route) {
        route = Tower.Route.find(options.route);
        if (route) {
          result = route.urlFor();
        }
      } else if (options.controller && options.action) {
        route = Tower.Route.findByControllerOptions({
          name: _.camelize(options.controller).replace(/(Controller)?$/, "Controller"),
          action: options.action
        });
        if (route) {
          result = "/" + _.parameterize(options.controller);
        }
      } else {
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          item = args[_i];
          result += "/";
          if (typeof item === "string") {
            result += item;
          } else if (item instanceof Tower.Model) {
            result += item.toPath();
          } else if (typeof item === "function") {
            result += item.toParam();
          }
        }
      }
      result += (function() {
        switch (options.action) {
          case "new":
            return "/new";
          case "edit":
            return "/edit";
          default:
            return "";
        }
      })();
      last = args[args.length - 1];
      if (last && options.params && !options.schema && last instanceof Tower.Model) {
        options.schema = last.constructor.fields();
      }
      if (Tower.defaultURLOptions) {
        _.defaults(options, Tower.defaultURLOptions);
      } else {
        if (!options.hasOwnProperty("onlyPath")) {
          options.onlyPath = true;
        }
      }
      options.path = result;
      return this.urlForBase(options);
    }
  };

  Tower.urlFor = function() {
    var _ref;
    return (_ref = Tower.SupportUrl).urlFor.apply(_ref, arguments);
  };

  Tower.SupportI18n.load({
    date: {
      formats: {
        "default": "%Y-%m-%d",
        short: "%b %d",
        long: "%B %d, %Y"
      },
      dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      abbrDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      monthNames: [null, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      abbrMonthNames: [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      order: ["year", "month", "day"]
    }
  });

  ({
    time: {
      formats: {
        "default": "%a, %d %b %Y %H:%M:%S %z",
        short: "%d %b %H:%M",
        long: "%B %d, %Y %H:%M"
      },
      am: "am",
      pm: "pm"
    },
    support: {
      array: {
        wordsConnector: ", ",
        twoWordsConnector: " and ",
        lastWordConnector: ", and "
      }
    }
  });

  _ = Tower._;

  (function() {
    var asyncing, cardType, casting, check, format, inflections, name, phoneFormats, postalCodeFormats, sanitize, sanitizing, validating, validator, _fn, _i, _len, _ref;
    try {
      validator = Tower.module('validator');
      check = validator.check;
      sanitize = validator.sanitize;
      validator.Validator.prototype.error = function(msg) {
        this._errors.push(msg);
        return this;
      };
    } catch (error) {
      if (Tower.isClient) {
        console.log(error);
      }
    }
    phoneFormats = {
      us: ["###-###-####", "##########", "###\\.###\\.####", "### ### ####", "\\(###\\) ###-####"],
      brazil: ["## ####-####", "\\(##\\) ####-####", "##########"],
      france: ["## ## ## ## ##"],
      uk: ["#### ### ####"]
    };
    for (name in phoneFormats) {
      format = phoneFormats[name];
      phoneFormats[name] = new RegExp("^" + (format.join('|').replace(/#/g, '\\d')) + "$", "i");
    }
    postalCodeFormats = {
      us: ['#####', '#####-####'],
      pt: ['####', '####-###']
    };
    for (name in postalCodeFormats) {
      format = postalCodeFormats[name];
      postalCodeFormats[name] = new RegExp("^" + (format.join('|').replace(/#/g, '\\d')) + "$", "i");
    }
    casting = {
      xss: function(value) {
        return sanitize(value).xss();
      },
      distance: function() {
        var _ref;
        return (_ref = Tower.module('geo')).getDistance.apply(_ref, arguments);
      },
      toInt: function(value) {
        return sanitize(value).toInt();
      },
      toBoolean: function(value) {
        return sanitize(value).toBoolean();
      },
      toFixed: function() {
        var _ref;
        return (_ref = Tower.module('accounting')).toFixed.apply(_ref, arguments);
      },
      formatCurrency: function() {
        var _ref;
        return (_ref = Tower.module('accounting')).formatMoney.apply(_ref, arguments);
      },
      formatNumber: function() {
        var _ref;
        return (_ref = Tower.module('accounting')).formatNumber.apply(_ref, arguments);
      },
      unformatCurrency: function() {
        var _ref;
        return (_ref = Tower.module('accounting')).unformat.apply(_ref, arguments);
      },
      unformatCreditCard: function(value) {
        return value.toString().replace(/[- ]/g, '');
      },
      strftime: function(time, format) {
        if (time._wrapped) {
          time = time.value();
        }
        return Tower.module('moment')(time).format(format);
      },
      now: function() {
        return _(Tower.module('moment')()._d);
      },
      endOfDay: function(value) {
        return _(Tower.module('moment')(value).eod()._d);
      },
      endOfWeek: function(value) {},
      endOfMonth: function() {},
      endOfQuarter: function() {},
      endOfYear: function() {},
      beginningOfDay: function(value) {
        return _(Tower.module('moment')(value).sod()._d);
      },
      beginningOfWeek: function() {},
      beginningOfMonth: function() {},
      beginningOfQuarter: function() {},
      beginningOfYear: function() {},
      midnight: function() {},
      toDate: function(value) {
        if (value == null) {
          return value;
        }
        return Tower.module('moment')(value)._d;
      },
      withDate: function(value) {
        return Tower.module('moment')(value);
      },
      days: function(value) {
        return _(value * 24 * 60 * 60 * 1000);
      },
      fromNow: function(value) {
        return _(Tower.module('moment')().add('milliseconds', value)._d);
      },
      ago: function(value) {
        return _(Tower.module('moment')().subtract('milliseconds', value)._d);
      },
      toHuman: function(value) {
        return Tower.module('moment')(value).from();
      },
      humanizeDuration: function(from, as) {
        if (as == null) {
          as = 'days';
        }
        if (from._wrapped) {
          from = from.value();
        }
        return Tower.module('moment').humanizeDuration(from, 'milliseconds');
      },
      toS: function(array) {
        return _.map(array, function(item) {
          return item.toString();
        });
      }
    };
    sanitizing = {
      trim: function(value) {
        return sanitize(value).trim();
      },
      ltrim: function(value, trim) {
        return sanitize(value).ltrim(trim);
      },
      rtrim: function(value, trim) {
        return sanitize(value, trim).rtrim(trim);
      },
      xss: function(value) {
        return sanitize(value).xss();
      },
      entityDecode: function(value) {
        return sanitize(value).entityDecode();
      },
      "with": function(value) {
        return sanitize(value).chain();
      }
    };
    validating = {
      isEmail: function(value) {
        var result;
        result = check(value).isEmail();
        if (!result._errors.length) {
          return true;
        }
        return false;
      },
      isUUID: function(value) {
        var result;
        try {
          result = check(value).isUUID();
        } catch (_error) {}
        if (!result._errors.length) {
          return true;
        }
        return result;
      },
      isAccept: function(value, param) {
        param = typeof param === "string" ? param.replace(/,/g, "|") : "png|jpe?g|gif";
        return !!value.match(new RegExp(".(" + param + ")$", "i"));
      },
      isPhone: function(value, options) {
        var pattern;
        if (options == null) {
          options = {};
        }
        pattern = phoneFormats[options.format] || /^\d{3}-\d{3}-\d{4}|\d{3}\.\d{3}\.\d{4}|\d{10}|\d{3}\s\d{3}\s\d{4}|\(\d{3}\)\s\d{3}-\d{4}$/i;
        return !!value.toString().match(pattern);
      },
      isUri: function(value, options) {
        var pattern;
        if (options == null) {
          options = {};
        }
        pattern = options.protocol !== false ? /^(?:https?:\/\/)(?:[\w]+\.)(?:\.?[\w]{2,})+$/ : /^(?:https?:\/\/)?(?:[\w]+\.)(?:\.?[\w]{2,})+$/;
        return !!value.match(pattern);
      },
      isCreditCard: function(value) {
        return _.isLuhn(value);
      },
      isMasterCard: function(value) {
        return _.isLuhn(value) && !!value.match(/^5[1-5].{14}/);
      },
      isAmex: function(value) {
        return _.isLuhn(value) && !!value.match(/^3[47].{13}/);
      },
      isVisa: function(value) {
        return _.isLuhn(value) && !!value.match(/^4.{15}/);
      },
      isLuhn: function(value) {
        var digit, i, length, number, parity, total;
        if (!value) {
          return false;
        }
        number = value.toString().replace(/\D/g, "");
        length = number.length;
        parity = length % 2;
        total = 0;
        i = 0;
        while (i < length) {
          digit = number.charAt(i);
          if (i % 2 === parity) {
            digit *= 2;
            if (digit > 9) {
              digit -= 9;
            }
          }
          total += parseInt(digit);
          i++;
        }
        return total % 10 === 0;
      },
      isWeakPassword: function(value) {
        return !!value.match(/(?=.{6,}).*/g);
      },
      isMediumPassword: function(value) {
        return !!value.match(/^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$/);
      },
      isStrongPassword: function(value) {
        return !!value.match(/^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).*$/);
      },
      isPostalCode: function(value, country) {
        if (country == null) {
          country = 'us';
        }
        return !!value.match(postalCodeFormats[country]);
      },
      isSlug: function(value) {
        return value === _.parameterize(value);
      }
    };
    validating.isUrl = validating.isUri;
    _ref = ['DinersClub', 'EnRoute', 'Discover', 'JCB', 'CarteBlanche', 'Switch', 'Solo', 'Laser'];
    _fn = function(cardType) {
      return validating["is" + cardType] = function(value) {
        return _.isLuhn(value);
      };
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cardType = _ref[_i];
      _fn(cardType);
    }
    inflections = {
      singularize: function(name) {
        if (name.match(/ss$/)) {
          return name;
        }
        return Tower.module('inflector').singularize(name);
      },
      camelCase: function(value) {
        return _.camelize(value);
      }
    };
    asyncing = {
      series: function() {
        var _ref1;
        return (_ref1 = Tower.module('async')).series.apply(_ref1, arguments);
      },
      parallel: function() {
        var _ref1;
        return (_ref1 = Tower.module('async')).parallel.apply(_ref1, arguments);
      }
    };
    _.mixin(casting);
    _.mixin(sanitizing);
    _.mixin(inflections);
    _.mixin(validating);
    return _.mixin(asyncing);
  })();

  _ = Tower._;

  Tower.random = function(key) {
    return Tower.random[key]();
  };

  _.extend(Tower.random, {
    boolean: function() {
      return Math.round(Math.random(1)) === 1;
    },
    email: function() {
      return require('Faker').Internet.email();
    },
    userName: function() {
      return require('Faker').Internet.userName();
    },
    domain: function() {
      return require('Faker').Internet.domainName();
    },
    domainName: function() {
      return require('Faker').Internet.domainName();
    },
    fullName: function() {
      return require('Faker').Name.fullName();
    },
    firstName: function() {
      return require('Faker').Name.firstName();
    },
    lastName: function() {
      return require('Faker').Name.lastName();
    },
    phone: function() {
      return require('Faker').PhoneNumber.phoneNumber();
    },
    words: function() {
      return require('Faker').Lorem.words();
    },
    sentence: function() {
      return require('Faker').Lorem.sentence();
    },
    paragraph: function() {
      return require('Faker').Lorem.paragraph();
    },
    paragraphs: function() {
      return require('Faker').Lorem.paragraphs();
    }
  });

  Tower.Factory = (function() {

    __defineStaticProperty(Factory,  "definitions", {});

    __defineStaticProperty(Factory,  "clear", function() {
      return this.definitions = {};
    });

    __defineStaticProperty(Factory,  "define", function(name, options, callback) {
      return this.definitions[name] = new Tower.Factory(name, options, callback);
    });

    __defineStaticProperty(Factory,  "create", function(name, options, callback) {
      return this.get(name).create(options, callback);
    });

    __defineStaticProperty(Factory,  "build", function(name, options, callback) {
      return this.get(name).build(options, callback);
    });

    __defineStaticProperty(Factory,  "get", function(name) {
      var factory;
      factory = Tower.Factory.definitions[name];
      if (!factory) {
        throw new Error("Factory '" + name + "' doesn't exist.");
      }
      return factory;
    });

    function Factory(name, options, callback) {
      if (options == null) {
        options = {};
      }
      if (this.constructor !== Tower.Factory) {
        return Tower.Factory.create(name, options);
      }
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (typeof callback !== 'function') {
        throw new Error("Expected function callback for Factory '" + name + "'");
      }
      this.name = name;
      this.className = Tower.namespaced(_.camelize(options.className || name));
      this.parentClassName = options.parent;
      this.callback = callback;
    }

    __defineProperty(Factory,  "toClass", function() {
      var fn, node, parts, _i, _len;
      parts = this.className.split(".");
      fn = global;
      for (_i = 0, _len = parts.length; _i < _len; _i++) {
        node = parts[_i];
        fn = fn[node];
      }
      if (typeof fn !== 'function') {
        throw new Error("Class " + string + " not found");
      }
      return fn;
    });

    __defineProperty(Factory,  "create", function(overrides, callback) {
      var _this = this;
      if (typeof overrides === 'function') {
        callback = overrides;
        overrides = {};
      }
      overrides || (overrides = {});
      return this.buildAttributes(overrides, function(error, attributes) {
        var klass, result;
        klass = _this.toClass();
        result = klass.build();
        result.setProperties(attributes);
        if (result.save) {
          result.save(function() {
            if (callback) {
              return callback.call(_this, error, result);
            }
          });
        } else {
          if (callback) {
            callback.call(_this, error, result);
          }
        }
        return result;
      });
    });

    __defineProperty(Factory,  "buildAttributes", function(overrides, callback) {
      var _this = this;
      if (this.callback.length) {
        return this.callback.call(this, function(error, attributes) {
          return callback.call(_this, error, _.extend(attributes, overrides));
        });
      } else {
        return callback.call(this, null, _.extend(this.callback.call(this), overrides));
      }
    });

    __defineProperty(Factory,  "build", function(overrides, callback) {
      var _this = this;
      if (typeof overrides === 'function') {
        callback = overrides;
        overrides = {};
      }
      overrides || (overrides = {});
      return this.buildAttributes(overrides, function(error, attributes) {
        var klass, result;
        klass = _this.toClass();
        result = klass.build();
        result.setProperties(attributes);
        if (callback) {
          callback.call(_this, error, result);
        }
        return result;
      });
    });

    return Factory;

  })();

  Tower.Hook = (function(_super) {
    var Hook;

    function Hook() {
      return Hook.__super__.constructor.apply(this, arguments);
    }

    Hook = __extends(Hook, _super);

    Hook.include(Tower.SupportCallbacks);

    return Hook;

  })(Ember.Application);

  Tower.Engine = (function(_super) {
    var Engine;

    function Engine() {
      return Engine.__super__.constructor.apply(this, arguments);
    }

    Engine = __extends(Engine, _super);

    __defineStaticProperty(Engine,  "configure", function(block) {
      return this.initializers().push(block);
    });

    __defineStaticProperty(Engine,  "initializers", function() {
      return this._initializers || (this._initializers = []);
    });

    __defineProperty(Engine,  "configure", function(block) {
      return this.constructor.configure(block);
    });

    __defineProperty(Engine,  "subscribe", function(key, block) {
      Tower.ModelCursor.subscriptions.push(key);
      return this[key] = typeof block === 'function' ? block() : block;
    });

    __defineProperty(Engine,  "unsubscribe", function(key) {
      Tower.ModelCursor.subscriptions.splice(_.indexOf(key), 1);
      return delete this[key];
    });

    return Engine;

  })(Tower.Hook);

  /*
  global error handling
  
  $(window).error (event) ->
    try
      App.errorHandler(event)
    catch error
      console.log(error)
  */


  Tower.Application = (function(_super) {
    var Application;

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application = __extends(Application, _super);

    Application.reopenClass({
      _callbacks: {},
      instance: function() {
        return this._instance;
      }
    });

    Application.before('initialize', 'setDefaults');

    Application.reopen({
      setDefaults: function() {
        return true;
      },
      teardown: function() {
        return Tower.Route.reload();
      },
      init: function() {
        this._super.apply(this, arguments);
        if (Tower.Application._instance) {
          throw new Error("Already initialized application");
        }
        return Tower.Application._instance = this;
      },
      ready: function() {
        return this._super.apply(this, arguments);
      },
      initialize: function() {
        this.extractAgent();
        this.setDefaults();
        this._super(Tower.router);
        return this;
      },
      extractAgent: function() {
        Tower.cookies = Tower.NetCookies.parse();
        return Tower.agent = new Tower.NetAgent(JSON.parse(Tower.cookies["user-agent"] || '{}'));
      },
      listen: function() {
        if (this.listening) {
          return;
        }
        this.listening = true;
        Tower.url || (Tower.url = "" + window.location.protocol + "//" + window.location.host);
        Tower.socketUrl || (Tower.socketUrl = Tower.url);
        Tower.NetConnection.initialize();
        return Tower.NetConnection.listen(Tower.socketUrl);
      },
      run: function() {
        return this.listen();
      }
    });

    return Application;

  })(Tower.Engine);

  _ = Tower._;

  Tower.Store = (function(_super) {
    var Store;

    function Store() {
      return Store.__super__.constructor.apply(this, arguments);
    }

    Store = __extends(Store, _super);

    Store.include(Tower.SupportCallbacks);

    Store.reopenClass({
      defaultLimit: 100,
      isKeyword: function(key) {
        return this.queryOperators.hasOwnProperty(key) || this.atomicModifiers.hasOwnProperty(key);
      },
      hasKeyword: function(object) {
        var key, value;
        if ((function() {
          var _ref, _results;
          _ref = this.queryOperators;
          _results = [];
          for (key in _ref) {
            value = _ref[key];
            _results.push(object.hasOwnProperty(key));
          }
          return _results;
        }).call(this)) {
          return true;
        }
        if ((function() {
          var _ref, _results;
          _ref = this.atomicModifiers;
          _results = [];
          for (key in _ref) {
            value = _ref[key];
            _results.push(object.hasOwnProperty(key));
          }
          return _results;
        }).call(this)) {
          return true;
        }
        return false;
      },
      atomicModifiers: {
        "$set": "$set",
        "$unset": "$unset",
        "$push": "$push",
        "$pushAll": "$pushAll",
        "$pull": "$pull",
        "$pullAll": "$pullAll",
        "$inc": "$inc",
        "$pop": "$pop",
        "$addToSet": "$addToSet"
      },
      queryOperators: {
        ">=": "$gte",
        "$gte": "$gte",
        ">": "$gt",
        "$gt": "$gt",
        "<=": "$lte",
        "$lte": "$lte",
        "<": "$lt",
        "$lt": "$lt",
        "$in": "$in",
        "$any": "$in",
        "$nin": "$nin",
        "$all": "$all",
        "=~": "$regex",
        "$m": "$regex",
        "$regex": "$regex",
        "$match": "$regex",
        "$notMatch": "$notMatch",
        "!~": "$nm",
        "$nm": "$nm",
        "=": "$eq",
        "$eq": "$eq",
        "!=": "$neq",
        "$neq": "$neq",
        "$null": "$null",
        "$notNull": "$notNull"
      },
      booleans: {
        "true": true,
        "true": true,
        "TRUE": true,
        "1": true,
        1: true,
        1.0: true,
        "false": false,
        "false": false,
        "FALSE": false,
        "0": false,
        0: false,
        0.0: false
      },
      configure: function(options) {
        return this.config = options;
      },
      initialize: function(callback) {
        if (callback) {
          return callback();
        }
      },
      env: function() {
        return this.config;
      },
      supports: {}
    });

    Store.reopen({
      addIndex: function(name, options) {},
      serialize: function(data, saved) {
        var i, item, _i, _len;
        if (saved == null) {
          saved = false;
        }
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          item = data[i];
          data[i] = this.serializeModel(item, saved);
        }
        return data;
      },
      deserialize: function(models) {
        var i, model, _i, _len;
        for (i = _i = 0, _len = models.length; _i < _len; i = ++_i) {
          model = models[i];
          models[i] = this.deserializeModel(model);
        }
        return models;
      },
      serializeModel: function(attributes, saved) {
        var klass, model;
        if (attributes instanceof Tower.Model) {
          return attributes;
        }
        if ((attributes.id != null) && this.records) {
          model = this.records.get(attributes.id);
        }
        if (!model) {
          klass = Tower.constant(this.className);
          model = klass["new"]();
        }
        model.initialize(attributes, {
          isNew: !saved
        });
        return model;
      },
      deserializeModel: function(data) {
        if (data instanceof Tower.Model) {
          return data.get('dirtyAttributes');
        } else {
          return data;
        }
      },
      init: function(options) {
        if (options == null) {
          options = {};
        }
        this._super.apply(this, arguments);
        if (options.name != null) {
          this.name = options.name;
        }
        if (this.name) {
          return this.className = options.type || Tower.namespaced(_.camelize(_.singularize(this.name)));
        }
      },
      _defaultOptions: function(options) {
        return options;
      },
      load: function(records) {},
      schema: function() {
        return Tower.constant(this.className).fields();
      },
      supports: function(key) {
        return this.constructor.supports[key] === true;
      },
      hashWasUpdated: function(type, clientId, record) {
        if (Ember.get(record, 'isDeleted')) {
          return;
        }
        return this.updateCursors(type, clientId, record);
      },
      cursors: Ember.computed(function() {
        return [];
      }).cacheable(),
      updateCursors: function(type, clientId, record) {},
      removeFromCursors: function(record) {},
      _mapKeys: function(key, records) {
        return _.map(records, function(record) {
          return record.get(key);
        });
      },
      refresh: function() {},
      fetch: function(cursor, callback) {
        if (cursor.returnArray === false) {
          return this.findOne(cursor, callback);
        } else {
          return this.find(cursor, callback);
        }
      },
      findWithCursor: function() {},
      createWithCursor: function() {},
      updateWithCursor: function() {},
      destroyWithCursor: function() {}
    });

    return Store;

  })(Tower.Class);

  _ = Tower._;

  Tower.StoreCallbacks = {
    runBeforeInsert: function(criteria, callback) {
      return callback();
    },
    runAfterInsert: function(criteria, callback) {
      return callback();
    },
    runBeforeUpdate: function(criteria, callback) {
      if (criteria.throughRelation) {
        return criteria.appendThroughConditions(callback);
      } else {
        return callback();
      }
    },
    runAfterUpdate: function(criteria, callback) {
      return callback();
    },
    runBeforeDestroy: function(criteria, callback) {
      if (criteria.throughRelation) {
        return criteria.appendThroughConditions(callback);
      } else {
        return callback();
      }
    },
    runAfterDestroy: function(criteria, callback) {
      return callback();
    },
    runBeforeFind: function(criteria, callback) {
      if (criteria.throughRelation) {
        return criteria.appendThroughConditions(callback);
      } else {
        return callback();
      }
    },
    runAfterFind: function(criteria, callback, records) {
      if (criteria.get('includes') && criteria.get('includes').length) {
        return criteria.eagerLoad(records, callback);
      } else {
        return callback();
      }
    }
  };

  Tower.StoreBatch = (function(_super) {
    var StoreBatch;

    function StoreBatch() {
      return StoreBatch.__super__.constructor.apply(this, arguments);
    }

    StoreBatch = __extends(StoreBatch, _super);

    StoreBatch.reopen({
      autocommit: Tower.isServer,
      bulk: false,
      init: function() {
        this._super.apply(this, arguments);
        return Ember.set(this, 'buckets', {
          clean: Ember.Map.create(),
          created: Ember.Map.create(),
          updated: Ember.Map.create(),
          deleted: Ember.Map.create()
        });
      },
      removeCleanRecords: function() {
        var clean,
          _this = this;
        clean = this.getBucket("clean");
        return clean.forEach(function(type, records) {
          return records.forEach(function(record) {
            return _this.remove(record);
          });
        });
      },
      add: function(record) {
        return this.adopt(record);
      },
      remove: function(record) {
        var defaultTransaction;
        defaultTransaction = Ember.getPath(this, 'store.defaultTransaction');
        return defaultTransaction.adopt(record);
      },
      adopt: function(record) {
        var oldTransaction;
        oldTransaction = record.get('transaction');
        if (oldTransaction) {
          oldTransaction.removeFromBucket('clean', record);
        }
        this.addToBucket('clean', record);
        return record.set('transaction', this);
      },
      addToBucket: function(kind, record) {
        var bucket, records, type;
        bucket = Ember.get(Ember.get(this, 'buckets'), kind);
        type = this.getType(record);
        records = bucket.get(type);
        if (!records) {
          records = Ember.OrderedSet.create();
          bucket.set(type, records);
        }
        return records.add(record);
      },
      removeFromBucket: function(kind, record) {
        var bucket, records, type;
        bucket = this.getBucket(kind);
        type = this.getType(record);
        records = bucket.get(type);
        if (records) {
          return records.remove(record);
        }
      },
      getBucket: function(kind) {
        return Ember.get(Ember.get(this, 'buckets'), kind);
      },
      getType: function(recordOrCursor) {
        if (recordOrCursor instanceof Tower.ModelCursor) {
          return recordOrCursor.getType();
        } else {
          return recordOrCursor.constructor;
        }
      },
      recordBecameClean: function(kind, record) {
        var defaultTransaction;
        this.removeFromBucket(kind, record);
        defaultTransaction = Ember.getPath(this, 'store.defaultTransaction');
        if (defaultTransaction) {
          return defaultTransaction.adopt(record);
        }
      },
      recordBecameDirty: function(kind, record) {
        this.removeFromBucket('clean', record);
        return this.addToBucket(kind, record);
      },
      commit: function(callback) {
        var commitDetails, iterate, store,
          _this = this;
        iterate = function(bucketType, fn, binding) {
          var dirty;
          dirty = _this.getBucket(bucketType);
          return dirty.forEach(function(type, records) {
            var array;
            if (records.isEmpty()) {
              return;
            }
            array = [];
            records.forEach(function(record) {
              record.send("willCommit");
              return array.push(record);
            });
            return fn.call(binding, type, array);
          });
        };
        commitDetails = {
          updated: {
            eachType: function(fn, binding) {
              return iterate("updated", fn, binding);
            }
          },
          created: {
            eachType: function(fn, binding) {
              return iterate("created", fn, binding);
            }
          },
          deleted: {
            eachType: function(fn, binding) {
              return iterate("deleted", fn, binding);
            }
          }
        };
        this.removeCleanRecords();
        store = Ember.get(this, "store");
        return store.commit(commitDetails, callback);
      }
    });

    return StoreBatch;

  })(Tower.Class);

  Tower.StoreMemory = (function(_super) {
    var StoreMemory;

    function StoreMemory() {
      return StoreMemory.__super__.constructor.apply(this, arguments);
    }

    StoreMemory = __extends(StoreMemory, _super);

    StoreMemory.reopenClass({
      stores: function() {
        return this._stores || (this._stores = []);
      },
      clean: function(callback) {
        var store, stores, _i, _len;
        stores = this.stores();
        for (_i = 0, _len = stores.length; _i < _len; _i++) {
          store = stores[_i];
          store.clean();
        }
        if (callback) {
          return callback();
        }
      }
    });

    StoreMemory.reopen({
      init: function(options) {
        this._super.apply(this, arguments);
        return this.initialize();
      },
      initialize: function() {
        this.constructor.stores().push(this);
        this.records = Ember.Map.create();
        this.lastId = 1;
        return Ember.set(this, 'batch', new Tower.StoreBatch);
      },
      clean: function() {
        return this.records = Ember.Map.create();
      },
      commit: function() {
        return Ember.get(this, 'batch').commit();
      }
    });

    return StoreMemory;

  })(Tower.Store);

  Tower.StoreMemoryCalculations = {
    average: function(conditions, options, callback) {},
    sum: function(conditions, options, callback) {},
    min: function(conditions, options, callback) {},
    max: function(conditions, options, callback) {}
  };

  _ = Tower._;

  Tower.StoreMemoryFinders = {
    find: function(cursor, callback) {
      var conditions, endIndex, limit, record, records, result, sort, startIndex, usingGeo, _i, _j, _len, _len1;
      result = [];
      records = this.records.toArray();
      conditions = cursor.conditions();
      usingGeo = this._conditionsUseGeo(conditions);
      if (usingGeo) {
        this._calculateDistances(records, this._getCoordinatesFromConditions(conditions));
        this._prepareConditionsForTesting(conditions);
      }
      if (_.isPresent(conditions)) {
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          record = records[_i];
          if (Tower.StoreOperators.test(record, conditions)) {
            result.push(record);
          }
        }
      } else {
        for (_j = 0, _len1 = records.length; _j < _len1; _j++) {
          record = records[_j];
          result.push(record);
        }
      }
      sort = usingGeo ? this._getGeoSortCriteria() : cursor.getCriteria('order');
      limit = cursor.getCriteria('limit');
      startIndex = cursor.getCriteria('offset') || 0;
      if (sort.length) {
        result = this.sort(result, sort);
      }
      endIndex = startIndex + (limit || result.length) - 1;
      result = result.slice(startIndex, endIndex + 1 || 9e9);
      if (callback) {
        result = callback.call(this, null, result);
      }
      return result;
    },
    findOne: function(cursor, callback) {
      var record,
        _this = this;
      record = void 0;
      cursor.limit(1);
      this.find(cursor, function(error, records) {
        record = records[0] || null;
        if (callback) {
          return callback.call(_this, error, record);
        }
      });
      return record;
    },
    count: function(cursor, callback) {
      var result,
        _this = this;
      result = void 0;
      this.find(cursor, function(error, records) {
        result = records.length;
        if (callback) {
          return callback.call(_this, error, result);
        }
      });
      return result;
    },
    exists: function(cursor, callback) {
      var result,
        _this = this;
      result = void 0;
      this.count(cursor, function(error, record) {
        result = !!record;
        if (callback) {
          return callback.call(_this, error, result);
        }
      });
      return result;
    },
    sort: function(records, sortings) {
      return _.sortBy.apply(_, [records].concat(__slice.call(sortings)));
    },
    _getCoordinatesFromConditions: function(conditions) {
      if (_.isObject(conditions) && (conditions.coordinates != null)) {
        return conditions.coordinates['$near'];
      }
    },
    _getGeoSortCriteria: function() {
      return [['__distance', 'asc']];
    },
    _calculateDistances: function(records, nearCoordinate) {
      var center, coordinates, record, _i, _len, _results;
      center = {
        latitude: nearCoordinate.lat,
        longitude: nearCoordinate.lng
      };
      _results = [];
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        coordinates = record.get('coordinates');
        coordinates = {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        };
        _results.push(record.__distance = Tower.module('geo').getDistance(center, coordinates));
      }
      return _results;
    },
    _prepareConditionsForTesting: function(conditions) {
      if (!(_.isHash(conditions) && _.isHash(conditions.coordinates))) {
        return;
      }
      return delete conditions.coordinates['$near'];
    },
    _conditionsUseGeo: function(conditions) {
      var key, value;
      if (!_.isHash(conditions)) {
        return false;
      }
      for (key in conditions) {
        value = conditions[key];
        if (_.isHash(value) && (_.isPresent(value['$near']) || _.isPresent(value['$maxDistance']))) {
          return true;
        }
      }
    }
  };

  if (Tower.isClient) {
    Tower.StoreMemoryFinders.fetch = function(cursor, callback) {
      var method,
        _this = this;
      method = cursor._limit === 1 ? 'findOne' : 'find';
      if (Tower.NetConnection.transport) {
        return Tower.NetConnection.transport[method](cursor, function(error, records) {
          if (callback) {
            callback(error, records);
          } else if (Tower.debug) {
            console.log(records);
          }
          return records;
        });
      } else {
        return this[method](cursor, callback);
      }
    };
  }

  _ = Tower._;

  Tower.StoreMemoryPersistence = {
    load: function(data, action) {
      var record, records, _i, _len;
      records = this._load(data);
      if (action === 'update') {
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          record = records[_i];
          record.reload();
        }
      }
      Tower.notifyConnections('load', records);
      return records;
    },
    _load: function(data) {
      var i, record, records, _i, _len;
      records = _.castArray(data);
      Ember.beginPropertyChanges();
      for (i = _i = 0, _len = records.length; _i < _len; i = ++_i) {
        record = records[i];
        records[i] = this.loadOne(this.serializeModel(record, true));
      }
      Ember.endPropertyChanges();
      return records;
    },
    loadOne: function(record) {
      var cid, originalRecord, records;
      records = this.records;
      cid = record.get('_cid');
      if (cid != null) {
        originalRecord = records.get(cid);
      }
      if (originalRecord) {
        originalRecord.set('data', record.get('data'));
        records.replaceKey(cid, record.get('id'));
        record = originalRecord;
      } else {
        records.set(record.get('id'), record);
      }
      record.set('isNew', false);
      return record;
    },
    unload: function(records) {
      records = this._unload(records);
      Tower.notifyConnections('unload', records);
      return records;
    },
    _unload: function(data) {
      var i, record, records, _i, _len;
      records = _.castArray(data);
      Ember.beginPropertyChanges();
      for (i = _i = 0, _len = records.length; _i < _len; i = ++_i) {
        record = records[i];
        records[i] = this.unloadOne(this.serializeModel(record));
      }
      Ember.endPropertyChanges();
      return records;
    },
    unloadOne: function(record) {
      var records;
      records = this.records;
      records.remove(record.get('id'));
      record.set('isNew', false);
      record.set('isDeleted', true);
      record.notifyRelations();
      return record;
    },
    insert: function(cursor, callback) {
      var object, result, _i, _len, _ref;
      result = [];
      _ref = cursor.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        result.push(this.insertOne(object));
      }
      result = cursor["export"](result);
      if (callback) {
        callback.call(this, null, result);
      }
      return result;
    },
    insertOne: function(record) {
      var attributes;
      if (record.get('_id') == null) {
        if (Tower.isClient) {
          if (record.get('_cid') == null) {
            record.set('_cid', this.generateId());
          }
        } else {
          record.set('id', this.generateId());
        }
      }
      attributes = this.deserializeModel(record);
      return this.loadOne(this.serializeModel(record));
    },
    update: function(updates, cursor, callback) {
      var _this = this;
      return this.find(cursor, function(error, records) {
        if (error) {
          return _.error(error, callback);
        }
        if (callback) {
          callback.call(_this, error, records);
        }
        return records;
      });
    },
    updateOne: function(record, updates) {
      var key, value;
      for (key in updates) {
        value = updates[key];
        this._updateAttribute(record.attributes, key, value);
      }
      return record;
    },
    destroy: function(cursor, callback) {
      return this.find(cursor, function(error, records) {
        var record, _i, _len;
        if (error) {
          return _.error(error, callback);
        }
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          record = records[_i];
          this.destroyOne(record);
        }
        if (callback) {
          callback.call(this, error, records);
        }
        return records;
      });
    },
    destroyOne: function(record) {
      return this.records.remove(record.get('id'));
    }
  };

  _ = Tower._;

  Tower.StoreMemorySerialization = {
    generateId: function() {
      return _.uuid();
    }
  };

  Tower.StoreMemory.include(Tower.StoreMemoryCalculations);

  Tower.StoreMemory.include(Tower.StoreMemoryFinders);

  Tower.StoreMemory.include(Tower.StoreMemoryPersistence);

  Tower.StoreMemory.include(Tower.StoreMemorySerialization);

  Tower.StoreNeo4j = (function(_super) {
    var StoreNeo4j;

    function StoreNeo4j() {
      return StoreNeo4j.__super__.constructor.apply(this, arguments);
    }

    StoreNeo4j = __extends(StoreNeo4j, _super);

    return StoreNeo4j;

  })(Tower.Store);

  Tower.StoreNeo4jConfiguration = {
    ClassMethods: {
      lib: function() {
        return require('neo4js');
      }
    }
  };

  Tower.StoreNeo4jDatabase = {
    ClassMethods: {
      initialize: function(callback) {
        var neo4j;
        if (this.initialized) {
          return callback.call(this, this.database);
        }
        this.initialized = true;
        neo4j = this.lib();
        try {
          this.database = new neo4j.Database('http://localhost:7474');
          return callback.call(this, null, this.database);
        } catch (error) {
          return callback.call(this, error);
        }
      }
    },
    database: function() {
      return this.constructor.database;
    }
  };

  Tower.StoreNeo4jFinders = {
    find: function(criteria, callback) {
      var conditions,
        _this = this;
      conditions = criteria.conditions();
      this.database().getReferenceNode(function(error, node) {
        return node.traverse({}, function(error, nodes) {
          if (callback) {
            return callback.call(_this, error, nodes);
          }
        });
      });
      return void 0;
    },
    findOne: function(criteria, callback) {},
    count: function(criteria, callback) {},
    exists: function(criteria, callback) {}
  };

  Tower.StoreNeo4jPersistence = {
    insert: function(criteria, callback) {
      if (criteria.relationship) {
        return this._createRelationship(criteria, callback);
      } else {
        return this._createNode(criteria, callback);
      }
    },
    _createNode: function(criteria, callback) {
      var attributes,
        _this = this;
      attributes = criteria.data[0];
      this.database().node(attributes, function(error, node) {
        var record;
        if (!error) {
          record = _this.serializeModel(node);
          record.set('isNew', !!error);
          console.log(node.getId());
          record.set('id', node.getId());
        }
        if (callback) {
          return callback.call(_this, error, record);
        }
      });
      return void 0;
    },
    _createRelationship: function(criteria, callback) {
      var attributes,
        _this = this;
      attributes = criteria.data[0];
      return this.database().relationship(attributes, function(error, relationship) {
        if (!error) {
          relationship = _this.serializeModel(relationship);
        }
        if (callback) {
          callback.call(_this, error, relationship);
        }
        return relationship;
      });
    },
    update: function(criteria, callback) {},
    destroy: function(criteria, callback) {}
  };

  Tower.StoreNeo4j.include(Tower.StoreNeo4jConfiguration);

  Tower.StoreNeo4j.include(Tower.StoreNeo4jDatabase);

  Tower.StoreNeo4j.include(Tower.StoreNeo4jFinders);

  Tower.StoreNeo4j.include(Tower.StoreNeo4jPersistence);

  _ = Tower._;

  Tower.StoreModifiers = {
    MAP: {
      '$set': '$set',
      '$unset': '$unset',
      '$push': '$push',
      '$pushEach': '$pushEach',
      '$pull': '$pull',
      '$pullEach': '$pullEach',
      '$remove': '$pull',
      '$removeEach': '$pullEach',
      '$inc': '$inc',
      '$pop': '$pop',
      '$add': '$add',
      '$addEach': '$addEach',
      '$addToSet': '$add'
    },
    SET: ['push', 'pushEach', 'pull', 'pullEach', 'inc', 'add', 'addEach', 'remove', 'removeEach', 'unset'],
    set: function(key, value) {
      return _.oneOrMany(this, this._set, key, value);
    },
    push: function(key, value) {
      return _.oneOrMany(this, this._push, key, value);
    },
    pushEach: function(key, value) {
      return _.oneOrMany(this, this._push, key, value, true);
    },
    pull: function(key, value) {
      return _.oneOrMany(this, this._pull, key, value);
    },
    pullEach: function(key, value) {
      return _.oneOrMany(this, this._pull, key, value, true);
    },
    inc: function(key, value) {
      return _.oneOrMany(this, this._inc, key, value);
    },
    add: function(key, value) {
      return _.oneOrMany(this, this._add, key, value);
    },
    unset: function() {
      var key, keys, _i, _len;
      keys = _.flatten(_.args(arguments));
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        delete this[key];
      }
      return void 0;
    },
    _set: function(key, value) {},
    _push: function(key, value, array) {
      if (array == null) {
        array = false;
      }
    },
    _pull: function(key, value, array) {
      if (array == null) {
        array = false;
      }
    },
    _inc: function(key, value) {},
    _add: function(key, value) {},
    _remove: function(key, value) {}
  };

  _ = Tower._;

  Tower.StoreOperators = {
    MAP: {
      '>=': '$gte',
      '$gte': '$gte',
      '>': '$gt',
      '$gt': '$gt',
      '<=': '$lte',
      '$lte': '$lte',
      '<': '$lt',
      '$lt': '$lt',
      '$in': '$anyIn',
      '$any': '$anyIn',
      '$anyIn': '$anyIn',
      '$nin': '$notInAll',
      '$notIn': '$notInAll',
      '$notInAny': '$notInAny',
      '$all': '$allIn',
      '=~': '$match',
      '$m': '$match',
      '$regex': '$match',
      '$match': '$match',
      '$notMatch': '$notMatch',
      '!~': '$notMatch',
      '$nm': '$nm',
      '==': '$eq',
      '=': '$eq',
      '$eq': '$eq',
      '!=': '$ne',
      '$neq': '$ne',
      '$ne': '$ne',
      '$null': '$null',
      '$notNull': '$notNull',
      '$exists': '$exists',
      '$size': '$size',
      '$elemMatch': '$matchIn',
      '$matchIn': '$matchIn',
      '$maxDistance': '$maxDistance'
    },
    select: function(records, conditions) {
      var _this = this;
      return _.select(records, function(record) {
        return _this.test(record, conditions);
      });
    },
    matching: function(records, conditions) {
      var _this = this;
      return _.select(records, function(record) {
        return _this.test(record, conditions);
      });
    },
    notMatching: function(records, conditions) {
      var _this = this;
      return _.select(records, function(record) {
        return !_this.test(record, conditions);
      });
    },
    test: function(record, conditions) {
      var key, success, value;
      success = true;
      for (key in conditions) {
        value = conditions[key];
        if (key === '$or') {
          success = this.or(record, value);
        } else if (key === '$nor') {
          success = this.nor(record, value);
        } else {
          success = this.testValue(this._getValue(record, key), value, record);
        }
        if (!success) {
          return false;
        }
      }
      return success;
    },
    testEach: function(records, conditions, callback) {
      var record, _i, _len;
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        callback.call(record, this.test(record, conditions), record);
      }
      return void 0;
    },
    testValue: function(recordValue, operators, record) {
      var key, operator, success, value;
      success = true;
      switch (_.kind(operators)) {
        case 'number':
        case 'string':
        case 'float':
        case 'NaN':
          success = recordValue === operators;
          break;
        case 'undefined':
        case 'null':
          success = recordValue === null || recordValue === void 0;
          break;
        case 'date':
          success = recordValue.getTime() === operators.getTime();
          break;
        case 'array':
          success = _.isEqual(recordValue, operators);
          break;
        case 'regex':
          success = this.match(recordValue, operators);
          break;
        default:
          if (_.isHash(operators)) {
            for (key in operators) {
              value = operators[key];
              if (operator = Tower.StoreOperators.MAP[key]) {
                success = this[operator.replace('$', '')](recordValue, value, record);
              } else {
                success = recordValue === operators;
              }
              if (!success) {
                return false;
              }
            }
          } else {
            success = _.isEqual(recordValue, operators);
          }
      }
      return success;
    },
    gt: function(recordValue, value) {
      return (value != null) && (recordValue != null) && recordValue > value;
    },
    gte: function(recordValue, value) {
      return (value != null) && (recordValue != null) && recordValue >= value;
    },
    lt: function(recordValue, value) {
      return (value != null) && (recordValue != null) && recordValue < value;
    },
    lte: function(recordValue, value) {
      return (value != null) && (recordValue != null) && recordValue <= value;
    },
    eq: function(recordValue, value) {
      return this._comparable(recordValue) === this._comparable(value);
    },
    ne: function(recordValue, value) {
      return this._comparable(recordValue) !== this._comparable(value);
    },
    match: function(recordValue, value) {
      return !!((recordValue != null) && (value != null) && (typeof recordValue === 'string' ? recordValue.match(value) : recordValue.exec(value)));
    },
    notMatch: function(recordValue, value) {
      return !this.match(recordValue, value);
    },
    anyIn: function(recordValue, array) {
      var value, _i, _j, _len, _len1;
      array = _.castArray(array);
      if (_.isArray(recordValue)) {
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          value = array[_i];
          if (_.include(recordValue, value)) {
            return true;
          }
        }
      } else {
        for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
          value = array[_j];
          if (_.isEqual(recordValue, value)) {
            return true;
          }
        }
      }
      return false;
    },
    allIn: function(recordValue, array) {
      var value, _i, _j, _len, _len1;
      array = _.castArray(array);
      if (_.isArray(recordValue)) {
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          value = array[_i];
          if (!_.include(recordValue, value)) {
            return false;
          }
        }
      } else {
        for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
          value = array[_j];
          if (!_.isEqual(recordValue, value)) {
            return false;
          }
        }
      }
      return true;
    },
    notInAny: function(recordValue, array) {
      var value, _i, _j, _len, _len1;
      array = _.castArray(array);
      if (_.isArray(recordValue)) {
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          value = array[_i];
          if (_.include(recordValue, value)) {
            return true;
          }
        }
      } else {
        for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
          value = array[_j];
          if (_.isEqual(recordValue, value)) {
            return true;
          }
        }
      }
      return false;
    },
    notInAll: function(recordValue, array) {
      var value, _i, _j, _len, _len1;
      array = _.castArray(array);
      if (_.isArray(recordValue)) {
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          value = array[_i];
          if (_.indexOf(recordValue, value) !== -1) {
            return false;
          }
        }
      } else {
        for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
          value = array[_j];
          if (recordValue === value) {
            return false;
          }
        }
      }
      return true;
    },
    matchIn: function(recordValue, value) {
      var item, _i, _len;
      if (!_.isArray(recordValue)) {
        return false;
      }
      for (_i = 0, _len = recordValue.length; _i < _len; _i++) {
        item = recordValue[_i];
        if (this.test(item, value)) {
          return true;
        }
      }
      return false;
    },
    maxDistance: function(recordValue, distance, record) {
      return (distance != null) && (record != null) && (record.__distance != null) && record.__distance <= distance;
    },
    exists: function(recordValue) {
      return recordValue !== void 0;
    },
    size: function(recordValue, value) {
      return _.isArray(recordValue) && recordValue.length === value;
    },
    or: function(record, array) {
      var conditions, _i, _len;
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        conditions = array[_i];
        if (this.test(record, conditions)) {
          return true;
        }
      }
      return false;
    },
    nor: function(record, array) {
      var conditions, _i, _len;
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        conditions = array[_i];
        if (this.test(record, conditions)) {
          return false;
        }
      }
      return true;
    },
    _comparable: function(value) {
      if (_.isDate(value)) {
        return value.getTime();
      } else if (_.isRegExp(value)) {
        return value.toString();
      } else {
        return value;
      }
    },
    _getValue: function(recordOrObject, key) {
      if (typeof recordOrObject.get === 'function') {
        return recordOrObject.get(key);
      } else {
        return _.getNestedAttribute(recordOrObject, key);
      }
    }
  };

  Tower.StoreOperators.notIn = Tower.StoreOperators.notInAny;

  _ = Tower._;

  Tower.StoreSerializerString = {
    from: function(serialized) {
      if (_.none(serialized)) {
        return null;
      } else {
        return String(serialized);
      }
    },
    to: function(deserialized) {
      if (_.none(deserialized)) {
        return null;
      } else {
        return String(deserialized);
      }
    }
  };

  Tower.StoreSerializerNumber = {
    from: function(serialized) {
      if (_.none(serialized)) {
        return null;
      } else {
        return Number(serialized);
      }
    },
    to: function(deserialized) {
      if (_.none(deserialized)) {
        return null;
      } else {
        return Number(deserialized);
      }
    }
  };

  Tower.StoreSerializerInteger = {
    from: function(serialized) {
      if (_.none(serialized)) {
        return null;
      } else {
        return parseInt(serialized);
      }
    },
    to: function(deserialized) {
      if (_.none(deserialized)) {
        return null;
      } else {
        return parseInt(deserialized);
      }
    }
  };

  Tower.StoreSerializerFloat = {
    from: function(serialized) {
      return parseFloat(serialized);
    },
    to: function(deserialized) {
      return deserialized;
    }
  };

  Tower.StoreSerializerBoolean = {
    from: function(serialized) {
      if (typeof serialized === 'string') {
        return !!(serialized !== 'false');
      } else {
        return Boolean(serialized);
      }
    },
    to: function(deserialized) {
      return Tower.StoreSerializerBoolean.from(deserialized);
    }
  };

  Tower.StoreSerializerDate = {
    from: function(date) {
      return date;
    },
    to: function(date) {
      return _.toDate(date);
    }
  };

  Tower.StoreSerializerGeo = {
    from: function(serialized) {
      return serialized;
    },
    to: function(deserialized) {
      switch (_.kind(deserialized)) {
        case 'array':
          return {
            lat: deserialized[0],
            lng: deserialized[1]
          };
        case 'object':
          return {
            lat: deserialized.lat || deserialized.latitude,
            lng: deserialized.lng || deserialized.longitude
          };
        default:
          deserialized = deserialized.split(/,\ */);
          return {
            lat: parseFloat(deserialized[0]),
            lng: parseFloat(deserialized[1])
          };
      }
    }
  };

  Tower.StoreSerializerArray = {
    from: function(serialized) {
      if (_.none(serialized)) {
        return null;
      } else {
        return _.castArray(serialized);
      }
    },
    to: function(deserialized) {
      return Tower.StoreSerializerArray.from(deserialized);
    }
  };

  Tower.StoreSerializerDecimal = Tower.StoreSerializerFloat;

  Tower.StoreSerializerTime = Tower.StoreSerializerDate;

  Tower.StoreSerializerDateTime = Tower.StoreSerializerDate;

  Tower.StoreTransaction = (function(_super) {
    var StoreTransaction;

    function StoreTransaction() {
      return StoreTransaction.__super__.constructor.apply(this, arguments);
    }

    StoreTransaction = __extends(StoreTransaction, _super);

    StoreTransaction.reopen({
      init: function() {
        return this.records = [];
      },
      add: function(record) {
        return this.records.push(record);
      },
      remove: function(record) {
        return this.records.splice(1, _.indexOf(this.records, record));
      },
      adopt: function(record) {
        var transaction;
        transaction = record.get('transaction');
        if (transaction !== this) {
          transaction.remove(record);
          return this.add(record);
        }
      },
      committed: function() {
        var record, records, _i, _len, _results;
        records = this.records;
        _results = [];
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          record = records[_i];
          _results.push(record.committed());
        }
        return _results;
      },
      rollback: function() {
        var record, records, _i, _len, _results;
        records = this.records;
        _results = [];
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          record = records[_i];
          _results.push(record.rollback());
        }
        return _results;
      }
    });

    return StoreTransaction;

  })(Tower.Class);

  Tower.Store.include(Tower.StoreCallbacks);

  Tower.StoreTransport = {};

  _ = Tower._;

  Tower.StoreTransportAjax = {
    requests: [],
    enabled: true,
    pending: false,
    requesting: false,
    defaults: {
      contentType: 'application/json',
      dataType: 'json',
      processData: false,
      async: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    ajax: function(params, defaults) {
      return $.ajax(this.serializeParams(params, defaults));
    },
    serializeParams: function(params, defaults) {
      params = _.extend({}, this.defaults, defaults, params);
      if (params.type === 'GET' && params.dataType === 'json') {
        params = this._adjustParamsForJSONP(params);
      }
      return params;
    },
    _adjustParamsForJSONP: function(params) {
      var callbackParam, separator;
      params.dataType = 'jsonp';
      delete params.contentType;
      if (!params.url.match(/[\?\&]callback=.+/)) {
        callbackParam = 'callback=?';
        separator = params.url.match(/\?/) ? '&' : '?';
        params.url = "" + params.url + separator + callbackParam;
      }
      return params;
    },
    toJSON: function(record, method, format) {
      var data;
      data = {};
      data[_.camelize(record.constructor.toKey(), true)] = record;
      data._method = method;
      data.format = format;
      return JSON.stringify(data);
    },
    disable: function(callback) {
      if (this.enabled) {
        this.enabled = false;
        callback();
        return this.enabled = true;
      } else {
        return callback();
      }
    },
    requestNext: function() {
      var next;
      next = this.requests.shift();
      if (next) {
        return this.request(next);
      } else {
        return this.pending = false;
      }
    },
    request: function(callback) {
      var _this = this;
      this.requesting = true;
      return callback().complete(function() {
        _this.requesting = false;
        return _this.requestNext();
      });
    },
    queue: function(callback) {
      if (!this.enabled) {
        return;
      }
      if (this.pending) {
        this.requests.push(callback);
      } else {
        this.pending = true;
        this.request(callback);
      }
      return callback;
    },
    success: function(record, options) {
      var _this = this;
      if (options == null) {
        options = {};
      }
      return function(data, status, xhr) {
        var _ref;
        _this.disable(function() {
          if (data && !_.isBlank(data)) {
            return record.updateAttributes(data, {
              sync: false
            });
          }
        });
        return (_ref = options.success) != null ? _ref.apply(_this.record) : void 0;
      };
    },
    failure: function(record, callback) {
      var _this = this;
      return function(xhr, statusText, error) {
        var json;
        json = (function() {
          try {
            return JSON.parse(xhr.responseText);
          } catch (_error) {}
        })();
        json || (json = {});
        json.status || (json.status = xhr.status);
        json.statusText || (json.statusText = statusText);
        json.message || (json.message = error);
        if (callback) {
          return callback.call(_this, json);
        }
      };
    },
    create: function(records, callback) {
      var record, _i, _len, _results,
        _this = this;
      records = _.toArray(records);
      _results = [];
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        _results.push((function(record) {
          return _this.queue(function() {
            var params;
            params = {
              url: _this.urlForCreate(record),
              type: 'POST',
              data: _this.toJSON(record)
            };
            return _this.ajax({}, params).success(_this.createSuccess(record, callback)).error(_this.createFailure(record, callback));
          });
        })(record));
      }
      return _results;
    },
    urlForCreate: function(record) {
      return Tower.urlFor(record.constructor);
    },
    createSuccess: function(record, callback) {
      var _this = this;
      return function(data, status, xhr) {
        record.setProperties(data);
        if (callback) {
          return callback.call(_this, null, record);
        }
      };
    },
    createFailure: function(record, callback) {
      return this.failure(record, callback);
    },
    update: function(records, callback) {
      var record, _i, _len, _results,
        _this = this;
      _results = [];
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        _results.push((function(record) {
          return _this.queue(function() {
            var data, params;
            data = {};
            data[_.camelize(record.constructor.toKey(), true)] = record.get('dirtyAttributes');
            data._method = 'PUT';
            data.format = 'json';
            params = {
              type: 'PUT',
              data: JSON.stringify(data),
              url: _this.urlForUpdate(record)
            };
            return _this.ajax({}, params).success(_this.updateSuccess(record, callback)).error(_this.updateFailure(record, callback));
          });
        })(record));
      }
      return _results;
    },
    urlForUpdate: function(record) {
      return Tower.urlFor(record);
    },
    updateSuccess: function(record, callback) {
      var _this = this;
      return function(data, status, xhr) {
        record.setProperties(data);
        if (callback) {
          return callback.call(_this, null, record);
        }
      };
    },
    updateFailure: function(record, callback) {
      return this.failure(record, callback);
    },
    destroy: function(records, callback) {
      var record, _i, _len, _results,
        _this = this;
      _results = [];
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        _results.push((function(record) {
          return _this.queue(function() {
            var params;
            params = {
              url: _this.urlForDestroy(record),
              type: 'POST',
              data: JSON.stringify({
                format: 'json',
                _method: 'DELETE'
              })
            };
            return _this.ajax({}, params).success(_this.destroySuccess(record, callback)).error(_this.destroyFailure(record, callback));
          });
        })(record));
      }
      return _results;
    },
    urlForDestroy: function(record) {
      return Tower.urlFor(record);
    },
    destroySuccess: function(record, callback) {
      var _this = this;
      return function(data, status, xhr) {
        if (callback) {
          return callback.call(_this, null, record);
        }
      };
    },
    destroyFailure: function(record, callback) {
      return this.failure(record, callback);
    },
    findSuccess: function(cursor, callback) {
      var _this = this;
      return function(data, status, xhr) {
        data = cursor.model.load(data);
        if (callback) {
          return callback(null, data);
        }
      };
    },
    findFailure: function(cursor, callback) {
      return this.failure(cursor, callback);
    },
    find: function(cursor, callback) {
      var params, records,
        _this = this;
      params = this.serializeParamsForFind(cursor);
      records = void 0;
      this.queue(function() {
        return _this.ajax(params).success(_this.findSuccess(cursor, function(error, data) {
          if (callback) {
            callback.call(_this, error, data);
          }
          return records = data;
        })).error(_this.findFailure(cursor, callback));
      });
      return records;
    },
    serializeParamsForFind: function(cursor) {
      var data, url;
      url = this.urlForIndex(cursor.model);
      data = cursor.toParams();
      data.format = 'json';
      return {
        type: 'GET',
        data: $.param(data),
        url: url
      };
    },
    urlForIndex: function(model) {
      return Tower.urlFor(model);
    },
    findOne: function(cursor, callback) {
      var params, records,
        _this = this;
      params = this.serializeParamsForFindOne(cursor);
      records = void 0;
      this.queue(function() {
        return _this.ajax(params).success(_this.findSuccess(cursor, function(error, data) {
          data = (function() {
            try {
              return data[0];
            } catch (_error) {}
          })();
          if (callback) {
            callback.call(_this, error, data);
          }
          return records = data;
        })).error(_this.findFailure(cursor, callback));
      });
      return records;
    },
    serializeParamsForFindOne: function(cursor) {
      var data, url;
      data = cursor.toParams();
      delete data.limit;
      url = this.urlForShow(cursor.model, data.conditions.id);
      data.format = 'json';
      return {
        type: 'GET',
        data: $.param(data),
        url: url
      };
    },
    urlForShow: function(model, id) {
      return Tower.urlFor(model) + '/' + id;
    }
  };

  Tower.StoreLocalStorage = (function(_super) {
    var StoreLocalStorage;

    function StoreLocalStorage() {
      return StoreLocalStorage.__super__.constructor.apply(this, arguments);
    }

    StoreLocalStorage = __extends(StoreLocalStorage, _super);

    __defineProperty(StoreLocalStorage,  "initialize", function() {
      return this.lastId = 0;
    });

    __defineProperty(StoreLocalStorage,  "_setRecord", function(record) {});

    __defineProperty(StoreLocalStorage,  "_getRecord", function(key) {
      return this;
    });

    __defineProperty(StoreLocalStorage,  "_removeRecord", function(key) {
      return delete this.records[record.id];
    });

    return StoreLocalStorage;

  })(Tower.StoreMemory);

  _ = Tower._;

  Tower.Model = (function(_super) {
    var Model;

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model = __extends(Model, _super);

    Model.reopen(Ember.Evented);

    Model.reopen({
      errors: null,
      readOnly: false,
      previousChanges: void 0,
      initialize: function(attributes, options) {
        if (attributes == null) {
          attributes = {};
        }
        if (options == null) {
          options = {};
        }
        if (options.isNew !== false) {
          return this._initialize(attributes, options);
        } else {
          return this._initializeFromStore(attributes, options);
        }
      },
      _initialize: function(attributes, options) {
        _.extend(this.get('attributes'), this.constructor._defaultAttributes(this));
        this.assignAttributes(attributes);
        return this._initializeData(options);
      },
      _initializeFromStore: function(attributes, options) {
        _.extend(this.get('attributes'), this.constructor.initializeAttributes(this, attributes));
        this.set('isNew', false);
        return this._initializeData(options);
      },
      _initializeData: function(options) {
        this.setProperties({
          errors: {},
          readOnly: options.hasOwnProperty('readOnly') ? options.readOnly : false
        });
        this.runCallbacks('find');
        this.runCallbacks('initialize');
        return this;
      }
    });

    return Model;

  })(Tower.Class);

  _ = Tower._;

  Tower.ModelScope = (function() {

    __defineStaticProperty(ModelScope,  "finderMethods", ['find', 'all', 'first', 'last', 'count', 'exists', 'fetch', 'instantiate', 'pluck', 'live', 'toArray']);

    __defineStaticProperty(ModelScope,  "persistenceMethods", ['insert', 'update', 'create', 'destroy', 'build']);

    __defineStaticProperty(ModelScope,  "queryMethods", ['where', 'order', 'sort', 'asc', 'desc', 'gte', 'gt', 'lte', 'lt', 'limit', 'offset', 'select', 'joins', 'includes', 'excludes', 'paginate', 'page', 'allIn', 'allOf', 'alsoIn', 'anyIn', 'anyOf', 'notIn', 'near', 'within']);

    __defineStaticProperty(ModelScope,  "queryOperators", {
      '>=': '$gte',
      '$gte': '$gte',
      '>': '$gt',
      '$gt': '$gt',
      '<=': '$lte',
      '$lte': '$lte',
      '<': '$lt',
      '$lt': '$lt',
      '$in': '$in',
      '$nin': '$nin',
      '$any': '$any',
      '$all': '$all',
      '=~': '$regex',
      '$m': '$regex',
      '$regex': '$regex',
      '$match': '$match',
      '$notMatch': '$notMatch',
      '!~': '$nm',
      '$nm': '$nm',
      '=': '$eq',
      '$eq': '$eq',
      '!=': '$neq',
      '$neq': '$neq',
      '$null': '$null',
      '$notNull': '$notNull',
      '$near': '$near'
    });

    function ModelScope(cursor) {
      this.cursor = cursor;
    }

    __defineProperty(ModelScope,  "has", function(object) {
      return this.cursor.has(object);
    });

    __defineProperty(ModelScope,  "live", function() {
      return this;
    });

    __defineProperty(ModelScope,  "build", function() {
      var args, callback, cursor;
      cursor = this.compile();
      args = _.compact(_.args(arguments));
      callback = _.extractBlock(args);
      cursor.addData(args);
      return cursor.build(callback);
    });

    __defineProperty(ModelScope,  "insert", function() {
      var args, callback, cursor;
      cursor = this.compile();
      args = _.compact(_.args(arguments));
      callback = _.extractBlock(args);
      cursor.addData(args);
      return cursor.insert(callback);
    });

    __defineProperty(ModelScope,  "create", ModelScope.prototype.insert);

    __defineProperty(ModelScope,  "update", function() {
      var args, callback, cursor, updates;
      cursor = this.compile();
      args = _.flatten(_.args(arguments));
      callback = _.extractBlock(args);
      updates = args.pop();
      if (!(updates && typeof updates === 'object')) {
        throw new Error('Must pass in updates hash');
      }
      cursor.addData(updates);
      cursor.addIds(args);
      return cursor.update(callback);
    });

    __defineProperty(ModelScope,  "destroy", function() {
      var args, callback, cursor;
      cursor = this.compile();
      args = _.flatten(_.args(arguments));
      callback = _.extractBlock(args);
      cursor.addIds(args);
      return cursor.destroy(callback);
    });

    __defineProperty(ModelScope,  "add", function() {
      var args, callback, cursor;
      cursor = this.compile();
      args = _.args(arguments);
      callback = _.extractBlock(args);
      cursor.addData(args);
      return cursor.add(callback);
    });

    __defineProperty(ModelScope,  "remove", function() {
      var args, callback, cursor;
      cursor = this.compile();
      args = _.flatten(_.args(arguments));
      callback = _.extractBlock(args);
      cursor.addIds(args);
      return cursor.remove(callback);
    });

    __defineProperty(ModelScope,  "load", function(records) {
      return this.cursor.load(records);
    });

    __defineProperty(ModelScope,  "reset", function() {
      return this.cursor.reset();
    });

    __defineProperty(ModelScope,  "getEach", function() {
      var _ref;
      return (_ref = this.cursor).getEach.apply(_ref, arguments);
    });

    __defineProperty(ModelScope,  "find", function() {
      var args, callback, cursor;
      cursor = this.compile();
      args = _.flatten(_.args(arguments));
      callback = _.extractBlock(args);
      cursor.addIds(args);
      return cursor.find(callback);
    });

    __defineProperty(ModelScope,  "first", function(callback) {
      var cursor;
      cursor = this.compile();
      return cursor.findOne(callback);
    });

    __defineProperty(ModelScope,  "last", function(callback) {
      var cursor;
      cursor = this.compile();
      cursor.reverseSort();
      return cursor.findOne(callback);
    });

    __defineProperty(ModelScope,  "all", function(callback) {
      return this.compile().all(callback);
    });

    __defineProperty(ModelScope,  "toArray", function() {
      return this.all().toArray();
    });

    __defineProperty(ModelScope,  "pluck", function() {
      var attributes;
      attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.compile().find(callback);
    });

    __defineProperty(ModelScope,  "explain", function() {
      return this.compile().explain(callback);
    });

    __defineProperty(ModelScope,  "count", function(callback) {
      return this.compile().count(callback);
    });

    __defineProperty(ModelScope,  "exists", function(callback) {
      return this.compile().exists(callback);
    });

    __defineProperty(ModelScope,  "fetch", function(callback) {
      return this.compile().fetch(callback);
    });

    __defineProperty(ModelScope,  "batch", function() {
      return this;
    });

    __defineProperty(ModelScope,  "options", function(options) {
      return _.extend(this.cursor.options, options);
    });

    __defineProperty(ModelScope,  "compile", function(cloneContent) {
      if (cloneContent == null) {
        cloneContent = true;
      }
      return this.cursor.clone(cloneContent);
    });

    __defineProperty(ModelScope,  "toCursor", function() {
      return this.compile();
    });

    __defineProperty(ModelScope,  "toJSON", function() {
      return this.cursor.toParams();
    });

    __defineProperty(ModelScope,  "clone", function() {
      return new this.constructor(this.cursor.clone(false));
    });

    return ModelScope;

  })();

  _ref = Tower.ModelScope.queryMethods;
  _fn = function(key) {
    return Tower.ModelScope.prototype[key] = function() {
      var clone, _ref1;
      clone = this.clone();
      (_ref1 = clone.cursor)[key].apply(_ref1, arguments);
      return clone;
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    _fn(key);
  }

  _ = Tower._;

  Tower.ModelMassAssignment = {
    ClassMethods: {
      readOnly: function() {
        var keys;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      },
      readOnlyAttributes: function() {},
      "protected": function() {
        return this._attributeAssignment.apply(this, ['protected'].concat(__slice.call(arguments)));
      },
      protectedAttributes: function() {
        var array, blacklist;
        if (this._protectedAttributes) {
          return this._protectedAttributes;
        }
        array = ['id'];
        blacklist = {
          'default': array
        };
        blacklist._deny = function(key) {
          return key === 'id' || _.include(this, key);
        };
        array.deny = blacklist._deny;
        blacklist;

        return this._protectedAttributes = blacklist;
      },
      accessibleAttributes: function() {
        var whitelist;
        if (this._attributeAssignment) {
          return this._attributeAssignment;
        }
        whitelist = {};
        whitelist._deny = function(key) {
          return key === 'id' || !_.include(this, key);
        };
        whitelist;

        return this._accessibleAttributes = whitelist;
      },
      activeAuthorizer: function() {
        return this._activeAuthorizer || (this._activeAuthorizer = this.protectedAttributes());
      },
      accessible: function() {
        return this._attributeAssignment.apply(this, ['accessible'].concat(__slice.call(arguments)));
      },
      _attributeAssignment: function(type) {
        var args, assignments, attributes, options, role, roles, _j, _len1;
        args = _.args(arguments, 1);
        options = _.extractOptions(args);
        roles = _.castArray(options.as || 'default');
        assignments = this["" + type + "Attributes"]();
        for (_j = 0, _len1 = roles.length; _j < _len1; _j++) {
          role = roles[_j];
          attributes = assignments[role];
          if (attributes) {
            attributes = attributes.concat(args);
          } else {
            attributes = args;
          }
          attributes.deny = assignments._deny;
          assignments[role] = attributes;
        }
        this._activeAuthorizer = assignments;
        return this;
      }
    },
    _sanitizeForMassAssignment: function(attributes, role) {
      var authorizer, rejected, sanitizedAttributes, _j, _len1, _ref1;
      if (role == null) {
        role = 'default';
      }
      rejected = [];
      authorizer = this.constructor.activeAuthorizer()[role];
      sanitizedAttributes = {};
      _ref1 = _.keys(attributes);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        key = _ref1[_j];
        if (authorizer.deny(key)) {
          rejected.push(key);
        } else {
          sanitizedAttributes[key] = attributes[key];
        }
      }
      if (!_.isEmpty(rejected)) {
        this._processRemovedAttributes(rejected);
      }
      return sanitizedAttributes;
    },
    _processRemovedAttributes: function(keys) {}
  };

  _ = Tower._;

  Tower.ModelAuthentication = {
    ClassMethods: {
      authenticated: function() {
        this.field('passwordDigest');
        this.field('passwordSalt');
        this.field('lastLoginAt', {
          type: 'Date'
        });
        this.field('lastLoginAt', {
          type: 'Date'
        });
        this.validates('passwordDigest', {
          presence: true
        });
        this["protected"]('passwordDigest', 'passwordSalt');
        return this.include(Tower.ModelAuthentication._InstanceMethods);
      }
    },
    _InstanceMethods: {
      authenticate: function(unencryptedPassword, callback) {
        if (this._encryptedPassword(unencryptedPassword) === this.get('passwordDigest')) {
          this.updateAttributes({
            lastLoginAt: new Date
          }, callback);
          return true;
        } else {
          if (callback) {
            callback.call(this, new Error('Invalid password'));
          }
          return false;
        }
      },
      _encryptedPassword: function(unencryptedPassword) {
        return require('crypto').createHmac('sha1', this.get('passwordSalt')).update(unencryptedPassword).digest('hex');
      },
      _generatePasswordSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()).toString();
      },
      _setPasswordDigest: function(password) {
        password || (password = this.get('password'));
        if (password) {
          this.set('passwordSalt', this._generatePasswordSalt());
          this.set('passwordDigest', this._encryptedPassword(password));
        }
        return true;
      }
    }
  };

  _ = Tower._;

  Tower.ModelCursor = (function(_super) {
    var ModelCursor;

    function ModelCursor() {
      return ModelCursor.__super__.constructor.apply(this, arguments);
    }

    ModelCursor = __extends(ModelCursor, _super);

    ModelCursor.reopenClass({
      make: function() {
        var cursor;
        cursor = this.create();
        cursor.set('content', Ember.A([]));
        return cursor;
      }
    });

    ModelCursor.reopen({
      defaultLimit: 20,
      isCursor: true
    });

    return ModelCursor;

  })(Tower.Collection);

  Tower.ModelCursor.toString = function() {
    return 'Tower.ModelCursor';
  };

  Tower.ModelCursor.prototype.defaultLimit = 20;

  _ = Tower._;

  Tower.ModelCursorFinders = {
    hasFirstPage: false,
    hasPreviousPage: false,
    hasNextPage: false,
    hasLastPage: false,
    isEmpty: true,
    totalCount: 0,
    totalPageCount: 0,
    currentPage: 0,
    firstPage: function() {
      this.page(1);
      return this;
    },
    lastPage: function() {
      this.page(this.totalPageCount);
      return this;
    },
    nextPage: function() {
      this.page(this.currentPage + 1);
      return this;
    },
    previousPage: function() {
      this.page(this.currentPage - 1);
      return this;
    },
    all: function(callback) {
      delete this.returnArray;
      return this.find(callback);
    },
    find: function(callback) {
      return this._find(callback);
    },
    findOne: function(callback) {
      this.limit(1);
      this.returnArray = false;
      return this.find(callback);
    },
    count: function(callback) {
      return this._count(callback);
    },
    exists: function(callback) {
      return this._exists(callback);
    },
    fetch: function(callback) {
      return this.store.fetch(this, callback);
    },
    mergeCreatedRecords: function(records) {
      return this.pushMatching(records);
    },
    mergeUpdatedRecords: function(records) {
      this.pushMatching(records);
      return this.pullNotMatching(records);
    },
    mergeDeletedRecords: function(records) {
      return this.pullMatching(records);
    },
    pushMatching: function(records) {
      var item, matching, _j, _len1;
      if (records.length === 0 || records[0].constructor.toString() !== this.store.className) {
        return [];
      }
      matching = Tower.StoreOperators.select(records, this.conditions());
      Ember.beginPropertyChanges(this);
      for (_j = 0, _len1 = matching.length; _j < _len1; _j++) {
        item = matching[_j];
        if (!this.contains(item)) {
          this.addObject(item);
        }
      }
      Ember.endPropertyChanges(this);
      return matching;
    },
    pullMatching: function(records) {
      var matching;
      if (records.length === 0 || records[0].constructor.toString() !== this.store.className) {
        return [];
      }
      matching = Tower.StoreOperators.select(records, this.conditions());
      this.removeObjects(matching);
      return matching;
    },
    pullNotMatching: function(records) {
      var notMatching;
      if (records.length === 0 || records[0].constructor.toString() !== this.store.className) {
        return [];
      }
      notMatching = Tower.StoreOperators.notMatching(records, this.conditions());
      this.removeObjects(notMatching);
      return notMatching;
    },
    commit: function() {
      var content;
      Ember.beginPropertyChanges(this);
      content = this.get('content');
      this.mergeUpdatedRecords(content);
      return Ember.endPropertyChanges(this);
    },
    _find: function(callback) {
      var result, returnArray,
        _this = this;
      returnArray = this.returnArray;
      result = void 0;
      if (this.one) {
        this.store.findOne(this, callback);
      } else {
        this.store.find(this, function(error, records) {
          if (records) {
            if (_this.returnArray === false && !records.length) {
              records = null;
            } else {
              if (!error && records.length) {
                records = _this["export"](records);
              }
            }
          }
          result = records;
          if (Tower.isClient) {
            _this.clear();
          }
          if (_.isArray(records)) {
            Ember.setProperties(_this, {
              hasFirstPage: !!records.length,
              hasPreviousPage: !!records.length,
              hasNextPage: !!records.length,
              hasLastPage: !!records.length
            });
            _this.addObjects(records);
          }
          if (callback) {
            callback.call(_this, error, records);
          }
          return records;
        });
      }
      if (returnArray === false) {
        return result;
      } else {
        return this;
      }
    },
    _count: function(callback) {
      var _this = this;
      return this.store.count(this, function(error, count) {
        Ember.set(_this, 'totalCount', count);
        if (callback) {
          return callback.apply(_this, arguments);
        }
      });
    },
    _exists: function(callback) {
      var _this = this;
      return this.store.exists(this, function(error, exists) {
        Ember.set(_this, 'isEmpty', !exists);
        if (callback) {
          return callback.apply(_this, arguments);
        }
      });
    },
    _hasContent: function(callback) {
      var records;
      if (Tower.isClient && this._invalidated) {
        delete this._invalidated;
        if (callback) {
          callback.call(this);
        }
        return false;
      }
      records = Ember.get(this, 'content');
      if (records && records.length) {
        if (callback) {
          callback.call(this, null, records);
        }
        return true;
      } else {
        return false;
      }
    }
  };

  _ref1 = ['Before', 'After'];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    phase = _ref1[_j];
    _ref2 = ['Insert', 'Update', 'Destroy', 'Find'];
    _fn1 = function(phase, action) {
      return Tower.ModelCursorFinders["_run" + phase + action + "CallbacksOnStore"] = function(done, records) {
        return this.store["run" + phase + action](this, done, records);
      };
    };
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      action = _ref2[_k];
      _fn1(phase, action);
    }
  }

  Tower.ModelCursorFinders = Ember.Mixin.create(Tower.ModelCursorFinders);

  _ = Tower._;

  Tower.ModelCursorOperations = Ember.Mixin.create({
    refreshInterval: function(milliseconds) {},
    invalidate: function() {
      return this._invalidated = true;
    },
    joins: function(object) {
      var joins, _l, _len3;
      joins = this._joins;
      if (_.isArray(object)) {
        for (_l = 0, _len3 = object.length; _l < _len3; _l++) {
          key = object[_l];
          joins[key] = true;
        }
      } else if (typeof object === 'string') {
        joins[object] = true;
      } else {
        _.extend(joins, object);
      }
      return joins;
    },
    except: function() {
      return this._except = _.flatten(_.args(arguments));
    },
    "with": function(transaction) {
      return this.transaction = transaction;
    },
    where: function(conditions) {
      var object;
      if (conditions.isCursor) {
        this.merge(conditions);
      } else if (arguments.length === 2) {
        object = {};
        object[arguments[0]] = arguments[1];
        this._where.push(object);
      } else {
        this._where.push(conditions);
      }
      this.invalidate();
      return this;
    },
    order: function(attribute, direction) {
      var value;
      if (direction == null) {
        direction = 'asc';
      }
      value = _.isArray(attribute) ? attribute : [attribute, direction];
      this._order.push(value);
      this.invalidate();
      return this;
    },
    reverseSort: function() {
      var i, order, orderItem, _l, _len3;
      order = this.getCriteria('order');
      if (!order.length) {
        order = this._order = [['createdAt', 'asc']];
      }
      for (i = _l = 0, _len3 = order.length; _l < _len3; i = ++_l) {
        orderItem = order[i];
        orderItem[1] = orderItem[1] === 'asc' ? 'desc' : 'asc';
      }
      order;

      this.invalidate();
      return this;
    },
    asc: function() {
      var attribute, attributes, _l, _len3;
      attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_l = 0, _len3 = attributes.length; _l < _len3; _l++) {
        attribute = attributes[_l];
        this.order(attribute);
      }
      return this;
    },
    desc: function() {
      var attribute, attributes, _l, _len3;
      attributes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_l = 0, _len3 = attributes.length; _l < _len3; _l++) {
        attribute = attributes[_l];
        this.order(attribute, 'desc');
      }
      return this;
    },
    ne: function() {
      return this._whereOperator.apply(this, ['$neq'].concat(__slice.call(arguments)));
    },
    gte: function() {
      return this._whereOperator.apply(this, ['$gte'].concat(__slice.call(arguments)));
    },
    lte: function() {
      return this._whereOperator.apply(this, ['$lte'].concat(__slice.call(arguments)));
    },
    gt: function() {
      return this._whereOperator.apply(this, ['$gt'].concat(__slice.call(arguments)));
    },
    lt: function() {
      return this._whereOperator.apply(this, ['$lt'].concat(__slice.call(arguments)));
    },
    allIn: function() {
      return this._whereOperator.apply(this, ['$all'].concat(__slice.call(arguments)));
    },
    anyIn: function() {
      return this._whereOperator.apply(this, ['$any'].concat(__slice.call(arguments)));
    },
    notIn: function() {
      return this._whereOperator.apply(this, ['$nin'].concat(__slice.call(arguments)));
    },
    offset: function(number) {
      this._offset = number;
      this.invalidate();
      return this;
    },
    limit: function(number) {
      this._limit = number;
      if (number === 1) {
        this.returnArray = false;
      } else {
        delete this.returnArray;
      }
      this.invalidate();
      return this;
    },
    select: function() {
      this._fields = _.flatten(_.args(arguments));
      this.invalidate();
      return this;
    },
    includes: function() {
      this._includes = _.flatten(_.args(arguments));
      this.invalidate();
      return this;
    },
    uniq: function(value) {
      this._uniq = value;
      this.invalidate();
      return this;
    },
    page: function(page) {
      var limit;
      this.limit(this._limit || Tower.ModelCursor.prototype.defaultLimit);
      limit = this.getCriteria('limit');
      Ember.set(this, 'currentPage', page);
      return this.offset((Math.max(1, page) - 1) * limit);
    },
    near: function(coordinates) {
      return this.where({
        coordinates: {
          $near: coordinates
        }
      });
    },
    within: function(bounds) {
      return this.where({
        coordinates: {
          $maxDistance: bounds
        }
      });
    },
    test: function(record) {
      return Tower.StoreOperators.test(record, this.conditions());
    },
    testEach: function(records, callback) {
      var conditions;
      conditions = this.conditions();
      delete conditions.type;
      return Tower.StoreOperators.testEach(records, conditions, callback);
    },
    eagerLoad: function(records, callback) {
      var eagerLoad, hash, includes, item, keys, _l, _len3, _ref3,
        _this = this;
      if (!(records && records.length)) {
        return callback();
      }
      includes = this.getCriteria('includes');
      if (_.isBlank(includes)) {
        return callback();
      }
      hash = {};
      _ref3 = _.flatten(includes);
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        item = _ref3[_l];
        if (typeof item === 'string') {
          hash[item] = null;
        } else {
          _.extend(hash, item);
        }
      }
      keys = _.keys(hash);
      eagerLoad = function(key, done) {
        var childKeys, ids, relation, scope;
        childKeys = hash[key];
        relation = _this.model.relations()[key];
        if (relation.isHasOne) {
          ids = records.getEach('id');
          scope = relation.klass().anyIn(relation.foreignKey, ids);
          if (childKeys) {
            scope = scope.includes(childKeys);
          }
          return scope.all(function(error, associated) {
            var record, _len4, _len5, _m, _n;
            for (_m = 0, _len4 = records.length; _m < _len4; _m++) {
              record = records[_m];
              for (_n = 0, _len5 = associated.length; _n < _len5; _n++) {
                item = associated[_n];
                if (record.get('id').toString() === item.get(relation.foreignKey).toString()) {
                  record.set(relation.name, item);
                }
              }
            }
            return done();
          });
        } else if (relation.isHasMany && !relation.isHasManyThrough) {
          ids = records.getEach('id');
          scope = relation.klass().anyIn(relation.foreignKey, ids);
          if (childKeys) {
            scope = scope.includes(childKeys);
          }
          return scope.all(function(error, associated) {
            var matches, record, _len4, _len5, _m, _n;
            for (_m = 0, _len4 = records.length; _m < _len4; _m++) {
              record = records[_m];
              matches = [];
              for (_n = 0, _len5 = associated.length; _n < _len5; _n++) {
                item = associated[_n];
                if (record.get('id').toString() === item.get(relation.foreignKey).toString()) {
                  matches.push(item);
                }
              }
              record.get(relation.name).load(matches);
            }
            return done();
          });
        } else {
          ids = records.getEach(relation.foreignKey);
          scope = relation.klass().anyIn({
            id: ids
          });
          if (childKeys) {
            scope = scope.includes(childKeys);
          }
          return scope.all(function(error, associated) {
            var record, _len4, _len5, _m, _n;
            for (_m = 0, _len4 = records.length; _m < _len4; _m++) {
              record = records[_m];
              for (_n = 0, _len5 = associated.length; _n < _len5; _n++) {
                item = associated[_n];
                if (record.get(relation.foreignKey).toString() === item.get('id').toString()) {
                  record.set(relation.name, item);
                }
              }
            }
            return done();
          });
        }
      };
      return Tower.parallel(keys, eagerLoad, callback);
    },
    _whereOperator: function(operator, attributes) {
      var attrs, query, value;
      query = {};
      if (typeof attributes === 'string') {
        attrs = {};
        attrs[arguments[1]] = arguments[2];
        attributes = attrs;
      }
      for (key in attributes) {
        value = attributes[key];
        query[key] = {};
        query[key][operator] = value;
      }
      return this.where(query);
    }
  });

  Tower.ModelCursorOperations.sort = Tower.ModelCursorOperations.order;

  _ = Tower._;

  Tower.ModelCursorPersistence = Ember.Mixin.create({
    build: function(callback) {
      return this._build(callback);
    },
    insert: function(callback) {
      return this._insert(callback);
    },
    update: function(callback) {
      return this._update(callback);
    },
    destroy: function(callback) {
      return this._destroy(callback);
    },
    findOrCreate: function(callback) {},
    add: function(callback) {},
    remove: function(callback) {},
    _build: function(callback) {
      var attributes, data, item, result, store, _l, _len3;
      store = this.store;
      attributes = this.attributes();
      data = this.data || (this.data = []);
      if (!data.length) {
        data.push({});
      }
      result = [];
      for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
        item = data[_l];
        if (item instanceof Tower.Model) {
          item.setProperties(attributes);
        } else {
          item = store.serializeModel(_.extend({}, attributes, item));
        }
        result.push(item);
      }
      result = this.returnArray ? result : result[0];
      if (callback) {
        callback.call(this, null, result);
      }
      return result;
    },
    _insert: function(callback) {
      var iterator, records, returnArray,
        _this = this;
      records = void 0;
      if (this.instantiate) {
        returnArray = this.returnArray;
        this.returnArray = true;
        records = this.build();
        this.returnArray = returnArray;
        iterator = function(record, next) {
          if (record) {
            return record.save(next);
          } else {
            return next();
          }
        };
        Tower.async(records, iterator, function(error) {
          if (!callback) {
            if (error) {
              throw error;
            }
            if (!returnArray) {
              return records = records[0];
            }
          } else {
            if (error) {
              return callback(error);
            } else {
              if (!returnArray) {
                records = records[0];
              }
              return callback(error, records);
            }
          }
        });
      } else {
        this.store.insert(this, function(error, result) {
          records = result;
          if (!error) {
            Tower.notifyConnections('create', records);
          }
          if (callback) {
            return callback.call(_this, error, records);
          }
        });
      }
      if (Tower.isClient) {
        return records;
      } else {
        return this;
      }
    },
    _update: function(callback) {
      var iterator, records, updates,
        _this = this;
      updates = this.data[0];
      records = void 0;
      if (this.instantiate) {
        this.returnArray = true;
        iterator = function(record, next) {
          return record.updateAttributes(updates, next);
        };
        this._each(this, iterator, function(error, result) {
          records = result;
          if (callback) {
            callback.call(_this, error, records);
          }
          return records;
        });
      } else {
        this.store.update(updates, this, function(error, result) {
          records = _this.data[0];
          if (!error) {
            Tower.notifyConnections('update', _this.data);
          }
          if (callback) {
            return callback.call(_this, error, records);
          }
        });
      }
      return records;
    },
    _destroy: function(callback) {
      var iterator, records,
        _this = this;
      records = void 0;
      if (this.instantiate) {
        this.returnArray = true;
        iterator = function(record, next) {
          Tower.notifyConnections('destroy', [record]);
          return record.destroy(next);
        };
        this._each(this, iterator, function(error, result) {
          records = result;
          if (callback) {
            callback.call(_this, error, records);
          }
          return records;
        });
      } else {
        this.model.where({
          id: {
            $in: this.ids
          }
        }).select('id').all(function(error, recordsWithOnlyIds) {
          return _this.store.destroy(_this, function(error, records) {
            if (!error) {
              Tower.notifyConnections('destroy', recordsWithOnlyIds);
            }
            if (callback) {
              return callback.call(_this, error, records);
            }
          });
        });
      }
      return this;
    }
  });

  _ = Tower._;

  Tower.ModelCursorSerialization = Ember.Mixin.create({
    isCursor: true,
    make: function(options) {
      if (options == null) {
        options = {};
      }
      _.extend(this, options);
      this.model || (this.model = options.model);
      this.store = this.model ? this.model.store() : void 0;
      this.instantiate = options.instantiate !== false;
      this._where = options.where || [];
      this._joins = options.joins || {};
      this._order = this._array(options.order);
      this._data = this._array(options.data);
      this._except = this._array(options.except, true);
      this._includes = this._array(options.includes, true);
      this._offset = options.offset;
      this._limit = options.limit;
      this._fields = options.fields;
      this._uniq = options.uniq;
      this._eagerLoad = options.eagerLoad || {};
      this._near = options.near;
      return Ember.set(this, 'content', Ember.A([]));
    },
    getCriteria: function(key) {
      return this["_" + key];
    },
    observableFields: Ember.computed(function() {
      var data, fields, orderItem, _l, _len3, _ref3;
      data = this.toParams();
      fields = [];
      if (data.sort) {
        _ref3 = data.sort;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          orderItem = _ref3[_l];
          fields.push(orderItem[0]);
        }
      }
      fields = _.uniq(fields.concat(_.keys(data.conditions)));
      return fields;
    }).cacheable(),
    observableTypes: Ember.computed(function() {
      return [this.model.className()];
    }).cacheable(),
    observable: function(falseFlag) {
      if (falseFlag === false) {
        Tower.removeCursor(this);
      } else {
        Tower.addCursor(this);
      }
      return this;
    },
    "export": function(result) {
      if (this.returnArray === false) {
        result = result[0];
      }
      delete this.data;
      delete this.returnArray;
      return result;
    },
    addData: function(args) {
      if (args.length && args.length > 1 || _.isArray(args[0])) {
        this.data = _.flatten(args);
        return this.returnArray = true;
      } else {
        this.data = _.flatten([args]);
        return this.returnArray = false;
      }
    },
    addIds: function(args) {
      var id, ids, object, _l, _len3;
      ids = this.ids || (this.ids = []);
      if (args.length) {
        for (_l = 0, _len3 = args.length; _l < _len3; _l++) {
          object = args[_l];
          if (object == null) {
            continue;
          }
          id = object instanceof Tower.Model ? object.get('id') : object;
          if (ids.indexOf(id) === -1) {
            ids.push(id);
          }
        }
      }
      return ids;
    },
    has: function(object) {
      return false;
    },
    compile: function() {},
    explain: function(callback) {},
    clone: function(cloneContent) {
      var clone, content;
      if (cloneContent == null) {
        cloneContent = true;
      }
      clone = this.constructor.create();
      if (cloneContent) {
        content = Ember.get(this, 'content') || Ember.A([]);
        if (content) {
          clone.setProperties({
            content: content
          });
        }
      }
      clone.make({
        model: this.model,
        instantiate: this.instantiate
      });
      clone.merge(this);
      return clone;
    },
    load: function(records) {
      return Ember.set(this, 'content', records);
    },
    reset: function() {
      return Ember.set(this, 'content', []);
    },
    refresh: function(callback) {
      this.reset();
      return this.all(callback);
    },
    stringify: function(pretty) {
      return _.stringify(this, pretty);
    },
    merge: function(cursor) {
      this._where = this._where.concat(cursor._where);
      this._order = this._order.concat(cursor._order);
      this._offset = cursor._offset;
      this._limit = cursor._limit;
      this._fields = cursor._fields;
      this._except = cursor._except;
      if (cursor._includes && cursor._includes.length) {
        this._includes = cursor._includes;
      }
      this.currentPage = cursor.currentPage;
      this._joins = _.extend({}, cursor._joins);
      this._eagerLoad = _.extend({}, cursor._eagerLoad);
      this._near = cursor._near;
      this.returnArray = cursor.returnArray;
      return this;
    },
    toParams: function() {
      var conditions, data, includes, limit, operator, operators, page, sort, value, _key, _value;
      data = {};
      sort = this._order;
      conditions = this.conditions();
      page = this.currentPage;
      limit = this._limit;
      includes = this._includes;
      if (sort && sort.length) {
        data.sort = sort;
      }
      operators = Tower.StoreOperators.MAP;
      if (conditions) {
        for (key in conditions) {
          value = conditions[key];
          if (_.isRegExp(value)) {
            conditions[key] = {
              '=~': value.source
            };
          } else if (_.isHash(value)) {
            for (_key in value) {
              _value = value[_key];
              if (operator = operators[_key] && _.isRegExp(_value)) {
                if (operator === '$notMatch') {
                  delete value[_key];
                  value['=~'] === ("^.*(?!" + _value.source + ").*$");
                } else {
                  value[_key] = _value.source;
                }
              }
            }
          }
        }
        data.conditions = conditions;
      }
      if (page) {
        data.page = page;
      }
      if (limit && limit) {
        data.limit = limit;
      }
      if (includes && includes.length) {
        data.includes = includes;
      }
      return data;
    },
    conditions: function() {
      var conditions, ids, result, _l, _len3, _ref3;
      result = {};
      _ref3 = this._where;
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        conditions = _ref3[_l];
        _.deepMergeWithArrays(result, conditions);
      }
      if (this.ids && this.ids.length) {
        delete result.id;
        if (this.ids.length === 1) {
          this.returnArray = false;
        } else {
          this.returnArray = true;
        }
        ids = this.ids;
        result.id = {
          $in: ids
        };
      }
      return result;
    },
    attributes: function() {
      var attributes, conditions, value, _key, _l, _len3, _ref3, _value;
      attributes = {};
      _ref3 = this._where;
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        conditions = _ref3[_l];
        for (key in conditions) {
          value = conditions[key];
          if (Tower.Store.isKeyword(key)) {
            for (_key in value) {
              _value = value[_key];
              attributes[_key] = _value;
            }
          } else if (_.isHash(value) && value.constructor.name === 'Object' && Tower.Store.hasKeyword(value)) {
            for (_key in value) {
              _value = value[_key];
              attributes[key] = _value;
            }
          } else {
            attributes[key] = value;
          }
        }
      }
      for (key in attributes) {
        value = attributes[key];
        if (value === void 0) {
          delete attributes[key];
        }
      }
      return attributes;
    },
    _compileAttributes: function(object, conditions) {
      var oldValue, value, _results;
      _results = [];
      for (key in conditions) {
        value = conditions[key];
        oldValue = result[key];
        if (oldValue) {
          if (_.isArray(oldValue)) {
            _results.push(object[key] = oldValue.concat(value));
          } else if (typeof oldValue === 'object' && typeof value === 'object') {
            _results.push(object[key] = _.deepMergeWithArrays(object[key], value));
          } else {
            _results.push(object[key] = value);
          }
        } else {
          _results.push(object[key] = value);
        }
      }
      return _results;
    },
    _each: function(cursor, iterator, callback) {
      var data,
        _this = this;
      data = !!cursor.data;
      return this.store.find(cursor, function(error, records) {
        if (error) {
          return callback.call(_this, error, records);
        } else {
          return Tower.parallel(records, iterator, function(error) {
            if (!callback) {
              if (error) {
                throw error;
              }
            } else {
              if (callback) {
                return callback.call(_this, error, _this["export"](records));
              }
            }
          });
        }
      });
    },
    _array: function(existing, orNull) {
      if (existing && existing.length) {
        return existing.concat();
      } else {
        if (orNull) {
          return null;
        } else {
          return [];
        }
      }
    }
  });

  Tower.ModelCursorMixin = Ember.Mixin.create(Tower.ModelCursorFinders, Tower.ModelCursorOperations, Tower.ModelCursorPersistence, Tower.ModelCursorSerialization);

  Tower.ModelCursor.reopen(Tower.ModelCursorMixin);

  _ = Tower._;

  Tower.ModelDirty = {
    changes: Ember.computed(function() {
      var attributes, injectChange,
        _this = this;
      attributes = this.get('attributes');
      injectChange = function(memo, value, key) {
        memo[key] = [value, _this.getAttribute(key)];
        return memo;
      };
      return _.inject(this.get('changedAttributes'), injectChange, {});
    }).volatile(),
    dirtyAttributes: Ember.computed(function() {
      if (this.get('isNew')) {
        return this.attributesForCreate();
      } else {
        return this.attributesForUpdate();
      }
    }).volatile(),
    changedAttributes: Ember.computed(function(key, value) {
      return {};
    }).cacheable(),
    changed: Ember.computed(function() {
      return _.keys(this.get('changedAttributes'));
    }).volatile(),
    attributeChanged: function(name) {
      return this.get('changedAttributes').hasOwnProperty(name);
    },
    attributeChange: function(name) {
      if (this.attributeChanged(name)) {
        return [this.get('changedAttributes')[name], this.get('attributes')[name]];
      }
    },
    attributeWas: function(name) {
      return this.get('changedAttributes')[name];
    },
    resetAttribute: function(key) {
      var attributes, changedAttributes, value;
      changedAttributes = this.get('changedAttributes');
      attributes = this.get('attributes');
      if (changedAttributes.hasOwnProperty(key)) {
        value = changedAttributes[key];
      } else {
        value = this._defaultValue(key);
      }
      return this.set(key, value);
    },
    attributesForCreate: function() {
      return this._attributesForPersistence(this.attributeKeysForCreate());
    },
    attributesForUpdate: function(keys) {
      return this._attributesForPersistence(this.attributeKeysForUpdate(keys));
    },
    attributeKeysForCreate: function() {
      var attributes, primaryKey, result, value;
      primaryKey = 'id';
      attributes = this.get('attributes');
      result = [];
      for (key in attributes) {
        value = attributes[key];
        if (!(key === primaryKey || typeof value === 'undefined')) {
          result.push(key);
        }
      }
      return result;
    },
    attributeKeysForUpdate: function(keys) {
      var primaryKey;
      primaryKey = 'id';
      keys || (keys = _.keys(this.get('changedAttributes')));
      return _.select(keys, function(key) {
        return key !== primaryKey;
      });
    },
    _updateChangedAttribute: function(key, value) {
      var attributes, changedAttributes, old;
      changedAttributes = this.get('changedAttributes');
      attributes = this.get('attributes');
      if (changedAttributes.hasOwnProperty(key)) {
        if (_.isEqual(changedAttributes[key], value)) {
          return delete changedAttributes[key];
        }
      } else {
        old = this._clonedValue(attributes[key]);
        if (!_.isEqual(old, value)) {
          return changedAttributes[key] = old;
        }
      }
    },
    _attributesForPersistence: function(keys) {
      var attributes, result, _l, _len3;
      result = {};
      attributes = this.get('attributes');
      for (_l = 0, _len3 = keys.length; _l < _len3; _l++) {
        key = keys[_l];
        result[key] = attributes[key];
      }
      return result;
    },
    _clonedValue: function(value) {
      if (_.isArray(value)) {
        return value.concat();
      } else if (_.isDate(value)) {
        return new Date(value.getTime());
      } else if (typeof value === 'object') {
        return _.clone(value);
      } else {
        return value;
      }
    },
    _defaultValue: function(key) {
      var field;
      if (field = this._getField(key)) {
        return field.defaultValue(this);
      }
    },
    _getField: function(key) {
      return this.constructor.fields()[key];
    }
  };

  _ = Tower._;

  Tower.ModelIndexing = {
    ClassMethods: {
      index: function(name, options) {
        if (options == null) {
          options = {};
        }
        this.store().addIndex(name);
        return this.indexes()[name] = options;
      },
      indexes: function() {
        return this.metadata().indexes;
      }
    }
  };

  _ = Tower._;

  Tower.ModelInheritance = {
    _computeType: function() {}
  };

  _ = Tower._;

  Tower.ModelMetadata = {
    ClassMethods: {
      isModel: true,
      baseClass: function() {
        if (this.__super__ && this.__super__.constructor.baseClass && this.__super__.constructor !== Tower.Model) {
          return this.__super__.constructor.baseClass();
        } else {
          return this;
        }
      },
      parentClass: function() {
        if (this.__super__ && this.__super__.constructor.parentClass) {
          return this.__super__.constructor;
        } else {
          return this;
        }
      },
      isSubClass: function() {
        return this.baseClass().className() !== this.className();
      },
      toParam: function() {
        if (this === Tower.Model) {
          return void 0;
        }
        return this.metadata().paramNamePlural;
      },
      toKey: function() {
        return this.metadata().paramName;
      },
      url: function(options) {
        var url;
        return this._url = (function() {
          switch (typeof options) {
            case 'object':
              if (options.parent) {
                return url = "/" + (_.parameterize(_.pluralize(options.parent))) + "/:" + (_.camelize(options.parent, true)) + "/" + (this.toParam());
              }
              break;
            default:
              return options;
          }
        }).call(this);
      },
      defaults: function(object) {
        var value;
        if (object) {
          for (key in object) {
            value = object[key];
            this["default"](key, value);
          }
        }
        return this.metadata().defaults;
      },
      "default": function(key, value) {
        var method;
        if (arguments.length === 1) {
          return this.metadata().defaults[key];
        } else {
          method = "_setDefault" + (_.camelize(key));
          if (this[method]) {
            return this[method](value);
          } else {
            return this.metadata().defaults[key] = value;
          }
        }
      },
      metadata: function() {
        var baseClassName, callbacks, className, classNamePlural, controllerName, defaults, fields, indexes, metadata, modelName, name, namePlural, namespace, paramName, paramNamePlural, relations, superMetadata, validators;
        this._metadata || (this._metadata = {});
        className = this.className();
        metadata = this._metadata[className];
        if (metadata) {
          return metadata;
        }
        baseClassName = this.parentClass().className();
        if (baseClassName !== className) {
          superMetadata = this.parentClass().metadata();
        } else {
          superMetadata = {};
        }
        name = _.camelize(className, true);
        namePlural = _.pluralize(name);
        classNamePlural = _.pluralize(className);
        paramName = _.parameterize(name);
        paramNamePlural = _.parameterize(namePlural);
        if (baseClassName !== className) {
          namespace = Tower.namespace();
          modelName = "" + namespace + "." + className;
          controllerName = "" + namespace + "." + classNamePlural + "Controller";
        }
        fields = superMetadata.fields ? _.clone(superMetadata.fields) : {};
        indexes = superMetadata.indexes ? _.clone(superMetadata.indexes) : {};
        validators = superMetadata.validators ? _.clone(superMetadata.validators) : [];
        relations = superMetadata.relations ? _.clone(superMetadata.relations) : {};
        defaults = superMetadata.defaults ? _.clone(superMetadata.defaults) : {};
        callbacks = superMetadata.callbacks ? _.clone(superMetadata.callbacks) : {};
        return this._metadata[className] = {
          name: name,
          namePlural: namePlural,
          className: className,
          classNamePlural: classNamePlural,
          paramName: paramName,
          paramNamePlural: paramNamePlural,
          modelName: modelName,
          controllerName: controllerName,
          indexes: indexes,
          validators: validators,
          fields: fields,
          relations: relations,
          defaults: defaults,
          callbacks: callbacks
        };
      },
      _setDefaultScope: function(scope) {
        var defaults;
        defaults = this.metadata().defaults;
        if (scope instanceof Tower.ModelScope) {
          return defaults.scope = scope;
        } else if (scope) {
          return defaults.scope = this.where(scope);
        } else {
          return delete defaults.scope;
        }
      },
      callbacks: function() {
        return this.metadata().callbacks;
      }
    },
    InstanceMethods: {
      toLabel: function() {
        return this.metadata().className;
      },
      toPath: function() {
        var param, result;
        result = this.constructor.toParam();
        if (result === void 0) {
          return '/';
        }
        param = this.toParam();
        if (param) {
          result += "/" + param;
        }
        return result;
      },
      toParam: function() {
        var id;
        id = this.get('id');
        if (id != null) {
          return String(id);
        } else {
          return null;
        }
      },
      toKey: function() {
        return this.constructor.tokey();
      },
      toCacheKey: function() {},
      metadata: function() {
        return this.constructor.metadata();
      },
      toString: function() {
        var array, attributes, result, value;
        attributes = this.get('attributes');
        array = [];
        if (attributes.hasOwnProperty('id')) {
          array.push("id=" + (JSON.stringify(attributes.id)));
          delete attributes.id;
        }
        result = [];
        for (key in attributes) {
          value = attributes[key];
          result.push("" + key + "=" + (JSON.stringify(value)));
        }
        result = array.concat(result.sort()).join(', ');
        return "#<" + (this.constructor.toString()) + ":" + (Ember.guidFor(this)) + " " + result + ">";
      }
    }
  };

  _ = Tower._;

  Tower.ModelRelation = (function(_super) {
    var ModelRelation;

    function ModelRelation() {
      return ModelRelation.__super__.constructor.apply(this, arguments);
    }

    ModelRelation = __extends(ModelRelation, _super);

    ModelRelation.reopen({
      isCollection: false,
      init: function(owner, name, options) {
        var value;
        if (options == null) {
          options = {};
        }
        this._super();
        for (key in options) {
          value = options[key];
          this[key] = value;
        }
        this.owner = owner;
        this.name = name;
        return this.initialize(options);
      },
      initialize: function(options) {
        var className, name, owner;
        owner = this.owner;
        name = this.name;
        className = owner.className();
        this.type = Tower.namespaced(options.type || _.camelize(_.singularize(name)));
        this.ownerType = Tower.namespaced(className);
        this.dependent || (this.dependent = false);
        this.counterCache || (this.counterCache = false);
        if (!this.hasOwnProperty('idCache')) {
          this.idCache = false;
        }
        if (!this.hasOwnProperty('readonly')) {
          this.readonly = false;
        }
        if (!this.hasOwnProperty('validate')) {
          this.validate = this.autosave === true;
        }
        if (!this.hasOwnProperty('touch')) {
          this.touch = false;
        }
        this.inverseOf || (this.inverseOf = void 0);
        this.polymorphic = options.hasOwnProperty('as') || !!options.polymorphic;
        if (!this.hasOwnProperty('default')) {
          this["default"] = false;
        }
        this.singularName = _.camelize(className, true);
        this.pluralName = _.pluralize(className);
        this.singularTargetName = _.singularize(name);
        this.pluralTargetName = _.pluralize(name);
        this.targetType = this.type;
        this.primaryKey = 'id';
        if (!this.hasOwnProperty('autobuild')) {
          this.autobuild = false;
        }
        if (!this.foreignKey) {
          if (this.as) {
            this.foreignKey = "" + this.as + "Id";
          } else {
            if (this.className().match('BelongsTo')) {
              this.foreignKey = "" + this.singularTargetName + "Id";
            } else {
              this.foreignKey = "" + this.singularName + "Id";
            }
          }
        }
        if (this.polymorphic) {
          this.foreignType || (this.foreignType = "" + this.as + "Type");
        }
        if (this.idCache) {
          if (typeof this.idCache === 'string') {
            this.idCacheKey = this.idCache;
            this.idCache = true;
          } else {
            this.idCacheKey = "" + this.singularTargetName + "Ids";
          }
          this.owner.field(this.idCacheKey, {
            type: 'Array',
            "default": []
          });
        }
        if (this.counterCache) {
          if (typeof this.counterCache === 'string') {
            this.counterCacheKey = this.counterCache;
            this.counterCache = true;
          } else {
            this.counterCacheKey = "" + this.singularTargetName + "Count";
          }
          this.owner.field(this.counterCacheKey, {
            type: 'Integer',
            "default": 0
          });
        }
        this._defineRelation(name);
        return this.owner._addAutosaveAssociationCallbacks(this);
      },
      _defineRelation: function(name) {
        var association, isHasMany, object;
        object = {};
        isHasMany = !this.className().match(/HasOne|BelongsTo/);
        this.relationType = isHasMany ? 'collection' : 'singular';
        object[name + 'AssociationScope'] = Ember.computed(function(key) {
          return this.constructor.relation(name).scoped(this);
        }).cacheable();
        association = this;
        if (isHasMany) {
          object[name] = Ember.computed(function(key, value) {
            if (arguments.length === 2) {
              return this._setHasManyAssociation(key, value, association);
            } else {
              return this._getHasManyAssociation(name);
            }
          }).property('data').cacheable();
        } else {
          if (this.className().match('BelongsTo')) {
            object[name] = Ember.computed(function(key, value) {
              if (arguments.length === 2) {
                return this._setBelongsToAssociation(key, value, association);
              } else {
                return this._getBelongsToAssociation(key);
              }
            }).property('data', "" + name + "Id").cacheable();
          } else {
            object[name] = Ember.computed(function(key, value) {
              if (arguments.length === 2) {
                return this._setHasOneAssociation(key, value, association);
              } else {
                return this._getHasOneAssociation(key);
              }
            }).property('data').cacheable();
          }
        }
        return this.owner.reopen(object);
      },
      scoped: function(record) {
        var attributes, cursor, klass, polymorphicBelongsTo, type;
        cursor = Tower[this.constructor.className() + 'Cursor'].make();
        attributes = {
          owner: record,
          relation: this
        };
        polymorphicBelongsTo = this.polymorphic && this.className().match(/BelongsTo/);
        if (!polymorphicBelongsTo) {
          attributes.model = this.klass();
        }
        cursor.make(attributes);
        klass = (function() {
          try {
            return this.targetKlass();
          } catch (_error) {}
        }).call(this);
        if (polymorphicBelongsTo) {
          type = record.get(this.foreignType);
          if (type != null) {
            cursor.model = Tower.constant(type);
            cursor.store = cursor.model.store();
          }
        } else {
          if (klass && klass.shouldIncludeTypeInScope()) {
            cursor.where({
              type: klass.className()
            });
          }
        }
        return new Tower.ModelScope(cursor);
      },
      targetKlass: function() {
        return Tower.constant(this.targetType);
      },
      klass: function() {
        return Tower.constant(this.type);
      },
      inverse: function(type) {
        var name, relation, relations;
        if (this._inverse) {
          return this._inverse;
        }
        relations = this.targetKlass().relations();
        if (this.inverseOf) {
          return relations[this.inverseOf];
        } else {
          for (name in relations) {
            relation = relations[name];
            if (relation.inverseOf === this.name) {
              return relation;
            }
          }
          for (name in relations) {
            relation = relations[name];
            if (relation.targetType === this.ownerType) {
              return relation;
            }
          }
        }
        return null;
      },
      _setForeignKey: function() {},
      _setForeignType: function() {}
    });

    return ModelRelation;

  })(Tower.Class);

  Tower.ModelRelationCursorMixin = Ember.Mixin.create({
    isConstructable: function() {
      return !!!this.relation.polymorphic;
    },
    isLoaded: false,
    clone: function(cloneContent) {
      var clone, content;
      if (cloneContent == null) {
        cloneContent = true;
      }
      clone = this.constructor.make();
      if (cloneContent) {
        content = Ember.get(this, 'content') || Ember.A([]);
        if (content) {
          clone.setProperties({
            content: content
          });
        }
      }
      if (!content) {
        clone.setProperties({
          content: Ember.A([])
        });
      }
      clone.make({
        model: this.model,
        owner: this.owner,
        relation: this.relation,
        instantiate: this.instantiate
      });
      clone.merge(this);
      return clone;
    },
    clonePrototype: function() {
      var clone;
      clone = this.concat();
      clone.isCursor = true;
      return Tower.ModelRelationCursorMixin.apply(clone);
    },
    load: function(records) {
      var owner, record, relation, _l, _len3;
      owner = this.owner;
      relation = this.relation.inverse();
      if (!relation) {
        throw new Error("Inverse relation has not been defined for `" + (this.relation.owner.className()) + "." + (_.camelize(this.relation.className(), true)) + "('" + this.relation.name + "')`");
      }
      for (_l = 0, _len3 = records.length; _l < _len3; _l++) {
        record = records[_l];
        record.set(relation.name, owner);
      }
      return this._super(records);
    },
    reset: function() {
      var owner, records, relation;
      owner = this.owner;
      relation = this.relation.inverse();
      records = Ember.get(this, 'content');
      return this._super();
    },
    setInverseInstance: function(record) {
      var inverse;
      if (record && this.invertibleFor(record)) {
        inverse = record.relation(this.inverseReflectionFor(record).name);
        return inverse.target = owner;
      }
    },
    invertibleFor: function(record) {
      return true;
    },
    inverse: function(record) {},
    _teardown: function() {
      return _.teardown(this, 'relation', 'records', 'owner', 'model', 'criteria');
    },
    addToTarget: function(record) {},
    removeFromTarget: function(record) {
      return this.removed().push(record);
    },
    removed: function() {
      return this._removed || (this._removed = []);
    }
  });

  Tower.ModelRelationCursor = (function(_super) {
    var ModelRelationCursor;

    function ModelRelationCursor() {
      return ModelRelationCursor.__super__.constructor.apply(this, arguments);
    }

    ModelRelationCursor = __extends(ModelRelationCursor, _super);

    ModelRelationCursor.reopenClass({
      makeOld: function() {
        var array;
        array = [];
        array.isCursor = true;
        return Tower.ModelRelationCursorMixin.apply(array);
      }
    });

    ModelRelationCursor.include(Tower.ModelRelationCursorMixin);

    return ModelRelationCursor;

  })(Tower.ModelCursor);

  _ = Tower._;

  Tower.ModelRelationBelongsTo = (function(_super) {
    var ModelRelationBelongsTo;

    function ModelRelationBelongsTo() {
      return ModelRelationBelongsTo.__super__.constructor.apply(this, arguments);
    }

    ModelRelationBelongsTo = __extends(ModelRelationBelongsTo, _super);

    ModelRelationBelongsTo.reopen({
      isBelongsTo: true,
      init: function(owner, name, options) {
        var computed, mixins;
        if (options == null) {
          options = {};
        }
        this._super.apply(this, arguments);
        this.foreignKey = "" + name + "Id";
        owner.field(this.foreignKey, {
          type: "Id"
        });
        mixins = owner.PrototypeMixin.mixins;
        computed = mixins[mixins.length - 1].properties[this.foreignKey];
        computed._dependentKeys.push(this.name);
        if (this.polymorphic) {
          this.foreignType = "" + name + "Type";
          return owner.field(this.foreignType, {
            type: 'String'
          });
        }
      }
    });

    return ModelRelationBelongsTo;

  })(Tower.ModelRelation);

  Tower.ModelRelationBelongsToCursorMixin = Ember.Mixin.create({
    isBelongsTo: true,
    clonePrototype: function() {
      var clone;
      clone = this.concat();
      clone.isCursor = true;
      Tower.ModelRelationCursorMixin.apply(clone);
      return Tower.ModelRelationBelongsToCursorMixin.apply(clone);
    },
    find: function() {
      this.compile();
      return this._super.apply(this, arguments);
    },
    compile: function() {
      var relation;
      relation = this.relation;
      return this.where({
        id: {
          $in: [this.owner.get(relation.foreignKey)]
        }
      });
    }
  });

  Tower.ModelRelationBelongsToCursor = (function(_super) {
    var ModelRelationBelongsToCursor;

    function ModelRelationBelongsToCursor() {
      return ModelRelationBelongsToCursor.__super__.constructor.apply(this, arguments);
    }

    ModelRelationBelongsToCursor = __extends(ModelRelationBelongsToCursor, _super);

    ModelRelationBelongsToCursor.reopenClass({
      makeOld: function() {
        var array;
        array = [];
        array.isCursor = true;
        Tower.ModelRelationCursorMixin.apply(array);
        return Tower.ModelRelationBelongsToCursorMixin.apply(array);
      }
    });

    ModelRelationBelongsToCursor.include(Tower.ModelRelationBelongsToCursorMixin);

    return ModelRelationBelongsToCursor;

  })(Tower.ModelRelationCursor);

  _ = Tower._;

  Tower.ModelRelationHasMany = (function(_super) {
    var ModelRelationHasMany;

    function ModelRelationHasMany() {
      return ModelRelationHasMany.__super__.constructor.apply(this, arguments);
    }

    ModelRelationHasMany = __extends(ModelRelationHasMany, _super);

    ModelRelationHasMany.reopen({
      isHasMany: true,
      isCollection: true
    });

    return ModelRelationHasMany;

  })(Tower.ModelRelation);

  Tower.ModelRelationHasManyCursorMixin = Ember.Mixin.create({
    isHasMany: true,
    clonePrototype: function() {
      var clone;
      clone = this.concat();
      clone.isCursor = true;
      Tower.ModelRelationCursorMixin.apply(clone);
      return Tower.ModelRelationHasManyCursorMixin.apply(clone);
    },
    has: function(object) {
      var records;
      object = _.castArray(object);
      records = [];
      if (!records.length) {
        return false;
      }
      return false;
    },
    validate: function(callback) {
      if (this.owner.get('isNew')) {
        throw new Error('You cannot call insert unless the parent is saved');
      }
      return callback.call(this);
    },
    build: function(callback) {
      this.compileForInsert();
      return this._build(callback);
    },
    insert: function(callback) {
      var _this = this;
      return this.validate(function(error) {
        return _this.insertReferenced(callback);
      });
    },
    update: function(callback) {
      var _this = this;
      return this.validate(function(error) {
        return _this.updateReferenced(callback);
      });
    },
    destroy: function(callback) {
      var _this = this;
      return this.validate(function(error) {
        return _this.destroyReferenced(callback);
      });
    },
    find: function(callback) {
      var _this = this;
      if (Tower.isServer && this._hasContent(callback)) {
        return this;
      }
      return this.validate(function(error) {
        return _this.findReferenced(callback);
      });
    },
    count: function(callback) {
      var value,
        _this = this;
      if (this.relation.counterCache) {
        value = this.owner.get(this.relation.counterCacheKey);
        if (callback) {
          callback.call(this, null, value);
        }
        return value;
      }
      return this.validate(function(error) {
        _this.compileForFind();
        return _this._runBeforeFindCallbacksOnStore(function() {
          return _this._count(function(error, value) {
            if (!error) {
              return _this._runAfterFindCallbacksOnStore(function() {
                if (callback) {
                  return callback.call(_this, error, value);
                }
              });
            } else {
              if (callback) {
                return callback.call(_this, error, value);
              }
            }
          });
        });
      });
    },
    exists: function(callback) {
      var _this = this;
      return this.validate(function(error) {
        _this.compileForFind();
        return _this._runBeforeFindCallbacksOnStore(function() {
          return _this._exists(function(error, record) {
            if (!error) {
              return _this._runAfterFindCallbacksOnStore(function() {
                if (callback) {
                  return callback.call(_this, error, record);
                }
              });
            } else {
              if (callback) {
                return callback.call(_this, error, record);
              }
            }
          });
        });
      });
    },
    updateCounter: function(difference, callback) {
      var owner;
      owner = this.owner;
      key = this.relation.counterCacheKey;
      return owner.updateAttribute(key, owner.get(key) + difference, callback);
    },
    insertReferenced: function(callback) {
      var _this = this;
      this.compileForInsert();
      return this._runBeforeInsertCallbacksOnStore(function() {
        return _this._insert(function(error, record) {
          if (!error) {
            return _this._runAfterInsertCallbacksOnStore(function() {
              if (_this.updateOwnerRecord()) {
                return _this.owner.updateAttributes(_this.ownerAttributes(record), function(error) {
                  if (callback) {
                    return callback.call(_this, error, record);
                  }
                });
              } else {
                if (callback) {
                  return callback.call(_this, error, record);
                }
              }
            });
          } else {
            if (callback) {
              return callback.call(_this, error, record);
            }
          }
        });
      });
    },
    updateReferenced: function(callback) {
      var _this = this;
      this.compileForUpdate();
      return this._runBeforeUpdateCallbacksOnStore(function() {
        return _this._update(function(error, record) {
          if (!error) {
            return _this._runAfterUpdateCallbacksOnStore(function() {
              if (callback) {
                return callback.call(_this, error, record);
              }
            });
          } else {
            if (callback) {
              return callback.call(_this, error, record);
            }
          }
        });
      });
    },
    destroyReferenced: function(callback) {
      var _this = this;
      this.compileForDestroy();
      return this._runBeforeDestroyCallbacksOnStore(function() {
        return _this._destroy(function(error, record) {
          if (!error) {
            return _this._runAfterDestroyCallbacksOnStore(function() {
              if (_this.updateOwnerRecord()) {
                return _this.owner.updateAttributes(_this.ownerAttributesForDestroy(record), function(error) {
                  if (callback) {
                    return callback.call(_this, error, record);
                  }
                });
              } else {
                if (callback) {
                  return callback.call(_this, error, record);
                }
              }
            });
          } else {
            if (callback) {
              return callback.call(_this, error, record);
            }
          }
        });
      });
    },
    findReferenced: function(callback) {
      var result, returnArray,
        _this = this;
      this.compileForFind();
      returnArray = this.returnArray;
      result = void 0;
      this._runBeforeFindCallbacksOnStore(function() {
        return _this._find(function(error, records) {
          var done;
          result = records;
          if (!error && records) {
            done = function() {
              if (callback) {
                return callback.call(_this, error, records);
              }
            };
            return _this._runAfterFindCallbacksOnStore(done, records);
          } else {
            if (callback) {
              return callback.call(_this, error, records);
            }
          }
        });
      });
      if (returnArray === false) {
        return result;
      } else {
        return this;
      }
    },
    add: function(callback) {
      var _this = this;
      if (!this.relation.idCache) {
        throw new Error;
      }
      return this.owner.updateAttributes(this.ownerAttributes(), function(error) {
        if (callback) {
          return callback.call(_this, error, _this.data);
        }
      });
    },
    remove: function(callback) {
      var _this = this;
      if (!this.relation.idCache) {
        throw new Error;
      }
      return this.owner.updateAttributes(this.ownerAttributesForDestroy(), function(error) {
        if (callback) {
          return callback.call(_this, error, _this.data);
        }
      });
    },
    compile: function() {
      var data, id, inverseRelation, owner, relation, _name;
      owner = this.owner;
      relation = this.relation;
      inverseRelation = relation.inverse();
      id = owner.get('id');
      data = {};
      if (relation.foreignKey) {
        if (id !== void 0) {
          data[relation.foreignKey] = id;
        }
        if (relation.foreignType) {
          data[_name = relation.foreignType] || (data[_name] = owner.constructor.className());
        }
      }
      return this.where(data);
    },
    compileForInsert: function() {
      return this.compile();
    },
    compileForUpdate: function() {
      this.compileForFind();
      if (!(this.ids && this.ids.length)) {
        return this.returnArray = true;
      }
    },
    compileForDestroy: function() {
      return this.compileForFind();
    },
    compileForFind: function() {
      var relation;
      this.compile();
      relation = this.relation;
      if (relation.idCache) {
        return this.where({
          id: {
            $in: this.owner.get(relation.idCacheKey)
          }
        });
      }
    },
    updateOwnerRecord: function() {
      var relation;
      relation = this.relation;
      return !!(relation && (relation.idCache || relation.counterCache));
    },
    ownerAttributes: function(record) {
      var data, inc, push, relation, updates;
      relation = this.relation;
      if (relation.idCache) {
        push = {};
        data = record ? record.get('id') : this.store._mapKeys('id', this.data);
        push[relation.idCacheKey] = data;
      }
      if (relation.counterCacheKey) {
        inc = {};
        inc[relation.counterCacheKey] = 1;
      }
      updates = {};
      if (push) {
        if (_.isArray(push)) {
          updates['$addEach'] = push;
        } else {
          updates['$add'] = push;
        }
      }
      if (inc) {
        updates['$inc'] = inc;
      }
      return updates;
    },
    ownerAttributesForDestroy: function(record) {
      var inc, pull, relation, updates;
      relation = this.relation;
      if (relation.idCache) {
        pull = {};
        pull[relation.idCacheKey] = this.ids && this.ids.length ? this.ids : this.owner.get(relation.idCacheKey);
      }
      if (relation.counterCacheKey) {
        inc = {};
        inc[relation.counterCacheKey] = -1;
      }
      updates = {};
      if (pull) {
        updates['$pullEach'] = pull;
      }
      if (inc) {
        updates['$inc'] = inc;
      }
      return updates;
    },
    _idCacheRecords: function(records) {
      var rootRelation;
      rootRelation = this.owner.relation(this.relation.name);
      return rootRelation.cursor.records = rootRelation.cursor.records.concat(_.castArray(records));
    }
  });

  Tower.ModelRelationHasManyCursor = (function(_super) {
    var ModelRelationHasManyCursor;

    function ModelRelationHasManyCursor() {
      return ModelRelationHasManyCursor.__super__.constructor.apply(this, arguments);
    }

    ModelRelationHasManyCursor = __extends(ModelRelationHasManyCursor, _super);

    ModelRelationHasManyCursor.reopenClass({
      makeOld: function() {
        var array;
        array = [];
        array.isCursor = true;
        Tower.ModelRelationCursorMixin.apply(array);
        return Tower.ModelRelationHasManyCursorMixin.apply(array);
      }
    });

    ModelRelationHasManyCursor.include(Tower.ModelRelationHasManyCursorMixin);

    return ModelRelationHasManyCursor;

  })(Tower.ModelRelationCursor);

  _ = Tower._;

  Tower.ModelRelationHasManyThrough = (function(_super) {
    var ModelRelationHasManyThrough;

    function ModelRelationHasManyThrough() {
      return ModelRelationHasManyThrough.__super__.constructor.apply(this, arguments);
    }

    ModelRelationHasManyThrough = __extends(ModelRelationHasManyThrough, _super);

    ModelRelationHasManyThrough.reopen({
      isHasManyThrough: true,
      init: function(options) {
        var throughRelation;
        this._super.apply(this, arguments);
        if (this.through && !options.type) {
          this.throughRelation = throughRelation = this.owner.relation(this.through);
          return options.type || (options.type = throughRelation.targetType);
        }
      },
      inverseThrough: function(relation) {
        var name, relations, type;
        relations = relation.targetKlass().relations();
        if (relation.inverseOf) {
          return relations[relation.inverseOf];
        } else {
          name = this.name;
          type = this.type;
          for (name in relations) {
            relation = relations[name];
            if (relation.inverseOf === name) {
              return relation;
            }
          }
          for (name in relations) {
            relation = relations[name];
            if (relation.targetType === type) {
              return relation;
            }
          }
        }
      }
    });

    return ModelRelationHasManyThrough;

  })(Tower.ModelRelationHasMany);

  Tower.ModelRelationHasManyThroughCursorMixin = Ember.Mixin.create(Tower.ModelRelationHasManyCursorMixin, {
    isHasManyThrough: true,
    clonePrototype: function() {
      var clone;
      clone = this.concat();
      clone.isCursor = true;
      Tower.ModelRelationCursorMixin.apply(clone);
      return Tower.ModelRelationHasManyThroughCursorMixin.apply(clone);
    },
    make: function(options) {
      if (options == null) {
        options = {};
      }
      this._super.apply(this, arguments);
      if (this.relation.through) {
        this.throughRelation = this.owner.constructor.relation(this.relation.through);
        return this.inverseRelation = this.relation.inverseThrough(this.throughRelation);
      }
    },
    compile: function() {
      return this;
    },
    insert: function(callback) {
      var _this = this;
      return this._runBeforeInsertCallbacksOnStore(function() {
        return _this._insert(function(error, record) {
          if (!error) {
            return _this._runAfterInsertCallbacksOnStore(function() {
              return _this.insertThroughRelation(record, function(error, throughRecord) {
                if (callback) {
                  return callback.call(_this, error, record);
                }
              });
            });
          } else {
            if (callback) {
              return callback.call(_this, error, record);
            }
          }
        });
      });
    },
    add: function(callback) {
      var _this = this;
      return this._build(function(error, record) {
        if (!error) {
          return _this.insertThroughRelation(record, function(error, throughRecord) {
            if (callback) {
              return callback.call(_this, error, record);
            }
          });
        } else {
          if (callback) {
            return callback.call(_this, error, record);
          }
        }
      });
    },
    remove: function(callback) {
      var _this = this;
      return this.removeThroughRelation(function(error) {
        if (callback) {
          return callback.call(_this, error, _this.ids);
        }
      });
    },
    count: function(callback) {
      var _this = this;
      return this._runBeforeFindCallbacksOnStore(function() {
        return _this._count(function(error, record) {
          if (!error) {
            return _this._runAfterFindCallbacksOnStore(function() {
              if (callback) {
                return callback.call(_this, error, record);
              }
            });
          } else {
            if (callback) {
              return callback.call(_this, error, record);
            }
          }
        });
      });
    },
    exists: function(callback) {
      var _this = this;
      return this._runBeforeFindCallbacksOnStore(function() {
        return _this._exists(function(error, record) {
          if (!error) {
            return _this._runAfterFindCallbacksOnStore(function() {
              if (callback) {
                return callback.call(_this, error, record);
              }
            });
          } else {
            if (callback) {
              return callback.call(_this, error, record);
            }
          }
        });
      });
    },
    appendThroughConditions: function(callback) {
      var _this = this;
      return this.owner.get(this.relation.through).all(function(error, records) {
        var ids;
        ids = _this.store._mapKeys(_this.inverseRelation.foreignKey, records);
        _this.where({
          'id': {
            $in: ids
          }
        });
        return callback();
      });
    },
    removeThroughRelation: function(callback) {
      var ids,
        _this = this;
      ids = this.ids;
      key = this.inverseRelation.foreignKey;
      return this.owner.get(this.relation.through).anyIn(key, ids).destroy(function(error) {
        if (callback) {
          return callback.call(_this, error);
        }
      });
    },
    insertThroughRelation: function(records, callback) {
      var attributes, data, record, returnArray, _l, _len3,
        _this = this;
      returnArray = _.isArray(records);
      records = _.castArray(records);
      data = [];
      key = this.inverseRelation.foreignKey;
      for (_l = 0, _len3 = records.length; _l < _len3; _l++) {
        record = records[_l];
        attributes = {};
        attributes[key] = record.get('id');
        data.push(attributes);
      }
      return this.owner.get(this.relation.through).insert(data, function(error, throughRecords) {
        if (!returnArray) {
          throughRecords = throughRecords[0];
        }
        if (callback) {
          return callback.call(_this, error, throughRecords);
        }
      });
    }
  });

  Tower.ModelRelationHasManyThroughCursor = (function(_super) {
    var ModelRelationHasManyThroughCursor;

    function ModelRelationHasManyThroughCursor() {
      return ModelRelationHasManyThroughCursor.__super__.constructor.apply(this, arguments);
    }

    ModelRelationHasManyThroughCursor = __extends(ModelRelationHasManyThroughCursor, _super);

    ModelRelationHasManyThroughCursor.reopenClass({
      makeOld: function() {
        var array;
        array = [];
        array.isCursor = true;
        Tower.ModelRelationCursorMixin.apply(array);
        return Tower.ModelRelationHasManyThroughCursorMixin.apply(array);
      }
    });

    ModelRelationHasManyThroughCursor.include(Tower.ModelRelationHasManyThroughCursorMixin);

    return ModelRelationHasManyThroughCursor;

  })(Tower.ModelRelationCursor);

  _ = Tower._;

  Tower.ModelRelationHasOne = (function(_super) {
    var ModelRelationHasOne;

    function ModelRelationHasOne() {
      return ModelRelationHasOne.__super__.constructor.apply(this, arguments);
    }

    ModelRelationHasOne = __extends(ModelRelationHasOne, _super);

    ModelRelationHasOne.reopen({
      isHasOne: true
    });

    return ModelRelationHasOne;

  })(Tower.ModelRelation);

  Tower.ModelRelationHasOneCursorMixin = Ember.Mixin.create({
    isHasOne: true,
    clonePrototype: function() {
      var clone;
      clone = this.concat();
      clone.isCursor = true;
      Tower.ModelRelationCursorMixin.apply(clone);
      return Tower.ModelRelationHasOneCursorMixin.apply(clone);
    },
    insert: function(callback) {
      var result,
        _this = this;
      this.compile();
      result = void 0;
      this._insert(function(error, record) {
        result = record;
        if (!error && record) {
          _this.owner.set(_this.relation.name, record);
        }
        if (callback) {
          return callback.call(_this, error, record);
        }
      });
      return result;
    },
    find: function(callback) {
      var result,
        _this = this;
      result = void 0;
      this._find(function(error, record) {
        result = record;
        if (!error && record) {
          _this.owner.set(_this.relation.name, record);
        }
        if (callback) {
          return callback.call(_this, error, record);
        }
      });
      return result;
    },
    compile: function() {
      var data, id, owner, relation, _name;
      owner = this.owner;
      relation = this.relation;
      id = owner.get('id');
      data = {};
      if (relation.foreignKey) {
        if (id !== void 0) {
          data[relation.foreignKey] = id;
        }
        if (relation.foreignType) {
          data[_name = relation.foreignType] || (data[_name] = owner.constructor.className());
        }
      }
      return this.where(data);
    }
  });

  Tower.ModelRelationHasOneCursor = (function(_super) {
    var ModelRelationHasOneCursor;

    function ModelRelationHasOneCursor() {
      return ModelRelationHasOneCursor.__super__.constructor.apply(this, arguments);
    }

    ModelRelationHasOneCursor = __extends(ModelRelationHasOneCursor, _super);

    ModelRelationHasOneCursor.reopenClass({
      makeOld: function() {
        var array;
        array = [];
        array.isCursor = true;
        Tower.ModelRelationCursorMixin.apply(array);
        return Tower.ModelRelationHasOneCursorMixin.apply(array);
      }
    });

    ModelRelationHasOneCursor.include(Tower.ModelRelationHasOneCursorMixin);

    return ModelRelationHasOneCursor;

  })(Tower.ModelRelationCursor);

  _ = Tower._;

  Tower.ModelRelations = {
    ClassMethods: {
      hasOne: function(name, options) {
        if (options == null) {
          options = {};
        }
        return this.relations()[name] = new Tower.ModelRelationHasOne(this, name, options);
      },
      hasMany: function(name, options) {
        if (options == null) {
          options = {};
        }
        if (options.hasOwnProperty('through')) {
          return this.relations()[name] = new Tower.ModelRelationHasManyThrough(this, name, options);
        } else {
          return this.relations()[name] = new Tower.ModelRelationHasMany(this, name, options);
        }
      },
      belongsTo: function(name, options) {
        return this.relations()[name] = new Tower.ModelRelationBelongsTo(this, name, options);
      },
      relations: function() {
        return this.metadata().relations;
      },
      relation: function(name) {
        var relation;
        relation = this.relations()[name];
        if (!relation) {
          throw new Error("Relation '" + name + "' does not exist on '" + this.name + "'");
        }
        return relation;
      },
      shouldIncludeTypeInScope: function() {
        return this.baseClass().className() !== this.className();
      }
    },
    InstanceMethods: {
      getAssociation: function(key) {
        return this.constructor.relations()[key];
      },
      getAssociationScope: function(key) {
        return this.get("" + key + "AssociationScope");
      },
      getAssociationCursor: function(key) {
        return this.getAssociationScope(key).cursor;
      },
      fetch: function(key, callback) {
        var record,
          _this = this;
        record = void 0;
        this.getAssociationScope(key).first(function(error, result) {
          record = result;
          if (record && !error) {
            _this.set(key, record);
          }
          if (callback) {
            callback.call(_this, error, record);
          }
          return record;
        });
        return record;
      },
      createAssocation: function() {
        var args, association, name;
        name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        association = this.getAssociationScope(name);
        return association.create.apply(association, args);
      },
      buildAssocation: function() {
        var args, association, name;
        name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        association = this.getAssociationScope(name);
        return association.build.apply(association, args);
      },
      destroyRelations: function(callback) {
        var dependents, iterator, name, relation, relations,
          _this = this;
        relations = this.constructor.relations();
        dependents = [];
        for (name in relations) {
          relation = relations[name];
          if (relation.dependent === true || relation.dependent === 'destroy') {
            dependents.push(name);
          }
        }
        iterator = function(name, next) {
          return _this.get(name).destroy(next);
        };
        return Tower.async(dependents, iterator, callback);
      },
      notifyRelations: function() {
        var name, relation, relations, _results;
        relations = this.constructor.relations();
        _results = [];
        for (name in relations) {
          relation = relations[name];
          _results.push(relation.inverse());
        }
        return _results;
      },
      _setHasManyAssociation: function(key, value, association, options) {
        var cursor, i, id, ids, item, toRemove, _l, _len3, _len4, _len5, _len6, _m, _n, _o, _ref3;
        if (options == null) {
          options = {};
        }
        cursor = this.getAssociationScope(key).cursor;
        value = _.castArray(value);
        for (i = _l = 0, _len3 = value.length; _l < _len3; i = ++_l) {
          item = value[i];
          if (!(item instanceof Tower.Model)) {
            value[i] = cursor.store.serializeModel(item);
          }
        }
        if (this.get('isNew')) {
          this;

        } else {
          cursor._markedForDestruction || (cursor._markedForDestruction = []);
          toRemove = cursor._markedForDestruction.concat();
          ids = [];
          for (_m = 0, _len4 = value.length; _m < _len4; _m++) {
            item = value[_m];
            id = Ember.get(item, 'id');
            if (id != null) {
              ids.push(id.toString());
            }
          }
          _ref3 = cursor.get('content');
          for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
            item = _ref3[_n];
            if (this._checkAssociationRecordForDestroy(item, association)) {
              if (_.indexOf(ids, item.get('id').toString()) === -1) {
                item.set(association.foreignKey, void 0);
                toRemove.push(item);
              }
            }
          }
          if (toRemove.length) {
            cursor._markedForDestruction = toRemove;
          }
        }
        if (value && value.length) {
          for (_o = 0, _len6 = value.length; _o < _len6; _o++) {
            item = value[_o];
            if (item instanceof Tower.Model) {
              item.set(association.foreignKey, this.get('id'));
            } else if (item === null || item === void 0) {
              this;

            } else {
              this;

            }
          }
          cursor.load(value);
        } else {
          cursor.clear();
        }
        return cursor;
      },
      _getHasManyAssociation: function(key) {
        return this.getAssociationScope(key);
      },
      _checkAssociationRecordForDestroy: function(record, association) {
        var foreignId, id;
        foreignId = record.get(association.foreignKey);
        id = this.get('id');
        return (foreignId != null) && (id != null) && foreignId.toString() === id.toString() && !record.attributeChanged(association.foreignKey);
      },
      _setHasOneAssociation: function(key, value, association) {
        var cursor, existingRecord, foreignId, id, record;
        cursor = this.getAssociationCursor(key);
        existingRecord = cursor.objectAt(0);
        if (existingRecord && !cursor._markedForDestruction) {
          foreignId = existingRecord.get(association.foreignKey);
          id = this.get('id');
          if ((foreignId != null) && (id != null) && foreignId.toString() === id.toString() && !existingRecord.attributeChanged(association.foreignKey)) {
            cursor._markedForDestruction = existingRecord;
          }
        }
        if (value instanceof Tower.Model) {
          record = value;
          value.set(association.foreignKey, this.get('id'));
        } else if (value === null || value === void 0) {
          this;

        } else {
          this;

        }
        if (record) {
          cursor.clear();
          cursor.addObject(record);
        }
        return record;
      },
      _getHasOneAssociation: function(key) {
        return this.getAssociationCursor(key).objectAt(0) || this.fetch(key);
      },
      _setBelongsToAssociation: function(key, value, association) {
        var cursor, id, record;
        if (value instanceof Tower.Model) {
          record = value;
          id = value.get('id');
          this.set(association.foreignKey, id);
        } else if (value === null || value === void 0) {
          this.set(association.foreignKey, void 0);
        } else {
          id = value;
          this.set(association.foreignKey, id);
        }
        if (record) {
          cursor = this.getAssociationCursor(key);
          Ember.set(cursor, 'content', []);
          cursor.addObject(record);
        }
        return record;
      },
      _getBelongsToAssociation: function(key) {
        return this.getAssociationCursor(key).objectAt(0) || (function() {
          try {
            return this.fetch(key);
          } catch (_error) {}
        }).call(this);
      }
    }
  };

  _ = Tower._;

  Tower.ModelAttachment = {
    ClassMethods: {
      attachment: function(name, options) {
        var attachmentClass, attachmentClassName;
        if (typeof name === 'string') {
          options || (options = {});
          attachmentClassName = _.camelize(name);
          attachmentClass = this[attachmentClassName] = Tower.Model.extend();
          attachmentClass._attachmentFields();
          attachmentClass._attachmentProcessing(options);
          return this.hasOne(name, {
            type: attachmentClass
          });
        } else {
          options = name;
          options || (options = {});
          this._attachmentFields();
          return this._attachmentProcessing(options);
        }
      },
      attachments: function() {
        return this.metadata().attachments;
      },
      _attachmentFields: function() {
        this.field('name', {
          type: 'String'
        });
        this.field('size', {
          type: 'Integer'
        });
        this.field('width', {
          type: 'Integer'
        });
        this.field('height', {
          type: 'Integer'
        });
        return this.field('contentType', {
          type: 'String'
        });
      },
      _attachmentProcessing: function(options) {
        this.include(Tower.AttachmentProcessingMixin);
        if (options.styles) {
          return this.styles(options.styles);
        }
      }
    }
  };

  _ = Tower._;

  Tower.AttachmentProcessingMixin = {
    included: function() {
      this.field('fingerprint', {
        type: 'String'
      });
      this.field('processed', {
        type: 'Boolean',
        "default": false
      });
      this["protected"]('processed');
      this.before('save', 'prepareForDestroy');
      this.before('save', 'setAttachmentAttributes');
      this.after('save', 'destroyOldFiles');
      this.after('save', 'saveFiles');
      this.before('destroy', 'prepareForDestroy');
      this.after('destroy', 'destroyFiles');
      return this.defaults({
        defaultStyle: 'original',
        defaultUrl: '/uploads/:class-:style/missing.png',
        restrictedCharacters: /[&$+,\/:;=?@<>\[\]\{\}\|\\\^~%# ]/,
        onlyProcess: [],
        path: ':root/public:url',
        preserveFiles: false,
        processors: ['thumbnail'],
        storage: 'filesystem',
        styles: {},
        url: '/uploads/:class/:style/:name'
      });
    },
    ClassMethods: {
      DELAYED_POST_PROCESSING: false,
      parseDimensions: function(string) {
        string.match(/\b(\d*)x?(\d*)\b([\>\<\#\@\%^!])?/i);
        return {
          width: RegExp.$1,
          height: RegExp.$2,
          modifier: RegExp.$3
        };
      },
      postProcessAndSave: function(id, callback) {
        var _this = this;
        return this.where({
          id: {
            $in: [id]
          }
        }).first(function(error, record) {
          return record.postProcessAndSave(callback);
        });
      },
      styles: function(styles) {
        return this.reopen({
          styles: Ember.computed(function() {
            return _.extend({}, styles);
          }).cacheable()
        });
      }
    },
    isUploading: false,
    files: Ember.computed(function(key, value) {
      if (arguments.length === 2) {
        return {
          original: value[0]
        };
      } else {
        return {};
      }
    }).cacheable(),
    processors: [
      function(file, style, callback) {
        var createTempFile, ext, fs, height, im, newName, newPath, parts, temp, width, _ref3,
          _this = this;
        im = require('gm').subClass({
          imageMagick: true
        });
        temp = require('temp');
        fs = require('fs');
        newPath = file.path + style[0];
        parts = file.filename.split('.');
        ext = parts.pop();
        newName = parts.join('.') + style[0] + '.' + ext;
        _ref3 = this.constructor.parseDimensions(style[0]), width = _ref3.width, height = _ref3.height;
        createTempFile = function(opts, callback) {
          return temp.open(opts, function(error, info) {
            return fs.close(info.fd, function(error) {
              return callback(error, info);
            });
          });
        };
        return createTempFile({
          suffix: "." + ext
        }, function(error, info) {
          var options;
          options = {
            srcPath: file.path,
            width: width,
            height: height,
            dstPath: info.path
          };
          return im(file.path).resize(width, height).write(info.path, function(error) {
            info.filename = newName;
            info.mime = file.mime;
            return callback.call(_this, error, info);
          });
        });
      }
    ],
    prepareForDestroy: function() {
      var path, paths, style, styles, _l, _len3;
      if (this.constructor.defaults().preserveFiles || this.get('isNew')) {
        return;
      }
      paths = [];
      styles = _.keys(this.get('styles'));
      if (_.indexOf(styles, 'original') === -1) {
        styles.push('original');
      }
      for (_l = 0, _len3 = styles.length; _l < _len3; _l++) {
        style = styles[_l];
        path = this.urlFor(style, true);
        if (path != null) {
          paths.push(path);
        }
      }
      Ember.set(this, '_queuedForDestroy', paths);
      return void 0;
    },
    destroyFiles: function() {},
    destroyOldFiles: function(callback) {
      var paths;
      paths = Ember.get(this, '_queuedForDestroy');
      delete this._queuedForDestroy;
      if (paths && paths.length) {
        return this.constructor.fileStore.destroy(paths, callback);
      } else {
        return callback();
      }
    },
    setAttachmentAttributes: function(callback) {
      var file,
        _this = this;
      file = this.get('files').original;
      if (file) {
        Ember.beginPropertyChanges();
        if (this.get('name') == null) {
          this.set('name', this._sanitizeFilename(file.name));
        }
        if (this.get('contentType') == null) {
          this.set('contentType', file.mime);
        }
        if (this.get('size') == null) {
          this.set('size', file.length);
        }
        if (!((this.get('width') != null) && (this.get('height') != null))) {
          require('gm').subClass({
            imageMagick: true
          })(file.path).identify(function(error, features) {
            _this.set('width', features.width);
            _this.set('height', features.height);
            try {
              _this.set('fingerprint', features.Properties.signature);
            } catch (_error) {}
            Ember.endPropertyChanges();
            return callback();
          });
        } else {
          callback();
        }
      } else {
        callback();
      }
      return void 0;
    },
    _sanitizeFilename: function(string) {
      var restricted;
      restricted = this.constructor.defaults().restrictedCharacters;
      if (restricted) {
        return string.replace(restricted, '-');
      } else {
        return string;
      }
    },
    saveFiles: function(callback) {
      var _this = this;
      return this.saveFile('original', function(error) {
        if (_this.constructor.DELAYED_POST_PROCESSING) {
          return _this.enqueue('postProcessAndSave', _this.get('id'), callback);
        } else {
          return _this.postProcessAndSave(callback);
        }
      });
    },
    postProcessAndSave: function(callback) {
      var _this = this;
      return this.postProcess(function(error) {
        var saveFile, styleNames;
        styleNames = _.keys(_this.get('files'));
        saveFile = function(styleName, next) {
          if (styleName === 'original') {
            return next();
          }
          return _this.saveFile(styleName, next);
        };
        return Tower.series(styleNames, saveFile, callback);
      });
    },
    saveFile: function(styleName, callback) {
      var file, files,
        _this = this;
      this.set('isUploading', true);
      files = this.get('files');
      file = files[styleName];
      file.to || (file.to = this.urlFor(styleName));
      this.constructor.fileStore.create(file, function(error) {
        _this.set('isUploading', false);
        if (callback) {
          return callback.call(_this, error);
        }
      });
      return void 0;
    },
    postProcess: function(callback) {
      var file, files, postProcessIterator, styleNames, styles,
        _this = this;
      styles = this.get('styles');
      styleNames = _.keys(styles);
      files = this.get('files');
      file = files.original;
      file._data || (file._data = require('fs').readFileSync(file.path, 'binary'));
      postProcessIterator = function(styleName, styleComplete) {
        var processorIterator, processors, style;
        if (styleName === 'original') {
          return styleComplete();
        }
        style = styles[styleName];
        processors = style.processors;
        processors || (processors = _this.get('processors'));
        file = files.original;
        processorIterator = function(processor, processorComplete) {
          return processor.call(_this, file, style, function(error, resultFile) {
            files[styleName] = file = resultFile;
            return processorComplete(error);
          });
        };
        return Tower.series(processors, processorIterator, styleComplete);
      };
      return Tower.series(styleNames, postProcessIterator, callback);
    },
    urlFor: function(style, oldValue) {
      return this._parsePath(this.constructor.defaults().url, style, oldValue);
    },
    pathFor: function(style, oldValue) {
      return this._parsePath(this.constructor.defaults().path, style, oldValue);
    },
    _parsePath: function(path, style, oldValue) {
      var data,
        _this = this;
      data = this.get('styles')[style] || {};
      data.format || (data.format = 'png');
      return path.replace(/:(\w+)/g, function(__, attribute) {
        switch (attribute) {
          case 'bucket':
          case 'format':
            return data[attribute];
          case 'url':
            return _this.urlFor(style);
          case 'root':
            return Tower.root;
          case 'style':
            return style;
          case 'class':
            return _.parameterize(_this.constructor.className());
          case 'name':
          case 'filename':
            if (oldValue) {
              return _this.attributeWas('name');
            } else {
              return _this.get('name');
            }
            break;
          case 'geometry':
            return "" + (_this.get('width')) + "x" + (_this.get('height'));
          default:
            return _this.get(attribute);
        }
      });
    }
  };

  _ = Tower._;

  Tower.ModelAttribute = (function() {

    function ModelAttribute(owner, name, options, block) {
      var observes, type;
      if (options == null) {
        options = {};
      }
      this.owner = owner;
      this.name = key = name;
      if (typeof options === 'string') {
        options = {
          type: options
        };
      } else if (typeof options === 'function') {
        block = options;
        options = {};
      }
      this.type = type = options.type || 'String';
      if (typeof type !== 'string') {
        this.itemType = type[0];
        this.type = type = 'Array';
      }
      this.encodingType = (function() {
        switch (type) {
          case 'Id':
          case 'Date':
          case 'Array':
          case 'String':
          case 'Integer':
          case 'Float':
          case 'BigDecimal':
          case 'Time':
          case 'DateTime':
          case 'Boolean':
          case 'Object':
          case 'Number':
          case 'Geo':
            return type;
          default:
            return 'Model';
        }
      })();
      observes = _.castArray(options.observes);
      observes.push('data');
      this.observes = observes;
      this._setDefault(options);
      this._defineAccessors(options);
      this._defineAttribute(options);
      this._addValidations(options);
      this._addIndex(options);
    }

    __defineProperty(ModelAttribute,  "_setDefault", function(options) {
      this._default = options["default"];
      if (!this._default) {
        if (this.type === 'Geo') {
          return this._default = {
            lat: null,
            lng: null
          };
        } else if (this.type === 'Array') {
          return this._default = [];
        }
      }
    });

    __defineProperty(ModelAttribute,  "_defineAccessors", function(options) {
      var name, observed, serialize, serializer, type;
      name = this.name;
      type = this.type;
      serializer = Tower['StoreSerializer' + type];
      this.get = options.get || (serializer ? serializer.from : void 0);
      if (serialize = options.serialize || options.encode) {
        if (_[serialize]) {
          observed = this.observes.length === 2 && this.observes[0];
          this.get = function() {
            return _[serialize](this.get(observed));
          };
        } else {
          this.get = true;
        }
      }
      this.set = options.set || (serializer ? serializer.to : void 0);
      if (this.get === true) {
        this.get = "get" + (_.camelize(name));
      }
      if (this.set === true) {
        return this.set = "set" + (_.camelize(name));
      }
    });

    __defineProperty(ModelAttribute,  "_defineAttribute", function(options) {
      var attribute, computed, field, mixins, name, properties;
      name = this.name;
      attribute = {};
      field = this;
      computed = Ember.computed(function(key, value) {
        if (arguments.length === 2) {
          value = field.encode(value, this);
          value = this.setAttribute(key, value);
          return value;
        } else {
          value = this.getAttribute(key);
          if (value === void 0) {
            value = field.defaultValue(this);
          }
          return field.decode(value, this);
        }
        /*
              if arguments.length is 2
                data  = Ember.get(@, 'data')
                value = data.set(key, field.encode(value, @))
                # this is for associations, built for hasMany through. 
                # need to think about some more but it works for now.
                # you can save hasMany through, with async is true.
                if Tower.isClient && key == 'id'
                  cid = data.get('_cid')
                  if cid and cid != data.get('_id')
                    relations = @constructor.relations()
                    for relationName, relation of relations
                      if relation.isHasMany || relation.isHasOne
                        foreignKey = relation.foreignKey
                        relation.klass().where(foreignKey, cid).all().forEach (item) ->
                          item.set(foreignKey, value)
              
                # probably should put this into Tower.ModelData:
                Tower.cursorNotification("#{@constructor.className()}.#{key}")
                value
              else
                data  = Ember.get(@, 'data')
                value = data.get(key)
                value = field.defaultValue(@) if value == undefined
                field.decode(value, @)
        */

      });
      attribute[name] = computed.property.apply(computed, this.observes).cacheable();
      mixins = this.owner.PrototypeMixin.mixins;
      properties = mixins[mixins.length - 1].properties;
      if (properties) {
        return properties[name] = attribute[name];
      } else {
        return this.owner.reopen(attribute);
      }
    });

    __defineProperty(ModelAttribute,  "_addValidations", function(options) {
      var normalizedKey, validations, _ref3;
      validations = {};
      _ref3 = Tower.ModelValidator.keys;
      for (key in _ref3) {
        normalizedKey = _ref3[key];
        if (options.hasOwnProperty(key)) {
          validations[normalizedKey] = options[key];
        }
      }
      if (_.isPresent(validations)) {
        return this.owner.validates(this.name, validations);
      }
    });

    __defineProperty(ModelAttribute,  "_addIndex", function(options) {
      var index, name, type;
      type = this.type;
      name = this.name;
      if (type === 'Geo' && !options.index) {
        index = {};
        index[name] = '2d';
        options.index = index;
      }
      if (options.index) {
        if (options.index === true) {
          return this.owner.index(this.name);
        } else {
          return this.owner.index(options.index);
        }
      }
    });

    __defineProperty(ModelAttribute,  "validators", function() {
      var result, validator, _l, _len3, _ref3;
      result = [];
      _ref3 = this.owner.validators();
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        validator = _ref3[_l];
        if (validator.attributes.indexOf(this.name) !== -1) {
          result.push(validator);
        }
      }
      return result;
    });

    __defineProperty(ModelAttribute,  "defaultValue", function(record) {
      var _default;
      _default = this._default;
      if (_default == null) {
        return _default;
      }
      if (_.isArray(_default)) {
        return _default.concat();
      } else if (_.isHash(_default)) {
        return _.extend({}, _default);
      } else if (typeof _default === 'function') {
        return _default.call(record);
      } else {
        return _default;
      }
    });

    __defineProperty(ModelAttribute,  "encode", function(value, binding) {
      return this.code(this.set, value, binding);
    });

    __defineProperty(ModelAttribute,  "decode", function(value, binding) {
      return this.code(this.get, value, binding);
    });

    __defineProperty(ModelAttribute,  "code", function(type, value, binding) {
      switch (typeof type) {
        case 'string':
          return binding[type].call(binding[type], value);
        case 'function':
          return type.call(binding, value);
        default:
          return value;
      }
    });

    __defineProperty(ModelAttribute,  "attach", function(owner) {});

    return ModelAttribute;

  })();

  _ = Tower._;

  Tower.ModelAttributes = {
    Serialization: {},
    ClassMethods: {
      dynamicFields: true,
      primaryKey: 'id',
      destructiveFields: ['id', 'push', 'isValid', 'data', 'changes', 'getAttribute', 'setAttribute', 'unknownProperty', 'setUnknownProperty'],
      field: function(name, options) {
        return this.fields()[name] = new Tower.ModelAttribute(this, name, options);
      },
      fields: function() {
        var fields, name, names, options, _l, _len3, _ref3;
        fields = this.metadata().fields;
        switch (arguments.length) {
          case 0:
            fields;

            break;
          case 1:
            _ref3 = arguments[0];
            for (name in _ref3) {
              options = _ref3[name];
              this.field(name, options);
            }
            break;
          default:
            names = _.args(arguments);
            options = _.extractOptions(names);
            for (_l = 0, _len3 = names.length; _l < _len3; _l++) {
              name = names[_l];
              this.field(name, options);
            }
        }
        return fields;
      },
      _defaultAttributes: function(record) {
        var attributes, field, name, _ref3;
        attributes = {};
        _ref3 = this.fields();
        for (name in _ref3) {
          field = _ref3[name];
          attributes[name] = field.defaultValue(record);
        }
        if (this.isSubClass()) {
          attributes.type || (attributes.type = this.className());
        }
        return attributes;
      },
      initializeAttributes: function(record, attributes) {
        return _.defaults(attributes, this._defaultAttributes(record));
      }
    },
    InstanceMethods: {
      dynamicFields: true,
      attributes: Ember.computed(function() {
        if (arguments.length === 2) {
          throw new Error('Cannot set attributes hash directly');
        }
        return {};
      }).cacheable(),
      modifyAttribute: function(operation, key, value) {
        operation = Tower.StoreModifiers.MAP[operation];
        operation = operation ? operation.replace(/^\$/, '') : 'set';
        return this[operation](key, value);
      },
      atomicallySetAttribute: function() {
        return this.modifyAttribute.apply(this, arguments);
      },
      assignAttributes: function(attributes, options, operation) {
        if (!_.isHash(attributes)) {
          return;
        }
        options || (options = {});
        if (!options.withoutProtection) {
          options.as || (options.as = 'default');
          attributes = this._sanitizeForMassAssignment(attributes, options.as);
        }
        Ember.beginPropertyChanges();
        this._assignAttributes(attributes, options, operation);
        return Ember.endPropertyChanges();
      },
      unknownProperty: function(key) {
        if (this.get('dynamicFields')) {
          return this.getAttribute(key);
        }
      },
      setUnknownProperty: function(key, value) {
        if (this.get('dynamicFields')) {
          return this.setAttribute(key, value);
        }
      },
      getAttribute: function(key) {
        var passedKey, result;
        passedKey = key;
        key = key === '_id' ? 'id' : key;
        if (key === '_cid') {
          result = this._cid;
        }
        if (result === void 0) {
          result = Ember.get(this.get('attributes'), key);
        }
        if (passedKey === 'id' && result === void 0) {
          result = this._cid;
        }
        return result;
      },
      setAttribute: function(key, value, operation) {
        if (key === '_cid') {
          if (value != null) {
            this._cid = value;
          } else {
            delete this._cid;
          }
          this.propertyDidChange('id');
          return value;
        }
        if (Tower.StoreModifiers.MAP.hasOwnProperty(key)) {
          key = key.replace('$', '');
          if (key === 'set') {
            this.assignAttributes(value);
          } else {
            this[key](value);
          }
        } else {
          if (!this.get('isNew') && key === 'id') {
            this.get('attributes')[key] = value;
            return value;
          }
          this._actualSet(key, value);
        }
        this.set('isDirty', _.isPresent(this.get('changedAttributes')));
        return value;
      },
      _actualSet: function(key, value, dispatch) {
        this._updateChangedAttribute(key, value);
        this.get('attributes')[key] = value;
        if (dispatch) {
          this.propertyDidChange(key);
        }
        return value;
      },
      setAttributes: function(attributes) {},
      getEach: function() {
        var fields,
          _this = this;
        fields = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _.map(_.flatten(fields), function(i) {
          return _this.get(i);
        });
      },
      _assignAttributes: function(attributes, options, operation) {
        var item, k, modifiedAttributes, multiParameterAttributes, nestedParameterAttributes, v, _l, _len3, _results;
        multiParameterAttributes = [];
        nestedParameterAttributes = [];
        modifiedAttributes = [];
        for (k in attributes) {
          v = attributes[k];
          if (k.indexOf('(') > -1) {
            multiParameterAttributes.push([k, v]);
          } else if (k.charAt(0) === '$') {
            this.assignAttributes(v, options, k);
          } else {
            if (_.isHash(v)) {
              nestedParameterAttributes.push([k, v]);
            } else {
              this.modifyAttribute(operation, k, v);
            }
          }
        }
        _results = [];
        for (_l = 0, _len3 = nestedParameterAttributes.length; _l < _len3; _l++) {
          item = nestedParameterAttributes[_l];
          _results.push(this.modifyAttribute(operation, item[0], item[1]));
        }
        return _results;
      }
    }
  };

  _ = Tower._;

  Tower.ModelNestedAttributes = {
    ClassMethods: {
      acceptsNestedAttributesFor: function() {
        var keys, mixin, _l, _len3;
        keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        mixin = {};
        for (_l = 0, _len3 = keys.length; _l < _len3; _l++) {
          key = keys[_l];
          mixin["" + key + "Attributes"] = this._defineMethodForNestedAttributes(key);
        }
        return this.reopen(mixin);
      },
      _defineMethodForNestedAttributes: function(key) {
        var relation, type;
        relation = this.relation(key);
        relation.autosave = true;
        this._addAutosaveAssociationCallbacks(relation);
        type = _.camelize(relation.relationType);
        return function(attributes, massAssignmentOptions) {
          if (massAssignmentOptions == null) {
            massAssignmentOptions = {};
          }
          return this["_assignNestedAttributesFor" + type + "Association"](key, attributes, massAssignmentOptions);
        };
      }
    },
    _assignNestedAttributesForCollectionAssociation: function(key, attributesCollection, assignmentOptions) {
      var association, attributeIds, attributes, existingRecord, existingRecords, limit, options, rejected, targetRecord, _l, _len3, _results;
      if (!(_.isHash(attributesCollection) || _.isArray(attributesCollection))) {
        throw new Error("Hash or Array expected, got " + (_.camelize(_.kind(attributesCollection))), attributesCollection);
      }
      options = {};
      limit = options.limit;
      attributesCollection = _.castArray(attributesCollection);
      association = this.constructor.relations()[key].scoped(this);
      existingRecords = association.isLoaded ? association.target : (attributeIds = _.map(attributesCollection, function(i) {
        return i.id;
      }), _.isEmpty(attributeIds) ? attributeIds : association.where(association.cursor.relation.klass().primaryKey, attributeIds));
      _results = [];
      for (_l = 0, _len3 = attributesCollection.length; _l < _len3; _l++) {
        attributes = attributesCollection[_l];
        if (_.isBlank(attributes['id'])) {
          if (!this._callRejectIf(key, attributes)) {
            _results.push(association.build(_.except(attributes, this._unassignableKeys(assignmentOptions)), assignmentOptions));
          } else {
            _results.push(void 0);
          }
        } else if (existingRecord = _.detect(existingRecords, function(record) {
          return record.id.toString() === attributes['id'].toString();
        })) {
          rejected = this._callRejectIf(key, attributes);
          if (!(association.isLoaded || rejected)) {
            targetRecord = _.detect(association.target, function(record) {
              return record.equals(existingRecord);
            });
            if (targetRecord) {
              existingRecord = targetRecord;
            } else {
              association.addToTarget(existingRecord);
            }
          }
          if (!rejected) {
            _results.push(this._assignToOrMarkForDestruction(existingRecord, attributes, options.allow_destroy, assignmentOptions));
          } else {
            _results.push(void 0);
          }
        } else if (assignmentOptions.withoutProtection) {
          _results.push(association.build(_.except(attributes, this._unassignableKeys(assignmentOptions)), assignmentOptions));
        } else {
          _results.push(this);
        }
      }
      return _results;
    },
    _assignNestedAttributesForSingularAssociation: function(key, attributes, assignmentOptions) {
      var association, hasId, options, record, rejected, updatable;
      if (assignmentOptions == null) {
        assignmentOptions = {};
      }
      options = {};
      hasId = !_.isBlank(attributes['id']);
      record = this.get(key);
      updatable = !!(options.updateOnly || (hasId && record && record.get('id').toString() === attributes['id'].toString()));
      rejected = this._callRejectIf(key, attributes);
      if (updatable && !rejected) {
        return this._assignToOrMarkForDestruction(record, attributes, options.allowDestroy, assignmentOptions);
      } else if (!hasId && !assignmentOptions.withoutProtection) {
        return this;
      } else if (!rejected) {
        association = this.getAssociationScope(key);
        if (association) {
          return association.build(_.except(attributes, this._unassignableKeys(assignmentOptions)), assignmentOptions);
        } else {
          throw new Error("Cannot build association " + key + ". Are you trying to build a polymorphic one-to-one association?");
        }
      }
    },
    _assignToOrMarkForDestruction: function(record, attributes, allowDestroy, assignmentOptions) {
      record.assignAttributes(_.except(attributes, this._unassignableKeys(assignmentOptions)), assignmentOptions);
      if (this._hasDestroyFlag(attributes) && allowDestroy) {
        return record.markForDestruction();
      }
    },
    _callRejectIf: function(key, attributes) {
      var callback;
      if (this._hasDestroyFlag(attributes)) {
        return false;
      }
      callback = null;
      switch (typeof callback) {
        case 'string':
          return this[callback].call(this, attributes);
        case 'function':
          return callback.call(this, attributes);
      }
    },
    _unassignableKeys: function(assignmentOptions) {
      if (assignmentOptions.withoutProtection) {
        return ['_destroy'];
      } else {
        return ['id', '_destroy'];
      }
    },
    _hasDestroyFlag: function(attributes) {
      return attributes.hasOwnProperty('_destroy');
    }
  };

  _ = Tower._;

  Tower.ModelAutosaveAssociation = {
    ClassMethods: {
      _addAutosaveAssociationCallbacks: function(association) {
        var isCollection, method, mixin, name, saveMethod, validationMethod;
        name = _.camelize(association.name);
        saveMethod = "_autosaveAssociatedRecordsFor" + name;
        validationMethod = "_validateAssociatedRecordsFor" + name;
        isCollection = association.isCollection;
        mixin = {};
        if (isCollection) {
          this.before('save', '_beforeSaveCollectionAssociation');
          mixin[saveMethod] = function(callback) {
            return this._saveCollectionAssociation(association, callback);
          };
          this.after('create', saveMethod);
          this.after('update', saveMethod);
        } else if (association.isHasOne) {
          mixin[saveMethod] = function(callback) {
            return this._saveHasOneAssociation(association, callback);
          };
          this.after('create', saveMethod);
          this.after('update', saveMethod);
        } else {
          mixin[saveMethod] = function(callback) {
            return this._saveBelongsToAssociation(association, callback);
          };
          this.before('save', saveMethod);
        }
        if (association.validate) {
          method = isCollection ? '_validateCollectionAssociation' : '_validateSingleAssociation';
          mixin[validationMethod] = function(callback) {
            return this[method](association, callback);
          };
        }
        return this.reopen(mixin);
      }
    },
    _beforeSaveCollectionAssociation: function() {
      this.newRecordBeforeSave = this.get('isNew');
      return true;
    },
    _validateSingleAssociation: function(association, callback) {
      var cursor, record;
      cursor = this.getAssociationCursor(association.name);
      if (cursor) {
        record = cursor.objectAt(0);
      }
      if (record) {
        return this._associationIsValid(association, record, callback);
      } else {
        if (callback) {
          callback.call(this);
        }
        return true;
      }
    },
    _validateCollectionAssociation: function(association, callback) {
      var cursor, iterate, records, success,
        _this = this;
      success = void 0;
      cursor = this.getAssociationCursor(association.name);
      if (cursor) {
        records = this._associatedRecordsToValidateOrSave(cursor, this.get('isNew'), association.autosave);
      }
      if (records && records.length) {
        iterate = function(record, next) {
          return _this._associationIsValid(association, record, function(error) {
            if (success !== false) {
              success = !error;
            }
            return next();
          });
        };
        Tower.parallel(records, iterate, function() {
          if (callback) {
            return callback.call(_this, success);
          }
        });
      } else {
        if (callback) {
          callback.call(this, true);
        }
      }
      return success;
    },
    _associationIsValid: function(association, record, callback) {
      var _this = this;
      if (record.get('isDeleted') || record.get('isMarkedForDestruction')) {
        return true;
      }
      return record.validate(function() {
        var array, attribute, error, errors, message, messages, success, _l, _len3, _ref3;
        error = _.isPresent(record.get('errors'));
        if (error) {
          errors = _this.get('errors');
          if (association.autosave) {
            _ref3 = record.get('errors');
            for (attribute in _ref3) {
              messages = _ref3[attribute];
              attribute = "" + association.name + "." + attribute;
              array = errors[attribute] || (errors[attribute] = []);
              for (_l = 0, _len3 = messages.length; _l < _len3; _l++) {
                message = messages[_l];
                array.push(message);
              }
              errors[attribute] = _.uniq(array);
            }
          } else {
            errors[association.name] = ['Invalid'];
          }
        }
        success = !error;
        if (callback) {
          callback.call(_this, error);
        }
        return success;
      });
    },
    _associatedRecordsToValidateOrSave: function(cursor, newRecord, autosave) {
      if (newRecord) {
        return Ember.get(cursor, 'content');
      } else if (autosave) {
        return cursor.filter(function(record) {
          return record._changedForAutosave();
        });
      } else {
        return cursor.filter(function(record) {
          return record.get('isNew');
        });
      }
    },
    _changedForAutosave: function() {
      return this.get('isNew') || this.get('isDirty') || this.get('isMarkedForDestruction') || this._nestedRecordsChangedForAutosave();
    },
    _nestedRecordsChangedForAutosave: function() {
      var _this = this;
      return _.any(this.constructor.relations(), function(association) {
        association = _this.getAssociationScope(association.name);
        return association && _.any(_.compact(_.castArray(association.target)), function(a) {
          return a._changedForAutosave();
        });
      });
    },
    _saveCollectionAssociation: function(association, callback) {
      var _this = this;
      return this._removeOldAssociations(association, function(error) {
        var autosave, createRecord, cursor, foreignKey, records, recordsToDestroy, wasNew;
        if (error) {
          console.log(error);
        }
        if (cursor = _this.getAssociationCursor(association.name)) {
          autosave = association.autosave;
          wasNew = !!_this.newRecordBeforeSave;
          if (records = _this._associatedRecordsToValidateOrSave(cursor, wasNew, autosave)) {
            recordsToDestroy = [];
            delete cursor._markedForDestruction;
            foreignKey = association.foreignKey;
            key = _this.get('id');
            createRecord = function(record, next) {
              if (record.get('isDeleted')) {
                return next();
              } else if (autosave && record.get('isMarkedForDestruction')) {
                return recordsToDestroy.push(record);
              } else if (autosave !== false && (wasNew || record.get('isNew'))) {
                if (autosave) {
                  record.set(foreignKey, key);
                  return record.save({
                    validate: false
                  }, next);
                } else if (!association.nested) {
                  record.set(foreignKey, key);
                  return record.save(next);
                } else {
                  return next();
                }
              } else if (autosave) {
                record.set(foreignKey, key);
                return record.save({
                  validate: false
                }, next);
              } else {
                return next();
              }
            };
            return Tower.parallel(records, createRecord, function(error) {
              if (error) {
                if (callback) {
                  callback.call(_this, error);
                }
                return false;
              } else if (recordsToDestroy.length) {
                return cursor.destroy(recordsToDestroy, function(error) {
                  if (callback) {
                    callback.call(_this, error);
                  }
                  return !error;
                });
              } else {
                if (callback) {
                  callback.call(_this);
                }
                return true;
              }
            });
          } else {
            if (callback) {
              callback.call(_this);
            }
            return true;
          }
        }
      });
    },
    _removeOldAssociations: function(association, callback) {
      var cursor, iterate, records,
        _this = this;
      cursor = this.getAssociationCursor(association.name);
      records = cursor._markedForDestruction;
      delete cursor._markedForDestruction;
      if (records && records.length) {
        iterate = function(record, next) {
          return record.save(function(error) {
            return next(error);
          });
        };
        return Tower.parallel(records, iterate, function(error) {
          return callback.call(_this, error);
        });
      } else {
        return callback.call(this);
      }
    },
    _saveHasOneAssociation: function(association, callback) {
      var autosave, foreignKey, record,
        _this = this;
      record = this.get(association.name);
      if (record && !record.get('isDeleted')) {
        autosave = association.autosave;
        if (autosave && record.get('isMarkedForDestruction')) {
          return record.destroy(callback);
        } else {
          key = this.get(association.primaryKey ? association.primaryKey : 'id');
          foreignKey = association.foreignKey;
          if (autosave !== false && !this.get('isNew') && (record.get('isNew') || record.get(foreignKey) !== key)) {
            if (!association.isHasManyThrough) {
              record.set(foreignKey, key);
            }
            return record.save({
              validate: !autosave
            }, function(error) {
              callback.call(_this, error);
              return !error;
            });
          } else {
            return callback.call(this);
          }
        }
      } else {
        if (callback) {
          callback.call(this);
        }
        return true;
      }
    },
    _saveBelongsToAssociation: function(association, callback) {
      var autosave, record, saved,
        _this = this;
      record = this.get(association.name);
      if (record && !record.get('isDeleted')) {
        autosave = association.autosave;
        if (autosave && record.get('isMarkedForDestruction')) {
          return record.destroy(callback);
        } else if (autosave !== false) {
          saved = false;
          if (record.get('isNew') || (autosave && record._changedForAutosave())) {
            record.save({
              validate: !autosave
            }, function(error) {
              saved = !error;
              if (!error) {
                _this.set(association.foreignKey, record.get(association.primaryKey || 'id'));
              }
              return _["return"](_this, callback, error);
            });
          } else {
            saved = true;
            if (callback) {
              callback.call(this);
            }
          }
          return saved;
        } else {
          if (callback) {
            callback.call(this);
          }
          return true;
        }
      } else {
        if (callback) {
          callback.call(this);
        }
        return true;
      }
    }
  };

  _ = Tower._;

  Tower.ModelPersistence = {
    ClassMethods: {
      "new": Ember.Object.create,
      store: function(value) {
        var defaultStore, metadata, store, type;
        metadata = this.metadata();
        store = metadata.store;
        if (arguments.length === 0 && store) {
          return store;
        }
        defaultStore = this["default"]('store') || Tower.Model["default"]('store') || Tower.StoreMemory;
        type = typeof value;
        if (type === 'function') {
          store = new value({
            name: metadata.namePlural,
            type: Tower.namespaced(metadata.className)
          });
        } else if (type === 'object') {
          store || (store = new defaultStore({
            name: metadata.namePlural,
            type: Tower.namespaced(metadata.className)
          }));
          _.extend(store, value);
        } else if (value) {
          store = value;
        }
        store || (store = new defaultStore({
          name: metadata.namePlural,
          type: Tower.namespaced(metadata.className)
        }));
        return metadata.store = store;
      },
      load: function(records, action) {
        return this.store().load(records, action);
      },
      unload: function(records) {
        return this.store().unload(records);
      },
      empty: function() {
        return this.store().clean();
      }
    },
    InstanceMethods: {
      store: Ember.computed(function() {
        return this.constructor.store();
      }),
      save: function(options, callback) {
        var _this = this;
        if (typeof options === 'function') {
          callback = options;
          options = {};
        }
        options || (options = {});
        if (this.get('isSaving')) {
          if (callback) {
            callback.call(this);
          }
          return true;
        }
        this.set('isSaving', true);
        this.get('transaction').adopt(this);
        if (this.readOnly) {
          throw new Error('Record is read only');
        }
        if (options.validate !== false) {
          return this.validate(function(error) {
            error || (error = _.isPresent(_this.get('errors')));
            if (error) {
              _this.set('isValid', false);
              _this.set('isSaving', false);
              if (callback) {
                return callback.call(_this);
              } else {
                throw new Error(_.flatten(_.values(_this.errors)).join('. '));
              }
            } else {
              _this.set('isValid', true);
              return _this._save(callback);
            }
          });
        } else {
          return this._save(callback);
        }
      },
      updateAttributes: function(attributes, callback) {
        this.assignAttributes(attributes);
        return this.save(callback);
      },
      updateAttribute: function(key, value, options, callback) {
        switch (typeof options) {
          case 'string':
            options = {
              operation: options
            };
            break;
          case 'function':
            callback = options;
            options = {};
        }
        options || (options = {});
        if (options.atomic) {
          return this.atomicUpdateAttribute(key, value, options.operation, callback);
        } else {
          this.modifyAttribute(options.operation, key, value);
          return this.save(options, callback);
        }
      },
      atomicallyUpdateAttributes: function(attributes, callback) {},
      atomicallyUpdateAttribute: function(key, value, operation, callback) {
        var updates;
        if (typeof operation === 'function') {
          callback = operation;
          operation = void 0;
        }
        this.modifyAttribute(operation, key, value);
        this.get('data').strip(key);
        updates = {};
        updates[key] = value;
        return this.constructor.scoped({
          instantiate: false,
          noDefault: true
        }).update(this.get('id'), updates, callback);
      },
      destroy: function(callback) {
        if (this.get('isNew')) {
          this.set('isDeleted', true);
          callback.call(this, callback ? null : void 0);
        } else {
          this._destroy(callback);
        }
        return this;
      },
      reload: function(callback) {
        var _this = this;
        this.constructor.find(this.get('id'), function(error, freshRecord) {
          _this._merge(freshRecord);
          if (callback) {
            return callback.call(_this, error);
          }
        });
        return this;
      },
      _merge: function(record) {
        _.extend(this.get('attributes'), record.get('attributes'));
        this.propertyDidChange('data');
        _.extend(this.get('changedAttributes'), record.get('changedAttributes'));
        if (record.get('previousChanges')) {
          _.extend(this.get('previousChanges'), record.get('previousChanges'));
        }
        return this;
      },
      refresh: function(callback) {
        var _this = this;
        this.set('isSyncing', true);
        this.constructor.where({
          id: this.get('id')
        }).limit(1).fetch(function(error, freshRecord) {
          _this._merge(freshRecord);
          _this.set('isSyncing', false);
          if (callback) {
            return callback.call(_this, error);
          }
        });
        return this;
      },
      rollback: function() {
        _.extend(this.get('attributes'), this.get('changedAttributes'));
        _.clean(this.get('changedAttributes'), {});
        return this.propertyDidChange('data');
      },
      commit: function() {
        this.set('previousChanges', this.get('changes'));
        _.clean(this.get('changedAttributes'));
        return this.set('isDirty', false);
      },
      _save: function(callback) {
        var _this = this;
        this.runCallbacks('save', function(block) {
          var complete;
          complete = Tower.callbackChain(block, callback);
          if (_this.get('isNew')) {
            return _this._create(complete);
          } else {
            return _this._update(complete);
          }
        });
        return void 0;
      },
      _create: function(callback) {
        var _this = this;
        this.runCallbacks('create', function(block) {
          var complete;
          complete = Tower.callbackChain(block, callback);
          return _this.constructor.scoped({
            instantiate: false,
            noDefault: true
          }).insert(_this, function(error) {
            if (error && !callback) {
              throw error;
            }
            _this.set('isSaving', false);
            if (!error) {
              _this.set('isNew', false);
              _this.commit();
            }
            return complete.call(_this, error);
          });
        });
        return void 0;
      },
      _update: function(callback) {
        var _this = this;
        this.runCallbacks('update', function(block) {
          var complete;
          complete = Tower.callbackChain(block, callback);
          return _this.constructor.scoped({
            instantiate: false,
            noDefault: true
          }).update(_this.get('id'), _this, function(error) {
            if (error && !callback) {
              throw error;
            }
            _this.set('isSaving', false);
            if (!error) {
              _this.set('isNew', false);
              _this.commit();
            }
            return complete.call(_this, error);
          });
        });
        return void 0;
      },
      _destroy: function(callback) {
        var _this = this;
        this.runCallbacks('destroy', function(block) {
          var complete;
          complete = Tower.callbackChain(block, callback);
          return _this.constructor.scoped({
            instantiate: false,
            noDefault: true
          }).destroy(_this, function(error) {
            if (error && !callback) {
              throw error;
            }
            if (!error) {
              return _this.destroyRelations(function(error) {
                _this.set('isNew', false);
                _this.set('isDeleted', true);
                return complete.call(_this, error);
              });
            } else {
              return complete.call(_this, error);
            }
          });
        });
        return void 0;
      }
    }
  };

  _ = Tower._;

  Tower.ModelScopes = {
    ClassMethods: {
      scope: function(name, scope) {
        scope = scope instanceof Tower.ModelScope ? scope : this.where(scope);
        return this[name] = function() {
          return this.scoped().where(scope.cursor);
        };
      },
      scoped: function(options) {
        var cursor, defaultScope;
        if (options == null) {
          options = {};
        }
        cursor = this.cursor(options);
        if (!options.noDefault) {
          defaultScope = this.defaults().scope;
        }
        if (defaultScope) {
          return defaultScope.where(cursor);
        } else {
          return new Tower.ModelScope(cursor);
        }
      },
      cursor: function(options) {
        var cursor;
        if (options == null) {
          options = {};
        }
        options.model = this;
        cursor = Tower.ModelCursor.make();
        cursor.make(options);
        if (this.baseClass().className() !== this.className()) {
          cursor.where({
            type: this.className()
          });
        }
        return cursor;
      },
      unscoped: function() {
        return this.scoped({
          noDefault: true
        });
      },
      toCursor: function() {
        return this.cursor.apply(this, arguments);
      }
    }
  };

  _ref3 = Tower.ModelScope.queryMethods;
  _fn2 = function(key) {
    return Tower.ModelScopes.ClassMethods[key] = function() {
      var _ref4;
      return (_ref4 = this.scoped())[key].apply(_ref4, arguments);
    };
  };
  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
    key = _ref3[_l];
    _fn2(key);
  }

  _ref4 = Tower.ModelScope.finderMethods;
  _fn3 = function(key) {
    return Tower.ModelScopes.ClassMethods[key] = function() {
      var _ref5;
      return (_ref5 = this.scoped())[key].apply(_ref5, arguments);
    };
  };
  for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
    key = _ref4[_m];
    _fn3(key);
  }

  _ref5 = Tower.ModelScope.persistenceMethods;
  _fn4 = function(key) {
    return Tower.ModelScopes.ClassMethods[key] = function() {
      var _ref6;
      return (_ref6 = this.scoped())[key].apply(_ref6, arguments);
    };
  };
  for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
    key = _ref5[_n];
    _fn4(key);
  }

  _ = Tower._;

  Tower.ModelSerialization = {
    toJSON: function(options) {
      return this._serializableHash(options);
    },
    clone: function() {
      var attributes, value;
      attributes = _.clone(this.toJSON());
      delete attributes.id;
      for (key in attributes) {
        value = attributes[key];
        if (_.isArray(value)) {
          attributes[key] = value.concat();
        }
      }
      return this.constructor.build(attributes);
    },
    _serializableHash: function(options) {
      var attributeNames, cid, except, fields, i, include, includes, methodNames, methods, name, only, opts, record, records, result, tmp, _len6, _len7, _len8, _len9, _o, _p, _q, _r;
      if (options == null) {
        options = {};
      }
      result = {};
      fields = this.get('fields');
      attributeNames = _.keys(this.constructor.fields());
      if (only = options.only) {
        attributeNames = _.union(_.toArray(only), attributeNames);
      } else if (except = options.except) {
        attributeNames = _.difference(_.toArray(except), attributeNames);
      }
      if (fields && fields.length) {
        fields.push('id');
        attributeNames = _.intersection(attributeNames, fields);
      }
      for (_o = 0, _len6 = attributeNames.length; _o < _len6; _o++) {
        name = attributeNames[_o];
        result[name] = this._readAttributeForSerialization(name);
      }
      cid = this._readAttributeForSerialization('_cid');
      if (cid != null) {
        result._cid = cid;
        if (result.id === cid) {
          delete result.id;
        }
      }
      if (methods = options.methods) {
        methodNames = _.toArray(methods);
        for (_p = 0, _len7 = methods.length; _p < _len7; _p++) {
          name = methods[_p];
          result[name] = this[name]();
        }
      }
      if (includes = options.include) {
        includes = _.toArray(includes);
        for (_q = 0, _len8 = includes.length; _q < _len8; _q++) {
          include = includes[_q];
          if (!_.isHash(include)) {
            tmp = {};
            tmp[include] = {};
            include = tmp;
            tmp = void 0;
          }
          for (name in include) {
            opts = include[name];
            records = this[name]().all();
            for (i = _r = 0, _len9 = records.length; _r < _len9; i = ++_r) {
              record = records[i];
              records[i] = record._serializableHash(opts);
            }
            result[name] = records;
          }
        }
      }
      return result;
    },
    _readAttributeForSerialization: function(name, type) {
      if (type == null) {
        type = 'json';
      }
      return this.get(name);
    }
  };

  _ = Tower._;

  Tower.ModelStates = {
    isLoaded: false,
    isDirty: false,
    isSaving: false,
    isDeleted: false,
    isError: false,
    isNew: true,
    isValid: true,
    isSyncing: false,
    isMarkedForDestruction: false
  };

  _ = Tower._;

  Tower.ModelValidator = (function() {

    __defineStaticProperty(ModelValidator,  "keys", {
      presence: 'presence',
      required: 'required',
      count: 'length',
      length: 'length',
      min: 'min',
      max: 'max',
      gte: 'gte',
      '>=': 'gte',
      gt: 'gt',
      '>': 'gt',
      lte: 'lte',
      '<=': 'lte',
      lt: 'lt',
      '<': 'lt',
      format: 'format',
      uniq: 'uniqueness',
      unique: 'uniqueness',
      uniqueness: 'uniqueness',
      "in": 'in',
      notIn: 'notIn',
      except: 'except',
      only: 'only',
      accepts: 'accepts'
    });

    __defineStaticProperty(ModelValidator,  "createAll", function(attributes, validations) {
      var options, validatorOptions, validators, value;
      if (validations == null) {
        validations = {};
      }
      options = _.moveProperties({}, validations, 'on', 'if', 'unless', 'allow', 'scope');
      validators = [];
      for (key in validations) {
        value = validations[key];
        validatorOptions = _.clone(options);
        if (_.isHash(value)) {
          validatorOptions = _.moveProperties(validatorOptions, value, 'on', 'if', 'unless', 'allow', 'scope');
        }
        validators.push(Tower.ModelValidator.create(key, value, attributes, validatorOptions));
      }
      return validators;
    });

    __defineStaticProperty(ModelValidator,  "create", function(name, value, attributes, options) {
      var _results;
      if (typeof name === 'object') {
        attributes = value;
        _results = [];
        for (key in name) {
          value = name[key];
          _results.push(this._create(key, value, attributes, options));
        }
        return _results;
      } else {
        return this._create(name, value, attributes, options);
      }
    });

    __defineStaticProperty(ModelValidator,  "_create", function(name, value, attributes, options) {
      switch (name) {
        case 'presence':
        case 'required':
          return new Tower.ModelValidatorPresence(name, value, attributes, options);
        case 'count':
        case 'length':
        case 'min':
        case 'max':
        case 'gte':
        case 'gt':
        case 'lte':
        case 'lt':
          return new Tower.ModelValidatorLength(name, value, attributes, options);
        case 'format':
          return new Tower.ModelValidatorFormat(name, value, attributes, options);
        case 'in':
        case 'only':
        case 'values':
        case 'accepts':
          return new Tower.ModelValidatorSet('in', value, attributes, options);
        case 'except':
        case 'notIn':
          return new Tower.ModelValidatorSet('notIn', value, attributes, options);
        case 'uniqueness':
        case 'unique':
          return new Tower.ModelValidatorUniqueness(name, value, attributes, options);
      }
    });

    function ModelValidator(name, value, attributes, options) {
      if (options == null) {
        options = {};
      }
      this.name = name;
      this.value = value;
      this.attributes = _.castArray(attributes);
      this.options = options;
    }

    __defineProperty(ModelValidator,  "on", function(action) {
      var value;
      value = this.options.on;
      if (!value) {
        return true;
      }
      if (typeof value === 'string') {
        return value === action;
      }
      return _.include(value, action);
    });

    __defineProperty(ModelValidator,  "validateEach", function(record, errors, callback) {
      var success,
        _this = this;
      success = void 0;
      this.check(record, function(error, result) {
        var iterator;
        success = result;
        if (success) {
          iterator = function(attribute, next) {
            return _this.validate(record, attribute, errors, function(error) {
              return next();
            });
          };
          return Tower.parallel(_this.attributes, iterator, function(error) {
            success = !error;
            if (callback) {
              return callback.call(_this, error);
            }
          });
        } else {
          if (callback) {
            return callback.call(_this, error);
          }
        }
      });
      return success;
    });

    __defineProperty(ModelValidator,  "check", function(record, callback) {
      var options,
        _this = this;
      options = this.options;
      if (options["if"]) {
        return this._callMethod(record, options["if"], function(error, result) {
          return callback.call(_this, error, !!result);
        });
      } else if (options.unless) {
        return this._callMethod(record, options.unless, function(error, result) {
          return callback.call(_this, error, !!!result);
        });
      } else {
        return callback.call(this, null, true);
      }
    });

    __defineProperty(ModelValidator,  "success", function(callback) {
      if (callback) {
        callback.call(this);
      }
      return true;
    });

    __defineProperty(ModelValidator,  "failure", function(record, attribute, errors, message, callback) {
      errors[attribute] || (errors[attribute] = []);
      errors[attribute].push(message);
      if (callback) {
        callback.call(this, message);
      }
      return false;
    });

    __defineProperty(ModelValidator,  "getValue", function(binding) {
      if (typeof this.value === 'function') {
        return this.value.call(binding);
      } else {
        return this.value;
      }
    });

    __defineProperty(ModelValidator,  "_callMethod", function(binding, method, callback) {
      var _this = this;
      if (typeof method === 'string') {
        method = binding[method];
      }
      switch (method.length) {
        case 0:
          callback.call(this, null, method.call(binding));
          break;
        default:
          method.call(binding, function(error, result) {
            return callback.call(_this, error, result);
          });
      }
      return void 0;
    });

    return ModelValidator;

  })();

  _ = Tower._;

  Tower.ModelValidatorFormat = (function(_super) {
    var ModelValidatorFormat;

    ModelValidatorFormat = __extends(ModelValidatorFormat, _super);

    function ModelValidatorFormat(name, value, attributes, options) {
      ModelValidatorFormat.__super__.constructor.call(this, name, value, attributes, options);
      if (this.value.hasOwnProperty('value')) {
        this.value = this.value.value;
      }
      if (typeof this.value === 'string') {
        this.matcher = "is" + (_.camelCase(value, true));
      }
    }

    __defineProperty(ModelValidatorFormat,  "validate", function(record, attribute, errors, callback) {
      var success, value;
      value = record.get(attribute);
      success = this.matcher ? !!_[this.matcher](value) : !!this.value.exec(value);
      if (!success) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.format', {
          attribute: attribute,
          value: this.value.toString()
        }), callback);
      } else {
        return this.success(callback);
      }
    });

    return ModelValidatorFormat;

  })(Tower.ModelValidator);

  _ = Tower._;

  Tower.ModelValidatorLength = (function(_super) {
    var ModelValidatorLength;

    ModelValidatorLength = __extends(ModelValidatorLength, _super);

    function ModelValidatorLength(name, value, attributes, options) {
      name = this.valueCheck(name, value);
      value = value[name] || (value[name] = value);
      ModelValidatorLength.__super__.constructor.apply(this, arguments);
      this.validate = (function() {
        switch (name) {
          case 'min':
            return this.validateMinimum;
          case 'max':
            return this.validateMaximum;
          case 'gte':
            return this.validateGreaterThanOrEqual;
          case 'gt':
            return this.validateGreaterThan;
          case 'lte':
            return this.validateLessThanOrEqual;
          case 'lt':
            return this.validateLessThan;
          default:
            return this.validateLength;
        }
      }).call(this);
    }

    __defineProperty(ModelValidatorLength,  "validateGreaterThanOrEqual", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(value >= this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.minimum', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "validateGreaterThan", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(value > this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.minimum', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "validateLessThanOrEqual", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(value <= this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.minimum', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "validateLessThan", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(value < this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.minimum', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "validateMinimum", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(typeof value === 'number' && value >= this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.minimum', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "validateMaximum", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(typeof value === 'number' && value <= this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.maximum', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "validateLength", function(record, attribute, errors, callback) {
      var value;
      value = record.get(attribute);
      if (typeof value === 'string') {
        value = value.length;
      }
      if (!(typeof value === 'number' && value === this.getValue(record))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.length', {
          attribute: attribute,
          value: this.value
        }), callback);
      }
      return this.success(callback);
    });

    __defineProperty(ModelValidatorLength,  "valueCheck", function(name, value) {
      if (typeof value === 'object') {
        for (key in value) {
          if (key === "min" || key === "max" || key === "gte" || key === "gt" || key === "lte" || key === "lt") {
            return key;
          }
        }
      }
      return name;
    });

    return ModelValidatorLength;

  })(Tower.ModelValidator);

  _ = Tower._;

  Tower.ModelValidatorPresence = (function(_super) {
    var ModelValidatorPresence;

    function ModelValidatorPresence() {
      return ModelValidatorPresence.__super__.constructor.apply(this, arguments);
    }

    ModelValidatorPresence = __extends(ModelValidatorPresence, _super);

    __defineProperty(ModelValidatorPresence,  "validate", function(record, attribute, errors, callback) {
      if (!_.isPresent(record.get(attribute))) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.presence', {
          attribute: attribute
        }), callback);
      }
      return this.success(callback);
    });

    return ModelValidatorPresence;

  })(Tower.ModelValidator);

  _ = Tower._;

  Tower.ModelValidatorSet = (function(_super) {
    var ModelValidatorSet;

    ModelValidatorSet = __extends(ModelValidatorSet, _super);

    function ModelValidatorSet(name, value, attributes, options) {
      ModelValidatorSet.__super__.constructor.call(this, name, _.castArray(value), attributes, options);
    }

    __defineProperty(ModelValidatorSet,  "validate", function(record, attribute, errors, callback) {
      var success, testValue, value;
      value = record.get(attribute);
      testValue = this.getValue(record);
      success = (function() {
        switch (this.name) {
          case 'in':
            return _.indexOf(testValue, value) > -1;
          case 'notIn':
            return _.indexOf(testValue, value) === -1;
          default:
            return false;
        }
      }).call(this);
      if (!success) {
        return this.failure(record, attribute, errors, Tower.t('model.errors.format', {
          attribute: attribute,
          value: testValue.toString()
        }), callback);
      } else {
        return this.success(callback);
      }
    });

    return ModelValidatorSet;

  })(Tower.ModelValidator);

  _ = Tower._;

  Tower.ModelValidatorUniqueness = (function(_super) {
    var ModelValidatorUniqueness;

    ModelValidatorUniqueness = __extends(ModelValidatorUniqueness, _super);

    function ModelValidatorUniqueness(name, value, attributes, options) {
      ModelValidatorUniqueness.__super__.constructor.call(this, name, value, attributes, options);
    }

    __defineProperty(ModelValidatorUniqueness,  "validate", function(record, attribute, errors, callback) {
      var conditions, scope, value,
        _this = this;
      value = record.get(attribute);
      conditions = {};
      conditions[attribute] = value;
      scope = this.value;
      if (_.isHash(scope)) {
        scope = this.value.scope;
      }
      if (typeof scope === 'string') {
        conditions[scope] = record.get(scope);
      }
      return record.constructor.where(conditions).exists(function(error, result) {
        if (result) {
          return _this.failure(record, attribute, errors, Tower.t('model.errors.uniqueness', {
            attribute: attribute,
            value: value
          }), callback);
        } else {
          return _this.success(callback);
        }
      });
    });

    return ModelValidatorUniqueness;

  })(Tower.ModelValidator);

  _ = Tower._;

  Tower.ModelValidations = {
    ClassMethods: {
      validates: function() {
        var attributes, newValidators, options, validator, validators, _len6, _o;
        attributes = _.args(arguments);
        options = attributes.pop();
        validators = this.validators();
        newValidators = Tower.ModelValidator.createAll(attributes, options);
        for (_o = 0, _len6 = newValidators.length; _o < _len6; _o++) {
          validator = newValidators[_o];
          validators.push(validator);
        }
        return this;
      },
      validators: function() {
        var fields;
        switch (arguments.length) {
          case 0:
            return this.metadata().validators;
          case 1:
            return this.fields()[arguments[0]].validators();
          default:
            fields = this.fields();
            return _.inject(_.args(arguments), (function(name) {
              return fields[name].validators();
            }), {});
        }
      }
    },
    InstanceMethods: {
      validate: function(callback) {
        var success,
          _this = this;
        success = false;
        this.runCallbacks('validate', function(block) {
          var complete, errors, isNew, iterator, validators;
          complete = _this._callback(block, callback);
          validators = _this.constructor.validators();
          errors = {};
          _this.set('errors', errors);
          isNew = _this.get('isNew');
          iterator = function(validator, next) {
            if (!isNew && !validator.on('update')) {
              return next();
            } else {
              return validator.validateEach(_this, errors, next);
            }
          };
          Tower.async(validators, iterator, function(error) {
            var value;
            if (!(_.isPresent(errors) || error)) {
              success = true;
            }
            if (Tower.isClient) {
              for (key in errors) {
                value = errors[key];
                _this.set("errors." + key, value);
              }
            }
            return complete.call(_this);
          });
          return success;
        });
        return success;
      },
      equals: function(object) {
        if (object instanceof Tower.Model) {
          return this.get('id').toString() === object.get('id').toString();
        } else {
          return false;
        }
      }
    }
  };

  _ = Tower._;

  Tower.ModelTimestamp = {
    ClassMethods: {
      timestamps: function() {
        this.field('createdAt', {
          type: 'Date'
        });
        this.field('updatedAt', {
          type: 'Date'
        });
        this.before('create', 'setCreatedAt');
        this.before('save', 'setUpdatedAt');
        return this.include({
          setCreatedAt: function() {
            return this.set('createdAt', new Date);
          },
          setUpdatedAt: function() {
            return this.set('updatedAt', new Date);
          }
        });
      }
    }
  };

  _ = Tower._;

  Tower.ModelTransactions = {
    ClassMethods: {
      transaction: function(block) {
        var transaction;
        transaction = new Tower.StoreTransaction;
        if (block) {
          block.call(this, transaction);
        }
        return transaction;
      }
    },
    InstanceMethods: {
      transaction: Ember.computed(function() {
        return new Tower.StoreTransaction;
      }).cacheable(),
      save: function() {
        this.get('transaction').adopt(this);
        return this._super.apply(this, arguments);
      }
    }
  };

  _ = Tower._;

  Tower.ModelOperations = {
    push: function(key, value) {
      return _.oneOrMany(this, this._push, key, value);
    },
    pushEach: function(key, value) {
      return _.oneOrMany(this, this._push, key, value, true);
    },
    pull: function(key, value) {
      return _.oneOrMany(this, this._pull, key, value);
    },
    pullEach: function(key, value) {
      return _.oneOrMany(this, this._pull, key, value, true);
    },
    inc: function(key, value) {
      return _.oneOrMany(this, this._inc, key, value);
    },
    add: function(key, value) {
      return _.oneOrMany(this, this._add, key, value);
    },
    addEach: function(key, value) {
      return _.oneOrMany(this, this._add, key, value, true);
    },
    unset: function() {
      var keys, _len6, _o;
      keys = _.flatten(_.args(arguments));
      for (_o = 0, _len6 = keys.length; _o < _len6; _o++) {
        key = keys[_o];
        delete this[key];
      }
      return void 0;
    },
    _set: function(key, value) {
      if (Tower.StoreModifiers.MAP.hasOwnProperty(key)) {
        return this[key.replace('$', '')](value);
      } else {
        return this;
      }
    },
    _push: function(key, value, array) {
      var currentValue;
      if (array == null) {
        array = false;
      }
      currentValue = this.getAttribute(key);
      currentValue || (currentValue = []);
      currentValue = this._clonedValue(currentValue);
      if (array) {
        currentValue = currentValue.concat(_.castArray(value));
      } else {
        currentValue.push(value);
      }
      return this._actualSet(key, currentValue, true);
    },
    _pull: function(key, value, array) {
      var currentValue, item, _len6, _o, _ref6;
      if (array == null) {
        array = false;
      }
      currentValue = this._clonedValue(this.getAttribute(key));
      if (!currentValue) {
        return null;
      }
      if (array) {
        _ref6 = _.castArray(value);
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          item = _ref6[_o];
          currentValue.splice(_.toStringIndexOf(currentValue, item), 1);
        }
      } else {
        currentValue.splice(_.toStringIndexOf(currentValue, value), 1);
      }
      return this._actualSet(key, currentValue, true);
    },
    _add: function(key, value, array) {
      var currentValue, item, _len6, _o, _ref6;
      if (array == null) {
        array = false;
      }
      currentValue = this.getAttribute(key);
      currentValue || (currentValue = []);
      currentValue = this._clonedValue(currentValue, true);
      if (array) {
        _ref6 = _.castArray(value);
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          item = _ref6[_o];
          if (_.indexOf(currentValue, item) === -1) {
            currentValue.push(item);
          }
        }
      } else {
        if (_.indexOf(currentValue, value) === -1) {
          currentValue.push(value);
        }
      }
      return this._actualSet(key, currentValue, true);
    },
    _inc: function(key, value) {
      var currentValue;
      currentValue = this.getAttribute(key);
      currentValue || (currentValue = 0);
      currentValue += value;
      return this._actualSet(key, currentValue, true);
    },
    _getField: function(key) {
      return this.constructor.fields()[key];
    },
    _clonedValue: function(value) {
      if (_.isArray(value)) {
        return value.concat();
      } else if (_.isDate(value)) {
        return new Date(value.getTime());
      } else if (typeof value === 'object') {
        return _.clone(value);
      } else {
        return value;
      }
    },
    _defaultValue: function(key) {
      var field;
      if (field = this._getField(key)) {
        return field.defaultValue(this);
      }
    }
  };

  Tower.ModelOperations.remove = Tower.ModelOperations.pull;

  Tower.ModelOperations.removeEach = Tower.ModelOperations.pullEach;

  _ = Tower._;

  Tower.ModelHierarchical = {
    ClassMethods: {
      hierarchical: function(options) {
        if (options == null) {
          options = {};
        }
        this.metadata().lft = options.lft || (options.lft = 'lft');
        this.metadata().rgt = options.rgt || (options.rgt = 'rgt');
        this.metadata().parentId = options.parentId || (options.parentId = 'parentId');
        this.field(options.lft, {
          type: 'Integer'
        });
        this.field(options.rgt, {
          type: 'Integer'
        });
        return this.field(options.parentId, {
          type: 'Integer'
        });
      },
      root: function(callback) {
        return this.roots().first(callback);
      },
      roots: function() {
        var conditions, metadata;
        metadata = this.metadata();
        conditions = {};
        conditions[metadata.parentId] = null;
        return this.where(conditions).asc(metadata.lft);
      },
      leaves: function() {
        var metadata;
        metadata = this.metadata();
        return this.where("" + metadata.rgt + " - " + metadata.lft + " = 1").asc(metadata.lft);
      }
    },
    isRoot: function() {
      return !!!this.get(this.metadata().parentId);
    },
    root: function(callback) {
      var conditions, metadata;
      metadata = this.metadata();
      conditions = {};
      conditions[metadata.parentId] = null;
      return this.selfAndAncestors().where(conditions).first(callback);
    },
    selfAndAncestors: function() {
      return this.nestedSetScope().where({
        lft: {
          '<=': this.get('lft')
        },
        rgt: {
          '>=': this.get('rgt')
        }
      });
    },
    ancestors: function() {
      return this.withoutSelf(this.selfAndAncestors);
    },
    selfAndSiblings: function() {
      var conditions, metadata;
      metadata = this.metadata();
      conditions = {};
      conditions[metadata.parentId] = this.get(metadata.parentId);
      return this.nestedSetScope().where(conditions);
    },
    siblings: function() {
      return this.withoutSelf(this.selfAndSiblings());
    },
    leaves: function() {
      var metadata;
      metadata = this.metadata();
      return this.descendants().where("" + metadata.rgt + " - " + metadata.lft + " = 1").asc(metadata.lft);
    },
    level: function(callback) {
      var metadata;
      metadata = this.metadata();
      if (this.get(metadata.parentId) === null) {
        return 0;
      } else {
        return this.ancestors().count(callback);
      }
    },
    selfAndDescendants: function() {
      return this.nestedSetScope().where({
        lft: {
          '>=': this.get('lft')
        },
        rgt: {
          '<=': this.get('rgt')
        }
      });
    },
    nestedSetScope: function() {
      return this.constructor.where({
        id: this.get('id')
      });
    },
    descendants: function() {
      return this.withoutSelf(this.selfAndDescendants());
    },
    isDescendantOf: function(other) {
      return other.get('lft') < this.get('lft') && this.get('rgt') < this.get('rgt') && this.isSameScope(other);
    },
    moveLeft: function() {
      return this.moveToLeftOf(this.leftSibling());
    },
    moveRight: function() {
      return this.moveToRightOf(this.rightSibling());
    },
    moveToLeftOf: function(node) {
      return this.moveTo(node, 'lft');
    },
    moveToRightOf: function(node) {
      return this.moveTo(node, 'rgt');
    },
    moveToChildOf: function(node) {
      return this.moveTo(node, 'child');
    },
    moveToRoot: function() {
      return this.moveTo(null, 'root');
    },
    moveTo: function(target, position) {
      return this.runCallbacks('move', function() {});
    },
    isOrIsDescendantOf: function(other) {
      return other.get('lft') <= this.get('lft') && this.get('lft') < other.get('right') && this.isSameScope(other);
    },
    isAncestorOf: function(other) {
      return this.get('lft') < other.get('lft') && other.get('lft') < this.get('right') && this.isSameScope(other);
    },
    isOrIsAncestorOf: function(other) {
      return this.get('lft') <= other.get('lft') && other.get('lft') < this.get('right') && this.isSameScope(other);
    },
    isSameScope: function(other) {
      return Array(actsAsNestedSetOptions.scope).all(function(attr) {
        return this.get(attr) === other.get(attr);
      });
    },
    leftSibling: function(callback) {
      var conditions, metadata;
      metadata = this.constructor.metadata();
      conditions = {};
      conditions[metadata.lft] = {
        $lt: this.get('lft')
      };
      return siblings.where(conditions).desc(metadata.lft).last(callback);
    },
    rightSibling: function(callback) {
      var conditions, metadata;
      metadata = this.constructor.metadata();
      conditions = {};
      conditions[metadata.lft] = {
        $gt: this.get('lft')
      };
      return siblings.where(conditions).first(callback);
    }
  };

  _ = Tower._;

  /*
  class App.Ability extends Tower.Ability
    assign: ->
      user = @get('user')
      
      @can 'read', App.Post
      # in this case you might not check for it, so you don't need to make the db call,
      # should do lazy loading with a function
      # @todo should be able to do this but can't
      # @can 'update', user.get('groups')
      # hasManyThrough.appendFindConditions is the issue.
      @can 'update', user.get('groups').all()
      @can 'manage', user.get('memberships')
      # @todo 'create' actions should add id to cursor.
      @can 'read', 'create', App.Membership
      #if user.hasRole('admin')
      #  @
      @
  */


  Tower.Ability = (function(_super) {
    var Ability;

    function Ability() {
      return Ability.__super__.constructor.apply(this, arguments);
    }

    Ability = __extends(Ability, _super);

    __defineProperty(Ability,  "rules", Ember.computed(function() {
      return [];
    }).cacheable());

    __defineProperty(Ability,  "actions", {
      read: ['index', 'show'],
      create: ['new', 'create'],
      update: ['edit', 'update'],
      modify: ['update', 'destroy'],
      manage: ['create', 'read', 'modify']
    });

    __defineProperty(Ability,  "action", function() {
      var actions, args, array, options, _name;
      args = _.flatten(_.args(arguments));
      options = _.extractOptions(args);
      actions = this.get('actions');
      array = actions[_name = options.to] || (actions[_name] = []);
      actions[options.to] = array.concat(args);
      return this;
    });

    __defineProperty(Ability,  "authorize", function(action, subject, callback) {
      return this._testRules(action, subject, callback);
    });

    __defineProperty(Ability,  "can", function() {
      var actions, scopes, stripArgs,
        _this = this;
      actions = [];
      scopes = [];
      stripArgs = function(args) {
        var arg, _len6, _o, _results;
        _results = [];
        for (_o = 0, _len6 = args.length; _o < _len6; _o++) {
          arg = args[_o];
          if (typeof arg === 'string') {
            if (arg === 'all') {
              scopes.push(arg);
              break;
            } else {
              _results.push(actions.push(arg));
            }
          } else if (_.isArray(arg)) {
            if (arg.isCursor) {
              _results.push(scopes.push(_this._extractScopes(arg)));
            } else {
              _results.push(stripArgs(arg));
            }
          } else {
            _results.push(scopes.push(_this._extractScopes(arg)));
          }
        }
        return _results;
      };
      stripArgs(arguments);
      actions = _.uniq(this._expandActions(actions, _.extend({}, this.get('actions'))));
      this.get('rules').push({
        actions: actions,
        scopes: scopes
      });
      return this;
    });

    __defineProperty(Ability,  "_testRules", function(action, subject, callback) {
      var _this = this;
      return _.any(this.get('rules'), function(rule) {
        return _this._testRule(rule, action, subject);
      });
    });

    __defineProperty(Ability,  "_testRule", function(rule, action, subject) {
      return this._ruleMatchesAction(rule, action) && this._ruleMatchesSubject(rule, subject);
    });

    __defineProperty(Ability,  "_ruleMatchesAction", function(rule, action) {
      return _.include(rule.actions, action);
    });

    __defineProperty(Ability,  "_ruleMatchesSubject", function(rule, subject) {
      return _.any(rule.scopes, function(scope) {
        if (scope === 'all') {
          return true;
        } else if (subject instanceof Tower.Model) {
          return subject.constructor.className() === scope.model.className() && scope.test(subject);
        } else {
          return scope.model.className() === subject.className();
        }
      });
    });

    __defineProperty(Ability,  "_expandActions", function(actions, set) {
      var expandedActions, _len6, _o;
      for (_o = 0, _len6 = actions.length; _o < _len6; _o++) {
        action = actions[_o];
        expandedActions = set[action];
        if (!expandedActions) {
          continue;
        }
        delete set[action];
        actions = actions.concat(this._expandActions(expandedActions, set));
      }
      return actions;
    });

    __defineProperty(Ability,  "_extractScopes", function(scope) {
      if (!scope) {
        throw new Error('Ability rule cannot have a null scope');
      }
      if (scope === 'all') {
        return scope;
      } else if (_.isArray(scope)) {
        if (scope.isCursor) {
          scope.compile();
          return scope;
        } else {
          return _.map(scope, this._extractScopes);
        }
      } else if (scope instanceof Tower.Model) {
        return scope.constructor.scoped().where({
          id: scope.get('id')
        });
      } else if (_.isFunction(scope)) {
        scope = scope.scoped().cursor;
        scope.compile();
        return scope;
      } else if (scope instanceof Tower.ModelScope) {
        scope = scope.cursor;
        scope.compile();
        return scope;
      } else {
        throw new Error('Ability rule cannot have this scope: ' + _.stringify(scope));
      }
    });

    return Ability;

  })(Tower.Class);

  Tower.SupportI18n.load({
    model: {
      errors: {
        presence: "%{attribute} can't be blank",
        minimum: "%{attribute} must be a minimum of %{value}",
        maximum: "%{attribute} must be a maximum of %{value}",
        length: "%{attribute} must be equal to %{value}",
        format: "%{attribute} must be a valid %{value}",
        inclusion: "%{attribute} is not included in the list",
        exclusion: "%{attribute} is reserved",
        invalid: "%{attribute} is invalid",
        confirmation: "%{attribute} doesn't match confirmation",
        accepted: "%{attribute} must be accepted",
        empty: "%{attribute} can't be empty",
        blank: "%{attribute} can't be blank",
        tooLong: "%{attribute} is too long (maximum is %{count} characters)",
        tooShort: "%{attribute} is too short (minimum is %{count} characters)",
        wrongLength: "%{attribute} is the wrong length (should be %{count} characters)",
        taken: "%{attribute} has already been taken",
        notANumber: "%{attribute} is not a number",
        greaterThan: "%{attribute} must be greater than %{count}",
        greaterThanOrEqualTo: "%{attribute} must be greater than or equal to %{count}",
        equalTo: "%{attribute} must be equal to %{count}",
        lessThan: "%{attribute} must be less than %{count}",
        lessThanOrEqualTo: "%{attribute} must be less than or equal to %{count}",
        odd: "%{attribute} must be odd",
        even: "%{attribute} must be even",
        recordInvalid: "Validation failed: %{errors}",
        uniqueness: "%{attribute} must be unique"
      },
      fullMessages: {
        format: "%{message}"
      }
    }
  });

  Tower.Model.include(Tower.SupportCallbacks);

  Tower.Model.include(Tower.ModelMetadata);

  Tower.Model.include(Tower.ModelDirty);

  Tower.Model.include(Tower.ModelIndexing);

  Tower.Model.include(Tower.ModelAuthentication);

  Tower.Model.include(Tower.ModelMassAssignment);

  Tower.Model.include(Tower.ModelScopes);

  Tower.Model.include(Tower.ModelPersistence);

  Tower.Model.include(Tower.ModelInheritance);

  Tower.Model.include(Tower.ModelSerialization);

  Tower.Model.include(Tower.ModelStates);

  Tower.Model.include(Tower.ModelRelations);

  Tower.Model.include(Tower.ModelValidations);

  Tower.Model.include(Tower.ModelAttachment);

  Tower.Model.include(Tower.ModelAttributes);

  Tower.Model.include(Tower.ModelNestedAttributes);

  Tower.Model.include(Tower.ModelAutosaveAssociation);

  Tower.Model.include(Tower.ModelTimestamp);

  Tower.Model.include(Tower.ModelHierarchical);

  Tower.Model.include(Tower.ModelOperations);

  Tower.Model.include(Tower.ModelTransactions);

  Tower.Model.field('id', {
    type: 'Id'
  });

  Tower.Model["protected"]('id');

  _ = Tower._;

  try {
    coffeecupTags = Tower.isServer ? _.map(Tower.module('coffeecup').tags, function(i) {
      return _.camelize(i, true);
    }) : [];
  } catch (error) {
    coffeecupTags = [];
  }

  Tower.View = (function(_super) {
    var View;

    function View() {
      return View.__super__.constructor.apply(this, arguments);
    }

    View = __extends(View, _super);

    View.reopenClass({
      cache: {},
      engine: 'coffee',
      prettyPrint: false,
      loadPaths: ['app/templates'],
      componentSuffix: 'widget',
      hintClass: 'hint',
      hintTag: 'figure',
      labelClass: 'control-label',
      requiredClass: 'required',
      requiredAbbr: '*',
      requiredTitle: 'Required',
      errorClass: 'error',
      errorTag: 'output',
      validClass: null,
      optionalClass: 'optional',
      optionalAbbr: '',
      optionalTitle: 'Optional',
      labelMethod: 'humanize',
      labelAttribute: 'toLabel',
      validationMaxLimit: 255,
      defaultTextFieldSize: null,
      defaultTextAreaWidth: 300,
      allFieldsRequiredByDefault: true,
      fieldListTag: 'ol',
      fieldListClass: 'fields',
      fieldTag: 'li',
      separator: '-',
      breadcrumb: ' - ',
      includeBlankForSelectByDefault: true,
      collectionLabelMethods: ['toLabel', 'displayName', 'fullName', 'name', 'title', 'toString'],
      i18nLookupsByDefault: true,
      escapeHtmlEntitiesInHintsAndLabels: false,
      renameNestedAttributes: true,
      inlineValidations: true,
      autoIdForm: true,
      fieldsetClass: 'fieldset',
      fieldClass: 'field control-group',
      validateClass: 'validate',
      legendClass: 'legend',
      formClass: 'form',
      idEnabledOn: ['input', 'field'],
      widgetsPath: 'shared/widgets',
      navClass: 'list-item',
      includeAria: true,
      activeClass: 'active',
      navTag: 'li',
      termsTag: 'dl',
      termClass: 'term',
      termKeyClass: 'key',
      termValueClass: 'value',
      hintIsPopup: false,
      listTag: 'ul',
      pageHeaderId: 'header',
      pageTitleId: 'title',
      autoIdNav: false,
      pageSubtitleId: 'subtitle',
      widgetClass: 'widget',
      headerClass: 'header',
      titleClass: 'title',
      subtitleClass: 'subtitle',
      contentClass: 'content',
      defaultHeaderLevel: 3,
      termSeparator: ':',
      richInput: false,
      submitFieldsetClass: 'submit-fieldset',
      addLabel: '+',
      removeLabel: '-',
      cycleFields: false,
      alwaysIncludeHintTag: false,
      alwaysIncludeErrorTag: true,
      requireIfValidatesPresence: true,
      localizeWithNamespace: false,
      localizeWithNestedModel: false,
      localizeWithInheritance: true,
      defaultComponentHeaderLevel: 3,
      helpers: {},
      metaTags: ['description', 'keywords', 'author', 'copyright', 'category', 'robots'],
      store: function(store) {
        if (store) {
          this._store = store;
        }
        return this._store || (this._store = new Tower.StoreMemory({
          name: 'view'
        }));
      },
      renderers: {},
      coffeecupTags: coffeecupTags,
      helper: function(object) {
        return _.extend(Tower.View.helpers, object);
      }
    });

    View.reopen({
      init: function(context) {
        if (context == null) {
          context = {};
        }
        this._super.apply(this, arguments);
        return this._context = context;
      }
    });

    return View;

  })(Tower.Class);

  Tower.ViewRendering = {
    render: function(options, callback) {
      var type, view,
        _this = this;
      if (!options.type && options.template && typeof options.template === 'string' && !options.inline) {
        type = options.template.split('/');
        type = type[type.length - 1].split(".");
        type = type.slice(1).join();
        options.type = type !== '' ? type : this.constructor.engine;
      }
      options.type || (options.type = this.constructor.engine);
      if (!options.hasOwnProperty("layout") && this._context.layout) {
        options.layout = this._context.layout();
      }
      options.locals = this._renderingContext(options);
      if (Tower.isClient) {
        try {
          if (options.template === 'new') {
            options.template = 'edit';
          }
          options.template = options.prefixes[0] + '/' + options.template;
          view = this.renderEmberView(options);
          if (view) {
            if (callback) {
              callback.call(this, null, '');
            }
            return;
          }
        } catch (error) {
          console.log(error.stack || error);
        }
      }
      return this._renderBody(options, function(error, body) {
        if (error) {
          return callback(error, body);
        }
        return _this._renderLayout(body, options, callback);
      });
    },
    _normalizeRenderOptions: function(options) {
      var type;
      if (!options.type && options.template && typeof options.template === 'string' && !options.inline) {
        type = options.template.split('/');
        type = type[type.length - 1].split(".");
        type = type.slice(1).join();
        options.type = type !== '' ? type : this.constructor.engine;
      }
      options.type || (options.type = this.constructor.engine);
      if (!options.hasOwnProperty("layout") && this._context.layout) {
        options.layout = this._context.layout();
      }
      options.locals = this._renderingContext(options);
      return options;
    },
    partial: function(path, options, callback) {
      var prefixes, template;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      options || (options = {});
      prefixes = options.prefixes;
      if (this._context) {
        prefixes || (prefixes = [this._context.collectionName]);
      }
      template = this._readTemplate(path, prefixes, options.type || Tower.View.engine);
      return this._renderString(template, options, callback);
    },
    renderWithEngine: function(template, engine) {
      var mint;
      if (Tower.isClient) {
        return "(" + template + ").call(this);";
      } else {
        mint = require("mint");
        return mint[mint.engine(engine || "coffee")](template, {}, function(error, result) {
          if (error) {
            return console.log(error);
          }
        });
      }
    },
    _renderBody: function(options, callback) {
      if (options.text) {
        return callback(null, options.text);
      } else if (options.json) {
        return callback(null, typeof options.json === "string" ? options.json : JSON.stringify(options.json));
      } else {
        if (!options.inline) {
          options.template = this._readTemplate(options.template, options.prefixes, options.type);
        }
        return this._renderString(options.template, options, callback);
      }
    },
    _renderLayout: function(body, options, callback) {
      var layout;
      if (options.layout) {
        layout = this._readTemplate("layout/" + options.layout, [], options.type);
        options.locals.body = body;
        return this._renderString(layout, options, callback);
      } else {
        return callback(null, body);
      }
    },
    _renderString: function(string, options, callback) {
      var engine, mint;
      if (options == null) {
        options = {};
      }
      if (!!options.type.match(/coffee/)) {
        return this._renderCoffeecupString(string, options, callback);
      } else if (options.type) {
        mint = require("mint");
        if (typeof string === 'function') {
          string = string();
        }
        engine = mint.engine(options.type);
        if (engine.match(/(eco|mustache)/)) {
          return mint[engine](string, options, callback);
        } else {
          return mint[engine](string, options.locals, callback);
        }
      } else {
        engine = require("mint");
        options.locals.string = string;
        return engine.render(options.locals, callback);
      }
    },
    _renderCoffeecupString: function(string, options, callback) {
      var coffeecup, e, hardcode, locals, result;
      e = null;
      result = null;
      try {
        coffeecup = Tower.module('coffeecup');
        locals = options.locals || {};
        locals.renderWithEngine = this.renderWithEngine;
        locals._readTemplate = this._readTemplate;
        locals.cache = Tower.env !== "development";
        locals.format = true;
        hardcode = Tower.View.helpers;
        hardcode = _.extend(hardcode, {
          tags: Tower.View.coffeecupTags
        });
        locals.hardcode = hardcode;
        locals._ = _;
        result = coffeecup.render(string, locals);
      } catch (error) {
        e = error;
        console.log(e.stack);
      }
      return callback(e, result);
    },
    _renderingContext: function(options) {
      var context, locals, value;
      locals = this;
      context = this._context;
      for (key in context) {
        value = context[key];
        if (!key.match(/^(constructor|head)/)) {
          locals[key] = value;
        }
      }
      locals = Tower._.modules(locals, options.locals);
      if (this.constructor.prettyPrint) {
        locals.pretty = true;
      }
      return locals;
    },
    _readTemplate: function(template, prefixes, ext) {
      var cachePath, options, path, result, store;
      if (typeof template !== "string") {
        return template;
      }
      options = {
        path: template,
        ext: ext,
        prefixes: prefixes
      };
      store = this.constructor.store();
      if (typeof store.findPath !== 'undefined') {
        path = store.findPath(options);
        path || (path = store.defaultPath(options));
      } else {
        path = template;
      }
      cachePath = path;
      if (Tower.isClient) {
        cachePath = 'app/templates/' + cachePath;
      }
      result = this.constructor.cache[cachePath] || require('fs').readFileSync(require('path').join(Tower.root, path), 'utf-8').toString();
      if (!result) {
        throw new Error("Template '" + template + "' was not found.");
      }
      return result;
    }
  };

  Tower.ViewComponent = (function() {

    __defineStaticProperty(ViewComponent,  "render", function() {
      var args, block, options, template;
      args = _.args(arguments);
      template = args.shift();
      block = _.extractBlock(args);
      if (!(args[args.length - 1] instanceof Tower.Model || typeof args[args.length - 1] !== "object")) {
        options = args.pop();
      }
      options || (options = {});
      options.template = template;
      return (new this(args, options)).render(block);
    });

    function ViewComponent(args, options) {
      var value;
      for (key in options) {
        value = options[key];
        this[key] = value;
      }
    }

    __defineProperty(ViewComponent,  "tag", function() {
      var args, key;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.template.tag(key, _.compact(args));
    });

    __defineProperty(ViewComponent,  "addClass", function(string, args) {
      var arg, result, _len6, _o;
      result = string ? string.split(/\s+/g) : [];
      for (_o = 0, _len6 = args.length; _o < _len6; _o++) {
        arg = args[_o];
        if (!arg) {
          continue;
        }
        if (!(result.indexOf(arg) > -1)) {
          result.push(arg);
        }
      }
      return result.join(" ");
    });

    return ViewComponent;

  })();

  Tower.ViewTable = (function(_super) {
    var ViewTable;

    ViewTable = __extends(ViewTable, _super);

    function ViewTable(args, options) {
      var aria, data, recordOrKey;
      ViewTable.__super__.constructor.apply(this, arguments);
      recordOrKey = args.shift();
      this.key = this.recordKey(recordOrKey);
      this.rowIndex = 0;
      this.cellIndex = 0;
      this.scope = "table";
      this.headers = [];
      options.summary || (options.summary = "Table for " + (_.titleize(this.key)));
      options.role = "grid";
      options["class"] = this.addClass(options["class"] || "", ["table"]);
      data = options.data || (options.data = {});
      if (options.hasOwnProperty("total")) {
        data.total = options.total;
      }
      if (options.hasOwnProperty("page")) {
        data.page = options.page;
      }
      if (options.hasOwnProperty("count")) {
        data.count = options.count;
      }
      aria = options.aria || {};
      delete options.aria;
      if (!(aria.hasOwnProperty("aria-multiselectable") || options.multiselect === true)) {
        aria["aria-multiselectable"] = false;
      }
      options.id || (options.id = "" + recordOrKey + "-table");
      this.options = {
        summary: options.summary,
        role: options.role,
        data: options.data,
        "class": options["class"]
      };
    }

    __defineProperty(ViewTable,  "render", function(block) {
      var _this = this;
      return this.tag("table", this.options, function() {
        if (block) {
          block(_this);
        }
        return null;
      });
    });

    __defineProperty(ViewTable,  "tableQueryRowClass", function() {
      return ["search-row", queryParams.except("page", "sort").blank != null ? null : "search-results"].compact.join(" ");
    });

    __defineProperty(ViewTable,  "linkToSort", function(title, attribute, options) {
      var sortParam;
      if (options == null) {
        options = {};
      }
      sortParam = sortValue(attribute, oppositeSortDirection(attribute));
      return linkTo(title, withParams(request.path, {
        sort: sortParam
      }), options);
    });

    __defineProperty(ViewTable,  "nextPagePath", function(collection) {
      return withParams(request.path, {
        page: collection.nextPage
      });
    });

    __defineProperty(ViewTable,  "prevPagePath", function(collection) {
      return withParams(request.path, {
        page: collection.prevPage
      });
    });

    __defineProperty(ViewTable,  "firstPagePath", function(collection) {
      return withParams(request.path, {
        page: 1
      });
    });

    __defineProperty(ViewTable,  "lastPagePath", function(collection) {
      return withParams(request.path, {
        page: collection.lastPage
      });
    });

    __defineProperty(ViewTable,  "currentPageNum", function() {
      var page;
      page = params.page ? params.page : 1;
      if (page < 1) {
        page = 1;
      }
      return page;
    });

    __defineProperty(ViewTable,  "caption", function() {});

    __defineProperty(ViewTable,  "head", function(attributes, block) {
      if (attributes == null) {
        attributes = {};
      }
      this.hideHeader = attributes.visible === false;
      delete attributes.visible;
      return this._section("head", attributes, block);
    });

    __defineProperty(ViewTable,  "body", function(attributes, block) {
      if (attributes == null) {
        attributes = {};
      }
      return this._section("body", attributes, block);
    });

    __defineProperty(ViewTable,  "foot", function(attributes, block) {
      if (attributes == null) {
        attributes = {};
      }
      return this._section("foot", attributes, block);
    });

    __defineProperty(ViewTable,  "_section", function(scope, attributes, block) {
      this.rowIndex = 0;
      this.scope = scope;
      this.tag("t" + scope, attributes, block);
      this.rowIndex = 0;
      return this.scope = "table";
    });

    __defineProperty(ViewTable,  "row", function() {
      var args, attributes, block, _o;
      args = 2 <= arguments.length ? __slice.call(arguments, 0, _o = arguments.length - 1) : (_o = 0, []), block = arguments[_o++];
      attributes = _.extractOptions(args);
      attributes.scope = "row";
      if (this.scope === "body") {
        attributes.role = "row";
      }
      this.rowIndex += 1;
      this.cellIndex = 0;
      this.tag("tr", attributes, block);
      return this.cellIndex = 0;
    });

    __defineProperty(ViewTable,  "column", function() {
      var args, attributes, block, value, _base, _o;
      args = 2 <= arguments.length ? __slice.call(arguments, 0, _o = arguments.length - 1) : (_o = 0, []), block = arguments[_o++];
      attributes = _.extractOptions(args);
      value = args.shift();
      if (typeof (_base = Tower.View.idEnabledOn).include === "function" ? _base.include("table") : void 0) {
        attributes.id || (attributes.id = this.idFor("header", key, value, this.rowIndex, this.cellIndex));
      }
      if (attributes.hasOwnProperty("width")) {
        attributes.width = this.pixelate(attributes.width);
      }
      if (attributes.hasOwnProperty("height")) {
        attributes.height = this.pixelate(attributes.height);
      }
      this.headers.push(attributes.id);
      tag("col", attributes);
      return this.cellIndex += 1;
    });

    __defineProperty(ViewTable,  "header", function() {
      var args, attributes, block, direction, label, sort, value, _base,
        _this = this;
      args = _.args(arguments);
      block = _.extractBlock(args);
      attributes = _.extractOptions(args);
      value = args.shift();
      attributes.abbr || (attributes.abbr = value);
      attributes.role = "columnheader";
      if (typeof (_base = Tower.View.idEnabledOn).include === "function" ? _base.include("table") : void 0) {
        attributes.id || (attributes.id = this.idFor("header", key, value, this.rowIndex, this.cellIndex));
      }
      attributes.scope = "col";
      if (attributes.hasOwnProperty("for")) {
        attributes.abbr || (attributes.abbr = attributes["for"]);
      }
      attributes.abbr || (attributes.abbr = value);
      delete attributes["for"];
      if (attributes.hasOwnProperty("width")) {
        attributes.width = this.pixelate(attributes.width);
      }
      if (attributes.hasOwnProperty("height")) {
        attributes.height = this.pixelate(attributes.height);
      }
      sort = attributes.sort === true;
      delete attributes.sort;
      if (sort) {
        attributes["class"] = this.addClass(attributes["class"] || "", [attributes.sortClass || "sortable"]);
        attributes.direction || (attributes.direction = "asc");
      }
      delete attributes.sortClass;
      label = attributes.label || _.titleize(value.toString());
      delete attributes.label;
      direction = attributes.direction;
      delete attributes.direction;
      if (direction) {
        attributes["aria-sort"] = direction;
        attributes["class"] = [attributes["class"], direction].join(" ");
        attributes["aria-selected"] = true;
      } else {
        attributes["aria-sort"] = "none";
        attributes["aria-selected"] = false;
      }
      this.headers.push(attributes.id);
      if (block) {
        this.tag("th", attributes, block);
      } else {
        if (sort) {
          this.tag("th", attributes, function() {
            return _this.linkToSort(label, value);
          });
        } else {
          this.tag("th", attributes, function() {
            return _this.tag("span", label);
          });
        }
      }
      return this.cellIndex += 1;
    });

    __defineProperty(ViewTable,  "linkToSort", function(label, value) {
      var direction,
        _this = this;
      direction = "+";
      return this.tag("a", {
        href: "?sort=" + direction
      }, function() {
        return _this.tag("span", label);
      });
    });

    __defineProperty(ViewTable,  "cell", function() {
      var args, attributes, block, value, _base, _o;
      args = 2 <= arguments.length ? __slice.call(arguments, 0, _o = arguments.length - 1) : (_o = 0, []), block = arguments[_o++];
      attributes = _.extractOptions(args);
      value = args.shift();
      attributes.role = "gridcell";
      if (typeof (_base = Tower.View.idEnabledOn).include === "function" ? _base.include("table") : void 0) {
        attributes.id || (attributes.id = this.idFor("cell", key, value, this.rowIndex, this.cellIndex));
      }
      attributes.headers = this.headers[this.cellIndex];
      if (attributes.hasOwnProperty("width")) {
        attributes.width = this.pixelate(attributes.width);
      }
      if (attributes.hasOwnProperty("height")) {
        attributes.height = this.pixelate(attributes.height);
      }
      if (block) {
        this.tag("td", attributes, block);
      } else {
        this.tag("td", value, attributes);
      }
      return this.cellIndex += 1;
    });

    __defineProperty(ViewTable,  "recordKey", function(recordOrKey) {
      if (typeof recordOrKey === "string") {
        return recordOrKey;
      } else {
        return recordOrKey.constructor.name;
      }
    });

    __defineProperty(ViewTable,  "idFor", function(type, key, value, row_index, column_index) {
      if (row_index == null) {
        row_index = this.row_index;
      }
      if (column_index == null) {
        column_index = this.column_index;
      }
      [key, type, row_index, column_index].compact.map(function(node) {
        return node.replace(/[\s_]/, "-");
      });
      return end.join("-");
    });

    __defineProperty(ViewTable,  "pixelate", function(value) {
      if (typeof value === "string") {
        return value;
      } else {
        return "" + value + "px";
      }
    });

    return ViewTable;

  })(Tower.ViewComponent);

  Tower.ViewForm = (function(_super) {
    var ViewForm;

    ViewForm = __extends(ViewForm, _super);

    function ViewForm(args, options) {
      var klass;
      ViewForm.__super__.constructor.apply(this, arguments);
      this.model = args.shift() || new Tower.Model;
      if (typeof this.model === "string") {
        klass = (function() {
          try {
            return Tower.constant(_.camelize(this.model));
          } catch (_error) {}
        }).call(this);
        if (klass) {
          this.model = new klass;
        }
      }
      this.attributes = this._extractAttributes(options);
    }

    __defineProperty(ViewForm,  "render", function(callback) {
      var _this = this;
      return this.tag("form", this.attributes, function() {
        var builder;
        _this.tag("input", {
          type: "hidden",
          name: "_method",
          value: _this.attributes["data-method"]
        });
        if (callback) {
          builder = new Tower.ViewFormBuilder([], {
            template: _this.template,
            tabindex: 1,
            accessKeys: {},
            model: _this.model,
            live: _this.live
          });
          return builder.render(callback);
        }
      });
    });

    __defineProperty(ViewForm,  "_extractAttributes", function(options) {
      var attributes, method;
      if (options == null) {
        options = {};
      }
      attributes = options.html || {};
      attributes.action = options.url || Tower.urlFor(this.model);
      if (options.hasOwnProperty("class")) {
        attributes["class"] = options["class"];
      }
      if (options.hasOwnProperty("id")) {
        attributes.id = options.id;
      }
      attributes.id || (attributes.id = _.parameterize("" + (this.model.constructor.className()) + "-form"));
      if (options.multipart || attributes.multipart === true) {
        attributes.enctype = "multipart/form-data";
      }
      attributes.role = "form";
      attributes.novalidate = "true";
      if (options.hasOwnProperty("validate")) {
        attributes["data-validate"] = options.validate.toString();
      }
      method = attributes.method || options.method;
      if (!method || method === "") {
        if (this.model && this.model.get("id")) {
          method = "put";
        } else {
          method = "post";
        }
      }
      attributes["data-method"] = method;
      attributes.method = method === "get" ? "get" : "post";
      return attributes;
    });

    return ViewForm;

  })(Tower.ViewComponent);

  Tower.ViewFormBuilder = (function(_super) {
    var ViewFormBuilder;

    ViewFormBuilder = __extends(ViewFormBuilder, _super);

    function ViewFormBuilder(args, options) {
      if (options == null) {
        options = {};
      }
      this.template = options.template;
      this.model = options.model;
      this.attribute = options.attribute;
      this.parentIndex = options.parentIndex;
      this.index = options.index;
      this.tabindex = options.tabindex;
      this.accessKeys = options.accessKeys;
      this.live = options.live;
    }

    __defineProperty(ViewFormBuilder,  "defaultOptions", function(options) {
      if (options == null) {
        options = {};
      }
      options.model || (options.model = this.model);
      options.index || (options.index = this.index);
      options.attribute || (options.attribute = this.attribute);
      options.template || (options.template = this.template);
      return options;
    });

    __defineProperty(ViewFormBuilder,  "fieldset", function() {
      var args, block, options;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      block = args.pop();
      options = this.defaultOptions(_.extractOptions(args));
      options.label || (options.label = args.shift());
      options.live = this.live;
      return new Tower.ViewFormFieldset([], options).render(block);
    });

    __defineProperty(ViewFormBuilder,  "fields", function() {
      var args, attribute, block, options,
        _this = this;
      args = _.args(arguments);
      block = _.extractBlock(args);
      options = _.extractOptions(args);
      options.as = "fields";
      options.label || (options.label = false);
      attribute = args.shift() || this.attribute;
      return this.field(attribute, options, function(_field) {
        return _this.fieldset(block);
      });
    });

    __defineProperty(ViewFormBuilder,  "fieldsFor", function() {
      var attrName, attribute, index, keys, macro, options, subObject, subParent;
      options = args.extractOptions;
      attribute = args.shift;
      macro = model.macroFor(attribute);
      attrName = nil;
      if (options.as === "object") {
        attrName = attribute.toS;
      } else {
        attrName = Tower.View.renameNestedAttributes ? "" + attribute + "_attributes" : attribute.toS;
      }
      subParent = model.object;
      subObject = args.shift;
      index = options["delete"]("index");
      if (!((index.present != null) && typeof index === "string")) {
        if ((subObject.blank != null) && (index.present != null)) {
          subObject = subParent.send(attribute)[index];
        } else if ((index.blank != null) && (subObject.present != null) && macro === "hasMany") {
          index = subParent.send(attribute).index(subObject);
        }
      }
      subObject || (subObject = model["default"](attribute) || model.toS.camelize.constantize["new"]);
      keys = [model.keys, attrName];
      options.merge({
        template: template,
        model: model,
        parentIndex: index,
        accessKeys: accessKeys,
        tabindex: tabindex,
        live: this.live
      });
      return new Tower.ViewFormBuilder(options).render(block);
    });

    __defineProperty(ViewFormBuilder,  "field", function() {
      var args, attributeName, block, defaults, last, options;
      args = _.args(arguments);
      last = args[args.length - 1];
      if (last === null || last === void 0) {
        args.pop();
      }
      block = _.extractBlock(args);
      options = _.extractOptions(args);
      attributeName = args.shift() || "attribute.name";
      defaults = {
        template: this.template,
        model: this.model,
        attribute: attributeName,
        parentIndex: this.parentIndex,
        index: this.index,
        fieldHTML: options.fieldHTML || {},
        inputHTML: options.inputHTML || {},
        labelHTML: options.labelHTML || {},
        errorHTML: options.errorHTML || {},
        hintHtml: options.hintHtml || {},
        live: this.live
      };
      return new Tower.ViewFormField([], _.extend(defaults, options)).render(block);
    });

    __defineProperty(ViewFormBuilder,  "button", function() {
      var args, block, options;
      args = _.args(arguments);
      block = _.extractBlock(args);
      options = _.extractOptions(args);
      options.as || (options.as = "submit");
      options.value = args.shift() || "Submit";
      if (options.as === "submit") {
        options["class"] = Tower.View.submitFieldsetClass;
      }
      return this.field(options.value, options, block);
    });

    __defineProperty(ViewFormBuilder,  "submit", ViewFormBuilder.prototype.button);

    __defineProperty(ViewFormBuilder,  "partial", function(path, options) {
      if (options == null) {
        options = {};
      }
      return this.template.render({
        partial: path,
        locals: options.merge({
          fields: self
        })
      });
    });

    __defineProperty(ViewFormBuilder,  "tag", function() {
      var args, key;
      key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.template.tag(key, args);
    });

    __defineProperty(ViewFormBuilder,  "render", function(block) {
      return block(this);
    });

    return ViewFormBuilder;

  })(Tower.ViewComponent);

  Tower.ViewFormField = (function(_super) {
    var ViewFormField;

    ViewFormField = __extends(ViewFormField, _super);

    __defineProperty(ViewFormField,  "addClass", function(string, args) {
      var arg, result, _len6, _o;
      result = string ? string.split(/\s+/g) : [];
      for (_o = 0, _len6 = args.length; _o < _len6; _o++) {
        arg = args[_o];
        if (!arg) {
          continue;
        }
        if (!(result.indexOf(arg) > -1)) {
          result.push(arg);
        }
      }
      return result.join(" ");
    });

    __defineProperty(ViewFormField,  "toId", function(options) {
      var result;
      if (options == null) {
        options = {};
      }
      result = typeof this.model === 'object' ? _.parameterize(this.model.constructor.className()) : this.model;
      if (options.parentIndex) {
        result += "-" + options.parentIndex;
      }
      result += "-" + (_.parameterize(this.attribute));
      result += "-" + (options.type || "field");
      if (this.index != null) {
        result += "-" + this.index;
      }
      return result;
    });

    __defineProperty(ViewFormField,  "toParam", function(options) {
      var result;
      if (options == null) {
        options = {};
      }
      result = typeof this.model === 'object' ? _.camelize(this.model.constructor.className(), true) : this.model;
      if (options.parentIndex) {
        result += "[" + options.parentIndex + "]";
      }
      result += "[" + this.attribute + "]";
      if (this.index != null) {
        result += "[" + this.index + "]";
      }
      return result;
    });

    function ViewFormField(args, options) {
      var classes, field, inputType, pattern, value, _base, _base1, _base2, _base3, _base4, _base5, _base6;
      this.labelValue = options.label;
      delete options.label;
      ViewFormField.__super__.constructor.call(this, args, options);
      this.required || (this.required = false);
      if (typeof this.model === 'object') {
        field = this.model.constructor.fields()[this.attribute];
      }
      options.as || (options.as = field ? _.camelize(field.type, true) : "string");
      this.inputType = inputType = options.as;
      this.required = !!(field && field.required === true);
      classes = [Tower.View.fieldClass, inputType];
      if (!(["submit", "fieldset"].indexOf(inputType) > -1)) {
        classes.push(field && field.required ? Tower.View.requiredClass : Tower.View.optionalClass);
        classes.push(field && field.errors ? Tower.View.errorClass : Tower.View.validClass);
        if (options.validate !== false && field && field.validations) {
          classes.push(Tower.View.validateClass);
        }
      }
      this.fieldHTML["class"] = this.addClass(this.fieldHTML["class"], classes);
      if (!this.fieldHTML.id && Tower.View.idEnabledOn.indexOf("field") > -1) {
        this.fieldHTML.id = this.toId({
          type: "field",
          index: this.index,
          parentIndex: this.parentIndex
        });
      }
      this.inputHTML.id = this.toId({
        type: "input",
        index: this.index,
        parentIndex: this.parentIndex
      });
      if (!(["hidden", "submit"].indexOf(inputType) > -1)) {
        (_base = this.labelHTML)["for"] || (_base["for"] = this.inputHTML.id);
        this.labelHTML["class"] = this.addClass(this.labelHTML["class"], [Tower.View.labelClass]);
        if (this.labelValue !== false) {
          this.labelValue || (this.labelValue = _.humanize(this.attribute.toString()));
        }
        if (options.hint !== false) {
          this.errorHTML["class"] = this.addClass(this.errorHTML["class"], [Tower.View.errorClass]);
          if (Tower.View.includeAria && Tower.View.hintIsPopup) {
            (_base1 = this.errorHTML).role || (_base1.role = "tooltip");
          }
        }
      }
      this.attributes = this.fieldHTML;
      if (inputType !== "submit") {
        (_base2 = this.inputHTML).name || (_base2.name = this.toParam());
      }
      (_base3 = this.inputHTML).value || (_base3.value = options.value);
      (_base4 = this.inputHTML).value || (_base4.value = this.value);
      this.dynamic = options.dynamic === true;
      this.richInput = options.hasOwnProperty("rich_input") ? !!options.rich_input : Tower.View.richInput;
      this.validate = options.validate !== false;
      classes = [inputType, _.parameterize(this.attribute), this.inputHTML["class"]];
      if (!(["submit", "fieldset"].indexOf(inputType) > -1)) {
        classes.push(field && field.required ? Tower.View.requiredClass : Tower.View.optionalClass);
        classes.push(field && field.errors ? Tower.View.errorClass : Tower.View.validClass);
        classes.push("input");
        if (options.validate !== false && field && field.validations) {
          classes.push(Tower.View.validateClass);
        }
      }
      this.inputHTML["class"] = this.addClass(this.inputHTML["class"], classes);
      if (options.placeholder) {
        this.inputHTML.placeholder = options.placeholder;
      }
      value = void 0;
      if (options.hasOwnProperty("value")) {
        value = options.value;
      }
      if (!value && this.inputHTML.hasOwnProperty('value')) {
        value = this.inputHTML.value;
      }
      if (typeof this.model === 'object') {
        value || (value = this.model.get(this.attribute));
      }
      if (value) {
        if (this.inputType === "array") {
          value = _.castArray(value).join(", ");
        } else {
          value = value.toString();
        }
      }
      this.inputHTML.value = value;
      if (options.hasOwnProperty("max")) {
        (_base5 = this.inputHTML).maxlength || (_base5.maxlength = options.max);
      }
      pattern = options.match;
      if (_.isRegExp(pattern)) {
        pattern = pattern.toString();
      }
      this.bind = options.bind;
      if (options.size != null) {
        this.inputHTML.size = options.size;
      }
      if (pattern != null) {
        this.inputHTML["data-match"] = pattern;
      }
      this.inputHTML["aria-required"] = this.required.toString();
      if (this.required === true) {
        this.inputHTML.required = "true";
      }
      if (this.disabled) {
        this.inputHTML.disabled = "true";
      }
      if (this.autofocus === true) {
        this.inputHTML.autofocus = "true";
      }
      if (this.dynamic) {
        this.inputHTML["data-dynamic"] = "true";
      }
      if (this.inputHTML.placeholder) {
        (_base6 = this.inputHTML).title || (_base6.title = this.inputHTML.placeholder);
      }
      this.autocomplete = this.inputHTML.autocomplete === true;
      if (this.autocomplete && Tower.View.includeAria) {
        this.inputHTML["aria-autocomplete"] = (function() {
          switch (this.autocomplete) {
            case "inline":
            case "list":
            case "both":
              return this.autocomplete;
            default:
              return "both";
          }
        }).call(this);
      }
    }

    __defineProperty(ViewFormField,  "input", function() {
      var args, options;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = _.extend(this.inputHTML, _.extractOptions(args));
      key = args.shift() || this.attribute;
      return this["" + this.inputType + "Input"](key, options);
    });

    __defineProperty(ViewFormField,  "checkboxInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "checkbox"
      }, options));
    });

    __defineProperty(ViewFormField,  "stringInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "text"
      }, options));
    });

    __defineProperty(ViewFormField,  "submitInput", function(key, options) {
      var value;
      value = options.value;
      delete options.value;
      return this.tag("button", _.extend({
        type: "submit"
      }, options), value);
    });

    __defineProperty(ViewFormField,  "fileInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "file"
      }, options));
    });

    __defineProperty(ViewFormField,  "textInput", function(key, options) {
      var value;
      value = options.value;
      delete options.value;
      return this.tag("textarea", options, value);
    });

    __defineProperty(ViewFormField,  "passwordInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "password"
      }, options));
    });

    __defineProperty(ViewFormField,  "emailInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "email"
      }, options));
    });

    __defineProperty(ViewFormField,  "urlInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "url"
      }, options));
    });

    __defineProperty(ViewFormField,  "numberInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "string",
        "data-type": "numeric"
      }, options));
    });

    __defineProperty(ViewFormField,  "searchInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "search",
        "data-type": "search"
      }, options));
    });

    __defineProperty(ViewFormField,  "phoneInput", function(key, options) {
      return this.tag("input", _.extend({
        type: "tel",
        "data-type": "phone"
      }, options));
    });

    __defineProperty(ViewFormField,  "arrayInput", function(key, options) {
      return this.tag("input", _.extend({
        "data-type": "array"
      }, options));
    });

    __defineProperty(ViewFormField,  "label", function() {
      var _this = this;
      if (!this.labelValue) {
        return;
      }
      return this.tag("label", this.labelHTML, function() {
        _this.tag("span", _this.labelValue);
        if (_this.required) {
          return _this.tag("abbr", {
            title: Tower.View.requiredTitle,
            "class": Tower.View.requiredClass
          }, function() {
            return Tower.View.requiredAbbr;
          });
        } else {
          return _this.tag("abbr", {
            title: Tower.View.optionalTitle,
            "class": Tower.View.optionalClass
          }, function() {
            return Tower.View.optionalAbbr;
          });
        }
      });
    });

    __defineProperty(ViewFormField,  "render", function(block) {
      var _this = this;
      return this.tag(Tower.View.fieldTag, this.attributes, function() {
        if (block) {
          return block.call(_this);
        } else {
          _this.label();
          if (_this.inputType === "submit") {
            return _this.input();
          } else {
            return _this.tag("div", {
              "class": "controls"
            }, function() {
              return _this.input();
            });
          }
        }
      });
    });

    __defineProperty(ViewFormField,  "extractElements", function(options) {
      var elements, _base;
      if (options == null) {
        options = {};
      }
      elements = [];
      if (typeof (_base = ["hidden", "submit"]).include === "function" ? _base.include(inputType) : void 0) {
        elements.push("inputs");
      } else {
        if ((this.label.present != null) && (this.label.value != null)) {
          elements.push("label");
        }
        elements = elements.concat(["inputs", "hints", "errors"]);
      }
      return elements;
    });

    return ViewFormField;

  })(Tower.ViewComponent);

  Tower.ViewFormFieldset = (function(_super) {
    var ViewFormFieldset;

    ViewFormFieldset = __extends(ViewFormFieldset, _super);

    function ViewFormFieldset(args, options) {
      var attributes;
      ViewFormFieldset.__super__.constructor.apply(this, arguments);
      this.attributes = attributes = {};
      delete attributes.index;
      delete attributes.parentIndex;
      delete attributes.label;
      this.builder = new Tower.ViewFormBuilder([], {
        template: this.template,
        model: this.model,
        attribute: this.attribute,
        index: this.index,
        parentIndex: this.parentIndex,
        live: this.live
      });
    }

    __defineProperty(ViewFormFieldset,  "render", function(block) {
      var _this = this;
      return this.tag("fieldset", this.attributes, function() {
        if (_this.label) {
          _this.tag("legend", {
            "class": Tower.View.legendClass
          }, function() {
            return _this.tag("span", _this.label);
          });
        }
        return _this.tag(Tower.View.fieldListTag, {
          "class": Tower.View.fieldListClass
        }, function() {
          return _this.builder.render(block);
        });
      });
    });

    return ViewFormFieldset;

  })(Tower.ViewComponent);

  _ = Tower._;

  Tower.ViewAssetHelper = {
    javascripts: function() {
      var options, path, paths, sources, _len6, _o;
      sources = _.args(arguments);
      options = _.extractOptions(sources);
      options.namespace = 'javascripts';
      options.extension = 'js';
      paths = _extractAssetPaths(sources, options);
      for (_o = 0, _len6 = paths.length; _o < _len6; _o++) {
        path = paths[_o];
        javascriptTag(path);
      }
      return null;
    },
    javascript: function() {
      return javascripts.apply(this, arguments);
    },
    stylesheets: function() {
      var options, path, paths, sources, _len6, _o;
      sources = _.args(arguments);
      options = _.extractOptions(sources);
      options.namespace = 'stylesheets';
      options.extension = 'css';
      paths = _extractAssetPaths(sources, options);
      for (_o = 0, _len6 = paths.length; _o < _len6; _o++) {
        path = paths[_o];
        stylesheetTag(path);
      }
      return null;
    },
    stylesheet: function() {
      return stylesheets.apply(this, arguments);
    },
    stylesheetTag: function(source) {
      return link({
        rel: 'stylesheet',
        href: source
      });
    },
    javascriptTag: function(source) {
      return script({
        src: source
      });
    },
    _extractAssetPaths: function(sources, options) {
      var assets, extension, manifest, namespace, only, path, paths, result, source, _len6, _len7, _len8, _o, _p, _q;
      if (options == null) {
        options = {};
      }
      namespace = options.namespace;
      extension = options.extension;
      assets = Tower.config.assets[namespace];
      result = [];
      if (Tower.env === 'production') {
        manifest = Tower.assetManifest;
        for (_o = 0, _len6 = sources.length; _o < _len6; _o++) {
          source = sources[_o];
          if (!source.match(/^(http|\/{2})/)) {
            if (assets[source] == null) {
              continue;
            }
            source = "" + source + "." + extension;
            if (manifest[source]) {
              source = manifest[source];
            }
            source = "/" + namespace + "/" + source;
            if (Tower.assetHost) {
              source = "" + Tower.assetHost + source;
            }
          }
          result.push(source);
        }
      } else {
        for (_p = 0, _len7 = sources.length; _p < _len7; _p++) {
          source = sources[_p];
          if (!!source.match(/^(http|\/{2})/)) {
            result.push(source);
          } else {
            paths = assets[source];
            if (paths) {
              for (_q = 0, _len8 = paths.length; _q < _len8; _q++) {
                path = paths[_q];
                result.push("/" + namespace + path + "." + extension);
              }
            }
          }
        }
        only = options.only;
        if (_.isArray(only)) {
          only = new RegExp(only.join('|'));
        }
        if (_.isRegExp(only)) {
          result = _.select(result, function(source) {
            return !!source.match(only);
          });
        }
      }
      return result;
    }
  };

  Tower.ViewComponentHelper = {
    formFor: function() {
      var _c, _ref6;
      _c = typeof __cc === 'undefined' ? __ck : __cc;
      return (_ref6 = Tower.ViewForm).render.apply(_ref6, [_c].concat(__slice.call(arguments)));
    },
    tableFor: function() {
      var _c, _ref6;
      _c = typeof __cc === 'undefined' ? __ck : __cc;
      return (_ref6 = Tower.ViewTable).render.apply(_ref6, [_c].concat(__slice.call(arguments)));
    },
    widget: function() {},
    linkTo: function(title, path, options) {
      if (options == null) {
        options = {};
      }
      return a(_.extend(options, {
        href: path,
        title: title
      }), title.toString());
    },
    navItem: function(title, path, options) {
      if (options == null) {
        options = {};
      }
      return li(function() {
        return linkTo(title, path, options);
      });
    },
    term: function(key, value) {
      dt(key);
      return dd(value);
    }
  };

  Tower.ViewElementHelper = {
    title: function(value) {
      return document.title = value;
    },
    addClass: function() {
      var classes, part, parts, string, _len6, _o;
      string = arguments[0], parts = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      classes = string.split(/\ +/);
      for (_o = 0, _len6 = parts.length; _o < _len6; _o++) {
        part = parts[_o];
        if (classes.indexOf(part) > -1) {
          classes.push(part);
        }
      }
      return classes.join(" ");
    },
    elementId: function() {
      return "#" + (this.elementKey.apply(this, arguments));
    },
    elementClass: function() {
      return "." + (this.elementKey.apply(this, arguments));
    },
    elementKey: function() {
      return Tower._.parameterize(this.elementNameComponents.apply(this, arguments).join("-"));
    },
    elementName: function() {
      var i, item, result, _len6, _o;
      result = this.elementNameComponents.apply(this, arguments);
      i = 1;
      for (i = _o = 0, _len6 = result.length; _o < _len6; i = ++_o) {
        item = result[i];
        result[i] = "[" + item + "]";
      }
      return Tower._.parameterize(result.join(""));
    },
    elementNameComponents: function() {
      var args, item, result, _len6, _o;
      args = _.args(arguments);
      result = [];
      for (_o = 0, _len6 = args.length; _o < _len6; _o++) {
        item = args[_o];
        switch (typeof item) {
          case "function":
            result.push(item.constructor.name);
            break;
          case "string":
            result.push(item);
            break;
          default:
            result.push(item.toString());
        }
      }
      return result;
    }
  };

  Tower.ViewEmberHelper = {
    hEach: function() {
      return hBlock.apply(null, ['each'].concat(__slice.call(arguments)));
    },
    hWith: function() {
      return hBlock.apply(null, ['with'].concat(__slice.call(arguments)));
    },
    hIf: function() {
      return hBlock.apply(null, ['if'].concat(__slice.call(arguments)));
    },
    hElse: function() {
      return text('{{else}}');
    },
    hUnless: function() {
      return hBlock.apply(null, ['unless'].concat(__slice.call(arguments)));
    },
    hView: function() {
      return hBlock.apply(null, ['view'].concat(__slice.call(arguments)));
    },
    hBindAttr: function() {
      return hAttr.apply(null, ['bindAttr'].concat(__slice.call(arguments)));
    },
    hAction: function() {
      return hAttr.apply(null, ['action'].concat(__slice.call(arguments)));
    },
    hAttr: function(key, string, options) {
      var k, v;
      if (typeof string === 'object') {
        options = string;
        string = "";
      } else {
        string = " \"" + string + "\"";
      }
      if (options) {
        for (k in options) {
          v = options[k];
          string += " " + k + "=\"" + v + "\"";
        }
      }
      return text("{{" + key + string + "}}");
    },
    hBlock: function(key, string, options, block) {
      var k, v;
      if (typeof options === 'function') {
        block = options;
        options = {};
      }
      options || (options = {});
      if (!_.isBlank(string)) {
        string = " " + string;
        for (k in options) {
          v = options[k];
          string += " " + k + "=\"" + v + "\"";
        }
      }
      text("{{#" + key + string + "}}" + (block ? "\n" : ""));
      if (block) {
        block();
        return text("{{/" + key + "}}");
      }
    }
  };

  Tower.ViewHeadHelper = {
    metaTag: function(name, content) {
      return meta({
        name: name,
        content: content
      });
    },
    snapshotLinkTag: function(href) {
      return linkTag({
        rel: 'imageSrc',
        href: href
      });
    },
    html4ContentTypeTag: function(charset, type) {
      if (charset == null) {
        charset = 'UTF-8';
      }
      if (type == null) {
        type = 'text/html';
      }
      return httpMetaTag('Content-Type', "" + type + "; charset=" + charset);
    },
    chromeFrameTag: function() {
      html4ContentTypeTag();
      return meta({
        'http-equiv': 'X-UA-Compatible',
        content: 'IE=Edge,chrome=1'
      });
    },
    html5ContentTypeTag: function(charset) {
      if (charset == null) {
        charset = 'UTF-8';
      }
      return meta({
        charset: charset
      });
    },
    contentTypeTag: function(charset) {
      return html5ContentTypeTag(charset);
    },
    csrfMetaTag: function() {
      return metaTag('csrf-token', this.request.session._csrf);
    },
    searchLinkTag: function(href, title) {
      return linkTag({
        rel: 'search',
        type: 'application/opensearchdescription+xml',
        href: href,
        title: title
      });
    },
    faviconLinkTag: function(favicon) {
      if (favicon == null) {
        favicon = '/favicon.ico';
      }
      return linkTag({
        rel: 'shortcut icon',
        href: favicon,
        type: 'image/x-icon'
      });
    },
    linkTag: function(options) {
      if (options == null) {
        options = {};
      }
      return link(options);
    },
    ieApplicationMetaTags: function(title, options) {
      var result;
      if (options == null) {
        options = {};
      }
      result = [];
      result.push(metaTag('application-name', title));
      if (options.hasOwnProperty('tooltip')) {
        result.push(metaTag('msapplication-tooltip', options.tooltip));
      }
      if (options.hasOwnProperty('url')) {
        result.push(metaTag('msapplication-starturl', options.url));
      }
      if (options.hasOwnProperty('width') && options.hasOwnProperty('height')) {
        result.push(metaTag('msapplication-window', "width=" + options.width + ";height=" + options.height));
        if (options.hasOwnProperty('color')) {
          result.push(metaTag('msapplication-navbutton-color', options.color));
        }
      }
      return result.join('\n');
    },
    ieTaskMetaTag: function(name, path, icon) {
      var content;
      if (icon == null) {
        icon = null;
      }
      content = [];
      content.push("name=" + name);
      content.push("uri=" + path);
      if (icon) {
        content.push("icon-uri=" + icon);
      }
      return this.metaTag('msapplication-task', content.join(';'));
    },
    appleMetaTags: function(options) {
      var result;
      if (options == null) {
        options = {};
      }
      result = [];
      result.push(appleViewportMetaTag(options));
      if (options.hasOwnProperty('fullScreen')) {
        result.push(appleFullScreenMetaTag(options.fullScreen));
      }
      if (options.hasOwnProperty('mobile')) {
        result.push(appleMobileCompatibleMetaTag(options.mobile));
      }
      return result.join();
    },
    appleViewportMetaTag: function(options) {
      var viewport;
      if (options == null) {
        options = {};
      }
      viewport = [];
      if (options.hasOwnProperty('width')) {
        viewport.push("width=" + options.width);
      }
      if (options.hasOwnProperty('height')) {
        viewport.push("height=" + options.height);
      }
      viewport.push("initial-scale=" + (options.scale || 1.0));
      if (options.hasOwnProperty('min')) {
        viewport.push("minimum-scale=" + options.min);
      }
      if (options.hasOwnProperty('max')) {
        viewport.push("maximum-scale=" + options.max);
      }
      if (options.hasOwnProperty('scalable')) {
        viewport.push("user-scalable=" + (boolean(options.scalable)));
      }
      return metaTag('viewport', viewport.join(', '));
    },
    appleFullScreenMetaTag: function(value) {
      return metaTag('apple-touch-fullscreen', boolean(value));
    },
    appleMobileCompatibleMetaTag: function(value) {
      return metaTag('apple-mobile-web-app-capable', boolean(value));
    },
    appleTouchIconLinkTag: function(path, options) {
      var rel;
      if (options == null) {
        options = {};
      }
      rel = ['apple-touch-icon'];
      if (options.hasOwnProperty('size')) {
        rel.push("" + options.size + "x" + options.size);
      }
      if (options.precomposed) {
        rel.push('precomposed');
      }
      return linkTag({
        rel: rel.join('-'),
        href: path
      });
    },
    appleTouchIconLinkTags: function() {
      var options, path, result, size, sizes, _len6, _o;
      path = arguments[0], sizes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof sizes[sizes.length - 1] === 'object') {
        options = sizes.pop();
      } else {
        options = {};
      }
      result = [];
      for (_o = 0, _len6 = sizes.length; _o < _len6; _o++) {
        size = sizes[_o];
        result.push(appleTouchIconLinkTag(path, _.extend({
          size: size
        }, options)));
      }
      return result.join();
    },
    openGraphMetaTags: function(options) {
      if (options == null) {
        options = {};
      }
      if (options.title) {
        openGraphMetaTag('og:title', options.title);
      }
      if (options.type) {
        openGraphMetaTag('og:type', options.type);
      }
      if (options.image) {
        openGraphMetaTag('og:image', options.image);
      }
      if (options.site) {
        openGraphMetaTag('og:siteName', options.site);
      }
      if (options.description) {
        openGraphMetaTag('og:description', options.description);
      }
      if (options.email) {
        openGraphMetaTag('og:email', options.email);
      }
      if (options.phone) {
        openGraphMetaTag('og:phoneNumber', options.phone);
      }
      if (options.fax) {
        openGraphMetaTag('og:faxNumber', options.fax);
      }
      if (options.lat) {
        openGraphMetaTag('og:latitude', options.lat);
      }
      if (options.lng) {
        openGraphMetaTag('og:longitude', options.lng);
      }
      if (options.street) {
        openGraphMetaTag('og:street-address', options.street);
      }
      if (options.city) {
        openGraphMetaTag('og:locality', options.city);
      }
      if (options.state) {
        openGraphMetaTag('og:region', options.state);
      }
      if (options.zip) {
        openGraphMetaTag('og:postal-code', options.zip);
      }
      if (options.country) {
        openGraphMetaTag('og:country-name', options.country);
      }
      return null;
    },
    openGraphMetaTag: function(property, content) {
      return meta({
        property: property,
        content: content
      });
    }
  };

  Tower.ViewRenderingHelper = {
    partial: function(path, options, callback) {
      var item, locals, name, prefixes, template, tmpl, _len6, _o, _ref6;
      try {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        options || (options = {});
        options.locals || (options.locals = {});
        locals = options.locals;
        path = path.split("/");
        path[path.length - 1] = "_" + path[path.length - 1];
        path = path.join("/");
        prefixes = options.prefixes;
        if (this._context) {
          prefixes || (prefixes = [this._context.collectionName]);
        }
        template = this._readTemplate(path, prefixes, options.type || Tower.View.engine);
        template = this.renderWithEngine(String(template));
        if (options.collection) {
          name = options.as || _.camelize(options.collection[0].constructor.name, true);
          tmpl = eval("(function(data) { with(data) { this." + name + " = " + name + "; " + (String(template)) + " } })");
          _ref6 = options.collection;
          for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
            item = _ref6[_o];
            locals[name] = item;
            tmpl.call(this, locals);
            delete this[name];
          }
        } else {
          tmpl = "(function(data) { with(data) { " + (String(template)) + " } })";
          eval(tmpl).call(this, locals);
        }
      } catch (error) {
        console.log(error.stack || error);
      }
      return null;
    },
    page: function() {
      var args, browserTitle, options;
      args = _.args(arguments);
      options = _.extractOptions(args);
      browserTitle = args.shift() || options.title;
      return this.contentFor("title", function() {
        return title(browserTitle);
      });
    },
    urlFor: function() {
      return Tower.urlFor.apply(Tower, arguments);
    },
    yields: function(key) {
      var ending, value;
      value = this[key];
      if (typeof value === "function") {
        eval("(" + (String(value)) + ")()");
      } else {
        ending = value.match(/\n$/) ? "\n" : "";
        text(value.replace(/\n$/, "").replace(/^(?!\s+$)/mg, __cc.repeat('  ', __cc.tabs)) + ending);
      }
      return null;
    },
    hasContentFor: function(key) {
      return !!(this.hasOwnProperty(key) && this[key] && this[key] !== "");
    },
    has: function(key) {
      return !!(this.hasOwnProperty(key) && this[key] && this[key] !== "");
    },
    contentFor: function(key, block) {
      this[key] = block;
      return null;
    }
  };

  Tower.ViewStringHelper = {
    HTML_ESCAPE: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    },
    preserve: function(text) {
      return text.replace(/\n/g, '&#x000A;').replace(/\r/g, '');
    },
    htmlEscape: function(text) {
      var _this = this;
      return text.replace(/[\"><&]/g, function(_) {
        return _this.HTML_ESCAPE[_];
      });
    },
    t: function(string, options) {
      return Tower.SupportI18n.translate(string, options);
    },
    l: function(object) {
      return Tower.SupportI18n.localize(string);
    },
    boolean: function(boolean) {
      if (boolean) {
        return "yes";
      } else {
        return "no";
      }
    }
  };

  Tower.View.include(Tower.ViewRendering);

  Tower.View.include(Tower.ViewAssetHelper);

  Tower.View.include(Tower.ViewComponentHelper);

  Tower.View.include(Tower.ViewEmberHelper);

  Tower.View.include(Tower.ViewHeadHelper);

  Tower.View.include(Tower.ViewRenderingHelper);

  Tower.View.include(Tower.ViewStringHelper);

  Tower.View.helper(Tower.ViewAssetHelper);

  Tower.View.helper(Tower.ViewComponentHelper);

  Tower.View.helper(Tower.ViewEmberHelper);

  Tower.View.helper(Tower.ViewHeadHelper);

  Tower.View.helper(Tower.ViewRenderingHelper);

  Tower.View.helper(Tower.ViewStringHelper);

  Ember.TEMPLATES || (Ember.TEMPLATES = {});

  Tower.View.reopen({
    findEmberViewOLD: function(path) {
      var view;
      if (!Ember.TEMPLATES.hasOwnProperty(path)) {
        return null;
      }
      view = Ember.View.create({
        templateName: path
      });
      return view;
    },
    findEmberView: function(options) {
      if (options.view) {
        return options.view;
      } else if (options.template) {
        this._getEmberTemplate(options.template);
        return Tower.Application.instance().get(Tower._.camelize(options.template) + 'View');
      }
    },
    renderEmberView: function(options) {
      return this.parentController().connectOutlet(this._connectOutletOptions(options));
    },
    _connectOutletOptions: function(options) {
      return {
        outletName: options.outlet || 'view',
        viewClass: this.findEmberView(options),
        controller: this._context
      };
    },
    _getEmberTemplate: function(name) {
      if (typeof Ember.TEMPLATES[name] === 'object') {
        Ember.TEMPLATES[name] = Ember.TEMPLATES[name].func();
      }
      return Ember.TEMPLATES[name];
    }
  });

  $.fn.serializeParams = function(coerce) {
    return $.serializeParams($(this).serialize(), coerce);
  };

  $.serializeParams = function(params, coerce) {
    var array, coerce_types, cur, i, index, item, keys, keys_last, obj, param, val, _len6, _o;
    obj = {};
    coerce_types = {
      "true": !0,
      "false": !1,
      "null": null
    };
    array = params.replace(/\+/g, " ").split("&");
    for (index = _o = 0, _len6 = array.length; _o < _len6; index = ++_o) {
      item = array[index];
      param = item.split("=");
      key = decodeURIComponent(param[0]);
      val = void 0;
      cur = obj;
      i = 0;
      keys = key.split("][");
      keys_last = keys.length - 1;
      if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
        keys[keys_last] = keys[keys_last].replace(/\]$/, "");
        keys = keys.shift().split("[").concat(keys);
        keys_last = keys.length - 1;
      } else {
        keys_last = 0;
      }
      if (param.length === 2) {
        val = decodeURIComponent(param[1]);
        if (coerce) {
          val = (val && !isNaN(val) ? +val : (val === "undefined" ? undefined : (coerce_types[val] !== undefined ? coerce_types[val] : val)));
        }
        if (keys_last) {
          while (i <= keys_last) {
            key = (keys[i] === "" ? cur.length : keys[i]);
            cur = cur[key] = (i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val);
            i++;
          }
        } else {
          if ($.isArray(obj[key])) {
            obj[key].push(val);
          } else if (obj[key] !== undefined) {
            obj[key] = [obj[key], val];
          } else {
            obj[key] = val;
          }
        }
      } else {
        if (key) {
          obj[key] = (coerce ? undefined : "");
        }
      }
    }
    return obj;
  };

  $.fn.serializeParams = function(coerce) {
    return $.serializeParams($(this).serialize(), coerce);
  };

  $.serializeParams = function(params, coerce) {
    var array, coerce_types, cur, i, index, item, keys, keys_last, obj, param, val, _len6, _o;
    obj = {};
    coerce_types = {
      "true": !0,
      "false": !1,
      "null": null
    };
    array = params.replace(/\+/g, " ").split("&");
    for (index = _o = 0, _len6 = array.length; _o < _len6; index = ++_o) {
      item = array[index];
      param = item.split("=");
      key = decodeURIComponent(param[0]);
      val = void 0;
      cur = obj;
      i = 0;
      keys = key.split("][");
      keys_last = keys.length - 1;
      if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
        keys[keys_last] = keys[keys_last].replace(/\]$/, "");
        keys = keys.shift().split("[").concat(keys);
        keys_last = keys.length - 1;
      } else {
        keys_last = 0;
      }
      if (param.length === 2) {
        val = decodeURIComponent(param[1]);
        if (coerce) {
          val = (val && !isNaN(val) ? +val : (val === "undefined" ? undefined : (coerce_types[val] !== undefined ? coerce_types[val] : val)));
        }
        if (keys_last) {
          while (i <= keys_last) {
            key = (keys[i] === "" ? cur.length : keys[i]);
            cur = cur[key] = (i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val);
            i++;
          }
        } else {
          if ($.isArray(obj[key])) {
            obj[key].push(val);
          } else if (obj[key] !== undefined) {
            obj[key] = [obj[key], val];
          } else {
            obj[key] = val;
          }
        }
      } else {
        if (key) {
          obj[key] = (coerce ? undefined : "");
        }
      }
    }
    return obj;
  };

  Tower.ViewMetaHelper = {
    title: function(string) {
      return document.title = string;
    }
  };

  _ = Tower._;

  Tower.Controller = (function(_super) {
    var Controller;

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller = __extends(Controller, _super);

    Controller.include(Tower.SupportCallbacks);

    Controller.reopenClass(Tower.SupportEventEmitter);

    Controller.include(Tower.SupportEventEmitter);

    Controller.reopenClass({
      instance: function() {
        return this._instance || (this._instance = new this);
      }
    });

    Controller.reopen({
      init: function() {
        var metadata;
        this._super.apply(this, arguments);
        this.constructor._instance = this;
        this.headers = {};
        this.status = 200;
        this.request = null;
        this.response = null;
        this.params = {};
        this.query = {};
        metadata = this.constructor.metadata();
        this.resourceName = metadata.resourceName;
        this.resourceType = metadata.resourceType;
        this.collectionName = metadata.collectionName;
        this.formats = Tower.isClient ? ['html'] : _.keys(metadata.mimes);
        return this.hasParent = this.constructor.hasParent();
      }
    });

    return Controller;

  })(Tower.Collection);

  Tower.ControllerCallbacks = {
    ClassMethods: {
      beforeAction: function() {
        return this.before.apply(this, ['action'].concat(__slice.call(arguments)));
      },
      afterAction: function() {
        return this.after.apply(this, ['action'].concat(__slice.call(arguments)));
      },
      callbacks: function() {
        return this.metadata().callbacks;
      }
    }
  };

  _ = Tower._;

  Tower.ControllerErrors = {
    ClassMethods: {
      rescue: function(type, method, options) {
        var _this = this;
        return Tower.Application.instance().errorHandlers.push(function(error) {
          var errorType;
          errorType = typeof type === 'string' ? global[type] : type;
          if (error instanceof errorType) {
            return _this.instance()[method](error);
          }
        });
      }
    },
    handleError: function(error) {
      return this.unauthorized(error);
    },
    unauthorized: function(error) {
      return this.render({
        status: 401,
        json: {
          error: error.toString()
        }
      });
    }
  };

  Tower.ControllerErrors.ClassMethods.rescueFrom = Tower.ControllerErrors.ClassMethods.rescue;

  _ = Tower._;

  Tower.ControllerHelpers = {
    ClassMethods: {
      helper: function(object) {
        return this.helpers().push(object);
      },
      helpers: function() {
        return this.metadata().helpers;
      },
      layout: function(layout) {
        return this.metadata().layout = layout;
      }
    },
    layout: function() {
      var layout;
      layout = this.constructor.metadata().layout;
      if (typeof layout === 'function') {
        return layout.call(this);
      } else {
        return layout;
      }
    }
  };

  _ = Tower._;

  Tower.ControllerInstrumentation = {
    call: function(request, response, next) {
      var accept, acceptFormat, encoding, files, params, value, _ref6, _ref7, _ref8;
      this.request = request;
      this.response = response;
      this.params = params = request.params || {};
      this.headers = {};
      this.cookies = request.cookies || {};
      this.query = request.query || {};
      this.session = request.session || {};
      if (typeof params.conditions === 'string') {
        params.conditions = JSON.parse(params.conditions);
      }
      if (!params.format) {
        accept = (_ref6 = this.request) != null ? (_ref7 = _ref6.headers) != null ? _ref7['accept'] : void 0 : void 0;
        acceptFormat = accept != null ? accept.split(',') : void 0;
        if (accept === void 0) {
          try {
            params.format = require('mime').extension(request.header('content-type'));
          } catch (_error) {}
        } else {
          try {
            params.format = require('mime').extension(acceptFormat[0]);
          } catch (_error) {}
        }
        params.format || (params.format = 'html');
        if (params.format.toLowerCase() === 'form') {
          params.format = 'html';
        }
      }
      encoding = (_ref8 = request.headers) != null ? _ref8['accept-charset'] : void 0;
      this.encoding = encoding || (encoding = Tower.defaultEncoding);
      if (files = request.files) {
        for (key in files) {
          value = files[key];
          params[key] || (params[key] = {});
          _.extend(params[key], value);
        }
      }
      this.format = params.format;
      this.action = params.action;
      this.callback = next;
      return this.process();
    },
    process: function() {
      var block, complete,
        _this = this;
      if (!Tower.env.match(/(test|production)/)) {
        console.log("  Processing by " + (this.constructor.className()) + "#" + this.action + " as " + (this.format.toUpperCase()) + " (" + this.request.method + ")");
        console.log("  Parameters:", this.params);
      }
      block = function(callback) {
        try {
          return _this[_this.action].call(_this, callback);
        } catch (error) {
          return callback(error);
        }
      };
      complete = function(error) {
        if (error) {
          if (Tower.env === 'development') {
            console.log("Callback failed", error);
          }
          return _this.handleError(error);
        }
      };
      return this.runCallbacks('action', {
        name: this.action
      }, block, complete);
    },
    clear: function() {
      this.request = null;
      return this.response = null;
    },
    metadata: function() {
      return this.constructor.metadata();
    }
  };

  _ = Tower._;

  Tower.ControllerMetadata = {
    ClassMethods: {
      baseClass: function() {
        if (this.__super__ && this.__super__.constructor.baseClass && this.__super__.constructor !== Tower.Controller) {
          return this.__super__.constructor.baseClass();
        } else {
          return this;
        }
      },
      metadata: function() {
        var baseClassName, belongsTo, callbackChain, callbacks, className, collectionName, helpers, layout, metadata, mimes, params, renderers, resourceName, resourceType, result, scopeNames, scopes, subscriptions, superMetadata, _ref6;
        this._metadata || (this._metadata = {});
        className = this.className();
        metadata = this._metadata[className];
        if (metadata) {
          return metadata;
        }
        baseClassName = this.baseClass().className();
        if (baseClassName !== className) {
          superMetadata = this.baseClass().metadata();
        } else {
          superMetadata = {};
        }
        resourceType = _.singularize(className.replace(/(Controller)$/, ''));
        resourceName = this._compileResourceName(resourceType);
        collectionName = _.camelize(className.replace(/(Controller)$/, ''), true);
        params = _.copyObject(superMetadata.params);
        renderers = _.copyObject(superMetadata.renderers);
        scopes = _.copyObject(superMetadata.scopes);
        scopeNames = _.copyArray(superMetadata.scopeNames);
        mimes = superMetadata.mimes ? _.clone(superMetadata.mimes) : {
          json: {},
          html: {}
        };
        helpers = _.copyArray(superMetadata.helpers);
        belongsTo = _.copyArray(superMetadata.belongsTo);
        subscriptions = _.copyArray(superMetadata.subscriptions);
        layout = superMetadata.layout;
        callbacks = {};
        if (superMetadata.callbacks) {
          _ref6 = superMetadata.callbacks;
          for (action in _ref6) {
            callbackChain = _ref6[action];
            callbacks[action] = callbackChain.clone();
          }
        }
        result = this._metadata[className] = {
          className: className,
          resourceName: resourceName,
          resourceType: resourceType,
          collectionName: collectionName,
          params: params,
          renderers: renderers,
          mimes: mimes,
          callbacks: callbacks,
          helpers: helpers,
          belongsTo: belongsTo,
          subscriptions: subscriptions,
          layout: layout,
          scopes: scopes,
          scopeNames: scopeNames
        };
        return result;
      },
      _compileResourceName: function(type) {
        var parts, resourceName;
        parts = type.split('.');
        return resourceName = _.camelize(parts[parts.length - 1], true);
      }
    }
  };

  _ = Tower._;

  Tower.ControllerParams = {
    ClassMethods: {
      param: function(key, options) {
        if (options == null) {
          options = {};
        }
        options.resourceType = this.metadata().resourceType;
        return this.params()[key] = Tower.NetParam.create(key, options);
      },
      params: function() {
        var arg, value, _len6, _o;
        if (arguments.length) {
          for (_o = 0, _len6 = arguments.length; _o < _len6; _o++) {
            arg = arguments[_o];
            if (typeof arg === 'object') {
              for (key in arg) {
                value = arg[key];
                this.param(key, value);
              }
            } else {
              this.param(arg);
            }
          }
        }
        return this.metadata().params;
      },
      _buildCursorFromGet: function(params, cursor) {
        var fields, name, object, parser, parsers;
        parsers = this.params();
        for (name in parsers) {
          parser = parsers[name];
          if (params.hasOwnProperty(name)) {
            if (name === 'sort') {
              cursor.order(parser.parse(params[name]));
            } else if (name === 'fields') {
              fields = _.select(_.flatten(parser.parse(params[name])), function(i) {
                return i.value;
              });
              fields = _.flatten(_.map(fields, function(i) {
                return i.value;
              }));
              cursor.select(fields);
            } else if (name === 'limit') {
              cursor.limit(parser.extractValue(params[name]));
            } else if (name === 'page') {
              cursor.page(parser.extractValue(params[name]));
            } else if (typeof params[name] === 'string') {
              cursor.where(parser.toCursor(params[name]));
            } else {
              object = {};
              object[name] = params[name];
              cursor.where(object);
            }
          }
        }
        return cursor;
      }
    },
    cursor: function() {
      var cursor;
      if (this._cursor) {
        return this._cursor;
      }
      cursor = Tower.ModelCursor.create();
      cursor.make();
      if (this.params.conditions) {
        this._cursor = this._buildCursorFromPost(cursor);
      } else {
        this._cursor = this._buildCursorFromGet(cursor);
      }
      return this._cursor;
    },
    _buildCursorFromPost: function(cursor) {
      var cleanConditions, conditions, limit, page, params, parsers, sort;
      parsers = this.constructor.params();
      params = this.params;
      conditions = this.params.conditions;
      page = this.params.page;
      limit = this.params.limit;
      sort = this.params.sort;
      cleanConditions = function(hash) {
        var item, value, _len6, _o;
        for (key in hash) {
          value = hash[key];
          if (key === '$or' || key === '$nor') {
            for (_o = 0, _len6 = value.length; _o < _len6; _o++) {
              item = value[_o];
              cleanConditions(item);
            }
          } else {
            if (!(parsers.hasOwnProperty(key) || key.match(/id$/i))) {
              delete hash[key];
            }
          }
        }
        return hash;
      };
      conditions = cleanConditions(conditions);
      cursor.where(conditions);
      if (sort && sort.length) {
        cursor.order(sort);
      }
      if (limit) {
        cursor.limit(limit);
      }
      if (page) {
        cursor.page(page);
      }
      return cursor;
    },
    _buildCursorFromGet: function(cursor) {
      return this.constructor._buildCursorFromGet(this.get('params'), cursor);
    }
  };

  _ = Tower._;

  Tower.ControllerRedirecting = {
    redirectTo: function() {
      return this.redirect.apply(this, arguments);
    },
    redirect: function() {
      var args, options, url;
      try {
        args = _.args(arguments);
        options = _.extractOptions(args);
        url = args.shift();
        if (!url && options.hasOwnProperty('action')) {
          url = (function() {
            switch (options.action) {
              case 'index':
              case 'new':
                return Tower.urlFor(this.resourceType, {
                  action: options.action
                });
              case 'edit':
              case 'show':
                return Tower.urlFor(this.resource, {
                  action: options.action
                });
            }
          }).call(this);
        }
        url || (url = '/');
        if (Tower.env === 'test') {
          if (options.action === 'index') {
            url = '/custom';
          } else {
            url = "/custom/" + (this.resource.get('id'));
          }
        }
        this.response.redirect(url);
      } catch (error) {
        console.log(error);
      }
      if (this.callback) {
        return this.callback();
      }
    }
  };

  _ = Tower._;

  Tower.ControllerRendering = {
    ClassMethods: {
      addRenderer: function(key, block) {
        return this.renderers()[key] = block;
      },
      addRenderers: function(renderers) {
        var block;
        if (renderers == null) {
          renderers = {};
        }
        for (key in renderers) {
          block = renderers[key];
          this.addRenderer(key, block);
        }
        return this;
      },
      renderers: function() {
        return this.metadata().renderers;
      }
    },
    InstanceMethods: {
      render: function() {
        return this.renderToBody(this._normalizeRender.apply(this, arguments));
      },
      renderToBody: function(options) {
        this._processRenderOptions(options);
        return this._renderTemplate(options);
      },
      renderToString: function() {
        return this.renderToBody(this._normalizeRender.apply(this, arguments));
      },
      sendFile: function(path, options) {
        if (options == null) {
          options = {};
        }
      },
      sendData: function(data, options) {
        if (options == null) {
          options = {};
        }
      },
      _renderTemplate: function(options) {
        var callback, view, _base, _callback,
          _this = this;
        _callback = options.callback;
        callback = function(error, body) {
          if (error) {
            _this.status || (_this.status = 404);
            _this.body = error.stack;
          } else {
            _this.status || (_this.status = 200);
            _this.body = body;
          }
          if (error) {
            console.log(_this.body);
          }
          if (_callback) {
            _callback.apply(_this, arguments);
          }
          if (_this.callback) {
            return _this.callback();
          }
        };
        if (this._handleRenderers(options, callback)) {
          return;
        }
        if (!Tower.isClient) {
          (_base = this.headers)['Content-Type'] || (_base['Content-Type'] = 'text/html');
        }
        view = new Tower.View(this);
        try {
          return view.render.call(view, options, callback);
        } catch (error) {
          return callback(error);
        }
      },
      _handleRenderers: function(options, callback) {
        var name, renderer, _ref6;
        _ref6 = Tower.Controller.renderers();
        for (name in _ref6) {
          renderer = _ref6[name];
          if (options.hasOwnProperty(name)) {
            renderer.call(this, options[name], options, callback);
            return true;
          }
        }
        return false;
      },
      _processRenderOptions: function(options) {
        if (options == null) {
          options = {};
        }
        if (options.status) {
          this.status = options.status;
        }
        if (options.contentType) {
          this.headers['Content-Type'] = options.contentType;
        }
        if (options.location) {
          this.headers['Location'] = this.urlFor(options.location);
        }
        return this;
      },
      _normalizeRender: function() {
        return this._normalizeOptions(this._normalizeArgs.apply(this, arguments));
      },
      _normalizeArgs: function() {
        var args, callback, options;
        args = _.args(arguments);
        if (typeof args[0] === 'string') {
          action = args.shift();
        }
        if (typeof args[0] === 'object') {
          options = args.shift();
        }
        if (typeof args[0] === 'function') {
          callback = args.shift();
        }
        options || (options = {});
        if (action) {
          key = !!action.match(/\//) ? 'file' : 'action';
          options[key] = action;
        }
        if (callback) {
          options.callback = callback;
        }
        return options;
      },
      _normalizeOptions: function(options) {
        if (options == null) {
          options = {};
        }
        if (options.partial === true) {
          options.partial = this.action;
        }
        options.prefixes || (options.prefixes = []);
        options.prefixes.push(this.collectionName);
        options.template || (options.template = options.file || (options.action || this.action));
        options.locals || (options.locals = {});
        if (Tower.isServer) {
          options.locals.flash = this.flash();
        }
        return options;
      }
    }
  };

  _ = Tower._;

  Tower.ControllerResourceful = {
    ClassMethods: {
      resource: function(options) {
        var metadata;
        metadata = this.metadata();
        if (typeof options === 'string') {
          options = {
            name: options,
            type: _.camelize(options),
            collectionName: _.pluralize(options)
          };
        }
        if (options.name) {
          metadata.resourceName = options.name;
        }
        if (options.type) {
          metadata.resourceType = options.type;
          if (!options.name) {
            metadata.resourceName = this._compileResourceName(options.type);
          }
        }
        if (options.collectionName) {
          metadata.collectionName = options.collectionName;
        }
        return this;
      },
      belongsTo: function(key, options) {
        var belongsTo;
        belongsTo = this.metadata().belongsTo;
        if (!key) {
          return belongsTo;
        }
        options || (options = {});
        options.key = key;
        options.type || (options.type = _.camelize(options.key));
        this.param("" + key + "Id", {
          exact: true,
          type: 'Id'
        });
        return belongsTo.push(options);
      },
      hasParent: function() {
        var belongsTo;
        belongsTo = this.belongsTo();
        return belongsTo.length > 0;
      },
      actions: function() {
        var actions, actionsToRemove, args, options, _len6, _o;
        args = _.flatten(_.args(arguments));
        options = _.extractOptions(args);
        actions = ['index', 'new', 'create', 'show', 'edit', 'update', 'destroy'];
        actionsToRemove = _.difference(actions, args, options.except || []);
        for (_o = 0, _len6 = actionsToRemove.length; _o < _len6; _o++) {
          action = actionsToRemove[_o];
          this[action] = null;
          delete this[action];
        }
        return this;
      }
    },
    respondWithScoped: function(callback) {
      var _this = this;
      return this.scoped(function(error, scope) {
        if (error) {
          return _this.failure(error, callback);
        }
        return _this.respondWith(scope.build(), callback);
      });
    },
    respondWithStatus: function(success, callback) {
      var failureResponder, options, successResponder;
      options = {
        records: this.resource || this.collection
      };
      if (callback && callback.length > 1) {
        successResponder = new Tower.ControllerResponder(this, options);
        failureResponder = new Tower.ControllerResponder(this, options);
        callback.call(this, successResponder, failureResponder);
        if (success) {
          return successResponder._respond();
        } else {
          return failureResponder._respond();
        }
      } else {
        return Tower.ControllerResponder.respond(this, options, callback);
      }
    },
    buildResource: function(callback) {
      var _this = this;
      return this.scoped(function(error, scope) {
        var resource;
        if (error) {
          return callback.call(_this, error, null);
        }
        resource = scope.build(_this.params[_this.resourceName]);
        _this.set('resource', resource);
        _this.set(_this.resourceName, resource);
        if (callback) {
          callback.call(_this, null, resource);
        }
        return resource;
      });
    },
    createResource: function(callback) {
      var _this = this;
      return this.scoped(function(error, scope) {
        var resource;
        if (error) {
          return callback.call(_this, error, null);
        }
        resource = null;
        scope.insert(_this.params[_this.resourceName], function(error, resource) {
          _this.set('resource', resource);
          _this.set(_this.resourceName, resource);
          if (callback) {
            return callback.call(_this, null, resource);
          }
        });
        return resource;
      });
    },
    findResource: function(callback) {
      var _this = this;
      return this.scoped(function(error, scope) {
        if (error) {
          return callback.call(_this, error, null);
        }
        return scope.find(_this.params.id, function(error, resource) {
          _this.set('resource', resource);
          _this.set(_this.resourceName, resource);
          return callback.call(_this, error, resource);
        });
      });
    },
    findCollection: function(callback) {
      var _this = this;
      return this.scoped(function(error, scope) {
        if (error) {
          return callback.call(_this, error, null);
        }
        return scope.all(function(error, collection) {
          _this.set('collection', collection);
          _this.set(_this.collectionName, collection);
          if (callback) {
            return callback.call(_this, error, collection);
          }
        });
      });
    },
    findParent: function(callback) {
      var parentClass, relation,
        _this = this;
      relation = this.findParentRelation();
      if (relation) {
        parentClass = Tower.constant(relation.type);
        return parentClass.find(this.params[relation.param], function(error, parent) {
          if (error && !callback) {
            throw error;
          }
          if (!error) {
            _this.set('parent', parent);
            _this.set(relation.key, parent);
          }
          if (callback) {
            return callback.call(_this, error, parent);
          }
        });
      } else {
        if (callback) {
          callback.call(this, null, false);
        }
        return false;
      }
    },
    findParentRelation: function() {
      var belongsTo, param, params, relation, _len6, _o;
      belongsTo = this.constructor.belongsTo();
      params = this.params;
      if (belongsTo.length > 0) {
        for (_o = 0, _len6 = belongsTo.length; _o < _len6; _o++) {
          relation = belongsTo[_o];
          param = relation.param || ("" + relation.key + "Id");
          if (params.hasOwnProperty(param)) {
            relation = _.extend({}, relation);
            relation.param = param;
            return relation;
          }
        }
        return null;
      } else {
        return null;
      }
    },
    scoped: function(callback) {
      var callbackWithScope,
        _this = this;
      callbackWithScope = function(error, scope) {
        return callback.call(_this, error, scope.where(_this.cursor()));
      };
      if (this.hasParent) {
        this.findParent(function(error, parent) {
          if (error || !parent) {
            return callbackWithScope(error, Tower.constant(_this.resourceType));
          } else {
            return callbackWithScope(error, parent.get(_this.collectionName));
          }
        });
      } else {
        callbackWithScope(null, Tower.constant(this.resourceType));
      }
      return void 0;
    },
    resourceKlass: function() {
      return Tower.constant(Tower.namespaced(this.resourceType));
    },
    failure: function(resource, callback) {
      callback();
      return void 0;
    }
  };

  _ = Tower._;

  Tower.ControllerResponder = (function() {

    __defineStaticProperty(ControllerResponder,  "respond", function(controller, options, callback) {
      var responder;
      responder = new this(controller, options);
      return responder.respond(callback);
    });

    function ControllerResponder(controller, options) {
      var format, _len6, _o, _ref6;
      if (options == null) {
        options = {};
      }
      this.controller = controller;
      this.options = options;
      _ref6 = this.controller.formats;
      for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
        format = _ref6[_o];
        this.accept(format);
      }
    }

    __defineProperty(ControllerResponder,  "accept", function(format) {
      return this[format] = function(callback) {
        return this["_" + format] = callback;
      };
    });

    __defineProperty(ControllerResponder,  "respond", function(callback) {
      if (callback) {
        callback.call(this.controller, this);
      }
      return this._respond();
    });

    __defineProperty(ControllerResponder,  "_respond", function() {
      var method;
      method = this["_" + this.controller.format];
      if (method) {
        return method.call(this);
      } else {
        return this.toFormat();
      }
    });

    __defineProperty(ControllerResponder,  "_html", function() {
      return this.controller.render({
        action: this.controller.action
      });
    });

    __defineProperty(ControllerResponder,  "_json", function() {
      return this.controller.render({
        json: this.options.records
      });
    });

    __defineProperty(ControllerResponder,  "toFormat", function() {
      try {
        if ((typeof get !== "undefined" && get !== null) || !(typeof hasErrors !== "undefined" && hasErrors !== null)) {
          return this.defaultRender();
        } else {
          return this.displayErrors();
        }
      } catch (error) {
        console.log(error);
        return this._apiBehavior(error);
      }
    });

    __defineProperty(ControllerResponder,  "_navigationBehavior", function(error) {
      if (typeof get !== "undefined" && get !== null) {
        throw error;
      } else if ((typeof hasErrors !== "undefined" && hasErrors !== null) && defaultAction) {
        return this.render({
          action: this.defaultAction
        });
      } else {
        return this.redirectTo(this.navigationLocation);
      }
    });

    __defineProperty(ControllerResponder,  "_apiBehavior", function(error) {
      if (typeof get !== "undefined" && get !== null) {
        return this.display(resource);
      } else if (typeof post !== "undefined" && post !== null) {
        return this.display(resource, {
          status: 'created',
          location: this.apiLocation
        });
      } else {
        return this.controller.head("noContent");
      }
    });

    __defineProperty(ControllerResponder,  "isResourceful", function() {
      return this.resource.hasOwnProperty("to" + (this.format.toUpperCase()));
    });

    __defineProperty(ControllerResponder,  "resourceLocation", function() {
      return this.options.location || this.resources;
    });

    __defineProperty(ControllerResponder,  "defaultRender", function() {
      return this.defaultResponse.call(options);
    });

    __defineProperty(ControllerResponder,  "display", function(resource, givenOptions) {
      if (givenOptions == null) {
        givenOptions = {};
      }
      return this.controller.render(_.extend(givenOptions, this.options, {
        format: this.resource
      }));
    });

    __defineProperty(ControllerResponder,  "displayErrors", function() {
      return this.controller.render({
        format: this.resourceErrors,
        status: 'unprocessableEntity'
      });
    });

    __defineProperty(ControllerResponder,  "hasErrors", function() {
      var _base;
      return (typeof (_base = this.resource).respondTo === "function" ? _base.respondTo('errors') : void 0) && !(this.resource.errors.empty != null);
    });

    __defineProperty(ControllerResponder,  "defaultAction", function() {
      return this.action || (this.action = ACTIONS_FOR_VERBS[request.requestMethodSymbol]);
    });

    __defineProperty(ControllerResponder,  "resourceErrors", function() {
      if (this.hasOwnProperty("" + format + "ResourceErrors")) {
        return this["" + format + "RresourceErrors"];
      } else {
        return this.resource.errors;
      }
    });

    __defineProperty(ControllerResponder,  "jsonResourceErrors", function() {
      return {
        errors: this.resource.errors
      };
    });

    return ControllerResponder;

  })();

  _ = Tower._;

  Tower.ControllerResponding = {
    ClassMethods: {
      respondTo: function() {
        var args, except, mimes, name, only, options, _len6, _o;
        mimes = this.mimes();
        args = _.args(arguments);
        if (typeof args[args.length - 1] === 'object') {
          options = args.pop();
        } else {
          options = {};
        }
        if (options.only) {
          only = _.toArray(options.only);
        }
        if (options.except) {
          except = _.toArray(options.except);
        }
        for (_o = 0, _len6 = args.length; _o < _len6; _o++) {
          name = args[_o];
          mimes[name] = {};
          if (only) {
            mimes[name].only = only;
          }
          if (except) {
            mimes[name].except = except;
          }
        }
        return this;
      },
      mimes: function() {
        return this.metadata().mimes;
      }
    },
    InstanceMethods: {
      respondTo: function(block) {
        return Tower.ControllerResponder.respond(this, {}, block);
      },
      respondWith: function() {
        var args, callback, options;
        args = _.args(arguments);
        callback = null;
        if (typeof args[args.length - 1] === 'function') {
          callback = args.pop();
        }
        if (typeof args[args.length - 1] === 'object' && !(args[args.length - 1] instanceof Tower.Model)) {
          options = args.pop();
        } else {
          options = {};
        }
        options || (options = {});
        options.records = args[0];
        return Tower.ControllerResponder.respond(this, options, callback);
      },
      _mimesForAction: function() {
        var config, mime, mimes, result, success;
        action = this.action;
        result = [];
        mimes = this.constructor.mimes();
        for (mime in mimes) {
          config = mimes[mime];
          success = false;
          if (config.except) {
            success = !_.include(config.except, action);
          } else if (config.only) {
            success = _.include(config.only, action);
          } else {
            success = true;
          }
          if (success) {
            result.push(mime);
          }
        }
        return result;
      }
    }
  };

  _ = Tower._;

  Tower.ControllerScopes = {
    ClassMethods: {
      scope: function(name, scope) {
        var chain, cursor, instance, metadata, object;
        name || (name = 'all');
        metadata = this.metadata();
        if (!scope) {
          if (typeof name === 'string') {
            chain = Tower.constant(metadata.resourceType);
            if (name !== 'all') {
              if (Tower.isClient) {
                scope = Ember.computed(function() {
                  return chain[name]().all().observable();
                });
              } else {
                scope = chain[name]();
              }
            } else {
              if (Tower.isClient) {
                scope = Ember.computed(function() {
                  return chain.all().observable();
                });
              } else {
                scope = chain;
              }
            }
          } else {
            scope = name;
            name = 'all';
          }
        } else {
          if (Tower.isClient && typeof scope === 'function') {
            cursor = scope;
            scope = Ember.computed(scope);
          }
        }
        try {
          if (scope.toCursor) {
            scope = scope.toCursor();
          }
          metadata.scopes[name] = scope;
          if (_.indexOf(metadata.scopeNames, name) === -1) {
            metadata.scopeNames.push(name);
          }
          object = {};
          object[name] = scope;
          this.reopen(object);
          if (Tower.isClient) {
            instance = this.instance();
            if (instance && !instance.get(name)) {
              return instance.set(name, cursor());
            }
          }
        } catch (error) {
          return console.log(error.stack || error);
        }
      }
    },
    resolveAgainstCursors: function(action, records, matches, callback) {
      var cursorMethod, cursors, iterator, keys,
        _this = this;
      cursors = this.constructor.metadata().scopes;
      if (!Tower.isClient) {
        matches || (matches = Ember.Map.create());
      }
      keys = _.keys(cursors);
      if (Tower.isClient) {
        cursorMethod = (function() {
          switch (action) {
            case 'create':
            case 'load':
              return 'mergeCreatedRecords';
            case 'update':
              return 'mergeUpdatedRecords';
            case 'destroy':
            case 'unload':
              return 'mergeDeletedRecords';
          }
        })();
      }
      iterator = function(name, next) {
        var cursor;
        if (Tower.isClient) {
          cursor = _this.get(name);
          cursor[cursorMethod](records);
          return next();
        } else {
          cursor = _this.getCursor(cursors[name]);
          cursor.testEach(records, function(success, record) {
            if (success) {
              return matches.set(record.get('id'), record);
            }
          });
          return next();
        }
      };
      Tower.parallel(keys, iterator, callback);
      return matches;
    },
    getCursor: function(object, callback) {
      var _this = this;
      object = (function() {
        switch (typeof object) {
          case 'object':
            return object;
          case 'string':
            return this.constructor.metadata().scopes[object];
        }
      }).call(this);
      if (typeof object === 'function') {
        switch (object.length) {
          case 1:
            object.call(this, function(error, result) {
              object = result;
              if (callback) {
                return callback.call(_this, object);
              }
            });
            break;
          default:
            object = object.call(this);
        }
      }
      if (object && object.toCursor) {
        object = object.toCursor();
      }
      return object;
    }
  };

  Tower.ControllerScopes.ClassMethods.collection = Tower.ControllerScopes.ClassMethods.scope;

  Tower.Controller.include(Tower.ControllerCallbacks);

  Tower.Controller.include(Tower.ControllerErrors);

  Tower.Controller.include(Tower.ControllerHelpers);

  Tower.Controller.include(Tower.ControllerInstrumentation);

  Tower.Controller.include(Tower.ControllerMetadata);

  Tower.Controller.include(Tower.ControllerParams);

  Tower.Controller.include(Tower.ControllerRedirecting);

  Tower.Controller.include(Tower.ControllerRendering);

  Tower.Controller.include(Tower.ControllerResourceful);

  Tower.Controller.include(Tower.ControllerResponding);

  Tower.Controller.include(Tower.ControllerScopes);

  _ = Tower._;

  Tower.Controller.reopenClass({
    extended: function() {
      var camelName, name, object;
      object = {};
      name = this.className();
      camelName = _.camelize(name, true);
      object[camelName] = Ember.computed(function() {
        return Tower.router.get(camelName);
      }).cacheable().property('Tower.router.' + camelName);
      this.reopen({
        resourceControllerBinding: "Tower.router." + (_.singularize(camelName.replace(/Controller$/, ''))) + "Controller"
      });
      Tower.Application.instance().reopen(object);
      Tower.NetConnection.controllers.push(camelName);
      return this;
    },
    instance: function() {
      return Tower.Application.instance().get(_.camelize(this.className(), true));
    }
  });

  Tower.ControllerActions = {
    index: function(params) {
      var _this = this;
      return this.findCollection(function(error, collection) {
        return _this.render('index');
      });
    },
    "new": function() {
      var _this = this;
      return this.buildResource(function(error, resource) {
        return _this.render('new');
      });
    },
    create: function(callback) {
      var _this = this;
      return this.createResource(function(error, resource) {
        if (!resource) {
          return _this.failure(error);
        }
      });
    },
    show: function() {
      var _this = this;
      return this.findResource(function(error, resource) {
        if (error) {
          return _this.failure(error);
        }
        return _this.render('show');
      });
    },
    edit: function() {
      var _this = this;
      return this.findResource(function(error, resource) {
        if (error) {
          return _this.failure(error);
        }
        return _this.render('edit');
      });
    },
    update: function() {
      var _this = this;
      return this.updateResource(function(error, resource) {
        if (error) {
          return _this.failure(error);
        }
        return _this.redirectTo('show');
      });
    },
    save: function() {},
    destroy: function() {
      var _this = this;
      return this.destroyResource(function(error, resource) {
        if (error) {
          return _this.failure(error);
        }
        return _this.redirectTo('index');
      });
    }
  };

  Tower.ControllerElements = {
    ClassMethods: {
      extractElements: function(target, options) {
        var method, result, selector, selectors;
        if (options == null) {
          options = {};
        }
        result = {};
        for (method in options) {
          selectors = options[method];
          for (key in selectors) {
            selector = selectors[key];
            result[key] = target[method](selector);
          }
        }
        return result;
      },
      processElements: function(target, options) {
        if (options == null) {
          options = {};
        }
        return this.elements = this.extractElements(target, options);
      }
    }
  };

  Tower.ControllerEvents = {
    ClassMethods: {
      DOM_EVENTS: ['click', 'dblclick', 'blur', 'error', 'focus', 'focusIn', 'focusOut', 'hover', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'ready', 'resize', 'scroll', 'select', 'submit', 'tap', 'taphold', 'swipe', 'swipeleft', 'swiperight'],
      dispatcher: global,
      addEventHandler: function(name, handler, options) {
        if (options.type === 'socket' || !name.match(this.DOM_EVENT_PATTERN)) {
          return this.addSocketEventHandler(name, handler, options);
        } else {
          return this.addDomEventHandler(name, handler, options);
        }
      },
      socketNamespace: function() {
        return Tower.SupportString.pluralize(Tower.SupportString.camelize(this.className().replace(/(Controller)$/, ''), false));
      },
      addSocketEventHandler: function(name, handler, options) {
        var _this = this;
        this.io || (this.io = Tower.Application.instance().io.connect('/' + this.socketNamespace()));
        return this.io.on(name, function(data) {
          return _this._dispatch(_this.io, handler, {
            params: data
          });
        });
      },
      addDomEventHandler: function(name, handler, options) {
        var eventType, method, parts, selector,
          _this = this;
        parts = name.split(/\ +/);
        name = parts.shift();
        selector = parts.join(' ');
        if (selector && selector !== '') {
          options.target = selector;
        }
        options.target || (options.target = 'body');
        eventType = name.split(/[\.:]/)[0];
        method = this["" + eventType + "Handler"];
        if (method) {
          method.call(this, name, handler, options);
        } else {
          $(this.dispatcher).on(name, options.target, function(event) {
            return _this._dispatch(event, handler, options);
          });
        }
        return this;
      },
      _dispatch: function(event, handler, options) {
        var controller;
        if (options == null) {
          options = {};
        }
        controller = this.instance();
        controller.elements || (controller.elements = {});
        controller.params || (controller.params = {});
        if (options.params) {
          Tower._.extend(controller.params, options.params);
        }
        if (options.elements) {
          Tower._.extend(controller.elements, options.elements);
        }
        if (typeof handler === 'string') {
          return controller[handler].call(controller, event);
        } else {
          return handler.call(controller, event);
        }
      }
    }
  };

  Tower.ControllerEvents.ClassMethods.DOM_EVENT_PATTERN = new RegExp("^(" + (Tower.ControllerEvents.ClassMethods.DOM_EVENTS.join("|")) + ")");

  Tower.ControllerHandlers = {
    ClassMethods: {
      clickHandler: function(name, handler, options) {
        var effect, elementObject, value,
          _this = this;
        if (options == null) {
          options = {};
        }
        elementObject = options.elements;
        delete options.elements;
        effect = options.effect;
        delete options.effect;
        for (key in options) {
          value = options[key];
          if (typeof value !== 'string') {
            options[key] = "data-" + key;
          }
        }
        return $(this.dispatcher).on(name, options.target, function(event) {
          var element, elements, params;
          element = $(event.currentTarget);
          params = {};
          for (key in options) {
            value = options[key];
            value = element.attr(value);
            if (value != null) {
              params[key] = value;
            }
          }
          if (elementObject) {
            elements = {};
            for (key in elementObject) {
              value = elementObject[key];
              elements[key] = element.find(value);
            }
          }
          if (effect) {
            if (typeof effect === 'string') {
              element[effect]();
            } else {
              element.animate(effect);
            }
          }
          return _this._dispatch(event, handler, params);
        });
      },
      submitHandler: function(name, handler, options) {
        var _this = this;
        return $(this.dispatcher).on(name, options.target, function(event) {
          var elements, form, method, params, target;
          target = $(event.target);
          form = target.closest("form");
          action = form.attr("action");
          method = (form.attr("data-method") || form.attr("method")).toUpperCase();
          params = form.serializeParams();
          params.method = method;
          params.action = action;
          elements = Tower._.extend({
            target: target,
            form: form
          }, {});
          event.data = {
            elements: elements,
            params: params
          };
          return _this._dispatch(event, handler, event.data);
        });
      }
    },
    redirect: function() {
      return Tower.goTo(Tower.urlFor.apply(Tower, arguments));
    }
  };

  Tower.ControllerInstrumentation = {
    params: Ember.computed(function() {
      return Tower.router.getStateMeta(Tower.router.get('currentState'), 'serialized');
    }).volatile(),
    resource: Ember.computed(function() {
      return Tower.router.getStateMeta(Tower.router.get('currentState'), 'context') || this.get(this.get('resourceName'));
    }).volatile(),
    enter: function() {
      var _this = this;
      return Ember.changeProperties(function() {
        _this.set('isActive', true);
        return _this.set('format', 'html');
      });
    },
    enterAction: function(action) {
      var _this = this;
      return Ember.changeProperties(function() {
        _this.set('action', action);
        _this.set('getFlash', _this.flash());
        return _this.set(_.toStateName(action), true);
      });
    },
    call: function(router, params) {
      var _this = this;
      if (params == null) {
        params = {};
      }
      router.send('stashContext', params);
      action = this.get('action');
      this.propertyDidChange('resource');
      return this.runCallbacks('action', {
        name: action
      }, function(callback) {
        var method;
        method = _this[action];
        method = (function() {
          switch (typeof method) {
            case 'object':
              return method.enter;
            case 'function':
              return method;
            default:
              return null;
          }
        })();
        if (!method) {
          throw new Error("Action '" + action + "' is not defined properly.");
        }
        return method.call(_this, params, callback);
      });
    },
    exit: function() {
      return this.set('isActive', false);
    },
    exitAction: function(action) {
      var method,
        _this = this;
      Ember.changeProperties(function() {
        return _this.set(Tower._.toStateName(action), false);
      });
      method = this[action];
      if (typeof method === 'object' && method.exit) {
        return method.exit.call(this);
      }
    },
    clear: function() {},
    metadata: function() {
      return this.constructor.metadata();
    }
  };

  Tower.ControllerStates = {
    parentController: function() {
      return Tower.Application.instance().get('applicationController');
    }
  };

  Tower.ControllerFlash = {
    flash: function(type, message) {
      var arr, messages;
      messages = $.jStorage.get('flash', {});
      if (type && message) {
        messages[type] = String(message);
        return $.jStorage.set('flash', messages);
      } else if (type) {
        arr = messages[type];
        delete messages[type];
        $.jStorage.set('flash', messages);
        return String(arr || '');
      } else {
        $.jStorage.set('flash', {});
        return messages;
      }
    }
  };

  Tower.Controller.include(Tower.ControllerActions);

  Tower.Controller.include(Tower.ControllerElements);

  Tower.Controller.include(Tower.ControllerEvents);

  Tower.Controller.include(Tower.ControllerHandlers);

  Tower.Controller.include(Tower.ControllerInstrumentation);

  Tower.Controller.include(Tower.ControllerStates);

  Tower.Controller.include(Tower.ControllerFlash);

  Tower.Net = {};

  Tower.NetAgent = (function() {

    function NetAgent(attributes) {
      if (attributes == null) {
        attributes = {};
      }
      _.extend(this, attributes);
    }

    __defineProperty(NetAgent,  "toJSON", function() {
      return {
        family: this.family,
        major: this.major,
        minor: this.minor,
        patch: this.patch,
        version: this.version,
        os: this.os,
        name: this.name
      };
    });

    __defineProperty(NetAgent,  "get", function() {
      return this.request.apply(this, ['get'].concat(__slice.call(arguments)));
    });

    __defineProperty(NetAgent,  "post", function() {
      return this.request.apply(this, ['post'].concat(__slice.call(arguments)));
    });

    __defineProperty(NetAgent,  "head", function() {
      return this.request.apply(this, ['head'].concat(__slice.call(arguments)));
    });

    __defineProperty(NetAgent,  "put", function() {
      return this.request.apply(this, ['put'].concat(__slice.call(arguments)));
    });

    __defineProperty(NetAgent,  "destroy", function() {
      return this.request.apply(this, ['del'].concat(__slice.call(arguments)));
    });

    __defineProperty(NetAgent,  "request", function(method, path, options, callback) {
      var auth, format, headers, newRequest, params, redirects;
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options || (options = {});
      headers = options.headers || {};
      params = options.params || {};
      redirects = options.redirects || 5;
      auth = options.auth;
      format = options.format;
      newRequest = Tower.module('superagent')[method.toLowerCase()]("http://localhost:" + Tower.port + path).set(headers).send(params).redirects(redirects);
      if (auth) {
        newRequest = newRequest.auth(auth.username, auth.password);
      }
      if (format) {
        newRequest = newRequest.type(format);
      }
      if (callback) {
        return newRequest.make(callback);
      } else {
        return newRequest;
      }
    });

    return NetAgent;

  })();

  Tower.NetCookies = (function() {

    __defineStaticProperty(NetCookies,  "parse", function(string) {
      var eqlIndex, pair, pairs, result, value, _len6, _o;
      if (string == null) {
        string = document.cookie;
      }
      result = {};
      pairs = string.split(/[;,] */);
      for (_o = 0, _len6 = pairs.length; _o < _len6; _o++) {
        pair = pairs[_o];
        eqlIndex = pair.indexOf('=');
        key = pair.substring(0, eqlIndex).trim().toLowerCase();
        value = pair.substring(++eqlIndex, pair.length).trim();
        if ('"' === value[0]) {
          value = value.slice(1, -1);
        }
        if (result[key] === void 0) {
          value = value.replace(/\+/g, ' ');
          try {
            result[key] = decodeURIComponent(value);
          } catch (error) {
            if (error instanceof URIError) {
              result[key] = value;
            } else {
              throw err;
            }
          }
        }
      }
      return new this(result);
    });

    function NetCookies(attributes) {
      if (attributes == null) {
        attributes = {};
      }
      _.extend(this, attributes);
    }

    return NetCookies;

  })();

  Tower.NetParam = (function() {

    __defineStaticProperty(NetParam,  "perPage", 20);

    __defineStaticProperty(NetParam,  "sortDirection", 'ASC');

    __defineStaticProperty(NetParam,  "sortKey", 'sort');

    __defineStaticProperty(NetParam,  "limitKey", 'limit');

    __defineStaticProperty(NetParam,  "pageKey", 'page');

    __defineStaticProperty(NetParam,  "separator", '-');

    __defineStaticProperty(NetParam,  "create", function(key, options) {
      var field, klass, type;
      if (options == null) {
        options = {};
      }
      if (typeof options === 'string') {
        options = {
          type: options
        };
      }
      options.as || (options.as = key);
      if (!options.type && (type = options.resourceType)) {
        field = Tower.constant(type).fields()[options.as];
        options.type = field.type;
      }
      options.type || (options.type = 'String');
      klass = Tower['NetParam' + options.type];
      if (!klass) {
        options.type = 'String';
        klass = Tower.NetParamString;
      }
      return new klass(key, options);
    });

    function NetParam(key, options) {
      if (options == null) {
        options = {};
      }
      this.controller = options.controller;
      this.key = key;
      this.attribute = options.as;
      this.modelName = options.modelName;
      if (typeof modelName !== "undefined" && modelName !== null) {
        this.namespace = _.pluralize(this.modelName);
      }
      this.exact = options.exact || false;
      this["default"] = options["default"];
    }

    __defineProperty(NetParam,  "parse", function(value) {
      return value;
    });

    __defineProperty(NetParam,  "render", function(value) {
      return value;
    });

    __defineProperty(NetParam,  "toCursor", function(value) {
      var attribute, conditions, criteria, node, nodes, operator, set, _len6, _len7, _o, _p;
      nodes = this.parse(value);
      criteria = Tower.ModelCursor.create();
      criteria.make();
      for (_o = 0, _len6 = nodes.length; _o < _len6; _o++) {
        set = nodes[_o];
        for (_p = 0, _len7 = set.length; _p < _len7; _p++) {
          node = set[_p];
          attribute = node.attribute;
          operator = node.operators[0];
          conditions = {};
          if (operator === '$eq') {
            conditions[attribute] = node.value;
          } else {
            conditions[attribute] = {};
            conditions[attribute][operator] = node.value;
          }
          criteria.where(conditions);
        }
      }
      return criteria;
    });

    __defineProperty(NetParam,  "parseValue", function(value, operators) {
      return {
        namespace: this.namespace,
        key: this.key,
        operators: operators,
        value: value,
        attribute: this.attribute
      };
    });

    __defineProperty(NetParam,  "_clean", function(string) {
      return string.replace(/^-/, '').replace(/^\+-/, '').replace(/^'|'$/, '').replace('+', ' ').replace(/^\^/, '').replace(/\$$/, '').replace(/^\s+|\s+$/, '');
    });

    return NetParam;

  })();

  Tower.NetParamArray = (function(_super) {
    var NetParamArray;

    function NetParamArray() {
      return NetParamArray.__super__.constructor.apply(this, arguments);
    }

    NetParamArray = __extends(NetParamArray, _super);

    __defineProperty(NetParamArray,  "parse", function(value) {
      var array, isSet, negated, negatedSet, operators, set, string, token, tokens, values, _len6, _len7, _o, _p;
      values = [];
      array = value.toString().split(/(-?\[[^\]]+\]|-?\w+)/g);
      for (_o = 0, _len6 = array.length; _o < _len6; _o++) {
        string = array[_o];
        negatedSet = false;
        isSet = false;
        if (_.isBlank(string)) {
          continue;
        }
        string = string.replace(/^(-)/, function(_, $1) {
          negatedSet = !!($1 && $1.length > 0);
          return "";
        });
        string = string.replace(/([\[\]])/g, function(_, $1) {
          isSet = !!($1 && $1.length > 0);
          return "";
        });
        if (_.isBlank(string)) {
          continue;
        }
        tokens = string.split(/,/g);
        set = [];
        for (_p = 0, _len7 = tokens.length; _p < _len7; _p++) {
          token = tokens[_p];
          negated = false;
          token = token.replace(/^(-)/, function(_, $1) {
            negated = !!($1 && $1.length > 0);
            return "";
          });
          if (_.isBlank(token)) {
            continue;
          }
          if (isSet) {
            operators = [negated || negatedSet ? '$notInAll' : '$allIn'];
          } else {
            operators = [negated || negatedSet ? '$notInAny' : '$anyIn'];
          }
          set.push(this.parseValue([token], operators));
        }
        values.push(set);
      }
      return values;
    });

    return NetParamArray;

  })(Tower.NetParam);

  Tower.NetParamBoolean = (function(_super) {
    var NetParamBoolean;

    function NetParamBoolean() {
      return NetParamBoolean.__super__.constructor.apply(this, arguments);
    }

    NetParamBoolean = __extends(NetParamBoolean, _super);

    __defineProperty(NetParamBoolean,  "parse", function(value) {
      var array, string, values, _len6, _o;
      values = [];
      array = value.toString().split(/[,\|]/);
      for (_o = 0, _len6 = array.length; _o < _len6; _o++) {
        string = array[_o];
        if (_.isEmpty(string)) {
          continue;
        }
        string = string.replace(/^\^/, '');
        values.push([this.parseValue(string, ['$eq'])]);
      }
      return values;
    });

    __defineProperty(NetParamBoolean,  "parseValue", function(value, operators) {
      return NetParamBoolean.__super__[ "parseValue"].call(this, !!/^(true|1)$/i.test(value), operators);
    });

    return NetParamBoolean;

  })(Tower.NetParam);

  Tower.NetParamDate = (function(_super) {
    var NetParamDate;

    function NetParamDate() {
      return NetParamDate.__super__.constructor.apply(this, arguments);
    }

    NetParamDate = __extends(NetParamDate, _super);

    __defineProperty(NetParamDate,  "parse", function(value) {
      var array, isRange, string, values, _len6, _o,
        _this = this;
      values = [];
      array = value.toString().split(/[\s,\+]/);
      for (_o = 0, _len6 = array.length; _o < _len6; _o++) {
        string = array[_o];
        isRange = false;
        string.replace(/([^\.]+)?(\.\.)([^\.]+)?/, function(_, startsOn, operator, endsOn) {
          var range;
          isRange = true;
          range = [];
          if (!!(startsOn && startsOn.match(/^\d/))) {
            range.push(_this.parseValue(startsOn, ["$gte"]));
          }
          if (!!(endsOn && endsOn.match(/^\d/))) {
            range.push(_this.parseValue(endsOn, ["$lte"]));
          }
          return values.push(range);
        });
        if (!isRange) {
          values.push([this.parseValue(string, ["$eq"])]);
        }
      }
      return values;
    });

    __defineProperty(NetParamDate,  "parseValue", function(value, operators) {
      return NetParamDate.__super__[ "parseValue"].call(this, _.toDate(value), operators);
    });

    return NetParamDate;

  })(Tower.NetParam);

  Tower.NetParamNumber = (function(_super) {
    var NetParamNumber;

    NetParamNumber = __extends(NetParamNumber, _super);

    function NetParamNumber(key, options) {
      var range;
      if (options == null) {
        options = {};
      }
      NetParamNumber.__super__.constructor.call(this, key, options);
      this.allowNegative = options.hasOwnProperty('allowNegative') ? !!options.allowNegative : true;
      this.allowFloat = options.hasOwnProperty('allowFloat') ? !!options.allowFloat : true;
      range = this.allowRange = options.hasOwnProperty('allowRange') ? !!options.allowRange : true;
      if (range) {
        this.parse = this.parseRange;
      }
    }

    __defineProperty(NetParamNumber,  "parse", function(value) {
      var values;
      values = [];
      if (typeof value === 'string') {
        value = parseInt(value);
      }
      if (typeof value === 'number') {
        if (!(!this.allowNegative && value < 0)) {
          values.push([this.parseValue(value, ["$eq"])]);
        }
      }
      return values;
    });

    __defineProperty(NetParamNumber,  "extractValue", function(value) {
      value = this.parse(value)[0];
      if (value != null) {
        value = value[0].value;
      }
      return value;
    });

    __defineProperty(NetParamNumber,  "parseRange", function(value) {
      var array, isRange, negation, string, values, _len6, _o,
        _this = this;
      values = [];
      array = value.split(/[,\|]/);
      for (_o = 0, _len6 = array.length; _o < _len6; _o++) {
        string = array[_o];
        isRange = false;
        negation = !!string.match(/^\^/);
        string = string.replace(/^\^/, "");
        string.replace(/([^\.]+)?(\.{2})([^\.]+)?/, function(_, startsOn, operator, endsOn) {
          var range;
          isRange = true;
          range = [];
          if (!!(startsOn && startsOn.match(/^\d/))) {
            range.push(_this.parseValue(startsOn, ["$gte"]));
          }
          if (!!(endsOn && endsOn.match(/^\d/))) {
            range.push(_this.parseValue(endsOn, ["$lte"]));
          }
          return values.push(range);
        });
        if (!isRange) {
          values.push([this.parseValue(string, ["$eq"])]);
        }
      }
      return values;
    });

    __defineProperty(NetParamNumber,  "parseValue", function(value, operators) {
      return NetParamNumber.__super__[ "parseValue"].call(this, parseFloat(value), operators);
    });

    return NetParamNumber;

  })(Tower.NetParam);

  Tower.NetParamOrder = (function(_super) {
    var NetParamOrder;

    function NetParamOrder() {
      return NetParamOrder.__super__.constructor.apply(this, arguments);
    }

    NetParamOrder = __extends(NetParamOrder, _super);

    __defineProperty(NetParamOrder,  "parse", function(value) {
      var array, string, values, _len6, _o,
        _this = this;
      if (_.isArray(value)) {
        return value;
      }
      values = [];
      array = value.toString().split(/\s*,/);
      for (_o = 0, _len6 = array.length; _o < _len6; _o++) {
        string = array[_o];
        string.replace(/([\w-]+[^\-\+])([\+\-])?/, function(_, token, operator) {
          var controller;
          operator = operator === "-" ? "DESC" : "ASC";
          token = _this._clean(token);
          controller = _this.controller;
          return values.push(token, operator);
        });
      }
      return values;
    });

    return NetParamOrder;

  })(Tower.NetParam);

  Tower.NetParamString = (function(_super) {
    var NetParamString;

    NetParamString = __extends(NetParamString, _super);

    function NetParamString(key, options) {
      if (options == null) {
        options = {};
      }
      NetParamString.__super__.constructor.call(this, key, options);
      this.exact = options.exact === true;
    }

    __defineProperty(NetParamString,  "parse", function(value) {
      var arrays, i, node, values, _len6, _o,
        _this = this;
      if (this.exact) {
        return [[this.parseValue(value, ['$eq'])]];
      }
      value = value.trim();
      arrays = null;
      value.replace(/^\/([^\/]+)\/(gi)?$/, function(_, $1) {
        return arrays = [[_this.parseValue([_this._clean($1)], ['$regex'])]];
      });
      if (arrays) {
        return arrays;
      }
      arrays = value.split(/(?:[\s|\+]OR[\s|\+]|\||,)/g);
      for (i = _o = 0, _len6 = arrays.length; _o < _len6; i = ++_o) {
        node = arrays[i];
        values = [];
        node.replace(/([\+\-\^]?[\w@_\s\d\.\$]+|-?\'[\w@-_\s\d\+\.\$]+\')/g, function(_, token) {
          var exact, negation, operators;
          negation = false;
          exact = false;
          token = token.replace(/^(\+?-+)/, function(_, $1) {
            negation = $1 && $1.length > 0;
            return "";
          });
          token = token.replace(/^\'(.+)\'$/, function(_, $1) {
            exact = $1 && $1.length > 0;
            return $1;
          });
          if (negation) {
            operators = [exact ? "$neq" : "$notMatch"];
          } else {
            operators = [exact ? "$eq" : "$match"];
          }
          if (!!token.match(/^\+?\-?\^/)) {
            operators.push("^");
          }
          if (!!token.match(/\$$/)) {
            operators.push("$");
          }
          values.push(_this.parseValue([_this._clean(token)], operators));
          return _;
        });
        arrays[i] = values;
      }
      return arrays;
    });

    return NetParamString;

  })(Tower.NetParam);

  _ = Tower._;

  Tower.NetRoute = (function(_super) {
    var NetRoute;

    function NetRoute() {
      return NetRoute.__super__.constructor.apply(this, arguments);
    }

    NetRoute = __extends(NetRoute, _super);

    NetRoute.reopenClass({
      store: function() {
        return this._store || (this._store = []);
      },
      byName: {},
      create: function(route) {
        this.byName[route.name] = route;
        return this.store().push(route);
      },
      find: function(name) {
        return this.byName[name];
      },
      findByUrl: function(url) {
        var route, _len6, _o, _ref6;
        _ref6 = this.all();
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          route = _ref6[_o];
          if (route.match(url)) {
            return route;
          }
        }
        return null;
      },
      findByControllerOptions: function(options) {
        var controller, route, success, value, _len6, _o, _ref6;
        _ref6 = this.all();
        for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
          route = _ref6[_o];
          controller = route.controller;
          success = true;
          for (key in options) {
            value = options[key];
            success = controller[key] === value;
            if (!success) {
              break;
            }
          }
          if (success) {
            return route;
          }
        }
        return null;
      },
      all: function() {
        return this.store();
      },
      clear: function() {
        return this._store = [];
      },
      reload: function() {
        this.clear();
        return this.draw();
      },
      draw: function(callback) {
        this._defaultCallback || (this._defaultCallback = callback);
        if (!callback) {
          callback = this._defaultCallback;
        }
        callback.apply(new Tower.NetRouteDSL(this));
        if (Tower.isClient) {
          return Tower.router = Tower.Router.create();
        }
      },
      findController: function(request, response, callback) {
        var controller, route, routes, _len6, _o;
        routes = Tower.Route.all();
        for (_o = 0, _len6 = routes.length; _o < _len6; _o++) {
          route = routes[_o];
          controller = route.toController(request);
          if (controller) {
            break;
          }
        }
        if (controller) {
          controller.call(request, response, function() {
            return callback(controller);
          });
        } else {
          callback(null);
        }
        return controller;
      }
    });

    NetRoute.reopen({
      toControllerData: function(url, params) {
        var capture, controller, i, keys, match, _len6, _o;
        if (params == null) {
          params = {};
        }
        match = this.match(url);
        if (!match) {
          return null;
        }
        keys = this.keys;
        match = match.slice(1);
        for (i = _o = 0, _len6 = match.length; _o < _len6; i = ++_o) {
          capture = match[i];
          key = keys[i].name;
          if (capture && !(params[key] != null)) {
            capture = decodeURIComponent(capture);
            try {
              params[key] = JSON.parse(capture);
            } catch (error) {
              params[key] = capture;
            }
          }
        }
        controller = this.controller;
        if (controller) {
          params.action = controller.action;
        }
        return params;
      },
      toController: function(request) {
        var capture, controller, i, keys, match, method, params, _len6, _o;
        match = this.match(request);
        if (!match) {
          return null;
        }
        method = request.method.toLowerCase();
        keys = this.keys;
        params = _.extend({}, this.defaults, request.query || {}, request.body || {});
        match = match.slice(1);
        for (i = _o = 0, _len6 = match.length; _o < _len6; i = ++_o) {
          capture = match[i];
          key = keys[i].name;
          if (capture && !(params[key] != null)) {
            capture = decodeURIComponent(capture);
            params[key] = capture;
          }
        }
        controller = this.controller;
        if (controller) {
          params.action = controller.action;
        }
        request.params = params;
        if (controller) {
          controller = Tower.constant(Tower.namespaced(controller.className)).create();
        }
        return controller;
      },
      get: function(name) {
        return this[name];
      },
      match: function(requestOrPath) {
        var match, path;
        if (typeof requestOrPath === "string") {
          return this.pattern.exec(requestOrPath);
        }
        path = requestOrPath.location.path;
        if (!(_.indexOf(this.methods, requestOrPath.method.toUpperCase()) > -1)) {
          return null;
        }
        match = this.pattern.exec(path);
        if (!match) {
          return null;
        }
        if (!this.matchConstraints(requestOrPath)) {
          return null;
        }
        return match;
      },
      matchConstraints: function(request) {
        var constraints, value;
        constraints = this.constraints;
        switch (typeof constraints) {
          case "object":
            for (key in constraints) {
              value = constraints[key];
              switch (typeof value) {
                case "string":
                case "number":
                  if (request[key] !== value) {
                    return false;
                  }
                  break;
                case "function":
                case "object":
                  if (!request.location[key].match(value)) {
                    return false;
                  }
              }
            }
            break;
          case "function":
            return constraints.call(request, request);
          default:
            return false;
        }
        return true;
      },
      urlFor: function(options) {
        var result, value;
        if (options == null) {
          options = {};
        }
        result = this.path;
        for (key in options) {
          value = options[key];
          result = result.replace(new RegExp(":" + key + "\\??", "g"), value);
        }
        result = result.replace(new RegExp("\\.?:\\w+\\??", "g"), "");
        return result;
      },
      extractPattern: function(path, caseSensitive, strict) {
        var self;
        if (path instanceof RegExp) {
          return path;
        }
        self = this;
        if (path === "/") {
          return new RegExp('^' + path + '$');
        }
        path = path.replace(/(\(?)(\/)?(\.)?([:\*])(\w+)(\))?(\?)?/g, function(_, open, slash, format, symbol, key, close, optional) {
          var result, splat;
          optional = (!!optional) || (open + close === "()");
          splat = symbol === "*";
          self.keys.push({
            name: key,
            optional: !!optional,
            splat: splat
          });
          slash || (slash = "");
          result = "";
          if (!optional || !splat) {
            result += slash;
          }
          result += "(?:";
          if (format != null) {
            result += splat ? "\\.([^.]+?)" : "\\.([^/.]+?)";
          } else {
            result += splat ? "/?(.+)" : "([^/\\.]+)";
          }
          result += ")";
          if (optional) {
            result += "?";
          }
          return result;
        });
        return new RegExp('^' + path + '$', !!caseSensitive ? '' : 'i');
      }
    });

    NetRoute.reopen({
      init: function(options) {
        options || (options = options);
        this.path = options.path;
        this.name = options.name;
        this.methods = _.map(_.castArray(options.method || "GET"), function(i) {
          return i.toUpperCase();
        });
        this.ip = options.ip;
        this.defaults = options.defaults || {};
        this.constraints = options.constraints;
        this.options = options;
        this.controller = options.controller;
        this.keys = [];
        this.pattern = this.extractPattern(this.path);
        this.id = this.path;
        this.state = options.state;
        if (this.controller) {
          this.id += this.controller.name + this.controller.action;
        }
        return this._super();
      }
    });

    return NetRoute;

  })(Tower.Class);

  Tower.Route = Tower.NetRoute;

  _ = Tower._;

  Tower.NetRouteDSL = (function() {

    function NetRouteDSL() {
      this._scope = {};
    }

    __defineProperty(NetRouteDSL,  "match", function() {
      var route;
      this.scope || (this.scope = {});
      route = new Tower.NetRoute(this._extractOptions.apply(this, arguments));
      return Tower.NetRoute.create(route);
    });

    __defineProperty(NetRouteDSL,  "get", function() {
      return this.matchMethod("get", _.args(arguments));
    });

    __defineProperty(NetRouteDSL,  "post", function() {
      return this.matchMethod("post", _.args(arguments));
    });

    __defineProperty(NetRouteDSL,  "put", function() {
      return this.matchMethod("put", _.args(arguments));
    });

    __defineProperty(NetRouteDSL,  "delete", function() {
      return this.matchMethod("delete", _.args(arguments));
    });

    __defineProperty(NetRouteDSL,  "destroy", NetRouteDSL.prototype["delete"]);

    __defineProperty(NetRouteDSL,  "matchMethod", function(method, args) {
      var name, options, path;
      if (typeof args[args.length - 1] === "object") {
        options = args.pop();
      } else {
        options = {};
      }
      name = args.shift();
      options.method = method;
      options.action = name;
      options.name = name;
      if (this._scope.name) {
        options.name = this._scope.name + _.camelize(options.name);
      }
      path = "/" + name;
      if (this._scope.path) {
        path = this._scope.path + path;
      }
      this.match(path, options);
      return this;
    });

    __defineProperty(NetRouteDSL,  "scope", function(options, block) {
      var originalScope;
      if (options == null) {
        options = {};
      }
      originalScope = this._scope || (this._scope = {});
      this._scope = _.extend({}, originalScope, options);
      block.call(this);
      this._scope = originalScope;
      return this;
    });

    __defineProperty(NetRouteDSL,  "controller", function(controller, options, block) {
      options.controller = controller;
      return this.scope(options, block);
    });

    __defineProperty(NetRouteDSL,  "namespace", function(path, options, block) {
      if (typeof options === 'function') {
        block = options;
        options = {};
      } else {
        options = {};
      }
      options = _.extend({
        name: path,
        path: path,
        as: path,
        module: path,
        shallowPath: path,
        shallowPrefix: path
      }, options);
      if (options.name && this._scope.name) {
        options.name = this._scope.name + _.camelize(options.name);
      }
      return this.scope(options, block);
    });

    __defineProperty(NetRouteDSL,  "constraints", function(options, block) {
      return this.scope({
        constraints: options
      }, block);
    });

    __defineProperty(NetRouteDSL,  "defaults", function(options, block) {
      return this.scope({
        defaults: options
      }, block);
    });

    __defineProperty(NetRouteDSL,  "resource", function(name, options) {
      var camelName, path;
      if (options == null) {
        options = {};
      }
      options.controller = name;
      path = "/" + name;
      if (this._scope.path) {
        path = this._scope.path + path;
      }
      if (this._scope.name) {
        name = this._scope.name + _.camelize(name);
      }
      camelName = _.camelize(name);
      this.match("" + path + "/new", _.extend({
        action: "new",
        state: "" + name + ".new",
        name: "new" + camelName
      }, options));
      this.match(path, _.extend({
        action: "create",
        state: "" + name + ".create",
        method: "POST"
      }, options));
      this.match(path, _.extend({
        action: "show",
        state: "" + name + ".show",
        name: name
      }, options));
      this.match("" + path + "/edit", _.extend({
        action: "edit",
        state: "" + name + ".edit",
        name: "edit" + camelName
      }, options));
      this.match(path, _.extend({
        action: "update",
        state: "" + name + ".update",
        method: "PUT"
      }, options));
      return this.match(path, _.extend({
        action: "destroy",
        state: "" + name + ".destroy",
        method: "DELETE"
      }, options));
    });

    __defineProperty(NetRouteDSL,  "resources", function(name, options, block) {
      var camelOne, many, one, path;
      if (typeof options === 'function') {
        block = options;
        options = {};
      } else {
        options = {};
      }
      options.controller || (options.controller = name);
      path = "/" + name;
      if (this._scope.path) {
        path = this._scope.path + path;
      }
      if (this._scope.name) {
        many = this._scope.name + _.camelize(name);
      } else {
        many = name;
      }
      one = _.singularize(many);
      camelOne = _.camelize(one);
      this.match(path, _.extend({
        action: "index",
        state: "" + many + ".index",
        name: many,
        method: ['GET']
      }, options));
      this.match("" + path + "/new", _.extend({
        action: "new",
        state: "" + many + ".new",
        name: "new" + camelOne
      }, options));
      this.match(path, _.extend({
        action: "create",
        state: "" + many + ".create",
        method: "POST"
      }, options));
      this.match("" + path + "/:id", _.extend({
        action: "show",
        state: "" + many + ".show",
        name: one
      }, options));
      this.match("" + path + "/:id/edit", _.extend({
        action: "edit",
        state: "" + many + ".edit",
        name: "edit" + camelOne
      }, options));
      this.match("" + path + "/:id", _.extend({
        action: "update",
        state: "" + many + ".update",
        method: "PUT"
      }, options));
      this.match("" + path + "/:id", _.extend({
        action: "destroy",
        state: "" + many + ".destroy",
        method: "DELETE"
      }, options));
      if (block) {
        this.scope(_.extend({
          path: "" + path + "/:" + (_.singularize(name)) + "Id",
          name: one
        }, options), block);
      }
      return this;
    });

    __defineProperty(NetRouteDSL,  "collection", function() {});

    __defineProperty(NetRouteDSL,  "member", function() {});

    __defineProperty(NetRouteDSL,  "root", function(options) {
      return this.match('/', _.extend({
        as: "root"
      }, options));
    });

    __defineProperty(NetRouteDSL,  "_extractOptions", function() {
      var anchor, args, constraints, controller, defaults, format, method, name, options, path;
      args = _.args(arguments);
      path = "/" + args.shift().replace(/^\/|\/$/, "");
      if (typeof args[args.length - 1] === "object") {
        options = args.pop();
      } else {
        options = {};
      }
      if (args.length > 0) {
        options.to || (options.to = args.shift());
      }
      options.path = path;
      format = this._extractFormat(options);
      options.path = this._extractPath(options);
      method = this._extractRequestMethod(options);
      constraints = this._extractConstraints(options);
      defaults = this._extractDefaults(options);
      controller = this._extractController(options);
      anchor = this._extractAnchor(options);
      name = this._extractName(options);
      options = _.extend(options, {
        method: method,
        constraints: constraints,
        defaults: defaults,
        name: name,
        format: format,
        controller: controller,
        anchor: anchor,
        ip: options.ip,
        state: options.state
      });
      return options;
    });

    __defineProperty(NetRouteDSL,  "_extractFormat", function(options) {});

    __defineProperty(NetRouteDSL,  "_extractName", function(options) {
      return options.as || options.name;
    });

    __defineProperty(NetRouteDSL,  "_extractConstraints", function(options) {
      return _.extend(this._scope.constraints || {}, options.constraints || {});
    });

    __defineProperty(NetRouteDSL,  "_extractDefaults", function(options) {
      return options.defaults || {};
    });

    __defineProperty(NetRouteDSL,  "_extractPath", function(options) {
      return "" + options.path + ".:format?";
    });

    __defineProperty(NetRouteDSL,  "_extractRequestMethod", function(options) {
      return options.method || options.via || "GET";
    });

    __defineProperty(NetRouteDSL,  "_extractAnchor", function(options) {
      return options.anchor;
    });

    __defineProperty(NetRouteDSL,  "_extractController", function(options) {
      var controller, to;
      if (options == null) {
        options = {};
      }
      to = options.to;
      if (to) {
        to = to.split('#');
        if (to.length === 1) {
          action = to[0];
        } else {
          controller = to[0];
          action = to[1];
        }
      }
      controller || (controller = options.controller || this._scope.controller);
      action || (action = options.action);
      if (!controller) {
        throw new Error("No controller was specified for the route " + options.path);
      }
      controller = _.camelize(controller).replace(/(?:[cC]ontroller)?$/, "Controller");
      return {
        name: controller,
        action: action,
        className: controller
      };
    });

    return NetRouteDSL;

  })();

  Tower.NetRequest = (function() {

    function NetRequest(data) {
      if (data == null) {
        data = {};
      }
      this.url = data.url;
      this.location = data.location;
      this.pathname = this.location.path;
      this.query = this.location.query;
      this.title = data.title;
      this.title || (this.title = typeof document !== "undefined" && document !== null ? document.title : void 0);
      this.body = data.body || {};
      this.headers = data.headers || {};
      this.method = data.method || "GET";
    }

    __defineProperty(NetRequest,  "header", function() {});

    return NetRequest;

  })();

  Tower.NetResponse = (function() {

    function NetResponse(data) {
      if (data == null) {
        data = {};
      }
      this.url = data.url;
      this.location = data.location;
      this.pathname = this.location.path;
      this.query = this.location.query;
      this.title = data.title;
      this.title || (this.title = typeof document !== "undefined" && document !== null ? document.title : void 0);
      this.body = data.body || {};
      this.headers = data.headers || {};
      this.headerSent = false;
      this.statusCode = 200;
      this.body = "";
    }

    __defineProperty(NetResponse,  "writeHead", function(statusCode, headers) {
      this.statusCode = statusCode;
      return this.headers = headers;
    });

    __defineProperty(NetResponse,  "setHeader", function(key, value) {
      if (this.headerSent) {
        throw new Error("Headers already sent");
      }
      return this.headers[key] = value;
    });

    __defineProperty(NetResponse,  "write", function(body) {
      if (body == null) {
        body = '';
      }
      return this.body += body;
    });

    __defineProperty(NetResponse,  "end", function(body) {
      if (body == null) {
        body = '';
      }
      this.body += body;
      this.sent = true;
      return this.headerSent = true;
    });

    __defineProperty(NetResponse,  "redirect", function(path, options) {
      if (options == null) {
        options = {};
      }
      if (global.History) {
        return global.History.push(options, null, path);
      }
    });

    return NetResponse;

  })();

  Tower.NetUrl = (function() {

    __defineStaticProperty(NetUrl,  "key", ["source", "protocol", "host", "userInfo", "user", "password", "hostname", "port", "relative", "path", "directory", "file", "query", "fragment"]);

    __defineStaticProperty(NetUrl,  "aliases", {
      anchor: "fragment"
    });

    __defineStaticProperty(NetUrl,  "parser", {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    });

    __defineStaticProperty(NetUrl,  "querystringParser", /(?:^|&|;)([^&=;]*)=?([^&;]*)/g);

    __defineStaticProperty(NetUrl,  "fragmentParser", /(?:^|&|;)([^&=;]*)=?([^&;]*)/g);

    __defineStaticProperty(NetUrl,  "typeParser", /(youtube|vimeo|eventbrite)/);

    __defineProperty(NetUrl,  "parse", function(string) {
      var attributes, domains, fragment, i, params, parsed, value;
      key = this.constructor.key;
      string = decodeURI(string);
      parsed = this.constructor.parser[(this.strictMode || false ? "strict" : "loose")].exec(string);
      attributes = {};
      this.params = params = {};
      this.fragment = fragment = {
        params: {}
      };
      i = 14;
      while (i--) {
        attributes[key[i]] = parsed[i] || "";
      }
      attributes["query"].replace(this.constructor.querystringParser, function($0, $1, $2) {
        if ($1) {
          return params[$1] = $2;
        }
      });
      attributes["fragment"].replace(this.constructor.fragmentParser, function($0, $1, $2) {
        if ($1) {
          return fragment.params[$1] = $2;
        }
      });
      this.segments = attributes.path.replace(/^\/+|\/+$/g, "").split("/");
      fragment.segments = attributes.fragment.replace(/^\/+|\/+$/g, "").split("/");
      for (key in attributes) {
        value = attributes[key];
        this[key] || (this[key] = value);
      }
      this.root = (attributes.host ? attributes.protocol + "://" + attributes.hostname + (attributes.port ? ":" + attributes.port : "") : "");
      domains = this.hostname.split(".");
      this.domain = domains.slice(domains.length - 1 - this.depth, (domains.length - 1) + 1 || 9e9).join(".");
      this.subdomains = domains.slice(0, (domains.length - 2 - this.depth) + 1 || 9e9);
      this.subdomain = this.subdomains.join(".");
      if (this.port != null) {
        return this.port = parseInt(this.port);
      }
    });

    function NetUrl(url, depth, strictMode) {
      if (depth == null) {
        depth = 1;
      }
      this.strictMode = strictMode || false;
      this.depth = depth || 1;
      if (typeof window !== "undefined" && window !== null) {
        this.url = url || (url = window.location.toString());
      }
      this.parse(url);
    }

    return NetUrl;

  })();

  Tower.NetConnectionBase = (function(_super) {
    var NetConnectionBase;

    function NetConnectionBase() {
      return NetConnectionBase.__super__.constructor.apply(this, arguments);
    }

    NetConnectionBase = __extends(NetConnectionBase, _super);

    return NetConnectionBase;

  })(Tower.Class);

  Tower.NetConnectionBase.reopenClass({
    transport: void 0,
    controllers: [],
    handlers: Ember.Map.create(),
    initialize: function() {
      if (Tower.module('socketio')) {
        return this.reopenClass(Tower.NetConnectionSocketio);
      } else {
        return this.reopenClass(Tower.NetConnectionSockjs);
      }
    },
    addHandler: function(name, handler) {
      return this.handlers.set(name, handler);
    }
  });

  Tower.NetConnectionBase.reopen({
    registerHandlers: function() {
      var _this = this;
      return this.constructor.handlers.forEach(function(eventType, handler) {
        return _this.on(eventType, handler);
      });
    },
    resolve: function(action, records, callback) {
      var iterator, matches, record,
        _this = this;
      record = records[0];
      if (!record) {
        return;
      }
      if (!Tower.isClient) {
        matches = Ember.Map.create();
      }
      iterator = function(controller, next) {
        return _this.get(controller).resolveAgainstCursors(action, records, matches, next);
      };
      Tower.series(this.constructor.controllers, iterator, function(error) {
        matches = Tower.isClient ? records : matches.toArray();
        if (callback) {
          return callback(error, matches);
        }
      });
      return matches;
    },
    notifyTransport: function(action, records) {
      if (this.constructor.transport != null) {
        return this.constructor.transport[action](records, callback);
      }
    },
    destroy: function(callback) {
      return callback();
    },
    on: function(eventType, handler) {
      return this.constructor.registerHandler(this.socket, eventType, handler);
    }
  });

  Tower.NetAgent.prototype.request = function(method, path, options, callback) {
    var url;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    options || (options = {});
    url = path;
    return History.pushState(null, null, url);
  };

  Tower.NetConnection = (function(_super) {
    var NetConnection;

    function NetConnection() {
      return NetConnection.__super__.constructor.apply(this, arguments);
    }

    NetConnection = __extends(NetConnection, _super);

    NetConnection.reopenClass({
      connect: function(socket, callback) {
        var _this = this;
        return socket.on('connect', function() {
          var connection, id;
          id = _this.getId(socket);
          connection = Tower.NetConnection.create({
            socket: socket
          }).connect();
          connection.id = id;
          Tower.connection = connection;
          Tower.connections[id] = connection;
          if (callback) {
            return callback(null, connection);
          }
        });
      },
      disconnect: function() {
        var _this = this;
        if (!Tower.connection) {
          return;
        }
        return Tower.connection.destroy(function() {
          return Tower.connection = void 0;
        });
      }
    });

    NetConnection.reopen({
      connect: function() {
        var _this = this;
        this.on('sync', function(data) {
          if (!Tower.NetConnection.transport || !Tower.NetConnection.transport.requesting) {
            return _this.serverDidChange(data);
          }
        });
        this.registerHandlers();
        return this;
      },
      notify: function(action, records, callback) {
        records = _.castArray(records);
        return this.clientDidChange(action, records, callback);
      },
      resolve: function(action, records, callback) {
        var app, iterator, matches, record,
          _this = this;
        record = records[0];
        if (!record) {
          return;
        }
        matches = [];
        app = Tower.Application.instance();
        iterator = function(controller, next) {
          return app.get(controller).resolveAgainstCursors(action, records, matches, next);
        };
        Tower.series(this.constructor.controllers, iterator, function(error) {
          if (callback) {
            return callback(error, records);
          }
        });
        return matches;
      },
      clientDidChange: function(action, records, callback) {
        var _this = this;
        return this.resolve(action, records, function(error, matches) {
          return _this["clientDid" + (_.camelize(action))](matches, callback);
        });
      },
      serverDidChange: function(data) {
        return this["serverDid" + (_.camelize(data.action))](data);
      },
      serverDidCreate: function(data) {
        try {
          return Tower.constant(data.type).load(data.records);
        } catch (_error) {}
      },
      serverDidUpdate: function(data) {
        try {
          return Tower.constant(data.type).load(data.records, 'update');
        } catch (_error) {}
      },
      serverDidDestroy: function(data) {
        try {
          return Tower.constant(data.type).unload(data.records);
        } catch (_error) {}
      },
      clientDidLoad: function(records) {
        return this.resolve('create', records);
      },
      clientDidCreate: function(records, callback) {
        return this.notifyTransport('create', records, callback);
      },
      clientDidUpdate: function(records) {
        return this.notifyTransport('update', records);
      },
      clientDidDestroy: function(records) {
        return this.notifyTransport('destroy', records);
      },
      notifyTransport: function(action, records, callback) {
        if (this.constructor.transport != null) {
          return this.constructor.transport[action](records, callback);
        }
      }
    });

    return NetConnection;

  })(Tower.NetConnectionBase);

  Tower.NetConnectionSocketio = {
    getId: function(socket) {
      try {
        return socket.sessionid || socket.socket.sessionid;
      } catch (error) {
        return 1;
      }
    },
    listen: function(url) {
      return this.connect(Tower.module('socketio').connect(url));
    },
    registerHandler: function(socket, eventType, handler) {
      var _this = this;
      return socket.on(eventType, function(data) {
        return handler.call(_this, data, _this);
      });
    },
    emit: function(connection, data) {
      return connection.socket.emit(data);
    }
  };

  Tower.NetConnectionSockjs = {
    getId: function(socket) {
      return 1;
    },
    listen: function(url) {
      return this.connect(new Tower.module('sockjs')(url));
    },
    registerHandler: function(socket, name, handler) {
      return socket.on(name, handler);
    },
    emit: function(data) {}
  };

  Tower.Router = Ember.Router.extend({
    urlForEvent: function(eventName) {
      var path;
      path = this._super(eventName);
      if (path === '') {
        path = '/';
      }
      return path;
    },
    initialState: 'root',
    location: Ember.HistoryLocation.create(),
    root: Ember.Route.create({
      route: '/',
      index: Ember.Route.create({
        route: '/'
      }),
      eventTransitions: {
        showRoot: 'root.index'
      },
      showRoot: Ember.State.transitionTo('root.index')
    }),
    handleUrl: function(url, params) {
      var route;
      if (params == null) {
        params = {};
      }
      route = Tower.NetRoute.findByUrl(url);
      if (route) {
        params = route.toControllerData(url, params);
        return Tower.router.transitionTo(route.state, params);
      } else {
        return console.log("No route for " + url);
      }
    },
    createControllerActionState: function(name, action, route) {
      name = _.camelize(name, true);
      if (action === 'show' || action === 'destroy' || action === 'update') {
        route += ':id';
      } else if (action === 'edit') {
        route += ':id/edit';
      }
      return Ember.Route.create({
        route: route,
        serialize: function(router, context) {
          var attributes;
          if (context && context.toJSON) {
            attributes = context.toJSON();
          }
          return attributes || context;
        },
        deserialize: function(router, params) {
          return params;
        },
        enter: function(router, transition) {
          var controller;
          this._super(router, transition);
          if (Tower.debug) {
            console.log("enter: " + this.name);
          }
          controller = Ember.get(Tower.Application.instance(), name);
          if (controller) {
            if (this.name === controller.collectionName) {
              return controller.enter();
            } else {
              return controller.enterAction(action);
            }
          }
        },
        connectOutlets: function(router, params) {
          var controller;
          if (Tower.debug) {
            console.log("connectOutlets: " + this.name);
          }
          controller = Ember.get(Tower.Application.instance(), name);
          if (controller) {
            if (this.name === controller.collectionName) {
              return;
            }
            controller.call(router, params);
          }
          return true;
        },
        exit: function(router, transition) {
          var controller;
          this._super(router, transition);
          if (Tower.debug) {
            console.log("exit: " + this.name);
          }
          controller = Ember.get(Tower.Application.instance(), name);
          if (controller) {
            if (this.name === controller.collectionName) {
              return controller.exit();
            } else {
              return controller.exitAction(action);
            }
          }
        }
      });
    },
    insertRoute: function(route) {
      var controllerName, i, methodName, myAction, n, path, r, routeName, s, state, states;
      if (route.state) {
        path = route.state;
      } else {
        path = [];
        route.path.replace(/\/([^\/]+)/g, function(_, $1) {
          return path.push($1.split('.')[0]);
        });
        path = path.join('.');
      }
      if (!path || path === "") {
        return void 0;
      }
      r = path.split('.');
      state = this.root;
      controllerName = route.controller.name;
      i = 0;
      n = r.length;
      while (i < n) {
        states = Ember.get(state, 'states');
        if (!states) {
          states = {};
          Ember.set(state, 'states', states);
        }
        s = Ember.get(states, r[i]);
        if (s) {
          state = s;
        } else {
          routeName = '/';
          if ((r[i] === r[0] || r[i] === 'new') && r[i] !== 'root') {
            routeName += r[i];
          }
          if (!controllerName.toLowerCase().match(r[i])) {
            methodName = r[i] + _.singularize(_.camelize(controllerName.replace('Controller', '')));
            Tower.router.root[methodName] = Ember.State.transitionTo(r.join('.'));
            Tower.router.root.eventTransitions[methodName] = r.join('.');
          }
          myAction = r[i];
          if (route.options.action != null) {
            myAction = route.options.action;
          }
          s = this.createControllerActionState(controllerName, myAction, routeName);
          state.setupChild(states, r[i], s);
          state = s;
        }
        i++;
      }
      return void 0;
    }
  });

  Tower.router = Tower.Router.PrototypeMixin.mixins[Tower.Router.PrototypeMixin.mixins.length - 1].properties;

  Tower.NetRouteDSL.prototype.match = function() {
    var route;
    this.scope || (this.scope = {});
    route = new Tower.NetRoute(this._extractOptions.apply(this, arguments));
    Tower.router.insertRoute(route);
    return Tower.NetRoute.create(route);
  };

  Tower.Middleware = {};

  Tower.MiddlewareAgent = function(request, response, next) {
    var agent, attributes;
    agent = require('useragent').parse(request.headers['user-agent']);
    attributes = _.extend(require('useragent').is(request.headers['user-agent']), {
      family: agent.family,
      major: agent.major,
      minor: agent.minor,
      patch: agent.patch,
      version: agent.toVersion(),
      os: agent.os,
      name: agent.toAgent(),
      mac: !!agent.os.match(/mac/i),
      windows: !!agent.os.match(/win/i),
      linux: !!agent.os.match(/linux/i)
    });
    request.agent = new Tower.NetAgent(attributes);
    if (next) {
      return next();
    }
  };

  Tower.MiddlewareCookies = function(request, response, next) {
    return request._cookies || (request._cookies = Tower.NetCookies.parse());
  };

  Tower.MiddlewareLocation = function(request, response, next) {
    var url;
    response.cacheControl || (response.cacheControl = {});
    if (!request.location) {
      if (request.url.match(/^http/)) {
        url = request.url;
      } else {
        url = "http://" + request.headers.host + request.url;
      }
      request.location = new Tower.NetUrl(url);
    }
    return next();
  };

  _ = Tower._;

  Tower.MiddlewareRouter = function(request, response, callback) {
    var _this = this;
    if (Tower.isInitialized) {
      return Tower.MiddlewareRouter.render(request, response, callback);
    } else {
      return Tower.Application.instance()._loadApp(function() {
        return Tower.MiddlewareRouter.render(request, response, callback);
      });
    }
  };

  _.extend(Tower.MiddlewareRouter, {
    find: function(request, response, callback) {
      this.processHost(request, response);
      this.processAgent(request, response);
      return Tower.NetRoute.findController(request, response, callback);
    },
    render: function(request, response, callback) {
      Tower.MiddlewareRouter.find(request, response, function(controller) {
        if (controller) {
          if (Tower.env === 'test') {
            Tower.Controller.testCase = controller;
          }
          if (response.statusCode !== 302) {
            response.controller = controller;
            response.writeHead(controller.status, controller.headers);
            response.write(controller.body);
            response.end();
            return controller.clear();
          }
        } else {
          return Tower.MiddlewareRouter.error(request, response);
        }
      });
      return response;
    },
    processHost: function(request, response) {
      return request.location || (request.location = new Tower.NetUrl(request.url));
    },
    processAgent: function(request, response) {
      if (request.headers) {
        return request.userAgent || (request.userAgent = request.headers['user-agent']);
      }
    },
    error: function(request, response) {
      if (response) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/plain');
        return response.end("No path matches " + request.url);
      }
    }
  });

  Tower.pathSeparator = '/';

  Tower.pathRegExp = /\//g;

  Tower.goTo = function(string, params) {};

  Tower.joinPath = function() {
    return _.args(arguments).join(Tower.pathSeparator);
  };

}).call(this);
