var Controller = require('../../').Controller;

module.exports = Controller.create({
    *index(ctx) {
        // ctx.type = "text/html; charset=UTF-8";
        yield ctx.render("hello.jade");
    }
});
