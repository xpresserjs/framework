"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const ErrorEngine = require("./ErrorEngine");
const RequestEngine = require("./Plugins/ExtendedRequestEngine");
const MiddleWareEngine = require("./MiddlewareEngine");
// @ts-check
class ControllerEngine {
    /**
     * @param {object} $middleware
     * @param {string} method
     * @param {object} route
     */
    static addMiddlewares($middleware, method, route) {
        const middlewareKeys = Object.keys($middleware);
        for (let i = 0; i < middlewareKeys.length; i++) {
            let middleware = middlewareKeys[i];
            let middlewareFile = [];
            let middlewareMethod = $middleware[middleware];
            if (middleware.substr(0, 1) === "@") {
                const oldMiddlewareMethod = middlewareMethod;
                middlewareMethod = middleware.substr(1);
                middleware = oldMiddlewareMethod;
            }
            if (typeof middleware === "string") {
                if (middleware.indexOf(".") > 0) {
                    const m = middleware.split(".");
                    m[0] = _.upperFirst(m[0]) + "Middleware";
                    middlewareFile = m;
                }
                else {
                    middleware = _.upperFirst(middleware) + "Middleware";
                    middlewareFile = [middleware, "allow"];
                }
            }
            if (middlewareMethod === "*"
                || middlewareMethod === method
                || (Array.isArray(middlewareMethod)
                    && middlewareMethod.includes(method))) {
                let path = route.path;
                if (path.trim() === "/") {
                    path = new RegExp("^\/$");
                }
                else {
                    path = new RegExp("^\\" + path + "$");
                }
                // @ts-ignore
                if (typeof middleware === "function") {
                    $.app.use(path, middleware);
                }
                else {
                    $.app.use(path, MiddleWareEngine(middlewareFile[0], middlewareFile[1]));
                }
            }
        }
    }
    /**
     * @param route
     * @param {function} controller
     * @param {string} method
     * @param isPath
     */
    constructor(route, controller, method, isPath) {
        return this.processController(route, controller, method, isPath);
    }
    /**
     * @param route
     * @param {function|object} controller
     * @param {string} method
     * @param isPath
     */
    processController(route, controller, method, isPath) {
        const DebugControllerAction = !$.config.debug.enabled ? false : $.config.debug.controllerAction;
        if (typeof controller === "function") {
            /*
            * If `isPath`
            * then we know it is a nested route function.
            *
            * Else it will be a request handler.
            * */
            if (isPath) {
                return controller(express.Router());
            }
            else if (typeof controller.extendsMainController !== "boolean") {
                method = controller;
            }
        }
        let m;
        if (typeof method === "string") {
            m = method;
        }
        else {
            m = "";
        }
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            // Log Time if `DebugControllerAction` is true
            const timeLogKey = req.method.toUpperCase() + " - " + req.url;
            const controllerName = (typeof controller.name === "string") ? controller.name : "";
            if (DebugControllerAction) {
                console.time(timeLogKey);
            }
            // Get `x` from RequestEngine
            const x = new RequestEngine(req, res, undefined, route);
            const error = new ErrorEngine(x);
            try {
                // Run static boot method if found in controller
                let boot = {};
                if (typeof controller.boot === "function") {
                    try {
                        boot = controller.boot(x);
                    }
                    catch (e) {
                        return error.view({
                            error: {
                                // tslint:disable-next-line:max-line-length
                                message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${m}</code>`,
                                log: e.stack,
                            },
                        });
                    }
                    if ($.fn.isPromise(boot)) {
                        // noinspection ES6RedundantAwait
                        boot = yield boot;
                    }
                }
                /*
                 * Since we can't tell if `method` is static we check
                 * If `method` is not static then initialize controller and set to `useController`
                 */
                let useController = controller;
                if (typeof method !== "function") {
                    if (typeof controller[method] !== "function") {
                        // Initialize controller
                        useController = new controller();
                    }
                }
                try {
                    // If `method` does not exists then display error
                    if (typeof method !== "function" && typeof useController[method] !== "function") {
                        return error.controllerMethodNotFound("", method, controllerName);
                    }
                    let $return;
                    if (typeof method === "function") {
                        $return = method(x, boot);
                    }
                    else {
                        $return = useController[method](x, boot);
                    }
                    if ($.fn.isPromise($return)) {
                        $return = yield $return;
                    }
                    if (DebugControllerAction) {
                        console.timeEnd(timeLogKey);
                    }
                    return $return;
                }
                catch (e) {
                    return error.view({
                        error: {
                            // tslint:disable-next-line:max-line-length
                            message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${m}</code>`,
                            log: e.stack,
                        },
                    });
                }
            }
            catch (e) {
                $.logError(e);
            }
        });
    }
}
/**
 * @param {string | Object | Function} route
 * @param {string |null} method
 */
const Controller = (route, method = null) => {
    let $controller = undefined;
    let controllerPath = null;
    let isPath = false;
    if (typeof route === "object") {
        if (route.hasOwnProperty("controller")) {
            $controller = route.controller;
        }
        if (route.hasOwnProperty("children")) {
            isPath = true;
        }
    }
    if (typeof $controller === "string" && $controller.includes("@")) {
        const split = $controller.split("@");
        $controller = split[0];
        method = split[1];
        controllerPath = $.use.controller($controller + $.config.project.fileExtension);
        $controller = require(controllerPath);
    }
    if (!isPath && typeof $controller !== "function") {
        if (typeof $controller === "string") {
            return $.logErrorAndExit("Controller: {" + $controller + "} not found!");
        }
        return $.logErrorAndExit("Controller not found!");
    }
    // noinspection JSObjectNullOrUndefined
    if (route !== undefined && typeof $controller.middleware === "function") {
        // noinspection TypeScriptValidateJSTypes
        const middleware = $controller.middleware();
        ControllerEngine.addMiddlewares(middleware, method, route);
    }
    return new ControllerEngine(route, $controller, method, isPath);
};
module.exports = Controller;
