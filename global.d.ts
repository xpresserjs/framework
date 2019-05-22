import express = require("express");
import ObjectValidator from "object-validator-pro";
import Controller = require("./src/classes/Controller");
import ObjectCollection from "./src/helpers/ObjectCollection";
import ModelEngine from "./src/ModelEngine";
import RouterEngine = require("./src/RouterEngine");
import UseEngine = require("./src/UseEngine");

type DB = import("./src/database/Db");
type Bcrypt = import("bcrypt");

declare namespace JsonSettings {
    interface Use {
        middlewares?: object;
    }
}

declare interface Xjs {
    config: any;
    $config: ObjectCollection;
    $options: XpresserOptions;

    // Stores Engine Data
    engineData: ObjectCollection;

    // Base64 Encoder
    base64: XjsHelpers.Base64;

    // Object validator
    ovp: ObjectValidator;

    // Database
    db: DB;

    // Use Engine
    use: typeof UseEngine;

    // Bcrypt
    bcrypt: Bcrypt;

    // Set XjsHelpers
    helpers: XjsHelpers.Main;

    // Router Helper
    router: XpresserRouter;

    // Register Functions
    fn: XjsHelpers.FN;

    // Express App
    app: express.Application;

    // Model Engine
    model: typeof ModelEngine;

    // Router Engine
    routerEngine: typeof RouterEngine;

    // Controller
    controller: Controller;

    /*----------------- PATH FUNCTIONS ------------------- */
    path: {
        /**
         * Get path in base folder.
         */
        base(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path in backend folder
         */
        backend(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path in storage folder
         */
        storage(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path in Framework src folder
         */
        engine(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path controllers folder
         */
        controllers(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path in Framework view folder
         */
        views(path?: string): string;

        /**
         * Get json in json configs folder
         */
        jsonConfigs(path?: string): string;
    };

    /**
     * .Env File Reader Helper
     */
    env(key: string, $default?: any): any;

    /*----------------- LOG FUNCTIONS ------------------- */

    /**
     * Log
     */
    log(...args): void;

    /**
     * Log Info
     */
    logInfo(...args): void;

    /**
     * Log only if not console
     */
    logIfNotConsole(...args): void;

    /**
     * Log and exit
     * @param args
     */
    logAndExit(...args): void;

    /**
     * Log Error
     * @param args
     */
    logError(...args): void;

    /**
     * Log Error And Exit
     * @param args
     */
    logErrorAndExit(...args): void;

    /**
     * Log Per Line
     */
    logPerLine($args: any[], $spacePerLine?: boolean): void;
}
