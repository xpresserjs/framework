"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const RouterEngine = require("../RouterEngine");
const Path = require("../Helpers/Path");
$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
if (fs.existsSync(RouteFile)) {
    try {
        require(RouteFile);
    }
    catch (e) {
        $.logPerLine([
            { error: "Router Error:" },
            { errorAndExit: e.message },
        ]);
    }
}
// Import plugin routes
const PluginData = $.engineData.get("PluginEngineData");
const PluginRoutes = PluginData.routes;
for (let i = 0; i < PluginRoutes.length; i++) {
    const pluginRoute = PluginRoutes[i];
    const Routes = require(pluginRoute.path);
    // Add to routes if returned value is instance of XpresserRouter
    if (typeof Routes === "object" &&
        (Routes.constructor && Routes.constructor.name === "XpresserRouter")) {
        $.routerEngine.addToRoutes(Routes);
    }
}
if (typeof $.router.routesAfterPlugins === "function") {
    $.router.routesAfterPlugins();
}
