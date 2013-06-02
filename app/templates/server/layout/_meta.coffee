meta charset: 'utf-8'

if @currentPage.slug == "home"
  title "#{t("title")} - Full Stack Web Framework for Node.js and the Browser"
else
  title "#{t("title")} - #{@currentPage.title}"

meta name: 'description', content: t('description')
meta name: 'keywords', content: t('keywords')
meta name: 'robots', content: t('robots')
meta name: 'author', content: t('author')

csrfMetaTag()

appleViewportMetaTag width: 'device-width', max: 1, scalable: false

stylesheetTag 'http://fonts.googleapis.com/css?family=Forum|Varela'
stylesheetTag 'http://twitter.github.com/bootstrap/assets/css/bootstrap.css'
stylesheetTag 'http://twitter.github.com/bootstrap/assets/css/bootstrap-responsive.css'
stylesheetTag 'http://twitter.github.com/bootstrap/assets/css/docs.css'
stylesheetTag 'http://twitter.github.com/bootstrap/assets/js/google-code-prettify/prettify.css'

stylesheets 'lib', 'vendor', 'application', 'development'

link href: '/favicon.png', rel: 'icon shortcut-icon favicon'

#if browserIs('firefox')
#  stylesheets 'font'

#if contentFor 'headStyleSheets'
#  yield 'headStyleSheets'

script '''
window.ENV                  = {};
ENV.VIEW_PRESERVES_CONTEXT  = true;
ENV.CP_DEFAULT_CACHEABLE    = true;
'''

#if contentFor 'headJavaScripts'
#  yield 'headJavaScripts'

contentFor 'bottom', ->
  javascriptTag 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
  javascripts 'vendor'
  if Tower.env == 'development'
    javascripts 'development'
  javascripts 'lib', 'application'
