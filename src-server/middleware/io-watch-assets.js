export default function ioWatchAssets() {
    return (socket, next) => {
        // join socket into maya.js messaging room.
        socket.join("__maya__");
        next();
    };
}
