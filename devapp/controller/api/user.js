var RestController = require('../../../').RestController;

module.exports = RestController.create({
    _model : "User",

    *create(ctx) {
        ctx.body = yield this.model.create({displayId: "wai"});
    }
});
