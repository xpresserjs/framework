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
import {Xpresser} from "./global";

// Use Lodash from ObjectCollection
const _ = ObjectCollection._;

/**
 * Get default Config and Options from Configurations
 */
const {Config, Options} = Configurations;

/**
 * Xpresser Initializer;
 * @param AppConfig
 * @param AppOptions
 * @constructor
 */
const XpresserInit = (AppConfig: object | string, AppOptions?: XpresserOptions): Xpresser => {

    if (AppConfig === undefined) {
        AppConfig = {};
    }

    if (AppOptions === undefined) {
        AppOptions = {};
    }

    if (typeof AppConfig === "string") {
        const configFile = AppConfig;
        AppConfig = {};
        if (fs.existsSync(configFile) && fs.lstatSync(configFile).isFile()) {

            try {
                AppConfig = require(configFile);
                // tslint:disable-next-line:max-line-length
                if (typeof AppConfig !== "object" || (typeof AppConfig === "object" && !Object.keys(AppConfig).length)) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(`CONFIG: No exported object found in config file: (${configFile})`);
                }
            } catch (e) {
                console.error(e.message);
                process.exit();
            }

        } else {

            console.error("Config file not found!");
            process.exit();

        }
    }

    // Merge Config with DefaultConfig to replace missing values.
    AppConfig = _.merge(Config, AppConfig);
    AppOptions = _.merge(Options, AppOptions);

    // Set Xpresser Global Var: $
    const $ = {} as Xpresser;

    // Initialize $.on for the first time.
    // @ts-ignore
    $.on = {};
    // Set ObjectCollection
    $.objectCollection = (obj?) => new ObjectCollection(obj);

    // Set $ (Xpresser) && _ (lodash) to globals.
    global.$ = $;
    global._ = _;

    // Set Config to AppConfig
    $.config = AppConfig;

    /**
     * Set $.$config to an instance of ObjectCollection
     * To enable access and modify apps config.
     */
    $.$config = $.objectCollection($.config);

    /**
     * Set $.options
     * @type XpresserOptions
     */
    $.options = AppOptions;

    /**
     * Engine Data serves as the store
     * for all data store by Xpresser files/components
     */
    $.engineData = $.objectCollection();

    const LaunchType = process.argv[2];

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

    // Require Plugin Engine and load plugins
    const PluginEngine = require("./src/PluginEngine");
    const PluginData = PluginEngine.loadPlugins();

    $.engineData.set("PluginEngineData", PluginData);

    const $useDotJson = $.objectCollection();
    const $useDotJsonPath = $.path.jsonConfigs("use.json");

    if (fs.existsSync($useDotJsonPath)) {
        $useDotJson.merge(require($useDotJsonPath));

        // Save to EngineData
        $.engineData.set("UseDotJson", $useDotJson);
    }

    // Require Global
    require("./src/global");

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

    /**
     * Load Registered Events
     */
    require("./src/Events/Loader");

    /* ------------- $.on Events Loader ------------- */
    require("./src/On");
    // const onEvents

    $.boot = () => {
        const BOOT = () => {
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
        };

        /**
         * Load on.boot Events
         */
        const bootEvents: any[] = $.on.events()["boot"];
        if (bootEvents.length) {

            bootEvents.push(() => {
                BOOT();
            });

            $.engineData.set("on.boot", 0);

            const next = async () => {
                const currentIndex = $.engineData.get("on.boot", 0);
                const nextIndex = currentIndex + 1;
                $.engineData.set("on.boot", nextIndex);

                bootEvents[nextIndex](next);
            };

            bootEvents[0](next);
        } else {
            BOOT();
        }

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
