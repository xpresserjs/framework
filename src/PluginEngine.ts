import FS = require("fs");
import ObjectCollection = require("object-collection");
import PathHelper = require("./Helpers/Path");


declare let $: Xpresser;

const pluginRoutes = [] as any[];
const PluginNamespaceToData = {};

const pluginFileExistOrExit = ($plugin, $pluginPath, $file) => {
    const ResolvedRoutePath = PathHelper.resolve($file, false);

    if ($file === ResolvedRoutePath) {
        $file = ResolvedRoutePath;
    }

    $file = $pluginPath + "/" + $file;

    if (!FS.existsSync($file)) {
        return $.logPerLine([
            {error: $plugin},
            {error: `REQUIRED FILE or DIR MISSING: ${$file}`},
            {errorAndExit: ""},
        ], true);
    }

    return $file;
};

class PluginEngine {

    public static loadPlugins() {
        let plugins = [] as any[];
        const PluginsPath = $.path.jsonConfigs("plugins.json");

        if (FS.existsSync(PluginsPath)) {
            try {

                plugins = require(PluginsPath);

            } catch (e) {
                $.logError(e);
            }

            if (plugins.length) {

                for (let i = 0; i < plugins.length; i++) {
                    const $plugin: string = plugins[i];
                    if ($plugin.length) {
                        const $pluginPath: string = PathHelper.resolve($plugin);

                        try {

                            const $data = PluginEngine.loadPluginUseData($plugin, $pluginPath);
                            // tslint:disable-next-line:max-line-length
                            PluginNamespaceToData[$data.namespace] = PluginEngine.usePlugin($plugin, $pluginPath, $data);

                            $.engineData.set("PluginEngine:namespaces", PluginNamespaceToData);
                            $.logIfNotConsole(`Using Plugin --> ${$data.namespace}`);

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
        }

        return {routes: pluginRoutes};
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
        let $pluginData: any;

        $pluginData = {
            namespace: $data.get("namespace"),
            plugin: $plugin,
            path: $path,
        };

        if ($data.has("paths.routesFile")) {
            let RoutePath = $data.get("paths.routesFile");

            RoutePath = pluginFileExistOrExit($plugin, $path, RoutePath);

            pluginRoutes.push({plugin: $plugin, path: RoutePath});
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

        if ($data.has("globalMiddlewares")) {
            const globalMiddlewares: string[] = $data.get("globalMiddlewares");
            $pluginData.globalMiddlewares = [];
            for (let i = 0; i < globalMiddlewares.length; i++) {
                let globalMiddleware = globalMiddlewares[i];

                if (globalMiddleware.substr(-3) !== $.config.project.fileExtension) {
                    globalMiddleware += $.config.project.fileExtension;
                }

                // tslint:disable-next-line:max-line-length
                $pluginData.globalMiddlewares.push(pluginFileExistOrExit($plugin, $pluginData.middlewares, globalMiddleware));

            }
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

export = PluginEngine;
