"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
            for (let i = 0; i < $path.length; i++) {
                const $pathElement = $path[i];
                if ($pathElement.substr(-1) === "/") {
                    $path[i] = $pathElement.substr(0, $pathElement.length - 1);
                }
            }
            $path = $path.join("/");
        }
        if ($path.indexOf("://") >= 0) {
            const $splitPath = $path.split("://");
            if (pathHelpers.hasOwnProperty($splitPath[0])) {
                if (!$splitPath[1]) {
                    $splitPath[1] = "";
                }
                return this.helperToPath($splitPath);
            }
        }
        if ($path.substr(-1) === "/") {
            $path = $path.substr(0, $path.length - 1);
        }
        return $resolve ? path_1.default.resolve($path) : $path;
    },
    helperToPath([$helper, $path]) {
        if ($helper === "base") {
            return $.config.paths.base + "/" + $path;
        }
        else if ($helper === "npm") {
            return this.resolve([$.config.paths.npm, $path]);
        }
        else {
            if ($.$config.has("paths." + $helper)) {
                return this.resolve([$.$config.get("paths." + $helper), $path]);
            }
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
    /**
     * Makes a dir if it does not exist.
     * @param $path
     * @param $isFile
     */
    makeDirIfNotExist($path, $isFile) {
        if ($isFile === true) {
            $path = path_1.default.dirname($path);
        }
        if (!fs_1.default.existsSync($path)) {
            fs_1.default.mkdirSync($path);
        }
        return $path;
    },
};
//# sourceMappingURL=Path.js.map