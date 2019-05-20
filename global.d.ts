type ObjectCollection = import("./src/helpers/ObjectCollection");
type Base64 = import("./src/helpers/Base64");
type ObjectValidator = import("object-validator-pro");
type DB = import("./src/database/Db");
type UseEngine = import("./src/UseEngine");
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
    base64: Base64;

    // Object validator
    ovp: ObjectValidator;

    // Database
    db: DB;

    // Use Engine
    use: UseEngine;

    // Bcrypt
    bcrypt: Bcrypt;

    // Set Helpers
    helpers: Helpers.Main;

    // Router Helper
    router: XpresserRouter;

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

    /*----------------- PATH FUNCTIONS ------------------- */

    /**
     * Get path in base folder.
     */
    basePath(path?: string, returnRequire?: boolean): string | any;

    /**
     * Get path in backend folder
     */
    backendPath(path?: string, returnRequire?: boolean): string | any;

    /**
     * Get path in storage folder
     */
    storagePath(path?: string, returnRequire?: boolean): string | any;
}
