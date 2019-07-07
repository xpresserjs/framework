import {Xpresser} from "../global";

declare let $: Xpresser;

import ModelEngine = require("./ModelEngine");

/**
 * @type {ModelEngine}
 */
$.model = ModelEngine;


if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
