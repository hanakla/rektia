"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const pluralize = require("pluralize");
exports.tableNameFromModel = (model) => {
    return model.tableName || _.snakeCase(pluralize.plural(model.name));
};
