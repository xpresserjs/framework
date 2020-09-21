/**
 * UseEngine provides methods for including
 * different types of files.
 *
 * UseEngine is later exposed to the framework as $.use
 */
import PathHelper = require("./Helpers/Path");
import StringHelper = require("./Helpers/String");
import {DollarSign, JsonSettings} from "../types";
import {StringToAnyKeyObject} from "./CustomTypes";

declare const $: DollarSign;

let Use = {} as JsonSettings.Use;
const PluginNamespaces = $.engineData.get("PluginEngine:namespaces", {});

/**
 * UseEngine requires `use.json` in frameworks backend folder.
 * Object returned from use.json is processed and saved in $.engineData as path to file.
 * @type {{}}
 */
const UsePath = "UseDotJson";
Use = $.engineData.get(
    UsePath,
    $.objectCollection(),
).all();

// Process Use Data
if (typeof Use.middlewares === "object") {
    const MiddlewareSuffix = "Middleware";
    const useMiddlewares = Use.middlewares;
    const middlewareKeys: string[] = Object.keys(useMiddlewares);

    for (let i = 0; i < middlewareKeys.length; i++) {
        const middlewareKey: string = middlewareKeys[i];

        let middleware = useMiddlewares[middlewareKey];
        const extension = $.config.project.fileExtension;

        if (middleware.substr(-3) === extension) {
            middleware = middleware.substr(0, middleware.length - 3);
        }

        let middlewareRealPath = PathHelper.resolve(middleware);

        let hasMiddleware = false;
        if ($.file.exists(middlewareRealPath + extension)) {
            hasMiddleware = true;
        } else {
            if ($.file.exists(middlewareRealPath + MiddlewareSuffix + extension)) {
                middlewareRealPath = middlewareRealPath + MiddlewareSuffix;
                hasMiddleware = true;
            }
        }

        if (hasMiddleware) {
            const hasSuffix = StringHelper.hasSuffix(middlewareKey, MiddlewareSuffix);
            if (hasSuffix) {
                Use.middlewares[StringHelper.withoutSuffix(middlewareKey, MiddlewareSuffix)] = middlewareRealPath;
                delete Use.middlewares[middlewareKey];
            } else {
                Use.middlewares[middlewareKey] = middlewareRealPath;
            }
        } else {
            $.logError(`Middleware not found:`);
            $.logErrorAndExit(middleware);
            delete Use.middlewares[middlewareKey];
        }
    }
}

$.engineData.set(
    UsePath,
    $.objectCollection(Use),
);

// Functions
function parsePath(path: string, data: StringToAnyKeyObject = {}) {
    const dataKeys = Object.keys(data);

    if (dataKeys.length) {
        for (let i = 0; i < dataKeys.length; i++) {
            const dataKey = dataKeys[i];
            path = path.replace(`{${dataKey}}`, data[dataKey]);
        }
    }
    return path;
}

function fileExistsInPath(file: string, path: string, suffix = ""): [boolean, string] {

    if (suffix.length) {
        const hasSuffix = file.substr(-suffix.length) === suffix;

        if (!hasSuffix) {
            file += suffix;
        }
    }

    const fullPath = parsePath(path, {file});

    if (!$.file.exists(fullPath)) {
        file = StringHelper.upperFirst(file);
        if (!$.file.exists(parsePath(path, {file}))) {
            return [false, fullPath];
        }
    }

    return [true, fullPath];
}

class UseEngine {
    /**
     * Use Package from npm.
     * @param $package
     * @param handleError
     * @return {boolean|*}
     */
    public static package($package: string, handleError = true) {
        try {
            return require($package);
        } catch (e) {
            return !handleError ? false : $.logErrorAndExit(`Package {${[$package]}} not found in node_modules.`);
        }
    }

    /**
     * Use file from backend
     * @param {string} path
     * @return {*}
     */
    public static file(path: string) {
        const fullPath = $.path.backend("{file}" + $.config.project.fileExtension);
        const [hasPath, realPath] = fileExistsInPath(path, fullPath);
        if (!hasPath) {
            throw Error(`File ${realPath} does not exist!`);
        }
        return require(realPath);
    }

    /**
     * Use Model
     * @param {string} model
     * @param {boolean} [handleError=true]
     * @return {*}
     */
    public static model(model: string, handleError = true): any {
        const fullPath = PathHelper.resolve($.config.paths.models) + "/{file}" + $.config.project.fileExtension;
        const [hasPath, realPath] = fileExistsInPath(model, fullPath);

        if (!hasPath) {
            // @ts-ignore
            if (!handleError) {
                return false
            } else {
                throw new Error(`Model ${realPath} does not exists`);
            }
        }
        return require(realPath);
    }

    /**
     * Use Middleware
     * @param {string} middleware
     * @param {boolean} [handleError=true]
     * @param {boolean} [suffix=true]
     * @return {boolean|*}
     */
    public static middleware(middleware: string, handleError = true, suffix = true) {
        if (typeof Use.middlewares === "object") {
            const useMiddlewares = Use.middlewares;
            const middleWithoutSuffix = StringHelper.withoutSuffix(middleware, "Middleware");

            if (useMiddlewares.hasOwnProperty(middleWithoutSuffix)) {
                return require(useMiddlewares[middleWithoutSuffix]);
            }
        }

        const fullPath = $.path.backend("middlewares/{file}" + $.config.project.fileExtension);

        const [hasPath, realPath] = fileExistsInPath(middleware, fullPath, suffix ? "Middleware" : "");

        if (!hasPath) {
            return !handleError ? false : $.logErrorAndExit(new Error(`Middleware ${realPath} does not exits`));
        }

        return require(realPath);
    }

    public static controller(controller: string, handleError: boolean = true, suffix: boolean = true) {

        if (controller.indexOf("::") > 2) {
            const $splitController = controller.split("::");
            const $pluginNamespace = $splitController[0];

            if (PluginNamespaces.hasOwnProperty($pluginNamespace)) {

                const plugin = PluginNamespaces[$pluginNamespace];

                if (plugin.paths && plugin.paths.hasOwnProperty("controllers")) {
                    return plugin.paths.controllers + "/" + $splitController[1];
                }
            }
        }

        return $.path.controllers(controller);
    }

    /**
     * Return Router
     * @return {$.router}
     */
    public static router() {
        return $.router;
    }
}

export = UseEngine;
