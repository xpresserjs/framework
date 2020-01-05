import {DollarSign} from "../../types";

declare const $: DollarSign;
declare const _: any;

import os = require("os");
import fs = require("fs");
import shellJs = require("shelljs");

import Artisan = require("../Functions/artisan.fn");

const artisanConfig = $.config.artisan;
import colors = require("../Objects/consoleColors.obj");
import PathHelper = require("../Helpers/Path");

const logThis = Artisan.logThis;
const logThisAndExit = Artisan.logThisAndExit;

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
        Artisan.copyFromFactoryToApp("job", job, jobsPath, {name: job, command}, false);

        return $.exit();
    },

    "make:event"(args: string[]) {
        const name = args[0];
        const namespace = args[1];

        const eventsPath = $.path.events();
        Artisan.copyFromFactoryToApp("event", name, eventsPath, {name, namespace}, false);

        return $.exit();
    },

    "make:controller"(args: string[]) {
        const controller = args[0];

        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp("controller", controller, controllersPath);

        return $.exit();
    },

    "make:controller_object"(args: string[]) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp(["controller", "controller_object"], controller, controllersPath);

        return $.exit();
    },

    "make:controller_services"(args: string[]) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp(["controller", "controller_with_services"], controller, controllersPath);

        return $.exit();
    },

    "make:controllerService"(args: string[]) {
        const service = args[0];

        if (typeof service === "undefined") {
            return logThis("Service name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers("services"));
        Artisan.copyFromFactoryToApp(["CService", "controller_service"], service, controllersPath);

        return $.exit();
    },

    "make:middleware"(args: string[]) {
        const middleware = args[0];
        if (typeof middleware === "undefined") {
            return logThis("Middleware name not defined!");
        }

        const middlewaresPath = PathHelper.resolve($.config.paths.middlewares);
        Artisan.copyFromFactoryToApp("middleware", middleware, middlewaresPath);

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
            name = Artisan.singular(name);
        }

        if (artisanConfig.pluralizeModelTable) {
            table = Artisan.pluralize(table);
        }

        const modelPath = $.path.models();
        Artisan.copyFromFactoryToApp("model", name, modelPath, {name, table});

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
        const env = $.$config.get("env", "development");

        if (!Object.keys($config).length) {
            return $.logErrorAndExit("Database config not found.");
        }

        if ($config.migrations && !$config.migrations.stub) {
            $config.migrations.stub = $.path.engine("Factory/migration.js");
        }

        const data = JSON.stringify({
            [env]: $config,
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

export = {Commands, Artisan};
