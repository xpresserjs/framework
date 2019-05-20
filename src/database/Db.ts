import knex from "knex";

let Database: object;

try {
    Database = require($.basePath("config.js"));
} catch (e) {
    $.logErrorAndExit(e.message);
}

console.log(Database);

class DB {
    public knex: knex;

    constructor() {
        const database = Database[$.config.env];

        const databaseConfigIsValid = $.ovp.validate(database, {
            client: {must: true},
            connection: {checkDbConfig: true},
        });

        if (!databaseConfigIsValid) {
            process.exit();
        }

        try {
            this.knex = knex(Database[$.config.env]);
        } catch (e) {
            $.logAndExit(e);
        }
    }

    public sql(arg) {
        if (arg == null) {
            return this.knex.queryBuilder();
        }
        return this.knex(arg);
    }
}

export = DB;
