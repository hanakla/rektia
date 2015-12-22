import extend from "./utils/extend";
import Swappable from "./swappable";

export default class Controller extends Swappable {

    static create(proto) {
        var SubClass = extend(proto, Controller);
        return new SubClass();
    }

    // _before() {}

    // _after() {}
}
