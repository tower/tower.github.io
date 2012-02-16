
Tower.View.cache = {
  'app/views/index': function() {
    return div({
      id: "background"
    }, function() {});
  },
  'app/views/layouts/application': function() {
    doctype(5);
    return html(function() {
      head(function() {
        meta({
          charset: "utf-8"
        });
        if (this.currentPage.slug === "home") {
          title("" + (t("title")) + " - Full Stack JavaScript Framework for Node.js and the Browser");
        } else {
          title("" + (t("title")) + " - " + this.currentPage.title);
        }
        meta({
          name: "description",
          content: t("description")
        });
        meta({
          name: "keywords",
          content: t("keywords")
        });
        meta({
          name: "robots",
          content: t("robots")
        });
        meta({
          name: "author",
          content: t("author")
        });
        stylesheetTag("http://fonts.googleapis.com/css?family=Forum|Josefin+Sans:400,700");
        stylesheetTag("http://twitter.github.com/bootstrap/assets/css/bootstrap.css");
        stylesheetTag("http://twitter.github.com/bootstrap/assets/css/bootstrap-responsive.css");
        stylesheetTag("http://twitter.github.com/bootstrap/assets/css/docs.css");
        stylesheetTag("http://twitter.github.com/bootstrap/assets/js/google-code-prettify/prettify.css");
        stylesheets("application");
        javascriptTag("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js");
        javascripts("vendor", "lib", "application");
        if (Tower.env === "development") javascripts("development");
        link({
          href: "http://i.imgur.com/e3VLW.png",
          rel: "icon shortcut-icon favicon"
        });
        contentFor("bottom", function() {
          return javascripts("bottom");
        });
        if (Tower.env !== "development") {
          return text("      <script type=\"text/javascript\">\n\n        var _gaq = _gaq || [];\n        _gaq.push(['_setAccount', 'UA-28846243-1']);\n        _gaq.push(['_setDomainName', 'towerjs.org']);\n        _gaq.push(['_trackPageview']);\n\n        (function() {\n          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;\n          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';\n          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);\n        })();\n\n      </script>");
        }
      });
      return body({
        role: "application",
        "data-spy": "scroll",
        "data-target": ".subnav",
        "data-offset": "50"
      }, function() {
        nav({
          id: "navigation",
          role: "navigation",
          "class": "navbar navbar-fixed-top"
        }, function() {
          return div({
            "class": "navbar-inner"
          }, function() {
            return div({
              "class": "container"
            }, function() {
              return div({
                "class": "nav-collapse"
              }, function() {
                return ul({
                  "class": "nav"
                }, function() {
                  var i, page, _len, _ref;
                  _ref = this.pages;
                  for (i = 0, _len = _ref.length; i < _len; i++) {
                    page = _ref[i];
                    li({
                      "class": (i === 1 ? "nav-item nav-group-start" : "nav-item")
                    }, function() {
                      return a({
                        href: (i === 0 ? "/" : "/" + page.slug)
                      }, function() {
                        return page.title;
                      });
                    });
                  }
                  li({
                    "class": "nav-group-start"
                  }, function() {
                    return a({
                      href: "/guides"
                    }, "Guides");
                  });
                  li(function() {
                    return a({
                      href: "/screencasts"
                    }, "Screencasts");
                  });
                  return li(function() {
                    return a({
                      href: "/examples"
                    }, "Examples");
                  });
                });
              });
            });
          });
        });
        div({
          id: "content",
          "class": "container"
        }, function() {
          text(this.currentPage.body);
          return footer({
            role: "contentinfo",
            "class": "footer"
          }, function() {
            cite({
              "class": "copyright"
            }, function() {
              text("&copy; ");
              a({
                href: "http://twitter.com/viatropos"
              }, function() {
                return "Lance Pollard";
              });
              return text("2012.");
            });
            return cite("Code licensed under the MIT License.");
          });
        });
        coffeescript(function() {
          $("code[class='coffeescript']").each(function() {
            return $(this).addClass("language-javascript").parent().addClass("prettyprint language-javascript");
          });
          return $("code[class='html']").each(function() {
            return $(this).addClass("language-html").parent().addClass("prettyprint language-html");
          });
        });
        javascriptTag("http://twitter.github.com/bootstrap/assets/js/google-code-prettify/prettify.js");
        return coffeescript(function() {
          return prettyPrint();
        });
      });
    });
  },
  'app/views/posts/_form': function() {
    return formFor(this.post, function(f) {
      f.fieldset(function(fields) {
        fields.field("title", {
          as: "string"
        });
        return fields.field("body", {
          as: "string"
        });
      });
      return f.fieldset(function(fields) {
        return fields.submit("Submit");
      });
    });
  },
  'app/views/posts/_item': function() {
    return li({
      "class": "undefined"
    }, function() {
      header({
        "class": "header"
      }, function() {
        return h3(this.post.toLabel());
      });
      dl({
        "class": "content"
      }, function() {
        dt("Title:");
        dd(this.post.title);
        dt("Body:");
        return dd(this.post.body);
      });
      return footer({
        "class": "footer"
      }, function() {
        return menu(function() {
          menuItem("Edit", editPostPath(this.post));
          return menuItem("Back", postsPath);
        });
      });
    });
  },
  'app/views/posts/_list': function() {
    return ol({
      "class": "posts"
    }, function() {
      return partial("item", {
        collection: this.posts
      });
    });
  },
  'app/views/posts/_table': function() {
    return tableFor("users", function(t) {
      t.head(function() {
        return t.row(function() {
          t.cell("title", {
            sort: true
          });
          t.cell("body", {
            sort: true
          });
          t.cell();
          t.cell();
          return t.cell();
        });
      });
      t.body(function() {
        var post, _i, _len, _ref, _results;
        _ref = this.posts;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          _results.push(t.row(function() {
            t.cell(post.get("title"));
            t.cell(post.get("body"));
            t.cell(linkTo('Show', post));
            t.cell(linkTo('Edit', editPostPath(post)));
            return t.cell(linkTo('Destroy', post, {
              method: "delete"
            }));
          }));
        }
        return _results;
      });
      return linkTo('New Post', newPostPath());
    });
  },
  'app/views/posts/edit': function() {
    title("Editing Post");
    return partial("form");
  },
  'app/views/posts/index': function() {
    title("Listing posts");
    return partial("table");
  },
  'app/views/posts/new': function() {
    title("New Post");
    return partial("form");
  },
  'app/views/posts/show': function() {
    title("Post " + (this.post.toLabel()));
    return dl({
      "class": "content"
    }, function() {
      dt("Title:");
      dd(this.post.title);
      dt("Body:");
      return dd(this.post.body);
    });
  },
  'app/views/shared/_footer': function() {
    return cite({
      "class": "copyright"
    }, function() {
      return "&copy; " + (linkTo("Lance Pollard", "lancejpollard@gmail.com")) + ". 2011.";
    });
  },
  'app/views/shared/_header': function() {
    return h1({
      id: "title"
    }, function() {
      return t("title");
    });
  },
  'app/views/shared/_meta': function() {
    meta({
      charset: "utf-8"
    });
    title(t("title"));
    meta({
      name: "description",
      content: t("description")
    });
    meta({
      name: "keywords",
      content: t("keywords")
    });
    meta({
      name: "robots",
      content: t("robots")
    });
    meta({
      name: "author",
      content: t("author")
    });
    csrfMetaTag();
    appleViewportMetaTag({
      width: "device-width",
      max: 1,
      scalable: false
    });
    stylesheetTag("http://fonts.googleapis.com/css?family=Forum|Josefin+Sans");
    stylesheets("lib", "vendor", "application");
    stylesheetTag("/stylesheets/lib/stylesheets/bootstrap/bootstrap.css");
    javascriptTag("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js");
    javascripts("vendor", "lib", "application");
    if (Tower.env === "development") javascripts("development");
    return contentFor("bottom", function() {
      return javascripts("bottom");
    });
  },
  'app/views/shared/_navigation': function() {
    return ul;
  },
  'app/views/shared/_sidebar': function() {}
};
