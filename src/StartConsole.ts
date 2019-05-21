import ModelEngine = require("./ModelEngine");
import RouterEngine = require("./RouterEngine");
import {Xjs} from "../global";
declare let $: Xjs;

$.model = ModelEngine;

$.routerEngine = RouterEngine;

$.path.backend("routers/router", true);
$.routerEngine.processRoutes();
