class App.Post extends Tower.Model
  @field 'title'
  @field 'body'
  @field 'slug'

  # @validates 'title', uniqueness: true

  @include App.PostReadMixin if Tower.isServer