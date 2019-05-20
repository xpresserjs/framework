import bodyParser from "body-parser";
import connect_session_knex from "connect-session-knex";
import cors from "cors";
import express from "express";
import flash from "express-flash";
import session from "express-session";
import FS from "fs-extra";
import {dirname, resolve} from "path";
import {Xjs} from "../global";
import {XjsHttp} from "../types/http";

import {createServer} from "http";

declare let _: any;
declare let $: Xjs;

const paths = $.$config.get("paths");

const app = express();

app.use((req, res, next) => {
    res.set("X-Powered-By", "Xjs");
    if ($.config.response.overrideServerName) {
        res.set("Server", "Xjs");
    }
    next();
});

app.use(
    express.static(paths.public, {
        setHeaders(res, path) {
            const responseConfig = $.config.response;
            if ($.config.response.cacheFiles) {
                if (responseConfig.cacheIfMatch.length) {
                    const match = $.fn.findWordsInString(
                        path,
                        responseConfig.cacheIfMatch,
                    );
                    if (match !== null && match.length) {
                        res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                    }
                } else if (responseConfig.cacheFileExtensions.length) {
                    const files: RegExp = $.fn.extArrayRegex(responseConfig.cacheFileExtensions);
                    const match = path.match(files);

                    if (match !== null && match.length) {
                        res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                    }
                }
            }
        },
    }),
);

const KnexSessionStore = connect_session_knex(session);
const knexSessionConfig = {
    client: "sqlite3",
    connection: {
        filename: $.basePath($.config.paths.storage + "/app/db/sessions.sqlite"),
    },
    useNullAsDefault: true,
};

const sessionFilePath = knexSessionConfig.connection.filename;
if (!FS.existsSync(sessionFilePath)) {
    FS.mkdirpSync(dirname(sessionFilePath));
}

const store = new KnexSessionStore({
    knex: require("knex")(knexSessionConfig),
    tablename: "sessions",
});

// Add Cors
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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

import RequestEngine = require("./RequestEngine");

app.use(async (req: XjsHttp.Request, res: XjsHttp.Response, next?: () => void) => {

    // Convert Empty Strings to Null
    if (req.body && Object.keys(req.body).length) {
        req.body = Object.assign(
            // @ts-ignore
            ...Object.keys(req.body).map((key) => ({
                [key]: typeof req.body[key] === "string" && req.body[key].trim() === "" ? null : req.body[key],
            })),
        );
    }

    const x = new RequestEngine(req, res);

    if (x.isLogged()) {
        res.locals[$.config.auth.templateVariable] = await x.auth();
    } else {
        res.locals[$.config.auth.templateVariable] = undefined;
    }

    next();
});

/**
 * Set Express View Engine from config
 */
const template = $.config.template;

if (typeof template.engine === "function") {

    app.engine(template.extension, template.engine);
    app.set("view engine", template.extension);

} else {
    if (typeof template.use === "string") {

        app.use($.use.package(template.use));

    } else if (typeof template.use === "function") {

        app.use(template.use);

    } else {

        app.set("view engine", template.engine);

    }
}

app.set("views", $.backendPath(template.viewsFolder));

// Not Tinker? Require Controllers
if (!$.$options.isTinker) {
    $.controller = require("./classes/Controller");
}

// Require Model Engine
import ModelEngine = require("./ModelEngine");

$.model = ModelEngine;

// Include xjs/cycles/beforeRoutes.js if exists
const beforeRoutesPath = $.basePath($.config.paths.xjs + "/cycles/beforeRoutes.js");

if (FS.existsSync(beforeRoutesPath)) {
    require(beforeRoutesPath);
}

import RouterEngine = require("./RouterEngine");

$.routerEngine = RouterEngine;

// Require Routes
try {
    $.backendPath("routers/router", true);
} catch (e) {
    $.logErrorAndExit("Routes File Missing.");
}

// Process Routes
$.routerEngine.processRoutes($.router.routes);

app.use((req: XjsHttp.Request, res: XjsHttp.Response, next: () => void) => {
    const x = new RequestEngine(req, res, next);
    const error = new (require("./ErrorEngine"))(x);
    res.status(404);

    // respond with json
    if (req.xhr) {
        return res.send({error: "Not found"});
    } else {
        return error.pageNotFound(req);
    }
});

// Include xjs/cycles/afterRoutes.js if exists
const afterRoutesPath = $.basePath($.config.paths.xjs + "/cycles/afterRoutes.js");

if (FS.existsSync(afterRoutesPath)) {
    require(afterRoutesPath);
}

// Start server if not tinker
if (!$.$options.isTinker && $.config.server.startOnBoot) {
    const http = createServer(app);
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
