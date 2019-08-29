import express = require("express");
import {XpresserHttp} from "../http";
import ErrorEngine = require("./ErrorEngine");
import RequestEngine = require("./Plugins/ExtendedRequestEngine");

import GetMiddleware = require("./MiddlewareEngine");
import {Xpresser} from "../global";

declare let _: any;
declare let $: Xpresser;

// @ts-check
class ControllerEngine {

    /**
     * @param {object} $middleware
     * @param {string} method
     * @param {object} route
     */
    public static getMiddlewares($middleware: object, method: string, route: any) {

        const middlewareKeys = Object.keys($middleware);
        const middlewares = [];

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
                } else {
                    middleware = _.upperFirst(middleware) + "Middleware";
                    middlewareFile = [middleware, "allow"];
                }
            }

            if (
                middlewareMethod === "*"
                || middlewareMethod === method
                || (Array.isArray(middlewareMethod)
                && middlewareMethod.includes(method))
            ) {
                let path = route.path;

                if (typeof path === "string") {

                    if (path.trim() === "/") {
                        path = new RegExp("^\/$");
                    }
                }

                // @ts-ignore
                if (typeof middleware === "function") {
                    middlewares.push(middleware);
                } else {
                    middlewares.push(GetMiddleware(middlewareFile[0], middlewareFile[1]));
                }
            }
        }

        return middlewares;
    }

    public controller: () => void;

    /**
     * @param route
     * @param {function} controller
     * @param {string} method
     * @param isPath
     */
    public constructor(route: any, controller: () => void, method: string, isPath?: boolean) {
        return this.processController(route, controller, method, isPath);
    }

    /**
     * @param route
     * @param {function|object} controller
     * @param {string} method
     * @param isPath
     */
    public processController(route: any, controller, method, isPath?: boolean) {

        const DebugControllerAction = !$.config.debug.enabled ? false : $.config.debug.controllerAction;
        const controllerName = (typeof controller.name === "string") ? controller.name : "";

        if (typeof controller === "function") {

            /*
            * If `isPath`
            * then we know it is a nested route function.
            *
            * Else it will be a request handler.
            * */

            if (isPath) {
                return controller(express.Router());
            } else if (typeof controller.extendsMainController !== "boolean") {
                method = controller;
            }
        }

        let m: string;

        if (typeof method === "string") {
            m = method;
        } else {
            m = "";
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

            // If `method` does not exists then display error
            if (typeof useController[method] !== "function") {
                return $.logErrorAndExit(`Method: {${method}} does not exist in controller: {${controllerName}}`);
            }
        }

        return async (req: XpresserHttp.Request, res: XpresserHttp.Response) => {
            // Log Time if `DebugControllerAction` is true
            let timeLogKey = "";
            if (DebugControllerAction) {
                timeLogKey = req.method.toUpperCase() + " - " + req.url;
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
                    } catch (e) {
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
                        boot = await boot;
                    }
                }

                try {

                    let $return;

                    if (typeof method === "function") {
                        $return = method(x, boot);
                    } else {
                        $return = useController[method](x, boot);
                    }

                    if ($.fn.isPromise($return)) {
                        $return = await $return;
                    }

                    if (DebugControllerAction) {
                        console.timeEnd(timeLogKey);
                    }

                    return $return;
                } catch (e) {
                    return error.view({
                        error: {
                            // tslint:disable-next-line:max-line-length
                            message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${m}</code>`,
                            log: e.stack,
                        },
                    });
                }
            } catch (e) {
                $.logError(e);
            }
        };
    }
}

/**
 * @param {string | Object | Function} route
 * @param {string |null} method
 */
const Controller = (route, method = null) => {
    let $controller: any = undefined;
    let controllerPath = null;
    let isPath = false;
    let middlewares = [];

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
        middlewares = ControllerEngine.getMiddlewares(middleware, method, route);
    }

    const $method = new ControllerEngine(route, $controller, method, isPath);

    return {
        middlewares,
        method: $method,
    };
};

export = Controller;
