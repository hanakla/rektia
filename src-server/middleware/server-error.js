import * as prettyLog from "../utils/pretty-log"
import jade from "jade"

import NotAllowedException from "../exception/not-allowed";
import NotFoundException from "../exception/notfound";

const VIEW_403 = __dirname + "/../views/403.jade";
const VIEW_404 = __dirname + "/../views/404.jade";
const VIEW_500 = __dirname + "/../views/500.jade";

export default function errorHandler() {
    return (err, req, res, next) => {
        var template, statusCode;

        if (err instanceof NotAllowedException) {
            statusCode = 404;
            template = jade.compileFile(VIEW_403);
        }
        else if (err instanceof NotFoundException) {
            statusCode = 404;
            template = jade.compileFile(VIEW_404);
        }
        else {
            statusCode = 500;
            template = jade.compileFile(VIEW_500);
            prettyLog.error("Internal server error", err);
        }

        var lines = err.stack.split("\n");

        if (res.finished === false) {
            res.status(statusCode)
                .contentType("text/html; charset=UTF-8")
                .send(template({
                    error: {
                        title : lines.shift(),
                        stack : lines.map((item) => item.replace(/^[\s\t]+/g, ""))
                    }
                }));

            res.end();
        }

        next();
    };
};
