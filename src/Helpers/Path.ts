import {Xjs} from "../../global";
import PATH = require("path");
import fs = require("fs-extra");
import mkdirp = require("mkdirp");

declare let $: Xjs;

const pathHelpers = {
    base: "base://",
    backend: "backend://",
    frontend: "frontend://",
    npm: "npm://",
    migrations: "migrations://",
    public: "public://",
};

const PathHelper = {
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
            const $splitPath: any[] = $path.split("://");

            if (pathHelpers.hasOwnProperty($splitPath[0])) {
                if (!$splitPath[1]) {
                    $splitPath[1] = "";
                }

                return PathHelper.helperToPath($splitPath);
            }

        }

        if ($path.substr(-1) === "/") {
            $path = $path.substr(0, $path.length - 1);
        }

        return $resolve ? PATH.resolve($path) : $path;

    },

    helperToPath([$helper, $path]: string[]): string {
        if ($helper === "base") {
            return $.config.paths.base + "/" + $path;
        } else if ($helper === "npm") {
            return PathHelper.resolve([$.config.paths.npm, $path]);
        } else {

            if ($.$config.has("paths." + $helper)) {
                return PathHelper.resolve([$.$config.get("paths." + $helper), $path]);
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

    /**
     * Makes a dir if it does not exist.
     * @param $path
     * @param $isFile
     */
    makeDirIfNotExist($path: string, $isFile?: boolean) {
        if ($isFile === true) {
            $path = PATH.dirname($path);
        }

        if (!fs.existsSync($path)) {
            try {
                fs.mkdirSync($path, {recursive: true});
            } catch (e) {
                try {
                    mkdirp.sync($path);
                } catch (e) {
                    $.logErrorAndExit(e.message);
                }
            }

        }

        return $path;
    },
};

export = PathHelper;
