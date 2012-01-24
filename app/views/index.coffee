#nav#navigation
#  ul
#    li
#      a(href="/") Overview
#    li
#      a(href="/guides") Guides
#    li
#      a(href="/screencasts") Screencasts
#    li
#      a(href="/examples") Examples
#    li
#      a.forkme(href="http://github.com/viatropos/tower.js", target="_blank")
#        img(src="https://a248.e.akamai.net/assets.github.com/img/4c7dc970b89fd04b81c8e221ba88ff99a06c6b61/687474703a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f77686974655f6666666666662e706e67", alt="Fork me on GitHub")
#header#header
#  h1 Tower.js
#  
#section#body
#  #background
#  #content
i = 20
while i-- > 0
  text """
<blockquote>
<p>Full Stack Web Framework for Node.js and the Browser.  Minified &amp; Gzipped: 15.7kb</p>
</blockquote>
<h2>Generator</h2>

<div class="highlight">
<pre>tower new my-app
</pre>
</div>


<h2>Structure</h2>

<p>Here's how you might organize a blog:</p>

<div class="highlight">
<pre>.
|-- app
|   |-- controllers
|   |   |-- admin
|   |   |   |-- postsController.coffee
|   |   |   <span class="sb">`</span>-- usersController.coffee
|   |   |-- commentsController.coffee
|   |   |-- postsController.coffee
|   |   |-- sessionsController.coffee
|   |   <span class="sb">`</span>-- usersController.coffee
|   |-- models
|   |   |-- post.coffee
|   |   <span class="sb">`</span>-- user.coffee
|   |-- views
|   |   |-- admin
|   |   |   <span class="sb">`</span>-- posts
|   |   |       |-- _form.coffee
|   |   |       |-- edit.coffee
|   |   |       |-- index.coffee
|   |   |       |-- new.coffee
|   |   |       |-- show.coffee
|   |   |-- layouts
|   |   |   <span class="sb">`</span>-- application.coffee
|   |   |-- shared
|   |   <span class="sb">`</span>-- posts
|   |       |-- index.coffee
|   |       <span class="sb">`</span>-- show.coffee
|   <span class="sb">`</span>-- helpers
|       |-- admin
|       |   |-- postsHelper.coffee
|       |   <span class="sb">`</span>-- tagsHelper.coffee
|       <span class="sb">`</span>-- postsHelper.coffee
<span class="sb">`</span>-- config
|    |-- application.coffee
|    |-- locale
|        <span class="sb">`</span>-- en.coffee
|    |-- routes.coffee
<span class="sb">`</span>-- spec
|    |-- helper.coffee
|    |-- models
|    |   |-- postSpec.coffee
|    |   |-- userSpec.coffee
|    <span class="sb">`</span>-- acceptance
|        |-- login.coffee
|        |-- signup.coffee
|        <span class="sb">`</span>-- posts.coffee
</pre>
</div>


<h2>Application</h2>

<div class="highlight">
<pre><span class="c1"># config/application.coffee</span>
<span class="k">class</span> <span class="nx">App</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Application</span>
  <span class="vi">@config.encoding = </span><span class="s">"utf-8"</span>
  <span class="nx">@config</span><span class="p">.</span><span class="nx">filterParameters</span> <span class="o">+=</span> <span class="p">[</span><span class="s">"password"</span><span class="p">,</span> <span class="s">"password_confirmation"</span><span class="p">]</span>
  <span class="nx">@config</span><span class="p">.</span><span class="nx">loadPaths</span> <span class="o">+=</span> <span class="p">[</span><span class="s">"./themes"</span><span class="p">]</span>

<span class="nv">global.App = module.exports = </span><span class="nx">App</span>
</pre>
</div>


<h2>Models</h2>

<div class="highlight">
<pre><span class="k">class</span> <span class="nx">App</span><span class="p">.</span><span class="nx">Post</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Model</span>
  <span class="nx">@field</span> <span class="s">"title"</span>
  <span class="nx">@field</span> <span class="s">"body"</span>
  <span class="nx">@field</span> <span class="s">"tags"</span><span class="p">,</span> <span class="nv">type: </span><span class="p">[</span><span class="s">"String"</span><span class="p">],</span> <span class="nv">default: </span><span class="p">[]</span>
  <span class="nx">@field</span> <span class="s">"slug"</span>

  <span class="nx">@key</span> <span class="s">"slug"</span>

  <span class="nx">@belongsTo</span> <span class="s">"author"</span><span class="p">,</span> <span class="nv">type: </span><span class="s">"User"</span>

  <span class="nx">@hasMany</span> <span class="s">"comments"</span><span class="p">,</span> <span class="nv">as: </span><span class="s">"commentable"</span>
  <span class="nx">@hasMany</span> <span class="s">"commenters"</span><span class="p">,</span> <span class="nv">through: </span><span class="s">"comments"</span><span class="p">,</span> <span class="nv">source: </span><span class="s">"author"</span>

  <span class="nx">@before</span> <span class="s">"validate"</span><span class="p">,</span> <span class="s">"slugify"</span>

  <span class="nv">slugify: </span><span class="o">-&gt;</span>
    <span class="vi">@slug = </span><span class="nx">@title</span><span class="p">.</span><span class="nx">replace</span><span class="p">(</span><span class="sr">/^[a-z0-9]+/g</span><span class="p">,</span> <span class="s">"-"</span><span class="p">).</span><span class="nx">toLowerCase</span><span class="p">()</span>

<span class="k">class</span> <span class="nx">App</span><span class="p">.</span><span class="nx">Comment</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Model</span>
  <span class="nx">@field</span> <span class="s">"message"</span>

  <span class="nx">@belongsTo</span> <span class="s">"author"</span><span class="p">,</span> <span class="nv">type: </span><span class="s">"User"</span>
  <span class="nx">@belongsTo</span> <span class="s">"commentable"</span><span class="p">,</span> <span class="nv">polymorphic: </span><span class="kc">true</span>

<span class="k">class</span> <span class="nx">App</span><span class="p">.</span><span class="nx">User</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Model</span>
  <span class="nx">@field</span> <span class="s">"firstName"</span>
  <span class="nx">@field</span> <span class="s">"lastName"</span>
  <span class="nx">@field</span> <span class="s">"email"</span>
  <span class="nx">@field</span> <span class="s">"activatedAt"</span><span class="p">,</span> <span class="nv">type: </span><span class="s">"Date"</span><span class="p">,</span> <span class="nv">default: </span><span class="o">-&gt;</span> <span class="k">new</span> <span class="nb">Date</span><span class="p">()</span>

  <span class="nx">@hasOne</span> <span class="s">"address"</span><span class="p">,</span> <span class="nv">embed: </span><span class="kc">true</span>

  <span class="nx">@hasMany</span> <span class="s">"posts"</span>
  <span class="nx">@hasmany</span> <span class="s">"comments"</span><span class="p">,</span> <span class="nv">through: </span><span class="s">"posts"</span>

  <span class="nx">@scope</span> <span class="s">"thisWeek"</span><span class="p">,</span> <span class="o">-&gt;</span> <span class="nx">@where</span><span class="p">(</span><span class="nv">createdAt: </span><span class="s">"&gt;="</span><span class="o">:</span> <span class="o">-&gt;</span> <span class="nx">require</span><span class="p">(</span><span class="s">'moment'</span><span class="p">)().</span><span class="nx">subtract</span><span class="p">(</span><span class="s">'days'</span><span class="p">,</span> <span class="mi">7</span><span class="p">))</span>

  <span class="nx">@validate</span> <span class="s">"firstName"</span><span class="p">,</span> <span class="nv">presence: </span><span class="kc">true</span>

  <span class="nx">@after</span> <span class="s">"create"</span><span class="p">,</span> <span class="s">"welcome"</span>

  <span class="nv">welcome: </span><span class="o">-&gt;</span>
    <span class="nx">Tower</span><span class="p">.</span><span class="nx">Mailer</span><span class="p">.</span><span class="nx">welcome</span><span class="p">(</span><span class="nx">@</span><span class="p">).</span><span class="nx">deliver</span><span class="p">()</span>

<span class="k">class</span> <span class="nx">App</span><span class="p">.</span><span class="nx">Address</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Model</span>
  <span class="nx">@field</span> <span class="s">"street"</span>
  <span class="nx">@field</span> <span class="s">"city"</span>
  <span class="nx">@field</span> <span class="s">"state"</span>
  <span class="nx">@field</span> <span class="s">"zip"</span>
  <span class="nx">@field</span> <span class="s">"coordinates"</span><span class="p">,</span> <span class="nv">type: </span><span class="s">"Geo"</span>

  <span class="nx">@belongsTo</span> <span class="s">"user"</span><span class="p">,</span> <span class="nv">embed: </span><span class="kc">true</span>
</pre>
</div>


<h3>Chainable Scopes, Queries, and Pagination</h3>

<div class="highlight">
<pre><span class="nx">User</span>
  <span class="p">.</span><span class="nx">where</span><span class="p">(</span><span class="nv">createdAt: </span><span class="s">"&gt;="</span><span class="o">:</span> <span class="nx">_</span><span class="p">(</span><span class="mi">2</span><span class="p">).</span><span class="nx">days</span><span class="p">().</span><span class="nx">ago</span><span class="p">(),</span> <span class="s">"&lt;="</span><span class="o">:</span> <span class="k">new</span> <span class="nb">Date</span><span class="p">())</span>
  <span class="p">.</span><span class="nx">within</span><span class="p">(</span><span class="nv">radius: </span><span class="mi">2</span><span class="p">)</span>
  <span class="p">.</span><span class="nx">desc</span><span class="p">(</span><span class="s">"createdAt"</span><span class="p">)</span>
  <span class="p">.</span><span class="nx">asc</span><span class="p">(</span><span class="s">"firstName"</span><span class="p">)</span>
  <span class="p">.</span><span class="nx">paginate</span><span class="p">(</span><span class="nv">page: </span><span class="mi">5</span><span class="p">)</span>
  <span class="p">.</span><span class="nx">all</span><span class="p">()</span>
</pre>
</div>


<h3>Associations</h3>

<div class="highlight">
<pre><span class="nv">user = </span><span class="nx">User</span><span class="p">.</span><span class="nx">first</span><span class="p">()</span>

<span class="c1"># hasMany "posts"</span>
<span class="nv">posts = </span><span class="nx">user</span><span class="p">.</span><span class="nx">posts</span><span class="p">().</span><span class="nx">where</span><span class="p">(</span><span class="nv">title: </span><span class="s">"First Post"</span><span class="p">).</span><span class="nx">first</span><span class="p">()</span>
<span class="nv">post  = </span><span class="nx">user</span><span class="p">.</span><span class="nx">posts</span><span class="p">().</span><span class="nx">build</span><span class="p">(</span><span class="nv">title: </span><span class="s">"A Post!"</span><span class="p">)</span>
<span class="nv">post  = </span><span class="nx">user</span><span class="p">.</span><span class="nx">posts</span><span class="p">().</span><span class="nx">create</span><span class="p">(</span><span class="nv">title: </span><span class="s">"A Saved Post!"</span><span class="p">)</span>
<span class="nv">posts = </span><span class="nx">user</span><span class="p">.</span><span class="nx">posts</span><span class="p">().</span><span class="nx">all</span><span class="p">()</span>

<span class="c1"># hasMany "comments", through: "posts"</span>
<span class="nv">comments  = </span><span class="nx">user</span><span class="p">.</span><span class="nx">comments</span><span class="p">().</span><span class="nx">where</span><span class="p">(</span><span class="nv">message: </span><span class="sr">/(javascript)/</span><span class="p">).</span><span class="nx">limit</span><span class="p">(</span><span class="mi">10</span><span class="p">).</span><span class="nx">all</span><span class="p">()</span>

<span class="c1"># eager load associations</span>
<span class="nx">Post</span><span class="p">.</span><span class="nx">includes</span><span class="p">(</span><span class="s">"author"</span><span class="p">).</span><span class="nx">where</span><span class="p">(</span><span class="nv">author: firstName: </span><span class="s">"=~"</span><span class="o">:</span> <span class="s">"Baldwin"</span><span class="p">).</span><span class="nx">all</span><span class="p">()</span>
<span class="nx">Post</span><span class="p">.</span><span class="nx">includes</span><span class="p">(</span><span class="s">"author"</span><span class="p">).</span><span class="nx">where</span><span class="p">(</span><span class="s">"author.firstName"</span><span class="o">:</span> <span class="s">"=~"</span><span class="o">:</span> <span class="s">"Baldwin"</span><span class="p">).</span><span class="nx">all</span><span class="p">()</span>
<span class="nx">User</span><span class="p">.</span><span class="nx">includes</span><span class="p">(</span><span class="s">"posts"</span><span class="p">).</span><span class="nx">where</span><span class="p">(</span><span class="s">"posts.title"</span><span class="o">:</span> <span class="s">"Welcome"</span><span class="p">).</span><span class="nx">all</span><span class="p">()</span>
</pre>
</div>


<h3>Validations</h3>

<div class="highlight">
<pre><span class="nv">user = </span><span class="k">new</span> <span class="nx">User</span>
<span class="nx">user</span><span class="p">.</span><span class="nx">save</span><span class="p">()</span> <span class="c1">#=&gt; false</span>
<span class="nx">user</span><span class="p">.</span><span class="nx">errors</span> <span class="c1">#=&gt; {"email": ["Email must be present"]}</span>
<span class="nv">user.email  = </span><span class="s">"me@gmail.com"</span>
<span class="nx">user</span><span class="p">.</span><span class="nx">save</span><span class="p">()</span> <span class="c1">#=&gt; true</span>
<span class="nx">user</span><span class="p">.</span><span class="nx">errors</span> <span class="c1">#=&gt; {}</span>
</pre>
</div>


<h2>Routes</h2>

<div class="highlight">
<pre><span class="c1"># config/routes.coffee</span>
<span class="nx">Tower</span><span class="p">.</span><span class="nx">Route</span><span class="p">.</span><span class="nx">draw</span> <span class="o">-&gt;</span>
  <span class="nx">@match</span> <span class="s">"/login"</span><span class="p">,</span> <span class="s">"sessions</span><span class="err">#</span><span class="s">new"</span><span class="p">,</span> <span class="nv">via: </span><span class="s">"get"</span><span class="p">,</span> <span class="nv">as: </span><span class="s">"login"</span>
  <span class="nx">@match</span> <span class="s">"/logout"</span><span class="p">,</span> <span class="s">"sessions</span><span class="err">#</span><span class="s">destroy"</span><span class="p">,</span> <span class="nv">via: </span><span class="s">"get"</span><span class="p">,</span> <span class="nv">as: </span><span class="s">"logout"</span>

  <span class="nx">@resources</span> <span class="s">"posts"</span><span class="p">,</span> <span class="o">-&gt;</span>
    <span class="nx">@resources</span> <span class="s">"comments"</span>

  <span class="nx">@namespace</span> <span class="s">"admin"</span><span class="p">,</span> <span class="o">-&gt;</span>
    <span class="nx">@resources</span> <span class="s">"users"</span>
    <span class="nx">@resources</span> <span class="s">"posts"</span><span class="p">,</span> <span class="o">-&gt;</span>
      <span class="nx">@resources</span> <span class="s">"comments"</span>

  <span class="nx">@constraints</span> <span class="nv">subdomain: </span><span class="sr">/^api$/</span><span class="p">,</span> <span class="o">-&gt;</span>
    <span class="nx">@resources</span> <span class="s">"posts"</span><span class="p">,</span> <span class="o">-&gt;</span>
      <span class="nx">@resources</span> <span class="s">"comments"</span>

  <span class="nx">@match</span> <span class="s">"(/*path)"</span><span class="p">,</span> <span class="nv">to: </span><span class="s">"application</span><span class="err">#</span><span class="s">index"</span><span class="p">,</span> <span class="nv">via: </span><span class="s">"get"</span>
</pre>
</div>


<p>Routes are really just models, <code>Tower.Route</code>.  You can add and remove and search them however you like:</p>

<div class="highlight">
<pre><span class="nx">Tower</span><span class="p">.</span><span class="nx">Route</span><span class="p">.</span><span class="nx">where</span><span class="p">(</span><span class="nv">pattern: </span><span class="s">"=~"</span><span class="o">:</span> <span class="s">"/posts"</span><span class="p">).</span><span class="nx">first</span><span class="p">()</span>
</pre>
</div>


<h2>Views</h2>

<h3>Forms</h3>

<div class="highlight">
<pre><span class="c1"># app/views/posts/new.coffee</span>
<span class="nx">formFor</span> <span class="nx">@post</span><span class="p">,</span> <span class="o">-&gt;</span>
  <span class="nx">fieldset</span> <span class="o">-&gt;</span>
    <span class="nx">legend</span> <span class="s">"Basic Info"</span>
    <span class="nx">field</span> <span class="s">"title"</span>
    <span class="nx">field</span> <span class="s">"body"</span><span class="p">,</span> <span class="nv">as: </span><span class="s">"text"</span>
  <span class="nx">submit</span> <span class="s">"Save"</span>
</pre>
</div>


<h3>Tables</h3>

<div class="highlight">
<pre><span class="c1"># app/views/posts/index.coffee</span>
<span class="nx">tableFor</span> <span class="nx">@posts</span><span class="p">,</span> <span class="o">-&gt;</span>
  <span class="nx">thead</span> <span class="o">-&gt;</span>
    <span class="nx">tcell</span> <span class="s">"Title"</span>
    <span class="nx">tcell</span> <span class="s">"Author"</span>
  <span class="nx">tbody</span> <span class="o">-&gt;</span>
    <span class="k">for</span> <span class="nx">post</span> <span class="k">in</span> <span class="nx">@posts</span>
      <span class="nx">trow</span> 
        <span class="nx">tcell</span> <span class="nx">post</span><span class="p">.</span><span class="nx">title</span>
        <span class="nx">tcell</span> <span class="nx">post</span><span class="p">.</span><span class="nx">author</span><span class="p">.</span><span class="nx">name</span>
  <span class="nx">tfoot</span> <span class="o">-&gt;</span>
    <span class="nx">pagination</span> <span class="nx">@posts</span>
</pre>
</div>


<p>The default templating engine is <a href="http://coffeekup.org/">CoffeeKup</a>, which is pure coffeescript.  It's much more powerful than Jade, and it's just as performant if not more so.  You can set Jade or any other templating engine as the default by setting <code>Tower.View.engine = "jade"</code> in <code>config/application</code>.  Tower uses <a href="http://github.com/viatropos/shift.js">Shift.js</a>, which is a normalized interface to most of the Node.js templating languages.</p>

<h2>Controllers</h2>

<div class="highlight">
<pre><span class="k">class</span> <span class="nx">PostsController</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Controller</span>
  <span class="nv">index: </span><span class="o">-&gt;</span>
    <span class="vi">@posts = </span><span class="nx">Post</span><span class="p">.</span><span class="nx">all</span><span class="p">()</span>

  <span class="k">new</span><span class="o">:</span> <span class="o">-&gt;</span>
    <span class="vi">@post = </span><span class="k">new</span> <span class="nx">Post</span>

  <span class="nv">create: </span><span class="o">-&gt;</span>
    <span class="vi">@post = </span><span class="k">new</span> <span class="nx">Post</span><span class="p">(</span><span class="nx">@params</span><span class="p">.</span><span class="nx">post</span><span class="p">)</span>

    <span class="k">super</span> <span class="nf">(success, failure) -&gt;</span>
      <span class="nx">@success</span><span class="p">.</span><span class="nx">html</span> <span class="o">-&gt;</span> <span class="nx">@render</span> <span class="s">"posts/edit"</span>
      <span class="nx">@success</span><span class="p">.</span><span class="nx">json</span> <span class="o">-&gt;</span> <span class="nx">@render</span> <span class="nv">text: </span><span class="s">"success!"</span>
      <span class="nx">@failure</span><span class="p">.</span><span class="nx">html</span> <span class="o">-&gt;</span> <span class="nx">@render</span> <span class="nv">text: </span><span class="s">"Error"</span><span class="p">,</span> <span class="nv">status: </span><span class="mi">404</span>
      <span class="nx">@failure</span><span class="p">.</span><span class="nx">json</span> <span class="o">-&gt;</span> <span class="nx">@render</span> <span class="nv">text: </span><span class="s">"Error"</span><span class="p">,</span> <span class="nv">status: </span><span class="mi">404</span>

  <span class="nv">show: </span><span class="o">-&gt;</span>
    <span class="vi">@post = </span><span class="nx">Post</span><span class="p">.</span><span class="nx">find</span><span class="p">(</span><span class="nx">@params</span><span class="p">.</span><span class="nx">id</span><span class="p">)</span>

  <span class="nv">edit: </span><span class="o">-&gt;</span>
    <span class="vi">@post = </span><span class="nx">Post</span><span class="p">.</span><span class="nx">find</span><span class="p">(</span><span class="nx">@params</span><span class="p">.</span><span class="nx">id</span><span class="p">)</span>

  <span class="nv">update: </span><span class="o">-&gt;</span>
    <span class="vi">@post = </span><span class="nx">Post</span><span class="p">.</span><span class="nx">find</span><span class="p">(</span><span class="nx">@params</span><span class="p">.</span><span class="nx">id</span><span class="p">)</span>

  <span class="nv">destroy: </span><span class="o">-&gt;</span>
    <span class="vi">@post = </span><span class="nx">Post</span><span class="p">.</span><span class="nx">find</span><span class="p">(</span><span class="nx">@params</span><span class="p">.</span><span class="nx">id</span><span class="p">)</span>
</pre>
</div>


<p>Actually, all that's built in!  So for the simple case you don't even need to write anything in your controllers (skinny controllers, fat models).</p>

<h2>Mailers</h2>

<div class="highlight">
<pre><span class="k">class</span> <span class="nx">App</span><span class="p">.</span><span class="nx">Notification</span> <span class="k">extends</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">Mailer</span>
  <span class="c1"># app/views/mailers/welcome.coffee template</span>
  <span class="vi">@welcome: </span><span class="nf">(user) -&gt;</span>
    <span class="nx">@mail</span> <span class="nv">to: </span><span class="nx">user</span><span class="p">.</span><span class="nx">email</span><span class="p">,</span> <span class="nv">from: </span><span class="s">"me@gmail.com"</span>
</pre>
</div>


<h2>Internationalization</h2>

<div class="highlight">
<pre><span class="nv">en:</span>
  <span class="nv">hello: </span><span class="s">"world"</span>
  <span class="nv">forms:</span>
    <span class="nv">titles:</span>
      <span class="nv">signup: </span><span class="s">"Signup"</span>
  <span class="nv">pages:</span>
    <span class="nv">titles:</span>
      <span class="nv">home: </span><span class="s">"Welcome to %{site}"</span>
  <span class="nv">posts:</span>
    <span class="nv">comments:</span>
      <span class="nv">none: </span><span class="s">"No comments"</span>
      <span class="nv">one: </span><span class="s">"1 comment"</span>
      <span class="nv">other: </span><span class="s">"%{count} comments"</span>
  <span class="nv">messages:</span>
    <span class="nv">past:</span>
      <span class="nv">none: </span><span class="s">"You never had any messages"</span>
      <span class="nv">one: </span><span class="s">"You had 1 message"</span>
      <span class="nv">other: </span><span class="s">"You had %{count} messages"</span>
    <span class="nv">present:</span>
      <span class="nv">one: </span><span class="s">"You have 1 message"</span>
    <span class="nv">future:</span>
      <span class="nv">one: </span><span class="s">"You might have 1 message"</span>
</pre>
</div>


<h2>Helpers</h2>

<p>Since all of the controller/routing code is available on the client, you can go directly through that system just like you would the server.</p>

<div class="highlight">
<pre><span class="c1"># Just request the url, and let it do it's thing</span>
<span class="nx">Tower</span><span class="p">.</span><span class="nx">get</span> <span class="s">'/posts'</span>

<span class="c1"># Same thing, this time passing parameters</span>
<span class="nx">Tower</span><span class="p">.</span><span class="nx">get</span> <span class="s">'/posts'</span><span class="p">,</span> <span class="nv">createdAt: </span><span class="s">"2011-10-26..2011-10-31"</span>

<span class="c1"># Dynamic</span>
<span class="nx">Tower</span><span class="p">.</span><span class="nx">urlFor</span><span class="p">(</span><span class="nx">Post</span><span class="p">.</span><span class="nx">first</span><span class="p">())</span> <span class="c1">#=&gt; "/posts/the-id"</span>
<span class="nx">Tower</span><span class="p">.</span><span class="nx">navigate</span> <span class="nx">Tower</span><span class="p">.</span><span class="nx">urlFor</span><span class="p">(</span><span class="nx">post</span><span class="p">)</span>
</pre>
</div>


<p>Those methods pass through the router and client-side middleware so you have access to <code>request</code> and <code>response</code> objects like you would on the server.</p>

<h2>Middleware</h2>

<p>It's built on <a href="http://github.com/sencha/connect">connect</a>, so you can use any of the middleware libs out there.</p>

<h2>Assets</h2>

<div class="highlight">
<pre><span class="c1"># config/assets.coffee</span>
<span class="nv">Tower.assets =</span>
  <span class="nv">javascripts:</span>
    <span class="nv">vendor: </span><span class="p">[</span>
      <span class="s">"/vendor/javascripts/jquery.js"</span>
      <span class="s">"/vendor/javascripts/underscore.js"</span>
      <span class="s">"/vendor/javascripts/socket.io"</span>
      <span class="s">"/vendor/javascripts/tower.js"</span>
    <span class="p">]</span>

    <span class="nv">lib: </span><span class="p">[</span>
      <span class="s">"/lib/grid.js"</span>
      <span class="s">"/lib/profiler.js"</span>
    <span class="p">]</span>

    <span class="nv">application: </span><span class="p">[</span>
      <span class="s">"/app/models/post.js"</span>
      <span class="s">"/app/models/comment.js"</span>
    <span class="p">]</span>

  <span class="nv">stylesheets:</span>
    <span class="nv">vendor: </span><span class="p">[</span>
      <span class="s">"/vendor/stylesheets/reset.css"</span>
    <span class="p">]</span>
    <span class="nv">application: </span><span class="p">[</span>
      <span class="s">"/app/assets/stylesheets/application.css"</span>
      <span class="s">"/app/assets/stylesheets/theme.css"</span>
    <span class="p">]</span>
</pre>
</div>


<p>All assets are read from <code>/public</code>, which is the compiled output of everything in <code>/app</code>, <code>/lib</code>, <code>/vendor</code>, and wherever else you might put things.  The default is to use stylus for css in <code>/app/assets/stylesheets</code>.</p>

<h3>Minify and Gzip</h3>

<div class="highlight">
<pre>cake assets:compile
</pre>
</div>


<h3>Push to S3</h3>

<div class="highlight">
<pre>cake assets:publish
</pre>
</div>


<h2>Test, Develop, Minify</h2>

<div class="highlight">
<pre>cake spec
cake coffee
cake minify
</pre>
</div>


<h2>License</h2>

<p>(The MIT License)</p>

<p>Copyright © 2012 <a href="http://twitter.com/viatropos">Lance Pollard</a> &lt;<a href="mailto:lancejpollard@gmail.com">lancejpollard@gmail.com</a>&gt;</p>

<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>

<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>

<p>THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
"""
