/**
 * Importing Package.json
 *
 * Since typescript is bundled in `dist` folder
 * package.json will be in the parent directory
 */

let PackageDotJson: any = {};

try {
    PackageDotJson = require("./package.json");
} catch (e) {
    PackageDotJson = require("../package.json");
}

// Import system required libraries
import fs = require("fs");
import ObjectCollection = require("object-collection");
import XpresserRouter = require("@xpresser/router");
// Import default config.
import Configurations = require("./config");
import {DollarSign, Options} from "./types";

// Use Lodash from ObjectCollection
const _ = ObjectCollection._;

/**
 * Get default Config and Options from Configurations
 */
const {Config, Options} = Configurations;

/**
 * Initialize Xpresser;
 * @param AppConfig
 * @param AppOptions
 * @constructor
 */
const XpresserInit = (AppConfig: object | string, AppOptions?: Options): DollarSign => {

    // Set DollarSign Global Var: $
    const $ = {} as DollarSign;

    $.exit = (...args) => {
        return process.exit(...args);
    };

    if (AppConfig === undefined) {
        AppConfig = {};
    }

    if (AppOptions === undefined) {
        AppOptions = {};
    }

    if (typeof AppConfig === "string") {
        const configFile = AppConfig;
        AppConfig = {};
        if (fs.existsSync(configFile)) {

            try {
                AppConfig = require(configFile);
                // tslint:disable-next-line:max-line-length
                if (typeof AppConfig !== "object" || (typeof AppConfig === "object" && !Object.keys(AppConfig).length)) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(`CONFIG: No exported object found in config file: (${configFile})`);
                }
            } catch (e) {
                console.error(e.message);
                $.exit();
            }

        } else {

            console.error("Config file not found!");
            $.exit();

        }
    }

    // Merge Config with DefaultConfig to replace missing values.
    AppConfig = _.merge(Config, AppConfig);
    AppOptions = _.merge(Options, AppOptions);

    // Initialize {$.on} for the first time.
    // @ts-ignore
    $.on = {};

    // Set {$.objectCollection}
    $.objectCollection = (obj?) => new ObjectCollection(obj);

    // Expose {$}(DollarSign) to globals.
    // @ts-ignore
    global.$ = $;

    // Expose {_}(lodash) to globals.
    // @ts-ignore
    global._ = _;

    /* ------------- $.on Events Loader ------------- */
    require("./src/On");

    // Require $.file
    require("./src/FileEngine");

    // Set Config to AppConfig
    $.config = AppConfig;

    /**
     * Set $.$config to an instance of ObjectCollection
     * To enable access and modify apps config.
     */
    $.$config = $.objectCollection($.config);

    /**
     * Set $.options
     * @type Options
     */
    $.options = AppOptions;

    /**
     * Engine Data serves as the store
     * for all data stored by Xpresser files/components
     */
    const DataInMemory = {};
    $.engineData = $.objectCollection(DataInMemory);

    const LaunchType = process.argv[2];
    $.engineData.set("LaunchType", LaunchType);

    if (typeof global["XjsCliConfig"] !== "undefined" || LaunchType === "cli") {
        $.options.isConsole = true;
    }

    // Include Loggers
    require("./src/Extensions/Loggers");

    $.logIfNotConsole(`${PackageDotJson.name} v${PackageDotJson.version}`);
    $.logIfNotConsole(`Starting ${$.config.name}...`);

    // Include Extensions
    require("./src/Extensions/Path");
    require("./src/Extensions/If");
    // Require Global
    require("./src/global");

    // Get OnEvents Loader.
    const loadOnEvents = require("./src/Events/OnEventsLoader");

    function afterStartEvents() {
        // Require Plugin Engine and load plugins
        const PluginEngine = require("./src/PluginEngine");
        const PluginData = PluginEngine.loadPlugins();

        $.engineData.set("PluginEngineData", PluginData);

        const $useDotJson = $.objectCollection();
        const $useDotJsonPath = $.path.jsonConfigs("use.json");

        if ($.file.exists($useDotJsonPath)) {
            $useDotJson.merge(require($useDotJsonPath));

            // Save to EngineData
            $.engineData.set("UseDotJson", $useDotJson);
        }

        /**
         * @type {UseEngine}
         */
        $.use = require("./UseEngine");

        /**
         * Add Router
         * @type {XpresserRouter}
         */
        $.router = new XpresserRouter();

        /**
         * Require Model Engine
         * @type {ModelEngine}
         */
        $.model = require("./src/ModelEngine");

        $.ifNotConsole(() => {
            /**
             * Load Registered Events
             */
            require("./src/Events/Loader");
        });

        /**
         * Load on.boot Events
         */
        loadOnEvents("boot", () => {
            /**
             * XjsCliConfig.require_only
             * This config is only used by xpresser cron.
             * Used to load your main file without booting it
             */
            if (!(typeof global["XjsCliConfig"] !== "undefined" && global["XjsCliConfig"]["require_only"])) {
                $.ifConsole(() => {
                    require("./src/StartConsole");
                }, () => {
                    require("./src/StartHttp");
                });
            }
        });
    }

    $.boot = () => {
        /**
         * Load on.start Events
         */
        return loadOnEvents("start", afterStartEvents);
    };

    /**
     * Boot if $.options.autoBoot is true.
     */
    if ($.options.autoBoot === true) {
        $.boot();
    }

    return $;
};

export = XpresserInit;
