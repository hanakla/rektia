import _ from "lodash";
import extend from "./utils/extend";
import Swappable from "./swappable";

export default class Controller extends Swappable {

    static create(proto) {
        const SubClass = extend(proto, Controller);
        const instance = new SubClass();

        if (_.isFunction(instance._init)) {
            instance._init();
        }

        return instance;
    }

    // _before() {}

    // _after() {}
}
