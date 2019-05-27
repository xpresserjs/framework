"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ts-check
const moment_1 = __importDefault(require("moment"));
const Base64 = require("./Helpers/Base64");
global.moment = moment_1.default;
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
// Use Engine
$.use = require("./UseEngine");
$.helpers = require("./helpers");
// $.Helpers.
// Assign Functions to $.fn
$.fn = require("./Functions/x.fn");
//# sourceMappingURL=global.js.map