var Controller = require('maya').Controller;

module.exports = Controller.create({
    index(req, res) {
        res.render("index");
    }
});
