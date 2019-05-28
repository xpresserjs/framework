"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const { dirname, resolve } = require("path");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const connect_session_knex = require("connect-session-knex");
const cors = require("cors");
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const ObjectCollection = require("./Helpers/ObjectCollection");
const http_1 = require("http");
const paths = $.$config.get("paths");
const $pluginData = $.engineData.get("PluginEngine:namespaces", {});
const $pluginNamespaceKeys = Object.keys($pluginData);
const app = express();
app.use((req, res, next) => {
    res.set("X-Powered-By", "Xjs");
    if ($.config.response.overrideServerName) {
        res.set("Server", "Xjs");
    }
    next();
});
app.use(express.static(paths.public, {
    setHeaders(res, path) {
        const responseConfig = $.config.response;
        if ($.config.response.cacheFiles) {
            if (responseConfig.cacheIfMatch.length) {
                const match = $.fn.findWordsInString(path, responseConfig.cacheIfMatch);
                if (match !== null && match.length) {
                    res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                }
            }
            else if (responseConfig.cacheFileExtensions.length) {
                const files = $.fn.extArrayRegex(responseConfig.cacheFileExtensions);
                const match = path.match(files);
                if (match !== null && match.length) {
                    res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                }
            }
        }
    },
}));
app.use(helmet());
const Path = require("./Helpers/Path");
const KnexSessionStore = connect_session_knex(session);
const knexSessionConfig = {
    client: "sqlite3",
    connection: {
        filename: Path.frameworkStorage("db/sessions.sqlite"),
    },
    useNullAsDefault: true,
};
const sessionFilePath = knexSessionConfig.connection.filename;
if (!FS.existsSync(sessionFilePath)) {
    Path.makeDirIfNotExist(dirname(sessionFilePath, true));
}
const store = new KnexSessionStore({
    knex: require("knex")(knexSessionConfig),
    tablename: "sessions",
});
// Add Cors
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use Session
const sessionConfig = _.extend({}, $.config.session, {
    store,
});
app.use(session(sessionConfig));
// Use Flash
app.use(flash());
// Set local AppData
app.locals.appData = {};
$.app = app;
app.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // Convert Empty Strings to Null
    if (req.body && Object.keys(req.body).length) {
        req.body = Object.assign(
        // @ts-ignore
        ...Object.keys(req.body).map((key) => ({
            [key]: typeof req.body[key] === "string" && req.body[key].trim() === "" ? null : req.body[key],
        })));
    }
    next();
}));
/**
 * Set Express View Engine from config
 */
const template = $.config.template;
if (typeof template.engine === "function") {
    app.engine(template.extension, template.engine);
    app.set("view engine", template.extension);
}
else {
    if (typeof template.use === "string") {
        app.use($.use.package(template.use));
    }
    else if (typeof template.use === "function") {
        app.use(template.use);
    }
    else {
        app.set("view engine", template.engine);
    }
}
app.set("views", $.path.views());
// Not Tinker? Require Controllers
if (!$.$options.isTinker) {
    $.controller = require("./Classes/Controller");
}
// Require Model Engine
const ModelEngine = require("./ModelEngine");
$.model = ModelEngine;
const RequestEngine = require("./Plugins/ExtendedRequestEngine");
for (let i = 0; i < $pluginNamespaceKeys.length; i++) {
    const $pluginNamespaceKey = $pluginNamespaceKeys[i];
    const $plugin = new ObjectCollection($pluginData[$pluginNamespaceKey]);
    if ($plugin.has("globalMiddlewares")) {
        const $globalMiddlewareWrapper = ($middlewareFn) => {
            return (res, req, next) => __awaiter(this, void 0, void 0, function* () {
                const x = new RequestEngine(res, req, next);
                return $middlewareFn(x);
            });
        };
        const $middlewares = $plugin.get("globalMiddlewares");
        for (let j = 0; j < $middlewares.length; j++) {
            const $middleware = $middlewares[j];
            try {
                const $globalMiddleware = $globalMiddlewareWrapper(require($middleware));
                $.app.use($globalMiddleware);
            }
            catch (e) {
                $.logPerLine([{
                        error: e.message,
                        errorAndExit: "",
                    }]);
            }
        }
    }
}
const RouterEngine = require("./RouterEngine");
$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
if (FS.existsSync(RouteFile)) {
    try {
        require(RouteFile);
    }
    catch (e) {
        $.logPerLine([
            { error: "Router Error:" },
            { errorAndExit: e.message },
        ]);
    }
}
else {
    $.logPerLine([
        { error: "Routes File Missing." },
        { error: RouteFile },
    ]);
}
// Import plugin routes
const PluginData = $.engineData.get("PluginEngineData");
const PluginRoutes = PluginData.routes;
for (let i = 0; i < PluginRoutes.length; i++) {
    const pluginRoute = PluginRoutes[i];
    require(pluginRoute.path);
}
// Process Routes
$.routerEngine.processRoutes($.router.routes);
app.use((req, res, next) => {
    const x = new RequestEngine(req, res, next);
    const error = new (require("./ErrorEngine"))(x);
    res.status(404);
    // respond with json
    if (req.xhr) {
        return res.send({ error: "Not found" });
    }
    else {
        return error.pageNotFound(req);
    }
});
// Include xjs/cycles/afterRoutes.js if exists
const afterRoutesPath = $.path.base($.config.paths.xjs + "/cycles/afterRoutes.js");
if (FS.existsSync(afterRoutesPath)) {
    require(afterRoutesPath);
}
// Start server if not tinker
if (!$.$options.isTinker && $.config.server.startOnBoot) {
    const http = http_1.createServer(app);
    const port = $.$config.get("server.port", 80);
    http.on("error", $.logError);
    http.listen(port, () => {
        $.log("Server started and available on " + $.helpers.url());
        $.log("PORT:" + port);
        $.log();
    });
    // Start ssl server if server.ssl is available
    if ($.$config.has("server.ssl.enabled") && $.config.server.ssl.enabled === true) {
        const https = require("https");
        const httpsPort = $.$config.get("server.ssl.port", 443);
        if (!$.$config.has("server.ssl.files")) {
            $.logErrorAndExit("Ssl enabled but has no {server.ssl.files} config found.");
        }
        const files = $.$config.get("server.ssl.files");
        if (typeof files.key !== "string" || typeof files.cert !== "string") {
            $.logErrorAndExit("Config {server.ssl.files} not configured properly!");
        }
        if (!files.key.length || !files.cert.length) {
            $.logErrorAndExit("Config {server.ssl.files} not configured properly!");
        }
        files.key = resolve(files.key);
        files.cert = resolve(files.cert);
        if (!FS.existsSync(files.key)) {
            $.logErrorAndExit("Key file {" + files.key + "} not found!");
        }
        if (!FS.existsSync(files.cert)) {
            $.logErrorAndExit("Cert file {" + files.key + "} not found!");
        }
        files.key = FS.readFileSync(files.key);
        files.cert = FS.readFileSync(files.cert);
        https.createServer(files, app).listen(httpsPort, () => {
            $.log("Server started and available on " + $.helpers.url());
            $.log("PORT:" + httpsPort);
            $.log();
        });
    }
}
//# sourceMappingURL=StartHttp.js.map