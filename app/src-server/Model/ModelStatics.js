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
const RecordNotFonundException_1 = require("../Exceptions/RecordNotFonundException");
const ModelUtil = require("./ModelUtil");
class ModelStatics {
    static find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _this = this;
            const tableName = ModelUtil.tableNameFromModel(_this);
            const record = yield _this._knex.select().from(tableName).where('id', id).first();
            if (record == null) {
                throw new RecordNotFonundException_1.default(`Couldn't find ${tableName} with 'id'=${id}`);
            }
            return new _this(record, false);
        });
    }
    static findBy(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            const _this = this;
            const tableName = ModelUtil.tableNameFromModel(_this);
            const record = yield _this._knex.select().from(tableName).where(criteria).first();
            return record ? record : null;
        });
    }
}
exports.default = ModelStatics;
