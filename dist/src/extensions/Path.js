"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Path = require("../helpers/Path");
const packageName = "xpresser";
const paths = $.config.paths;
const baseFiles = paths.base + "/";
const backendFiles = baseFiles + paths.backend + "/";
let EnginePath = baseFiles + "src/";
if (typeof paths.engine === "string") {
    EnginePath = Path.resolve(paths.engine) + "/";
}
else {
    const nodeModulesEngine = baseFiles + "node_modules/" + packageName + "/src";
    if (fs_1.default.existsSync(nodeModulesEngine)) {
        EnginePath = nodeModulesEngine + "/";
    }
}
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
        const backend = backendFiles + path;
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
    engine: (path = "", returnRequire = false) => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        const engine = EnginePath + path;
        return returnRequire ? require(engine) : engine;
    },
    controllers: (path = "", returnRequire = false) => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        const controller = Path.resolve([$.config.paths.controllers, path]);
        return returnRequire ? require(controller) : controller;
    },
    views: (path = "") => {
        if (path[0] === "/") {
            path = path.substr(1);
        }
        return Path.resolve([$.config.paths.views, path]);
    },
};
//# sourceMappingURL=Path.js.map