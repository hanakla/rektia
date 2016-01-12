const contentTypeMatcher = /^text\/html/;
const bodyEndMatcher = /<\/body>/m;

const injectScript = `
<script src="/socket.io/socket.io.js" defer async></script>
<script>
(function () {
    "use strict";

    console.info("%c[maya.js]%c Waiting for load socket.io.js", "background-color:#00c3ed; color:#fff", "");

    var intervalId = setInterval(function () {
        if (! window.io) { return; }
        clearInterval(intervalId);
        connect(window.io);
    }, 0);

    function connect(io) {
        var socket = io.connect();

        // use for resolve relative url to absolute url
        var aEl = document.createElement("a");

        socket.on("connect", function () {
            console.info("%c[maya.js]%c Start watching assets changes.", "background-color:#00bbe3; color:#fff", "");

            socket.on("__maya__.swap", function (change) {
                if (change.fileType !== "css") { return; }
                if (typeof document.querySelectorAll !== "function") { return; }

                aEl.href = change.fileUrl;

                var absoluteFileUrl = aEl.href;
                var targetElements = [].slice.call(document.querySelectorAll("link[rel='stylesheet']"), 0);
                targetElements.forEach(function (el) {
                    if (el.href.indexOf(absoluteFileUrl) === 0) {
                        el.href = absoluteFileUrl + "?" + Date.now();
                    }
                });
            });

            socket.on("__maya__.reload", function () {
                // no using location.reload() for skip form repost.
                location.href = location.href;
            });
        });
    }
}());
</script>
`;

export default function reloaderInjector() {
    return (req, res, next) => {
        const end = res.end;

        // Override res.end
        res.end = function (chunk, encoding) {
            if (! chunk) {
                end.call(this, chunk, encoding);
                return;
            }

            const contentType = this.get("content-type");

            // if response finished or content-type isn't "text/html"
            // send chunk as it is.
            if (this.finished) {
                return end.call(this, chunk, encoding);
            }

            if (contentTypeMatcher.test(contentType) === false) {
                return end.call(this, chunk, encoding);
            }

            // Inject script
            const body = chunk.toString(encoding);
            var injectedBody;
            var buffer;

            if (bodyEndMatcher.test(body)) {
                injectedBody = body.replace(bodyEndMatcher, `${injectScript}\n</body>`)
            }
            else {
                injectedBody = body + injectScript;
            }

            buffer = new Buffer(injectedBody, encoding);
            encoding = undefined;

            this.set("Content-Length", buffer.length);
            end.call(this, injectedBody, encoding);
        };

        res._end = end;
        next();
    };
}
