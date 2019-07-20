import {Xpresser} from "../global";

declare let $: Xpresser;

import ModelEngine = require("./ModelEngine");

/**
 * @type {ModelEngine}
 */
$.model = ModelEngine;

if (!global.hasOwnProperty("XjsCliConfig")) {
    // Load Events
    require("./src/Events/Loader");
    require("./console");
}
