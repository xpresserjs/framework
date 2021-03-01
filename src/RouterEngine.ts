import lodash from "lodash";
import XpresserRouter = require("@xpresser/router");
import PathHelper = require("./Helpers/Path");
import MiddlewareEngine = require("./MiddlewareEngine");
import {getInstance} from "../index";
import {parseControllerString} from "./Functions/internals.fn";
import XpresserRoute from "@xpresser/router/src/XpresserRoute";
import XpresserPath from "@xpresser/router/src/XpresserPath";
import {RouteData, RoutePathData} from "@xpresser/router/src/custom-types";
import {pathToUrl} from "./Functions/router.fn";


const $ = getInstance();

// EngineDate Store Key for all processed routes.
const AllRoutesKey = "RouterEngine:allRoutes";

// Name to route records memory cache.
const NameToRoute: Record<string, any> = {};

// Processed routes records memory cache.
const ProcessedRoutes: (RouteData & {url: string})[] = [];

// Resolved Controller Names records memory cache.
const ControllerStringCache: Record<string, any> = {};

/**
 * RouterEngine Class.
 * Handles processing of routes.
 */
class RouterEngine {
    /**
     * Get All Registered Routes
     * @returns {*}
     */
    public static allRoutes(): (XpresserRoute | XpresserPath)[] {
        return $.engineData.get(AllRoutesKey);
    }

    /**
     * Add Routes to already set routes
     * @param route
     */
    public static addToRoutes(route: XpresserRouter) {
        if (typeof route.routes !== "undefined" && Array.isArray(route.routes)) {
            const allRoutes = $.router.routes;
            $.router.routes = lodash.concat(allRoutes, route.routes);

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
                    processedRoute.method!.toUpperCase(),
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
                routesArray.push((processedRoute as any)[$key]);
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
    public static namedRoutes(format: boolean | string = false) {
        if (format !== false) {
            const names = Object.keys(NameToRoute);
            const newFormat: Record<string, any> = {};

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
        const newRoutes: Record<string, any> = {};

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
        const newRoutes: Record<string, any> = {};

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
    public static processRoutes(routes: (XpresserRoute | XpresserPath)[] | null = null, parent?: RoutePathData) {
        const Controller = require("./ControllerEngine");

        if (!Array.isArray(routes)) {
            routes = RouterEngine.allRoutes();
        }

        for (let i = 0; i < routes.length; i++) {
            let route = routes[i].data as RouteData;
            let routeAsPath = Array.isArray((route as RoutePathData).children) ? route as RoutePathData : false;
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
            if (routeAsPath && parent) {

                if (parent.children) {
                    // tslint:disable-next-line:max-line-length
                    if (typeof routeAsPath.as === "string" && typeof parent.as === "string" && routeAsPath.as.substr(0, 1) === ".") {
                        routeAsPath.as = parent.as + routeAsPath.as;
                    }

                    // Mutates both route and routeAsPath
                    lodash.defaults(routeAsPath, {
                        as: parent.as,
                        controller: parent.controller,
                        useActionsAsName: parent.useActionsAsName,
                    })
                }
            }

            if (typeof route.controller === "string") {
                if (!routeAsPath && (parent?.useActionsAsName) && !route.name) {
                    let nameFromController = route.controller;
                    if (nameFromController.includes("@")) {
                        let splitName = nameFromController.split("@");
                        nameFromController = splitName[splitName.length - 1];
                    }

                    route.name = lodash.snakeCase(nameFromController);
                    nameWasGenerated = true;
                }
            }

            if ((parent?.as) && typeof route.name === "string" && route.name.substr(0, 1) !== "/") {
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
            if (!routeAsPath && (parent?.controller) && typeof route.controller === "string" && !route.controller.includes("@")) {
                route.controller = parent.controller + "@" + route.controller;
            }

            if (parent?.path) {
                const routePath = $.utils.regExpSourceOrString(route.path as string);
                const parentPath = $.utils.regExpSourceOrString(parent.path as string);

                if (route.path instanceof RegExp || parent.path instanceof RegExp) {

                    route.path = new RegExp(`${parentPath}${parentPath !== "/" ? "/" : ""}${routePath}`);

                } else {

                    if (routePath.length && parentPath.substr(-1) !== "/" && routePath.substr(0, 1) !== "/") {
                        route.path = "/" + routePath;
                    }

                    route.path = parent.path as string + route.path;
                }

            }

            if (typeof route.path === "string" && route.path.substr(0, 2) === "//") {
                route.path = route.path.substr(1);
            }

            if (typeof route.name !== "undefined") {
                NameToRoute[route.name] = route;
            }

            if (!routeAsPath && typeof route.controller === "string" && route.controller.includes("@")) {
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

            const canRegisterRoutes = ($.app && (!$.options.isTinker && !$.options.isConsole));

            if (routeAsPath) {
                if (canRegisterRoutes) {
                    const RegisterMiddleware = (middleware: string) => {
                        const PathMiddleware = MiddlewareEngine(middleware);
                        if (PathMiddleware) {
                            $.app!.use((routeAsPath as RoutePathData).path as string, PathMiddleware);
                        }
                    };

                    if (Array.isArray(routeAsPath.middleware)) {
                        routeAsPath.middleware.forEach((element: any) => {
                            RegisterMiddleware(element);
                        });
                    } else if (typeof routeAsPath.middleware === "string") {
                        RegisterMiddleware(routeAsPath.middleware);
                    }
                }

                if (routeAsPath.children!.length) {
                    RouterEngine.processRoutes(routeAsPath.children as any, routeAsPath);
                }
            } else {
                // Add to all Routes
                ProcessedRoutes.push({
                    url: pathToUrl(route.path as string),
                    ...route,
                });

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
