const DefaultTimestamp = "YYYY-MM-DD H:mm:ss";

const ServerConfig = {
    startOnBoot: true,
    port: 2000,
    protocol: "http",
    domain: "localhost",
    root: "/",
    includePortInUrl: true,
    baseUrl: "",
    ssl: {
        enabled: false,
        port: 443,
    },
};

const Config = {
    name: "Xjs",
    env: "development",
    debug: {
        enabled: true,
        controllerAction: true,
        routerLiveView: false,
    },
    project: {
        fileExtension: ".js",
    },
    server: ServerConfig,
    database: {
        startOnBoot: true,
        timestampFormat: DefaultTimestamp,
    },
    date: {
        format: DefaultTimestamp,
    },
    paths: {
        base: __dirname,
        // Should be relative to the base set above.
        // e.g base+'/'+backend should resolve to /full/path/base/backend
        backend: "backend",

        // Must be relative to base
        frontend: "frontend",
        public: "public",
        storage: "storage",
        xjs: "xjs",
        // Npm Dir
        npm: "base://node_modules",

        // Other Paths
        routesFile: "backend://routes.js",
        controllers: "backend://controllers",
        views: "backend://views",
        jsonConfigs: "base://_",
    },
    template: {
        use: false,
        engine: "ejs",
        extension: "ejs",

        locals: {
            all: true,
            __get: false,
            __post: false,
            __session: false,
            __stackedScripts: false,
        },
    },
    auth: {
        userModel: "User",
        afterLoginRoute: "dashboard",
        templateVariable: "user",
        viewsFromEngine: true,
    },
    response: {
        cacheFiles: false,
        cacheFileExtensions: ["js", "css"],
        cacheIfMatch: [],
        cacheMaxAge: 31536000,
        overrideServerName: true,
        serverName: "Xjs",
    },
    backgroundMonitor: {
        start: "forever start {file}",
        stop: "forever stop {file}",
    },
    artisan: {
        singleModelName: true,
        pluralizeModelTable: true,
    },
    session: {
        secret: "!xjsSecretKey!",
        cookie: {
            path: ServerConfig.root,
            domain: ServerConfig.domain,
            maxAge: 5000 * 60 * 24,
        },
        resave: true,
        saveUninitialized: true,
    },

    mail: {
        default: "nodemailer",
        configs: {},
    },
};

const Options = {
    isConsole: false,
    isTinker: false,
};

export = {Config, Options};
