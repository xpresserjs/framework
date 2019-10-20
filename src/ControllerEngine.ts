import express = require("express");
import ErrorEngine = require("./ErrorEngine");
import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import MiddlewareEngine = require("./MiddlewareEngine");
import Handler = require("./Controllers/Handler");
import ProcessHandlerTasks = require("./Controllers/ProcessHandlerTasks");

import {ServerResponse} from "http";

import {XpresserHttp} from "../types/http";
import {Xpresser} from "../xpresser";

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
                if (Array.isArray(middleware)) {
                    for (const item of middleware) {
                        if (typeof item === "function") {
                            middlewares.push(item);
                        }
                    }
                } else if (typeof middleware === "function") {
                    middlewares.push(middleware);
                } else {
                    middlewares.push(MiddlewareEngine(middlewareFile[0], middlewareFile[1], route));
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
    public processController(route: any, controller: any | Handler, method, isPath?: boolean) {

        const DebugControllerAction = !$.config.debug.enabled ? false : $.config.debug.controllerAction;
        const controllerName = (typeof controller.name === "string") ? controller.name : "__UNNAMED_CONTROLLER__";
        const controllerIsObject = typeof controller === "object";
        const controllerIsHandler = controllerIsObject && controller instanceof Handler;
        const $handlerArguments = [];
        const handlerArguments = () => _.clone($handlerArguments);

        // If controller is an instance of handler then get the handler.
        if (controllerIsHandler && typeof method === "string") {
            controller = controller.cloneHandler();

            if (controller.hasOwnProperty(method) && typeof controller[method] === "object") {
                const actions = controller[method];
                const config = controller.__extend__ || {tasks: {}};

                let errorHandler = controller.$e || null;

                if (actions.hasOwnProperty("$e")) {
                    errorHandler = actions.$e;
                    delete actions.$e;
                }

                const DefinedTasks = config.tasks || {};
                const taskKeys = Object.keys(actions);
                const tasks = {};

                for (const task of taskKeys) {
                    const taskIsFunction = typeof actions[task] === "function";

                    if (!taskIsFunction && !DefinedTasks.hasOwnProperty(task)) {
                        $.logErrorAndExit(`Task {${task}} does not exists in {${controllerName}}`);
                    }

                    if (taskIsFunction) {
                        tasks[task] = actions[task];
                    } else {
                        tasks[task] = DefinedTasks[task];
                    }

                }

                // Modify tasks;
                config.tasks = tasks;

                $handlerArguments.push(actions);
                $handlerArguments.push(config);

                if (errorHandler) {
                    $handlerArguments.push(errorHandler);
                }
            }
        }

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
        let useController = controller as any;
        if (typeof method !== "function") {
            if (!controllerIsObject && typeof controller[method] !== "function") {
                // Initialize controller
                useController = new controller();
            }

            // If `method` does not exists then display error
            if (typeof useController[method] !== "function" && typeof useController[method] !== "object") {
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

                if (!(boot instanceof ServerResponse)) {
                    try {

                        let $return;
                        const typeOfControllerMethod = typeof useController[method];

                        if (typeof method === "function") {
                            $return = method(x, boot);
                        } else if (typeof method === "string") {
                            if (typeOfControllerMethod === "function") {
                                $return = useController[method](x, boot);
                            } else if (typeOfControllerMethod === "object") {
                                const processArgs = handlerArguments();
                                processArgs.unshift(x);
                                // @ts-ignore
                                $return = await ProcessHandlerTasks(...processArgs);
                            }
                        }

                        if ($.fn.isPromise($return)) {
                            $return = await $return;
                        }

                        if (DebugControllerAction) {
                            console.timeEnd(timeLogKey);
                        }

                        // tslint:disable-next-line:max-line-length
                        if ($return && !($return instanceof ServerResponse) && (typeof $return === "string" || typeof $return === "object")) {
                            if (typeof $return === "string") {
                                return res.send($return);
                            } else {
                                return res.json($return);
                            }
                        }
                    } catch (e) {
                        return error.view({
                            error: {
                                // tslint:disable-next-line:max-line-length
                                message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${m}</code>`,
                                log: e.stack,
                            },
                        });
                    }
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
    let isObjectController = false;
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

    if (typeof $controller === "object") {
        isObjectController = true;
    }

    if (!isPath && typeof $controller !== "function" && !isObjectController) {
        if (typeof $controller === "string") {
            return $.logErrorAndExit("Controller: {" + $controller + "} not found!");
        }

        return $.logErrorAndExit("Controller not found!");
    }

    if (!isObjectController) {
        // noinspection JSObjectNullOrUndefined
        if (route !== undefined && typeof $controller.middleware === "function") {
            // noinspection TypeScriptValidateJSTypes
            const middleware = $controller.middleware({
                use: (middlewareFn) => {
                    return async (req, res, next) => {
                        return middlewareFn(new RequestEngine(req, res, next, route));
                    };
                },
            });

            middlewares = ControllerEngine.getMiddlewares(middleware, method, route);
        }
    }

    const $method = new ControllerEngine(route, $controller, method, isPath);

    return {
        middlewares,
        method: $method,
    };
};

export = Controller;
