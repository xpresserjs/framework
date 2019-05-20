declare let $: Xjs;

const paths = $.config.paths;
const baseFiles = paths.base + "/";
const backendFiles = baseFiles + paths.backend + "/";

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
