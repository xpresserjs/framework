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

    // If file or folder does not exist throw error.
    if (!$.file.exists(file)) {
        return $.logPerLine([
            {error: plugin},
            {error: `REQUIRED FILE or DIR MISSING: ${file}`},
            {errorAndExit: ""},
        ], true);
    }

    // return real path.
    return file;
}


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



/**
 * Compare version function
 * -1 = version1 is less than version 2
 * 1 = version1 is greater than version 2
 * 0 = Both are the same
 */
export function compareVersion(version1: string, version2: string) {
    const v1 = version1.split('.') as (string | number)[];
    const v2 = version2.split('.') as (string | number)[];
    const k = Math.min(v1.length, v2.length);

    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i] as string, 10);
        v2[i] = parseInt(v2[i] as string, 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }

    return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
}
