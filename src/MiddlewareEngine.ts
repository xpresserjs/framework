import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import { DollarSign } from "../types";

declare const $: DollarSign;
declare const _: any;


/**
 * @param {string} middlewarePath
 * @param {*} action
 * @param route
 */
const MiddlewareEngine = (middlewarePath: any, action?, route?): any => {

    /**
     * if middleware has a dot sing we check if it is project extension file
     * if it is not we assume it is a method.
     */
    if (middlewarePath.indexOf(".") > 0) {
        const m = middlewarePath.split(".");

        if (m[1] !== $.config.project.fileExtension.substr(1)) {
            middlewarePath = m[0];
            action = m[1];
        }
    }

    middlewarePath = _.upperFirst(middlewarePath);

    /**
     * Get Middleware from path
     */
    const middleware = $.use.middleware(middlewarePath, false);

    if (middleware === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }

    if (typeof middleware !== "object" && typeof middleware !== "function") {
        return $.logErrorAndExit("No Middleware found in: " + middlewarePath);
    }

    /**
     * If middleware is object, check if method exists.
     */
    if (typeof middleware === "object") {
        if (!action) {
            action = "allow";
        }

        if (typeof middleware[action] === "undefined") {
            return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
        }
    }

    /**
     * Return Parsed Middleware
     */
    return async (req, res, next) => {
        const request = new RequestEngine(req, res, next, route);
        if (typeof middleware === "function") {
            return middleware(request);
        } else {
            return middleware[action](request);
        }
    };
};

export = MiddlewareEngine;
