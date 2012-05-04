doctype 5
html ->
  head ->
    meta charset: "utf-8"
    
    if @currentPage.slug == "home"
      title "#{t("title")} - Full Stack Web Framework for Node.js and the Browser"
    else
      title "#{t("title")} - #{@currentPage.title}"

    meta name: "description", content: t("description")
    meta name: "keywords", content: t("keywords")
    meta name: "robots", content: t("robots")
    meta name: "author", content: t("author")
    meta name: "viewport", content: "width=device-width, initial-scale=1.0"
    
    stylesheetTag "http://fonts.googleapis.com/css?family=Forum|Varela"
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
      
    link href: "/favicon.png", rel: "icon shortcut-icon favicon"

    contentFor "bottom", ->
      javascripts "bottom"
    
    partial "shared/analytics"

  body role: "application", "data-spy":"scroll", "data-target": ".subnav", "data-offset": "50", ->
    partial "shared/navigation"
    
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