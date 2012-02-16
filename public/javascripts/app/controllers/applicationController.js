var fs,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

fs = require('fs');

require(Tower.root + "/app/models/post");

App.ApplicationController = (function(_super) {

  __extends(ApplicationController, _super);

  function ApplicationController() {
    ApplicationController.__super__.constructor.apply(this, arguments);
  }

  ApplicationController.layout("application");

  ApplicationController.prototype.index = function() {
    var content, currentPage, i, page, pages, segment, _i, _j, _len, _len2, _len3, _ref;
    pages = ["home", "application", "models", "views", "controllers", "assets", "generators", "stores", "testing"];
    for (i = 0, _len = pages.length; i < _len; i++) {
      page = pages[i];
      content = fs.readFileSync(process.cwd() + ("/public/docs/" + page + ".html"), "utf-8");
      pages[i] = new App.Post({
        title: Tower.Support.String.camelize(page),
        body: content,
        slug: page
      });
    }
    if (this.request.location.segments.length === 0) {
      currentPage = pages[0];
    } else {
      for (_i = 0, _len2 = pages.length; _i < _len2; _i++) {
        page = pages[_i];
        _ref = this.request.location.segments;
        for (_j = 0, _len3 = _ref.length; _j < _len3; _j++) {
          segment = _ref[_j];
          if (segment === page.slug) {
            currentPage = page;
            break;
          }
        }
      }
    }
    currentPage || (currentPage = pages[0]);
    return this.render({
      template: "index",
      locals: {
        pages: pages,
        url: this.request.url,
        currentPage: currentPage
      }
    });
  };

  return ApplicationController;

})(Tower.Controller);
