/// <reference types="node"/>

import XpresserRouter from "@xpresser/router";
import _ from "lodash";
import Configurations = require("./src/config");
import ObjectCollection = require("./src/helpers/ObjectCollection");

const {Config, Options} = Configurations;
// const packageName: string = "xpresser";

const Xpresser = (AppConfig: object, AppOptions?: XpresserOptions) => {

    if (AppConfig === undefined) {
        AppConfig = {};
    }
    if (AppOptions === undefined) {
        AppOptions = {};
    }

    AppConfig = _.merge(Config, AppConfig);
    AppOptions = _.extend(Options, AppOptions);

    const $ = {} as Xjs;

    global.$ = $;
    global._ = _;

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
    $.router = new XpresserRouter();

};

export = Xpresser;
