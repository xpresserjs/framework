"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const FS = require("fs");
const ObjectCollection_1 = __importDefault(require("./helpers/ObjectCollection"));
const Path_1 = __importDefault(require("./helpers/Path"));
let plugins = [];
const pluginRoutes = [];
const PluginNamespaceToData = {};
try {
    plugins = require($.path.jsonConfigs("plugins.json"));
}
catch (e) {
    // Do Absolutely Nothing
}
const pluginFileExistOrExit = ($plugin, $pluginPath, $file) => {
    const ResolvedRoutePath = Path_1.default.resolve($file, false);
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
        if (plugins.length) {
            for (let i = 0; i < plugins.length; i++) {
                const $plugin = plugins[i];
                const $pluginPath = Path_1.default.resolve($plugin);
                try {
                    const $data = PluginEngine.loadPluginUseData($plugin, $pluginPath);
                    PluginNamespaceToData[$data.namespace] = PluginEngine.usePlugin($plugin, $pluginPath, $data);
                    $.engineData.set("PluginEngine:namespaces", PluginNamespaceToData);
                    $.logInfo(`Using Plugin --> ${$data.namespace}`);
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
        const $data = new ObjectCollection_1.default(data);
        let $pluginData;
        $pluginData = {
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
        return $pluginData;
    }
}
module.exports = PluginEngine;
//# sourceMappingURL=PluginEngine.js.map