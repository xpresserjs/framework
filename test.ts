import Xpresser = require("./index");

Xpresser({
    name: "TestXjsApp",
    paths: {
        base: __dirname + "/test",
        // backend: "base://",
        // Path with helpers
        routesFile: "base://routes.js",
        jsonConfigs: "base://",
        npm: __dirname + "/node_modules",

        // dev purpose only
        engine: "base://../src",
    },
    database: {
        startOnBoot: true,
        config: {
            client: "sqlite",
            connection: {
                filename: __dirname + "database.sqlite",
            },
            migrations: {
                tableName: "migrations",
            },
            useNullAsDefault: true,
        },
    },
});
