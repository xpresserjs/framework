import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import {Xpresser} from "../global";

declare let $: Xpresser;

class MiddlewareEngine {
    public middleware: any;
    public action: string;
    public route: object;

    /**
     * @param {object} middleware
     * @param {string} action
     * @param route
     */
    constructor(middleware, action = "allow", route = undefined) {
        this.middleware = middleware;
        this.action = action;
        this.route = route;
    }

    public processMiddleware() {
        return async (req, res, next) => {
            return this.middleware[this.action](new RequestEngine(req, res, next, this.route));
        };
    }
}

/**
 * @param {string} middlewarePath
 * @param {*} action
 * @param route
 */
const GetMiddleware = (middlewarePath: any, action = undefined, route: undefined): MiddlewareEngine | any => {

    const middlewareFile = $.use.middleware(middlewarePath, false);

    if (middlewareFile === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }

    if (typeof middlewareFile === "object" && typeof middlewareFile[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }

    return (new MiddlewareEngine(middlewareFile, action, route)).processMiddleware();
};

export = GetMiddleware;
