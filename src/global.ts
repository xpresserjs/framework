// ts-check
import Bcrypt from "bcrypt";
import moment from "moment";
import Base64 from "./helpers/Base64";

global.moment = moment;

// Use Base64 and Object-validator-pro
$.base64 = Base64;
$.ovp = require("./helpers/ObjectValidatorPro");

/**
 * If database.startOnBoot,
 * Start Database on boot and set to $.db else set undefined
 */
if ($.config.database.startOnBoot) {
    const DB = require("./database/Db");
    $.db = new DB();
} else {
    $.db = undefined;
}

// Use Engine
$.use = require("./UseEngine");

$.bcrypt = Bcrypt;
$.helpers = require("./helpers");

// $.helpers.

// Assign Functions to $.fn
$.fn = require("./functions/x.fn.js");
