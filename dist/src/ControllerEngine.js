"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const ErrorEngine = require("./ErrorEngine");
const MiddleWareEngine = require("./MiddlewareEngine");
const RequestEngine = require("./RequestEngine");
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
                if (middleware.includes(".")) {
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
                    && middlewareMethod.indexOf(method) >= 0)) {
                let path = route.path;
                if (path.trim() === "/") {
                    path = new RegExp("^\/$");
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
     * @param {function} controller
     * @param {string} method
     */
    constructor(controller, method) {
        return this.processController(controller, method);
    }
    /**
     * @param {function|object} controller
     * @param {string} method
     */
    processController(controller, method) {
        const DebugControllerAction = !$.config.debug.enabled ? false : $.config.debug.controllerAction;
        if (typeof controller === "function") {
            /*
            * If `controller` does not `extendsMainController`
            * then we know it is a nested route function.
            * */
            if (typeof controller.extendsMainController !== "boolean") {
                return controller(express_1.default.Router());
            }
        }
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            // Log Time if `DebugControllerAction` is true
            const timeLogKey = req.method.toUpperCase() + " - " + req.url;
            if (DebugControllerAction) {
                console.time(timeLogKey);
            }
            // Get `x` from RequestEngine
            const x = new RequestEngine(req, res);
            try {
                // Run static boot method if found in controller
                let boot = {};
                if (typeof controller.boot === "function") {
                    boot = controller.boot(x);
                    if ($.fn.isPromise(boot)) {
                        boot = yield boot;
                    }
                }
                /*
                 * Since we can't tell if `method` is static we check
                 * If `method` is not static then initialize controller and set to `useController`
                 */
                let useController = controller;
                const controllerName = (typeof controller.name === "string") ? controller.name : "";
                if (typeof controller[method] !== "function") {
                    // Initialize controller
                    useController = new controller();
                }
                const error = new ErrorEngine(x);
                try {
                    // If `method` does not exists then display error
                    if (typeof useController[method] !== "function") {
                        return error.controllerMethodNotFound("", method, controllerName);
                    }
                    let $return = useController[method](x, boot);
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
                            message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${method}</code>`,
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
 * @param {string | Object | Function} controller
 * @param {string |null} method
 */
const controller = (controller, method = null) => {
    let route = undefined;
    let controllerPath = null;
    if (typeof controller === "object" && controller.hasOwnProperty("controller")) {
        route = controller;
        controller = controller.controller;
    }
    if (typeof controller === "string" && controller.includes("@")) {
        const split = controller.split("@");
        controller = split[0];
        method = split[1];
        controllerPath = $.use.controller(controller + ".js");
        controller = require(controllerPath);
    }
    if (typeof controller !== "function") {
        if (typeof controller === "string") {
            return $.logErrorAndExit("Controller: {" + controller + "} not found!");
        }
        return $.logErrorAndExit("Controller not found!");
    }
    if (route !== undefined && typeof controller.middleware === "function") {
        const middleware = controller.middleware();
        ControllerEngine.addMiddlewares(middleware, method, route);
    }
    return new ControllerEngine(controller, method);
};
module.exports = controller;
//# sourceMappingURL=ControllerEngine.js.map