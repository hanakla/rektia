const io = require("socket.io");
const socket = io.connect();

// export to global
window.io = io;
window.socket = socket;

socket.on("connect", () => {
    console.log("socket connected!", socket);
});
