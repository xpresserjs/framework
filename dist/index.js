"use strict";
/// <reference types="node"/>
const fs = require("fs");
const _ = require("lodash");
const Configurations = require("./src/config");
const ObjectCollection = require("./src/Helpers/ObjectCollection");
const { Config, Options } = Configurations;
const Xpresser = (AppConfig, AppOptions) => {
    if (AppConfig === undefined) {
        AppConfig = {};
    }
    if (AppOptions === undefined) {
        AppOptions = {};
    }
    if (typeof AppConfig === "string") {
        if (fs.lstatSync(AppConfig).isFile()) {
            AppConfig = require(AppConfig);
        }
        else {
            console.error("Config file not found!");
            console.error("Using default config.");
            AppConfig = {};
        }
    }
    AppConfig = _.merge(Config, AppConfig);
    AppOptions = _.extend(Options, AppOptions);
    const $ = {};
    global.$ = $;
    global._ = _;
    $.config = AppConfig;
    $.$config = new ObjectCollection($.config);
    $.$options = AppOptions;
    $.engineData = new ObjectCollection();
    if (typeof global["XjsCliConfig"] !== "undefined") {
        $.$options.isConsole = true;
    }
    else if (process.argv[2]) {
        const LaunchType = process.argv[2];
        if (LaunchType === "cli") {
            $.$options.isConsole = true;
        }
    }
    // Include Loggers
    require("./src/Extensions/Loggers");
    $.logIfNotConsole(`Starting ${$.config.name}...`);
    // Include Path Extension
    require("./src/Extensions/Path");
    // Require Plugin Engine and load plugins
    const PluginEngine = require("./src/PluginEngine");
    const PluginData = PluginEngine.loadPlugins();
    $.engineData.set("PluginEngineData", PluginData);
    // Global
    require("./src/global");
    // Add Router
    const XpresserRouter = require("@xpresser/router");
    $.router = new XpresserRouter();
    if ($.$options.isConsole) {
        require("./src/StartConsole");
    }
    else {
        require("./src/StartHttp");
    }
    return $;
};
module.exports = Xpresser;
//# sourceMappingURL=index.js.map