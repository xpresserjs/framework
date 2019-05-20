"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ObjectCollection_1 = __importDefault(require("./helpers/ObjectCollection"));
const Path_1 = __importDefault(require("./helpers/Path"));
let plugins = [];
const pluginRoutes = [];
try {
    plugins = require(Path_1.default._path("plugins.json"));
}
catch (e) {
    // Do Absolutely Nothing
}
class PluginEngine {
    static loadPlugins() {
        if (plugins.length) {
            for (let i = 0; i < plugins.length; i++) {
                const $plugin = plugins[i];
                const $pluginPath = Path_1.default.resolve($plugin);
                try {
                    const $data = PluginEngine.loadPluginUseData($plugin, $pluginPath);
                    PluginEngine.usePlugin($plugin, $pluginPath, $data);
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
        if ($data.has("paths.routes")) {
            let RoutePath = $data.get("paths.routes");
            const ResolvedRoutePath = Path_1.default.resolve(RoutePath, false);
            if (RoutePath === ResolvedRoutePath) {
                RoutePath = ResolvedRoutePath;
            }
            // console.log(RoutePath);
        }
        // console.log($path);
    }
}
module.exports = PluginEngine;
//# sourceMappingURL=PluginEngine.js.map