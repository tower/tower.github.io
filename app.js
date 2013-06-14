/**
 * Dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var app = express();
var path = require('path');

/**
 * Configuration.
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

app.get('/guides', function(req, res){
  res.render('guides');
});

app.get('/community', function(req, res){
  res.render('community');
});

app.get('/screencasts', function(req, res){
  res.render('screencasts');
});

app.get('/docs', function(req, res){
  res.render('docs', { url: 'docs' });
});

/**
 * Listen.
 */

app.listen(3000);