
Welcome to an introduction on Tower.

We'll briefly look at each major component within Tower's stack and examine each of their uses, features and why you'd use it.

Before we begin, let's first take a look at how Tower's built.
Tower is composed of many small, independent modules. These modules are focused, and does one thing, and does it right.


```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <div data-list="user in users [buffer: 2, max: 10] | filter: isAdmin() | sort: alpha(user.firstname)"></div>
  </body>
</html>
```

```js
var tower = require('tower');

route('/', 'root')
  .action(function(content){
    content.render('index');
  });

```
