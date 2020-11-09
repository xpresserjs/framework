import {REPLServer} from "repl";
import {DollarSign} from "../types";
import {StringToAnyKeyObject} from "./CustomTypes";

type FnWithDollarSignArgument = (xpresserInstance: DollarSign) => (void | any);
type FnReturnsDollarSign = () => DollarSign;
type OnReplStartFn = (replServer: REPLServer, $: DollarSign) => (void | any);

class XpresserRepl {

    data: {
        commandPrefix: string,
        configProvider: (() => any),
        xpresserProvider?: FnReturnsDollarSign,
        xpresserExtender?: FnWithDollarSignArgument,
    } = {
        commandPrefix: 'xpresser>',
        configProvider() {
            return {}
        },
    }

    context: any = {};
    server!: REPLServer;

    constructor(config?: string) {
        if (config) this.setConfigProvider(config);
    }

    /**
     * Check if repl has custom xpresser provider
     */
    hasXpresserProvider(): boolean {
        return typeof this.data.xpresserProvider === "function"
    }

    /**
     * Check if repl has custom xpresser extender
     */
    hasXpresserExtender() {
        return typeof this.data.xpresserExtender === "function"
    }

    /**
     * Set repl ConfigProvider
     * @example
     * // Provide relative path.
     * repl.setConfigProvider('./path/to/config');
     * // Or provide function that returns config
     * repl.setConfigProvider(() => ({
     *     env: process.env.NODE_ENV,
     *     paths: {base: __dirname}
     * }));
     * @param configProvider
     */
    setConfigProvider(configProvider: string | (() => any)): this {

        // Import Required Modules
        const fs = require('fs');
        const path = require('path')

        if (typeof configProvider === "string") {
            const configPath = path.resolve(configProvider);
            if (!fs.existsSync(configPath)) {
                throw Error(`Config path not found! {${configPath}}`)
            }
            this.data.configProvider = () => require(configPath);
        } else if (typeof configProvider === "function") {
            this.data.configProvider = configProvider;
        }

        return this;
    }

    /**
     * Set repl XpresserProvider
     *
     * In some cases you may have a special xpresser setup, you can pass a custom xpresser provider.
     *
     * The xpresser instance should not be booted. the repl class will boot it on
     * `repl.start()`
     *
     * @example
     * // Pass a function that returns an xpresser instance i.e DollarSign
     * repl.setXpresserProvider(() => {
     *     const {init} = require('xpresser');
     *
     *     return init({
     *          // your xpresser config
     *      }, {
     *          requireOnly:true,
     *          isConsole: true
     *      });
     * })
     * @param xpresserProvider
     */
    setXpresserProvider(xpresserProvider: FnReturnsDollarSign): this {
        this.data.xpresserProvider = xpresserProvider;
        return this;
    }

    /**
     * Set Command Prefix
     * @param commandPrefix
     */
    setCommandPrefix(commandPrefix: string): this {
        this.data.commandPrefix = commandPrefix;
        return this;
    }

    /**
     * Extend Xpresser Instance
     *
     * This function gives you the opportunity to extend xpresser instance used before starting repl.
     *
     * @param xpresserExtender
     *
     * @example
     * repl.extendXpresser(($) => {
     *     $.on.boot(() => {
     *          $.logInfo('Log before repl start.')
     *     })
     * })
     */
    extendXpresser(xpresserExtender: FnWithDollarSignArgument): this {
        this.data.xpresserExtender = xpresserExtender;
        return this;
    }

    /**
     * Add Data to context
     * @param key
     * @param value
     */
    addToContext(key: string | StringToAnyKeyObject, value): this {
        if (typeof key === "string") {
            this.context[key] = value;
        } else if (typeof key === "object") {
            Object.assign(this.context, key)
        }

        return this;
    }

    /**
     * Try to Build Instance
     */
    buildInstance(): DollarSign {
        const {init} = require('xpresser');
        const config = this.data.configProvider();

        return init(config, {
            requireOnly: true,
            isConsole: true,
            exposeDollarSign: false
        }) as DollarSign;
    }

    /**
     * Start repl
     */
    start(onReplStart?: OnReplStartFn) {
        const repl = require('repl');
        const chalk = require('chalk');

        // Holds xpresser instance i.e ($)
        let xpr;

        /**
         * if this repl has a custom xpresser provider,
         * load it, else try to build an instance.
         */
        if (this.hasXpresserProvider()) {
            xpr = (this.data.xpresserProvider as any)();
        } else {
            xpr = this.buildInstance();
        }

        // Throw error if xpr is undefined for any unknown reason.
        if (!xpr) {
            throw Error('Xpresser instance is undefined!');
        }

        // Log Welcome Message
        console.log(chalk.greenBright(`>>>>> Xpresser Repl!`));

        // If has xpresser extender, run it.
        if (this.hasXpresserExtender()) {
            (this.data.xpresserExtender as any)(xpr)
        }

        // Start Repl on boot
        xpr.on.boot(() => {
            // Start Repl
            const myRepl = repl.start(chalk.cyanBright(`${this.data.commandPrefix.trim()} `));
            myRepl.context.$ = xpr;

            // Add End helper
            myRepl.defineCommand('end', () => {
                xpr.log("Goodbye! See you later...");
                xpr.exit();
            });

            // Merge with this context
            Object.assign(myRepl.context, this.context);

            // Set Server to this instance.
            this.server = myRepl;

            if (typeof onReplStart === "function") {
                onReplStart(myRepl, xpr);
            }
        })

        // Boot Xpresser
        xpr.boot();
    }
}

export = XpresserRepl;