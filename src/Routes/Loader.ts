import fs = require("fs");
import RouterEngine = require("../RouterEngine");

import Path = require("../Helpers/Path");
import {DollarSign} from "../../xpresser";

declare let $: DollarSign;

$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);

if (fs.existsSync(RouteFile)) {
    try {
        require(RouteFile);
    } catch (e) {
        $.logPerLine([
            {error: "Router Error:"},
            {errorAndExit: e.message},
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
