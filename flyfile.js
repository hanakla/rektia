const paths = {
    serverDist : "./lib/",
    binDist : "./lib/bin/",
    browserDistTmp : "./.tmp/",
    browserDist : "./",
}

export default function* () {
    yield this.watch("src-server/**/*", ["buildServer"]);
    yield this.watch("src-browser/**/*", ["buildBrowser"]);
}

export function* prePubulish() {
    yield this.start(["buildServer"]);
}

export function* buildServer() {
    yield this.start(["cleanServer", "babelServer", "jadeServer", "copyBin"]);
}

export function* buildBrowser() {
    yield this.start(["cleanBrowser", "babelBrowser"]);
}


// Browser side script tasks

export function* cleanBrowser() {
    yield this.clear(paths.browserDistTmp);
    yield this.clear(`${paths.browserDist}/maya.js`);
}

// export function* jadeServer() {
//     yield this
//         .source("src/**/*.jade")
//         // .jade({base: "src/views"})
//         .target(paths.serverDist);
// }

export function* babelBrowser() {
    yield this
        .source("src-browser/**/*.js")
        .babel({
            presets : [
                "es2015",
                "stage-3"
            ],
            plugins : [
                "add-module-exports"
            ]
        })
        .target(paths.browserDistTmp);

    yield this.source(`${paths.browserDistTmp}maya.js`)
        .browse()
        .uglify()
        // .notify({
        //     title : "Fly",
        //     message : "Compile successful."
        // })
        .target(paths.browserDist);
}

// Server side script tasks

export function* cleanServer() {
    yield this.clear(`${paths.serverDist}/**/*`);
}

export function* jadeServer() {
    yield this
        .source("src-server/**/*.jade")
        // .jade({base: "src/views"})
        .target(paths.serverDist);
}

export function* babelServer() {
    yield this
        .source("src-server/**/*.js")
        .babel({
            presets : [
                "es2015",
                "stage-3"
            ],
            plugins : [
                "add-module-exports"
            ]
        })
        // .notify({
        //     title : "Fly",
        //     message : "Compile successful."
        // })
        .target(paths.serverDist);
}

export function* copyBin() {
    yield this.source("src-server/bin/*")
        .target(paths.binDist);
}
