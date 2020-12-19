import {resolve} from "path";
import PathHelper = require("./Helpers/Path");
import OnEventsLoader = require("./Events/OnEventsLoader");

const {runBootEvent} = OnEventsLoader;
import express = require("express");
import {createServer as createHttpServer} from "http";
import {createServer as createHttpsServer} from "https";

// Types
import {Controller as XpresserController} from "../types/http";
import {getInstance} from "../index";

const $ = getInstance();

const isProduction = $.config.get("env") === "production";
const paths = $.config.get("paths");


/////////////
// Load Use.json Data
const useDotJson = $.engineData.get("UseDotJson");
// Check if under maintenance
const isUnderMaintenance = $.file.exists($.path.base('.maintenance'))


$.app = express();

/**
 * HttpToHttps Enforcer.
 * This has to be the first middleware because we need the redirect to run before every other request does.
 */
const forceHttpToHttps = $.config.get("server.ssl.forceHttpToHttps", false);
if (forceHttpToHttps) {
    $.app.use((req, res, next) => {
        const isSecure =
            req.headers["x-forwarded-proto"] === "https" || req.secure;

        if (isSecure) next();

        let newUrl = `${req.protocol}://${req.hostname}${req.url}`;
        newUrl = newUrl.replace("http://", "https://");
        return res.redirect(newUrl);
    });
}

/**
 * If {server.poweredBy=true}
 * Set X-Powered-By to Xpresser.
 * Else
 * Disable poweredBy header.
 */
if ($.config.get('server.poweredBy')) {
    $.app.use((_req, res, next) => {
        res.set("X-Powered-By", "Xpresser");
        if ($.config.get('response.overrideServerName')) {
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
const servePublicFolder = $.config.get("server.servePublicFolder", false);
if (!isUnderMaintenance && servePublicFolder) {
    const responseConfig = $.config.get('response');
    $.app.use(
        express.static(paths.public, {
            setHeaders(res, path) {
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
const useHelmet = $.config.get("server.use.helmet", isProduction);
if (useHelmet) {
    const helmet = require("helmet");
    const helmetConfig = $.config.get("packages.helmet.config", undefined);
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
const useCors = $.config.get("server.use.cors", false);
if (useCors) {
    const cors = require("cors");
    const corsConfig = $.config.get("packages.cors.config", undefined);
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
const useBodyParser = $.config.get("server.use.bodyParser", true);
if (useBodyParser) {
    const bodyParser = require("body-parser");
    const bodyParserJsonConfig = $.config.get("packages.body-parser.json");
    const bodyParserUrlEncodedConfig = $.config.get("packages.body-parser.urlencoded", {extended: true});

    $.app.use(bodyParser.json(bodyParserJsonConfig));
    $.app.use(bodyParser.urlencoded(bodyParserUrlEncodedConfig));
}

const useSession = $.config.get("server.use.session", false);
if (useSession) {

    /**
     * Log End of sessions deprecation message.
     */
    $.logDeprecated(
        '0.3.37',
        '0.6.0',
        [
            'At version 0.6.0, xpresser {{STOPPED}} shipping with {{SESSION}} support out of the box', null,
            'Install the new {{@xpresser/session}} plugin instead!', null,
            'This plugin re-enables the old session system and is simply Plug & Play.',
            null, null,
            'See: https://xpresserjs.com/http/sessions.html'
        ],
        false
    );
    $.logErrorAndExit("Use new session plugin and set config {server.use.session} to {false} to hide this error message.");
}

/**
 * Express Flash
 */
const useFlash = $.config.get('server.use.flash', false);
if (useFlash) {
    const flash = require("express-flash");
    $.app.use(flash());
}

/**
 * Set Express View Engine from config
 */
const template = $.config.get('template');
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
 * Import Files needed after above middlewares
 */
import RequestEngine = require("./Plugins/ExtendedRequestEngine");
import ControllerService = require("./Controllers/ControllerService");

/**
 * Maintenance Middleware
 */
if (isUnderMaintenance) {
    $.logError(`${$.config.get("name")}, is under Maintenance!`);

    /**
     * Get maintenance middleware
     */
    let maintenanceMiddleware: any = $.config.get('server.maintenanceMiddleware');
    maintenanceMiddleware = $.path.middlewares(maintenanceMiddleware);

    /**
     * Check if maintenance middleware exists
     * if true require
     */
    const maintenanceMiddlewareExists = $.file.exists(maintenanceMiddleware);
    if (maintenanceMiddlewareExists) maintenanceMiddleware = require(maintenanceMiddleware);

    /**
     * Register Maintenance Middleware
     */
    $.app.use(RequestEngine.expressify(http => {

        // Use maintenanceMiddleware if it exists
        if (maintenanceMiddlewareExists) return maintenanceMiddleware(http);

        // Or use default view.
        return http.newError().view({
            error: {
                title: 'Maintenance Mood!',
                log: 'We will be right back shortly!',
            },
        }, 200);
    }));
}


$.app.use(async (req: any, _res: any, next: () => void) => {

    // Convert Empty Strings to Null
    if (req.body && Object.keys(req.body).length) {
        req.body = Object.assign(
            // @ts-ignore
            ...Object.keys(req.body).map((key) => ({
                [key]: typeof req.body[key] === "string" && req.body[key].trim() === "" ? null : req.body[key],
            })),
        );
    }

    return next();
});

/**
 *  AfterExpressInit Function
 *  This function happens immediately after on.expressInit events are completed.
 */
const afterExpressInit = (next: () => void) => {
    // Not Tinker? Require Controllers
    if (!$.options.isTinker) {
        $.controller = require("./Classes/ControllerClass");
        $.handler = (controller: XpresserController.Object) => new ControllerService(controller);
    }

    // Replaced with RequestEngine.expressify()
    // const $globalMiddlewareWrapper = ($middlewareFn: any) => {
    //     return (res: any, req: any, next: any) => {
    //         return $middlewareFn(new RequestEngine(res, req, next));
    //     };
    // };

    if (useDotJson.has("globalMiddlewares")) {
        const projectFileExtension = $.config.get('project.fileExtension');
        const $middlewares = useDotJson.get("globalMiddlewares");

        for (let i = 0; i < $middlewares.length; i++) {
            let $middleware = $middlewares[i];

            if ($middleware.substr(-3) !== projectFileExtension) {
                $middleware += projectFileExtension;
            }

            $middleware = PathHelper.resolve($middleware);

            try {
                $.app.use(
                    RequestEngine.expressify(require($middleware))
                );
            } catch (e) {
                $.logPerLine([
                    {error: "Error in use.json"},
                    {error: e},
                    {errorAndExit: ""},
                ]);

            }
        }

    }

    require("./Routes/Loader");

    // Process routes
    $.routerEngine.processRoutes($.router.routes);

    return next();
};

/**
 * StartHttpServer
 * Http server starts here.
 */
const startHttpServer = (onSuccess?: () => any, onError?: () => any) => {
    /**
     * Add 404 error
     */
    $.app.use(RequestEngine.expressify(http => {
        http.res.status(404);

        // respond with json
        if (http.req.xhr) {
            return http.send({error: "Not found"});
        } else {
            return http.newError().pageNotFound();
        }
    }))

    $.http = createHttpServer($.app);
    const port = $.config.get("server.port", 80);

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
    runBootEvent("http", () => {
        $.http.listen(port, () => {
            const serverDomainAndPort = $.config.get("log.serverDomainAndPort");
            const domain = $.config.get('server.domain');
            const baseUrl = $.helpers.url().trim();
            const lanIp = $.engineData.get("lanIp");

            // $.engineData
            const ServerStarted = new Date();
            const getServerUptime = () => global.moment(ServerStarted).fromNow();

            if (serverDomainAndPort || (baseUrl === '' || baseUrl === '/')) {
                $.log(`Domain: ${domain} | Port: ${port} | BaseUrl: ${baseUrl}`);
            } else {
                $.log(`Url: ${baseUrl}`);
            }


            /**
             * Show Lan Ip in development mood
             */
            if (!isProduction && lanIp)
                $.log(`Network: http://${lanIp}:${port}/`);

            /**
             * Show Server Started Time only on production
             */
            if (isProduction)
                $.log(`Server started - ${ServerStarted.toString()}`);

            // Save values to engineData
            $.engineData.set({
                ServerStarted,
                getServerUptime,
                lanIp
            })

            const hasSslEnabled = $.config.get("server.ssl.enabled", false);
            if (hasSslEnabled) {
                startHttpsServer();
            } else {
                runBootEvent('serverBooted')
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
    const httpsPort = $.config.get("server.ssl.port", 443);

    if (!$.config.has("server.ssl.files")) {
        $.logErrorAndExit("Ssl enabled but has no {server.ssl.files} config found.");
    }

    const files = $.config.get("server.ssl.files");

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
    runBootEvent("https", () => {
        $.https.listen(httpsPort, () => {
            $.logSuccess("Ssl Enabled.");
            runBootEvent('serverBooted');
        });
    });
};

/**
 * RunBootEvent on.expressInit Events.
 * then
 * RunBootEvent on.bootServer Events.
 */
runBootEvent(
    "expressInit",
    // Run AfterExpressInit
    () => afterExpressInit(() => runBootEvent("bootServer", startHttpServer))
);
