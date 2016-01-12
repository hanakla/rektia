const Controller = require("maya").Controller;

module.exports = Controller.create({
    *index(ctx) {
        yield ctx.render("index");
    }
});
