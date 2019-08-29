import ejs = require("ejs");
import fs = require("fs");
import express = require("express");

import {XpresserHttp} from "../http";
import requestHelpers = require("./Functions/request.fn");
import ObjectCollection = require("object-collection");
import {Xpresser} from "../global";

declare let _: any;
declare let $: Xpresser;

const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
const sessionStartOnBoot = $.$config.get("session.startOnBoot", false);

class RequestEngine {
    public req: XpresserHttp.Request;
    public res: express.Response;

    public params: any;
    public locals: ObjectCollection;

    public bothData: any;
    public session: any;
    public fn: XpresserHelpers.FN;
    public customRenderer: () => string;
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
    constructor(req: XpresserHttp.Request, res: express.Response, next?: () => void, route?: any) {
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
     * Request Next Function
     */
    public next() {
        return null;
    }

    /**
     * get Request Data
     * @param key
     * @param $default
     * @returns {*}
     * @deprecated
     */
    public get(key, $default) {
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
    public all(pluck = []) {
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

        this.res.status(status).send(d);
        return this.res.end();
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
     * Say something to your front end!
     * @param {string} message
     * @param {boolean} proceed
     * @param {number} status
     */
    public sayToApi(message, proceed = true, status = 200) {
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
    public redirectToRoute(route, keys = []) {
        return this.redirect($.helpers.route(route, keys));
    }

    public viewData(file, data = {}) {
        const localsConfig = $.config.template.locals;
        const all = localsConfig.all;

        this.res.locals.__route = this.route;
        this.res.locals.__currentView = file;

        if (sessionStartOnBoot) {
            this.res.locals.__flash = this.req.flash();
        }

        this.res.locals.__currentUrl = this.req.url;

        if (all) {

            this.res.locals.__get = this.req.query;
            this.res.locals.__post = this.req.body;
            this.res.locals.__stackedScripts = [];
            this.res.locals.__session = this.session || {};

        } else {

            if (localsConfig.__stackedScripts) {
                this.res.locals.__stackedScripts = [];
            }
            if (localsConfig.__session) {
                this.res.locals.__session = this.session || {};
            }
            if (localsConfig.__get) {
                this.res.locals.__get = this.req.query;
            }
            if (localsConfig.__post) {
                this.res.locals.__post = this.req.body;
            }
        }

        return _.extend({}, this.fn, data);
    }

    /**
     * Render View
     * @param {string} file
     * @param {Object} data
     * @param {boolean} fullPath
     * @param useEjs
     * @returns {*}
     */
    public view(file, data = {}, fullPath: boolean = false, useEjs = false) {
        const defaultRender = (...args) => {
            // @ts-ignore
            return this.res.render(...args);
        };

        const Render = typeof this.customRenderer === "function" ? this.customRenderer : defaultRender;
        const $filePath = file;

        // if View has namespace
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

        const path = file + "." + (useEjs ? "ejs" : $.config.template.extension);

        data = this.viewData($filePath, data);

        if (typeof fullPath === "function") {
            return Render(path, data, fullPath);
        }

        if (useEjs === true) {
            data = Object.assign(this.res.locals, data);
            return this.res.send(ejs.render(
                fs.readFileSync(path).toString(),
                data,
                {filename: path},
            ));
        } else {

            try {
                return Render(file, data);
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
    public renderView(...args) {
        // @ts-ignore
        return this.view(...args);
    }

    /**
     * @type RequestEngine.prototype.view
     * @param args
     * @return {*}
     * @alias
     */
    public render(...args) {
        // @ts-ignore
        return this.view(...args);
    }

    /**
     * Render View From Engine
     * @param {string} file
     * @param {Object} data
     * @returns {*}
     */
    public renderViewFromEngine(file, data) {

        const view = $.path.engine("backend/views/" + file);
        return this.renderView(view, data, true, true);

    }

    /**
     * Send Message to view
     * @param {Object|string} data
     * @param {*} value
     * @returns {RequestEngine}
     */
    public with(data, value = null) {
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
