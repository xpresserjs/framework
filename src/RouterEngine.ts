import MiddlewareEngine = require("./MiddlewareEngine");
import XpresserRouter = require("@xpresser/router");
import {DollarSign} from "../types";
import {StringToAnyKeyObject} from "./CustomTypes";
import {parseControllerString} from "./Functions/internals.fn";
import PathHelper from "./Helpers/Path";

const AllRoutesKey = "RouterEngine:allRoutes";

declare const _: any;
declare const $: DollarSign;

const NameToRoute: StringToAnyKeyObject = {};
const ProcessedRoutes: any[] = [];
const ControllerStringCache: StringToAnyKeyObject = {};

class RouterEngine {
    /**
     * Get All Registered Routes
     * @returns {*}
     */
    public static allRoutes() {
        return $.engineData.get(AllRoutesKey);
    }

    /**
     * Add Routes to already set routes
     * @param route
     */
    public static addToRoutes(route: XpresserRouter) {
        if (typeof route.routes !== "undefined" && Array.isArray(route.routes)) {
            const allRoutes = $.router.routes;
            $.router.routes = _.concat(allRoutes, route.routes);

            $.engineData.set(AllRoutesKey, $.router.routes);
        }
    }

    /**
     * Get All Processed Routes
     * @returns {*}
     */
    public static allProcessedRoutes($format?: string, $key: string = "path") {
        if ($format === "array") {
            const routesArray: any[] = [];

            for (let i = 0; i < ProcessedRoutes.length; i++) {

                const processedRoute = ProcessedRoutes[i];

                const routeArray = [
                    processedRoute.method.toUpperCase(),
                    processedRoute.path,
                    processedRoute.name || null,
                ];

                routesArray.push(routeArray);
            }

            return routesArray;
        } else if ($format === "key") {
            const routesArray: any[] = [];

            for (let i = 0; i < ProcessedRoutes.length; i++) {
                const processedRoute = ProcessedRoutes[i];
                routesArray.push(processedRoute[$key]);
            }

            return routesArray;
        }
        return ProcessedRoutes;
    }

    /**
     * @private
     * @param format
     * @returns {string}
     */
    public static namedRoutes(format = false) {
        if (format !== false) {
            const names = Object.keys(NameToRoute);
            const newFormat: StringToAnyKeyObject = {};

            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                const route = NameToRoute[name];

                newFormat[route.method + " " + route.path] = "{" + route.name + "} ===> " + route.controller;

            }

            // noinspection JSValidateTypes
            if (typeof format === "string" && format === "json") {
                return JSON.stringify(newFormat, null, 2);
            }

            return newFormat;
        }
        return NameToRoute;
    }

    /**
     * NameToPath
     * @param returnKey
     * @return {Object}
     */
    public static nameToPath(returnKey = "path") {
        const localVariableName = "RouterEngine:nameToPath";

        if ($.engineData.has(localVariableName)) {
            return $.engineData.get(localVariableName);
        }

        const names = Object.keys(NameToRoute);
        const newRoutes: StringToAnyKeyObject = {};

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            newRoutes[name] = NameToRoute[name][returnKey];
        }

        if (returnKey !== "path") {
            return newRoutes;
        }

        $.engineData.set(localVariableName, newRoutes);
        return newRoutes;
    }

    /**
     * NameToUrl
     * @return {Object}
     */
    public static nameToUrl() {
        const localVariableName = "RouterEngine:nameToUrl";

        if ($.engineData.has(localVariableName)) {
            return $.engineData.get(localVariableName);
        }

        const routes = RouterEngine.nameToPath();
        const names = Object.keys(routes);
        const newRoutes: StringToAnyKeyObject = {};

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            newRoutes[name] = $.helpers.route(name, [], false);
        }

        $.engineData.set(localVariableName, newRoutes);
        return newRoutes;
    }

    /**
     * Process Routes
     * @param routes
     * @param parent
     */
    public static processRoutes(routes: any = null, parent: any = {}) {
        const Controller = require("./ControllerEngine");

        if (!Array.isArray(routes)) {
            routes = RouterEngine.allRoutes();
        }

        for (let i = 0; i < routes.length; i++) {
            let route = routes[i].data;
            let nameWasGenerated = false;

            /*
            * If Route has children (meaning it is a Group/Path),
            * and also has a parent with children, it extends the parent.
            *
            * This means if a child of a route is a Group/Path and does not have controller set
            * it automatically inherits the parent controller
            *
            * e.g
            * Route.path('/api', () => {
            *   // Another Path here
            *
            *   Route.path('user', ()=> {
            *       // Some Routes
            *   });
            *
            *   // The path above i.e "/api/user" will inherit the parent
            *   // Route controller and its other properties unless it has it's own defined.
            *
            * }).controller('Auth').as('auth');
            */
            if (typeof route.children !== "undefined" && Array.isArray(route.children)) {

                if (parent.children !== "undefined") {
                    // tslint:disable-next-line:max-line-length
                    if (typeof route.as === "string" && typeof parent.as === "string" && route.as.substr(0, 1) === ".") {
                        route.as = parent.as + route.as;
                    }

                    route = _.extend({}, parent, route);
                }

            }

            if (typeof route.controller === "string") {
                if (!route.children && parent.useActionsAsName && !route.name) {
                    let nameFromController = route.controller;
                    if (nameFromController.includes("@")) {
                        nameFromController = nameFromController.split("@");
                        nameFromController = nameFromController[nameFromController.length - 1];
                    }
                    route.name = _.snakeCase(nameFromController);
                    nameWasGenerated = true;
                }
            }

            if (parent.as && typeof route.name === "string" && route.name.substr(0, 1) !== "/") {
                if (route.path === "" && nameWasGenerated) {
                    route.name = parent.as;
                } else {
                    route.name = parent.as + "." + route.name;
                }

            }

            if (route.name) {
                if (route.name.substr(0, 1) === "/") {
                    route.name = route.name.substr(1);
                }
                route.name = route.name.toLowerCase();
            }

            // tslint:disable-next-line:max-line-length
            if (!route.children && parent.controller && typeof route.controller === "string" && !route.controller.includes("@")) {
                route.controller = parent.controller + "@" + route.controller;
            }

            if (parent.path) {
                const routePath = $.utils.regExpSourceOrString(route.path);
                const parentPath = $.utils.regExpSourceOrString(parent.path);

                if (route.path instanceof RegExp || parent.path instanceof RegExp) {

                    route.path = new RegExp(`${parentPath}${parentPath !== "/" ? "/" : ""}${routePath}`);

                } else {

                    if (routePath.length && parentPath.substr(-1) !== "/" && routePath.substr(0, 1) !== "/") {
                        route.path = "/" + routePath;
                    }

                    route.path = parent.path + route.path;
                }

            }

            if (typeof route.path === "string" && route.path.substr(0, 2) === "//") {
                route.path = route.path.substr(1);
            }

            if (typeof route.name !== "undefined") {
                NameToRoute[route.name] = route;
            }

            if (typeof route.controller === "string" && route.controller.includes("@")) {
                // tslint:disable-next-line:prefer-const
                let {method, controller} = parseControllerString(route.controller);
                const controllerCacheKey = controller;

                if (ControllerStringCache.hasOwnProperty(controllerCacheKey)) {
                    route.controller = ControllerStringCache[controllerCacheKey] + "@" + method;
                } else {
                    let isTypescriptButUsingJsExtension = false;

                    let controllerPath = $.use.controller(
                        PathHelper.addProjectFileExtension(controller) as string
                    );

                    if (!$.file.exists(controllerPath)) {
                        if (!controller.includes("Controller")) {

                            controllerPath = $.use.controller(
                                PathHelper.addProjectFileExtension(controller + "Controller") as string
                            );

                            if (!$.file.exists(controllerPath)) {
                                /**
                                 * Check If is using typescript and plugin requires a js file.
                                 */
                                controllerPath = $.use.controller(
                                    PathHelper.addProjectFileExtension(controller + "Controller", '.js') as string
                                );

                                if ($.isTypescript() && $.file.exists(controllerPath)) {
                                    isTypescriptButUsingJsExtension = true;
                                }

                                if (!isTypescriptButUsingJsExtension) {
                                    $.logError("Controller: " + [controller, method].join("@") + " not found");
                                    $.logErrorAndExit('Path:', controllerPath)
                                }
                            }

                            controller = controller + "Controller";
                        }
                    }

                    if (isTypescriptButUsingJsExtension) {
                        controller = controller + '.js';
                    }

                    ControllerStringCache[controllerCacheKey] = controller;
                    route.controller = controller + "@" + method;
                }
            }

            const canRegisterRoutes = $.app && (!$.options.isTinker && !$.options.isConsole);

            if (typeof route.children !== "undefined" && Array.isArray(route.children)) {
                if (canRegisterRoutes) {
                    const RegisterMiddleware = (middleware: string) => {
                        const PathMiddleware = MiddlewareEngine(middleware);
                        if (PathMiddleware) {
                            $.app.use(route.path, PathMiddleware);
                        }
                    };

                    if (Array.isArray(route.middleware)) {
                        route.middleware.forEach((element: any) => {
                            RegisterMiddleware(element);
                        });
                    } else if (typeof route.middleware === "string") {
                        RegisterMiddleware(route.middleware);
                    }
                }

                if (route.children.length) {
                    RouterEngine.processRoutes(route.children, route);
                }
            } else {
                // Add To All Routes
                ProcessedRoutes.push(route);

                if (canRegisterRoutes) {
                    const controller = Controller(route);
                    // @ts-ignore
                    $.app[route.method](route.path, controller.middlewares, controller.method);
                }
            }
        }
    }
}

export = RouterEngine;
