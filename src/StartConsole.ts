import ModelEngine = require("./ModelEngine");
import RouterEngine = require("./RouterEngine");
import {Xjs} from "../global";
import Path = require("./helpers/Path");

declare let $: Xjs;

$.model = ModelEngine;

$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
// Require Routes
try {
    require(RouteFile);
} catch (e) {
    $.logErrorAndExit("Routes File Missing.");
}

// $.routerEngine.processRoutes($.router.routes);

require("./console");
