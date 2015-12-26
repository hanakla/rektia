{join} = require "path"
{spawn, spawnSync} = require "child_process"
fs = require "fs-plus"
glob = require "glob"

cliEntry = require "../lib/cli/entry"
cliInit = require "../lib/cli/init"


mayaAsync = (args, options) ->
    mayaBin = __dirname + "/../lib/bin/maya"
    spawn(mayaBin, args, options)

mayaSync = (args, options) ->
    mayaBin = __dirname + "/../lib/bin/maya"
    spawnSync(mayaBin, args, options)

describe "cli test", ->
    describe "cli (without command)", ->
        it "should show help if no arguments", ->
            process = mayaSync([])

            process.status.should.equal 0
            process.stdout.toString().trim("\n").should.equal """
                Usage :
                    maya <command> [<options>...]

                Commands :
                    cqc\t\t\tStart maya.js server.
                    export\t\tExport maya.js components for other libraries.
                    generate(g)\t\tGenerate some components
                    help\t\tShow this help
            """


        it "should show unknown command message with unknown command", ->
            process = mayaSync(["unknown"])
            process.status.should.equal 0
            process.stdout.toString().trim("\n").should.match new RegExp("^\u001b\\[31mCommand not found : unknown\u001b\\[m\n")


        it "`_isValidMayaProject` correctry validate valid maya.js project", ->
            cliEntry._isValidMayaProject(join(__dirname, "../devapp/")).should.be.true()


        it "`_isValidMayaProject` correctry validate invalid maya.js project", ->
            cliEntry._isValidMayaProject(__dirname).should.not.true()


    describe "cli init", ->
        it "`maya init` correcty copies boilerplate", ->
            globOption = {ignore: "**/.DS_Store", }
            boilerplateRoot = join(__dirname, "../boilerplate")
            initRoot = join(__dirname, ".tmp/cli-init-test")

            fs.makeTreeSync initRoot
            cliInit._copyBoilerplate(initRoot)

            copyFrom = glob.sync("#{boilerplateRoot}/**/{*,.gitkeep,.gitignore}", globOption).map (path) -> path.replace(boilerplateRoot, "")
            copiedTo = glob.sync("#{initRoot}/**/{*,.gitkeep,.gitignore}", globOption).map (path) -> path.replace(initRoot, "")

            copiedTo.should.eql(copyFrom)
            fs.removeSync(initRoot)


    describe "cli cqc", ->
        it "`maya cqc` should running on maya.js project dir", (next)->
            exit = sinon.spy()

            process = mayaAsync(["cqc"] , {
                cwd : join(__dirname, "../devapp/")
                # stdio : "inherit"
            })
            process.on("exit", exit)

            setTimeout ->
                exit.called.should.be.false()
                process.kill()
                next()
            , 1000


        it "`maya cqc` should not running on no maya.js project dir", (next) ->
            exit = sinon.spy ->
                exit.called.should.be.true()
                next()

            process = mayaAsync(["cqc"] , {
                cwd : __dirname
                # stdio : "inherit"
            })
            process.on("exit", exit)

    # describe "cli generate", ->
    #     describe "controller", ->
