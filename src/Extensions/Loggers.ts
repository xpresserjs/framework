import chalk = require("chalk");
import os = require("os");
import lodash from "lodash";
import {getInstance} from "../../index";
import {touchMyMustache} from "../Functions/inbuilt.fn";

const $ = getInstance();

const isDebugEnabled = $.config.sync<boolean>('debug.enabled', true);
const depWarnings = $.config.sync<{ enabled: boolean, showStack: boolean }>('debug.deprecationWarnings');

$.log = (...args) => {
    if (!args.length) {
        return console.log("");
    }

    args.unshift(chalk.white("=>"));

    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk.cyanBright(...args));
    }

    return console.log(...args);
};

$.logCalmly = (...args) => {
    if (!args.length) {
        return console.log("");
    }

    args.unshift(chalk.white("=>"));

    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk.white(...args));
    }

    return console.log(...args);
};

$.logDeprecated = (since: string, removedAt: string, message: string | string[], hasStack = true) => {

    // Check if messages.
    if (Array.isArray(message)) {
        const m: (string | null)[] = message;

        for (const i in m) {
            if (m[i] === null) {
                m[i] = os.EOL;
            } else {
                m[i] += ' ';
            }
        }

        message = message.join('').trim();
    }

    const mustaches = touchMyMustache(message);
    if (mustaches.length) {
        mustaches.forEach(m => {
            // remove mustache
            const withoutMustache = m.replace('{{', '').replace('}}', '');
            message = (message as string).replace(m, chalk.cyan(withoutMustache))
        });
    }

    const config = depWarnings.sync;
    if (isDebugEnabled.sync && config.enabled) {

        console.log(chalk.gray('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'))
        console.log(chalk.whiteBright(`!! DEPRECATED ALERT !!`));

        if (hasStack && config.showStack) {
            console.log(chalk.white(os.EOL + message));
            console.trace()
            console.log();
        } else {
            console.log(chalk.white(os.EOL + message + os.EOL));
        }

        console.log(
            chalk.whiteBright(`Since: `) + chalk.white(since) + `, ` +
            chalk.whiteBright(`To be removed: `) + chalk.white(removedAt)
        );
        console.log(chalk.gray('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'))
    }
};


$.logInfo = (...args) => {
    if (!args.length) {
        return console.log("");
    }

    args.unshift("=>");

    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk.magentaBright(...args));
    }

    return console.log(...args);
};

$.logSuccess = (...args) => {
    if (!args.length) {
        return console.log("");
    }

    args.unshift("✔✔");

    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk.greenBright(...args));
    }

    return console.log(...args);
};

$.logWarning = (...args) => {
    if (!args.length) {
        return console.log("");
    }

    args.unshift("!!");

    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk.yellow(...args));
    }

    return console.log(...args);
};

$.logIfNotConsole = (...args) => {
    if (!$.options.isConsole) {
        $.log(...args);
    }
};

$.logAndExit = (...args) => {
    if (args.length) {
        $.log(...args);
    }
    return $.exit();
};

$.logError = (error: any, exit: boolean = false) => {

    if (error instanceof Error) {
        console.log(chalk.redBright(error.stack ? error.stack : error));
    } else if (typeof error === "string") {
        console.log(chalk.redBright(error));
    } else {
        console.error(error);
    }

    if (exit) {
        return $.exit();
    }
};

$.logErrorAndExit = (error: any) => {
    return $.logError(error, true);
};

$.logPerLine = ($logs = [], $spacePerLine = false) => {

    console.log();
    for (let i = 0; i < $logs.length; i++) {
        const $log = $logs[i];

        if (typeof $log === "function") {

            $log();

        } else if (typeof $log === "object") {
            const key = Object.keys($log)[0];

            // @ts-ignore
            $["log" + lodash.upperFirst(key)]($log[key]);

        } else {
            if (typeof $log === "string" && !$log.length) {
                $.log();
            } else {
                $.log($log);
            }
        }

        if ($spacePerLine) {
            $.log();
        }
    }
    console.log();
};

$.env = (key, $default) => {
    if (typeof process.env[key] === "undefined") {
        return $default;
    }

    return process.env[key];
};
