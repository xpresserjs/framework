/// <reference types="node"/>
import XpresserRouter = require("@xpresser/router");
import fs = require("fs");
import _ = require("lodash");
import {Xjs} from "./global";
import Configurations = require("./src/config");
import ObjectCollection = require("./src/helpers/ObjectCollection");

const {Config, Options} = Configurations;

const Xpresser = (AppConfig: object | string, AppOptions?: XpresserOptions): Xjs => {

    if (AppConfig === undefined) {
        AppConfig = {};
    }
    if (AppOptions === undefined) {
        AppOptions = {};
    }

    if (typeof AppConfig === "string") {
        if (fs.lstatSync(AppConfig).isFile()) {
            AppConfig = require(AppConfig);
        } else {
            console.error("Config file not found!");
            console.error("Using default config.");

            AppConfig = {};
        }
    }

    AppConfig = _.merge(Config, AppConfig);
    AppOptions = _.extend(Options, AppOptions);

    const $ = {} as Xjs;

    global.$ = $;
    global._ = _;

    $.config = AppConfig;
    $.$config = new ObjectCollection($.config);
    $.$options = AppOptions;
    $.engineData = new ObjectCollection();

    if (typeof global["XjsCliConfig"] !== "undefined") {
        $.$options.isConsole = true;
    } else if (process.argv[2]) {
        const LaunchType = process.argv[2];
        if (LaunchType === "cli") {
            $.$options.isConsole = true;
        }
    }

    // Include Loggers
    require("./src/extensions/Loggers");

    $.logIfNotConsole(`Starting ${$.config.name}...`);

    // Include Path Extension
    require("./src/extensions/Path");

    if (!$.$options.isConsole) {
        // Require Plugin Engine and load plugins
        const PluginEngine = require("./src/PluginEngine");
        const PluginData = PluginEngine.loadPlugins();

        $.engineData.set("PluginEngineData", PluginData);
    }

    // Global
    require("./src/global");

    // Add Router
    $.router = new XpresserRouter();

    if ($.$options.isConsole) {
        require("./src/StartConsole");
    } else {
        require("./src/StartHttp");
    }

    return $;
};

export = Xpresser;
