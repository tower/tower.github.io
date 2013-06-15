
/**
 * Dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var app = express();
var router = require('tower-router');
var route = require('tower-route');
var path = require('path');
var markdown = require('./markdown');

/**
 * Configuration.
 */

app.configure(function(){
  app.use(partials());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use('/public', express.static(__dirname + '/public'));
  app.engine('html', require('ejs').renderFile);
  app.use(router);
});

route('/', function(context){
  context.res.render('index');
});

route('/guides', function(context){
  context.res.render('guides', { code: markdown('code') });
});

route('/api', function(context){
  context.res.render('docs');
});

/**
 * Listen.
 */

app.listen(process.env.PORT || 3000);