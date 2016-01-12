import * as prettyLog from "../utils/pretty-log";
import jade from "jade";

import NotAllowedException from "../exception/not-allowed";
import NotFoundException from "../exception/notfound";

const VIEW_GENERAL = __dirname + "/../views/general-error.jade";
const VIEW_500 = __dirname + "/../views/500.jade";

export default function errorHandler() {
    return function* (next) {
        var err;

        try {
            yield next;
        } catch (e) {
            err = e;
        }

        if (this.status === 403) {
            this.type = "text/html; charset=UTF-8";
            this.body = jade.compileFile(VIEW_GENERAL)({
                title: "403 Forbidden",
                message: "Forbidden",
            });
        }

        if (this.status === 404) {
            this.type = "text/html; charset=UTF-8";
            this.body = jade.compileFile(VIEW_GENERAL)({
                title: "404 Not Found",
                message: "Your requested resource moved or removed."
            });
        }

        if (err) {
            this.type = "text/html; charset=UTF-8";
            this.status = 500;

            // prettyLog.error("Internal server error", err);

            let lines = err.stack.split("\n");
            let title = lines.shift();
            this.body = jade.compileFile(VIEW_500)({
                title : "500 // Internal Server Error",
                error: {
                    title : title,
                    stack : lines.map((item) => item.replace(/^[\s\t]+/g, ""))
                }
            });
        }

        return yield next;
    };
};
