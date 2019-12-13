// @ts-check
import moment = require("moment");

const {Model} = require("objection");
import ModelQueryBuilder = require("./Database/ModelQueryBuilder");
import {DollarSign} from "../xpresser";

declare const _: any;
declare const $: DollarSign;

if ($.config.database.startOnBoot) {
    Model.knex($.db.knex);
}

// @ts-ignore
class ModelEngine extends Model {

    static get QueryBuilder() {
        return ModelQueryBuilder;
    }

    // tslint:disable-next-line:variable-name
    public created_at: string;
    // tslint:disable-next-line:variable-name
    public updated_at: string;

    protected $hidden: string[];

    public $formatJson(json: any): any {
        return _.omit(json, this.$hidden);
    }

    public $beforeInsert(): void {
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

    public $beforeUpdate(): void {
        let shouldUpdate = true;
        if (typeof this.$timestamps === "boolean") {
            shouldUpdate = this.$timestamps;
        }

        if (shouldUpdate) {
            this.updated_at = moment(new Date().toISOString()).format($.config.database.timestampFormat);
        }
    }
}

export = ModelEngine;
