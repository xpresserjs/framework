import {getInstance} from "../index";
// Helpers
import Helpers from "./Extensions/Helpers";
import Modules from "./Functions/modules.fn";
import {initializeTypescriptFn} from "./Functions/internals.fn";
// Get Lan Ip
import {getLocalExternalIp} from "./Functions/inbuilt.fn";
import Base64 from "./Helpers/Base64";
import Utils from "./Functions/util.fn";

const $ = getInstance();


// Use Base64 and Object-validator-pro
$.base64 = Base64;

$.helpers = Helpers;
$.modules = Modules;


// Assign Utils to $.fn
$.fn = Utils;

// Assign Utils to $.fn
$.utils = Utils;

// Set $.typescriptInit
$.initializeTypescript = initializeTypescriptFn;

// Set Lan Ip
$.engineData.set('lanIp', getLocalExternalIp());

