import Xpresser = require("./index");

Xpresser({
    name: "TestXjsApp",
    paths: {
        base: __dirname + "/test",
        // Path with helpers
        routesFile: "base://routes.js",
        controllers: "base://",
        views: "base://",
        jsonConfigs: "base://",
        npm: __dirname + "/node_modules",

        // dev purpose only
        engine: "base://../src",
    },
});
