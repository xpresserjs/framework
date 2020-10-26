import {resolve} from "path";
import os from "os";

import PathHelper = require("./Helpers/Path");
import loadOnEvents = require("./Events/OnEventsLoader");

import express = require("express");

import {createServer as createHttpServer} from "http";
import {createServer as createHttpsServer} from "https";

// Types
import {Http, Controller as XpresserController} from "../types/http";
import {DollarSign} from "../types";

declare const _: any;
declare const $: DollarSign;

const isProduction = $.$config.get("env") === "production";
const paths = $.$config.get("paths");


/////////////
// Load Use.json Data
const $useDotJson = $.engineData.get("UseDotJson");
// Check if under maintenance
const isUnderMaintenance = $.file.exists($.path.base('.maintenance'))


$.app = express();

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

/**
 * Serve Public folder as static
 */
const servePublicFolder = $.$config.get("server.servePublicFolder", false);
if (!isUnderMaintenance && servePublicFolder) {
    $.app.use(
        express.static(paths.public, {
            setHeaders(res, path) {
                const responseConfig = $.config.response;
                if (responseConfig.cacheFiles) {
                    if (responseConfig.cacheIfMatch.length) {
                        const match = $.utils.findWordsInString(
                            path,
                            responseConfig.cacheIfMatch,
                        );
                        if (match !== null && match.length) {
                            res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                        }
                    } else if (responseConfig.cacheFileExtensions.length) {
                        const files = $.utils.extArrayRegex(responseConfig.cacheFileExtensions) as RegExp;
                        const match = path.match(files);

                        if (match !== null && match.length) {
                            res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                        }
                    }
                }
            },
        }),
    );
}


/**
 * Helmet helps you secure your Express apps by setting various HTTP headers. It’s not a silver bullet,
 * but it can help!
 *
 * Read more https://helmetjs.github.io/
 *
 *  By default helmet is enabled only in production,
 *  if you don't define a config @ {server.use.helmet}
 */
const useHelmet = $.$config.get("server.use.helmet", isProduction);
if (useHelmet) {
    const helmet = require("helmet");
    const helmetConfig = $.$config.get("packages.helmet.config", undefined);
    $.app.use(helmet(helmetConfig));
    $.logSuccess('Using {Helmet}')
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
    const bodyParserJsonConfig = $.$config.get("packages.body-parser.json");
    const bodyParserUrlEncodedConfig = $.$config.get("packages.body-parser.urlencoded", {extended: true});

    $.app.use(bodyParser.json(bodyParserJsonConfig));
    $.app.use(bodyParser.urlencoded(bodyParserUrlEncodedConfig));
}

const useSession = $.$config.get("server.use.session", false);

if (useSession) {
    const session = require("express-session");
    const useDefault = $.$config.get("session.useDefault", false);

    if ($.$config.has("session.startOnBoot")) {
        $.logError('Config Warning: {session.startOnBoot} is deprecated, use {session.useDefault} instead.')
    }

    /**
     * Session handled by Knex
     * Disabled on default
     */
    if (useDefault) {
        const connectSessionKnex = require("connect-session-knex");

        const KnexSessionStore = connectSessionKnex(session);
        const knexSessionConfig = {
            client: "sqlite3",
            connection: {
                filename: $.path.base("sessions.sqlite"),
            },
            useNullAsDefault: true,
        };

        const sessionFilePath = knexSessionConfig.connection.filename;
        if (!$.file.exists(sessionFilePath)) {
            PathHelper.makeDirIfNotExist(sessionFilePath, true);
        }

        const store = new KnexSessionStore({
            knex: require("knex")(knexSessionConfig),
            tablename: "sessions",
        });

        const sessionConfig = _.extend({}, $.config.session, {
            store,
        });

        $.app.use(session(sessionConfig));
    }

    /**
     * Check for custom session handler
     */
    let useCustomHandler = $.$config.get('session.useCustomHandler', false)
    if (useCustomHandler !== false) {
        if (typeof useCustomHandler !== 'string') {
            $.logErrorAndExit(`Config: {session.useCustomHandler} only accepts false or path to session handler file.`)
        }

        useCustomHandler = PathHelper.resolve(useCustomHandler);
        if (!$.file.exists(useCustomHandler)) {
            $.logErrorAndExit(`useCustomHandler File not found: {${useCustomHandler}}`)
        }

        const handler = require(useCustomHandler);
        if (typeof handler !== "function") {
            $.logErrorAndExit(`useCustomHandler File must return a function: {${useCustomHandler}}`);
        }

        $.app.use(handler(session));
    }

    /**
     * Express Flash
     */
    const useFlash = $.$config.get('server.use.flash', false);
    if (useFlash) {
        const flash = require("express-flash");
        $.app.use(flash());
    }
}

import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import ControllerService = require("./Controllers/ControllerService");
import {getLocalExternalIp} from "./Functions/inbuilt.fn";

/**
 * Maintenance Middleware
 */
if (isUnderMaintenance) {
    $.logError(`App is under Maintenance!`);

    /**
     * Get maintenance middleware
     */
    let maintenanceMiddleware: any = $.$config.get('server.maintenanceMiddleware');
    maintenanceMiddleware = $.path.middlewares(maintenanceMiddleware);

    /**
     * Check if maintenance middleware exists
     * if true require
     */
    const maintenanceMiddlewareExists = $.file.exists(maintenanceMiddleware);
    if (maintenanceMiddlewareExists) maintenanceMiddleware = require(maintenanceMiddleware);

    $.app.use((req: any, res: any, next: any) => {
        // Get RequestEngine instance
        const http = new RequestEngine(req, res, next);

        // Use maintenanceMiddleware if it exists
        if (maintenanceMiddlewareExists) return maintenanceMiddleware(http);

        // Or use default view.
        return http.newError().view({
            error: {
                title: 'Maintenance Mood!',
                // message: `App is under maintenance`,
                log: 'We will be right back shortly!',
            },
        }, 200);
    });
}


// Set local AppData
$.app.locals.appData = {};
$.app.use(async (req: any, res: any, next: () => void) => {

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
 *  AfterExpressInit Function
 *  This function happens immediately after on.expressInit events are completed.
 */
const afterExpressInit = (next: () => void) => {
    // Not Tinker? Require Controllers
    if (!$.options.isTinker) {
        $.controller = require("./Classes/Controller");
        $.handler = (controller: XpresserController.Object) => new ControllerService(controller);
    }

    const $globalMiddlewareWrapper = ($middlewareFn: any) => {
        return async (res: any, req: any, next: any) => {
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

            $middleware = PathHelper.resolve($middleware);
            // console.log($middleware)

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

    // Process routes
    $.routerEngine.processRoutes($.router.routes);

    next();
};

/**
 * StartHttpServer
 * Http server starts here.
 */
const startHttpServer = (onSuccess?: () => any, onError?: () => any) => {
    /**
     * Add 404 error
     */
    $.app.use((req: any, res: any, next: () => void) => {
        res.status(404);

        // respond with json
        if (req.xhr) {
            return res.send({error: "Not found"});
        } else {
            return (new RequestEngine(req, res, next)).newError().pageNotFound();
        }
    });

    $.http = createHttpServer($.app);
    const port = $.$config.get("server.port", 80);

    $.http.on("error", (err: any) => {
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
            const domain = $.config.server.domain;
            const baseUrl = $.helpers.url();
            const lanIp = getLocalExternalIp()

            // $.engineData
            const ServerStarted = new Date();
            const getServerUptime = () => global.moment(ServerStarted).fromNow();
            $.log(`Domain: ${domain} | Port: ${port} | BaseUrl: ${baseUrl}`);

            /**
             * Show Lan Ip in development mood
             */
            if (!isProduction && lanIp)
                $.log(`Network: http://${lanIp}:${port}/`);

            $.log(`Server started - ${ServerStarted.toString()}`);

            // Save values to engineData
            $.engineData.set({
                ServerStarted,
                getServerUptime,
                lanIp
            })

            const hasSslEnabled = $.$config.get("server.ssl.enabled", false);
            if (hasSslEnabled) {
                startHttpsServer();
            } else {
                loadOnEvents('serverBooted')
            }

            if (typeof onSuccess === "function") {
                onSuccess();
            }
        });
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

    if (!$.file.exists(files.key)) {
        $.logErrorAndExit("Key file {" + files.key + "} not found!");
    }

    if (!$.file.exists(files.cert)) {
        $.logErrorAndExit("Cert file {" + files.key + "} not found!");
    }

    files.key = $.file.read(files.key);
    files.cert = $.file.read(files.cert);

    $.https = createHttpsServer(files, $.app);
    $.https.on("error", $.logError);

    /**
     * Load $.on.https Events
     * Listen to port after running events
     */
    loadOnEvents("https", () => {
        $.https.listen(httpsPort, () => {
            $.logSuccess("Ssl Enabled.");
            loadOnEvents('serverBooted')
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
    return loadOnEvents("bootServer", startHttpServer);
}));
