
/**
 * Dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var app = express();
var template = require('tower-template');
var content = require('tower-content');
var router = require('tower-router');
var route = require('tower-route');
var text = require('tower-text');
var guide = require('./lib/guide');
var render = require('./lib/render');

/**
 * Directives.
 */

require('tower-list-directive').document = render.document;
require('tower-markdown-directive');

/**
 * Configuration.
 */

app.configure(function(){
  app.use(partials());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use('/public', express.static(__dirname + '/public'));
  app.engine('html', render);
  app.use(router);
});

/**
 * Guides.
 */

guide('resource');
guide('adapter');
guide('query');
guide('template');
guide('content');
guide('directive');
guide('element');
guide('route');
guide('cookbook');

/**
 * Content.
 */

content('body')
  .attr('guides', 'array', guide.collection)
  .helper('label', function(scope, name){
    return name;//text(name).render(scope);
  });

/**
 * Routes.
 */

route('/', function(context){
  context.res.render('index');
  //context.res.send(document.innerHTML);
});

route('/guides', function(context){
  context.res.render('guides');
});

route('/api', function(context){
  context.res.render('docs');
});

/**
 * Listen.
 */

app.listen(process.env.PORT || 3000);