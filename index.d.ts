/// <reference path="node.d.ts" />
/// <reference path="./types/helpers.d.ts" />

type XpresserRouter = import("@xpresser/router");
type ObjectCollection = import("object-collection");
type ObjectValidatorPro = import("object-validator-pro");

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
    ovp: ObjectValidatorPro;

    // Database
    db: import("./src/Database/Db");

    // Use Engine
    use: typeof import("./src/UseEngine");

    // Set XjsHelpers
    helpers: XjsHelpers.Main;

    // Router Helper
    router: XpresserRouter;

    // Register Functions
    fn: XjsHelpers.FN;

    // Express App
    app: import("express").Application;

    // Server Variables
    http: import("net").Server;
    https: import("net").Server;

    // Model Engine
    model: typeof import("./src/ModelEngine");

    // Router Engine
    routerEngine: typeof import("./src/RouterEngine");

    // Controller
    controller: import("./src/Classes/Controller") | any;

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
         * Get path in Framework view folder
         */
        models(path?: string, returnRequire?: boolean): string;

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
}
