'use strict';
const packageName = "@trapcode/xjs";

/*
 * Xjs MAIN Variable
 */
let $ = {};

/*
 * Import Scripts and make global to be used everywhere.
 */
const _ = require("lodash");
const ObjectCollection = require("./helpers/ObjectCollection");
const FS = require("fs-extra");

// Make Globals
global["$"] = $;
global["_"] = _;


// let
let XjsConfig = global["XjsConfig"];


$.env = (key, $default) => {
    if (typeof process.env[key] === "undefined") {
        return $default;
    }

    return process.env[key];
};


// @ts-ignore
/*
 * If isTinker is set in config then set isTinker.
 */
$.isTinker = XjsConfig["isTinker"] !== "undefined" && XjsConfig['isTinker'] === true;


/*
 * If isConsole is set in config then set isTinker.
 */
$.isConsole = typeof global["__isConsole"] !== "undefined" && global['__isConsole'] === true;
delete global['__isConsole'];


const DefaultConfig = require("./config");
$.config = DefaultConfig;

// @ts-ignore
$.config = _.merge(DefaultConfig, XjsConfig);

// Delete global config;
delete global["XjsConfig"];


// add a shortcut to modify $.config
$.myConfig = new ObjectCollection($.config);

// Require Log Functions
require('./functions/logs.fn');

// Display Start Message!
$.logIfNotConsole("Starting Xjs...");

const paths = $.config.paths;
const baseFiles = paths.base + "/";
const backendFiles = baseFiles + paths.backend + "/";

if (!FS.existsSync(".env")) {
    $.logAndExit(".env file not found!");
}

let EnginePath = baseFiles + "engines/";
if (typeof paths.engine === "string") {
    EnginePath = baseFiles + paths.engine + "/";
} else {
    const nodeModulesEngine = baseFiles + "node_modules/" + packageName + "/engines";
    if (FS.existsSync(nodeModulesEngine)) {
        EnginePath = nodeModulesEngine + "/";
    }
}

if (!FS.existsSync(EnginePath)) {
    $.logAndExit("No Framework Engine Found @ " + EnginePath);
}

/**
 * Get path in base folder
 * @param {string} path
 * @param {boolean} returnRequire
 */
$.path.base = function (path = '', returnRequire = false) {
    if (path[0] === '/') path = path.substr(1);
    const base = baseFiles + path;
    return returnRequire ? require(base) : base;
};

/**
 * Get path in backend folder.
 * @param {string} path
 * @param {boolean} returnRequire
 */
$.path.backend = function (path = '', returnRequire = false) {
    if (path[0] === '/') path = path.substr(1);
    const backend = backendFiles + path;
    return returnRequire ? require(backend) : backend;
};

/**
 * Get path in storage folder.
 * @param {string} path
 */
$.path.storage = function (path = '') {
    if (path[0] === '/') path = path.substr(1);
    return $.path.base($.config.paths.storage + '/' + path);
};

/**
 * @param {string} path
 * @param {boolean} returnRequire
 */
$.path.engine = function (path = '', returnRequire = false) {
    if (path[0] === '/') path = path.substr(1);
    const engine = EnginePath + path;
    return returnRequire ? require(engine) : engine;
};

$.engineData = new ObjectCollection();

// Require global variables
require("./global.js");

// Require Plugin Engine and load plugins
const PluginEngine = require("./PluginEngine");
PluginEngine.loadPlugins();

// Require exportXpresser Router
const XpresserRouter = require("@xpresser/router");
$.router = new XpresserRouter;

if ($.isConsole) {

    $.model = require("./ModelEngine.js");

    $.routerEngine = require("./RouterEngine.js");

    $.path.backend("routers/router", true);
    $.routerEngine.processRoutes();

} else {

    // Run Server if app is not running in console.
    const {dirname, resolve} = require("path");
    const express = require("express");
    const app = express();

    app.use(function (req, res, next) {
        res.set("X-Powered-By", "Xjs");
        if ($.config.response.overrideServerName) res.set("Server", "Xjs");
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
                            responseConfig.cacheIfMatch
                        );
                        if (match !== null && match.length) {
                            res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                        }
                    } else if (responseConfig.cacheFileExtensions.length) {
                        let files = $.fn.extArrayRegex(responseConfig.cacheFileExtensions);
                        files = path.match(files);

                        if (files !== null && files.length) {
                            res.set("Cache-Control", "max-age=" + responseConfig.cacheMaxAge);
                        }
                    }
                }
            }
        })
    );

    const flash = require("express-flash");
    const bodyParser = require("body-parser");
    const cors = require("cors");
    const session = require("express-session");
    const KnexSessionStore = require("connect-session-knex")(session);
    const knexSessionConfig = {
        client: "sqlite3",
        connection: {
            filename: $.path.base($.config.paths.storage + "/app/db/sessions.sqlite")
        },
        useNullAsDefault: true
    };

    const sessionFilePath = knexSessionConfig.connection.filename;
    if (!FS.existsSync(sessionFilePath)) {
        FS.mkdirpSync(dirname(sessionFilePath));
    }

    const store = new KnexSessionStore({
        knex: require("knex")(knexSessionConfig),
        tablename: "sessions"
    });

    app.use(cors());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(
        session(
            _.extend({}, $.config.session, {
                store: store
            })
        )
    );

    app.use(flash());

    app.locals["appData"] = {};

    $.app = app;

    // Require Request Engine
    const RequestEngine = require("./RequestEngine");

    app.use(async function (req, res, next) {

        // Convert Empty Strings to Null
        if (req.body && Object.keys(req.body).length) {
            req.body = Object.assign(
                ...Object.keys(req.body).map(key => ({
                    [key]: typeof req.body[key] === 'string' && req.body[key].trim() === '' ? null : req.body[key]
                }))
            );
        }

        const x = new RequestEngine(req, res);

        if (x.isLogged()) {
            const user = await x.auth();
            res.locals[$.config.auth.templateVariable] = user;
        } else {
            res.locals[$.config.auth.templateVariable] = undefined;
        }

        next()
    });

    /**
     * Set Express View Engine from config
     */
    const template = $.config.template;

    if (typeof template.engine === 'function') {

        app.engine(template.extension, template.engine);
        app.set('view engine', template.extension)

    } else {
        if (typeof template.use === 'string') {

            app.use($.use.package(template.use));

        } else if (typeof template.use === 'function') {

            app.use(template.use);

        } else {

            app.set("view engine", template.engine);

        }
    }

    app.set("views", $.path.backend(template.viewsFolder));


    // Not Tinker? Require Controllers
    if (!$.isTinker) {
        $.controller = require("./classes/Controller.js");
    }

    // Require Model Engine
    $.model = require("./ModelEngine.js");

    /**
     * Include xjs/cycles/beforeRoutes.js if exists
     * */
    const beforeRoutesPath = $.path.base($.config.paths.xjs + '/cycles/beforeRoutes.js');

    if (FS.existsSync(beforeRoutesPath)) {
        require(beforeRoutesPath);
    }

    $.routerEngine = require("./RouterEngine.js");


    // Require Routes
    $.path.backend("routers/router", true);
    // Process Routes
    $.routerEngine.processRoutes($.router.routes);


    app.use(function (req, res, next) {
        const x = new RequestEngine(req, res, next);
        const error = new (require('./ErrorEngine'))(x);
        res.status(404);

        // respond with json
        if (req.xhr) {
            return res.send({error: 'Not found'});
        } else {
            return error.pageNotFound(req);
        }
    });


    /**
     * Include xjs/cycles/afterRoutes.js if exists
     * */
    const afterRoutesPath = $.path.base($.config.paths.xjs + '/cycles/afterRoutes.js');

    if (FS.existsSync(afterRoutesPath)) {
        require(afterRoutesPath);
    }

    // Start server if not tinker
    if (!$.isTinker && $.config.server.startOnBoot) {
        // @ts-ignore
        const http = require("http").createServer(app);
        const port = $.myConfig.get('server.port', 80);

        http.on('error', $.logError);

        http.listen(port, function () {
            $.log("Server started and available on " + $.helpers.url());
            $.log("PORT:" + port);
            $.log();
        });

        // Start ssl server if server.ssl is available
        if ($.myConfig.has('server.ssl.enabled') && $.config.server.ssl.enabled === true) {
            const https = require("https");
            const httpsPort = $.myConfig.get('server.ssl.port', 443);

            if (!$.myConfig.has('server.ssl.files')) {
                $.logErrorAndExit('Ssl enabled but has no {server.ssl.files} config found.')
            }

            let files = $.myConfig.get('server.ssl.files');

            if (typeof files.key !== "string" || typeof files.cert !== "string") {
                $.logErrorAndExit('Config {server.ssl.files} not configured properly!')
            }

            if (!files.key.length || !files.cert.length) {
                $.logErrorAndExit('Config {server.ssl.files} not configured properly!')
            }


            files.key = resolve(files.key);
            files.cert = resolve(files.cert);

            if (!FS.existsSync(files.key)) {
                $.logErrorAndExit('Key file {' + files.key + '} not found!')
            }

            if (!FS.existsSync(files.cert)) {
                $.logErrorAndExit('Cert file {' + files.key + '} not found!')
            }

            files.key = FS.readFileSync(files.key);
            files.cert = FS.readFileSync(files.cert);

            https.createServer(files, app).listen(httpsPort, function () {
                $.log("Server started and available on " + $.helpers.url());
                $.log("PORT:" + httpsPort);
                $.log();
            });
        }
    }
}
