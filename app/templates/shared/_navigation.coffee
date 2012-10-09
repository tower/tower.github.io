nav id: "navigation", role: "navigation", class: "navbar navbar-fixed-top", ->
  div class: "navbar-inner", ->
    div class: "container", ->
      linkTo t("title"), "/", class: "brand"
      div class: "nav-collapse pull-right", ->
        ul class: "nav", ->
          #li ->
          #  li class: "dropdown", ->
          #    a href: "#", class: "dropdown-toggle", "data-toggle": "dropdown", ->
          #      text "Guides"
          #      b class: "caret"
          #    ul class: "dropdown-menu", ->
          #      for page, i in @pages
          #        li class: (if i == 1 then "nav-item nav-group-start" else "nav-item"), ->
          #          a href: (if i == 0 then "/" else "/#{page.slug}"), -> page.title
          li ->
            linkTo "Guides", "/guides"
          li ->
            linkTo "API", "/api"
          li ->
            linkTo "Screencasts", "/screencasts"
          li ->
            linkTo "Examples", "/examples"
          li ->
            linkTo "Community", "/community"
  a class: "forkme", href: "http://github.com/viatropos/tower", style: "float: right", ->
    img src: "https://a248.e.akamai.net/assets.github.com/img/4c7dc970b89fd04b81c8e221ba88ff99a06c6b61/687474703a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67", alt: "Fork me on GitHub"      
