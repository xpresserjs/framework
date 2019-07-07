"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelEngine = require("./ModelEngine");
/**
 * @type {ModelEngine}
 */
$.model = ModelEngine;
if (!global.hasOwnProperty("XjsCliConfig")) {
    require("./console");
}
