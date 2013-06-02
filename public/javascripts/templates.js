
Tower.View.cache = {
  'app/templates/contributors': Ember.Handlebars.compile(''),
  'app/templates/index': Ember.Handlebars.compile('<div id="background">\
</div>\
'),
  'post': Ember.Handlebars.compile(''),
  'posts/show': Ember.Handlebars.compile('{{{post.body}}}'),
  'tests': Ember.Handlebars.compile('<h1>Test!</h1>\
'),
  'welcome': Ember.Handlebars.compile('<h1>Welcome to Tower.js</h1>\
')
};

_.extend(Ember.TEMPLATES, Tower.View.cache);
