"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
index_1.default({
    name: "RedEye",
    paths: {
        base: __dirname,
        npm: "base://node_modules",
    },
});
/*Xpresser({
    name: "TestXjsApp",
    paths: {
        base: __dirname + "/test",
        backend: "base://",
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
                filename: __dirname + "/test/database.sqlite",
            },
            migrations: {
                tableName: "migrations",
            },
            useNullAsDefault: true,
        },
    },
});*/
//# sourceMappingURL=test.js.map