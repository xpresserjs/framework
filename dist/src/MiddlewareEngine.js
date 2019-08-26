"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const RequestEngine = require("./Plugins/ExtendedRequestEngine");
class MiddlewareEngine {
    /**
     * @param {object} middleware
     * @param {string} action
     */
    constructor(middleware, action = "allow") {
        this.middleware = middleware;
        this.action = action;
    }
    processMiddleware() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            return this.middleware[this.action](new RequestEngine(req, res, next));
        });
    }
}
/**
 * @param {string} middlewarePath
 * @param {*} action
 */
const GetMiddleware = (middlewarePath, action = undefined) => {
    const middlewareFile = $.use.middleware(middlewarePath, false);
    if (middlewareFile === false) {
        return $.logErrorAndExit("Middleware: " + middlewarePath + " not found!");
    }
    if (typeof middlewareFile === "object" && typeof middlewareFile[action] === "undefined") {
        return $.logErrorAndExit("Method {" + action + "} not found in middleware: " + middlewarePath);
    }
    return (new MiddlewareEngine(middlewareFile, action)).processMiddleware();
};
module.exports = GetMiddleware;
