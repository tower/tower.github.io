var marked = require('marked'),
    hl = require('node-syntaxhighlighter'),
    hl = require("highlight").Highlight,
    fs = require('fs');

/**
 * Module Export
 */

exports = module.exports = markdown;

/**
 * Configure marked.
 */

marked.setOptions({
  /**highlight: function(code, lang){
    return hl(code, "<span>  </span>");
  }**/
  langPrefix: ''
});

/**
 * Markdown Function
 */

function markdown(file) {
  var file = fs.readFileSync(require('path').join(__dirname, 'views', 'markdown', file + '.markdown'), 'utf-8');
  return marked(file);
}