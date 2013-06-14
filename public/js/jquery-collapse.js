var jQuery = $ = require("component-jquery");

$(document).ready(function () {

  function showHide(event, siblings) {
    if (siblings.first().is(":hidden")) {
      siblings.slideDown();
    } else {
      event.preventDefault();
      siblings.slideUp();
    }  
  }

  var $siblings1 = $('a.mod-link').parent().parent().siblings();

  $siblings1.slideUp();

  $('#nav-list').on('click', function (event) {
    var target = event.target,
      targetTag = target.tagName.toLowerCase(),
      $target = $(target),
      $targetText = $target.text(),
      $targetParent = $target.parent(),
      $targetId = $target.attr('class');

    if ($targetText === 'Methods:' || $targetText === 'Properties:') {
      var $siblings = $targetParent.siblings();
      showHide(event, $siblings);
    }else if ($targetId === 'mod-link') {
      var $siblings = $targetParent.parent().siblings();
      showHide(event, $siblings);
    }    
  });

});