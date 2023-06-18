import PathHelper from "../Helpers/Path";
import {getInstance} from "../../index";
import Path from "path";

const packageName: string = "xpresser";
const $ = getInstance();

const paths: Record<string, any> = $.config.get('paths');
const baseFiles = paths.base + "/";
const backendFiles = PathHelper.resolve(paths.backend);

// DollarSign `path` property
$.path = {
    resolve: (path: string | string[], resolve: boolean = true): string => {
        return PathHelper.resolve(path, resolve)
    },

    base: (path = "", returnRequire = false) => {
        if (path[0] === "/") {
            path = path.substring(1);
        }
        const base = Path.resolve(baseFiles + path);
        return returnRequire ? require(base) : base;
    },

    backend: (path = "", returnRequire = false) => {
        if (path[0] === "/") {
            path = path.substring(1);
        }
        const backend = Path.resolve(backendFiles + "/" + path);
        return returnRequire ? require(backend) : backend;
    },

    storage: (path = "") => {
        if (path[0] === "/") {
            path = path.substring(1);
        }
        return Path.resolve(paths.storage + "/" + path);
    },

    frameworkStorageFolder: (path?: string): string => {
        if (path === undefined) {
            path = "";
        }

        if (path[0] === "/") {
            path = path.substring(1);
        }
        return $.path.storage("framework/" + path);
    },

    engine: (path: string = "", returnRequire = false, refresh = false): string | any => {
        const dataKey = "XpresserPath";
        let EnginePath: string;

        if (!refresh && $.engineData.has(dataKey)) {
            EnginePath = $.engineData.get(dataKey);
        } else {
            if (typeof paths.engine === "string") {
                EnginePath = PathHelper.resolve(paths.engine) + "/";
            } else {
                EnginePath = PathHelper.resolve([paths.npm, packageName, "src"]) + "/";
            }

            $.engineData.set(dataKey, EnginePath);
        }

        if (path[0] === "/") {
            path = path.substring(1);
        }

        const engine = EnginePath + path;
        return returnRequire ? require(engine) : engine;
    },

    events: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substring(1);
        }

        const event = PathHelper.resolve([paths.events, path]);

        return returnRequire ? require(event) : event;
    },

    controllers: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substring(1);
        }

        const controller = PathHelper.resolve([paths.controllers, path]);

        return returnRequire ? require(controller) : controller;
    },

    middlewares: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substring(1);
        }

        const middleware = PathHelper.resolve([paths.middlewares, path]);

        return returnRequire ? require(middleware) : middleware;
    },

    models: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substring(1);
        }

        const model = PathHelper.resolve([paths.models, path]);

        return returnRequire ? require(model) : model;
    },

    views: (path: string = "") => {
        if (path[0] === "/") {
            path = path.substring(1);
        }

        return PathHelper.resolve([paths.views, path]);
    },

    jsonConfigs: (path: string = "") => {
        if (path[0] === "/") {
            path = path.substring(1);
        }
        return PathHelper.resolve([paths.jsonConfigs, path]);
    },


    configs: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substring(1);
        }

        const config = PathHelper.resolve([paths.configs, path]);

        return returnRequire ? require(config) : config;
    },

    node_modules(path: string = ""): string {
        let currentNodeModules: string;

        try {
            currentNodeModules = require.resolve('xpresser')
                .replace('xpresser\\dist\\index.js', '')
                .replace('xpresser/dist/index.js', '');
        } catch (e) {
            currentNodeModules = PathHelper.resolve([paths.npm, path])
        }

        return currentNodeModules + path;
    }
};
