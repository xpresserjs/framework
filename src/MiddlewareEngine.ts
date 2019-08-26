import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import {Xpresser} from "../global";

declare let $: Xpresser;

class MiddlewareEngine {
    public middleware: any;
    public action: string;

    /**
     * @param {object} middleware
     * @param {string} action
     */
    constructor(middleware, action = "allow") {
        this.middleware = middleware;
        this.action = action;
    }

    public processMiddleware() {
        return async (req, res, next) => {
            return this.middleware[this.action](new RequestEngine(req, res, next));
        };
    }
}

/**
 * @param {string} middlewarePath
 * @param {*} action
 */
const GetMiddleware = (middlewarePath: any, action = undefined): MiddlewareEngine | any => {

    const middlewareFile = $.use.middleware(middlewarePath, false);

    if (middlewareFile === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }

    if (typeof middlewareFile === "object" && typeof middlewareFile[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }

    return (new MiddlewareEngine(middlewareFile, action)).processMiddleware();
};

export = GetMiddleware;
