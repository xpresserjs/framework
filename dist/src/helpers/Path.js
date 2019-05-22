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
    resolve($path, $resolve = true) {
        if (Array.isArray($path)) {
            $path = $path.join("/");
        }
        if ($path.substr(-1) === "/") {
            $path = $path.substr(0, $path.length - 1);
        }
        if ($path.indexOf("://") > 0) {
            const pathHelperKeys = Object.keys(pathHelpers);
            for (let i = 0; i < pathHelperKeys.length; i++) {
                const key = pathHelperKeys[i];
                if ($path.substr(0, key.length) === key) {
                    return this.helperToPath($path, pathHelpers[key]);
                }
            }
        }
        // console.log($path);
        return $resolve ? path_1.default.resolve($path) : $path;
    },
    helperToPath($path, $helper) {
        $path = $path.substr($helper.length);
        if ($helper === pathHelpers.base) {
            return $.path.base($path);
        }
        else if ($helper === pathHelpers.npm) {
            return this.resolve([$.config.paths.npm, $path]);
        }
        else {
            $helper = $helper.replace("://", "");
            return $.path.base(`${$helper}/${$path}`);
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
        return $.path.storage("framework/" + path);
    },
};
//# sourceMappingURL=Path.js.map