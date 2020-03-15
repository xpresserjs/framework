"use strict";
const os = require("os");
const fs = require("fs");
const shellJs = require("shelljs");
const Artisan = require("../Functions/artisan.fn");
const artisanConfig = $.config.artisan;
const colors = require("../Objects/consoleColors.obj");
const PathHelper = require("../Helpers/Path");
const logThis = Artisan.logThis;
const logThisAndExit = Artisan.logThisAndExit;
/**
 * Remove slash at the end of str passed
 * @param str
 */
const removeSlashAtEnd = (str) => {
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
    "make:job"(args) {
        const job = args[0];
        let command = args[1];
        if (typeof job === "undefined") {
            return logThis("Job name not defined!");
        }
        if (typeof command === "undefined") {
            command = job.trim();
        }
        const jobsPath = $.path.backend("jobs");
        Artisan.copyFromFactoryToApp("job", job, jobsPath, { name: job, command }, false);
        return $.exit();
    },
    "make:event"(args) {
        const name = args[0];
        const namespace = args[1];
        const eventsPath = $.path.events();
        Artisan.copyFromFactoryToApp("event", name, eventsPath, { name, namespace }, false);
        return $.exit();
    },
    "make:controller"(args) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }
        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp("controller", controller, controllersPath);
        return $.exit();
    },
    "make:controller_object"(args) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }
        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp(["controller", "controller_object"], controller, controllersPath);
        return $.exit();
    },
    "make:controller_services"(args) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }
        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp(["controller", "controller_with_services"], controller, controllersPath);
        return $.exit();
    },
    "make:controllerService"(args) {
        const service = args[0];
        if (typeof service === "undefined") {
            return logThis("Service name not defined!");
        }
        const controllersPath = removeSlashAtEnd($.path.controllers("services"));
        Artisan.copyFromFactoryToApp(["CService", "controller_service"], service, controllersPath);
        return $.exit();
    },
    "make:middleware"(args) {
        const middleware = args[0];
        if (typeof middleware === "undefined") {
            return logThis("Middleware name not defined!");
        }
        const middlewaresPath = PathHelper.resolve($.config.paths.middlewares);
        Artisan.copyFromFactoryToApp("middleware", middleware, middlewaresPath);
        return $.exit();
    },
    "make:model"(args) {
        let name = args[0];
        let table = args[1];
        if (typeof name === "undefined") {
            return logThis("Model name not defined!");
        }
        if (typeof table === "undefined") {
            table = _.snakeCase(PathHelper.path().basename(name));
        }
        if (artisanConfig.singleModelName) {
            name = Artisan.singular(name);
        }
        if (artisanConfig.pluralizeModelTable) {
            table = Artisan.pluralize(table);
        }
        const modelPath = $.path.models();
        Artisan.copyFromFactoryToApp("model", name, modelPath, { name, table });
        $.exit();
    },
    "make:view"(args) {
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
    "migrate"(args) {
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
        }
        else {
            shellJs.exec(`knex migrate:latest --knexfile=${filePath}`);
        }
        fs.unlinkSync(filePath);
        return $.exit();
    },
};
module.exports = { Commands, Artisan };
