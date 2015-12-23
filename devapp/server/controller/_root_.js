var Controller = require('../../../').Controller;

module.exports = Controller.create({
    index(req, res) {
        res.render("index");
    }
});
