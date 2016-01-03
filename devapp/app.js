var Maya = require("../").Maya;

var options = Maya.parseArgs(process.argv.slice(2));
var app = new Maya(Object.assign(options, {
    appRoot: process.cwd()
}));

// If you want to use middleware.
// Write `app.use(middleware)` here.
app.use(require("body-parser"));
app.use(require("cookie-parser"));
app.use(require("express-session")({
    resave : false,
    saveUninitialized : false,
    secret : app.config.get("session.secret"),
}));
app.use(require("method-override"));

app.start();
