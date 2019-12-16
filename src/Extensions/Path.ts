import FS = require("fs");

import Path = require("../Helpers/Path");
import {DollarSign} from "../../index";

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
     */
    engine: (path: string = "", returnRequire = false): string | any => {
        const dataKey = "XpresserPath";
        let EnginePath: string;

        if ($.engineData.has(dataKey)) {
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
};

const XpresserEngine = $.path.engine(".engine");
if (!FS.existsSync(XpresserEngine)) {

    $.logError("Xpresser Engine not found in folder:");
    $.logErrorAndExit(XpresserEngine);

}
