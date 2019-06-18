import fs = require("fs");
import RouterEngine = require("../RouterEngine");

import Path = require("../Helpers/Path");
import {Xpresser} from "../../global";

declare let $: Xpresser;

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
} else {
    $.logPerLine([
        {error: "Routes File Missing."},
        {error: RouteFile},
    ]);
}

// Import plugin routes
const PluginData = $.engineData.get("PluginEngineData");
const PluginRoutes = PluginData.routes;

for (let i = 0; i < PluginRoutes.length; i++) {
    const pluginRoute = PluginRoutes[i];
    require(pluginRoute.path);
}

if (typeof $.router.routesAfterPlugins === "function") {
    $.router.routesAfterPlugins();
}

// Process Routes
$.routerEngine.processRoutes($.router.routes);
