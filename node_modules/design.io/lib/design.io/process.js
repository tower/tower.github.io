(function() {
  var command, exec, server, spawn, _ref;

  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

  global._console || (global._console = require('underscore.logger'));

  command = new (require("" + __dirname + "/command"))(process.argv);

  command.run();

  server = spawn("node", ["" + __dirname + "/server", "--watchfile", command.program.watchfile, "--directory", command.program.directory, "--port", command.program.port]);

  server.stdout.on('data', function(data) {});

  server.stderr.on('data', function(data) {
    return console.log(data.toString().trim());
  });

}).call(this);
