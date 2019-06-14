"use strict";
// @ts-check
const moment = require("moment");
const Objection = require("objection");
const ModelQueryBuilder = require("./Database/ModelQueryBuilder");
// @ts-ignore
class ModelEngine extends Objection.Model {
    static get QueryBuilder() {
        return ModelQueryBuilder;
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
