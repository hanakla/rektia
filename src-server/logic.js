import _ from "lodash";
import extend from "./utils/extend";

export default class Logic {
    static create(proto) {
        const SubClass = extend(proto, Controller);
        const instance = new SubClass();

        if (_.isFunction(instance._init)) {
            instance._init();
        }

        return instance;
    }
}
