const _ = require("lodash");

const messageTemplate = _.template(`
    <small class="message-says"><%= message.user %></small>
    <div class="message-body"><%= message.body %></small>
`);

window.addEventListener("DOMContentLoaded", function () {
    const io = require("socket.io");
    const socket = io.connect();

    const messageList = document.getElementById("messageList");
    const messageInput = document.getElementById("messageInput");

    // export to global
    window.io = io;
    window.socket = socket;

    socket.on("connect", () => {
        console.log("socket connected!", socket);

        messageInput.addEventListener("keydown", e => {
            if (e.keyCode === 13 /* Enter */)  {
                socket.emit("message", {message: messageInput.value});
                messageInput.value = "";
            }
        });

        socket.on("receive-message", message => {
            const messageEl = document.createElement("li");
            messageEl.className = "message";
            messageEl.innerHTML = messageTemplate({message});
            messageList.appendChild(messageEl);
        });
    });
});
