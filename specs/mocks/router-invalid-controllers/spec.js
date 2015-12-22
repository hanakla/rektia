var Controller = require('../../../').Controller;

module.exports = Controller.create({
    index(req, res) {
        res.end("spec/index");
    }
});
