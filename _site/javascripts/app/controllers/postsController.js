var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

App.PostsController = (function(_super) {

  __extends(PostsController, _super);

  function PostsController() {
    PostsController.__super__.constructor.apply(this, arguments);
  }

  PostsController.param("title");

  PostsController.param("body");

  PostsController.prototype["new"] = function() {
    var _this = this;
    this.post = new App.Post;
    return this.respondWith(this.post, function(format) {
      return format.json(function() {
        return _this.render({
          json: _this.post
        });
      });
    });
  };

  PostsController.prototype.create = function() {
    var _this = this;
    return this._create(function(success, failure) {
      success.json(function() {
        return _this.render({
          json: _this.resource
        });
      });
      return failure.json(function() {
        return _this.render({
          status: 404
        });
      });
    });
  };

  return PostsController;

})(Tower.Controller);
