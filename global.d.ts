/// <reference path="./xpresser/node.d.ts" />
/// <reference path="./xpresser/http.d.ts" />
/// <reference path="./xpresser/helpers.d.ts" />
/// <reference path="./xpresser/index.d.ts" />

import {DollarSign, Options} from "./xpresser";

/**
 * Initialize Xpresser
 * @param config - Config object or path to config file.
 * @param options - Options
 * @constructor
 */
declare function XpresserInit(config: object | string, options?: Options): DollarSign;
