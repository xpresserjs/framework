"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/// <reference types="node"/>
const router_1 = __importDefault(require("@xpresser/router"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const Configurations = require("./src/config");
const ObjectCollection = require("./src/helpers/ObjectCollection");
const { Config, Options } = Configurations;
const Xpresser = (AppConfig, AppOptions) => {
    if (AppConfig === undefined) {
        AppConfig = {};
    }
    if (AppOptions === undefined) {
        AppOptions = {};
    }
    if (typeof AppConfig === "string") {
        if (fs_1.default.lstatSync(AppConfig).isFile()) {
            AppConfig = require(AppConfig);
        }
        else {
            console.error("Config file not found!");
            console.error("Using default config.");
            AppConfig = {};
        }
    }
    AppConfig = lodash_1.default.merge(Config, AppConfig);
    AppOptions = lodash_1.default.extend(Options, AppOptions);
    const $ = {};
    global.$ = $;
    global._ = lodash_1.default;
    $.config = AppConfig;
    $.$config = new ObjectCollection($.config);
    $.$options = AppOptions;
    $.engineData = new ObjectCollection();
    // Include Loggers
    require("./src/extensions/Loggers");
    $.logIfNotConsole(`Starting ${$.config.name}...`);
    // Include Path Extension
    require("./src/extensions/Path");
    // Global
    require("./src/global");
    // Require Plugin Engine and load plugins
    const PluginEngine = require("./src/PluginEngine");
    PluginEngine.loadPlugins();
    // Add Router
    $.router = new router_1.default();
    if ($.$options.isConsole) {
        require("./src/StartConsole");
    }
    else {
        require("./src/StartHttp");
    }
};
module.exports = Xpresser;
//# sourceMappingURL=index.js.map