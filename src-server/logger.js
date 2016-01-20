import _ from "lodash";
import Emitter from "eventemitter3";
import util from "util";

const logLevel = {
    "silly"     : {
        level: 0,
        logger: console.log.bind(console),
        label: "\u001b[37m[%s] \u001b[m",
        color: "\u001b[37m",
    },
    "verbose"   : {
        level: 1,
        logger: console.log.bind(console),
        label: "[%s] ",
        color: "",
    },
    "info"      : {
        level: 3,
        logger: console.info.bind(console),
        label: "\u001b[36;1m[%s] \u001b[m",
        color: "\u001b[36m",
    },
    "debug"     : {
        level: 2,
        logger: console.info.bind(console),
        label: "\u001b[32;1m[%s] \u001b[m",
        color: "\u001b[32m",
    },
    "warn"      : {
        level: 4,
        logger: console.error.bind(console),
        label: "\u001b[33;1m[%s] \u001b[m",
        color: "\u001b[33m",
    },
    "error"     : {
        level: 5,
        logger: console.error.bind(console),
        label: "\u001b[31;1m[%s] \u001b[m",
        color: "\u001b[31m",
    },
};

export default class Logger extends Emitter {
    static get logLevel() {
        return logLevel;
    }

    /**
     * @class Logger
     * @constructor
     * @param {Object} options
     * @param {Number} options.logLevel logging level (log specified level or more)
     * @param {Boolean} options.paused Pause log printing.
     */
    constructor(options) {
        super();

        this.options = _.defaults({}, options, {
            logLevel : logLevel.info.level,
            paused : false,
        });

        this._buffer = [];

        Object.keys(logLevel).forEach((logType) => {
            const logger = logLevel[logType].logger;
            const labeler = logLevel[logType].label;
            const color = logLevel[logType].color;
            const level = logLevel[logType].level;

            this[logType] = (label, message, ...more) => {
                if (level < this.options.logLevel) { return; }

                const logLabel = util.format(labeler, label);
                const logMessage = util.format(message, ...more);

                if (this.options.paused) {
                    this._buffer.push({logger, level, message: logLabel + logMessage});
                }
                else {
                    logger(logLabel + logMessage);
                }

                this.emit("log", {
                    type: logType,
                    level,
                    label: label,
                    message : plainMessage
                });
            };
        });
    }

    setLogLevel(level) {
        if (typeof level === "string") {
            this.options.logLevel = logLevel[level].level;
        }
        else if (typeof level === "number") {
            this.options.logLevel = level;
        }
    }

    /**
     * Pause error printing (not "log" event emitting)
     */
    pause() {
        this.options.paused = true;
    }

    /**
     * Resume error printing
     */
    resume() {
        this.options.paused = false;
        this._buffer.forEach(logItem => {
            if (logItem.level < this.options.logLevel) { return; }
            logItem.logger(logItem.message)
        });
    }
}
