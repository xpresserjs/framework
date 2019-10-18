"use strict";
// @ts-check
const moment = require("moment");
const { Model } = require("objection");
const ModelQueryBuilder = require("./Database/ModelQueryBuilder");
if ($.config.database.startOnBoot) {
    Model.knex($.db.knex);
}
// @ts-ignore
class ModelEngine extends Model {
    static get QueryBuilder() {
        return ModelQueryBuilder;
    }
    $formatJson(json) {
        return _.omit(json, this.$hidden);
    }
    $beforeInsert() {
        let shouldUpdate = true;
        if (typeof this.$timestamps === "boolean") {
            shouldUpdate = this.$timestamps;
        }
        if (shouldUpdate) {
            const timestamp = moment(new Date().toISOString()).format($.config.database.timestampFormat);
            this.created_at = timestamp;
            this.updated_at = timestamp;
        }
    }
    $beforeUpdate() {
        let shouldUpdate = true;
        if (typeof this.$timestamps === "boolean") {
            shouldUpdate = this.$timestamps;
        }
        if (shouldUpdate) {
            this.updated_at = moment(new Date().toISOString()).format($.config.database.timestampFormat);
        }
    }
}
module.exports = ModelEngine;
