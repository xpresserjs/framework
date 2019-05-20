import FS from "fs";
import {Xjs} from "../../global";

const packageName: string = "xpresser";

declare let $: Xjs;

const paths = $.config.paths;
const baseFiles = paths.base + "/";
const backendFiles = baseFiles + paths.backend + "/";

let EnginePath = baseFiles + "engines/";
if (typeof paths.engine === "string") {
    EnginePath = baseFiles + paths.engine + "/";
} else {
    const nodeModulesEngine = baseFiles + "node_modules/" + packageName + "/src";
    if (FS.existsSync(nodeModulesEngine)) {
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
$.engine = (path: string = "", returnRequire = false): string => {
    if (path[0] === "/") { path = path.substr(1); }
    const engine = EnginePath + path;
    return returnRequire ? require(engine) : engine;
};
