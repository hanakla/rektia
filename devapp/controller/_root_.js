const Controller = require('../../').Controller;

module.exports = Controller.create({
    // Normal

    *index(ctx) {
        // console.log("hi");
        // console.log(ctx.render("index"));
        yield ctx.render("index");
    },

    // Session

    *session(ctx) {
        ctx.session.views = ctx.session.views || 0;
        ctx.session.views++;

        ctx.type = "text/html; charset=UTF-8";
        ctx.body = `You are viewing this page ${ctx.session.views} times in current session!`;
    },

    // Yield

    *yield(ctx) {
        const message = yield new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("this message passed with yield* (*゜ᴗ ゜*)");
            }, 1000);
        });

        ctx.type ="text/html; charset=UTF-8";
        ctx.body = message;
    },

    // File uploading

    *upload(ctx) {
        yield ctx.render("upload");
    },

    post_upload(ctx) {
        console.log(ctx.request, ctx.req);
        console.log(ctx.request.body.files);
        // req.file("file").upload(function (err, file) {
        //     ctx.end(file.toString());
        //     console.log(file);
        // });
    },

    // Error raising

    "403"(ctx) {
        ctx.status = 403;
    },

    error(ctx) {
        throw new Error("Handled correctry?");
    },

    *socket(ctx) {
        yield ctx.render("socket");
        // maya.sockets.join
    },

    // Custom response

    json(ctx) {
        ctx.set({"Content-Type":  "application/json"});
        ctx.body = {"its": "response json"};
        // console.log(ctx.maya);
    },

    plain(ctx) {
        ctx.type = "text/plain; charset=UTF-8";
        ctx.body = "plain";
    },

    // Private method (not directly routed)

    _private(ctx) {
        ctx.type = "text/html; charset=UTF-8";
        ctx.body =  "Correctry called private method via routes.js";
    },

    lang(ctx) {
        // console.log(req.getLocale());
    }
});
