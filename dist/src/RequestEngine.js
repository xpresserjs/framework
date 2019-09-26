"use strict";
const ejs = require("ejs");
const fs = require("fs");
const requestHelpers = require("./Functions/request.fn");
const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
const sessionStartOnBoot = $.$config.get("session.startOnBoot", false);
class RequestEngine {
    /**
     *
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @param route
     */
    constructor(req, res, next, route) {
        this.route = {
            name: "",
            method: "",
            controller: "",
        };
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
    next() {
        return null;
    }
    /**
     * get Request Data
     * @param key
     * @param $default
     * @returns {*}
     * @deprecated
     */
    get(key, $default) {
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
    query(key, $default) {
        if (key === undefined) {
            return $.objectCollection(this.req.query);
        }
        else if (this.req.query.hasOwnProperty(key)) {
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
    body(key, $default) {
        if (key === undefined) {
            return $.objectCollection(this.req.body);
        }
        else if (this.req.body.hasOwnProperty(key)) {
            return this.req.body[key];
        }
        return $default;
    }
    /**
     * Get all or pluck keys
     * @param pluck
     * @returns {*}
     */
    all(pluck = []) {
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
    pluck(items = []) {
        return this.all(items);
    }
    /**
     * To API format
     * @param {*} data
     * @param {boolean} proceed
     * @param {number} status
     */
    toApi(data = {}, proceed = true, status = 200) {
        const d = { proceed };
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
    toApiFalse(data = {}, status = 200) {
        return this.toApi(data, false, status);
    }
    /**
     * Say something to your front end!
     * @param {string} message
     * @param {boolean} proceed
     * @param {number} status
     */
    sayToApi(message, proceed = true, status = 200) {
        return this.toApi({
            __say: message,
        }, proceed, status);
    }
    /**
     * Redirect to url.
     * @param {string} path
     * @returns {*}
     */
    redirect(path = "/") {
        this.res.redirect(path);
        return this.res.end();
    }
    /**
     * Redirect Back
     */
    redirectBack() {
        const backURL = this.req.header("Referer") || "/";
        return this.redirect(backURL);
    }
    /**
     * Redirect to route
     * @param {string} route
     * @param {Array|string} keys
     * @returns {*}
     */
    redirectToRoute(route, keys = []) {
        return this.redirect($.helpers.route(route, keys));
    }
    viewData(file, data = {}) {
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
        }
        else {
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
    view(file, data = {}, fullPath = false, useEjs = false) {
        /**
         * Express Default Renderer
         * @param args
         */
        const defaultRender = (...args) => {
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
            }
            else {
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
        data = this.viewData($filePath, data);
        if (typeof fullPath === "function") {
            return Render(path, data, fullPath);
        }
        /**
         * UseEjs if useEjs is == true.
         */
        if (useEjs === true) {
            data = Object.assign(this.res.locals, data);
            return this.res.send(ejs.render(fs.readFileSync(path).toString(), data, { filename: path }));
        }
        else {
            arguments[1] = data;
            try {
                return Render(...arguments);
            }
            catch (e) {
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
    renderView(...args) {
        // @ts-ignore
        return this.view(...args);
    }
    /**
     * @type RequestEngine.prototype.view
     * @param args
     * @return {*}
     * @alias
     */
    render(...args) {
        // @ts-ignore
        return this.view(...args);
    }
    /**
     * Render View From Engine
     * @param {string} file
     * @param {Object} data
     * @returns {*}
     */
    renderViewFromEngine(file, data) {
        const view = $.path.engine("backend/views/" + file);
        return this.renderView(view, data, true, true);
    }
    /**
     * Send Message to view
     * @param {Object|string} data
     * @param {*} value
     * @returns {RequestEngine}
     */
    with(data, value = null) {
        if (typeof data === "string") {
            this.req.flash(data, value);
        }
        else {
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
    withOld() {
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
    end() {
        return "EndCurrentRequest";
    }
}
module.exports = RequestEngine;
