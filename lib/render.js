
var directive = require('tower-directive');

// https://github.com/isagalaev/highlight.js
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
var minify = require('html-minifier').minify;
var minifyOptions = {
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeEmptyAttributes: true,
  useShortDoctype: false
};

function min(val) {
  return minify(val, minifyOptions);
  return val;
}

var layoutPath = path.join(__dirname, '../views/layout.html');
var layout = jsdom(minify(fs.readFileSync(layoutPath, 'utf-8'), minifyOptions));
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
    var html = min(fs.readFileSync(filename, 'utf-8'));
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
    cb(null, min(el.documentElement.innerHTML));
  } else {
    cb(null, fn); 
  }
}