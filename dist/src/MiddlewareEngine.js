"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const RequestEngine = require("./Plugins/ExtendedRequestEngine");
/**
 * @param {string} middlewarePath
 * @param {*} action
 * @param route
 */
const MiddlewareEngine = (middlewarePath, action, route) => {
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
    else {
        action = "allow";
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
    if (typeof middleware === "object" && typeof middleware[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }
    /**
     * Return Parsed Middleware
     */
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const request = new RequestEngine(req, res, next, route);
        if (typeof middleware === "function") {
            return middleware(request);
        }
        else {
            return middleware[action](request);
        }
    });
};
module.exports = MiddlewareEngine;
