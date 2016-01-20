import _ from "lodash";
import co from "co";
import Waterline from "waterline";

import extend from "./utils/extend";
import Swappable from "./swappable";
import ValidationError from "./exception/validation-error";

export default class Model extends Swappable
{
    static create(proto) {
        const Child = extend(proto, Model);
        return new Child();
    }

    /**
     * @property {Object} attributes Attributes definition
     */

    /**
     * Transform Model to Waterline.Collection
     * @param {Object} props method and properties for assignes collection.attributes
     * @param {Object} staticProps method and properties for assignes collection (static).
     * @param {Wildgeese} validator
     * @return {Waterline.Collection}
     */
    toWaterlineCollection(props = {}, staticProps = {}, validator) {
        const attributes = _.cloneDeep(this.attributes);

        // make validator field set
        const fieldSet = this._makeValidatorFieldSet(validator, attributes);

        // deletion `rules` for waterline(waterline doesn't support `rules` property)
        _.each(attributes, attr => { delete attr.rules; });

        const schema = _.defaults({}, {
            identity : this.identity,
            schema : this.schema,
            tableName : this.tableName,
            connection : this.connection,
            attributes : attributes,
        }, {
            identity : staticProps.identity,
            schema : null,
            tableName : null,
            connection : "default",
            attributes : {}
        });

        // staticProps.identity is already applied in above.
        delete staticProps.identity;

        // assign instance methods
        _.assign(schema.attributes, props);

        // assign static methods
        _.assign(schema, staticProps);

        // assign waterline's lifecycle callbacks
        _.assign(schema, {
            // Override waterline validate
            validate: function (values, presentOnly, callback) {
                fieldSet.validate(values, presentOnly)
                    .then(fails => {
                        if (fails) {
                            const error = new ValidationError(fails);
                            return callback(error);
                        }
                        callback();
                    })
                    .catch(callback);
            },

            //-- Logic methods are wrapped by "`this` to first argument wrapper"
            beforeValidate: _.isFunction(staticProps.beforeValidate) ? function (values, next) {
                co(staticProps.beforeValidate.call(values))
                    .then(function () { next(); }, next);
            } : null,
            afterValidate: _.isFunction(staticProps.afterValidate) ? function (values, next) {
                co(staticProps.afterValidate.call(values))
                    .then(function () { next(); }, next);
            } : null,

            beforeCreate: _.isFunction(staticProps.beforeCreate) ? function (values, next) {
                co(staticProps.beforeCreate.call(values))
                    .then(function () { next(); }, next);
            } : null,
            afterCreate: _.isFunction(staticProps.afterCreate) ? function (values, next) {
                co(staticProps.afterCreate.call(values))
                    .then(function () { next(); }, next);
            } : null,

            beforeUpdate: _.isFunction(staticProps.beforeUpdate) ? function (values, next) {
                co(staticProps.beforeUpdate.call(values))
                    .then(function () { next(); }, next);
            } : null,
            afterUpdate: _.isFunction(staticProps.afterUpdate) ? function (model, next) {
                co(staticProps.afterUpdate.call(model))
                    .then(function () { next(); }, next);
            } : null,

            beforeDestroy: _.isFunction(staticProps.beforeDestroy) ? function (criteria, next) {
                co(staticProps.beforeDestroy.call(criteria))
                    .then(function () { next(); }, next);
            } : null,
            afterDestroy: _.isFunction(staticProps.afterDestroy) ? function (deletedModels, next) {
                co(staticProps.afterDestroy.call(deletedModels))
                    .then(function () { next(); }, next);
            } : null
        })

        return Waterline.Collection.extend(schema);
    }

    /**
     * @private
     * @param {Wildgeese} validator
     * @param {Object} attributes
     * @return {Wildgeese.FieldSet}
     */
    _makeValidatorFieldSet(validator, attributes) {
        const fieldSet = validator.makeFieldSet();
        _.each(attributes, (attr, fieldKey) => {
            fieldSet.add(fieldKey, attr.label || fieldKey, attr.rules || []);
        });

        return fieldSet;
    }
}
