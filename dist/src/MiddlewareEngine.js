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
const MiddlewareEngine = (middlewarePath, action = undefined, route) => {
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
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        return middleware[action](new RequestEngine(req, res, next, route));
    });
};
module.exports = MiddlewareEngine;
