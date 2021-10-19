import PathHelper = require("./Helpers/Path");

import {getInstance} from "../index";
import InXpresserError from "./Errors/InXpresserError";
import {convertPluginArrayToObject, pluginPathExistOrExit} from "./Functions/plugins.fn";

const $ = getInstance();

/**
 * PluginRoutes -  holds all plugins routes.
 */
const pluginRoutes = [] as any[];

/**
 * PluginNamespaceToData - Holds plugin data using namespaces as keys.
 */
const PluginNamespaceToData: Record<string, any> = {};


/**
 * @class PluginEngine
 */
class PluginEngine {

    /**
     * Load plugins and process their use.json,
     */
    public static async loadPlugins(PackageDotJson: Record<string, any>) {
        // get logs.plugins config.
        const logPlugins = $.config.get("log.plugins", true);
        // Hold Plugins
        let plugins!: Record<string, (boolean | Record<string, any>)>;
        // Get plugins.json path.
        const PluginsPath = $.path.jsonConfigs("plugins.json");

        /**
         * Check if plugins.json exists
         * if yes, we load plugins else no plugins defined.
         */
        if ($.file.exists(PluginsPath)) {
            // Try to require PluginsPath
            try {
                plugins = require(PluginsPath);
            } catch (e) {
                // Log Error and continue
                // Expected: Json Errors
                $.logError(e);
            }

            if (Array.isArray(plugins) && plugins.length) {
                $.logDeprecated(
                    "0.5.0",
                    "0.5.0",
                    [
                        'Using {{array in plugins.json}} is deprecated, change your plugin.jsons contents to this generated object below.',
                        null, null,
                        JSON.stringify(convertPluginArrayToObject(plugins), null, 2)
                    ],
                    false
                );

                $.logErrorAndExit('Fix plugins.json and reload server.');
            }

            /**
             * Load plugins if plugins is an object.
             */
            if (typeof plugins === "object") {
                // Holds all defined plugin keys
                const pluginKeys = Object.keys(plugins);

                // Holds current app env.
                const env = $.config.get('env');

                // Caches plugin paths.
                const pluginPaths: Record<string, any> = {};

                // Caches plugin Data
                const pluginData: Record<string, any> = {};


                /**
                 * Loop through and process plugins.
                 *
                 * We want to log all plugin names before loading them.
                 * Just in any case plugins have logs it does not interfere with the plugin names list.
                 *
                 * Also check if a particular plugin is meant for the environment your project is in.
                 */
                const loadedPlugins: typeof plugins = {};
                for (const plugin of pluginKeys) {
                    const pluginUseDotJson = plugins[plugin]
                    if (typeof pluginUseDotJson === "boolean" && !pluginUseDotJson)
                        continue;

                    if (typeof pluginUseDotJson === "object") {

                        if (pluginUseDotJson.hasOwnProperty('load') &&
                            pluginUseDotJson.load === false) {
                            continue;
                        }

                        if (pluginUseDotJson.hasOwnProperty('env')) {
                            if (typeof pluginUseDotJson.env === "string" && pluginUseDotJson.env !== env)
                                continue;

                            if (Array.isArray(pluginUseDotJson.env) && !pluginUseDotJson.env.includes(env))
                                continue;
                        }
                    }

                    loadedPlugins[plugin] = pluginUseDotJson;
                }


                /**
                 * Start Processing loaded plugins
                 */
                const listOfPluginNamespaces: string[] = [];
                for (const plugin of Object.keys(loadedPlugins)) {
                    // get plugin real path.
                    const $pluginPath: string = pluginPaths[plugin] = PathHelper.resolve(plugin);

                    try {
                        const $data = pluginData[plugin] = PluginEngine.loadPluginUseData($pluginPath, PackageDotJson);
                        listOfPluginNamespaces.push($data.namespace);
                    } catch (e) {
                        // Throw any error from processing and stop xpresser.
                        $.logPerLine([
                            {error: plugin},
                            {error: e},
                            {errorAndExit: ""},
                        ], true);
                    }
                }

                $.ifNotConsole(() => {
                    if (logPlugins) {
                        $.logSuccess(`Using plugins: [${listOfPluginNamespaces.join(', ')}]`)
                    } else {
                        const pluginsLength = listOfPluginNamespaces.length;
                        $.logSuccess(`Using (${pluginsLength}) ${pluginsLength === 1 ? 'plugin' : 'plugins'}`)
                    }
                })


                for (const plugin of Object.keys(loadedPlugins)) {
                    if (plugin.length) {
                        // get plugin real path.
                        const $pluginPath: string = pluginPaths[plugin];

                        // Try processing plugin use.json
                        try {
                            const $data = pluginData[plugin];
                            PluginNamespaceToData[$data.namespace] = await PluginEngine.usePlugin(
                                plugin, $pluginPath, $data
                            );

                            // Save to engineData
                            $.engineData.set("PluginEngine:namespaces", PluginNamespaceToData);
                        } catch (e) {
                            // Throw any error from processing and stop xpresser.
                            $.logPerLine([
                                {error: plugin},
                                {error: e},
                                {errorAndExit: ""},
                            ], true);
                        }
                    }
                }
            } else {
                $.logWarning('Plugins not loaded! Typeof plugins is expected to be an object.')
            }
        }

        // return processed plugin routes.
        return {routes: pluginRoutes};
    }

    /**
     * Read plugins use.json
     * @param pluginPath
     * @param PackageDotJson
     */
    public static loadPluginUseData(pluginPath: string, PackageDotJson: Record<string, any>) {
        const data = require(pluginPath + "/use.json");
        if (!data.namespace) {
            throw new InXpresserError(`Cannot read property 'namespace'`);
        }

        /**
         * Version checker
         */
        if (data.xpresser) {
            const version = data.xpresser;
            if (version.substr(0, 2) === ">=" && !(PackageDotJson.version >= version.substr(2))) {
                $.logErrorAndExit(
                    `Plugin: [${data.namespace}] requires xpresser version [${version}], upgrade xpresser to continue.`
                );
            } else if (
                version.substr(0, 2) === "<=" &&
                !(PackageDotJson.version <= version.substr(2))
            ) {
                $.logErrorAndExit(
                    `Plugin: [${data.namespace}] requires xpresser version [${version}], upgrade xpresser to continue.`
                );
            }
        }

        return data;
    }

    /**
     * Process Plugin use.json
     * @param plugin
     * @param path
     * @param data
     */
    public static async usePlugin(plugin: string, path: string, data: object) {
        const $data = $.objectCollection(data);
        let pluginData: any;

        // Set plugin Data
        pluginData = {
            namespace: $data.get("namespace"),
            plugin,
            path,
            paths: {},
        };

        // check if plugin has routesFile
        if ($data.has("paths.routesFile")) {
            let RoutePath = $data.get("paths.routesFile");

            RoutePath = pluginPathExistOrExit(plugin, path, RoutePath);

            pluginRoutes.push({plugin, path: RoutePath});
        }

        // check if plugin use.json has paths.controllers
        if ($data.has("paths.controllers")) {
            let controllerPath = $data.get("paths.controllers");
            controllerPath = pluginPathExistOrExit(plugin, path, controllerPath);
            pluginData.paths.controllers = controllerPath;
        }


        $.ifNotConsole(() => {
            // check if plugin use.json has paths.views
            if ($data.has("paths.views")) {
                let viewsPath = $data.get("paths.views");
                viewsPath = pluginPathExistOrExit(plugin, path, viewsPath);
                pluginData.paths.views = viewsPath;
            }

            // check if plugin use.json has paths.middlewares
            if ($data.has("paths.middlewares")) {
                let middlewarePath = $data.get("paths.middlewares");
                middlewarePath = pluginPathExistOrExit(plugin, path, middlewarePath);
                pluginData.paths.middlewares = middlewarePath;
            }

            // check if plugin use.json has extends
            if ($data.has("extends")) {
                const extensionData: Record<string, any> = {};
                if ($data.has("extends.RequestEngine")) {
                    const extenderPath = $data.get("extends.RequestEngine");
                    extensionData["RequestEngine"] = pluginPathExistOrExit(plugin, path, extenderPath);
                }

                pluginData.extends = extensionData;
            }

        });

        $.ifIsConsole(() => {

            if ($data.has('publishable')) {
                pluginData.publishable = $data.get('publishable')
            }

            if ($data.has('importable')) {
                pluginData.publishable = $data.get('importable')
            }

            // check if plugin use.json has paths.Commands only if console
            if ($data.has("paths.commands")) {
                let commandPath = $data.get("paths.commands");
                commandPath = pluginPathExistOrExit(plugin, path, commandPath);
                pluginData.paths.commands = commandPath;

                const cliCommandsPath = path + "/cli-commands.json";

                if ($.file.isFile(cliCommandsPath)) {
                    pluginData.commands = {};

                    const cliCommands = require(cliCommandsPath);
                    if (cliCommands && Array.isArray(cliCommands)) {
                        for (const command of cliCommands) {
                            let commandAction = command['action'];

                            if (!commandAction) {
                                commandAction = command.command.split(" ")[0];
                            }

                            pluginData.commands[commandAction] = pluginPathExistOrExit(plugin, commandPath, command.file);
                        }
                    }
                }
            }
        });


        // check if plugin uses index file.
        const useIndex = $data.get('use_index', false);
        if (useIndex) {

            /**
             * Check for typescript plugins.
             *
             * If in typescript mode we check for base file.
             */
            const isCustomFile = typeof useIndex === "string";
            const pluginIndexFile = isCustomFile ? useIndex : 'index.js';
            const indexFilePath: void | string = pluginPathExistOrExit(plugin, path, pluginIndexFile);

            if (indexFilePath) {
                const {run} = require(indexFilePath);
                if (run) {
                    await run(pluginData, $);
                }
            }
        }

        // return processed Plugin Data
        return pluginData;
    }

}

export = PluginEngine;
