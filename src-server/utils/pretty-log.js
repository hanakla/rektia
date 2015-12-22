import path from "path"
import * as stackTrace from "stack-trace";

export function error(title, error) {
    var stackList = stackTrace.parse(error);
    var basePath = process.cwd();

    var stringifyStack = stackList.map((stack, idx) => {
        var methodName = stack.methodName ? stack.methodName : stack.functionName;
        var fileName = stack.fileName ? path.parse(stack.fileName).base : "";
        var filePath = stack.fileName ? stack.fileName.replace(basePath, "") : "";

        if (stack.native) {
            return `\u001b[31;1m  #${stackList.length - idx} ${stack.functionName} \u001b[m\u001b[31m(native)\n`
                + `\u001b[34m    at Line: ${stack.lineNumber} Column: ${stack.columnNumber}`;
        }
        else {
            return `\u001b[31;1m  #${stackList.length - idx} ${fileName} \u001b[m\u001b[31m(${filePath})\n`
                + `\u001b[34m    at ${methodName}(${stack.typeName})`
                + `\tLine: ${stack.lineNumber} Column: ${stack.columnNumber}`
        }
    }).join("\n");

    console.error(
        `\u001b[31m====== ${title}\n`
        + `Message\t\t:\n  \u001b[31;1m${error.message}\n`
        + `\u001b[m\u001b[31m`
        + `Stack trace\t:\n${stringifyStack}\n\u001b[31m`
        + "============\u001b[m\n"
    );
};
