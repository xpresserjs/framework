import {REPLServer} from "repl";

class XpresserRepl {
    data: {
        commandPrefix: string,
        configProvider: (() => any),
        xpresserProvider: null | (() => any),
        xpresserExtender: null | (() => any),
    } = {
        commandPrefix: 'xpresser>',
        configProvider() {
            return {}
        },
        xpresserProvider: null,
        xpresserExtender: null,
    }

    context: any = {};
    server: REPLServer | null = null;

    constructor(config: string) {
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
     * @param configProvider
     */
    setConfigProvider(configProvider: string | (() => any)) {

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
    }

    /**
     * Set repl XpresserProvider
     * @param xpresserProvider
     */
    setXpresserProvider(xpresserProvider: (() => any)) {
        this.data.xpresserProvider = xpresserProvider;
    }

    /**
     * Set Command Prefix
     * @param commandPrefix
     */
    setCommandPrefix(commandPrefix: string) {
        this.data.commandPrefix = commandPrefix;
    }

    /**
     * Extend Xpresser Instance
     * @param xpresserExtender
     */
    extendXpresser(xpresserExtender) {
        this.data.xpresserExtender = xpresserExtender;
    }

    /**
     * Add Data to context
     * @param key
     * @param value
     */
    addToContext(key, value) {
        if (typeof key === "string") {
            this.context[key] = value;
        } else if (typeof key === "object") {
            Object.assign(this.context, key)
        }
    }

    /**
     * Try to Build Instance
     */
    buildInstance() {
        const xpresser = require('xpresser');
        const config = this.data.configProvider();

        return xpresser.init(config, {
            requireOnly: true,
            isConsole: true,
            exposeDollarSign: false
        })
    }

    /**
     * start repl
     */
    start() {
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

            Object.assign(myRepl.context, this.context);


            // Set Server to this instance.
            this.server = myRepl;
        })

        // Boot Xpresser
        xpr.boot();
    }
}

export = XpresserRepl;