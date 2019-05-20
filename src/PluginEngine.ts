import fs from "fs";
import ObjectCollection from "./helpers/ObjectCollection";
import PathHelper from  "./helpers/Path";

let plugins = [];
const pluginRoutes = [];

try {

    plugins = require(PathHelper._path("plugins.json"));

} catch (e) {
    // Do Absolutely Nothing
}

class PluginEngine {

    public static loadPlugins() {
        if (plugins.length) {

            for (let i = 0; i < plugins.length; i++) {
                const $plugin = plugins[i];
                const $pluginPath = PathHelper.resolve($plugin);

                try {

                    const $data = PluginEngine.loadPluginUseData($plugin, $pluginPath);
                    PluginEngine.usePlugin($plugin, $pluginPath, $data);

                    $.logInfo(`Using Plugin --> ${$data.namespace}`);
                } catch (e) {

                    $.logPerLine([
                        {error: $plugin},
                        {error: e.message},
                        {errorAndExit: ""},
                    ], true);

                }
            }
        }
    }

    public static loadPluginUseData($plugin, $pluginPath) {
        const data = require($pluginPath + "/use.json");
        if (!data.namespace) {
            throw new Error(`Cannot read property 'namespace'`);
        }
        return data;
    }

    public static usePlugin($plugin, $path, data) {
        const $data = new ObjectCollection(data);

        if ($data.has("paths.routes")) {
            let RoutePath = $data.get("paths.routes");
            const ResolvedRoutePath = PathHelper.resolve(RoutePath, false);

            if (RoutePath === ResolvedRoutePath) {
                RoutePath = ResolvedRoutePath;
            }

            // console.log(RoutePath);
        }
        // console.log($path);
    }

}

export = PluginEngine;
