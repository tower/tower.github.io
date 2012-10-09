(function() {

  module.exports = {
    javascripts: {
      application: ['/app/config/shared/application', '/app/config/client/bootstrap', '/app/config/client/watch', '/app/config/shared/routes', '/app/controllers/client/applicationController', '/templates', '/app/views/client/layout/application'],
      lib: [],
      vendor: ['/vendor/javascripts/underscore', '/vendor/javascripts/underscore.string', '/vendor/javascripts/moment', '/vendor/javascripts/geolib', '/vendor/javascripts/validator', '/vendor/javascripts/accounting', '/vendor/javascripts/inflection', '/vendor/javascripts/async', '/vendor/javascripts/socket.io', '/vendor/javascripts/handlebars', '/vendor/javascripts/ember', '/vendor/javascripts/jstorage', '/vendor/javascripts/tower', '/vendor/javascripts/bootstrap/bootstrap-dropdown'],
      development: ['/vendor/javascripts/mocha', '/vendor/javascripts/chai', '/test/client']
    },
    stylesheets: {
      application: ['/app/stylesheets/client/application'],
      lib: [],
      vendor: ['/vendor/stylesheets/bootstrap/bootstrap', '/vendor/stylesheets/prettify'],
      development: []
    }
  };

}).call(this);
