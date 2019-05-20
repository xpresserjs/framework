"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const packageName = "xpresser";
const paths = $.config.paths;
const baseFiles = paths.base + "/";
const backendFiles = baseFiles + paths.backend + "/";
let EnginePath = baseFiles + "engines/";
if (typeof paths.engine === "string") {
    EnginePath = baseFiles + paths.engine + "/";
}
else {
    const nodeModulesEngine = baseFiles + "node_modules/" + packageName + "/src";
    if (fs_1.default.existsSync(nodeModulesEngine)) {
        EnginePath = nodeModulesEngine + "/";
    }
}
$.basePath = (path = "", returnRequire = false) => {
    if (path[0] === "/") {
        path = path.substr(1);
    }
    const base = baseFiles + path;
    return returnRequire ? require(base) : base;
};
$.backendPath = (path = "", returnRequire = false) => {
    if (path[0] === "/") {
        path = path.substr(1);
    }
    const backend = backendFiles + path;
    return returnRequire ? require(backend) : backend;
};
$.storagePath = (path = "") => {
    if (path[0] === "/") {
        path = path.substr(1);
    }
    return $.basePath($.config.paths.storage + "/" + path);
};
/**
 * @param {string} path
 * @param {boolean} returnRequire
 */
$.engine = (path = "", returnRequire = false) => {
    if (path[0] === "/") {
        path = path.substr(1);
    }
    const engine = EnginePath + path;
    return returnRequire ? require(engine) : engine;
};
//# sourceMappingURL=Path.js.map