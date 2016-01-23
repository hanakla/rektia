const {join} = require("path");
const {spawn, spawnSync} = require("child_process");
const fs = require("fs-plus");
const glob = require("glob");

const cliEntry = require("../lib/cli/entry");
const cliInit = require("../lib/cli/init");

const mayaAsync = (args, options) => {
    var mayaBin = __dirname + "/../lib/bin/maya";
    return spawn(mayaBin, args, options);
};

const mayaSync = (args, options) => {
    var mayaBin = __dirname + "/../lib/bin/maya";
    return spawnSync(mayaBin, args, options);
};

describe("cli test", () => {

    describe("cli (without command)", () => {
        it("should show help if no arguments", () => {
            const process = mayaSync([]);
            expect(process.status).to.be(0);
            expect(process.stdout.toString().trim("\n")).to.be("Usage :\n    maya <command> [<options>...]\n\nCommands :\n    cqc\t\t\tStart maya.js server.\n    export\t\tExport maya.js components for other libraries.\n    generate(g)\t\tGenerate some components\n    help\t\tShow this help");
        });

        it("should show unknown command message with unknown command", () => {
            const process = mayaSync(["unknown"]);
            expect(process.status).to.be(0);
            expect(process.stdout.toString().trim("\n")).to.match(new RegExp("^\u001b\\[31mCommand not found : unknown\u001b\\[m\n"));
        });

        it("`_isValidMayaProject` correctry validate valid maya.js project", () => {
            const path = join(__dirname, "../devapp/");
            const result = cliEntry._isValidMayaProject(path);
            expect(result).to.be.ok();
        });

        it("`_isValidMayaProject` correctry validate invalid maya.js project", () => {
            expect(cliEntry._isValidMayaProject(__dirname)).to.not.be(true);
            expect(cliEntry._isValidMayaProject(__dirname)).to.be("PACKAGE_JSON_NOT_FOUND");
        });
    });

    describe("cli init", () => {
        it("`maya init` correcty copies boilerplate", () => {
            const globOption = {ignore: "**/.DS_Store", nodir: true};
            const boilerplateRoot = join(__dirname, "../boilerplate");
            const initRoot = join(__dirname, ".tmp/cli-init-test");

            fs.makeTreeSync(initRoot);
            cliInit._copyBoilerplate(initRoot);

            const copyFrom = glob.sync(boilerplateRoot + "/**/{*,.gitkeep,.gitignore}", globOption).map(path => {
                return path.replace(boilerplateRoot, "");
            });

            const copiedTo = glob.sync(initRoot + "/**/{*,.gitkeep,.gitignore}", globOption).map(path => {
                return path.replace(initRoot, "");
            });

            expect(copiedTo).to.eql(copyFrom);
            fs.removeSync(initRoot);
        });

        it("`maya init` should not running if any options taked", next => {
            const spy = sinon.spy();

            const exit = () => {
                expect(spy.called).to.be.ok();
                next();
            };

            const process = mayaAsync(["init", "--arg"], {cwd: __dirname});
            process.on("exit", spy);
            process.on("exit", exit);
        });
    });


    describe("cli cqc", () => {
        it("`maya cqc` should running on maya.js project dir", next => {
            const exit = sinon.spy();
            const process = mayaAsync(["cqc"], {cwd: join(__dirname, "../devapp/")});
            process.on("exit", exit);

            setTimeout(() => {
                expect(exit.called).to.not.be.ok();
                process.kill();
                next();
            }, 1000);
        });

        it("`maya cqc` should not running on no maya.js project dir", next => {
            const exit = sinon.spy(() => {
                expect(exit.called).to.be.ok();
                next();
            });

            const process = mayaAsync(["cqc"], {cwd: __dirname});
            process.on("exit", exit);
        });
    });
});
