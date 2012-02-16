var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

App.Post = (function(_super) {

  __extends(Post, _super);

  function Post() {
    Post.__super__.constructor.apply(this, arguments);
  }

  Post.field("id", {
    type: "Id"
  });

  Post.field("title", {
    type: "String"
  });

  Post.field("body", {
    type: "String"
  });

  Post.field("slug", {
    type: "String"
  });

  Post.timestamps();

  return Post;

})(Tower.Model);
