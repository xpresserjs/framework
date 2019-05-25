"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ejs = require("ejs");
const fs = require("fs");
const requestHelpers = require("./functions/request.fn");
const ObjectCollection = require("./helpers/ObjectCollection");
const PluginNameSpaces = $.engineData.get("PluginEngine:namespaces", {});
class RequestEngine {
    /**
     *
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    constructor(req, res, next) {
        this.res = res;
        this.req = req;
        if (req.params) {
            this.params = req.params;
        }
        if (next !== undefined) {
            this.next = next;
        }
        this.session = req.session;
        this.bothData = this.all();
        this.locals = new ObjectCollection(res.locals);
        this.fn = _.extend({}, $.helpers, requestHelpers(this));
    }
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            const x = this;
            if (!x.isLogged()) {
                return null;
            }
            const User = $.path.backend("models/User" + $.config.project.fileExtension, true);
            const email = $.base64.decode(x.session.email);
            return yield User.query().where("email", email).first();
        });
    }
    /**
     * Get Auth User Object
     * @returns {*}
     */
    authUser() {
        return this.res.locals[$.config.auth.templateVariable];
    }
    /**
     * Route
     * @returns {*}
     * @param {string} route
     * @param {array} keys
     * @param query
     */
    route(route, keys = [], query = {}) {
        return $.helpers.route(route, keys, query);
    }
    /**
     * get Request Data
     * @param key
     * @param $default
     * @returns {*}
     */
    get(key, $default) {
        if (this.bothData.hasOwnProperty(key)) {
            return this.bothData[key];
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
        return this.redirect(this.route(route, keys));
    }
    viewData(file, data = {}) {
        const localsConfig = $.config.template.locals;
        const all = localsConfig.all;
        this.res.locals.__currentView = file;
        this.res.locals.__flash = this.req.flash();
        this.res.locals.__currentUrl = this.req.url;
        if (all || localsConfig.__stackedScripts) {
            this.res.locals.__stackedScripts = [];
        }
        if (all || localsConfig.__session) {
            this.res.locals.__session = this.session;
        }
        if (all || localsConfig.__get) {
            this.res.locals.__get = this.req.query;
        }
        if (all || localsConfig.__post) {
            this.res.locals.__post = this.req.body;
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
        const Render = typeof this.customRenderer === "function" ? this.customRenderer : this.res.render;
        const $filePath = file;
        // if View has namespace
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
                        $.engineData.addToObject("RequestEngine:views", { key: $filePath, value: file });
                    }
                }
            }
        }
        const path = file + "." + (useEjs ? "ejs" : $.config.template.extension);
        // $.logError(Path.resolve(path));
        data = this.viewData($filePath, data);
        if (typeof fullPath === "function") {
            return Render(path, data, fullPath);
        }
        if (useEjs === true) {
            data = Object.assign(this.res.locals, data);
            return this.res.send(ejs.render(fs.readFileSync(path).toString(), data, { filename: path }));
        }
        else {
            try {
                return Render(file, data);
            }
            catch (e) {
                $.logError(e.message);
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
     * If User is logged
     * @returns {boolean}
     */
    isLogged() {
        /*
        * If authUser has been set before then return true.
        * Prevents Bcrypt from running twice.
        * ThereBy increasing runtime.
        */
        if (this.authUser() !== undefined) {
            return true;
        }
        const x = this;
        if (typeof x.session.email === "undefined" || typeof x.session.loginKey === "undefined") {
            return false;
        }
        const email = $.base64.decode(x.session.email);
        const hash = $.base64.decode(x.session.loginKey);
        // @ts-ignore
        return !!$.bcrypt.compareSync(email, hash);
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
}
module.exports = RequestEngine;
//# sourceMappingURL=RequestEngine.js.map