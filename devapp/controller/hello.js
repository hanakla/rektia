var Controller = require('../../').Controller;

module.exports = Controller.create({
    index(req, res) {
        res
            .type("text/html; charset=UTF-8")
            .render("hello.jade");
    }
});
