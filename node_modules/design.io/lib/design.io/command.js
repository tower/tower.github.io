(function() {
  var Command;

  Command = (function() {

    function Command(argv) {
      var program;
      this.program = program = require('commander');
      program.option('-d, --directory [value]', 'directory to watch files from').option('-w, --watchfile [value]', 'location of Watchfile').option('-p, --port <n>', 'port for the socket connection').option('-u, --url [value]', 'URL for the socket connection').option('-i, --interval <n>', 'interval (in milliseconds) files should be scanned (only useful if you can\'t use FSEvents).  Not implemented').parse(process.argv);
      program.directory || (program.directory = process.cwd());
      program.watchfile || (program.watchfile = "Watchfile");
      program.port = program.port ? parseInt(program.port) : process.env.PORT || 4181;
      program.url || (program.url = "http://localhost:" + program.port);
    }

    Command.prototype.run = function() {
      var program;
      program = this.program;
      return require('./watcher').initialize({
        watchfile: program.watchfile,
        directory: program.directory,
        port: program.port,
        url: program.url
      });
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);
