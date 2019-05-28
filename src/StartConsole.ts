import {Xjs} from "../global";
import Path = require("./Helpers/Path");
import fs = require("fs");

declare let $: Xjs;

import ModelEngine = require("./ModelEngine");
$.model = ModelEngine;


if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
