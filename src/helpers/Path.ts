import Path from "path";
import {Xjs} from "../../global";

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

    _path($path: string): string {
        return $.path.base("_/" + $path);
    },

    resolve($path: string | string[], $resolve: boolean = true): string {

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

        return $resolve ? Path.resolve($path) : $path;

    },

    helperToPath($path, $helper): string {
        $path = $path.substr($helper.length);

        if ($helper === pathHelpers.base) {
            return $.path.base($path);
        } else if ($helper === pathHelpers.npm) {
            return $.path.base(`node_modules/${$path}`);
        } else {

            $helper = $helper.replace("://", "");

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
