// This config will loading when maya.js running on "test" environment.
module.exports = {
    connections : {
        default : {
            adapter     : "mysql",
            host        : "localhost",
            user        : "",
            password    : "",
            database    : ""
        }
    },

    defaults : {
        migration : 'safe',
    }
};
