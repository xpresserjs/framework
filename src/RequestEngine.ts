import fs = require("fs");

const ejs = require("ejs");
import ObjectCollection = require("object-collection");
import requestHelpers = require("./Functions/request.fn");
import ErrorEngine = require("./ErrorEngine");

import lodash from "lodash";

import {Http} from "../types/http";

import {getInstance} from "../index";
import {DollarSign} from "../types";

const $ = getInstance();

const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
const useFlash = $.config.get("server.use.flash", false);

/**
 * Get Request Engine Config
 */
const requestEngineConfig: {
    dataKey: string,
    proceedKey: string,
    messageKey: string
} = $.config.get('server.requestEngine', {
    dataKey: "data",
    proceedKey: 'proceed',
    messageKey: '_say'
});

class RequestEngine {
    public req: Http.Request;
    public res: Http.Response;

    public $query: ObjectCollection;
    public $body: ObjectCollection;

    public params: Record<string, any>;
    public store: ObjectCollection;

    public session: Record<string, any>;
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
        this.session = req.session || {};

        if (!res.locals) res.locals = {};
        this.store = $.objectCollection(res.locals);

        // Set $body and $query
        this.$body = $.objectCollection(req.body || {});
        this.$query = $.objectCollection(req.query || {});
    }

    /**
     * If User has customRenderer then use it.
     */
    public customRenderer!: (...args: any[]) => string

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
     * Returns an getInstance of ErrorEngine
     */
    newError(): ErrorEngine {
        return new ErrorEngine(this)
    }

    /**
     * Request Next Function
     */
    public next(): void {
        // Next block is empty
    }

    /**
     * Response Send
     * @param body
     */
    public send(body: any): Http.Response {
        return this.res.send(body);
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
    public query(key?: string | undefined, $default?: any): ObjectCollection | any {
        if (key === undefined) {
            $.logDeprecated(
                '0.3.22', '1.0.0',
                'http.query() without arguments to get query collection is deprecated, use `http.$query` instead.'
            );
            return this.$query;
        } else {
            return this.$query.get(key, $default);
        }
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
    public body(key?: string | undefined, $default?: any): ObjectCollection | any {
        if (key === undefined) {
            $.logDeprecated(
                '0.3.22', '1.0.0',
                'http.body() without keys to get body collection is deprecated, use `http.$body` instead.'
            );

            return this.$body;
        } else {
            return this.$body.get(key, $default);
        }
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
            throw new Error(`hasParams: Expects argument params to be an array of params.`)
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

        return this.res.json(d);
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
    private viewData(file: string) {
        const localsConfig = $.config.get('template.locals');
        const all = localsConfig.all;

        let ctx: any;

        ctx = lodash.extend({}, $.helpers, requestHelpers(this));

        ctx.$route = this.route;
        ctx.$currentView = file;

        if (useFlash) {
            ctx.$flash = this.req.flash();
        }

        ctx.$currentUrl = this.req.url;

        if (all) {
            ctx.$query = this.req.query;
            ctx.$body = this.req.body;
            ctx.$stackedScripts = [];
            ctx.$session = this.session || {};
        } else {
            if (localsConfig.stackedScripts) ctx.$stackedScripts = [];
            if (localsConfig.session) ctx.$session = this.session || {};
            if (localsConfig.query) ctx.$query = this.req.query;
            if (localsConfig.body) ctx.$body = this.req.body;
        }
        this.res.locals["ctx"] = ctx;
    }

    /**
     * Render View
     * @param {string} file
     * @param {Object} data
     * @param {boolean} fullPath
     * @param useEjs
     * @returns {*}
     */
    public view(file: string, data = {}, fullPath: boolean = false, useEjs: boolean = false): any {

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
                const $pluginNamespace = lodash.upperFirst($splitFile[0]);

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
        const path = file + "." + (useEjs ? "ejs" : $.config.get('template.extension'));

        // Get xpresser view data
        this.viewData($filePath);

        if (typeof fullPath === "function") {
            return Render(path, data, fullPath);
        }

        /**
         * UseEjs if useEjs is == true.
         */
        if (useEjs === true) {
            data = Object.assign(this.res.locals, data);
            return this.res.send(ejs.render(
                fs.readFileSync(path).toString(),
                data,
                {filename: path},
            ));
        } else {
            try {
                // @ts-ignore
                return Render(...arguments);
            } catch (e) {
                $.logError(e.stack);
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
     * @type RequestEngine.prototype.view
     * @param args
     * @return {*}
     * @alias
     */
    public render(...args: any[]): any {
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
     * Send Message to view
     * @param {Object|string} data
     * @param {*} value
     * @returns {RequestEngine}
     */
    public with(data: any, value = null): this {
        if (typeof data === "string") {
            this.req.flash(data, value);
        } else {
            const dataKeys = Object.keys(data);

            for (let i = 0; i < dataKeys.length; i++) {
                this.req.flash(dataKeys[i], data[dataKeys[i]]);
            }
        }

        return this;
    }

    /**
     * Return old values to view after redirect
     * @returns {RequestEngine}
     */
    public withOld(): this {
        const data = this.all();
        const dataKeys = Object.keys(data);

        for (let i = 0; i < dataKeys.length; i++) {
            this.req.flash("old:" + dataKeys[i], data[dataKeys[i]]);
        }

        return this;
    }

    /**
     * End Request Signal
     */
    public end() {
        return "EndCurrentRequest";
    }
}

export = RequestEngine;
