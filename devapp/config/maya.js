module.exports = {
    log : {
        // reporting log level.
        // log level: "error" is most higher level.
        // "error" > "warn" > "debug" > "info" > "verbose" > "silly"
        level : "silly"
    },

    server : {
        // Running on port 3000
        port : 3000,

        // static assets URL
        // it's must be start from "/"
        // static assets can accessing via "http(s)://your-domain/<staticUrl>"
        staticUrl : "/static",

        // if you use https, clear comment out from below code and remove `https: false`
        // and set path to files for `key`, `cert`.
        // https : {
        //     key : "",
        //     cert : ""
        // },
        https : false,
    },
};
