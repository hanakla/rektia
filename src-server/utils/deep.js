var hasOwnProperty = {}.hasOwnProperty;

export function get(obj, key, defaults) {
    if (key == null) {
        return obj;
    }

    var keys = key.split(".");
    var pt = obj;
    var current;

    while (current = keys.shift()) {
        if (keys.length !== 0 &&  (typeof pt !== "object" || ! hasOwnProperty.call(pt, current))) {
            return defaults;
        }

        pt = pt[current];
    }

    return pt;
}

export function set(obj, key, value) {
    var keys = key.split(".");
    var lastKey = keys.pop();
    var pt = obj;
    var current;

    while (current = keys.shift()) {
        if (typeof pt !== "object" || ! hasOwnProperty.call(pt, current)) {
            pt[current] = {};
        }
    }

    pt[lastKey] = value;
}
