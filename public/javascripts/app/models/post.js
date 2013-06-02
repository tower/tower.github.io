var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

App.Post = (function(_super) {

  __extends(Post, _super);

  Post.name = 'Post';

  function Post() {
    return Post.__super__.constructor.apply(this, arguments);
  }

  Post.field("title");

  Post.field("body");

  Post.field("slug");

  return Post;

})(Tower.Model);
