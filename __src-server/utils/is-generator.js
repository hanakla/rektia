import _ from "lodash";

export default function isGenerator(value) {
    return _.isFunction(value.next) && _.isFunction(value.throw);
}
