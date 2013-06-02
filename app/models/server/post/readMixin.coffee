App.PostReadMixin =
  ClassMethods:
    preload: ->
      return true if @_preloaded
      @_loadFiles('docs')
      @_loadFiles('guides')
      @_loadFiles('cheat-sheets')
      @_preloaded = true

    _loadFiles: (key) ->
      paths   = Tower.files(Tower.join(Tower.root, 'public', key))

      for path in paths
        title = Tower.basename(path, '.html')
        slug  = key + '/' + _.parameterize(title)
        body  = _.xss(Tower.readFileSync(path, 'utf-8'))
        
        App.Post.create(title: title, slug: slug, body: body)