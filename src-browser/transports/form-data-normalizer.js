import urlParse from "url-parse"

function processData(inputs, ajaxOption) {
    var formData = new FromData();

    if (ajaxOption.processData === false) {
        return inputs;
    }

    if (typeof inputs === "string") {
        return inputs;
    }

    if (inputs instanceof FromData) {
        // FormData.getAll is now not available in some browsers (or flag required)
        // This is untouchable.
        // (https://developer.mozilla.org/en-US/docs/Web/API/FormData)
        return inputs;
    }

    if (typeof inputs === "object") {
        Object.keys(inputs).forEach((name) => {
            var value = inputs[name];

            if (Array.isArray(value)) {
                value.forEach((value) => { formData.append(name, value); });
                return;
            }

            formData.append(name, inputs[name]);
        });
    }

    return formData;
}

function hasBinaryData(values) {
    var hasBinary = false;

    if (Array.isArray(values)) {
        Array.forEach((data) => { hasBinary = hasBinary || isBinaryData(data); });
    }
    else if (typeof values === "object") {
        Object.keys(values).forEach((key) => {
            var value = values[key];
            hasBinary = hasBinary || (isBinaryData(value) || hasBinaryData(value));
        });
    }

    return hasBinary;
}

function isBinaryData(data) {
    return data instanceof Blob || data instanceof File || data instanceof ArrayBuffer;
}

function queryToObject(string) {
    var url = urlParse(string);
    return url.query;
}

function objectToQueryParameter(obj) {
    if (typeof obj === "string") {
        return obj;
    }

    var params = [];

    Object.keys(obj).forEach((key) => {
        var value = obj[key];
        params.push([encodeURIComponent(key), "=", encodeURIComponent(value)].join(""));
    });

    return params.join("&");
}

export {processData, hasBinaryData, isBinaryData, objectToQueryParameter};
