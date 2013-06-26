module.exports = function() {
  $(document).ready(function () {
    function toggleApiModule(event) {
      event.stopPropagation();
      var currLink = $(this).toggleClass('active'),
          moduleLinks = $('li.module a'),
          moduleHeadLinks = $('li.module > h4 > a');
          


      if (currLink.hasClass('mod-link')) {
        currLink.parent()
          .siblings()        
            .toggle();

          moduleHeadLinks.not(currLink)
            .removeClass('active')
          .parent()
            .siblings()
              .hide()

        $('li.module a').not(currLink).removeClass('active');
      } else if (currLink.hasClass('klass-method') || currLink.hasClass('klass-property')) {
        moduleLinks.not(moduleHeadLinks)
          .not(currLink).removeClass('active');
        $(currLink).closest('ul.module-class')
          .find('a.klass').addClass('active');
      } else {
        moduleLinks.not(moduleHeadLinks)
          .not(currLink).removeClass('active');
      }
    }

    var urlParts = document.URL.split('/'),
        page = urlParts[3].split('#')[0];

    $('li.pull-right a[href="' + page + '"]').addClass('active');
    $('.module ul.module-items')
      .slice(1)
      .hide();

    $('.api-page')
      .on('click', '.module a', toggleApiModule);
    $('.module h4 a:first').addClass('active');
  });
}