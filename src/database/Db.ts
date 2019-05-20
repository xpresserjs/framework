import knex from "knex";
declare let $: any;


class DB {
    public knex: knex;

    constructor() {
        if (!$.$config.has("database.config")) {
            return;
        }
        const database = $.config.database.config;

        const databaseConfigIsValid = $.ovp.validate(database, {
            client: {must: true},
            connection: {checkDbConfig: true},
        });

        if (!databaseConfigIsValid) {
            process.exit();
        }

        try {
            this.knex = knex($.config.database.config);
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
