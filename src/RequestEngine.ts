import fs = require("fs");

const ejs = require("ejs");
import ObjectCollection = require("object-collection");
import requestHelpers = require("./Functions/request.fn");
import ErrorEngine = require("./ErrorEngine");

import {DollarSign} from "../types";
import {Http} from "../types/http";
import {Helpers} from "../types/helpers";

declare const _: any;
declare const $: DollarSign;

const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
const sessionStartOnBoot = $.$config.get("session.startOnBoot", false);

class RequestEngine {
    public req: Http.Request;
    public res: Http.Response;

    public params: any;
    public locals: ObjectCollection;

    public bothData: any;
    public session: any;
    public fn: Helpers.Util;
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

        if (typeof next === "function") {
            this.next = next;
        }

        if (route) {
            this.route = {
                name: route.name || "",
                method: route.method || "",
                controller: typeof route.controller === "string"
                    ? route.controller : "",
            };
        }

        if (req.params) {
            this.params = req.params;
        }

        this.session = req.session;
        this.bothData = this.all();
        this.locals = $.objectCollection(res.locals);

        this.fn = _.extend({}, $.helpers, requestHelpers(this));
    }

    /**
     * If User has customRenderer then use it.
     */
        // @ts-ignore
    public customRenderer: (...args: any[]) => string


    /**
     * Returns an instance of ErrorEngine
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
    public send(body: any) {
        return this.res.send(body);
    }

    /**
     * get Request Data
     * @param key
     * @param $default
     * @returns {*}
     * @deprecated
     */
    public get(key: string, $default?: any) {
        if (this.bothData.hasOwnProperty(key)) {
            return this.bothData[key];
        }
        return $default;
    }

    /**
     * Request Query Data
     * @param [key]
     * @param [$default]
     * @returns {*|ObjectCollection}
     */
    public query(key?: string | undefined, $default?: any): any | ObjectCollection {
        if (key === undefined) {
            return $.objectCollection(this.req.query);
        } else if (this.req.query.hasOwnProperty(key)) {
            return this.req.query[key];
        }
        return $default;
    }

    /**
     * Request Body Data
     * @param [key]
     * @param [$default]
     * @returns {*|ObjectCollection}
     */
    public body(key?: string | undefined, $default?: any): any | ObjectCollection {
        if (key === undefined) {
            return $.objectCollection(this.req.body);
        } else if (this.req.body.hasOwnProperty(key)) {
            return this.req.body[key];
        }
        return $default;
    }

    /**
     * Get all or pluck keys
     * @param pluck
     * @returns {*}
     */
    public all(pluck: any[] = []) {
        const all = _.extend({}, this.req.query, this.req.body);
        if (pluck.length) {
            return _.pick(all, pluck);
        }
        return all;
    }

    /**
     * Pluck data from Request data
     * @param items
     * @returns {*}
     * @deprecated
     */
    public pluck(items: any[] = []) {
        return this.all(items);
    }

    /**
     * To API format
     * @param {*} data
     * @param {boolean} proceed
     * @param {number} status
     */
    public toApi(data: any = {}, proceed = true, status = 200) {
        const d = {proceed} as any;

        if (data.hasOwnProperty("__say")) {
            d.__say = data.__say;
            delete data.__say;
        }

        d.data = data;

        return this.res.status(status).json(d);
    }

    /**
     * Return false to Api
     * @param {object} data
     * @param {number} status
     */
    public toApiFalse(data: object = {}, status: number = 200) {
        return this.toApi(data, false, status);
    }

    /**
     * Say something true to your front end!
     * @param {string} message
     * @param {boolean} proceed
     * @param {number} status
     */
    public sayToApi(message: string, proceed = true, status = 200) {
        return this.toApi({
            __say: message,
        }, proceed, status);
    }

    /**
     * Say some error to your front end!
     * @param {string} message
     * @param {boolean} proceed
     * @param {number} status
     */
    public sayToApiFalse(message: string, proceed = false, status = 200) {
        return this.toApi({
            __say: message,
        }, proceed, status);
    }

    /**
     * Redirect to url.
     * @param {string} path
     * @returns {*}
     */
    public redirect(path = "/") {
        this.res.redirect(path);
        return this.res.end();
    }

    /**
     * Redirect Back
     */
    public redirectBack() {
        const backURL = this.req.header("Referer") || "/";
        return this.redirect(backURL);
    }

    /**
     * Redirect to route
     * @param {string} route
     * @param {Array|string} keys
     * @returns {*}
     */
    public redirectToRoute(route: string, keys = []) {
        return this.redirect($.helpers.route(route, keys));
    }

    public viewData(file: string) {
        const localsConfig = $.config.template.locals;
        const all = localsConfig.all;

        let ctx: any;

        ctx = _.extend({}, this.fn);

        ctx.$route = this.route;
        ctx.$currentView = file;

        if (sessionStartOnBoot) {
            ctx.$flash = this.req.flash();
        }

        ctx.$currentUrl = this.req.url;

        if (all) {

            ctx.$get = this.req.query;
            ctx.$body = this.req.body;
            ctx.$stackedScripts = [];
            ctx.$session = this.session || {};

        } else {

            if (localsConfig.stackedScripts) {
                ctx.$stackedScripts = [];
            }
            if (localsConfig.session) {
                ctx.$session = this.session || {};
            }
            if (localsConfig.get) {
                ctx.$get = this.req.query;
            }
            if (localsConfig.body) {
                ctx.$body = this.req.body;
            }
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
    public view(file: string, data = {}, fullPath: boolean = false, useEjs = false) {

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
                const $pluginNamespace = _.upperFirst($splitFile[0]);

                if (PluginNameSpaces.hasOwnProperty($pluginNamespace)) {
                    if (typeof PluginNameSpaces[$pluginNamespace].views === "string") {

                        file = PluginNameSpaces[$pluginNamespace].views + "/" + $splitFile[1];

                        $.engineData.path("RequestEngine:views").set($filePath, file);
                    }
                }
            }
        }

        /**
         * Set file extension.
         */
        const path = file + "." + (useEjs ? "ejs" : $.config.template.extension);

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
    public renderView(...args: any[]) {
        // @ts-ignore
        return this.view(...args);
    }

    /**
     * @type RequestEngine.prototype.view
     * @param args
     * @return {*}
     * @alias
     */
    public render(...args: any[]) {
        // @ts-ignore
        return this.view(...args);
    }

    /**
     * Render View From Engine
     * @param {string} file
     * @param {Object} data
     * @returns {*}
     */
    public renderViewFromEngine(file: string, data: any) {

        const view = $.path.engine("backend/views/" + file);
        return this.renderView(view, data, true, true);

    }

    /**
     * Send Message to view
     * @param {Object|string} data
     * @param {*} value
     * @returns {RequestEngine}
     */
    public with(data: any, value = null) {
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
    public withOld() {
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
