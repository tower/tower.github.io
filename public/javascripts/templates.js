
Tower.View.cache = {
  'app/templates/contributors': Ember.Handlebars.compile(''),
  'app/templates/index': Ember.Handlebars.compile('<div id="background">\
</div>\
'),
  'welcome': Ember.Handlebars.compile('<h1>Welcome to Tower.js</h1>\
')
};

_.extend(Ember.TEMPLATES, Tower.View.cache);
