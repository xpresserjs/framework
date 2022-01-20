import express = require("express");
import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import MiddlewareEngine = require("./MiddlewareEngine");
import ControllerService = require("./Controllers/ControllerService");
import ProcessServices = require("./Controllers/ProcessServices");

import ObjectCollection from "object-collection";
import lodash from "lodash";
import {ServerResponse} from "http";

import {Http} from "../types/http";

import {parseControllerString} from "./Functions/internals.fn";
import PathHelper from "./Helpers/Path";

import {getInstance} from "../index";

const $ = getInstance();


/**
 * AutoLoad Controller Services.
 */
const $useDotJson: ObjectCollection = $.engineData.get("UseDotJson");
const AutoLoadPaths = $useDotJson.get("autoload.controllerServices", undefined);
const ServicesFolder = $.path.controllers("services");
const ServicesInMemory = $.objectCollection();

// If use.json has autoloaded config and services folder exists in controllers folder.
const LoadServicesInDirectory = ($folder: string, $files?: string[]) => {
    let ServicesFolderFiles: any[];

    if (Array.isArray($files)) {
        ServicesFolderFiles = $files;
    } else {
        ServicesFolderFiles = $.file.readDirectory($folder) as any[];
    }

    for (const ServiceFile of ServicesFolderFiles) {
        const fullPath = `${$folder}/${ServiceFile}`;

        if ($.file.isDirectory(fullPath)) {
            LoadServicesInDirectory(fullPath);
        } else {
            try {
                const services: any = require(fullPath);
                if (typeof services !== "object" || (typeof services === "object" && !Object.keys(services).length)) {
                    return $.logErrorAndExit(`No ControllerService object found in {${ServiceFile}}`);
                }

                const namespace: string = services.namespace || "";
                if (services.hasOwnProperty("namespace")) {
                    if (ServicesInMemory.has(namespace)) {
                        // tslint:disable-next-line:max-line-length
                        return $.logErrorAndExit(`Namespace: {${namespace}} cannot be used because it conflicts with a registered ControllerService name.`);
                    }
                    delete services.namespace;
                }

                if (namespace.length) {
                    for (const service of Object.keys(services)) {
                        const key = `${namespace}.${service}`;
                        ServicesInMemory.set(key, services[service]);
                    }
                } else {
                    ServicesInMemory.merge(services);
                }
            } catch (e) {
                $.logErrorAndExit(e);
            }
        }

    }

};

// If AutoLoadedPaths is all or array we load files
if (AutoLoadPaths && $.file.isDirectory(ServicesFolder)) {
    if (AutoLoadPaths === "all") {
        LoadServicesInDirectory(ServicesFolder);
    } else if (Array.isArray(AutoLoadPaths)) {
        LoadServicesInDirectory(ServicesFolder, AutoLoadPaths);
    }
}

// @ts-check
class ControllerEngine {

    /**
     * @param {object} $middleware
     * @param {string} method
     * @param {object} route
     * @param processOnly
     */
    public static getMiddlewares($middleware: Record<string, any>, method: string, route: any, processOnly = false) {

        const middlewareKeys = Object.keys($middleware);
        const middlewares: any[] = [];

        for (let i = 0; i < middlewareKeys.length; i++) {
            let middleware: any = middlewareKeys[i];
            let middlewareFile: any[] = [];
            let middlewareMethod: string = $middleware[middleware];

            if (middleware.substr(0, 1) === "@") {
                const oldMiddlewareMethod = middlewareMethod;
                middlewareMethod = middleware.substr(1);
                middleware = oldMiddlewareMethod;
            }

            if (typeof middleware === "string") {
                if (middleware.indexOf(".") > 0) {
                    const m = middleware.split(".");
                    m[0] = lodash.upperFirst(m[0]) + "Middleware";
                    middlewareFile = m;
                } else {
                    middleware = lodash.upperFirst(middleware) + "Middleware";
                    middlewareFile = [middleware, "allow"];
                }
            }

            if (
                middlewareMethod === "*"
                || middlewareMethod === method
                || (Array.isArray(middlewareMethod) && middlewareMethod.includes(method))
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
                    middlewares.push(MiddlewareEngine(middlewareFile[0], middlewareFile[1], route, processOnly));
                }
            }
        }

        return middlewares;
    }

    public controller(): void {
        // Empty Function
    };

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
    public processController(route: any, controller: any | ControllerService, method: any, isPath?: boolean) {

        let controllerName = (typeof controller.name === "string") ? controller.name : "__UNNAMED_CONTROLLER__";
        const controllerIsObject = typeof controller === "object";
        const controllerIsService = controller instanceof ControllerService;
        const $handlerArguments: any[] = [];
        let errorHandler: any = null;
        const handlerArguments = () => lodash.clone($handlerArguments);

        // If controller is an getInstance of handler then get the handler.
        if (controllerIsObject && typeof method === "string") {
            if (controllerIsService) {
                controller = controller.getClone();
            }

            controllerName = controller.name || controllerName;
            errorHandler = controller.e || null;

            if (controller.hasOwnProperty(method) && typeof controller[method] === "object") {

                const actions = controller[method];
                const config = controller.__extend__ || {services: {}};

                if (actions.hasOwnProperty("e")) {
                    errorHandler = actions.e;
                    delete actions.e;
                }

                const DefinedServices = config.services || {};
                const serviceKeys = Object.keys(actions);
                const services: Record<string, any> = {};

                for (const service of serviceKeys) {
                    const serviceIsDefined = DefinedServices.hasOwnProperty(service);
                    const serviceIsInjected = typeof actions[service] === "function";

                    if (!serviceIsDefined && !serviceIsInjected) {
                        if (ServicesInMemory.has(service)) {
                            DefinedServices[service] = ServicesInMemory.get(service);
                        } else {
                            $.logErrorAndExit(`Service {${service}} does not exists in {${controllerName}}`);
                        }
                    }

                    if (serviceIsInjected) {
                        // Change to Array!
                        services[service] = [actions[service]];
                    } else {
                        services[service] = DefinedServices[service];
                    }

                }

                // Modify services;
                $handlerArguments.push(actions);
                // push Config
                $handlerArguments.push({
                    services,
                });

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
                return controller(express.Router({mergeParams: true}));
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

        if (typeof errorHandler !== "function") {
            errorHandler = () => false;
        }

        return async (req: Http.Request, res: Http.Response, next: any) => {
            const http = new RequestEngine(req, res, next, route);
            // Log Time if `DebugControllerAction` is true
            let timeLogKey = "";
            const mockErrorHandler = (...args: any[]) => {
                return errorHandler(http, ...args);
            };

            try {
                // Run static boot method if found in controller
                let boot = http.state.get("boot", {});

                if (typeof controller.boot === "function") {
                    try {
                        boot = await controller.boot(http, mockErrorHandler);
                    } catch (e) {
                        return http.newError().view({
                            error: {
                                message: `Error in Controller Boot Method:  <code>${controllerName}</code>`,
                                log: (e as Error).stack,
                            },
                        });
                    }
                }

                if (!(boot instanceof ServerResponse)) {
                    try {
                        let $return;
                        const typeOfControllerMethod = typeof useController[method];

                        if (typeof method === "function") {

                            $return = await method(http, mockErrorHandler, boot);

                        } else if (typeof method === "string") {

                            if (typeOfControllerMethod === "function") {

                                $return = await useController[method](http, boot, mockErrorHandler);

                            } else if (typeOfControllerMethod === "object") {

                                const processArgs = handlerArguments();
                                processArgs.unshift(boot);
                                processArgs.unshift(http);
                                // @ts-ignore
                                $return = await ProcessServices(...processArgs);

                            }
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
                        return http.newError().view({
                            error: {
                                // tslint:disable-next-line:max-line-length
                                message: `Error in Controller:  <code>${controllerName}</code>, Method: <code>${m}</code>`,
                                log: (e as Error).stack,
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
 * @param processOnly
 */
const Controller = (route: any, method: any = null, processOnly = false) => {

    let $controller: any = undefined;
    let controllerPath: string | null = null;
    let isPath = false;
    let isObjectController = false;

    if (typeof route === "object") {

        if (route.hasOwnProperty("controller")) {
            $controller = route.controller;
        }

        if (route.hasOwnProperty("children")) {
            isPath = true;
        }

    }

    if (typeof $controller === "string" && $controller.includes("@")) {
        const controllerAndMethod = parseControllerString($controller);

        $controller = controllerAndMethod.controller;
        method = controllerAndMethod.method;

        controllerPath = $.use.controller(PathHelper.addProjectFileExtension($controller) as string) as string;

        $controller = require(controllerPath);
    }

    if (typeof $controller === "object") {
        isObjectController = true;
    }

    if ($controller && !isPath && typeof $controller !== "function" && !isObjectController) {
        if (typeof $controller === "string") {
            return $.logErrorAndExit("Controller: {" + $controller + "} not found!");
        }

        return $.logErrorAndExit("Controller not found!");
    }

    const use = (arg: any) => RequestEngine.expressify(arg);

    let controllerMiddleware: any;
    if ($controller && route !== undefined) {
        const isControllerService = $controller instanceof ControllerService;
        if (isControllerService || isObjectController) {

            const ctrl = isControllerService ? $controller.controller : $controller;
            if (typeof ctrl.middleware === "function") {
                controllerMiddleware = ctrl.middleware({use});
            } else if (typeof ctrl.middlewares === "object") {
                controllerMiddleware = ctrl.middlewares;
            }
        } else if (typeof $controller.middleware === "function") {
            controllerMiddleware = $controller.middleware({use});
        }
    }

    let middlewares: any[] = [];
    if (controllerMiddleware) {
        middlewares = ControllerEngine.getMiddlewares(controllerMiddleware, method, route, processOnly);
    }

    if (processOnly) {
        return {middlewares, $controller, method}
    }

    const $method = new ControllerEngine(route, $controller, method, isPath);

    return {
        middlewares,
        method: $method,
    };
};

export = Controller;
