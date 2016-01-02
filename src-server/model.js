import _ from "lodash";
import Waterline from "waterline";

import extend from "./utils/extend";
import Swappable from "./swappable";

export default class Model extends Swappable
{
    static create(proto) {
        Model._setDefaults(proto);

        const child = extend(proto, Model);
        _.extend(child.prototype, Object.getPrototypeOf(Waterline.Collection.prototype));

        return child;
    }

    static _setDefaults(proto) {
        proto.connection == null && (proto.connection = "default");
    }

    constructor(waterline, connections, cb) {
        super();
        Waterline.Collection.call(this, waterline, connections, cb);
    }
}
