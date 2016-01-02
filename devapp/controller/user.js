var Controller = require('../../').Controller;

module.exports = Controller.create({
    *index(req, res) {
        const user = yield maya.models.User.create({displayId: "wai"});
        res.json(user);
    }
});
