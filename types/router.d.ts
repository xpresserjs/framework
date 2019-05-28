declare interface XpresserRoute {
    data: object;

    /**
     * Set name this of route.
     * @param  name
     */
    name(name: string): this;

    /**
     * Set group prefix name of this route.
     * @param as
     */
    as(as: string): this;

    /**
     * Set Controller of this route
     * @param controller
     * @param [actionsAsName=false]
     */
    controller(controller:string, actionsAsName?: boolean): this;

    /**
     * Set name of this route using method name
     */
    actionAsName(): this;

    /**
     * Sets names of every route in group as their method name
     */
    actionsAsName(): this;
}

declare interface XpresserRouter {
    routes: any[];

    /**
     * Set path or grouped routes
     * @param path
     * @param routes
     */
    path(path: string, routes: () => void): XpresserRoute;

    /**
     * Match Any Request Method
     * @param path
     * @param action
     */
    all(path: string, action?: string): XpresserRoute;

    /**
     * Router Delete
     * @param path
     * @param action
     */
    delete(path, action?: string): XpresserRoute;

    /**
     * Router Get
     * @param path
     * @param action
     */
    get(path: string, action?: string): XpresserRoute;

    /**
     * Router Post
     * @param path
     * @param action
     */
    post(path: string, action?: string): XpresserRoute;

    /**
     * Router Put
     * @param path
     * @param action
     */
    put(path: string, action?: string): XpresserRoute;

    /**
     * Routes to run after plugins
     */
    routesAfterPlugins(): void;
}
