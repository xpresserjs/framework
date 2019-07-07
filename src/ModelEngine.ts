// @ts-check
import moment = require("moment");
import Objection = require("objection");
import ModelQueryBuilder = require("./Database/ModelQueryBuilder");
import {Xpresser} from "../global";

declare let _: any;
declare let $: Xpresser;

// @ts-ignore
class ModelEngine extends Objection.Model {

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
        const timestamp = moment(new Date().toISOString()).format($.config.database.timestampFormat);
        this.created_at = timestamp;
        this.updated_at = timestamp;
    }

    public $beforeUpdate(): void {
        this.updated_at = moment(new Date().toISOString()).format($.config.database.timestampFormat);
    }
}

export = ModelEngine;
