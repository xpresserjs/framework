"use strict";
/// <reference types="node"/>
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const router_1 = __importDefault(require("@xpresser/router"));
const lodash_1 = __importDefault(require("lodash"));
const Configurations = require("./src/config");
const ObjectCollection = require("./src/helpers/ObjectCollection");
const { Config, Options } = Configurations;
// const packageName: string = "xpresser";
const Xpresser = (AppConfig, AppOptions) => {
    if (AppConfig === undefined) {
        AppConfig = {};
    }
    if (AppOptions === undefined) {
        AppOptions = {};
    }
    AppConfig = lodash_1.default.merge(Config, AppConfig);
    AppOptions = lodash_1.default.extend(Options, AppOptions);
    const $ = {};
    global.$ = $;
    global._ = lodash_1.default;
    $.config = AppConfig;
    $.$config = new ObjectCollection(this.config);
    $.$options = AppOptions;
    $.engineData = new ObjectCollection();
    // Include Loggers
    require("./src/extensions/Loggers");
    $.logIfNotConsole("Starting Xjs...");
    // Include Path Extension
    require("./src/extensions/Path");
    require("./src/global");
    // Require Plugin Engine and load plugins
    const PluginEngine = require("./src/PluginEngine");
    PluginEngine.loadPlugins();
    // Add Router
    $.router = new router_1.default();
};
module.exports = Xpresser;
//# sourceMappingURL=index.js.map