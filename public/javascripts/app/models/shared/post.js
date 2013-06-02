(function() {
  var __hasProp = {}.hasOwnProperty,
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

  App.Post = (function(_super) {
    var Post;

    function Post() {
      return Post.__super__.constructor.apply(this, arguments);
    }

    Post = __extends(Post, _super);

    Post.field('title');

    Post.field('body');

    Post.field('slug');

    if (Tower.isServer) {
      Post.include(App.PostReadMixin);
    }

    return Post;

  })(Tower.Model);

}).call(this);
