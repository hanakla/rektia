const fs = require("fs");
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
                "stage-3"
            ],
            plugins : [
                "transform-es2015-arrow-functions",
                "transform-es2015-block-scoped-functions",
                "transform-es2015-block-scoping",
                "transform-es2015-classes",
                "transform-es2015-computed-properties",
                "transform-es2015-destructuring",
                "transform-es2015-for-of",
                "transform-es2015-function-name",
                "transform-es2015-literals",
                "transform-es2015-modules-commonjs",
                "transform-es2015-object-super",
                "transform-es2015-parameters",
                "transform-es2015-shorthand-properties",
                "transform-es2015-spread",
                "transform-es2015-sticky-regex",
                "transform-es2015-template-literals",
                "transform-es2015-typeof-symbol",
                "transform-es2015-unicode-regex",
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
                "stage-3",
            ],
            plugins : [
                "add-module-exports",
                "transform-es2015-arrow-functions",
                "transform-es2015-block-scoped-functions",
                "transform-es2015-block-scoping",
                "transform-es2015-classes",
                "transform-es2015-computed-properties",
                "transform-es2015-destructuring",
                "transform-es2015-for-of",
                "transform-es2015-function-name",
                "transform-es2015-literals",
                "transform-es2015-modules-commonjs",
                "transform-es2015-object-super",
                "transform-es2015-parameters",
                "transform-es2015-shorthand-properties",
                "transform-es2015-spread",
                "transform-es2015-sticky-regex",
                "transform-es2015-template-literals",
                "transform-es2015-typeof-symbol",
                "transform-es2015-unicode-regex",
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

    yield new Promise((resolve, reject) => {
        fs.chmod(paths.binDist + "maya", "0744", (err) => err ? reject(err) : resolve());
    });
}
