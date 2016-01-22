var RestController = require('../../../').RestController;

module.exports = RestController.create({
    _model : "User",

    *create(ctx) {
        try {
            const model = yield this.model.create({displayId: "wai"});
            ctx.body = model;
        }
        catch (e) {
            yield this._handleError(ctx, e);
        }
    }
});
