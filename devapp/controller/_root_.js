var Controller = require('../../').Controller;

module.exports = Controller.create({
    index(req, res) {
        res.render("index");
    },

    *yield(req, res) {
        const message = yield new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("this message passed with yield* (*゜ᴗ ゜*)");
            }, 1000);
        });

        res.type("text/html; charset=UTF-8");
        res.end(message);
    },

    "403"(req, res) {
        throw new maya.NotAllowedException();
    },

    error(req, res) {
        throw new Error("Handled correctry?");
    },

    socket(req, res) {
        res.render("socket");
    },

    json(req, res) {
        res.json({"its": "response json"});
    },

    plain(req, res) {
        res.type("text/plain; charset=UTF-8").write("plain");
    },

    _private(req, res) {
        res
            .type("text/html; charset=UTF-8")
            .end("Correctry called private method via routes.js");
    },

    lang(req, res) {
        console.log(req.getLocale());
        res.end();
    }
});
