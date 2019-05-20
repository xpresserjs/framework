"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const pathHelpers = {
    base: "base://",
    backend: "backend://",
    frontend: "frontend://",
    npm: "npm://",
    migrations: "migrations://",
    public: "public://",
};
module.exports = {
    _path($path) {
        return $.basePath("_/" + $path);
    },
    resolve($path, $resolve = true) {
        if ($path.indexOf("://") > 0) {
            const pathHelperKeys = Object.keys(pathHelpers);
            for (let i = 0; i < pathHelperKeys.length; i++) {
                const key = pathHelperKeys[i];
                if ($path.substr(0, key.length) === key) {
                    return this.helperToPath($path, pathHelpers[key]);
                }
            }
        }
        return $resolve ? path_1.default.resolve($path) : $path;
    },
    helperToPath($path, $helper) {
        $path = $path.substr($helper.length);
        if ($helper === pathHelpers.base) {
            return $.basePath($path);
        }
        else if ($helper === pathHelpers.npm) {
            return $.basePath(`node_modules/${$path}`);
        }
        else {
            $helper = $helper.replace("://", "");
            return $.basePath(`${$helper}/${$path}`);
        }
    },
    /**
     * Get path in storage/framework folder.
     */
    frameworkStorage(path) {
        if (path === undefined) {
            path = "";
        }
        if (path[0] === "/") {
            path = path.substr(1);
        }
        return $.storagePath("framework/" + path);
    },
};
//# sourceMappingURL=Path.js.map