import moment = require("moment");
import Base64 = require("./Helpers/Base64");
import {getInstance} from "../index";

const $ = getInstance();
declare const global: any;

/**
 * Expose (moment) to globals. (Stopped!!)
 * Use $.modules.moment() instead
 * @deprecated since (v 0.2.98)
 * @remove at (1.0.0)
 */
global['moment'] = (...args: any[]) => {
    $.logDeprecated('0.3.22', '1.0.0', 'Using global xpresser (moment) is deprecated. Please use $.modules.moment() instead.');
    return moment(...args);
};

// Use Base64 and Object-validator-pro
$.base64 = Base64;

// Helpers
import Helpers from "./Extensions/Helpers";
import Modules from "./Functions/modules.fn";

$.helpers = Helpers;
$.modules = Modules;

import Utils = require("./Functions/util.fn");
import {initializeTypescriptFn} from "./Functions/internals.fn";

// Assign Utils to $.fn
$.fn = Utils;

// Assign Utils to $.fn
$.utils = Utils;

// Set $.typescriptInit
$.initializeTypescript = initializeTypescriptFn;

// Get Lan Ip
import {getLocalExternalIp} from "./Functions/inbuilt.fn";

// Set Lan Ip
$.engineData.set('lanIp', getLocalExternalIp());

