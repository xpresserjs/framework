import {Xjs} from "../../global";
import path from "path";
import helpers = require("../helpers");

declare let $: Xjs;

const pathHelpers = {
    base: "base://",
    backend: "backend://",
    frontend: "frontend://",
    npm: "npm://",
    migrations: "migrations://",
    public: "public://",
};

export = {
    resolve($path: string | string[], $resolve: boolean = true): string {

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

        return $resolve ? path.resolve($path) : $path;

    },

    helperToPath([$helper, $path]): string {
        if ($helper === "base") {
            return $.config.paths.base + "/" + $path;
        } else if ($helper === "npm") {
            return this.resolve([$.config.paths.npm, $path]);
        } else {

            if ($.$config.has("paths." + $helper)) {
                return this.resolve([$.$config.get("paths." + $helper), $path]);
            }

            return $.path.base(`${$helper}/${$path}`);
        }
    },

    /**
     * Get path in storage/framework folder.
     */
    frameworkStorage(path?: string): string {
        if (path === undefined) {
            path = "";
        }

        if (path[0] === "/") {
            path = path.substr(1);
        }
        return $.path.storage("framework/" + path);
    },
};
