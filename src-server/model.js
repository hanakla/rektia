import _ from "lodash";
import Waterline from "waterline";

import extend from "./utils/extend";
import Swappable from "./swappable";

export default class Model extends Swappable
{
    static create(proto) {
        const Child = extend(proto, Model);
        return new Child();
    }

    /**
     * @property {}
     */

    /**
     * Transform Model to Waterline.Collection
     * @param {Object} props method and properties for assignes collection.attributes
     * @param {Object} staticProps method and properties for assignes collection (static).
     * @return {Waterline.Collection}
     */
    toWaterlineCollection(props = {}, staticProps = {}) {
        const schema = {};

        _.defaults(schema, {
            identity : this.identity,
            schema : this.schema,
            tableName : this.tableName,
            connection : this.connection,
            attributes : this.attributes,
        }, {
            identity : staticProps.identity,
            schema : null,
            tableName : null,
            connection : "default",
            attributes : {}
        });

        delete staticProps.identity;

        _.extend(schema.attributes, props);
        _.extend(schema, staticProps);

        return Waterline.Collection.extend(schema);
    }
}
