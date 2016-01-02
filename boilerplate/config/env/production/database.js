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
