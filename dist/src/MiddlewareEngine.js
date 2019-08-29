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
class MiddlewareEngine {
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
    processMiddleware() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            return this.middleware[this.action](new RequestEngine(req, res, next, this.route));
        });
    }
}
/**
 * @param {string} middlewarePath
 * @param {*} action
 * @param route
 */
const GetMiddleware = (middlewarePath, action = undefined, route) => {
    const middlewareFile = $.use.middleware(middlewarePath, false);
    if (middlewareFile === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }
    if (typeof middlewareFile === "object" && typeof middlewareFile[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }
    return (new MiddlewareEngine(middlewareFile, action, route)).processMiddleware();
};
module.exports = GetMiddleware;
