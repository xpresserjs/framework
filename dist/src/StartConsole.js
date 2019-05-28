"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("./Helpers/Path");
const fs = require("fs");
const ModelEngine = require("./ModelEngine");
$.model = ModelEngine;
const RouterEngine = require("./RouterEngine");
$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
// Require Routes
if (!fs.existsSync(RouteFile)) {
    $.logErrorAndExit("Routes File Missing.");
}
try {
    require(RouteFile);
}
catch (e) {
    $.logErrorAndExit(e.message);
}
// $.routerEngine.processRoutes($.router.routes);
if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
//# sourceMappingURL=StartConsole.js.map