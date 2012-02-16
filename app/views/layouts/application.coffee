doctype 5
html ->
  head ->
    meta charset: "utf-8"
    
    if @currentPage.slug == "home"
      title "#{t("title")} - Full Stack JavaScript Framework for Node.js and the Browser"
    else
      title "#{t("title")} - #{@currentPage.title}"

    meta name: "description", content: t("description")
    meta name: "keywords", content: t("keywords")
    meta name: "robots", content: t("robots")
    meta name: "author", content: t("author")
    
    stylesheetTag "http://fonts.googleapis.com/css?family=Forum|Josefin+Sans:400,700"
    #stylesheets "lib", "vendor", "application"
    stylesheetTag "http://twitter.github.com/bootstrap/assets/css/bootstrap.css"
    stylesheetTag "http://twitter.github.com/bootstrap/assets/css/bootstrap-responsive.css"
    stylesheetTag "http://twitter.github.com/bootstrap/assets/css/docs.css"
    stylesheetTag "http://twitter.github.com/bootstrap/assets/js/google-code-prettify/prettify.css"
    stylesheets "application"
    
    #if browserIs("firefox")
    #  stylesheets "font"

    #if contentFor "headStyleSheets"
    #  yield "headStyleSheets"

    javascriptTag "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
    javascripts "vendor", "lib", "application"

    if Tower.env == "development"
      javascripts "development"
      
    link href: "http://i.imgur.com/e3VLW.png", rel: "icon shortcut-icon favicon"

    #if contentFor "headJavaScripts"
    #  yield "headJavaScripts"

    contentFor "bottom", ->
      javascripts "bottom"
    
    unless Tower.env == "development"
      text """
      <script type="text/javascript">

        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-28846243-1']);
        _gaq.push(['_setDomainName', 'towerjs.org']);
        _gaq.push(['_trackPageview']);

        (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();

      </script>
      """
  
  body role: "application", "data-spy":"scroll", "data-target": ".subnav", "data-offset": "50", ->
    nav id: "navigation", role: "navigation", class: "navbar navbar-fixed-top", ->
      div class: "navbar-inner", ->
        div class: "container", ->
          div class: "nav-collapse", ->
            ul class: "nav", ->
              for page, i in @pages
                li class: (if i == 1 then "nav-item nav-group-start" else "nav-item"), ->
                  a href: (if i == 0 then "/" else "/#{page.slug}"), -> page.title
              li class: "nav-group-start", ->
                a href: "/guides", "Guides"
              li ->
                a href: "/screencasts", "Screencasts"
              li ->
                a href: "/examples", "Examples"
              #li ->
              #  a class: "forkme", href: "http://github.com/viatropos/tower", ->
              #    img src: "https://a248.e.akamai.net/assets.github.com/img/4c7dc970b89fd04b81c8e221ba88ff99a06c6b61/687474703a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67", alt: "Fork me on GitHub"      
    
    div id: "content", class: "container", ->
      text @currentPage.body
      footer role: "contentinfo", class: "footer", ->
        cite class: "copyright", ->
          text "&copy; "
          a href: "http://twitter.com/viatropos", -> "Lance Pollard"
          text "2012."
        cite "Code licensed under the MIT License."
    
    coffeescript ->
      $("code[class='coffeescript']").each ->
        $(this).addClass("language-javascript").parent().addClass("prettyprint language-javascript")
      $("code[class='html']").each ->
        $(this).addClass("language-html").parent().addClass("prettyprint language-html")
    javascriptTag "http://twitter.github.com/bootstrap/assets/js/google-code-prettify/prettify.js"
    coffeescript -> prettyPrint()