import moment = require("moment");
import Base64 = require("./Helpers/Base64");
import {DollarSign} from "../types";

declare const $: DollarSign;
declare const global: any;

global['moment'] = moment;

// Use Base64 and Object-validator-pro
$.base64 = Base64;

// Helpers
import Helpers = require("./helpers");

$.helpers = Helpers;

import Utils = require("./Functions/util.fn");
import {initializeTypescriptFn} from "./Functions/internals.fn";

// Assign Utils to $.fn
$.fn = Utils;

// Assign Utils to $.fn
$.utils = Utils;

// Set $.typescriptInit
$.initializeTypescript = initializeTypescriptFn;
