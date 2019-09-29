import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import {Xpresser} from "../xpresser";

declare let $: Xpresser;

/**
 * @param {string} middlewarePath
 * @param {*} action
 * @param route
 */
const MiddlewareEngine = (middlewarePath: any, action = undefined, route: undefined): any => {

    /**
     * Get Middleware from path
     */
    const middleware = $.use.middleware(middlewarePath, false);

    if (middleware === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }

    /**
     * If middleware is object, check if method exists.
     */
    if (typeof middleware === "object" && typeof middleware[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }

    /**
     * Return Parsed Middleware
     */
    return async (req, res, next) => {
        return middleware[action](new RequestEngine(req, res, next, route));
    };
};

export = MiddlewareEngine;
