/// <reference path="node.d.ts" />
/// <reference path="helpers.d.ts" />
/// <reference path="./types/object-collection.d.ts" />

import XpresserRouter = require("@xpresser/router");
import ObjectCollection = require("object-collection");
import ObjectValidatorPro = require("object-validator-pro");
import UseEngine = require("./src/UseEngine");
import DB = require("./src/Database/Db");
import {Server} from "net";
import ModelEngine = require("./src/ModelEngine");
import RouterEngine = require("./src/RouterEngine");
import Controller = require("./src/Classes/Controller");

/*--- Declare Types ---*/
declare type TodoFunction = (next?: any) => any;
/*--- End Declare Types ---*/

declare namespace XpresserJsonSettings {
    interface Use {
        middlewares?: object;
    }
}

declare interface XpresserEventEmitter {
    /**
     * Emit Registered Events
     * @param event
     * @param payload
     */
    emit(event: string, ...payload): void;
}

declare interface Xpresser {
    config: any;
    options: XpresserOptions;
    $config: ObjectCollection;

    // Stores Engine Data
    engineData: ObjectCollection;

    // Base64 Encoder
    base64: XpresserHelpers.Base64;

    // Object validator
    ovp: ObjectValidatorPro;

    // Database
    db: DB;

    // Use Engine
    use: typeof UseEngine;

    // Set XpresserHelpers
    helpers: XpresserHelpers.Main;

    // Router Helper
    router: XpresserRouter;

    // Register Functions
    fn: XpresserHelpers.FN;

    // Express App
    app: import("express").Application;

    // Server Variables
    http: Server;
    https: Server;

    // Model Engine
    model: typeof ModelEngine;

    // Router Engine
    routerEngine: typeof RouterEngine;

    // Controller
    controller: Controller | any;

    // Events
    events: XpresserEventEmitter;

    /*----------------- ON FUNCTIONS ------------------- */
    on: {
        /**
         * Returns events object.
         */
        events(): object;
        boot(todo: TodoFunction | TodoFunction[]): void;
        expressInit(todo: TodoFunction | TodoFunction[]): void;
        bootServer(todo: TodoFunction | TodoFunction[]): void;
        http(todo: TodoFunction | TodoFunction[]): void;
        https(todo: TodoFunction | TodoFunction[]): void;
    };

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
         * Get path in Events Folder
         */
        events(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path controllers folder
         */
        controllers(path?: string, returnRequire?: boolean): string | any;

        /**
         * Get path in Framework view folder
         */
        views(path?: string): string;

        /**
         * Get path in Framework view folder
         */
        models(path?: string, returnRequire?: boolean): string;

        /**
         * Get json in json configs folder
         */
        jsonConfigs(path?: string): string;
    };

    /* --------------- Boot Function ------------------- */
    boot(): void;

    /**
     * Return new instance of object collection.
     * @param [obj]
     */
    objectCollection(obj?: object): ObjectCollection;

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
     * Log only if not Console
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

    /**
     * If Boot session is or not console.
     */
    ifConsole(isConsole: () => void, notConsole: () => void): void;

    /**
     * If Boot session is console.
     */
    ifIsConsole(run: () => void): void;

    /**
     * If Boot session isNot console.
     */
    ifNotConsole(run: () => void): void;
}
