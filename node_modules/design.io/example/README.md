# Example App for Design.io

## Run it

First, make sure you have `design.io` installed:

```
npm install design.io
```

Then `cd` into the example project and start the basic node.js server:

```
git clone https://github.com/viatropos/design.io.git
cd design.io/example
npm install
node server.js
```

Finally, run the `design.io` command:

```
design.io --watch ./src
```

That `design.io --watch [directory]` command will watch a directory for changes and inject JavaScripts and StyleSheets into the LIVE example web app whenever you hit save.  It does it in a clean an optimized way.

So, edit the files in `./src` and watch the stuff in the page change in real time.
