import PATH = require("path");
import fs = require("fs");
import {getInstance} from "../../index";

const $ = getInstance();

const pathHelpers = {
    base: "base://",
    backend: "backend://",
    frontend: "frontend://",
    npm: "npm://",
    migrations: "migrations://",
    public: "public://",
};

class PathHelper {
    static path() {
        return PATH;
    }

    static resolve($path: string | string[], $resolve: boolean = true): string {

        if (Array.isArray($path)) {
            for (let i = 0; i < $path.length; i++) {
                const $pathElement = $path[i];
                if ($pathElement.substr(-1) === "/") {
                    $path[i] = $pathElement.substr(0, $pathElement.length - 1);
                }
            }

            $path = $path.join("/");
        }

        // Replace .js.js to .js
        if ($path.includes('.js.js')) {
            $path = $path.replace('.js.js', '.js');
        }

        if ($.isTypescript()) {
            // Replace .js.ts to .js
            if ($path.includes('.js.ts')) {
                $path = $path.replace('.js.ts', '.js');
            }

            // Replace .ts.js to .ts
            if ($path.includes('.ts.js')) {
                $path = $path.replace('.js.js', '.ts');
            }
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
    }

    static helperToPath([$helper, $path]: string[]): string {
        const config: any = $.config.get('paths');

        if ($helper === "base") {
            return config.base + "/" + $path;
        } else if ($helper === "npm") {
            return PathHelper.resolve([config.npm, $path]);
        } else {
            if (config[$helper]) {
                return PathHelper.resolve([config[$helper], $path]);
            }
            return $.path.base(`${$helper}/${$path}`);
        }
    }

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
    }

    /**
     * Makes a dir if it does not exist.
     * @param $path
     * @param $isFile
     */
    static makeDirIfNotExist($path: string, $isFile = false) {
        if ($isFile === true) {
            $path = PATH.dirname($path);
        }

        if (!fs.existsSync($path)) {
            try {
                fs.mkdirSync($path, {recursive: true});
            } catch (e) {
                $.logErrorAndExit(e.stack);
            }
        }

        return $path;
    }

    /**
     * Adds project extension to a string or array of strings
     * @example
     * e.g if project extension is `.js`
     * ['server', 'app', 'test']
     *
     * => ['server.js', 'app.js', 'test.js']
     * @param files
     * @param useExtension
     * @param clone
     */
    static addProjectFileExtension(files: string | string[], useExtension?: string | undefined, clone = false): string[] | string {
        if (Array.isArray(files)) {
            let array;
            if (clone) {
                array = [...files];
            } else {
                array = files;
            }

            for (let i = 0; i < array.length; i++) {
                const file = array[i];
                array[i] = PathHelper.addProjectFileExtension(file) as string;
            }

            return array;
        } else {
            // default file extension
            const jsExt = ".js";
            // if custom extension is defined use it else use defined project extension.
            useExtension = (useExtension && useExtension.length) ? useExtension : $.config.get('project.fileExtension')
            // if not useExtension use jsExt
            const ext = useExtension ? useExtension : jsExt;
            // check and store if path has extension
            const hasExtInName = files.substr(-ext.length) === ext;

            if (
                // ext is not same with jsExt (i.e maybe .ts)
                ext !== jsExt &&
                // And ext was not found in name
                !hasExtInName &&
                // And ext is .js
                files.substr(-jsExt.length) === jsExt
            ) {
                // return path un-modified.
                return files;
            }

            // Else add extension to name;
            return hasExtInName ? files : files + ext;
        }
    }

    /**
     * Adds project extension to a string or array of strings
     * @example
     * e.g if project extension is `.js`
     * ['server.js', 'app.js', 'test.js']
     *
     * => ['server', 'app', 'test']
     * @param files
     * @param clone
     */
    static removeProjectFileExtension(files: string | string[], clone = false) {
        if (Array.isArray(files)) {
            let array;
            if (clone) {
                array = [...files];
            } else {
                array = files;
            }
            for (let i = 0; i < array.length; i++) {
                const file = array[i];
                array[i] = this.removeProjectFileExtension(file) as string;
            }

            return array;
        } else {
            return files.substr(0, files.length - $.config.get('project.fileExtension').length);
        }
    }


    /**
     * Get extension of path.
     */
    static getExtension(path: string, withDot: boolean = true): string | undefined {
        const dots = path.split('.');
        return dots.length > 1 ? ((withDot ? '.' : '') + dots.pop()) : undefined;
    }
}

export = PathHelper;
