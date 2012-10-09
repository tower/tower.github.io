(function() {

  module.exports = {
    mongodb: {
      development: {
        name: 'towerjsorg-development',
        port: 27017,
        host: '127.0.0.1'
      },
      test: {
        name: 'towerjsorg-test',
        port: 27017,
        host: '127.0.0.1'
      },
      staging: {
        name: 'towerjsorg-staging',
        port: 27017,
        host: '127.0.0.1'
      },
      production: {
        name: 'towerjsorg-production',
        port: 27017,
        host: '127.0.0.1'
      }
    },
    redis: {
      development: {
        name: 'towerjsorg-development',
        port: 6397,
        host: '127.0.0.1'
      },
      test: {
        name: 'towerjsorg-test',
        port: 6397,
        host: '127.0.0.1'
      },
      staging: {
        name: 'towerjsorg-staging',
        port: 6397,
        host: '127.0.0.1'
      },
      production: {
        name: 'towerjsorg-production',
        port: 6397,
        host: '127.0.0.1'
      }
    }
  };

}).call(this);
