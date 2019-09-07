import moment = require("moment");
import Base64 = require("./Helpers/Base64");
import {Xpresser} from "../global";

declare let $: Xpresser;

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

// Use Engine
import UseEngine = require("./UseEngine");

/**
 * @type {UseEngine}
 */
$.use = UseEngine;

// Helpers
import Helpers = require("./helpers");

$.helpers = Helpers;

// Assign Functions to $.fn
$.fn = require("./Functions/x.fn");
