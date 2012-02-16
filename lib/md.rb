require 'rubygems'
require 'redcarpet'
require 'json'
require 'albino'

# create a custom renderer that allows highlighting of code blocks
class HTMLwithAlbino < Redcarpet::Render::HTML
  def block_code(code, language)
    Albino.colorize(code, language)
  end
end

STDOUT.sync = true
io          = STDOUT
json        = JSON.parse(STDIN.read)
input       = json.delete("input")
markdown    = Redcarpet::Markdown.new(Redcarpet::Render::HTML,#HTMLwithAlbino,
  :autolink => true, 
  :space_after_headers => true, 
  :fenced_code_blocks => true, 
  :hard_wrap => true, 
  :gh_blockcode => true, 
  :filter_html => false, 
  :safe_links_only => true
)
io.write    markdown.render(input)