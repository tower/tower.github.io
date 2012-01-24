title "Post #{@post.toLabel()}"

dl class: "content", ->
  dt "Title:"
  dd @post.title
  dt "Body:"
  dd @post.body
