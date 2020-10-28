import PathHelper = require("./Helpers/Path");
import {DollarSign} from "../types";
import {StringToAnyKeyObject} from "./CustomTypes";

declare const $: DollarSign;

/**
 * PluginRoutes -  holds all plugins routes.
 */
const pluginRoutes = [] as any[];

/**
 * PluginNamespaceToData - Holds plugin data using namespaces as keys.
 */
const PluginNamespaceToData: StringToAnyKeyObject = {};

/**
 * Check if plugin file exists or throw error.
 * @param plugin
 * @param pluginPath
 * @param file
 */
const pluginPathExistOrExit = (plugin: string, pluginPath: string, file: string) => {
    /**
     * ResolvedRoutePath - get file real path,
     * Just in any case smartPaths are used.
     */
    const ResolvedRoutePath = PathHelper.resolve(file, false);

    if (file === ResolvedRoutePath) {
        // Merge plugin base path to file.
        file = pluginPath + "/" + file;
    } else {
        // file is ResolvedPath
        file = ResolvedRoutePath;
    }

    // If file or folder does not exists throw error.
    if (!$.file.exists(file)) {
        return $.logPerLine([
            {error: plugin},
            {error: `REQUIRED FILE or DIR MISSING: ${file}`},
            {errorAndExit: ""},
        ], true);
    }

    // return real path.
    return file;
};

/**
 * @class PluginEngine
 */
class PluginEngine {

    /**
     * Load plugins and process their use.json,
     */
    public static async loadPlugins() {
        // get logs.plugins config.
        const logPlugins = $.$config.get("log.plugins", true);
        // Hold Plugins
        let plugins = [] as any[];
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

                const pluginPaths = {};
                const pluginData = {};

                /**
                 * We want to log all plugin names before loading them.
                 * Just in any case plugins have logs it does not interfere with the plugin names list.
                 */
                $.ifNotConsole(() => {
                    if (logPlugins) {
                        for (const plugin of plugins) {
                            // get plugin real path.
                            const $pluginPath: string = pluginPaths[plugin] = PathHelper.resolve(plugin);

                            try {
                                const $data = pluginData[plugin] = PluginEngine.loadPluginUseData(plugin, $pluginPath);
                                /**
                                 * If {log.plugins===true} then display log
                                 */
                                $.logSuccess(`Using Plugin --> {${$data.namespace}}`);
                            } catch (e) {
                                // Throw any error from processing and stop xpresser.
                                $.logPerLine([
                                    {error: plugin},
                                    {error: e.stack},
                                    {errorAndExit: ""},
                                ], true);
                            }
                        }
                    } else {
                        const pluginsLength = plugins.length
                        $.ifNotConsole(
                            () => $.logSuccess(`Using (${pluginsLength}) ${pluginsLength === 1 ? 'plugin' : 'plugins'}`)
                        );
                    }
                });


                /**
                 * Loop through plugins found and process them using PluginEngine.loadPluginUseData
                 */
                for (const plugin of plugins) {
                    if (plugin.length) {
                        // get plugin real path.
                        const $pluginPath: string = pluginPaths[plugin] || PathHelper.resolve(plugin);

                        // Try processing plugin use.json
                        try {

                            const $data = pluginData[plugin] || PluginEngine.loadPluginUseData(plugin, $pluginPath);
                            // tslint:disable-next-line:max-line-length
                            PluginNamespaceToData[$data.namespace] = await PluginEngine.usePlugin(plugin, $pluginPath, $data);

                            // Save to engineData
                            $.engineData.set("PluginEngine:namespaces", PluginNamespaceToData);
                        } catch (e) {
                            // Throw any error from processing and stop xpresser.
                            $.logPerLine([
                                {error: plugin},
                                {error: e.stack},
                                {errorAndExit: ""},
                            ], true);
                        }
                    }
                }
            }
        }

        // return processed plugin routes.
        return {routes: pluginRoutes};
    }

    /**
     * Read plugins use.json
     * @param plugin
     * @param pluginPath
     */
    public static loadPluginUseData(plugin: string, pluginPath: string) {
        const data = require(pluginPath + "/use.json");
        if (!data.namespace) {
            throw new Error(`Cannot read property 'namespace'`);
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
                const extensionData: StringToAnyKeyObject = {};
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
                    await run(pluginData);
                }
            }
        }

        // return processed Plugin Data
        return pluginData;
    }

}

export = PluginEngine;
