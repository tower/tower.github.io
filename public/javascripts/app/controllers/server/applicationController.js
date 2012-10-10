var __defineProperty = function(clazz, key, value) {
  if (typeof clazz.__defineProperty == 'function') return clazz.__defineProperty(key, value);
  return clazz.prototype[key] = value;
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
};

App.ApplicationController = (function(_super) {
  var ApplicationController;

  function ApplicationController() {
    return ApplicationController.__super__.constructor.apply(this, arguments);
  }

  ApplicationController = __extends(ApplicationController, _super);

  ApplicationController.layout('application');

  ApplicationController.param('page', {
    type: 'Number',
    allowRange: false,
    allowNegative: false
  });

  ApplicationController.param('limit', {
    type: 'Number',
    allowRange: false,
    allowNegative: false
  });

  ApplicationController.param('sort', {
    type: 'Order'
  });

  ApplicationController.param('fields', {
    type: 'Array'
  });

  ApplicationController.param('createdAt', {
    type: 'Date'
  });

  ApplicationController.param('updatedAt', {
    type: 'Date'
  });

  ApplicationController.beforeAction('bootstrap', {
    only: 'welcome'
  });

  __defineProperty(ApplicationController,  "bootstrap", function(callback) {
    var data,
      _this = this;
    App.Post.preload();
    data = this.bootstrapData = {};
    App.Post.all(function(error, posts) {
      return data.posts = posts;
    });
    data;

    return callback();
  });

  __defineProperty(ApplicationController,  "welcome", function() {
    return this.render('welcome', {
      locals: {
        bootstrapData: this.bootstrapData
      }
    });
  });

  return ApplicationController;

})(Tower.Controller);
