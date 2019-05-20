"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const knex_1 = __importDefault(require("knex"));
let Database;
try {
    Database = require($.basePath("config.js"));
}
catch (e) {
    $.logErrorAndExit(e.message);
}
console.log(Database);
class DB {
    constructor() {
        const database = Database[$.config.env];
        const databaseConfigIsValid = $.ovp.validate(database, {
            client: { must: true },
            connection: { checkDbConfig: true },
        });
        if (!databaseConfigIsValid) {
            process.exit();
        }
        try {
            this.knex = knex_1.default(Database[$.config.env]);
        }
        catch (e) {
            $.logAndExit(e);
        }
    }
    sql(arg) {
        if (arg == null) {
            return this.knex.queryBuilder();
        }
        return this.knex(arg);
    }
}
module.exports = DB;
//# sourceMappingURL=Db.js.map