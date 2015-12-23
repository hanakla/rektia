var Controller = require('../../../').Controller;

module.exports = Controller.create({
    index(req, res) {
        res.render("index");
    },

    _private(req, res) {
        res
            .type("text/html; charset=UTF-8")
            .end("Correctry called private method via routes.js");
    }
});
