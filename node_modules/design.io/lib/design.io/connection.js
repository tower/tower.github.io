
  module.exports = function(portOrIo) {
    var Watcher, designer, io;
    if (typeof portOrIo === "object") {
      io = portOrIo;
    } else {
      io = require("socket.io").listen(portOrIo);
    }
    Watcher = require("./watcher");
    io.set('log level', 1);
    designer = io.of("/design.io");
    designer.on("connection", function(socket) {
      socket.on("userAgent", function(data) {
        console.log(data);
        return socket.set("userAgent", data, function() {
          socket.emit("ready");
          Watcher.connect();
          return true;
        });
      });
      socket.on("log", function(data) {
        Watcher.log(data);
        return true;
      });
      return socket.on("disconnect", function() {
        return socket.emit("user disconnected");
      });
    });
    return designer;
  };
