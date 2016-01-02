module.exports = {
    adapters : {
        // Choose using adapter.
        // And execute `npm i --save <required-adaptor-module-name>`
        // e.g. use `disk` adapter, execute `npm i --save sails-disk` on shell.

        // disk : require("sails-disk"),
        memory : require("sails-memory"),
        // mysql : require("sails-mysql"),
        // postgresql : require("sails-postgresql"),
        // mongo : require("sails-mongo"),
        // redis : require("sails-redis")
    },

    // `connections` loading from environment configure.
    // connections : {},

    defaults : {
        // --- from http://sailsjs.org/documentation/concepts/models-and-orm/model-settings#migrate
        // safe - never auto-migrate my database(s). I will do it myself (by hand)
        // alter - auto-migrate, but attempt to keep my existing data (experimental)
        // drop - wipe/drop ALL my data and rebuild models every time I lift Sails
        migration : 'safe',
    },
};
