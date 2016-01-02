const Model = require("../../").Model;

module.exports = Model.create({

    // set true, if using schema type database.
    schema : true,

    // Specify table name if you want.
    tableName : "user",

    // (optional) Using connection name
    // if omitted, use "default" connection as default.
    // if you want to use other (not "default") connection for this model,
    // set connection name to `connection`property.
    // (connection's defined in config/env/<environment>/database)
    connection : "default",

    // Field definition
    attributes : {
        // "field_name" : {
        //     type        : String,
        //     size        : Integer, // Optional
        //     defaultsTo  : Any, // Optional
        //     primaryKey  : Boolean, // Optional
        //     autoIncrement : Boolean, // Optional
        //     notNull     : Boolean, // Optional
        //     unique      : Boolean, // Optional
        //     index       : Boolean, // Optional
        //     enum        : Array<String>, // Required when `type` is "enum"
        //
        //     // Relational field settion(Optional)
        //     model : String, // Child model name (for one-one relation)
        //     collection : String, // Child model name (for one-many, many-many relation)
        //     via : String, // child field name for parent model primary key referecing.
        // }
        "id" : {
            type : "int",
            primaryKey : true,
            autoIncrement : true,
        },
        "displayId" : {
            type : "string",
            size : 60,
        }
    }
});
