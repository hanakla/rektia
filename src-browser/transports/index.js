import Ajax from "./ajax";
import Socket from "./socket";

import FormDataNormalizer from "./form-data-normalizer";

export default class Transport {
    static ajax(options) {
        var transporter;

        if (Socket.isAvailable()) {
            transporter = Socket;
        }
        else {
            transporter = Ajax;
        }

        return ransporter.send(options);
    }

    _normalizeArgs(...args) {
        var option = args[0];
        var normalizedOptions = {
            method      : "GET",
            url         : "",
            contentType : "application/x-www-form-urlencoded",
            headers     : {},
            dataType    : null,
            data        : null,
            processData : true
        };

        if (args.length === 1 && typeof option === "string") {
            normalizedOptions.url = option;
            return normalizedOptions;
        }

        if (normalizedOptions.processData === false) {
            return normalizedOptions;
        }

        if (normalizedOptions.data != null) {
            normalizedOptions.data = FormDataNormalizer.processData(normalizedOptions.data, normalizedOptions.processData);
        }

        if (normalizedOptions.data != null && (normalizedOptions.method === "GET" || normalizedOptions.method === "HEAD")) {
            normalizedOptions.url += "?" + FormDataNormalizer.objectToQueryParameter(normalizedOptions.data)
        }

        return normalizedOptions;
    }


    get(...option) {
        var options = this._normalizeArgs(...option);
        options.method = "get";
        return Transport.ajax(options);
    }

    post(...option) {
        var options = this._normalizeArgs(...option);
        options.method = "post";
        return Transport.ajax(options);
    }

    delete(...option) {
        var options = this._normalizeArgs(...option);
        options.method = "delete";
        return Transport.ajax(options);
    }

    put(...option) {
        var options = this._normalizeArgs(...option);
        options.method = "put";
        return Transport.ajax(options);
    }

    patch(...option) {
        var options = this._normalizeArgs(...option);
        options.method = "patch";
        return Transport.ajax(options);
    }
}
