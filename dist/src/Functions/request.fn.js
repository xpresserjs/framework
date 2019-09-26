"use strict";
module.exports = (x) => {
    return {
        currentViewIs(path, ifTrue = undefined, ifFalse = undefined) {
            const currentView = x.res.locals.ctx.$currentView;
            const check = currentView === path;
            if (check === true && ifTrue !== undefined) {
                return ifTrue;
            }
            if (check === false && ifFalse !== undefined) {
                return ifFalse;
            }
            return check;
        },
        old(key, $default = "") {
            const value = x.res.locals.ctx.$flash["old:" + key];
            if (typeof value !== "undefined") {
                return value;
            }
            return $default;
        },
        pushToScriptsStack(scriptPath) {
            if (!Array.isArray("string")) {
                scriptPath = [scriptPath];
            }
            for (let i = 0; i < scriptPath.length; i++) {
                x.res.locals.ctx.$stackedScripts.push(scriptPath[i]);
            }
        },
        showStackedScripts() {
            let scripts = "";
            for (let i = 0; i < x.res.locals.ctx.$stackedScripts.length; i++) {
                scripts += '<script src="' + x.res.locals.ctx.$stackedScripts[i] + '"></script>';
            }
            return scripts;
        },
        auth() {
            return x.authUser();
        },
    };
};
