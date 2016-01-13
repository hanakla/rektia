var Controller = require('../../').Controller;

module.exports = Controller.create({
    // initialize & destruction

    _init() {
        maya.sockets.on("connect", this._onConnect);
    },

    _dispose() {
        // console.log(maya.sockets);
        // maya.sockets.engine.removeListener("connect", this._onConnect);
    },

    // Socket event handlers

    _onConnect(socket) {
        console.log("socket connected");
        socket.join("rabbit-house");

        socket.on("message", body => {
            maya.sockets.to("rabbit-house").emit("receive-message", {
                user : socket.id,
                body : body.message
            });
        });
    },

    // Request handler

    *index(ctx) {
        yield ctx.render("socket");
        // maya.sockets.join
    },
});
