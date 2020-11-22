import fs = require("fs");
import RouterEngine = require("../RouterEngine");

import Path = require("../Helpers/Path");
import {getInstance} from "../../index";

const $ = getInstance();

$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.get('paths.routesFile'));

if (fs.existsSync(RouteFile)) {
    try {
        require(RouteFile);
    } catch (e) {
        $.logPerLine([
            {error: "Router Error:"},
            {errorAndExit: e.stack},
        ]);
    }
}

// Import plugin routes
const PluginData = $.engineData.get("PluginEngineData");
const PluginRoutes = PluginData.routes;

for (let i = 0; i < PluginRoutes.length; i++) {
    const pluginRoute = PluginRoutes[i];
    const Routes = require(pluginRoute.path);

    // Add to routes if returned value is getInstance of XpresserRouter
    if (
        typeof Routes === "object" &&
        (Routes.constructor && Routes.constructor.name === "XpresserRouter")
    ) {
        $.routerEngine.addToRoutes(Routes);
    }
}

if (typeof $.router.routesAfterPlugins === "function") {
    $.router.routesAfterPlugins();
}
