import ModelEngine = require("./ModelEngine");
import RouterEngine = require("./RouterEngine");
import {Xjs} from "../global";
import Path = require("./helpers/Path");
import fs = require("fs");


declare let $: Xjs;

$.model = ModelEngine;

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

require("./console");
