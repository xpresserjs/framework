import lodash from "lodash";
import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import {getInstance} from "../index";

const $ = getInstance()

const projectFileExtension = $.config.get('project.fileExtension', '').substr(1)

/**
 * @param {string} middlewarePath
 * @param {*} action
 * @param route
 */
const MiddlewareEngine = (middlewarePath: any, action?: any, route?: any): any => {

    /**
     * if middleware has a dot sing we check if it is project extension file
     * if it is not we assume it is a method.
     */
    if (middlewarePath.indexOf(".") > 0) {
        const m = middlewarePath.split(".");

        if (m[1] !== projectFileExtension) {
            middlewarePath = m[0];
            action = m[1];
        }
    }

    middlewarePath = lodash.upperFirst(middlewarePath);

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
            return $.logErrorAndExit("MethodWithHttp {" + action + "} not found in middleware: " + middlewarePath);
        }
    }

    /**
     * Return Parsed Middleware
     */
    return RequestEngine.expressify(http => {
        if (typeof middleware === "function") {
            return middleware(http);
        } else {
            return middleware[action](http);
        }
    });
};

export = MiddlewareEngine;
