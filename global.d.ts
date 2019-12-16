/// <reference path="./types/node.d.ts" />
/// <reference path="./types/http.d.ts" />
/// <reference path="./types/helpers.d.ts" />
/// <reference path="./types/index.d.ts" />

import {DollarSign, Options} from "./types";

/**
 * Initialize Xpresser
 * @param config - Config object or path to config file.
 * @param options - Options
 * @constructor
 */
declare function XpresserInit(config: object | string, options?: Options): DollarSign;
