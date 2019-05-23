import express from "express";
import {XjsHttp} from "../types/http";
import ErrorEngine = require("./ErrorEngine");
import MiddleWareEngine = require("./MiddlewareEngine");
import RequestEngine = require("./RequestEngine");

declare let _: any;
declare let $: any;

// @ts-check
class ControllerEngine {

    /**
     * @param {object} $middleware
     * @param {string} method
     * @param {object} route
     */
    public static addMiddlewares($middleware: object, method: string, route: any) {

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
                } else {
                    middleware = _.upperFirst(middleware) + "Middleware";
                    middlewareFile = [middleware, "allow"];
                }
            }

            if (
                middlewareMethod === "*"
                || middlewareMethod === method
                || (Array.isArray(middlewareMethod)
                && middlewareMethod.indexOf(method) >= 0)
            ) {
                let path = route.path;

                if (path.trim() === "/") {
                    path = new RegExp("^\/$");
                }

                // @ts-ignore
                if (typeof middleware === "function") {
                    $.app.use(path, middleware);
                } else {
                    $.app.use(path, MiddleWareEngine(middlewareFile[0], middlewareFile[1]));
                }
            }
        }
    }

    public controller: () => void;

    /**
     * @param {function} controller
     * @param {string} method
     */
    public constructor(controller: () => void, method: string) {
        return this.processController(controller, method);
    }

    /**
     * @param {function|object} controller
     * @param {string} method
     */
    public processController(controller, method) {

        const DebugControllerAction = !$.config.debug.enabled ? false : $.config.debug.controllerAction;

        if (typeof controller === "function") {
            /*
            * If `controller` does not `extendsMainController`
            * then we know it is a nested route function.
            * */
            if (typeof controller.extendsMainController !== "boolean") {
                return controller(express.Router());
            }
        }

        return async (req: XjsHttp.Request, res: XjsHttp.Response) => {
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
                        boot = await boot;
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
                            message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${method}</code>`,
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

        controllerPath = $.use.controller( controller + $.config.project.fileExtension);

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

export = controller;
