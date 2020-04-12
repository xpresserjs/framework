import {Http} from "../../types/http";

export =  (http: Http) => {
    return {
        currentViewIs(path: string, ifTrue = undefined, ifFalse = undefined) {
            const currentView = http.res.locals.cthttp.$currentView;
            const check = currentView === path;

            if (check === true && ifTrue !== undefined) { return ifTrue; }
            if (check === false && ifFalse !== undefined) { return ifFalse; }

            return check;
        },

        old(key: string, $default = "") {
            const value = http.res.locals.cthttp.$flash["old:" + key];
            if (typeof value !== "undefined") {
                return value;
            }

            return $default;
        },

        pushToScriptsStack(scriptPath: string | string[]) {
            if (!Array.isArray(scriptPath)) {
                scriptPath = [scriptPath];
            }

            for (let i = 0; i < scriptPath.length; i++) {
                http.res.locals.cthttp.$stackedScripts.push(scriptPath[i]);
            }

            return "";
        },

        showStackedScripts() {

            let scripts = "";

            for (let i = 0; i < http.res.locals.cthttp.$stackedScripts.length; i++) {
                scripts += '<script src="' + http.res.locals.cthttp.$stackedScripts[i] + '"></script>';
            }

            return scripts;
        },
    };
};
