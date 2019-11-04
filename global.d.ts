/// <reference path="./types/node.d.ts" />
/// <reference path="./types/http.d.ts" />
/// <reference path="./types/helpers.d.ts" />
/// <reference path="./xpresser.d.ts" />

import {DollarSign, Options} from "./xpresser";

/**
 * Initialize Xpresser
 * @param config - Config object or path to config file.
 * @param options - Options
 * @constructor
 */
declare function XpresserInit(config: object | string, options?: Options): DollarSign;

export = XpresserInit;
