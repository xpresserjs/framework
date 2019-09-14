import FS = require("fs");

const {resolve} = require("path");
import {XpresserHttp} from "../http";
import Path = require("./Helpers/Path");
import loadOnEvents = require("./Events/OnEventsLoader");

import express = require("express");

import {createServer as createHttpServer} from "http";
import {createServer as createHttpsServer} from "https";
import {Xpresser} from "../global";

declare let _: any;
declare let $: Xpresser;

const paths = $.$config.get("paths");

/////////////
// Load Use.json Data
const $useDotJson = $.engineData.get("UseDotJson");

$.app = express();

/**
 * If {server.poweredBy=true}
 * Set X-Powered-By to Xpresser.
 * Else
 * Disable poweredBy header.
 */
if ($.config.server.poweredBy) {
    $.app.use((req, res, next) => {
        res.set("X-Powered-By", "Xpresser");
        if ($.config.response.overrideServerName) {
            res.set("Server", "Xpresser");
        }
        next();
    });
} else {
    $.app.disable("x-powered-by");
}

$.app.use(
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

/**
 * Helmet helps you secure your Express apps by setting various HTTP headers. It’s not a silver bullet,
 * but it can help!
 *
 * Read more https://helmetjs.github.io/
 *
 *  By default helmet is enabled only in production,
 *  if you don't define a config @ {server.use.helmet}
 */
const isProduction = $.$config.get("env") === "production";
const useHelmet = $.$config.get("server.use.helmet", isProduction);
if (useHelmet) {
    const helmet = require("helmet");
    const helmetConfig = $.$config.get("packages.helmet.config", undefined);
    $.app.use(helmet(helmetConfig));
}

/**
 * Cross-origin resource sharing (CORS) is a mechanism
 * that allows restricted resources on a web page to be requested
 * from another domain outside the domain from which the first resource was served.
 *
 * Read more https://expressjs.com/en/resources/middleware/cors.html
 *
 * By default Cors is disabled,
 * if you don't define a config @ {server.use.cors}
 */
const useCors = $.$config.get("server.use.cors", false);
if (useCors) {
    const cors = require("cors");
    const corsConfig = $.$config.get("packages.cors.config", undefined);
    $.app.use(cors(corsConfig));
}

/**
 * BodyParser
 * Parse incoming request bodies in a middleware before your handlers,
 * available under the req.body property.
 *
 * Read More https://expressjs.com/en/resources/middleware/body-parser.html
 *
 * BodyParser is enabled by default
 */
const useBodyParser = $.$config.get("server.use.bodyParser", true);
if (useBodyParser) {
    const bodyParser = require("body-parser");
    $.app.use(bodyParser.json());
    $.app.use(bodyParser.urlencoded({extended: true}));
}

/**
 * Session handled by knex
 * Disabled on default
 */
const useSession = $.$config.get("session.startOnBoot", false);
if (useSession) {

    const connectSessionKnex = require("connect-session-knex");
    const flash = require("express-flash");
    const session = require("express-session");

    const KnexSessionStore = connectSessionKnex(session);
    const knexSessionConfig = {
        client: "sqlite3",
        connection: {
            filename: $.path.base("sessions.sqlite"),
        },
        useNullAsDefault: true,
    };

    const sessionFilePath = knexSessionConfig.connection.filename;
    if (!FS.existsSync(sessionFilePath)) {
        Path.makeDirIfNotExist(sessionFilePath, true);
    }

    const store = new KnexSessionStore({
        knex: require("knex")(knexSessionConfig),
        tablename: "sessions",
    });

    const sessionConfig = _.extend({}, $.config.session, {
        store,
    });

    $.app.use(session(sessionConfig));

    // Use Flash
    $.app.use(flash());
}

// Set local AppData
$.app.locals.appData = {};
$.app.use(async (req: XpresserHttp.Request, res: XpresserHttp.Response, next?: () => void) => {

    // Convert Empty Strings to Null
    if (req.body && Object.keys(req.body).length) {
        req.body = Object.assign(
            // @ts-ignore
            ...Object.keys(req.body).map((key) => ({
                [key]: typeof req.body[key] === "string" && req.body[key].trim() === "" ? null : req.body[key],
            })),
        );
    }

    next();
});

/**
 * Set Express View Engine from config
 */
const template = $.config.template;

if (typeof template.engine === "function") {

    $.app.engine(template.extension, template.engine);
    $.app.set("view engine", template.extension);

} else {
    if (typeof template.use === "string") {

        $.app.use($.use.package(template.use));

    } else if (typeof template.use === "function") {

        $.app.use(template.use);

    } else {

        $.app.set("view engine", template.engine);

    }
}

$.app.set("views", $.path.views());

/**
 *  AfterExpressInit Function
 *  This function happens immediately after on.expressInit events are completed.
 */
import RequestEngine = require("./Plugins/ExtendedRequestEngine");

const afterExpressInit = (next: () => void) => {
    // Not Tinker? Require Controllers
    if (!$.options.isTinker) {
        $.controller = require("./Classes/Controller");
    }

    const $globalMiddlewareWrapper = ($middlewareFn: any) => {
        return async (res, req, next) => {
            const x = new RequestEngine(res, req, next);
            return $middlewareFn(x);
        };
    };

    if ($useDotJson.has("globalMiddlewares")) {
        const $middlewares = $useDotJson.get("globalMiddlewares");

        for (let i = 0; i < $middlewares.length; i++) {
            let $middleware = $middlewares[i];

            if ($middleware.substr(-3) !== $.config.project.fileExtension) {
                $middleware += $.config.project.fileExtension;
            }

            $middleware = Path.resolve($middleware);

            try {

                const $globalMiddleware = $globalMiddlewareWrapper(require($middleware));
                $.app.use($globalMiddleware);

            } catch (e) {

                $.logPerLine([
                    {error: "Error in use.json"},
                    {error: e.message},
                    {errorAndExit: ""},
                ]);

            }
        }

    }

    require("./Routes/Loader");

    next();
};

/**
 * StartHttpServer
 * Http server starts here.
 */
const startHttpServer = (onSuccess = undefined, onError = undefined) => {

    $.routerEngine.processRoutes($.router.routes);

    /**
     * Add 404 error
     */
    $.app.use((req: XpresserHttp.Request, res: XpresserHttp.Response, next: () => void) => {
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

    $.http = createHttpServer($.app);
    const port = $.$config.get("server.port", 80);

    $.http.on("error", (err) => {
        if (err["errno"] === "EADDRINUSE") {
            return $.logErrorAndExit(`Port ${err["port"]} is already in use.`);
        }

        if (typeof onError === "function") {
            // @ts-ignore
            onError(err);
        }
    });

    /**
     * Load $.on.http Events
     * Listen to port after running events
     */
    loadOnEvents("http", () => {
        $.http.listen(port, () => {
            $.log("Server started and available on " + $.helpers.url());
            $.log("PORT:" + port);
            $.log();

            if (typeof onSuccess === "function") {
                onSuccess();
            }
        });

        if ($.$config.has("server.ssl.enabled") && $.config.server.ssl.enabled === true) {
            startHttpsServer();
        }
    });
};

/**
 * StartHttpsServer
 * Https Server starts here.
 */
const startHttpsServer = () => {
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

    $.https = createHttpsServer(files, $.app);
    $.https.on("error", $.logError);

    /**
     * Load $.on.https Events
     * Listen to port after running events
     */
    loadOnEvents("https", () => {
        $.https.listen(httpsPort, () => {
            $.log("Server started and available on " + $.helpers.url());
            $.log("PORT:" + httpsPort);
            $.log();
        });
    });
};

/**
 * Load on.expressInit Events.
 */
loadOnEvents("expressInit", () => afterExpressInit(() => {
    /**
     * Load on.startHttp Events.
     */
    return loadOnEvents("bootServer", () => startHttpServer());
}));
