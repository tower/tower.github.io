var express = require('express')
  , partials = require('express-partials')
  , app     = express()
  , path = require('path');

/**
 * Configurations
 */

app.configure(function(){
  app.use(partials());
  app.use(express.bodyParser());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use('/public', express.static(__dirname + '/public'));
  app.engine('html', require('ejs').renderFile);
  app.use(express.cookieParser());
  app.use(app.router);
});


app.get('/', function(req, res){
  res.render('index');
});


/**
 * Listen
 */

app.listen(3000);