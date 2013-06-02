
App.PostReadMixin = {
  ClassMethods: {
    preload: function() {
      if (this._preloaded) {
        return true;
      }
      this._loadFiles('docs');
      this._loadFiles('guides');
      this._loadFiles('cheat-sheets');
      return this._preloaded = true;
    },
    _loadFiles: function(key) {
      var body, path, paths, slug, title, _i, _len, _results;
      paths = Tower.files(Tower.join(Tower.root, 'public', key));
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        title = Tower.basename(path, '.html');
        slug = key + '/' + _.parameterize(title);
        body = _.xss(Tower.readFileSync(path, 'utf-8'));
        _results.push(App.Post.create({
          title: title,
          slug: slug,
          body: body
        }));
      }
      return _results;
    }
  }
};
