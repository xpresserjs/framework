"use strict";
const FS = require("fs");
const PathHelper = require("./Helpers/Path");
const pluginRoutes = [];
const PluginNamespaceToData = {};
const pluginFileExistOrExit = ($plugin, $pluginPath, $file) => {
    const ResolvedRoutePath = PathHelper.resolve($file, false);
    if ($file === ResolvedRoutePath) {
        $file = ResolvedRoutePath;
    }
    $file = $pluginPath + "/" + $file;
    if (!FS.existsSync($file)) {
        return $.logPerLine([
            { error: $plugin },
            { error: `REQUIRED FILE or DIR MISSING: ${$file}` },
            { errorAndExit: "" },
        ], true);
    }
    return $file;
};
class PluginEngine {
    static loadPlugins() {
        let plugins = [];
        const PluginsPath = $.path.jsonConfigs("plugins.json");
        if (FS.existsSync(PluginsPath)) {
            try {
                plugins = require(PluginsPath);
            }
            catch (e) {
                $.logError(e);
            }
            if (plugins.length) {
                for (let i = 0; i < plugins.length; i++) {
                    const $plugin = plugins[i];
                    if ($plugin.length) {
                        const $pluginPath = PathHelper.resolve($plugin);
                        try {
                            const $data = PluginEngine.loadPluginUseData($plugin, $pluginPath);
                            // tslint:disable-next-line:max-line-length
                            PluginNamespaceToData[$data.namespace] = PluginEngine.usePlugin($plugin, $pluginPath, $data);
                            $.engineData.set("PluginEngine:namespaces", PluginNamespaceToData);
                            /**
                             * If {log.plugins.enabled===true} then display log
                             */
                            if ($.$config.get("log.plugins.enabled", true)) {
                                $.logIfNotConsole(`Using plugin --> {${$data.namespace}}`);
                            }
                        }
                        catch (e) {
                            $.logPerLine([
                                { error: $plugin },
                                { error: e.message },
                                { errorAndExit: "" },
                            ], true);
                        }
                    }
                }
            }
        }
        return { routes: pluginRoutes };
    }
    static loadPluginUseData($plugin, $pluginPath) {
        const data = require($pluginPath + "/use.json");
        if (!data.namespace) {
            throw new Error(`Cannot read property 'namespace'`);
        }
        return data;
    }
    static usePlugin($plugin, $path, data) {
        const $data = $.objectCollection(data);
        let $pluginData;
        $pluginData = {
            namespace: $data.get("namespace"),
            plugin: $plugin,
            path: $path,
        };
        if ($data.has("paths.routesFile")) {
            let RoutePath = $data.get("paths.routesFile");
            RoutePath = pluginFileExistOrExit($plugin, $path, RoutePath);
            pluginRoutes.push({ plugin: $plugin, path: RoutePath });
        }
        if ($data.has("paths.controllers")) {
            let controllerPath = $data.get("paths.controllers");
            controllerPath = pluginFileExistOrExit($plugin, $path, controllerPath);
            $pluginData.controllers = controllerPath;
        }
        if ($data.has("paths.views")) {
            let viewsPath = $data.get("paths.views");
            viewsPath = pluginFileExistOrExit($plugin, $path, viewsPath);
            $pluginData.views = viewsPath;
        }
        if ($data.has("paths.migrations")) {
            let migrationPath = $data.get("paths.migrations");
            migrationPath = pluginFileExistOrExit($plugin, $path, migrationPath);
            $pluginData.migrations = migrationPath;
        }
        if ($data.has("paths.models")) {
            let modelPath = $data.get("paths.models");
            modelPath = pluginFileExistOrExit($plugin, $path, modelPath);
            $pluginData.models = modelPath;
        }
        if ($data.has("paths.middlewares")) {
            let middlewarePath = $data.get("paths.middlewares");
            middlewarePath = pluginFileExistOrExit($plugin, $path, middlewarePath);
            $pluginData.middlewares = middlewarePath;
        }
        if ($data.has("extends")) {
            const extensionData = {};
            if ($data.has("extends.RequestEngine")) {
                const $extenderPath = $data.get("extends.RequestEngine");
                extensionData["RequestEngine"] = pluginFileExistOrExit($plugin, $path, $extenderPath);
            }
            $pluginData.extends = extensionData;
        }
        return $pluginData;
    }
}
module.exports = PluginEngine;
