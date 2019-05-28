import {Xjs} from "../global";
import Path = require("./Helpers/Path");
import fs = require("fs");

declare let $: Xjs;

import ModelEngine = require("./ModelEngine");
$.model = ModelEngine;
import RouterEngine = require("./RouterEngine");
$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
// Require Routes
if (!fs.existsSync(RouteFile)) {
    $.logErrorAndExit("Routes File Missing.");
}
try {
    require(RouteFile);
} catch (e) {
    $.logErrorAndExit(e.message);
}

// $.routerEngine.processRoutes($.router.routes);
if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
