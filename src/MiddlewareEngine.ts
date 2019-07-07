import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import {Xpresser} from "../global";

declare let $: Xpresser;

class MiddlewareEngine {
    /**
     * @param {object} middleware
     * @param {string} action
     */
    constructor(middleware, action = "allow") {

        // @ts-ignore
        return this.processMiddleware(middleware, action);
    }

    /**
     * @param {function} middleware
     * @param action
     */
    public processMiddleware(middleware, action) {
        return async (req, res, next) => {
            return middleware[action](new RequestEngine(req, res, next));
        };
    }
}

/**
 * @param {string} middlewarePath
 * @param {*} action
 */
const middleware = (middlewarePath: any, action = undefined): MiddlewareEngine | any => {

    const middlewareFile = $.use.middleware(middlewarePath, false);

    if (middlewareFile === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }

    if (typeof middlewareFile === "object" && typeof middlewareFile[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }

    return new MiddlewareEngine(middlewareFile, action);
};

export = middleware;
