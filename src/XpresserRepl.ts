import path = require("path");
import fs = require("fs")
import {REPLServer} from "repl";
import {DollarSign} from "../types";


type FnWithDollarSignArgument = (xpresserInstance: DollarSign) => (void | any);
type FnReturnsDollarSign = () => DollarSign;

class XpresserRepl {

    started: boolean = false;

    data: {
        commandPrefix: string,
        configProvider: (() => any),
        xpresserProvider?: FnReturnsDollarSign,
        beforeStart?: FnWithDollarSignArgument,
        historyFile?: string
    } = {
        commandPrefix: 'xpresser>',
        configProvider() {
            return {}
        },
    }

    context: Record<string, any> = {};
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
    hasBeforeStartFn() {
        return typeof this.data.beforeStart === "function"
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
     * Run a function before start
     *
     * This function gives you the opportunity to extend xpresser instance used before starting repl.
     *
     * @param run
     *
     * @example
     * repl.extendXpresser(($) => {
     *     $.on.boot(() => {
     *          $.logInfo('Log before repl start.')
     *     })
     * })
     *
     */
    beforeStart(run: FnWithDollarSignArgument): this {
        this.data.beforeStart = run;
        return this;
    }

    /**
     * Add Data to context
     * @param key
     * @param value
     */
    addContext(key: string | Record<string, any>, value?: any): this {
        if (this.started) {
            throw Error(`addContext(): cannot be used after repl server has started, use replServer.context instead`);
        }

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
    async buildInstance(): Promise<DollarSign> {
        const {init} = require('xpresser');
        const config = await this.data.configProvider();

        return init(config, {
            requireOnly: true,
            isConsole: true
        }) as DollarSign;
    }

    /**
     * Start repl
     */
    async start(onReplStart?: FnWithDollarSignArgument): Promise<this> {
        const repl = require('repl');
        const chalk = require('chalk');
        const _ = require('lodash');

        // Holds xpresser instance i.e ($)
        let xpr: DollarSign;

        /**
         * if this repl has a custom xpresser provider,
         * load it, else try to build an instance.
         */
        if (this.hasXpresserProvider()) {
            xpr = await (this.data.xpresserProvider as FnReturnsDollarSign)();
        } else {
            xpr = await this.buildInstance();
        }

        // Throw error if xpr is undefined for any unknown reason.
        if (!xpr) {
            throw Error('Xpresser instance is undefined!');
        }

        xpr.on.boot(async (next) => {
            // Add DollarSign
            this.context.$ = xpr;

            // Log Welcome Message
            console.log(chalk.gray('>>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>>'))
            console.log(chalk.white(`Xpresser Repl Session.`));
            console.log()
            console.log(`Env: ${chalk.yellow(xpr.config.get('env'))}`)
            console.log(`Name: ${chalk.yellow(xpr.config.get('name'))}`)
            console.log()
            console.log(chalk.white(`Use ${chalk.whiteBright('.end')} to end repl session.`))
            console.log(chalk.gray('<<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<<'))

            // If has before start, run it.
            if (this.hasBeforeStartFn()) {
                await (this.data.beforeStart as any)(xpr)
            }

            return next();
        })

        // Start Repl on boot
        xpr.on.boot(async () => {

            // Start Repl
            this.server = repl.start({
                prompt: chalk.cyanBright(`${this.data.commandPrefix.trim()} `),
                useColors: true,
                terminal: true,
            });

            // Set Repl history
            const replHistory = this.data.historyFile || xpr.path.storage('framework/.repl_history');
            if (!fs.existsSync(replHistory)) {
                xpr.file.makeDirIfNotExist(replHistory, true);
            }

            this.server.setupHistory(
                replHistory,
                (err) => {
                    if (err) throw err;
                }
            );

            // Add End helper
            this.server.defineCommand('end', {
                help: 'End repl session.',
                action() {
                    xpr.log("Goodbye! See you later...");
                    xpr.exit();
                }
            });

            this.server.defineCommand('clearHistory', {
                help: 'Clear repl history.',
                action() {
                    try {
                        fs.unlinkSync(replHistory);
                        xpr.log("History cleared, restart repl!");
                        xpr.exit();
                    } catch (e) {
                        console.log(e.stack)
                    }
                }
            })

            this.server.defineCommand('ls', {
                help: 'List context in current session.',
                action: (context) => {

                    if (context) {
                        if (!_.has(this.context, context)) {
                            xpr.logError(`No context with name: ${context}`)
                            return this.server.displayPrompt();
                        }

                        const contextValue = _.get(this.context, context);

                        if (typeof contextValue === "object") {
                            mapAndLogContext(chalk, xpr, contextValue);
                            return this.server.displayPrompt();
                        }

                        console.log(`${chalk.yellowBright(context)}:`, typeof (contextValue));
                        return this.server.displayPrompt();
                    }

                    // Map through  context entries and log them
                    mapAndLogContext(chalk, xpr, this.context);
                    this.server.displayPrompt();
                }
            });

            if (typeof onReplStart === "function") {
                await onReplStart(xpr);
            }


            // Merge with this context
            Object.assign(this.server.context, this.context);

            // Set repl to started
            this.started = true;
        })

        // Boot Xpresser
        xpr.boot();

        return this;
    }

    /**
     * Requires Files and adds then to context.
     * @example
     * repl.addContextFromFiles({
     *     User: 'backend/models/User.js',
     *     Mailer: 'backend/lib/Mailer.js'
     * })
     * @param files
     * @param as
     * @param interceptor
     */
    addContextFromFiles(files: { [contextName: string]: string }, as?: string | null, interceptor?: (context: any) => any): this {
        const contentNames = Object.keys(files);
        const context: Record<string, any> = {};

        for (const contextName of contentNames) {
            try {
                const file = path.resolve(files[contextName])
                context[contextName] = interceptor ? interceptor(require(file)) : require(file);
            } catch (e) {
                throw e
            }
        }

        return as ? this.addContext(as, context) : this.addContext(context);
    }

    /**
     * Requires Files and adds then to context.
     * @example
     * repl.addContextFromFiles('backend/models')
     * @param folder
     * @param as
     * @param extensions
     * @param interceptor
     */
    addContextFromFolder(folder: string, as?: string | null, extensions?: string[] | null, interceptor?: (context: any) => any): this {
        /**
         * Import get all files helper
         */
        const {getAllFiles} = require("./Functions/inbuilt.fn");
        const {camelCase} = require('lodash');

        folder = path.resolve(folder);

        // Allowed Extensions
        let allowedExtensions = ['js', 'ts'];
        if (extensions)
            allowedExtensions = allowedExtensions.concat(extensions);

        const files = getAllFiles(folder);
        const context: Record<string, any> = {};

        for (const file of files) {
            const extension = file.split('.').pop();
            if (allowedExtensions.includes(extension)) {
                let shortFilePath = file.replace(folder, '');
                shortFilePath = shortFilePath.substr(0, shortFilePath.length - `.${extension}`.length)

                const contextName = capitalize(camelCase(shortFilePath));

                try {
                    context[contextName] = interceptor ? interceptor(require(file)) : require(file);
                } catch (e) {
                    throw e
                }
            }
        }

        return as ? this.addContext(as, context) : this.addContext(context);
    }
}

/**
 * Capitalize Text
 * @param s
 */
const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Get Type of context
 * @param context
 */
const getTypeOfContext = (context: any) => {
    if (context) {
        if (typeof context === 'object' && context.constructor && context.constructor.name) {
            return context.constructor.name;
        } else if (typeof context === 'function' && context.name) {
            return context.name;
        }
    }

    return typeof context;
}

/**
 * Map and log context.
 * @param chalk
 * @param xpr
 * @param entries
 */
const mapAndLogContext = (chalk: any, xpr: DollarSign, entries: any) => {
    Object.entries(entries).forEach(([entry, value]) => {
        if (value === xpr) {
            console.log(`${chalk.yellowBright(entry)}:`, 'XpresserInstance ($)');
        } else {
            console.log(`${chalk.yellowBright(entry)}:`, getTypeOfContext(value));
        }
    })
}

export = XpresserRepl;