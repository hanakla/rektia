var Maya = require("../").Maya;

var options = Maya.parseArgs(process.argv.slice(2));
var app = new Maya(Object.assign(options, {
    appRoot: process.cwd()
}));

// If you want to use middleware.
// Write `app.use(middleware)` here.

app.start();
