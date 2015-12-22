import _ from "lodash";

/**
 * @function extend
 * @param {Object} SubClass SubClass constructor or prototype Object
 * @param {Function} SuperClass Constructor of super class
 */
export default function extend(proto, SuperClass) {
    var SubClass = typeof proto === "function" ? proto : function () {
        SuperClass.apply(this, arguments);
    };

    if (typeof proto === "function") {
        let _proto = SubClass.prototype;
        SubClass.prototype = Object.create(SuperClass.prototype);
        _.assign(SubClass.prototype, _proto);
    }
    else {
        SubClass.prototype = Object.create(SuperClass.prototype);
         _.assign(SubClass.prototype, proto);
     }

    return SubClass;
};
