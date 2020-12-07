// Type definitions for [Xpresser] [*]
// Project: Xpresser
// Definitions by: TrapCodeIO <https://xpresserjs.com>

import {Helpers} from "./helpers";
import Net from "net";
import express from "express";
import ObjectCollection from "object-collection";
import XpresserRouter from "@xpresser/router";
import {Controller as HttpController} from "./http";

type NumberToAnyKeyObject = Record<number, any>;

declare namespace Xpresser {

    export type isNode = false | {
        ts: { baseFolder: string }
    }

    export type Router = XpresserRouter;

    /**
     * Xpresser Options
     */
    export interface Options {
        requireOnly?: boolean;
        autoBoot?: boolean;
        isConsole?: boolean;
        isTinker?: boolean;
        exposeDollarSign?: boolean;
        instanceId?: string;
    }

    /**
     * Xpresser EventEmitter
     */
    export interface EventEmitter {
        /**
         * Emit Registered Events
         * @param event
         * @param payload
         */
        emit(event: string, ...payload: any[]): void;

        /**
         * Emit Event after some seconds.
         *
         * This is equivalent to calling .emit in a setTimeOut function.
         * @param time
         * @param event
         * @param payload
         */
        emitAfter(time: number, event: string, ...payload: any[]): void;

        /**
         * Emit event with callback.
         *
         * Data returned in your event is passed as the first parameter
         * in your callback.
         * @param event
         * @param args
         * @param callback
         */
        emitWithCallback(event: string, args: any[], callback: (eventResult: any) => any): void;


        /**
         * Define Event.
         * @param event
         * @param run
         *
         * @example
         * $.events.define('greet', () => $.logInfo('Hello!'));
         * // Call
         * $.events.emit('greet')
         */
        define(event: string, run: (...args: any[]) => void | any): void;
    }

    export type TodoFunction = (next: () => void, $: DollarSign) => any;

    export interface DollarSign {
        config: ObjectCollection;
        options: Options;

        // Stores Engine Data
        engineData: ObjectCollection;
        // Serves as store for user
        store: ObjectCollection;

        // Base64 Encoder
        base64: Helpers.Base64;

        // Use Engine
        use: typeof import("../src/UseEngine");

        // Set XpresserHelpers
        helpers: Helpers.Main;

        // Router Helper
        router: XpresserRouter;

        /**
         * Xpresser Ex Util holder.
         * changed to $.utils
         *
         * @deprecated
         * ToBeRemoved:v2.0
         * Use $.utils instead
         */
        fn: Helpers.Util;

        /**
         * Utils holder.
         * changed from $.fn to $.utils
         */
        utils: Helpers.Util;

        /**
         * Modules hold
         */
        modules: Helpers.Modules;

        // Express App
        app: express.Application;

        // Server Variables
        http: Net.Server;
        https: Net.Server;

        // Router Engine
        routerEngine: typeof import("../src/RouterEngine");

        // Controller
        /**
         * Import ControllerClass from "xpresser" instead.
         * @deprecated
         */
        controller: typeof import("../src/Classes/ControllerClass");

        // Events
        events: EventEmitter;

        // FileEngine
        file: {
            /**
             * Return Node fs getInstance
             * @return {*}
             */
            fs(): any;

            /**
             * Return Node fs-extra getInstance
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
            get($path: string, $options?: { encoding?: null, flag?: string }): string | Buffer | false;

            /**
             * Get/Read File
             * @param $path
             * @param $options
             */
            read($path: string, $options?: { encoding?: null, flag?: string }): string | Buffer | false;

            /**
             * Get Directory
             * @param $path
             * @param $options
             */
            getDirectory($path: string, $options?: {
                encoding?: null,
                writeFileTypes?: string,
            }): string[] | Buffer[] | false;

            /**
             * Read Directory
             * @param $path
             * @param $options
             */
            readDirectory($path: string, $options?: {
                encoding?: null,
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
            exists($path: string | string[], $returnList?: boolean): boolean | string[];

            /**
             * Check if a path or an array of paths exists.
             *
             * if $returnList is true and $path is an array,
             * the list of files found will be returned.
             * @param {string|string[]} $path - Path or Paths to find.
             * @param {boolean} $returnList - Return list of found files in array.
             * @param $deleteDirectories
             */
            delete($path: string | string[], $returnList?: boolean, $deleteDirectories?: boolean): boolean | string[];


            /**
             * Requires a json file by reading file and parsing to json.
             * Throws error if file does not exists
             */
            readJson($path: string): Record<string, any> | NumberToAnyKeyObject | any[];

            /**
             * Save content to a json file.
             * saveToJson uses JSON.stringify() to parse object to string before saving to file.
             * @param $path - Path of file to save to
             * @param $content - Content to save to file
             * @param $options
             */
            saveToJson($path: string, $content: Record<string, any> | NumberToAnyKeyObject | any[], $options?: {
                checkIfFileExists?: boolean,
                replacer?: (this: any, key: string, value: any) => any,
                space?: number
            }): boolean;

            /**
             * Makes a dir if it does not exist.
             * @param $path
             * @param $isFile
             */
            makeDirIfNotExist($path: string, $isFile?: boolean): any
        };

        /*----------------- ON FUNCTIONS ------------------- */
        on: {
            /**
             * Returns events object.
             */
            events(): Record<string, any>;

            /**
             * Add `on.start` middleware.
             *
             * This middleware will run when xpresser starts.
             * They are the first in the cycle.
             * @param todo
             */
            start(todo: TodoFunction | TodoFunction[]): void;

            /**
             * Add `on.boot` middleware.
             *
             * This middleware will run when xpresser boots.
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
             * This middleware runs after `$.https` is available.
             * @param todo
             */
            https(todo: TodoFunction | TodoFunction[]): void;

            /**
             * Add `on.serverBooted` middleware.
             * This middleware runs after `server has booted` is available.
             * @param todo
             */
            serverBooted(todo: TodoFunction | TodoFunction[]): void;

            [key: string]: any
        };

        /*----------------- PATH FUNCTIONS ------------------- */
        path: {
            /**
             * Resolve smart paths
             * @param path
             * @param resolve
             */
            resolve(path: string | string[], resolve?: boolean): string;

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
             * Get framework storage folder
             * @param path
             */
            frameworkStorageFolder(path?: string): string;

            /**
             * Get path in Framework src folder
             */
            engine(path?: string, returnRequire?: boolean, refresh?: boolean): string | any;

            /**
             * Get path in Events Folder
             */
            events(path?: string, returnRequire?: boolean): string | any;

            /**
             * Get path controllers folder
             */
            controllers(path?: string, returnRequire?: boolean): string | any;

            /**
             * Get path Middleware folder
             * @param path
             * @param returnRequire
             */
            middlewares(path?: string, returnRequire?: boolean): string | any;

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

            /**
             * Get path in configs folder
             */
            configs(path?: string): string;

            /**
             * Get current node_modules directory.
             */
            node_modules(): string;
        };

        /* --------------- Boot Function ------------------- */
        boot(): void;


        /**
         * Configure project for typescript.
         */
        initializeTypescript(filename: string, run?: (isNode: isNode) => void): DollarSign;

        /**
         * Check if project is typescript
         */
        isTypescript(): boolean;

        /**
         * Same as `process.exit`
         */
        exit(...args: any): void;

        /**
         * Return new getInstance of object collection.
         * @param [obj]
         */
        objectCollection(obj?: object | any[]): ObjectCollection;

        /**
         * .Env File Reader Helper
         */
        env(key: string, $default?: any): any;

        /*----------------- LOG FUNCTIONS ------------------- */

        /**
         * Log
         */
        log(...args: any[]): void;

        /**
         * Log Calmly
         */
        logCalmly(...args: any[]): void;

        /**
         * Log Deprecation Message
         */
        logDeprecated(since: string, removedAt: string, message: string | (string | null)[], hasStack?: boolean): void;

        /**
         * Log Info
         */
        logInfo(...args: any[]): void;

        /**
         * Log Info
         */
        logSuccess(...args: any[]): void;


        /**
         * Log Info
         */
        logWarning(...args: any[]): void;

        /**
         * Log only if not Console
         */
        logIfNotConsole(...args: any[]): void;

        /**
         * Log and exit
         * @param args
         */
        logAndExit(...args: any[]): void;

        /**
         * Log Error
         * @param args
         */
        logError(...args: any[]): void;

        /**
         * Log Error And Exit
         * @param args
         */
        logErrorAndExit(...args: any[]): void;

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
        handler(controller: HttpController.Object): HttpController.Handler;
    }

    /*~ If there are types, properties, or methods inside dotted names
     *~ of the module, declare them inside a 'namespace'.
     */
    export namespace JsonSettings {
        interface Use {
            middlewares?: Record<string, any>;
        }
    }

    /**
     * Export global xpresserInstance function as type
     */
    export type InstanceGetter = (instanceId?: string) => DollarSign;
}

export = Xpresser;
