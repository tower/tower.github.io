tableFor "users", (t) ->
  t.head ->
    t.row ->
      t.cell "title", sort: true
      t.cell "body", sort: true
      t.cell()
      t.cell()
      t.cell()
  t.body ->
    for post in @posts
      t.row ->
        t.cell post.get("title")
        t.cell post.get("body")
        t.cell linkTo 'Show', post
        t.cell linkTo 'Edit', editPostPath(post)
        t.cell linkTo 'Destroy', post, method: "delete"
  linkTo 'New Post', newPostPath()
