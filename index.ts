import {DollarSign, Options} from "./types";
import {StringToAnyKeyObject} from "./src/CustomTypes";
import ControllerClass from "./src/Classes/ControllerClass";

// Xpresser Instance Holder
const instanceHolder: StringToAnyKeyObject = {};


/**
 * Get Xpresser Instance.
 *
 * if instanceId is not defined the first getInstance will be returned;
 * @param instanceId
 */
function getInstance(instanceId?: string): DollarSign {
    if (instanceId === ':keys') return Object.keys(instanceHolder) as any;
    if (instanceId === ':id') return require('./truth').instanceId;

    if (instanceId) {
        if (!instanceHolder.hasOwnProperty(instanceId))
            throw new Error(`Xpresser instanceId: ${instanceId} not found!`);

        return instanceHolder[instanceId];
    } else {

        // If $ is defined then return.
        if (global.$) {
            return global.$;
        }

        const truth = require("./truth");

        if (truth && truth.instanceId) {
            return instanceHolder[truth.instanceId];
        }

        const instances = Object.keys(instanceHolder);
        if (!instances.length)
            throw new Error(`No Xpresser instance defined found!`);

        return instanceHolder[instances[0]];
    }
}


/**
 * Initialize Xpresser;
 * @param AppConfig
 * @param {Options} AppOptions
 * @constructor
 */
function init(AppConfig: StringToAnyKeyObject | string, AppOptions: Options = {}): DollarSign {

    // Expose xpresserInstance as global function
    if (!global.xpresserInstance) global.xpresserInstance = getInstance;

    /**
     * Require Modules only when this function is called.
     * This is to avoid requiring un-needed packages when ever we run
     * const {getInstance} = require('xpresser')
     */
    const Deprecated = require("./src/Errors/Deprecated");
    const fs = require("fs");
    const XpresserRouter = require("@xpresser/router");
    // Import default config.
    const {Config, Options} = require("./config");
    const ObjectCollection = require("object-collection");
    const {randomStr} = require('./src/Functions/inbuilt.fn')
    const lodash = require("lodash");
    const truth = require("./truth");


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

    if (AppConfig === undefined) {
        AppConfig = {};
    }

    if (AppOptions === undefined) {
        AppOptions = {};
    }

    // Set Instance id to random string if not defined
    if (!AppOptions['instanceId']) truth.instanceId = AppOptions['instanceId'] = randomStr(10);

    // Set DollarSign Global Var: $
    const $ = instanceHolder[AppOptions['instanceId'] as string] = {} as DollarSign;

    $.exit = (...args) => {
        return process.exit(...args);
    };

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

    /**
     * Check if config {paths.base} exists in user defined config.
     */
    const noBaseFolderDefinedError = `No base folder defined in config {paths.base}`;
    if (!AppConfig.hasOwnProperty('paths')) {
        console.log(noBaseFolderDefinedError);
        $.exit()
    } else {
        // @ts-ignore
        if (!AppConfig['paths'].hasOwnProperty('base')) {
            console.log(noBaseFolderDefinedError);
            $.exit()
        }
    }

    /**
     * Check if env exist in config
     */
    if (!AppConfig.hasOwnProperty('env')) {
        console.log(`Config {env} is missing, options: (development | production | others)`)
        $.exit();
    }

    // Merge Config with DefaultConfig to replace missing values.
    AppConfig = lodash.merge(lodash.clone(Config), AppConfig) as StringToAnyKeyObject;
    AppOptions = lodash.merge(lodash.clone(Options), AppOptions) as Options;


    // Initialize {$.on} for the first time.
    // @ts-ignore
    $.on = {};

    // Set {$.objectCollection}
    if (typeof AppConfig['ObjectCollection'] === "function") {
        const OwnObjectCollection: any = AppConfig.ObjectCollection()
        $.objectCollection = (obj?) => new OwnObjectCollection(obj) as typeof ObjectCollection;
    } else {
        $.objectCollection = (obj?) => new ObjectCollection(obj);
    }


    // Expose {$}(DollarSign) to globals.
    if (AppOptions.exposeDollarSign) global.$ = $;

    /**
     * Expose {_}(lodash) to globals. (Stopped!!)
     * Use $.modules.lodash() instead
     * This practice was considered a bad practice and also interferes
     * with node repl _ variable.
     *
     * For now it will be proxied to show a warning anywhere used
     * @deprecated since (v 0.2.98)
     * @remove at (1.0.0)
     */
    global._ = new Proxy(lodash, {
        get: (_target, prop) => {
            console.log(new Deprecated('Using global xpresser (_) i.e lodash is deprecated. Please use $.modules.lodash() instead.').stack);
            return lodash[prop];
        }
    });

    /**
     * Get Xjs Cli Config
     */
    const CliConfig: any = (global as any)["XjsCliConfig"];

    /**
     * Set Config to object-collection of AppConfig
     */
    $.config = $.objectCollection(AppConfig as object);

    /**
     * Set $.options
     * @type Options
     */
    $.options = AppOptions;

    /**
     * Engine Data serves as the store
     * for all data stored by Xpresser files/components
     */
    $.engineData = $.objectCollection({});
    /**
     * Store serves as the store
     * for the application
     */
    $.store = $.objectCollection({});

    const LaunchType = process.argv[2];
    $.engineData.set("LaunchType", LaunchType);

    if (typeof CliConfig !== "undefined" || LaunchType === "cli") {
        $.options.isConsole = true;
    }

    // Set $.isTypeScript
    $.isTypescript = () => {
        return $.config.get('project.fileExtension') === ".ts";
    }


    // Set Engine Path
    const enginePath = $.config.get('paths.engine');
    if (!enginePath) {
        let dirName = __dirname;

        /**
         * Check if xpresser dist folder if being used
         */
        if (dirName.substr(-5) === '/dist') {
            dirName = dirName.substr(0, dirName.length - 5)
        }

        $.config.set('paths.engine', `${dirName}/src/`);
    }

    /* ------------- $.on Events Loader ------------- */
    require("./src/On");
    // Require $.file
    require("./src/FileEngine");
    // Include Loggers
    require("./src/Extensions/Loggers");
    // Include If extensions
    require("./src/Extensions/If");

    // Log if not console
    $.ifNotConsole(() => {
        $.log(`${PackageDotJson.name} version ${PackageDotJson.version}`);
        $.log(`Starting ${$.config.get('name')}...`);
    });

    /**
     * Change timezone if timezone is defined.
     */
    const timezone = $.config.get('date.timezone');
    if (timezone) {
        process.env.TZ = timezone;
    }

    // Include PathHelper Extensions
    require("./src/Extensions/Path");
    // Require Global
    require("./src/global");

    // Get OnEvents Loader.
    const loadOnEvents = require("./src/Events/OnEventsLoader");

    async function afterStartEvents() {
        // Require Plugin Engine and load plugins
        const PluginEngine = require("./src/PluginEngine");
        const PluginData = await PluginEngine.loadPlugins();

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
        $.use = require("./src/UseEngine");

        /**
         * Add Router
         * @type {XpresserRouter}
         */
        $.router = new XpresserRouter();

        $.ifNotConsole(() => {
            /**
             * Load Registered Events
             */
            require("./src/Events/Loader");
        });
    }

    $.boot = () => {
        // Prevents `$.boot()` booting twice
        if ($.engineData.has('hasBooted'))
            return false;

        // Set HasBooted in engine data
        $.engineData.set('hasBooted', true);

        /**
         * Load on.start Events
         */
        return loadOnEvents("start", () => {
            afterStartEvents().then(() => {
                /**
                 * Load on.boot Events
                 */
                loadOnEvents("boot", () => {
                    /**
                     * XjsCliConfig.require_only
                     * This config is only used by xpresser cron.
                     * Used to load your main file without booting it
                     */
                    if (!AppOptions.requireOnly) {
                        $.ifConsole(() => {
                            require("./src/StartConsole");
                        }, () => {
                            require("./src/StartHttp");
                        });
                    }
                });
            })
        });
    };

    /**
     * Boot if $.options.autoBoot is true.
     */
    if ($.options.autoBoot === true) {
        $.boot();
    }

    return $;
}

export {init, getInstance, ControllerClass}


