/// <reference path="./types/node.d.ts" />
/// <reference path="./types/helpers.d.ts" />
/// <reference path="./types/http.d.ts" />
/// <reference path="./types/index.d.ts" />

import ControllerClass from "./src/Classes/ControllerClass";
import XpresserRepl from "./src/XpresserRepl";
import {DollarSign, Options} from "./types";
import XpresserRouter from "@xpresser/router";
import InXpresserError from "./src/Errors/InXpresserError";

/**
 * Initialize Xpresser
 * @param config - Config object or path to config file.
 * @param options - Options
 * @constructor
 */
declare function init(config: object | string, options?: Options): DollarSign;

/**
 * Get Current Xpresser Instance.
 * Use instead of global $
 * @example
 * const $ = global['$'];
 * const $ = getInstance();
 * @param [instanceId]
 */
declare function getInstance(instanceId?: string): DollarSign;

/**
 * Get Xpresser Instance Router.
 * @param instanceId
 * @returns {XpresserRouter}
 */
declare function getInstanceRouter(instanceId?: string): XpresserRouter;

export {init, getInstance, getInstanceRouter, ControllerClass, XpresserRepl, InXpresserError}
