import fs from "fs";
import {Http} from "../types/http";

import {getInstance} from "../index";
import {DollarSign} from "../types";
import Path from "path";
import ObjectCollection from "object-collection";
import requestHelpers from "./Functions/request.fn";
import ErrorEngine from "./ErrorEngine";
import lodash from "lodash";
import InXpresserError from "./Errors/InXpresserError";
import express from "express";

const ejs = require("ejs");
const $ = getInstance();

const PluginNameSpaces: any = $.engineData.get("PluginEngine:namespaces", {});
const useFlash = $.config.get("server.use.flash", false);

/**
 * Get Request Engine Config
 */
const requestEngineConfig: {
    dataKey: string,
    proceedKey: string,
    messageKey: string
} = $.config.get('server.requestEngine', {
    dataKey: 'data',
    proceedKey: 'proceed',
    messageKey: 'message'
});

class RequestEngine {
    public req: Http.Request;
    public res: Http.Response;

    public $query: ObjectCollection;
    public $body: ObjectCollection;

    public params: Record<string, any>;
    public state: ObjectCollection;

    public route: {
        name: string,
        method: string,
        controller: string,
    } = {
        name: "",
        method: "",
        controller: "",
    };

    /**
     *
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @param route
     */
    constructor(req: Http.Request, res: Http.Response, next?: () => void, route?: any) {
        this.res = res;
        this.req = req;

        if (typeof next === "function") this.next = next;

        if (route) this.route = {
            name: route.name || "",
            method: route.method || "",
            controller: typeof route.controller === "string"
                ? route.controller : "",
        };

        this.params = req.params || {};

        // Set Default locals
        if (!res.locals) res.locals = {};

        // Set State
        this.state = new ObjectCollection(res.locals);

        // Set $body and $query
        this.$body = new ObjectCollection(req.body || {});
        this.$query = new ObjectCollection(req.query || {});
    }


    /**
     * Takes in an xpresser middleware and returns an express middleware.
     *
     * Useful when dealing with express middlewares but want to use xpresser's RequestEngine.
     */
    public static expressify(fn: (http: RequestEngine) => any) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            return fn(new this(req, res, next));
        }
    }

    /**
     * If User has customRenderer then use it.
     */
    customRenderer!: (...args: any[]) => string

    /**
     * Returns Current Xpresser Instance.
     */
    $instance(): DollarSign {
        return $;
    }

    /**
     * Xpresser Instance Getter
     * @param key
     */
    $<K extends keyof DollarSign>(key: K): DollarSign[K] {
        return $[key];
    }

    /**
     * Returns an instance of ErrorEngine
     */
    newError(e?: any): ErrorEngine {
        return new ErrorEngine(this, e)
    }

    /**
     * Request Next Function
     */
    public next(): void {
        // Next block is empty
    }

    /**
     * Send Body
     * @param body
     * @param status
     */
    public send(body: any, status?: number): Http.Response {
        if (status) this.status(status);
        return this.res.send(body);
    }

    /**
     * Send Json Response
     * @param body
     * @param status
     */
    public json(body: any, status?: number): Http.Response {
        if (status) this.status(status);
        return this.res.json(body);
    }

    /**
     * Set response status
     * @param code
     */
    public status(code: number): this {
        this.res.status(code);
        return this;
    }

    /**
     * Request Query Data
     * @param [key]
     * @param [$default]
     * @returns {*|ObjectCollection}
     */
    public query<T = unknown>(key?: string | undefined, $default?: T): T {
        return this.$query.get<T>(key, $default)
    }

    /**
     * Request Body Data
     * @param [key]
     * @param [$default]
     * @example
     * const body = http.body('inputName', 'defaultValue');
     * const body = http.body(); // collection
     * @returns {*|ObjectCollection}
     */
    public body<T = unknown>(key?: string | undefined, $default?: T): T {
        return this.$body.get<T>(key, $default)
    }

    /**
     * Check if param exists in current request.
     * @param param
     */
    public hasParam(param: string): boolean {
        return this.params.hasOwnProperty(param);
    }

    /**
     * Check if params exists in current request.
     * @param params
     */
    public hasParams(params: string[]): boolean {
        if (!Array.isArray(params)) {
            throw new InXpresserError(`hasParams: Expects argument params to be an array of params.`)
        }

        for (const param of params) {
            if (!this.hasParam(param)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all or pluck keys
     * @param pluck
     * @returns {*}
     */
    public all(pluck: any[] = []) {
        const all = lodash.extend({}, this.req.query, this.req.body);
        if (pluck.length) {
            return lodash.pick(all, pluck);
        }
        return all;
    }

    /**
     * To API format
     * @param {*} data
     * @param {boolean} proceed
     * @param {number} status
     */
    public toApi(data: any = {}, proceed = true, status?: number): Http.Response {
        const d = {[requestEngineConfig.proceedKey]: proceed} as any;

        if (data.hasOwnProperty(requestEngineConfig.messageKey)) {
            d[requestEngineConfig.messageKey] = data[requestEngineConfig.messageKey];
            delete data[requestEngineConfig.messageKey];
        }

        d.data = data;

        if (status !== undefined) this.res.status(status);

        return this.json(d, status);
    }

    /**
     * Return false to Api
     * @param {object} data
     * @param {number} status
     */
    public toApiFalse(data: object = {}, status: number = 200): Http.Response {
        return this.toApi(data, false, status);
    }

    /**
     * Say something true to your front end!
     * @param {string} message
     * @param {boolean} proceed
     * @param {number} status
     */
    public sayToApi(message: string, proceed = true, status = 200): Http.Response {
        return this.toApi({
            [requestEngineConfig.messageKey]: message,
        }, proceed, status);
    }

    /**
     * Say some error to your front end!
     * @param {string} message
     * @param {boolean} proceed
     * @param {number} status
     */
    public sayToApiFalse(message: string, proceed = false, status = 200): Http.Response {
        return this.toApi({
            [requestEngineConfig.messageKey]: message,
        }, proceed, status);
    }

    /**
     * Redirect to url.
     * @param {string} path
     * @returns {*}
     */
    public redirect(path = "/"): any {
        this.res.redirect(path);
        return this.res.end();
    }

    /**
     * Redirect Back
     */
    public redirectBack(): any {
        const backURL = this.req.header("Referer") || "/";
        return this.redirect(backURL);
    }

    /**
     * Redirect to route
     * @param {string} route
     * @param {Array|string} keys
     * @param query
     * @param includeUrl
     * @returns {*}
     */
    public redirectToRoute(route: string, keys?: any[], query?: object | boolean, includeUrl?: boolean): any {
        return this.redirect($.helpers.route(route, keys, query, includeUrl));
    }

    /**
     * View Data
     * @param file
     * @private
     */
    protected viewData(file: string): any {
        const localsConfig = $.config.get('template.locals');
        const all = localsConfig.all;

        let ctx: any;

        ctx = lodash.extend({}, $.helpers, requestHelpers(this));

        ctx.$route = this.route;
        ctx.$currentView = file;

        if (useFlash && this.req.flash) {
            ctx.$flash = this.req.flash();
        }

        ctx.$currentUrl = this.req.url;

        if (all) {
            ctx.$query = this.req.query;
            ctx.$body = this.req.body;
            ctx.$stackedScripts = [];
        } else {
            if (localsConfig.stackedScripts) ctx.$stackedScripts = [];
            if (localsConfig.query) ctx.$query = this.req.query;
            if (localsConfig.body) ctx.$body = this.req.body;
        }
        this.res.locals["ctx"] = ctx;

        return ctx;
    }

    /**
     * Render View
     * @param {string} file
     * @param {Object} data
     * @param {boolean} fullPath
     * @param useInternalEjs
     * @returns {*}
     */
    public view(file: string, data = {}, fullPath: boolean = false, useInternalEjs: boolean = false): any {

        /**
         * Express Default Renderer
         * @param args
         */
        const defaultRender = (...args: any[]) => {
            // @ts-ignore
            return this.res.render(...args);
        };

        /**
         * If RequestEngine has function this.customRenderer
         * We use that function else we use express default.
         */
        const Render = typeof this.customRenderer === "function" ? this.customRenderer : defaultRender;
        const $filePath = file;

        /**
         * If view has namespace,
         * We file the exact path to the file.
         */
        if (file.indexOf("::") > 2) {
            if ($.engineData.has("RequestEngine:views." + $filePath)) {

                file = $.engineData.get("RequestEngine:views." + $filePath);

            } else {
                const $splitFile = file.split("::");
                const $pluginNamespace = $splitFile[0];

                if (PluginNameSpaces.hasOwnProperty($pluginNamespace)) {
                    const pluginNamespaceData = new ObjectCollection(PluginNameSpaces[$pluginNamespace])
                    const pluginViewsPath: any = pluginNamespaceData.get('paths.views', undefined);

                    if (pluginViewsPath && typeof pluginViewsPath === "string") {
                        file = pluginViewsPath + "/" + $splitFile[1];

                        $.engineData.path("RequestEngine:views").set($filePath, file);
                    }
                }
            }
        }

        /**
         * Set file extension.
         */
        const path = file + "." + (useInternalEjs ? "ejs" : $.config.get('template.extension'));

        // Get xpresser view data
        this.viewData($filePath);

        if (typeof fullPath === "function") {
            return Render(path, data, fullPath);
        }

        /**
         * UseEjs if useInternalEjs is == true.
         */
        if (useInternalEjs === true) {
            data = Object.assign(this.res.locals, data);
            return this.res.send(ejs.render(
                fs.readFileSync(Path.resolve(path)).toString(),
                data,
                {filename: path},
            ));
        } else {
            try {
                // @ts-ignore
                return Render(...arguments);
            } catch (e) {
                $.logError(e);
            }

        }
    }

    /**
     * @type RequestEngine.prototype.view
     * @param args
     * @return {*}
     * @alias
     */
    public renderView(...args: any[]): any {
        // @ts-ignore
        return this.view(...args);
    }


    /**
     * Render View From Engine
     * @param {string} file
     * @param {Object} data
     * @returns {*}
     */
    public renderViewFromEngine(file: string, data?: any): any {

        const view = $.path.engine("backend/views/" + file);
        return this.renderView(view, data, true, true);

    }

    /**
     * Implement InXpresserError try method
     * @param fn
     * @param log
     */
    public try<T = unknown>(fn: () => T, log: boolean = true): T {
        return InXpresserError.tryOrCatch(fn, e => log ? this.$instance().logError(e) : void 0);
    }

    /**
     * Implement InXpresserError tryOrCatch method
     * @param fn
     * @param handleError
     */
    public tryOrCatch<T = unknown>(fn: () => T, handleError?: (error: InXpresserError) => any): T {
        return InXpresserError.tryOrCatch(fn, handleError);
    }

    /**
     * Throw error as type of InXpresserError
     * @param e
     * @param log
     */
    public throw(e: Error, log: boolean = true): never {
        e = InXpresserError.use(e);
        if (log) $.logError(e);
        throw e;
    }

    /**
     * Send Message to view
     * @param {Object|string} data
     * @param {*} value
     * @returns {RequestEngine}
     */
    public with(data: any, value = null): this {
        if (this.req.flash) {
            if (typeof data === "string") {
                this.req.flash(data, value);
            } else {
                const dataKeys = Object.keys(data);

                for (let i = 0; i < dataKeys.length; i++) {
                    this.req.flash(dataKeys[i], data[dataKeys[i]]);
                }
            }
        }

        return this;
    }

    /**
     * Return old values to view after redirect
     * @returns {RequestEngine}
     */
    public withOld(): this {

        if (this.req.flash) {
            const data = this.all();
            const dataKeys = Object.keys(data);

            for (let i = 0; i < dataKeys.length; i++) {
                this.req.flash("old:" + dataKeys[i], data[dataKeys[i]]);
            }
        }

        return this;
    }

    /**
     * End Request Signal
     */
    public end() {
        return "EndCurrentRequest";
    }

    /**
     * Shorthand function for adding data to the `boot.*` state
     */
    addToBoot(name: string, value: any) {
        this.state.set(`boot.${name}`, value);
        return this;
    }
}

export = RequestEngine;
