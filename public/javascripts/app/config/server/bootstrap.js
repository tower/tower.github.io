(function() {

  App.configure(function() {
    this.use('favicon', Tower.publicPath + '/favicon.png');
    this.use('static', Tower.publicPath, {
      maxAge: Tower.publicCacheDuration
    });
    this.use('logger');
    this.use('query');
    this.use('cookieParser', Tower.config.session.key);
    this.use('session', {
      secret: Tower.config.session.secret,
      cookie: {
        domain: Tower.config.session.cookie.domain
      }
    });
    this.use('bodyParser', {
      uploadDir: './public/uploads'
    });
    this.use('methodOverride', '_method');
    this.use(function(request, response, next) {
      response.removeHeader('X-Powered-By');
      return next();
    });
    this.use(Tower.MiddlewareAgent);
    this.use(Tower.MiddlewareLocation);
    return this.use(Tower.MiddlewareRouter);
  });

}).call(this);
