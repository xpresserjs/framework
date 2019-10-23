import {Xpresser} from "../../xpresser";

declare const $: Xpresser;
declare const _: any;

import os = require("os");
import fs = require("fs");
import shellJs = require("shelljs");

import artisan = require("../Functions/artisan.fn");

const artisanConfig = $.config.artisan;
import colors = require("../Objects/consoleColors.obj");
import PathHelper = require("../Helpers/Path");

const logThis = artisan.logThis;
const logThisAndExit = artisan.logThisAndExit;

/**
 * Remove slash at the end of str passed
 * @param str
 */
const removeSlashAtEnd = (str: string) => {
    if (str.substr(-1) === "/") {
        return str.substr(0, str.length - 1);
    }

    return str;
};

const Commands = {
    "install"([$plugin]) {
        if ($plugin === "undefined") {
            return logThis("Plugin not specified!");
        }

        const PluginInstaller = require("../Plugins/Installer");
        PluginInstaller($plugin);
    },
    "make:job"(args: string[]) {
        const job = args[0];
        let command = args[1];

        if (typeof job === "undefined") {
            return logThis("Job name not defined!");
        }

        if (typeof command === "undefined") {
            command = job.trim();
        }

        const jobsPath = $.path.backend("jobs");
        artisan.copyFromFactoryToApp("job", job, jobsPath, {name: job, command}, false);

        return $.exit();
    },

    "make:event"(args: string[]) {
        const name = args[0];
        const namespace = args[1];

        const eventsPath = $.path.events();
        artisan.copyFromFactoryToApp("event", name, eventsPath, {name, namespace}, false);

        return $.exit();
    },

    "make:controller"(args: string[]) {
        const controller = args[0];

        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        artisan.copyFromFactoryToApp("controller", controller, controllersPath);

        return $.exit();
    },

    "make:controller_object"(args: string[]) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        artisan.copyFromFactoryToApp(["controller", "controller_object"], controller, controllersPath);

        return $.exit();
    },

    "make:controller_services"(args: string[]) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        artisan.copyFromFactoryToApp(["controller", "controller_with_services"], controller, controllersPath);

        return $.exit();
    },

    "make:controllerService"(args: string[]) {
        const service = args[0];

        if (typeof service === "undefined") {
            return logThis("Service name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers("services"));
        artisan.copyFromFactoryToApp(["CService", "controller_service"], service, controllersPath);

        return $.exit();
    },

    "make:middleware"(args: string[]) {
        const middleware = args[0];
        if (typeof middleware === "undefined") {
            return logThis("Middleware name not defined!");
        }

        const middlewaresPath = PathHelper.resolve($.config.paths.middlewares);
        artisan.copyFromFactoryToApp("middleware", middleware, middlewaresPath);

        return $.exit();
    },

    "make:model"(args: string[]) {
        let name: string = args[0];
        let table: string = args[1];

        if (typeof name === "undefined") {
            return logThis("Model name not defined!");
        }

        if (typeof table === "undefined") {
            table = _.snakeCase(name);
        }

        if (artisanConfig.singleModelName) {
            name = artisan.singular(name);
        }

        if (artisanConfig.pluralizeModelTable) {
            table = artisan.pluralize(table);
        }

        const modelPath = $.path.models();
        artisan.copyFromFactoryToApp("model", name, modelPath, {name, table});

        $.exit();
    },

    "make:view"(args: string[]) {
        const config = $.config.template;
        let name = args[0];
        let defaultContent = "";

        if (typeof name === "undefined") {
            return logThis("View name not defined!");
        }

        if (name === "__routes") {
            defaultContent = $.base64.encode($.routerEngine.nameToUrl());
            defaultContent = "<script>" + os.EOL +
                "window['--routes'] = '" + defaultContent + "';" + os.EOL +
                "</script>";
        }

        name += "." + config.extension;

        const fullPath = $.path.views(name);
        PathHelper.makeDirIfNotExist(fullPath, true);

        if (name.substr(0, 2) !== "__" && fs.existsSync(fullPath)) {
            return logThisAndExit("view {" + colors.fgYellow + name + colors.fgCyan + "} already exits!");
        }

        if (!defaultContent.length) {
            const defaultContentFile = $.path.views("_." + config.extension);
            if (fs.existsSync(defaultContentFile)) {
                defaultContent = fs.readFileSync(defaultContentFile).toString();
            }
        }

        fs.writeFileSync(fullPath, defaultContent);
        logThis("View created successfully!");
        logThis("Located @ " + fullPath);

        return $.exit();
    },

    "migrate"(args: string[]) {
        const $config = $.$config.get("database.config", {});

        if (!Object.keys($config).length) {
            return $.logErrorAndExit("Database config not found.");
        }

        const data = JSON.stringify({
            [$.$config.get("env", "development")]: $config,
        }, null, 2);
        const fileContent = `module.exports = ${data};`;
        const filePath = $.path.base("knexfile.js");
        const migrations = $.path.base("migrations");

        PathHelper.makeDirIfNotExist(migrations);

        fs.writeFileSync(filePath, fileContent);

        if (args.length) {
            shellJs.exec(`knex migrate:${args.join(" ")} --knexfile=${filePath}`);
        } else {
            shellJs.exec(`knex migrate:latest --knexfile=${filePath}`);
        }

        fs.unlinkSync(filePath);
        return $.exit();
    },
};

export = Commands;
