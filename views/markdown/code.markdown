
```javascript
var tower = require('tower'),
    model = require('tower-model'),
    route = require('tower-route');

model('user')
  .attr('username')
  .attr('password')
  .attr('email')
  .attr('token');

route('/users', 'root')
  .action(function(content){
    var user = model('user').all(function(err, records){
      
      if (err) throw err;

      content.respondWith('json', function(){
        content.send(records);
      });

      content.respondWith('html', function(){
        content.render('user.index', records);
      }); 

    }); 
  })

```
