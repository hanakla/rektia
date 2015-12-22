export default class Ajax {
    static send(options) {
        var promise = {};
        promise.promise = new Promise((resolve, reject) => {
            promise.resolve = resolve;
            promise.reject = reject;
        });

        var xhr = new XMLHttpRequest();

        xhr.open(options.method, options.url, true, options.username, options.password);

        if (options.headers) {
            let headers = options.headers;

            Object.keys(headers).forEach((key) => {
                if (Array.isArray(headers[key])) {
                    headers[key].forEach((value) => {
                        xhr.setRequestHeader(key, value);
                    })

                    return;
                }

                xhr.setRequestHeader(key, headers[key]);
            });
        }

        if (options.timeout != null) {
            xhr.timeout = options.timeout;
            xhr.ontimeout = e => promise.reject(e);
        }

        if (options.contentType) {
            xhr.setRequestHeader("Content-Type", options.contentType);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                console.log(xhr);
                resolve(xhr);
            }
        };
        xhr.send()

        return promise.promise;
    }
}
