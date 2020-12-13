import {getInstance} from "../../index";

const $ = getInstance()

/**
 * Check if plugin file exists or throw error.
 * @param plugin
 * @param pluginPath
 * @param file
 */
export function pluginPathExistOrExit(plugin: string, pluginPath: string, file: string) {
    /**
     * ResolvedRoutePath - get file real path,
     * Just in any case smartPaths are used.
     */
    const ResolvedRoutePath = $.path.resolve(file, false);

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
 * Since 0.5.0 plugins.json started using objects instead of arrays.
 * This function converts old arrays to new object syntax
 * @param plugins
 */
export function convertPluginArrayToObject(plugins: string[]) {
    if (!plugins) return {}

    const newPluginsObject: Record<string, (boolean | object)> = {};

    // Map plugins and set keys to newPluginsObject
    plugins.map(plugin => newPluginsObject[plugin] = true);

    return newPluginsObject;
}