
declare let $: Xjs;

import ModelEngine = require("./ModelEngine");
$.model = ModelEngine;


if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
