import {DollarSign} from "../../types";

declare const $: DollarSign;
declare const _: any;

import os = require("os");
import fs = require("fs");
import fse = require("fs-extra");

import Artisan = require("../Functions/artisan.fn");

const artisanConfig = $.config.artisan;
import colors = require("../Objects/consoleColors.obj");
import PathHelper = require("../Helpers/Path");

const logThis = Artisan.logThis;
const logSuccess = $.logSuccess;
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

/**
 * Path to maintenance file
 */
const maintenanceFile = $.path.base('.maintenance');


const Commands = {
    up() {
        if (!fs.existsSync(maintenanceFile)) {
            return $.logAndExit('App is already up')
        }

        fs.unlinkSync(maintenanceFile);

        $.log('App is now up!');
        $.logAndExit('Reload your server if you have an active instance already running.')
    },

    down() {
        if (fs.existsSync(maintenanceFile)) {
            return $.logAndExit('App is already down')
        }

        fs.writeFileSync(maintenanceFile, JSON.stringify({
            date: (new Date()).toUTCString()
        }));

        $.log('App is now in maintenance mood!');
        $.logAndExit('Reload your server if you have an active instance already running.')

    },

    install([$plugin]) {
        if ($plugin === "undefined") {
            return logThis("Plugin not specified!");
        }

        const PluginInstaller = require("../Plugins/Installer");
        PluginInstaller($plugin);
    },

    /**
     * List routes in this project
     * @param search
     * @param query
     */
    routes([search, query]) {
        if (search && !query) {
            query = search;
            search = 'path';
        }

        if (search === 'ctrl') search = 'controller';
        if (search === 'method' && query) query = query.toUpperCase();

        let data = [];

        data = $.routerEngine.allProcessedRoutes();
        data.map((e) => {
            e.method = e.method.toUpperCase();

            if (typeof e.controller === "string")
                e.controller = e.controller.replace('@', '.');

            if (!e.controller) e.controller = '';

            if (!e.name) e.name = null;


        })

        const searchResults = [];
        if (search) {
            for (const route of data) {
                if (!route.hasOwnProperty(search)) {
                    console.log(colors.fgRed, `Routes table has no column named: (${search}), ACCEPTED: (method | path | controller | name)`)
                    return $.exit()
                }

                if (route[search] && route[search].includes(query)) {
                    searchResults.push(route)
                }
            }
        }

        data = search ? searchResults : data
        let message = `Total Routes: ${data.length}`;
        if (search) message = `Found Routes: ${data.length} WHERE {column: ${search}, query: ${query}}`;


        if (data.length) {
            console.log(colors.fgCyan);
            console.table(data);
        }
        console.log(colors.fgYellow, message)
        console.log()

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
            table = _.snakeCase(PathHelper.path().basename(name));
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

    publish([plugin, folder]: string[]) {
        const config = $.engineData.get(`PluginEngine:namespaces[${plugin}]`);

        if (!config) {
            $.logErrorAndExit(`No plugin namespaced {${plugin}} registered in your project`)
        }

        const publishable = config.publishable;
        if (!publishable)
            $.logErrorAndExit(`Plugin: {${plugin}} does not have any publishable`);

        const publishableFactory = publishable[folder];

        if (!publishableFactory)
            $.logErrorAndExit(`Plugin: {${plugin}} does not have any publishable folder named (${folder})`);

        if (folder.toLowerCase() === 'configs') {
            const from = config.path + '/' + publishableFactory;
            if (!fs.existsSync(from))
                $.logErrorAndExit(`Folder {${publishableFactory}} does not exists in plugin (${plugin}) directory.`)

            const to = $.path.configs(config.namespace)
            PathHelper.makeDirIfNotExist(to);

            // Copy Folders
            fse.copy(from, to, {overwrite: false, recursive: true})
                .then(() => logThis('Publish completed!'))
                .catch(err => {
                    $.logError('An error occurred while publishing the folder.')
                    return $.logAndExit(err)
                })
        }
    }
};

export = {Commands, Artisan};
