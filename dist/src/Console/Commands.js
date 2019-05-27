"use strict";
const os = require("os");
const PATH = require("path");
const fs = require("fs-extra");
const shellJs = require("shelljs");
const artisan = require("../Functions/artisan.fn");
const artisanConfig = $.config.artisan;
const colors = require("../Objects/consoleColors.obj");
const PathHelper = require("../Helpers/Path");
const logThis = artisan.logThis;
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
        artisan.copyFromFactoryToApp("job", job, jobsPath, { name: job, command }, false);
    },
    "make:controller"(args) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }
        const controllersPath = removeSlashAtEnd($.path.controllers());
        artisan.copyFromFactoryToApp("controller", controller, controllersPath);
    },
    "make:middleware"(args) {
        const middleware = args[0];
        if (typeof middleware === "undefined") {
            return logThis("Middleware name not defined!");
        }
        const middlewaresPath = PathHelper.resolve($.config.path.middlewares);
        artisan.copyFromFactoryToApp("middleware", middleware, middlewaresPath);
    },
    "make:model"(args) {
        let name = args[0];
        let table = args[1];
        if (typeof name === "undefined") {
            return logThis("Model name not defined!");
        }
        if (typeof table === "undefined") {
            table = name;
        }
        if (artisanConfig.singleModelName) {
            name = artisan.singular(name);
        }
        if (artisanConfig.pluralizeModelTable) {
            table = artisan.pluralize(name.toLowerCase());
        }
        const modelPath = PathHelper.resolve($.config.paths.models);
        artisan.copyFromFactoryToApp("model", name, modelPath, { name, table });
    },
    "make:view"(args) {
        const config = $.config.template;
        let name = args[0];
        let defaultContent = "";
        if (typeof name === "undefined") {
            return logThis("View name not defined!");
        }
        if (name === "--routes") {
            defaultContent = $.base64.encode($.routerEngine.nameToUrl());
            defaultContent = "<script>" + os.EOL +
                "window['--routes'] = '" + defaultContent + "';" + os.EOL +
                "</script>";
        }
        name += "." + config.extension;
        const viewsPath = PATH.dirname($.path.views(name));
        if (!fs.existsSync(viewsPath)) {
            fs.mkdirpSync(viewsPath);
        }
        const fullPath = $.path.views(name);
        if (name.substr(0, 2) !== "--" && fs.existsSync(fullPath)) {
            return artisan.logThisAndExit("view {" + colors.fgYellow + name + colors.fgCyan + "} already exits!");
        }
        if (!defaultContent.length) {
            const defaultContentFile = $.path.views("_." + config.extension);
            if (fs.existsSync(defaultContentFile)) {
                defaultContent = fs.readFileSync(defaultContentFile).toString();
            }
        }
        fs.writeFileSync(fullPath, defaultContent);
        artisan.logThis("View created successfully!");
        artisan.logThisAndExit("Located @ " + fullPath);
    },
    "publish:views"() {
        return artisan.copyFolder($.path.engine("backend/views"), $.path.backend("views"));
    },
    "migrate"(args) {
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
        }
        else {
            shellJs.exec(`knex migrate:latest --knexfile=${filePath}`);
        }
        fs.unlinkSync(filePath);
    },
};
module.exports = Commands;
//# sourceMappingURL=Commands.js.map