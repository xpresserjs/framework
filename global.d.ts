/// <reference path="./types/node.d.ts" />
/// <reference path="./types/http.d.ts" />
/// <reference path="./types/helpers.d.ts" />
/// <reference path="./types/index.d.ts" />

import {DollarSign, Options} from "./types";

/**
 * Make Declaration public
 */
declare namespace xpresser {}


/**
 * Initialize Xpresser
 * @param config - Config object or path to config file.
 * @param options - Options
 * @constructor
 */
declare function xpresser(config: object | string, options?: Options): DollarSign;

export = xpresser;
