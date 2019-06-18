
declare let $: Xpresser;

import ModelEngine = require("./ModelEngine");
$.model = ModelEngine;


if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
