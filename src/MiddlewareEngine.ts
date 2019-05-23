import RequestEngine = require("./RequestEngine");

declare let $: any;

class MiddlewareEngine {
    /**
     * @param {object} middleware
     * @param {string} action
     */
    constructor(middleware, action = "allow") {
        // @ts-ignore
        return this.processMiddleware(middleware[action]);
    }

    /**
     * @param {function} middleware
     */
    public processMiddleware(middleware) {
        return async (req, res, next) => {
            middleware(new RequestEngine(req, res, next));
        };
    }
}

/**
 * @param {string} middlewarePath
 * @param {*} action
 */
const middleware = (middlewarePath, action = undefined) => {
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