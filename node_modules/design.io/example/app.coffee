# npm install express connect jade coffee-script
express = require("express")
connect = require('connect')

app     = express.createServer()

app.listen(4182)

jade    = require("jade")

# Setup configuration
app.use express.static(__dirname)
app.use connect.bodyParser()
app.set 'view engine', 'jade'
app.set 'views', __dirname + '/views'

app.get '/', (req, res) ->
  res.render 'index.jade',
    title:    'Design.io Example'
    address:  app.settings.address
    port:     app.settings.port
    pretty:   true
