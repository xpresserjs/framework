const chalk = require("chalk");
import lodash from "lodash";
import {getInstance} from "../../index";

const $ = getInstance();

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

$.logError = (...args) => {
    let end = false;
    if (args[args.length - 1] === true) {
        args.splice(args.length - 1, 1);
        end = true;
    }

    console.log(chalk.redBright(...args));

    if (end) {
        return $.exit();
    }
};

$.logErrorAndExit = (...args) => {
    return $.logError(...args, true);
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
