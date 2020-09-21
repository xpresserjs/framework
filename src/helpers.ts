import BuildUrl = require("build-url");
import moment = require("moment");
import {DollarSign} from "../types";

declare const _: any;
declare const $: DollarSign;

/* HELPER FUNCTIONS */
const helpers = {
    urlBuilder: BuildUrl,

    /**
     * Get full url of path
     * @param {string} $path
     * @param {object} $query
     */
    url($path: string = "", $query: any = {}) {
        let url = "";
        const server = $.config.server;

        if ($path.substr(0, 1) === "/") {
            $path = $path.substr(1);
        }

        if (server.baseUrl.length) {
            url = server.baseUrl + $path;
        } else {
            let d = server.domain;
            let p = server.protocol;

            if (server.includePortInUrl && (server.port !== 80 && server.port !== 443)) {
                d = d + ":" + server.port;
            }

            if ($.$config.get("server.ssl.enabled", false)) {
                p = "https";
            }

            url = p + "://" + d + server.root + $path;
        }

        if (Object.keys($query).length) {
            url = BuildUrl(url, {
                queryParams: $query,
            });
        }

        return url;
    },

    /**
     * Get url of route.
     * @param {string} $route
     * @param {array|string} $keys
     * @param {Object|boolean} $query
     * @param {boolean} $includeUrl
     */
    route($route: string, $keys = [], $query = {}, $includeUrl = true) {

        if (typeof $query === "boolean") {
            $includeUrl = $query;
            $query = {};
        }

        if (!Array.isArray($keys)) {
            $keys = [$keys];
        }

        const routes = $.routerEngine.nameToPath();

        if (typeof routes[$route] !== "undefined") {
            let path = routes[$route];
            if (path.substr(-1) === "*" && !$keys.length) {
                return path.substr(0, path.length - 1);
            }
            const hasRegex = path.match(new RegExp('[|&;$%@"<>()+:,*]'));
            if (Array.isArray(hasRegex) && hasRegex.length) {
                // find * and :keys
                const findKeys = new RegExp("[*]|(:[a-z_A-Z]+)", "g");
                const HasKeys = path.match(findKeys);

                if (Array.isArray(HasKeys) && HasKeys.length) {
                    let counter = 0;
                    const replacer = (...args: any[]) => {
                        if (args[0] === "*" && !$keys.length) {
                            counter++;
                            return "*";
                        }

                        const key = $keys[counter] || (args[0] === "*" ? "*" : "_??_");
                        counter++;
                        return key;
                    };

                    path = path.replace(findKeys, replacer);
                }
            }
            return $includeUrl ? helpers.url(path, $query) : path;
        }
        return $includeUrl ? helpers.url($route, $query) : $route;
    },

    /**
     * Get Config
     * @param {string} $config - Config key
     * @param {*} $default - Default return value if config is not found.
     */
    config($config: string, $default = undefined) {
        return _.get($.config, $config, $default);
    },

    /**
     * Laravel Mix Helper
     * @param {string} file - Public path to file.
     */
    mix(file: string) {
        let mix;
        const localVariableName = "laravelMixManifest";
        if (file.substr(0, 1) !== "/") {
            file = "/" + file;
        }

        if ($.engineData.has(localVariableName)) {
            mix = $.engineData.get(localVariableName);
        } else {
            const mixFile = $.path.base("public/mix-manifest.json");
            if ($.file.exists(mixFile)) {
                mix = require(mixFile);
                $.engineData.set(localVariableName, mix);
            }
        }

        if (typeof mix[file] !== "undefined") {
            file = mix[file];
        }

        return helpers.url(file);
    },

    env: $.env,

    /**
     * Random string generator
     * @param {number} length - length of string.
     */
    randomStr(length = 10) {
        let i: number;
        let possible: string;
        let text: string;

        text = "";
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        i = 0;

        while (i < length) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            i++;
        }
        return text;
    },

    /**
     * Random Array Generator
     * @param {number} length
     * @return {Array}
     */
    randomArray(length = 5) {
        let i = 0;
        const newArray = [];
        while (i < length) {
            newArray.push(i);
            i++;
        }

        return newArray;
    },

    randomInteger(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // ---------------------------
    // ---------------------------
    /* ------ DATE ------ */
    // ---------------------------
    // ---------------------------

    now() {
        return moment().format($.config.date.format);
    },

    today() {
        return helpers.now();
    },

    /**
     * Parse Date
     */
    toDate(date?: any, format?: string): moment.Moment {
        if (!format) {
            format = $.config.date.format;
        }

        if (!date) {
            date = helpers.now();
        }
        return moment(date, format);
    },

    /**
     * Time Ago
     */
    timeAgo(date: any, format?: string): string {
        return helpers.toDate(date, format).fromNow();
    },
};

export = helpers;
