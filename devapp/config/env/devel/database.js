// This config will loading when maya.js running on "devel" environment.
module.exports = {
    connections : {
        // define connections <connectionName : {Options}> pair.
        default : {
            adapter     : "memory",
            // Set your database host.
            host        : "localhost",
            // Set your database connection user.
            user        : "",
            // Set your database connection password.
            password    : "",
            // Set your connecting database name.
            database    : "",
        }
    },

    defaults : {
        // --- from http://sailsjs.org/documentation/concepts/models-and-orm/model-settings#migrate
        // safe - never auto-migrate my database(s). I will do it myself (by hand)
        // alter - auto-migrate, but attempt to keep my existing data (experimental)
        // drop - wipe/drop ALL my data and rebuild models every time I lift Sails
        migration : 'alter',
    }
};
