import moment = require("moment");
import Base64 = require("./Helpers/Base64");
import {DollarSign} from "../types";

declare const $: DollarSign;

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
} else {
    $.db = undefined;
}

// Helpers
import Helpers = require("./helpers");

$.helpers = Helpers;
import Utils = require("./Functions/util.fn");

// Assign Utils to $.fn
$.fn = Utils;
// Assign Utils to $.fn
$.utils = Utils;
