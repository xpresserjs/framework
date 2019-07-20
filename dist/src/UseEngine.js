"use strict";
/**
 * UseEngine provides methods for including
 * different types of files.
 *
 * UseEngine is later exposed to the framework as $.use
 */
const fs = require("fs");
const PathHelper = require("./Helpers/Path");
const StringHelper = require("./Helpers/String");
let Use = {};
const PluginNamespaces = $.engineData.get("PluginEngine:namespaces", {});
/**
 * UseEngine requires `use.json` in frameworks backend folder.
 * Object returned from use.json is processed and saved in $.engineData as path to file.
 * @type {{}}
 */
const UsePath = "UseDotJson";
Use = $.engineData.get(UsePath, {});
// Process Use Data
if (typeof Use.middlewares === "object") {
    const MiddlewareSuffix = "Middleware";
    const useMiddlewares = Use.middlewares;
    const middlewareKeys = Object.keys(useMiddlewares);
    for (let i = 0; i < middlewareKeys.length; i++) {
        const middlewareKey = middlewareKeys[i];
        let middleware = useMiddlewares[middlewareKey];
        const extension = $.config.project.fileExtension;
        if (middleware.substr(-3) === extension) {
            middleware = middleware.substr(0, middleware.length - 3);
        }
        let middlewareRealPath = PathHelper.resolve(middleware);
        let hasMiddleware = false;
        if (fs.existsSync(middlewareRealPath + extension)) {
            hasMiddleware = true;
        }
        else {
            if (fs.existsSync(middlewareRealPath + MiddlewareSuffix + extension)) {
                middlewareRealPath = middlewareRealPath + MiddlewareSuffix;
                hasMiddleware = true;
            }
        }
        if (hasMiddleware) {
            const hasSuffix = StringHelper.hasSuffix(middlewareKey, MiddlewareSuffix);
            if (hasSuffix) {
                Use.middlewares[StringHelper.withoutSuffix(middlewareKey, MiddlewareSuffix)] = middlewareRealPath;
                delete Use.middlewares[middlewareKey];
            }
            else {
                Use.middlewares[middlewareKey] = middlewareRealPath;
            }
        }
        else {
            $.logError(`Middleware not found:`);
            $.logErrorAndExit(middleware);
            delete Use.middlewares[middlewareKey];
        }
    }
}
$.engineData.set(UsePath, Use);
// Functions
function parsePath(path, data = {}) {
    const dataKeys = Object.keys(data);
    if (dataKeys.length) {
        for (let i = 0; i < dataKeys.length; i++) {
            const dataKey = dataKeys[i];
            path = path.replace(`{${dataKey}}`, data[dataKey]);
        }
    }
    return path;
}
function fileExistsInPath(file, path, suffix = "") {
    if (suffix.length) {
        const hasSuffix = file.substr(-suffix.length) === suffix;
        if (!hasSuffix) {
            file += suffix;
        }
    }
    const fullPath = parsePath(path, { file });
    if (!fs.existsSync(fullPath)) {
        file = StringHelper.upperFirst(file);
        if (!fs.existsSync(parsePath(path, { file }))) {
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
    static package($package, handleError = true) {
        try {
            return require($package);
        }
        catch (e) {
            return !handleError ? false : $.logErrorAndExit(`Package {${[$package]}} not found in node_modules.`);
        }
    }
    /**
     * Use file from backend
     * @param {string} path
     * @return {*}
     */
    static file(path) {
        const fullPath = $.path.backend("{file}" + $.config.project.fileExtension);
        const [hasPath, realPath] = fileExistsInPath(path, fullPath);
        if (!hasPath) {
            return $.logErrorAndExit(`File ${realPath} does not exist!`);
        }
        return require(realPath);
    }
    /**
     * Use Model
     * @param {string} model
     * @param {boolean} [handleError=true]
     * @return {ModelEngine}
     */
    static model(model, handleError = true) {
        const fullPath = PathHelper.resolve($.config.paths.models) + "/{file}" + $.config.project.fileExtension;
        const [hasPath, realPath] = fileExistsInPath(model, fullPath);
        if (!hasPath) {
            // @ts-ignore
            return !handleError ? false : $.logErrorAndExit(`Model ${realPath} does not exists`);
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
    static middleware(middleware, handleError = true, suffix = true) {
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
    static controller(controller, handleError = true, suffix = true) {
        if (controller.indexOf("::") > 2) {
            const $splitController = controller.split("::");
            const $pluginNamespace = $splitController[0];
            if (PluginNamespaces.hasOwnProperty($pluginNamespace)) {
                const plugin = PluginNamespaces[$pluginNamespace];
                if (plugin.hasOwnProperty("controllers")) {
                    return plugin.controllers + "/" + $splitController[1];
                }
            }
        }
        return $.path.controllers(controller);
    }
    /**
     * Return Router
     * @return {$.router}
     */
    static router() {
        return $.router;
    }
}
module.exports = UseEngine;
