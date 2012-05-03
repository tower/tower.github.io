
window.designer || (window.designer = new DesignIO("towerjs", {
  port: 4181
}));

mocha.setup('bdd');

global.assert = chai.assert;

global.expect = chai.expect;

global.test = it;

global.__flash_getWindowLocation = null;

global.__flash_getTopLocation = null;

$(function() {});
