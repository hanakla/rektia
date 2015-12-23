module.exports = {
    index(req, res) {
        res
            .type("text/html; charset=UTF-8")
            .render("hello.jade");
    }
};
