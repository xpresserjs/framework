/// <reference path="./xpresser/node.d.ts" />
/// <reference path="./xpresser/http.d.ts" />
/// <reference path="./xpresser/helpers.d.ts" />
/// <reference path="./index.d.ts" />

import {DollarSign, Options} from "./index";

/**
 * Initialize Xpresser
 * @param config - Config object or path to config file.
 * @param options - Options
 * @constructor
 */
declare function XpresserInit(config: object | string, options?: Options): DollarSign;
