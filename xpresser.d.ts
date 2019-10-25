import ObjectValidatorPro = require("object-validator-pro");
import UseEngine = require("./src/UseEngine");
import DB = require("./src/Database/Db");
import {Server} from "net";
import ModelEngine = require("./src/ModelEngine");
import RouterEngine = require("./src/RouterEngine");
import Controller = require("./src/Classes/Controller");
import ControllerService = require("./src/Controllers/ControllerService");
import {XpresserController} from "./types/http";

/*--- Declare Types ---*/
type XpresserRouter = import("@xpresser/router");
type ObjectCollection = import("object-collection");
type TodoFunction = (next?: any) => any;

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

    /**
     * Emit Event after some seconds.
     *
     * This is equivalent to calling .emit in a setTimeOut function.
     * @param time
     * @param event
     * @param payload
     */
    emitAfter(time: number, event: string, ...payload): void;

    /**
     * Emit event with callback.
     *
     * Data returned in your event is passed as the first parameter
     * in your callback.
     * @param event
     * @param args
     * @param callback
     */
    emitWithCallback(event: string, args: any[], callback: (eventResult) => any): void;
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
    controller: Controller;

    // Events
    events: XpresserEventEmitter;

    // FileEngine
    file: {
        /**
         * Return Node fs instance
         * @return {*}
         */
        fs(): any;

        /**
         * Return Node fs-extra instance
         * @return {*}
         */
        fsExtra(): any;

        /**
         * Check file size.
         * @param $path
         */
        size($path: string): number;

        /**
         * IsFIle
         * @param $path
         */
        isFile($path: string): boolean;

        /**
         * isSymbolicLink
         * @param $path
         */
        isSymbolicLink($path: string): boolean;

        /**
         * isDirectory
         * @param $path
         */
        isDirectory($path: string): boolean;

        /**
         * Get/Read File
         * @param $path
         * @param $options
         */
        get($path: string, $options?: { encoding?: string, flag?: string }): string | Buffer | false;

        /**
         * Get/Read File
         * @param $path
         * @param $options
         */
        read($path: string, $options?: { encoding?: string, flag?: string }): string | Buffer | false;

        /**
         * Get Directory
         * @param $path
         * @param $options
         */
        getDirectory($path: string, $options?: {
            encoding?: string,
            writeFileTypes?: string,
        }): string[] | Buffer[] | false;

        /**
         * Read Directory
         * @param $path
         * @param $options
         */
        readDirectory($path: string, $options?: {
            encoding?: string,
            writeFileTypes?: string,
        }): string[] | Buffer[] | false;

        /**
         * Check if a path or an array of paths exists.
         *
         * if $returnList is true and $path is an array,
         * the list of files found will be returned.
         * @param {string|string[]} $path - Path or Paths to find.
         * @param {boolean} $returnList - Return list of found files in array.
         */
        exists($path: string | string[], $returnList?): boolean | string[];

        /**
         * Check if a path or an array of paths exists.
         *
         * if $returnList is true and $path is an array,
         * the list of files found will be returned.
         * @param {string|string[]} $path - Path or Paths to find.
         * @param {boolean} $returnList - Return list of found files in array.
         * @param $deleteDirectories
         */
        delete($path: string | string[], $returnList?, $deleteDirectories?): boolean | string[];
    };

    /*----------------- ON FUNCTIONS ------------------- */
    on: {
        /**
         * Returns events object.
         */
        events(): object;

        /**
         * Add `on.boot` middleware.
         *
         * This middleware will run when xpresser boots.
         * They are the first in the cycle.
         * @param todo
         */
        boot(todo: TodoFunction | TodoFunction[]): void;

        /**
         * Add `on.expressInit` middleware.
         *
         * This middleware runs when express is initiated
         * i.e `$.app` is available.
         * @param todo
         */
        expressInit(todo: TodoFunction | TodoFunction[]): void;

        /**
         * Add `on.bootServer` middleware.
         * @param todo
         */
        bootServer(todo: TodoFunction | TodoFunction[]): void;

        /**
         * Add `on.http` middleware.
         *
         * This middleware runs after `$.http` is available.
         * @param todo
         */
        http(todo: TodoFunction | TodoFunction[]): void;

        /**
         * Add `on.https` middleware.
         * This middleware runs after `$.http` is available.
         * @param todo
         */
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
     * Same as `process.exit`
     */
    exit(...args: any): void;

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

    /**
     * Controller Request ControllerService
     * @param controller
     */
    handler(controller: XpresserController.ControllerObject | any): ControllerService;
}
