import moment = require("moment");
import Base64 = require("./Helpers/Base64");
import {DollarSign} from "../types";

declare const $: DollarSign;
declare const global: any;

/**
 * Expose (moment) to globals. (Stopped!!)
 * Use $.modules.moment() instead
 * @deprecated since (v 0.2.98)
 * @remove at (1.0.0)
 */
global['moment'] = (...args: any[]) => {
    console.log(`Deprecated: Using global xpresser (_) i.e lodash is deprecated. Please use $.modules.lodash() instead.`);
    return moment(...args);
};

// Use Base64 and Object-validator-pro
$.base64 = Base64;

// Helpers
import Helpers from "./helpers";
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
/**
 * Get lan Ip
 */
import {getLocalExternalIp} from "./Functions/inbuilt.fn";
$.engineData.set('lanIp', getLocalExternalIp());

