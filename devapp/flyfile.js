const source = {
    scripts : "./static/scripts/*",
    views : "./views/**/*",
    styles : "./static/styles/**/*.styl",
    css : "./static/styles/**/*.css",
    fonts : "./static/fonts/**/*",
    images : "./static/images/**/*"
};

// Compiled assets must export to `app/.tmp/**`
// maya.js is point to `app/.tmp/` as after compiled static content root.
const dest = {
    scripts : "./.tmp/scripts/",
    styles : "./.tmp/styles/",
    // css : "./.tmp/styles/",
    fonts : "./.tmp/fonts/",
    images : "./.tmp/images/"
}

//
// Entry tasks
//

export async function devel() {
    await this.watch([source.scripts, source.views], ["buildScripts"]);
    await this.watch([source.styles], ["clearStyleDest", "buildStyles"]);
    await this.watch([source.css], ["clearStyleDest", "copyStyles"]);
    await this.watch([source.fonts], ["copyFonts"]);
    await this.watch([source.images], ["copyImages"]);
};

export async function production() {
    await this.start(["buildScripts", "buildStyles", "copyFonts", "copyImages"] , {
        parallel : true
    });
}

//
// Build || Copy tasks below.
//

export async function buildScripts() {
    // exports path defined on `./config/webpack.js`
    await this.clear(dest.scripts);

    await this.source(source.scripts)
        .webpack(require("./config/webpack.js"));
}

export async function clearStyleDest() {
    await this.clear(dest.styles);
}

export async function buildStyles() {
    await this.source(source.styles)
        .stylus(require("./config/stylus.js"))
        .target(dest.styles);
}

export async function copyStyles() {
    await this.source(source.css)
        .target(dest.styles);
}

export async function copyFonts() {
    await this.clear(dest.fonts);

    await this.source(source.fonts)
        .target(dest.fonts);
}

export async function copyImages() {
    await this.clear(dest.images);

    await this.source(source.images)
        .target(dest.images);
}
