###
  body role: 'application', 'data-spy':'scroll', 'data-target': '.subnav', 'data-offset': '50', ->
    partial 'shared/navigation'
    
    div id: 'content', class: 'container', ->
      
      footer role: 'contentinfo', class: 'footer', ->
        cite class: 'copyright', ->
          text '&copy; '
          a href: 'http://twitter.com/viatropos', -> 'Lance Pollard'
          text '2012.'
        cite 'Code licensed under the MIT License.'
    
    coffeescript ->
      $('code[class='coffeescript']').each ->
        $(this).addClass('language-javascript').parent().addClass('prettyprint language-javascript')
      $('code[class='html']').each ->
        $(this).addClass('language-html').parent().addClass('prettyprint language-html')
    javascriptTag 'http://twitter.github.com/bootstrap/assets/js/google-code-prettify/prettify.js'
    coffeescript -> prettyPrint()
###
if hasContentFor 'templates'
  yields 'templates'

nav id: 'navigation', class: 'navbar', role: 'navigation', ->
  div class: 'navbar-inner', ->
    div class: 'container', ->
      partial 'layout/navigation'

header id: 'header', class: 'header', role: 'banner', ->
  div class: 'container', ->
    partial 'layout/header'

section id: 'flash', role: 'banner', ->
  div class: 'container', ->
    partial 'layout/flash'

section id: 'content', role: 'main', ->
  div class: 'container', ->
    # text '{{outlet}}\n'
    text '{{{App.post.body}}}\n'
    # yields 'body'
    aside id: 'sidebar', role: 'complementary', ->
      if hasContentFor 'sidebar'
        yields 'sidebar'

footer id: 'footer', class: 'footer', role: 'contentinfo', ->
  div class: 'container', ->
    partial 'layout/footer'
