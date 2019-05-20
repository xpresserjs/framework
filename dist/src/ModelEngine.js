"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// @ts-check
const moment = require("moment");
const objection_1 = require("objection");
const ModelQueryBuilder_1 = __importDefault(require("./database/ModelQueryBuilder"));
// @ts-ignore
class ModelEngine extends objection_1.Model {
    static get QueryBuilder() {
        return ModelQueryBuilder_1.default;
    }
    $formatJson(json) {
        return _.omit(json, this.$hidden);
    }
    $beforeInsert() {
        const timestamp = moment(new Date().toISOString()).format($.config.database.timestampFormat);
        this.created_at = timestamp;
        this.updated_at = timestamp;
    }
    $beforeUpdate() {
        this.updated_at = moment(new Date().toISOString()).format($.config.database.timestampFormat);
    }
}
module.exports = ModelEngine;
//# sourceMappingURL=ModelEngine.js.map