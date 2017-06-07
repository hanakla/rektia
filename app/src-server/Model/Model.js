"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ModelStatics_1 = require("./ModelStatics");
const ModelUtil = require("./ModelUtil");
class Model extends ModelStatics_1.default {
    constructor(fields = {}, isNew = true) {
        super();
        this._fields = fields;
        this._isNew = isNew;
    }
    get(field) {
        return null;
    }
    set(field, value) {
        const values = {};
        if (arguments.length == 1) {
            Object.assign(values, field);
        }
        else {
            values[field] = value;
        }
        Object.assign(this._fields, values);
        return this;
    }
    isValid() {
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const clazz = this.constructor;
            const tableName = ModelUtil.tableNameFromModel(this.constructor);
            const insertQuery = ModelStatics_1.default._knex.insert(this._fields).where('id', this._fields.id);
            const updateQuery = ModelStatics_1.default._knex.update(this._fields);
            // const query = `${insertQuery.toString()} ON DUPLICATE KEY UPDATE ${updateQuery.toString()}`
            // ._knex.table()
            if (this._isNew) {
                const [id] = yield ModelStatics_1.default._knex
                    .insert(this._fields)
                    .into(tableName)
                    .returning(clazz.primaryKey);
                this._fields.id = id;
                this._isNew = false;
            }
            else {
                yield ModelStatics_1.default._knex(tableName)
                    .update(this._fields)
                    .where({ id: this._fields.id });
            }
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
Model.primaryKey = 'id';
exports.default = Model;
// type P = {test: string};
// const m = new Model<P>()
// m.get('test')d
