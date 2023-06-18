import {getInstance} from "../../index";
import {parseControllerString} from "../Functions/internals.fn";
import lodash from "lodash";
import os from "os";
import fs from "fs";
import fse from "fs-extra";
import Artisan from "../Functions/artisan.fn";
import colors from "../Objects/consoleColors.obj";
import PathHelper from "../Helpers/Path";

const $ = getInstance();
const artisanConfig: any = $.config.get('artisan', {});
const {logThis, logThisAndExit} = Artisan;

/**
 * Remove slash at the end of str passed
 * @param str
 */
const removeSlashAtEnd = (str: string) => {
    if (str.slice(-1) === "/") {
        return str.slice(0, str.length - 1);
    }

    return str;
};

/**
 * PathHelper to maintenance file
 */
const maintenanceFile = $.path.base('.maintenance');


const Commands = {
    /**
     * Enable Maintenance Mood
     */
    up() {
        if (!fs.existsSync(maintenanceFile)) {
            return $.logAndExit('App is already up')
        }

        fs.unlinkSync(maintenanceFile);

        $.log('App is now up!');
        $.logAndExit('Reload your server if you have an active getInstance already running.')
    },

    /**
     * Disabled Maintenance Mood
     */
    down() {
        if (fs.existsSync(maintenanceFile)) {
            return $.logAndExit('App is already down.')
        }

        fs.writeFileSync(maintenanceFile, JSON.stringify({
            date: (new Date()).toUTCString()
        }));

        $.log('App is now in maintenance mood!');
        $.logAndExit('Reload your server if you have an active getInstance already running.')

    },

    /**
     * @deprecated
     * @param $plugin
     */
    install([$plugin]: string[]) {
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
    routes([search, query]: string[]) {
        if (search && !query) {
            query = search;
            search = 'path';
        }

        if (search === 'ctrl') search = 'controller';
        if (search === 'method' && query) query = query.toUpperCase();

        let data: any[] = [];

        data = $.routerEngine.allProcessedRoutes();
        data.map((e) => {
            e.method = e.method.toUpperCase();

            if (typeof e.controller === "string") {
                const {controller, method} = parseControllerString(e.controller);
                e.controller = `${controller}.${method}`;
            }

            if (typeof e.controller === "function") {
                if (e.controller.name) {
                    e.controller = e.controller.name;
                    if (e.controller.indexOf("getFile(") !== 0) {
                        e.controller += '()'
                    } else {
                        e.controller = e.controller.replace($.path.base(), '')
                    }
                } else {
                    e.controller = "anonymous()"
                }
            }

            if (!e.controller) e.controller = '';

            if (!e.name) e.name = null;

            // Hide Url since path is showing already
            delete e.url;

        })

        const searchResults: any = [];
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

    /**
     * Make Job
     * @param args
     */
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

    /**
     * Generate Events File.
     * @param args
     */
    "make:event"(args: string[]) {
        const name = args[0];
        const namespace = args[1];

        const eventsPath = $.path.events();
        Artisan.copyFromFactoryToApp("event", name, eventsPath, {name, namespace}, false);

        return $.exit();
    },

    /**
     * Generate Controller file.
     * @param args
     */
    "make:controller"(args: string[]) {
        const controller = args[0];

        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp("controller", controller, controllersPath);

        return $.exit();
    },

    /**
     * Generate Controller Object
     * @param args
     */
    "make:controller_object"(args: string[]) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp(["controller", "controller_object"], controller, controllersPath);

        return $.exit();
    },

    /**
     * Generate Controller with Services
     * @param args
     */
    "make:controller_services"(args: string[]) {
        const controller = args[0];
        if (typeof controller === "undefined") {
            return logThis("Controller name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers());
        Artisan.copyFromFactoryToApp(["controller", "controller_with_services"], controller, controllersPath);

        return $.exit();
    },

    /**
     * Generate Controller Service.
     * @param args
     */
    "make:controllerService"(args: string[]) {
        const service = args[0];

        if (typeof service === "undefined") {
            return logThis("Service name not defined!");
        }

        const controllersPath = removeSlashAtEnd($.path.controllers("services"));
        Artisan.copyFromFactoryToApp(["CService", "controller_service"], service, controllersPath);

        return $.exit();
    },

    /**
     * Generate Middleware file.
     * @param args
     */
    "make:middleware"(args: string[]) {
        const middleware = args[0];
        if (typeof middleware === "undefined") {
            return logThis("Middleware name not defined!");
        }

        const middlewaresPath = PathHelper.resolve($.config.get('paths.middlewares'));
        Artisan.copyFromFactoryToApp("middleware", middleware, middlewaresPath);

        return $.exit();
    },


    /**
     * Make Model File.
     * @param args
     */
    "make:model"(args: string[]) {
        let name: string = args[0];
        let table: string = args[1];

        if (typeof name === "undefined") {
            return logThis("Model name not defined!");
        }

        if (typeof table === "undefined") {
            table = lodash.snakeCase(PathHelper.path().basename(name));
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

    /**
     * Make View File.
     * @param args
     */
    "make:view"(args: string[]) {
        const config = $.config.get('template');
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

        if (name.substring(0, 2) !== "__" && fs.existsSync(fullPath)) {
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

    /**
     * Import importable files
     * @param plugin
     * @param folder
     * @param overwrite
     */
    import([plugin, folder, shouldOverwrite]: string[]) {
        const overwrite = shouldOverwrite === 'overwrite';

        if (plugin.toLowerCase() === 'xpresser') {
            return this.importFiles(folder, overwrite);
        }

        const allowedImportables = [
            "configs",
            "models",
            "views",
            "events",
            "controllers",
            "middlewares",
        ]

        folder = folder.toLowerCase();
        // @ts-ignore
        if (!allowedImportables.includes(folder))
            return $.logErrorAndExit(`Import does not support any importable folder named (${folder})`);

        // Get config
        const config = $.engineData.get(`PluginEngine:namespaces[${plugin}]`);

        if (!config)
            return $.logErrorAndExit(`No plugin namespaced {${plugin}} registered in your project`);

        const importable = config.importable || config.publishable;
        if (!importable)
            return $.logErrorAndExit(`Plugin: {${plugin}} does not have any importables`);


        let importableFactory = importable[folder];
        if (!importableFactory)
            return $.logErrorAndExit(`Plugin: {${plugin}} does not have any importable item named (${folder})`);

        if (importable.hasOwnProperty(folder + '.ts') && $.isTypescript()) {
            importableFactory = importable[folder + '.ts'];
        }

        const from = config.path + '/' + importableFactory;
        if (!fs.existsSync(from))
            return $.logErrorAndExit(`File/Folder {${importableFactory}} does not exists in plugin (${plugin}) directory.`)


        // @ts-ignore
        let to: string = $.path[folder](lodash.kebabCase(config.namespace))

        if ($.file.isFile(from)) {
            const ext = PathHelper.getExtension(from);
            if (ext) to += ext;

            PathHelper.makeDirIfNotExist(to, true);
        } else {
            PathHelper.makeDirIfNotExist(to);
        }

        // Copy Folders
        fse.copy(from, to, {overwrite})
            .then(() => {
                const base = $.path.base();

                $.logInfo(`From: (${from.replace(base, '')})`)
                $.logInfo(`To: (${to.replace(base, '')})`)

                $.logAndExit('Publish completed!')
            })
            .catch(err => {
                $.logError('An error occurred while publishing the folder.')
                return $.logAndExit(err)
            })
    },


    /**
     * Import Factory files like e.g typescript types.
     */
    async importFiles(folder: string, overwrite: boolean) {
        if (folder !== 'types') {
            return $.logErrorAndExit(`Xpresser does not have any importable item named (${folder})`);
        }

        const base = $.path.base();
        const typesDestination = $.path.backend('types');
        const factoryTypesFolder = $.path.engine('Factory/types');

        /**
         * If typesDestination exits, make
         */
        if (fs.existsSync(typesDestination)) {
            try {
                for (const type of ['index', 'modules', 'xpresser']) {
                    const from = `${factoryTypesFolder}/${type}.d.ts`;
                    const to = `${typesDestination}/${type}.d.ts`;

                    await fse.copy(from, to, {overwrite});

                    $.logInfo(`From: (${from.replace(base, '')})`);
                    $.logInfo(`To: (${to.replace(base, '')})`);
                }

                $.logAndExit('Import completed!')
            } catch (e) {
                return $.logAndExit(e);
            }
        } else {
            $.file.makeDirIfNotExist(typesDestination);

            fse.copy(factoryTypesFolder, typesDestination, {overwrite})
                .then(() => {

                    $.logInfo(`From: (${factoryTypesFolder.replace(base, '')})`)
                    $.logInfo(`To: (${typesDestination.replace(base, '')})`)

                })
                .catch(err => {
                    $.logError('An error occurred while publishing the folder.')
                    return $.logAndExit(err)
                })
        }
    }
};

export = {Commands, Artisan};
