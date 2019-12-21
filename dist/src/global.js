"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const Base64 = require("./Helpers/Base64");
global.moment = moment;
// Use Base64 and Object-validator-pro
$.base64 = Base64;
$.ovp = require("./Helpers/ObjectValidatorPro");
/**
 * If Database.startOnBoot,
 * Start Database on boot and set to $.db else set undefined
 */
if ($.config.database.startOnBoot) {
    const DB = require("./Database/Db");
    $.db = new DB();
}
else {
    $.db = undefined;
}
// Helpers
const Helpers = require("./helpers");
$.helpers = Helpers;
const Utils = require("./Functions/util.fn");
// Assign Utils to $.fn
$.fn = Utils;
// Assign Utils to $.fn
$.utils = Utils;
