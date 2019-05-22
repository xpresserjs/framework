"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const connect_session_knex_1 = __importDefault(require("connect-session-knex"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_flash_1 = __importDefault(require("express-flash"));
const express_session_1 = __importDefault(require("express-session"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
const http_1 = require("http");
const paths = $.$config.get("paths");
const app = express_1.default();
app.use((req, res, next) => {
    res.set("X-Powered-By", "Xjs");
    if ($.config.response.overrideServerName) {
        res.set("Server", "Xjs");
    }
    next();
});
app.use(express_1.default.static(paths.public, {
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
const KnexSessionStore = connect_session_knex_1.default(express_session_1.default);
const knexSessionConfig = {
    client: "sqlite3",
    connection: {
        filename: $.path.base($.config.paths.storage + "/app/db/sessions.sqlite"),
    },
    useNullAsDefault: true,
};
const sessionFilePath = knexSessionConfig.connection.filename;
if (!fs_extra_1.default.existsSync(sessionFilePath)) {
    fs_extra_1.default.mkdirpSync(path_1.dirname(sessionFilePath));
}
const store = new KnexSessionStore({
    knex: require("knex")(knexSessionConfig),
    tablename: "sessions",
});
// Add Cors
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Use Session
const sessionConfig = _.extend({}, $.config.session, {
    store,
});
app.use(express_session_1.default(sessionConfig));
// Use Flash
app.use(express_flash_1.default());
// Set local AppData
app.locals.appData = {};
$.app = app;
const RequestEngine = require("./RequestEngine");
app.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    // Convert Empty Strings to Null
    if (req.body && Object.keys(req.body).length) {
        req.body = Object.assign(
        // @ts-ignore
        ...Object.keys(req.body).map((key) => ({
            [key]: typeof req.body[key] === "string" && req.body[key].trim() === "" ? null : req.body[key],
        })));
    }
    const x = new RequestEngine(req, res);
    if (x.isLogged()) {
        res.locals[$.config.auth.templateVariable] = yield x.auth();
    }
    else {
        res.locals[$.config.auth.templateVariable] = undefined;
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
const viewsPath = $.path.views();
if (!(fs_extra_1.default.existsSync(viewsPath) && fs_extra_1.default.lstatSync(viewsPath).isDirectory())) {
    $.logError("View path does not exists");
    $.logErrorAndExit(viewsPath);
}
app.set("views", viewsPath);
// Not Tinker? Require Controllers
if (!$.$options.isTinker) {
    $.controller = require("./classes/Controller");
}
// Require Model Engine
const ModelEngine = require("./ModelEngine");
$.model = ModelEngine;
// Include xjs/cycles/beforeRoutes.js if exists
const beforeRoutesPath = $.path.base($.config.paths.xjs + "/cycles/beforeRoutes.js");
if (fs_extra_1.default.existsSync(beforeRoutesPath)) {
    require(beforeRoutesPath);
}
const Path = require("./helpers/Path");
const RouterEngine = require("./RouterEngine");
$.routerEngine = RouterEngine;
const RouteFile = Path.resolve($.config.paths.routesFile);
// Require Routes
try {
    require(RouteFile);
}
catch (e) {
    $.logErrorAndExit("Routes File Missing.");
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
if (fs_extra_1.default.existsSync(afterRoutesPath)) {
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
        files.key = path_1.resolve(files.key);
        files.cert = path_1.resolve(files.cert);
        if (!fs_extra_1.default.existsSync(files.key)) {
            $.logErrorAndExit("Key file {" + files.key + "} not found!");
        }
        if (!fs_extra_1.default.existsSync(files.cert)) {
            $.logErrorAndExit("Cert file {" + files.key + "} not found!");
        }
        files.key = fs_extra_1.default.readFileSync(files.key);
        files.cert = fs_extra_1.default.readFileSync(files.cert);
        https.createServer(files, app).listen(httpsPort, () => {
            $.log("Server started and available on " + $.helpers.url());
            $.log("PORT:" + httpsPort);
            $.log();
        });
    }
}
//# sourceMappingURL=StartHttp.js.map