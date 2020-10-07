import FS = require("fs");

import Path = require("../Helpers/Path");
import {DollarSign} from "../../types";

const packageName: string = "xpresser";

declare const $: DollarSign;

const paths = $.config.paths;
const baseFiles = paths.base + "/";
const backendFiles = Path.resolve(paths.backend);

$.path = {
    base: (path = "", returnRequire = false) => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        const base = baseFiles + path;
        return returnRequire ? require(base) : base;
    },

    backend: (path = "", returnRequire = false) => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        const backend = backendFiles + "/" + path;
        return returnRequire ? require(backend) : backend;
    },

    storage: (path = "") => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        return $.path.base($.config.paths.storage + "/" + path);
    },

    /**
     * @param {string} path
     * @param {boolean} returnRequire
     * @param refresh
     */
    engine: (path: string = "", returnRequire = false, refresh = false): string | any => {
        const dataKey = "XpresserPath";
        let EnginePath: string;

        if (!refresh && $.engineData.has(dataKey)) {
            EnginePath = $.engineData.get(dataKey);
        } else {
            if (typeof paths.engine === "string") {
                EnginePath = Path.resolve(paths.engine) + "/";
            } else {
                EnginePath = Path.resolve([$.config.paths.npm, packageName, "src"]) + "/";
            }

            $.engineData.set(dataKey, EnginePath);
        }

        if (path[0] === "/") {
            path = path.substr(1);
        }

        const engine = EnginePath + path;
        return returnRequire ? require(engine) : engine;
    },

    events: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substr(1);
        }

        const event = Path.resolve([$.config.paths.events, path]);

        return returnRequire ? require(event) : event;
    },

    controllers: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substr(1);
        }

        const controller = Path.resolve([$.config.paths.controllers, path]);

        return returnRequire ? require(controller) : controller;
    },

    middlewares: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substr(1);
        }

        const middleware = Path.resolve([$.config.paths.middlewares, path]);

        return returnRequire ? require(middleware) : middleware;
    },

    models: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substr(1);
        }

        const model = Path.resolve([$.config.paths.models, path]);

        return returnRequire ? require(model) : model;
    },

    views: (path: string = "") => {
        if (path[0] === "/") {
            path = path.substr(1);
        }

        return Path.resolve([$.config.paths.views, path]);
    },

    jsonConfigs: (path: string = "") => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        return Path.resolve([$.config.paths.jsonConfigs, path]);
    },


    configs: (path: string = "", returnRequire: boolean = false): string | any => {
        if (path[0] === "/") {
            path = path.substr(1);
        }

        const config = Path.resolve([$.config.paths.configs, path]);

        return returnRequire ? require(config) : config;
    },

    node_modules(){
        return require.resolve('xpresser').replace('xpresser/dist/index.js', '');
    }
};

/**
 * Checks if xpresser exists in node_modules folder.
 * but has been removed for some reasons related to npm and yarn folders symlink
 */
/*const XpresserEngine = $.path.engine(".engine");
if (!FS.existsSync(XpresserEngine)) {

    $.logError("Xpresser Engine not found in folder:");
    $.logErrorAndExit(XpresserEngine);

}*/
