import g from 'gulp'
import rmfr from 'rmfr'
import fs from 'fs'
import webpack from 'webpack'
import pug from 'gulp-pug'
import {spawn} from 'child_process'

const paths = {
    serverDist : "./lib/",
    binDist : "./lib/bin/",
    browserDistTmp : "./.tmp/",
    browserDist : "./",
}

// Server side script tasks
const compileJade = () =>
    g.src("src-server/**/*.jade")
        .pipe(pug())
        .dest(paths.serverDist)

export function compileServerCode() {
    const proc = spawn(`${__dirname}/node_modules/.bin/tsc`, ['--watch', 'src-server/index.ts'], {stdio: 'inherit'})
}

export async function copyBin() {
    await g.src("src-server/bin/*").target(paths.binDist)

    await new Promise((resolve, reject) => {
        fs.chmod(paths.binDist + "maya", "0744", (err) => err ? reject(err) : resolve());
    });
}

const cleanServer = () => rmfr(`${paths.serverDist}/**/*`)
const buildServer = g.series(cleanServer, compileServerCode, copyBin)
const prePubulish = g.series(buildServer)

export {buildServer, prePubulish, cleanServer, compileJade}
export default g.series(buildServer)
