var Maya = require("maya");

var options = Maya.App.parseArgs(process.argv.slice(2));
var app = new Maya.App(Object.assign(options, {
    appRoot: process.cwd()
}));

// If you want to use middleware.
// Write `app.use(middleware)` here.

app.start();
