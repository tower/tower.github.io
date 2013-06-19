
var directive = require('tower-directive');

directive('data-content', function(scope, el, attr){
  while (el.firstChild) el.removeChild(el.firstChild);
  var child = scope.get('body')(scope);
  el.appendChild(child);
});

/**
 * Module dependencies.
 */

var domify = require('domify');
var jsdom = require('jsdom').jsdom;
var template = require('tower-template');
var content = require('tower-content');
var fs = require('fs');
var path = require('path');
var layoutPath = path.join(__dirname, '../views/layout.html');
var layout = jsdom(fs.readFileSync(layoutPath));
var templates = {};
templates[layoutPath] = template(layout);

/**
 * Expose `render`.
 */

exports = module.exports = render;

/**
 * Document.
 */

exports.document = layout;

// express 3.x template engine compliance

function render(filename, options, cb) {
  var fn = templates[filename];

  if (!fn) {
    var html = fs.readFileSync(filename, 'utf-8');
    var parentEl = layout.createElement('div');
    parentEl.innerHTML = html;
    //var el = parentEl.firstChild;
    //parentEl.removeChild(el)
    var el = parentEl;
    //var el = domify(html, layout); // XXX: added second param, need to send PR
    //layout.appendChild(el);
    //console.log(layout.documentElement.innerHTML);
    templates[filename] = fn = template(el);
  }

  if (layoutPath === filename) {
    var el = fn(content.root().update(options));
    //console.log(el.documentElement.innerHTML)
    cb(null, el.documentElement.innerHTML);
  } else {
    cb(null, fn); 
  }
}