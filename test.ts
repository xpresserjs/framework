import Xpresser = require("./index");

Xpresser({
    name: "TestXjsApp",
    paths: {
        base: __dirname,
        routesFile: "test/routes.js",
        controllers: "test",
        views: "test",
    },
});
