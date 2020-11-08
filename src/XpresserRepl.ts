import {REPLServer} from "repl";

class XpresserRepl {
    data: {
        configProvider: (() => any),
        xpresserProvider: null | (() => any),
        xpresserExtender: null | (() => any),
    } = {
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

    hasXpresserProvider() {
        return typeof this.data.xpresserProvider === "function"
    }

    hasXpresserExtender() {
        return typeof this.data.xpresserExtender === "function"
    }

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

    setXpresserProvider(xpresserProvider: (() => any)) {
        this.data.xpresserProvider = xpresserProvider;
    }

    extendXpresser(xpresserExtender) {
        this.data.xpresserExtender = xpresserExtender;
    }

    addToContext(key, value) {
        if (typeof key === "string") {
            this.context[key] = value;
        } else if (typeof key === "object") {
            Object.assign(this.context, key)
        }
    }

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
        xpr.log("Xpresser Repl...");

        // If has xpresser extender, run it.
        if (this.hasXpresserExtender()) {
            (this.data.xpresserExtender as any)(xpr)
        }

        // Start Repl on boot
        xpr.on.boot(() => {
            // Start Repl
            const myRepl = repl.start("xpresser$ ");
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