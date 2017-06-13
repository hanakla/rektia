module.exports = {
    // Logic method's first arguments passing target Model

    //
    // Static methods define into `static` property
    //
    static : {
        //
        // lifecycle callbacks
        //

        beforeValidate(values) {
            // console.log("beforeValidate", values, values.__proto__, values.__proto__.__proto__);
        },
        afterValidate(values) {
            // console.log("afterValidate", values, values.__proto__, values.__proto__.__proto__);
        },

        beforeCreate(values) {
            // console.log("beforeCreate", values, values.__proto__, values.__proto__.__proto__);
        },
        afterCreate(model) {
            // console.log("afterCreate", model, model.__proto__, model.__proto__.__proto__);
        },

        beforeUpdate(values) {
            // console.log("beforeUpdate", values, values.__proto__, values.__proto__.__proto__);
        },
        afterUpdate(values) {
            // console.log("afterUpdate", values, values.__proto__, values.__proto__.__proto__);
        },

        beforeDestroy(criteria) {
            // console.log("beforeDestroy", criteria, criteria.__proto__, criteria.__proto__.__proto__);
        },
        afterDestroy(destroyedModels) {
            // console.log("afterDestroy", destroyedModels[0], destroyedModels[0].__proto__, destroyedModels[0].__proto__.__proto__);
        }
    },

    //
    // Model instance methods defined in under the `exports`
    //

    /**
     * @param {maya.models.User} model
     */
    getDisplayId(model) {
        return model.displayId;
    },

};
