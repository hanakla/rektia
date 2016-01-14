var Controller = require('../../').Controller;

module.exports = Controller.create({
    // initialize & destruction

    _init() {
        maya.sockets.on("connect", this._onConnect, this);
    },

    _dispose() {
        // console.log(maya.sockets);
        maya.sockets.off("connect", this._onConnect, this);
    },

    // Socket event handlers

    _onConnect(socket) {
        console.log("socket connected");
        socket.join("rabbit-house");

        socket.receive("message", body => {
            maya.sockets.to("rabbit-house").emit("receive-message", {
                user : socket.id,
                body : body.message
            });
        });
    },

    // Request handler

    *index(ctx) {
        yield ctx.render("socket");
    },
});
