
  module.exports = function() {
    return Watcher.create(Watcher.watchfile, {
      update: function() {
        return this.updateAll();
      },
      destroy: function() {
        return this.updateAll();
      }
    });
  };
