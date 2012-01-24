li class: "undefined", ->
  header class: "header", ->
    h3 @post.toLabel()
  dl class: "content", ->
    dt "Title:"
    dd @post.title
    dt "Body:"
    dd @post.body
  footer class: "footer", ->
    menu ->
      menuItem "Edit", editPostPath(@post)
      menuItem "Back", postsPath
