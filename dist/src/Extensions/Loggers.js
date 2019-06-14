"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
/**
 * Log Function
 * @param {*} args
 */
$.log = (...args) => {
    if (!args.length) {
        return console.log("");
    }
    args.unshift("===>");
    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk_1.default.cyanBright(...args));
    }
    return console.log(...args);
};
$.logInfo = (...args) => {
    if (!args.length) {
        return console.log("");
    }
    args.unshift("=>");
    if (args.length === 2 && typeof args[1] === "string") {
        return console.log(chalk_1.default.magentaBright(...args));
    }
    return console.log(...args);
};
$.logIfNotConsole = (...args) => {
    if (!$.$options.isConsole) {
        $.log(...args);
    }
};
$.logAndExit = (...args) => {
    if (args.length) {
        $.log(...args);
    }
    process.exit();
};
$.logError = (...args) => {
    let end = false;
    if (args[args.length - 1] === true) {
        args.splice(args.length - 1, 1);
        end = true;
    }
    console.log(chalk_1.default.redBright(...args));
    if (end) {
        return process.exit();
    }
};
/**
 * @param args
 */
$.logErrorAndExit = (...args) => {
    return $.logError(...args, true);
};
$.logPerLine = ($logs = [], $spacePerLine = false) => {
    console.log();
    for (let i = 0; i < $logs.length; i++) {
        const $log = $logs[i];
        if (typeof $log === "function") {
            $log();
        }
        else if (typeof $log === "object") {
            const key = Object.keys($log)[0];
            $["log" + _.upperFirst(key)]($log[key]);
        }
        else {
            if (typeof $log === "string" && !$log.length) {
                $.log();
            }
            else {
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
