formFor @post, (f) ->
  f.fieldset (fields) ->
    fields.field "title", as: "string"
  
    fields.field "body", as: "string"
  
  f.fieldset (fields) ->
    fields.submit "Submit"
