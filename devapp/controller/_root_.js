var Controller = require('../../').Controller;

module.exports = Controller.create({
    index(req, res) {
        res.render("index");
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
    }
});
