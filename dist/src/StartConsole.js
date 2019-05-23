"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelEngine = require("./ModelEngine");
const RouterEngine = require("./RouterEngine");
const Path = require("./helpers/Path");
$.model = ModelEngine;
$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
// Require Routes
try {
    require(RouteFile);
}
catch (e) {
    $.logErrorAndExit("Routes File Missing.");
}
// $.routerEngine.processRoutes($.router.routes);
require("./console.js");
//# sourceMappingURL=StartConsole.js.map