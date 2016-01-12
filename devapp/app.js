const path = require("path");
const Maya = require("../").Maya;
const InMemorySessionStore = require("../").InMemorySessionStore;

// Middlewares
const koaViews = require("koa-views");
const koaStatic = require("koa-static");
const koaBody = require("koa-short-body");
const session = require("koa-generic-session");


// If you want to use some loader(babel, coffeescript, etc...)
// Write requre register here. (and install using module via `npm`)
// require("babel-register");
// require("coffee-script/register");



const appRoot = __dirname;
const options = Maya.parseArgs(process.argv.slice(2));
const app = new Maya(Object.assign(options, {
    appRoot: appRoot,
}));


// If you want to use middleware.
// Write `app.use(middleware)` here.
app.keys = [app.config.get("session.secret")];
app.use(session({
    key : app.config.get("session.cookieName"),
    store : new InMemorySessionStore(),
    cookie: {
        path : "/",
        signed : true,
        httpOnly : true,
        rewrite : true,
    }
}));

app.use(koaBody({
    formLimit : "5m",
    multipart : true,
}));

app.use(koaViews(path.join(appRoot, "views/"), {
    default : "jade",
    map : {
        "jade" : "jade"
    }
}));

app.use(koaStatic(path.join(appRoot, ".tmp/static/"), {
    maxage: 0,
}));

// Running application
app.start();
