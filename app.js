
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
var agent = require('superagent');
var fs = require('fs');
var exec = require('child_process').exec;
var guide = require('./lib/guide');
var render = require('./lib/render');
var doc = require('./lib/doc');

/**
 * Directives.
 */

require('tower-list-directive').document = render.document;
//require('tower-markdown-directive');
require('tower-interpolation-directive');


/**
 * Module dependencies.
 */

var directive = require('tower-directive');
var md = require('marked');
var hl = require('highlight.js');
var langs = { js: 'javascript', html: 'xml' };

md.setOptions({
  highlight: function(code, lang){
    if (!hl.LANGUAGES[lang]) {
      if (langs[lang]) lang = langs[lang];
      else return code;
    }
    return hl.highlight(lang, code).value;
  }
});

/**
 * Expose `markdownDirective`.
 */

//module.exports = directive('[type="text/markdown"]', markdownDirective);
directive('data-markdown', markdownDirective);

/**
 * Define `markdownDirective`.
 */

function markdownDirective(scope, el, attr) {
  // XXX: todo, expression
  var val = attr.value
    ? scope.get(attr.value)
    : el.textContent;

  if (val) el.innerHTML = md(val);
}

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
guide('expression');
guide('route');
guide('cookbook');
//guide('validator');
//guide('type');
//guide('text');
guide('cli');
var overview = guide.compile('overview');

/**
 * Docs.
 */

doc('adapter');
doc('cli');
doc('content');
doc('cookbook');
doc('directive');
doc('element');
doc('expression');
doc('query');
doc('resource');
doc('route');
doc('template');
doc('text');
doc('type');
doc('validator');
//doc.compile();

/**
 * Content.
 */

content('body')
  .attr('overview', 'string', overview.content)
  .attr('guides', 'array', guide.collection);

/**
 * Routes.
 */

route('/', function(context){
  context.res.render('index');
});

route('/guide', function(context){
  context.res.render('guides');
});

route('/api', function(context){
  context.res.render('api');
});

/**
 * Listen.
 */

app.listen(process.env.PORT || 3000, function(){
  // wait conservatively for markdown to compile, 
  // then save static html files for gh-pages.
  setTimeout(function(){
    fetch('/', 'index.html', function(){
      fetch('/guide', 'guide.html', function(){
        exec('cleancss -o public/css/index.css public/css/index.css', function(){
          console.log('cached.');
        });
      });
    });
  }, 1000);
});

function fetch(path, name, fn) {
  agent.get('http://localhost:3000' + path).end(function(res){
    fs.writeFileSync(name, res.text);
    process.nextTick(fn);
  });
}